import { readFileSync } from "node:fs";

/**
 * Parse templates/lab-catalog.yaml (structured subset).
 */
export function parseCatalogFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  const modules = [];
  let currentModule = null;
  let currentLab = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    const mod = line.match(/^\s*- module:\s*(\d+)/);
    if (mod) {
      currentModule = { module: Number(mod[1]), labs: [] };
      modules.push(currentModule);
      currentLab = null;
      continue;
    }
    const modTitle = line.match(/^\s+title:\s*(.+)$/);
    if (modTitle && currentModule && !currentLab) {
      currentModule.title = modTitle[1].replace(/^["']|["']$/g, "");
      continue;
    }
    const labStart = line.match(/^\s+- id:\s*(\S+)/);
    if (labStart && currentModule) {
      currentLab = { id: labStart[1], module: currentModule.module };
      currentModule.labs.push(currentLab);
      continue;
    }
    if (!currentLab) continue;
    const kv = line.match(/^\s+([a-z_]+):\s*(.+)$/);
    if (kv) {
      let value = kv[2].replace(/^["']|["']$/g, "");
      if (value === "true") value = true;
      if (value === "false") value = false;
      if (/^\d+$/.test(value)) value = Number(value);
      currentLab[kv[1]] = value;
    }
    if (line.match(/^\s+light_tests:\s*$/)) {
      currentLab._inLightTests = true;
      if (!currentLab.light_tests) currentLab.light_tests = [];
      continue;
    }
    if (currentLab._inLightTests) {
      const testId = line.match(/^\s+-\s+(\S+)\s*$/);
      if (testId) {
        currentLab.light_tests.push(testId[1]);
        continue;
      }
      if (line.match(/^\s+[a-z_]+:/) || line.match(/^\s+- id:/)) {
        currentLab._inLightTests = false;
      }
    }
  }

  for (const mod of modules) {
    for (const lab of mod.labs) {
      delete lab._inLightTests;
    }
  }

  return { text, modules };
}

export function flattenLabs(catalog) {
  return catalog.modules.flatMap((m) =>
    m.labs.map((lab) => ({ ...lab, module: m.module })),
  );
}

export function labsByModule(catalog, moduleNum) {
  const mod = catalog.modules.find((m) => m.module === moduleNum);
  return mod?.labs ?? [];
}
