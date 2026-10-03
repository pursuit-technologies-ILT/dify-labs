# Dify Labs Walkthrough

Public Next.js companion for [manutej/dify-labs](https://cursor.com/codebase/manutej/dify-labs). Dify itself stays on Docker (`localhost:3847`). This app lets a collaborator paste an OpenRouter key and exercise the Member Benefits FAQ model path without Compose.

## Local

```bash
cd web
npm install
npm run dev -- --port 3849
```

Open http://localhost:3849. Create a key at https://openrouter.ai/keys. The key is stored in `sessionStorage` and sent as `x-openrouter-key` to `/api/openrouter`, which proxies OpenRouter and does not persist the key.

## Deploy

Vercel project root directory is `web`. No server-side `OPENROUTER_API_KEY` is required.
