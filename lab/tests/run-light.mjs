#!/usr/bin/env node
/**
 * Light lab tests — delegates to lab/framework (DRY entrypoint).
 */
import { collectLightTestIds, runLightTests } from "../framework/light-tests/index.mjs";
import { loadCatalog } from "../framework/registry.mjs";
import { repoRoot } from "../framework/paths.mjs";

let failed = 0;
const ctx = {
  root: repoRoot,
  mockBase:
    process.env.MOCK_CLAIMS_URL?.replace(/\/$/, "") ??
    `http://127.0.0.1:${process.env.MOCK_CLAIMS_HOST_PORT ?? 3860}`,
  pass: (name) => console.log(`  ok  ${name}`),
  fail: (name, detail) => {
    failed += 1;
    console.error(`  FAIL  ${name}${detail ? `: ${detail}` : ""}`);
  },
};

console.log("==> lab light tests");
const catalog = loadCatalog();
const ids = collectLightTestIds(catalog);
await runLightTests(ids, ctx);

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll light checks passed.");
