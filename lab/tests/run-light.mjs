#!/usr/bin/env node
/**
 * Light lab tests — no OpenRouter unless OPENROUTER_LIVE=1 (single ping).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const templatesDir = join(root, "templates");
const mockBase =
  process.env.MOCK_CLAIMS_URL?.replace(/\/$/, "") ??
  `http://127.0.0.1:${process.env.MOCK_CLAIMS_HOST_PORT ?? 3860}`;

let failed = 0;

function pass(name) {
  console.log(`  ok  ${name}`);
}

function fail(name, detail) {
  failed += 1;
  console.error(`  FAIL  ${name}${detail ? `: ${detail}` : ""}`);
}

function loadYaml(path) {
  const text = readFileSync(path, "utf8");
  const doc = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/);
    if (m) {
      doc[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return { text, doc };
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const json = await res.json();
  return { res, json };
}

async function testBlueprints() {
  const files = readdirSync(templatesDir).filter((f) => f.endsWith(".lab.yaml"));
  if (files.length < 6) {
    fail("blueprint_count", `expected >=6, got ${files.length}`);
    return;
  }
  for (const file of files) {
    const { text, doc } = loadYaml(join(templatesDir, file));
    if (!doc.id || !doc.module || !doc.title) {
      fail(file, "missing id/module/title");
      continue;
    }
    if (!text.includes("acceptance:") || !text.includes("light_tests:")) {
      fail(file, "missing acceptance.light_tests");
      continue;
    }
    pass(`blueprint ${doc.id}`);
  }
}

async function testFixtures() {
  const paths = [
    "fixtures/prior-auth-incomplete.json",
    "fixtures/denial-appeal-case.json",
    "fixtures/audit-rubric.json",
  ];
  for (const rel of paths) {
    const full = join(templatesDir, rel);
    JSON.parse(readFileSync(full, "utf8"));
    pass(`fixture ${rel}`);
  }
  const incomplete = JSON.parse(
    readFileSync(join(templatesDir, "fixtures/prior-auth-incomplete.json"), "utf8"),
  );
  if (incomplete.member_id && !incomplete.procedure_code) {
    pass("prior_auth_incomplete_fixture");
  } else {
    fail("prior_auth_incomplete_fixture");
  }
}

async function testMockClaims() {
  try {
    const { res, json } = await fetchJson(`${mockBase}/health`);
    if (!res.ok || json.ok !== true) {
      fail("mock_claims_health", `status ${res.status}`);
      return;
    }
    pass("mock_claims_health");
  } catch (e) {
    fail("mock_claims_health", String(e.message ?? e));
    console.error(
      "    hint: start mock API with docker compose -f docker-compose.mock-claims.yml up -d",
    );
    return;
  }

  const member = await fetchJson(`${mockBase}/v1/claims/M1001`);
  if (member.res.ok && member.json.member_id === "M1001") {
    pass("mock_claims_member_m1001");
  } else {
    fail("mock_claims_member_m1001");
  }

  const pa = await fetchJson(`${mockBase}/v1/prior-auth/PA-9001`);
  if (pa.res.ok && pa.json.status === "approved") {
    pass("mock_prior_auth_pa9001");
  } else {
    fail("mock_prior_auth_pa9001");
  }
}

function testWalkthroughPrompts() {
  const openrouterPath = join(root, "web/src/lib/openrouter.ts");
  const text = readFileSync(openrouterPath, "utf8");
  if (text.includes("MEMBER_BENEFITS_SYSTEM") && text.includes("MEMORY_FIRST_TURN")) {
    pass("walkthrough_faq_prompt");
    pass("walkthrough_memory_turns");
  } else {
    fail("walkthrough_prompts");
  }
}

async function testOpenRouterOnce() {
  if (process.env.OPENROUTER_LIVE !== "1") {
    console.log("  skip openrouter_live (set OPENROUTER_LIVE=1 to run single ping)");
    return;
  }
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key?.startsWith("sk-or-")) {
    fail("openrouter_live", "OPENROUTER_API_KEY missing or invalid");
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
    fail("openrouter_live", `HTTP ${res.status}`);
    return;
  }
  pass("openrouter_live_single_ping");
}

console.log("==> lab light tests");
await testBlueprints();
await testFixtures();
testWalkthroughPrompts();
await testMockClaims();
await testOpenRouterOnce();

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll light checks passed.");
