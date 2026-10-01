# OpenRouter + trainee portal wiring

You only need to put `OPENROUTER_API_KEY` in `.env`. The steps below are UI configuration after `./scripts/up.sh`.

## A. Dify ← OpenRouter (builder models)

1. Open http://localhost:3847 and finish `/install` (admin account).
2. Go to **Plugins / Marketplace** and install **OpenRouter** (`langgenius/openrouter`).
3. **Settings → Model Provider → OpenRouter** — paste the same key from `.env`.
4. In any App / workflow, pick OpenRouter models from the model dropdown.

Alternative without Marketplace: if air-gapped, install the plugin package offline and still paste the key under Model Provider.

## B. Publish a trainee-facing App in Dify

1. Create a **Chatflow** or **Workflow** App with the training “element template”.
2. Publish the App.
3. Open **API Access** for that App — copy:
   - API Base URL (OpenAI-compatible chat completions path under Dify service API)
   - App API key

Trainees can use Dify’s built-in App web UI (form / chat) with no node canvas.

## C. Open WebUI ← Dify App (optional ChatGPT-style portal)

1. Open http://localhost:3848 — first user becomes **admin**.
2. Create trainee users (or allow signup once, then set `ENABLE_SIGNUP=false` and recreate the container with that env).
3. As admin: **Admin Panel → Connections → OpenAI**
   - Add a connection with:
     - **URL**: `http://nginx/v1` from inside Docker (`lab_net`), or `http://host.docker.internal:3847/v1` / `http://172.17.0.1:3847/v1` depending on host networking
     - **Key**: the Dify **App** API key from step B
4. The Dify App appears as a selectable “model”. Trainees chat; Dify runs the workflow.

> Tip: keep OpenRouter configured **only in Dify**. Open WebUI then talks to Dify, not directly to OpenRouter, so trainees cannot switch to arbitrary models.

### Direct OpenRouter in Open WebUI (lab shortcut)

`docker-compose.open-webui.yml` already passes `OPENROUTER_API_KEY` into Open WebUI’s OpenAI settings for a quick smoke test. Prefer the Dify-backed connection for the real training design.

## D. Trainee isolation checklist

| Control | Where |
|---------|--------|
| No workflow edit | Trainee uses App UI or Open WebUI only |
| Role = user | Open WebUI default role / disable admin |
| Disable signup after provisioning | `ENABLE_SIGNUP=false` |
| Per-App API keys | Rotate independently of builder credentials |
| Audit | Dify logs + Open WebUI chat history |

## E. Keys you may be asked for

| Key | Used by | Required? |
|-----|---------|-----------|
| `OPENROUTER_API_KEY` | Dify model provider (and optional WebUI smoke) | Yes for live models |
| `OPENAI_API_KEY` | Optional direct OpenAI | No |
| Dify App API key | Open WebUI → Dify | Created in UI after publish |
| Admin passwords | Dify `/install`, Open WebUI first user | Set in browser |
