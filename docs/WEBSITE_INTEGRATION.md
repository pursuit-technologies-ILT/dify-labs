# Website integration (developers)

This is the **production** path for the shared student portal. The Vercel walkthrough + shared password is a 3-day collaborator demo only (teardown **2026-10-06**).

Students already have a portal login. Do not add Dify Studio accounts for them.

## Shape

```
Student (portal session)
  → Your BFF
    → Authorization: Bearer <DIFY_APP_API_KEY>   // server-only
    → POST /v1/chat-messages
    → user: "student:<portal_user_id>"
  → Dify Chatflow
```

Collaborators investigating this lab can:

1. Sign in to https://dify-labs-walkthrough.vercel.app with the **one shared password**.
2. Paste **their own** OpenRouter key to prove model calls (not stored on our server).
3. Open the live canvas (SSO ticket → Studio) to see Start → LLM → Answer.
4. Copy the Service API pattern above into the portal BFF.

## Contract

| Piece | Where it lives |
|-------|----------------|
| Portal session | Your website |
| Dify App API key | Portal secret store |
| End-user tenancy | `user` string, stable per person |
| OpenRouter / gateway | Dify model provider (Studio), not the browser |

Dify does **not** authenticate `user`. The BFF must. API conversations are not the same as Studio webapp conversations.

See [DEPLOY_AND_STUDENT_TENANCY.md](./DEPLOY_AND_STUDENT_TENANCY.md) and [https://docs.dify.ai/en/api-reference/guides/end-user-identity](https://docs.dify.ai/en/api-reference/guides/end-user-identity).
