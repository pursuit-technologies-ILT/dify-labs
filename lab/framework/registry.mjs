import { readdirSync } from "node:fs";
import { join } from "node:path";

import { parseBlueprintFile } from "./parse-blueprint.mjs";
import { parseCatalogFile, flattenLabs, labsByModule } from "./parse-catalog.mjs";

export { flattenLabs, labsByModule };
import { paths } from "./paths.mjs";

export function loadCatalog() {
  return parseCatalogFile(paths.catalog);
}

export function loadBlueprints() {
  const files = readdirSync(paths.templates).filter((f) => f.endsWith(".lab.yaml"));
  return files.map((file) => {
    const full = join(paths.templates, file);
    const parsed = parseBlueprintFile(full);
    return {
      file,
      path: full,
      ...parsed.scalars,
      lightTestIds: parsed.lightTestIds,
      fixtureRefs: parsed.fixtureRefs,
    };
  });
}

export function resolveLab(catalog, labId) {
  return flattenLabs(catalog).find((l) => l.id === labId) ?? null;
}

export function blueprintForLab(catalog, lab) {
  if (!lab?.blueprint_id) return null;
  return loadBlueprints().find((b) => b.id === lab.blueprint_id) ?? null;
}

export function moduleSummary(catalog, moduleNum) {
  const labs = labsByModule(catalog, moduleNum);
  return {
    module: moduleNum,
    lab_count: labs.length,
    tiers: [...new Set(labs.map((l) => l.tier))],
    labs: labs.map((l) => ({
      id: l.id,
      title: l.title,
      tier: l.tier,
      blueprint_id: l.blueprint_id ?? null,
      portal_slug: l.portal_slug ?? null,
    })),
  };
}
