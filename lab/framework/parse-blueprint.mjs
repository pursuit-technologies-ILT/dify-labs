import { readFileSync } from "node:fs";

/**
 * Minimal YAML subset parser for our blueprint files (no external deps).
 * Extracts top-level scalars, light_test ids, and fixture refs.
 */
export function parseBlueprintFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  const scalars = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/);
    if (m) {
      scalars[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }

  const lightTestIds = [];
  const lightBlock = text.match(/light_tests:\s*\n((?:\s+-\s+id:\s+.+\n?)+)/);
  if (lightBlock) {
    for (const m of lightBlock[1].matchAll(/-\s+id:\s+(\S+)/g)) {
      lightTestIds.push(m[1]);
    }
  }

  const fixtureRefs = [];
  for (const m of text.matchAll(/fixtures\/[\w.-]+\.(json|yaml|yml)/g)) {
    fixtureRefs.push(m[0]);
  }

  return {
    text,
    scalars,
    lightTestIds,
    fixtureRefs,
    hasAcceptance: text.includes("acceptance:"),
  };
}

export function assertBlueprintShape(parsed, fileName) {
  const { scalars, hasAcceptance, lightTestIds } = parsed;
  const errors = [];
  if (!scalars.id) errors.push("missing id");
  if (!scalars.module) errors.push("missing module");
  if (!scalars.title) errors.push("missing title");
  if (!hasAcceptance) errors.push("missing acceptance");
  if (lightTestIds.length === 0) errors.push("missing acceptance.light_tests ids");
  return errors.map((e) => `${fileName}: ${e}`);
}
