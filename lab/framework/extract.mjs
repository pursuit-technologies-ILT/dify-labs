import { readFileSync } from "node:fs";
import { join } from "node:path";

import { blueprintForLab, loadCatalog, resolveLab } from "./registry.mjs";
import { paths } from "./paths.mjs";

/**
 * Extract build artifacts for one catalog lab (fixtures, tests, blueprint path).
 */
export function extractLab(labId) {
  const catalog = loadCatalog();
  const lab = resolveLab(catalog, labId);
  if (!lab) {
    throw new Error(`Unknown lab id: ${labId}`);
  }
  const blueprint = blueprintForLab(catalog, lab);
  const fixtures = [];
  if (blueprint?.fixtureRefs?.length) {
    fixtures.push(...blueprint.fixtureRefs);
  }
  return {
    lab,
    blueprint: blueprint
      ? { id: blueprint.id, file: blueprint.file, path: blueprint.path }
      : null,
    light_tests: lab.light_tests ?? [],
    fixtures: [...new Set(fixtures)],
    portal_slug: lab.portal_slug ?? null,
    dify_mode: lab.dify_mode ?? null,
  };
}

/**
 * Parse instance file (minimal).
 */
export function loadInstance(instanceId) {
  const file = join(paths.instances, `${instanceId}.instance.yaml`);
  const text = readFileSync(file, "utf8");
  const env = {};
  const enabledLabs = [];
  let id = instanceId;
  let inEnv = false;
  for (const line of text.split("\n")) {
    if (line.match(/^instance_id:/)) {
      id = line.split(":")[1].trim();
    }
    if (line.match(/^environment:\s*$/)) {
      inEnv = true;
      continue;
    }
    if (inEnv) {
      if (line.match(/^[a-z_]+:/)) {
        inEnv = false;
      } else {
        const kv = line.match(/^\s{2}([a-z_]+):\s*(.+)$/);
        if (kv) {
          env[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
          continue;
        }
      }
    }
    const lab = line.match(/^\s+- catalog_id:\s*(\S+)/);
    if (lab) enabledLabs.push({ catalog_id: lab[1], enabled: true });
  }
  return { instance_id: id, environment: env, enabled_labs: enabledLabs, path: file };
}
