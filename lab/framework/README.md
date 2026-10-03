# Lab framework

Modular tooling for catalog labs, wiring, and validation. See [docs/ENGINEERING_CRAFT.md](../../docs/ENGINEERING_CRAFT.md).

| Module | Role |
|--------|------|
| `paths.mjs` | Repo root + canonical paths |
| `parse-blueprint.mjs` | Blueprint YAML subset parser |
| `parse-catalog.mjs` | `lab-catalog.yaml` parser |
| `registry.mjs` | Load catalog + blueprints |
| `extract.mjs` | Per-lab extract + instance loader |
| `wire.mjs` | Portal/Dify/mock wire manifest JSON |
| `view.mjs` | Markdown/JSON views for humans and agents |
| `auto-flow.mjs` | Instance build step list |
| `light-tests/index.mjs` | Registered light test handlers |
| `cli-extract.mjs` | CLI for `./scripts/lab-view.sh --extract` |

```bash
./scripts/lab-light-test.sh
./scripts/lab-view.sh --json
./scripts/lab-wire.sh cohort-default
./scripts/lab-auto-flow.sh cohort-default
```
