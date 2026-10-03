import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { parseBlueprintFile, assertBlueprintShape } from "../parse-blueprint.mjs";
import { parseCatalogFile, flattenLabs } from "../parse-catalog.mjs";
import { paths } from "../paths.mjs";

/** @typedef {{ pass: (name: string) => void; fail: (name: string, detail?: string) => void; mockBase: string; root: string }} LightContext */

/** @type {Record<string, (ctx: LightContext) => void | Promise<void>>} */
export const lightTestHandlers = {
  async blueprint_schema(ctx) {
    const files = readdirSync(paths.templates).filter((f) => f.endsWith(".lab.yaml"));
    if (files.length < 6) {
      ctx.fail("blueprint_count", `expected >=6, got ${files.length}`);
      return;
    }
    for (const file of files) {
      const parsed = parseBlueprintFile(join(paths.templates, file));
      const errors = assertBlueprintShape(parsed, file);
      if (errors.length) {
        ctx.fail(`blueprint ${parsed.scalars.id ?? file}`, errors.join("; "));
      } else {
        ctx.pass(`blueprint ${parsed.scalars.id}`);
      }
    }
  },

  catalog_lab_minimum(ctx) {
    const catalog = parseCatalogFile(paths.catalog);
    const labs = flattenLabs(catalog);
    const minPerModule = 4;
    for (const mod of catalog.modules) {
      if (mod.labs.length < minPerModule) {
        ctx.fail(`catalog_module_${mod.module}`, `need >=${minPerModule} labs, got ${mod.labs.length}`);
      }
    }
    for (const lab of labs) {
      if (!lab.id || !lab.title || !lab.tier) {
        ctx.fail("catalog_lab_shape", lab.id ?? "unknown");
      }
    }
    ctx.pass("catalog_lab_minimum");
  },

  prior_auth_incomplete_fixture(ctx) {
    const incomplete = JSON.parse(
      readFileSync(join(paths.fixtures, "prior-auth-incomplete.json"), "utf8"),
    );
    if (incomplete.member_id && !incomplete.procedure_code) {
      ctx.pass("prior_auth_incomplete_fixture");
    } else {
      ctx.fail("prior_auth_incomplete_fixture");
    }
  },

  denial_appeal_fixture(ctx) {
    JSON.parse(readFileSync(join(paths.fixtures, "denial-appeal-case.json"), "utf8"));
    ctx.pass("denial_appeal_fixture");
  },

  audit_rubric_fixture(ctx) {
    JSON.parse(readFileSync(join(paths.fixtures, "audit-rubric.json"), "utf8"));
    ctx.pass("audit_rubric_fixture");
  },

  walkthrough_faq_prompt(ctx) {
    const text = readFileSync(paths.webOpenRouterLib, "utf8");
    if (text.includes("MEMBER_BENEFITS_SYSTEM")) {
      ctx.pass("walkthrough_faq_prompt");
    } else {
      ctx.fail("walkthrough_faq_prompt");
    }
  },

  walkthrough_memory_turns(ctx) {
    const text = readFileSync(paths.webOpenRouterLib, "utf8");
    if (text.includes("MEMORY_FIRST_TURN") && text.includes("MEMORY_SECOND_TURN")) {
      ctx.pass("walkthrough_memory_turns");
    } else {
      ctx.fail("walkthrough_memory_turns");
    }
  },

  async mock_claims_health(ctx) {
    await pingHealth(ctx);
  },

  async mock_claims_member_m1001(ctx) {
    await pingHealth(ctx);
    const { res, json } = await fetchJson(`${ctx.mockBase}/v1/claims/M1001`);
    if (res.ok && json.member_id === "M1001") {
      ctx.pass("mock_claims_member_m1001");
    } else {
      ctx.fail("mock_claims_member_m1001");
    }
  },

  async mock_prior_auth_pa9001(ctx) {
    await pingHealth(ctx);
    const { res, json } = await fetchJson(`${ctx.mockBase}/v1/prior-auth/PA-9001`);
    if (res.ok && json.status === "approved") {
      ctx.pass("mock_prior_auth_pa9001");
    } else {
      ctx.fail("mock_prior_auth_pa9001");
    }
  },

  async mock_claims_not_found(ctx) {
    await pingHealth(ctx);
    const { res, json } = await fetchJson(`${ctx.mockBase}/v1/claims/UNKNOWN`);
    if (res.status === 404 && json.error === "member_not_found") {
      ctx.pass("mock_claims_not_found");
    } else {
      ctx.fail("mock_claims_not_found", `status ${res.status}`);
    }
  },

  async openrouter_live_single_ping(ctx) {
    if (process.env.OPENROUTER_LIVE !== "1") {
      console.log("  skip openrouter_live (set OPENROUTER_LIVE=1 to run single ping)");
      return;
    }
    const key = process.env.OPENROUTER_API_KEY?.trim();
    if (!key?.startsWith("sk-or-")) {
      ctx.fail("openrouter_live", "OPENROUTER_API_KEY missing or invalid");
      return;
    }
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        max_tokens: 8,
        messages: [{ role: "user", content: "Reply: ok" }],
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      ctx.fail("openrouter_live_single_ping", `HTTP ${res.status}`);
      return;
    }
    ctx.pass("openrouter_live_single_ping");
  },
};

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const json = await res.json();
  return { res, json };
}

async function pingHealth(ctx) {
  try {
    const { res, json } = await fetchJson(`${ctx.mockBase}/health`);
    if (!res.ok || json.ok !== true) {
      ctx.fail("mock_claims_health", `status ${res.status}`);
      return false;
    }
    ctx.pass("mock_claims_health");
    return true;
  } catch (e) {
    ctx.fail("mock_claims_health", String(e.message ?? e));
    console.error(
      "    hint: docker compose -f docker-compose.mock-claims.yml up -d",
    );
    return false;
  }
}

/** De-dupe test ids from catalog + blueprints + always-run set. */
export function collectLightTestIds(catalog) {
  const ids = new Set([
    "blueprint_schema",
    "catalog_lab_minimum",
    "openrouter_live_single_ping",
  ]);
  for (const lab of flattenLabs(catalog)) {
    for (const id of lab.light_tests ?? []) {
      ids.add(id);
    }
  }
  return [...ids];
}

export async function runLightTests(ids, ctx) {
  const ran = new Set();
  for (const id of ids) {
    if (ran.has(id)) continue;
    ran.add(id);
    const handler = lightTestHandlers[id];
    if (!handler) {
      ctx.fail(`unknown_light_test_${id}`);
      continue;
    }
    await handler(ctx);
  }
}
