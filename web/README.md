# Dify Labs Walkthrough

Public Next.js companion for [manutej/dify-labs](https://cursor.com/codebase/manutej/dify-labs). Dify itself stays on Docker (`localhost:3847`). This app adds a **shared password gate**, then lets a collaborator paste **their** OpenRouter key and open the Member Benefits FAQ canvas when `NEXT_PUBLIC_DIFY_STUDIO_URL` points at a tunnel.

## Local

```bash
cd web
cp .env.example .env.local
# set COLLAB_PASSWORD (never commit)
npm install
npm run dev -- --port 3849
```

Open http://localhost:3849. After the password cookie is set, create a key at https://openrouter.ai/keys. The key is stored in `sessionStorage` and sent as `x-openrouter-key` to `/api/openrouter`, which proxies OpenRouter and does not persist the key. Do not put `sk-or-` values in source or Vercel env.

## Deploy

Vercel project root directory is `web`. Required env: `COLLAB_PASSWORD` (and optional `COLLAB_SESSION_SECRET`). Optional: `NEXT_PUBLIC_DIFY_STUDIO_URL` (HTTPS tunnel to :3847). No server-side `OPENROUTER_API_KEY`.

Teardown ~2026-10-06: remove the password env, tunnel, and public Studio. Demo-only — not the portal-BFF student path.
