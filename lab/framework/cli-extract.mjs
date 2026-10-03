import { extractLab } from "./extract.mjs";

const labId = process.argv[2];
if (!labId) {
  console.error("Usage: node lab/framework/cli-extract.mjs <catalog_lab_id>");
  process.exit(1);
}
console.log(JSON.stringify(extractLab(labId), null, 2));
