# Deploy to your site + student tenancy (minimal logins)

## Can we deploy to a site of our choice?

**Yes.** This lab is stock self-hosted Dify (+ optional Open WebUI). Put it behind your reverse proxy on any hostname you control.

### Typical production shape

```
students  →  https://training.example.com   (your student portal — already has login)
builders  →  https://dify.training.example.com   (Dify Studio)
apps/API  →  https://dify.training.example.com   (published Apps + /v1 Service API)
```

Or one host with path prefixes (`/portal`, `/dify`) if you prefer.

Set these in Dify’s `.env` (see upstream env docs) to your public HTTPS URLs:

| Variable | Purpose |
|----------|---------|
| `CONSOLE_WEB_URL` | Studio UI URL |
| `CONSOLE_API_URL` | Studio API URL |
| `APP_WEB_URL` | Published App web UI URL |
| `APP_API_URL` / `SERVICE_API_URL` | Service API base used by clients |
| `FILES_URL` | File download links |
| `NEXT_PUBLIC_SOCKET_URL` | `wss://…` if collaboration enabled |

Also:

- Terminate TLS at your proxy (Caddy / Traefik / nginx / cloud LB).
- Forward `Host`, `X-Forwarded-Proto`, `X-Forwarded-For` (and enable respecting X-Forwarded headers in Dify if you use an outer proxy).
- Restrict Studio to instructors/VPN; expose only what trainees need (published Apps or your portal BFF).

Open WebUI is optional; same idea — bind it to e.g. `https://chat.training.example.com` if you keep it.

---

## Tenancy goal: one portal login, zero extra student logins

Your constraint: students already sign into **your** portal. Do **not** make them create/login to Dify or Open WebUI.

### What Community Edition gives you today

From this lab’s live features:

- `webapp_auth.allow_public_access: true` — published App web UIs can be opened **without** a Dify account.
- Console SSO / enforced IdP login is **not** on in CE by default (`sso_enforced_for_signin: false`). Full SAML/OIDC for console + “authenticated external users” is primarily a **Dify Enterprise** story.
- Service API supports an end-user id field: `user` — Dify scopes conversations/files to that string **without authenticating it**. You supply a stable id (e.g. portal student id).

So for CE + your portal, treat Dify as a **backend lab engine**, not as the student IdP.

### Recommended pattern: Portal BFF (best login minimization)

```
Student clicks “Launch lab” in portal
        │
        ▼
Portal backend (already knows student_id from portal session)
        │  Authorization: Bearer <DIFY_APP_API_KEY>   ← shared lab key, server-side only
        │  body.user = "student:<portal_user_id>"     ← per-student tenancy
        ▼
Dify Service API  /v1/chat-messages
        │
        ▼
Portal UI renders the chat (iframe-free component or thin embed)
```

**Student login count: 1** (portal only).

| Concern | How it’s handled |
|---------|------------------|
| AuthN | Portal session only |
| Per-student isolation | Same App key + distinct `user` per student |
| Conversation memory | Scoped to that `user` (+ `conversation_id`) |
| PHI / audit | Portal logs who launched; Dify logs `user` |
| No Dify passwords | App API key never leaves the portal server |

Publish the Chatflow, create an **App API key** in Studio (Access Point / API Access), store it in portal secrets — not in the browser.

### Acceptable lighter pattern: public App link

Publish the App → share `https://dify…/chat/<site_code>` from a portal button (this lab’s sample responds on `/chat/{code}`).

- **Pros:** Zero Dify login; fastest to wire.  
- **Cons:** Weak identity (browser/local storage). Fine for disposable demos; weaker for graded labs or PHI scenarios. Prefer BFF when you need real per-student history.

### Patterns to avoid for trainees

| Pattern | Why |
|---------|-----|
| Each student gets a Dify Studio account | Extra login + they see the builder |
| Open WebUI accounts per student | Second IdP / signup unless you invest in SSO |
| Enterprise SSO redirect for every lab click | Still a second auth hop unless portal **is** the IdP and SSO is seamless |

Open WebUI remains useful for **instructor demos**, not as the default student entry if you already have a portal.

### Optional later: Enterprise SSO

If you buy Dify Enterprise, you can enforce IdP SSO for web apps. That only reduces student friction if the IdP session is **already** the portal’s (same IdP, SSO SSO). Otherwise students still feel a second login. For most training orgs with an existing LMS/portal, **BFF + `user`** stays cleaner.

---

## Suggested portal button contract

```http
POST /api/labs/{labSlug}/sessions
Cookie: portal_session=…

→ 200 {
  "session_id": "...",
  "dify_user": "student:12345",
  "ws_or_sse_url": "/api/labs/.../chat"   // portal proxy, not Dify directly
}
```

Portal proxy forwards to Dify `/v1/chat-messages` with the App key and `user=student:12345`.

---

## Builder vs trainee surfaces

| Role | Surface | Login |
|------|---------|--------|
| Instructor / builder | Dify Studio | Yes (few people) |
| Student | Your portal only | Portal only |
| Optional demo chat | Open WebUI | Avoid for class cohorts |

---

## Checklist before class

1. Deploy Dify on your chosen hostname + TLS.  
2. Instructors finish Apps in Studio; **Publish**.  
3. Create App API keys; put them in portal secret store.  
4. Portal “Launch lab” uses BFF + `user=<portal id>`.  
5. Do **not** enable student signup on Dify/Open WebUI.  
6. Rotate App keys between cohorts if needed.
