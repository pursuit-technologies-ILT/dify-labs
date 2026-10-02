# Lab materials — module shot list

Instructor-oriented checklist. Regenerate with `./scripts/screenshots/capture-lab.sh` (see [SCREENSHOT_PROTOCOL.md](../SCREENSHOT_PROTOCOL.md)).

Sample Chatflow app: **Member Benefits FAQ**  
Editor URL: `http://localhost:3847/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow`

## Automated proof set (script captures these)

| Shot | File | Click context |
|------|------|---------------|
| A | `proof-A-dify-install-or-home.png` | Open Dify → install finished / landing |
| A2 | `proof-A2-dify-studio-home.png` | After Studio sign-in → Home |
| B | `proof-B-dify-apps.png` | Left nav → **Apps** |
| C | `proof-C-dify-chatflow-canvas.png` | App → **Orchestrate** / workflow canvas |
| D | `proof-D-open-webui-home.png` | Optional: Open WebUI `:3848` |
| M0 | `lab-m0-dify-signin.png` | Studio **Sign in** form |
| M1 | `lab-m1-model-providers.png` | Integrations → **Model Provider** |

## Module walkthrough shots (manual or future automation)

Capture these while walking the curriculum; store under `docs/lab-materials/screenshots/` with the stems below.

### M1 — FAQ publish path

| Stem | What to click / show |
|------|----------------------|
| `lab-m1-create-chatflow` | Apps → **Create from Blank** → Chatflow |
| `lab-m1-llm-node-openrouter` | LLM node → model picker → OpenRouter model |
| `lab-m1-answer-node` | Answer node wired from LLM |
| `lab-m1-preview-debug` | Preview / debug chat in Studio |
| `lab-m1-publish` | **Publish** confirmation |
| `lab-m1-api-access` | App → API Access / key panel (operator only; redact keys) |

### M2 — Knowledge / RAG (when used)

| Stem | What to click / show |
|------|----------------------|
| `lab-m2-knowledge-list` | Knowledge → list |
| `lab-m2-dataset-upload` | Create dataset → upload PDF/chunk UI |
| `lab-m2-kb-node-on-canvas` | Knowledge Retrieval node on canvas |

### M3 — Tools / agent (when used)

| Stem | What to click / show |
|------|----------------------|
| `lab-m3-tools-panel` | Tools / plugin marketplace entry |
| `lab-m3-agent-canvas` | Agent app canvas (if demoed) |

### M4 — Logs & ops

| Stem | What to click / show |
|------|----------------------|
| `lab-m4-logs` | App logs / conversations |
| `lab-m4-openrouter-usage` | External OpenRouter dashboard (optional; not in Studio) |

## Caption style for worksheets

One figure → one action. Example:

> **Figure B — Apps list**  
> Click **Apps**. Open **Member Benefits FAQ**.

Do not overlay badges or multi-step annotations on the PNG itself; keep instructions in the worksheet text.
