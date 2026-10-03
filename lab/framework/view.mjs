import { flattenLabs } from "./parse-catalog.mjs";
import { loadCatalog, loadBlueprints, moduleSummary } from "./registry.mjs";
import { buildWireManifest } from "./wire.mjs";

export function catalogMarkdownView() {
  const catalog = loadCatalog();
  const lines = ["# Lab catalog view", "", `Version: ${catalog.text.match(/catalog_version:\s*(\d+)/)?.[1] ?? "?"}`, ""];
  for (const mod of catalog.modules) {
    lines.push(`## Module ${mod.module} — ${mod.title ?? ""}`);
    lines.push("");
    lines.push("| ID | Title | Tier | Blueprint | Portal slug |");
    lines.push("|----|-------|------|-----------|-------------|");
    for (const lab of mod.labs) {
      lines.push(
        `| ${lab.id} | ${lab.title} | ${lab.tier} | ${lab.blueprint_id ?? "—"} | ${lab.portal_slug ?? "—"} |`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function extractJsonView() {
  const catalog = loadCatalog();
  const blueprints = loadBlueprints();
  return {
    catalog_version: Number(catalog.text.match(/catalog_version:\s*(\d+)/)?.[1] ?? 0),
    module_count: catalog.modules.length,
    lab_count: flattenLabs(catalog).length,
    blueprint_count: blueprints.length,
    modules: catalog.modules.map((m) => moduleSummary(catalog, m.module)),
  };
}

export function agentNextStepsView(instanceId = "cohort-default") {
  const wire = buildWireManifest(instanceId);
  const catalog = loadCatalog();
  const steps = [];
  for (const lab of wire.labs) {
    const full = flattenLabs(catalog).find((l) => l.id === lab.catalog_id);
    steps.push({
      order: steps.length + 1,
      lab_id: lab.catalog_id,
      action: full?.blueprint_id
        ? "build_from_blueprint"
        : full?.dify_mode === "worksheet"
          ? "author_worksheet"
          : "clone_capstone_variant",
      blueprint_id: full?.blueprint_id ?? null,
      light_tests: full?.light_tests ?? [],
      portal_slug: lab.portal_slug,
      endpoints: wire.endpoints,
    });
  }
  return { instance_id: instanceId, steps };
}

// CLI
if (process.argv[1]?.endsWith("view.mjs")) {
  const format = process.argv.includes("--json") ? "json" : "md";
  const instanceIdx = process.argv.indexOf("--instance");
  const instanceId =
    instanceIdx >= 0 ? process.argv[instanceIdx + 1] : "cohort-default";
  if (process.argv.includes("--next")) {
    console.log(JSON.stringify(agentNextStepsView(instanceId), null, 2));
  } else if (format === "json") {
    console.log(JSON.stringify(extractJsonView(), null, 2));
  } else {
    console.log(catalogMarkdownView());
  }
}
