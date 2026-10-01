# How to: OpenRouter + Dify drag-and-drop canvas

OpenRouter is only the **model pipe**. The Studio canvas stays fully usable.

Lab already has this wired for the sample App **Member Benefits FAQ**.
Credentials (local lab only): see `lab-creds.env` (gitignored).

## Click path (builders)

### 1) Open Studio
1. Go to http://localhost:3847
2. Sign in (lab admin)
3. Open **Studio**

### 2) Install OpenRouter (once)
1. Open **Plugins** (puzzle icon) → Marketplace  
2. Search **OpenRouter** (`langgenius/openrouter`) → **Install**  
3. **Settings → Model Provider → OpenRouter**  
4. Paste your OpenRouter API key → Save  
5. (Optional) **Add model** → `meta-llama/llama-3.1-8b-instruct` (or `llama-3.2-1b-instruct` for cheaper tests)

### 3) Create a Chatflow (canvas)
1. **Studio → Create from Blank → Chatflow**  
2. Name it (e.g. `Member Benefits FAQ`) → Create  
3. You land on the **node canvas** (Start → … → Answer)

### 4) Wire a simple agent
1. Drag / keep nodes: **Start → LLM → Answer**  
2. Click **LLM** → model picker → choose an **OpenRouter** model (light ones first)  
3. System prompt example:
   > You are a helpful health-plan member service agent. Answer benefits questions briefly.
4. User prompt: `{{#sys.query#}}`  
5. Answer node: `{{#llm.text#}}`  
6. **Preview** in the right panel, then **Publish**

### 5) Trainee-facing view
- Use the App’s published web UI, **or**  
- Point Open WebUI (http://localhost:3848) at the App’s OpenAI-compatible API (`/v1` + App API key)

## What you can still drag (unchanged with OpenRouter)

| Node family | Examples |
|-------------|----------|
| Logic | IF/ELSE, Iteration, Loop |
| Knowledge | Knowledge retrieval (RAG) |
| Tools | HTTP / OpenAPI / custom tools |
| Agents | Agent node, multi-step orchestration |
| Humans | Human-input / approval style flows |
| IO | Start, Answer, Template, Variable assigner |

OpenRouter only appears inside **model selectors** on LLM/Agent nodes.

## Lab sample already created

| Item | Value |
|------|--------|
| App | **Member Benefits FAQ** (`advanced-chat` / Chatflow) |
| Graph | Start → LLM → Answer |
| Model | `meta-llama/llama-3.1-8b-instruct` via OpenRouter |
| Editor URL | http://localhost:3847/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow |

Open that URL while signed in to see the canvas immediately.
