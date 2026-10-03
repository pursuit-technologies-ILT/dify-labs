import { agentNextStepsView } from "./view.mjs";
import { collectLightTestIds, runLightTests } from "./light-tests/index.mjs";
import { loadCatalog } from "./registry.mjs";
import { paths, repoRoot } from "./paths.mjs";

/**
 * Automatic flow for an instance: ordered build steps + validation commands.
 */
export function buildAutoFlow(instanceId, format = "steps") {
  const next = agentNextStepsView(instanceId);
  const catalog = loadCatalog();
  const testIds = collectLightTestIds(catalog);

  const flow = {
    instance_id: instanceId,
    validate_command: "./scripts/lab-light-test.sh",
    integrator_live_command:
      "OPENROUTER_LIVE=1 OPENROUTER_API_KEY=sk-or-… ./scripts/lab-light-test.sh",
    light_test_ids: testIds,
    steps: next.steps.map((s) => ({
      ...s,
      done_when: [
        `./scripts/lab-view.sh --extract ${s.lab_id}`,
        "light tests for this lab ids pass in lab-light-test.sh",
        s.blueprint_id ? `DSL export templates/exports/${s.blueprint_id}.yml` : "worksheet in docs/runbooks/",
      ],
    })),
  };

  if (format === "json") return flow;
  const lines = [
    `# Auto flow — ${instanceId}`,
    "",
    "## Validate (all agents)",
    "```bash",
    flow.validate_command,
    "```",
    "",
    "## Integrator only (one OpenRouter ping)",
    "```bash",
    flow.integrator_live_command,
    "```",
    "",
    "## Build steps",
  ];
  for (const step of flow.steps) {
    lines.push(`### ${step.order}. ${step.lab_id}`);
    lines.push(`- Action: **${step.action}**`);
    if (step.blueprint_id) lines.push(`- Blueprint: \`${step.blueprint_id}\``);
    lines.push(`- Light tests: ${(step.light_tests ?? []).join(", ") || "catalog minimum"}`);
    lines.push("");
  }
  return lines.join("\n");
}

// CLI
if (process.argv[1]?.endsWith("auto-flow.mjs")) {
  const instanceIdx = process.argv.indexOf("--instance");
  const instanceId =
    instanceIdx >= 0 ? process.argv[instanceIdx + 1] : "cohort-default";
  const format = process.argv.includes("--format")
    ? process.argv[process.argv.indexOf("--format") + 1]
    : process.argv.includes("--json")
      ? "json"
      : "steps";
  console.log(buildAutoFlow(instanceId, format === "json" ? "json" : "steps"));
}

export async function runAutoFlowValidation(instanceId) {
  const catalog = loadCatalog();
  const ids = collectLightTestIds(catalog);
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
  console.log(`==> auto-flow validation (${instanceId})`);
  await runLightTests(ids, ctx);
  return failed;
}
