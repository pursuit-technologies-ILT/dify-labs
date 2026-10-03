import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frameworkDir = dirname(fileURLToPath(import.meta.url));

/** Repository root (contains AGENTS.md, templates/, lab/). */
export const repoRoot = join(frameworkDir, "../..");

export const paths = {
  templates: join(repoRoot, "templates"),
  catalog: join(repoRoot, "templates/lab-catalog.yaml"),
  fixtures: join(repoRoot, "templates/fixtures"),
  exports: join(repoRoot, "templates/exports"),
  instances: join(repoRoot, "lab/instances"),
  mockOpenApi: join(repoRoot, "services/mock-claims/openapi.yaml"),
  webOpenRouterLib: join(repoRoot, "web/src/lib/openrouter.ts"),
};
