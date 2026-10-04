# Module 1 — Member Benefits FAQ (instructor runbook)

| Field | Value |
|-------|--------|
| **Catalog lab id** | `m1-l01-member-benefits-faq` |
| **Catalog title** | Member Benefits FAQ (Chat App) |
| **Blueprint id** | `module-01-member-benefits-faq` |
| **Blueprint file** | `templates/module-01-member-benefits-faq.lab.yaml` |
| **Portal slug** | `member-benefits-faq` |
| **Dify mode** | Chatflow |

## Objective

Build and publish a benefits FAQ Chatflow so students answer PPO vs HMO and coverage questions through the portal (never Studio), with grounded tone and no contradictory plan facts.

## Prerequisites

- Lab stack reachable: Studio at http://localhost:3847 (use **localhost**, not `127.0.0.1`, for auth cookies).
- OpenRouter installed and configured — see [HOW_TO_OPENROUTER_CANVAS.md](../HOW_TO_OPENROUTER_CANVAS.md).
- Lab admin credentials in `lab-creds.env` (gitignored).
- Optional: synthetic dataset `benefits-faq-synthetic` if you wire Knowledge retrieval.

## Studio steps

Node checklist (matches blueprint):

| Order | Node | Label / notes |
|-------|------|----------------|
| 1 | **Start** | User Input |
| 2 | **Knowledge retrieval** (optional) | Benefits FAQ — attach `benefits-faq-synthetic` if used |
| 3 | **LLM** | Member Benefits FAQ — OpenRouter model e.g. `meta-llama/llama-3.1-8b-instruct`; system prompt aligned with `web/src/lib/openrouter.ts#MEMBER_BENEFITS_SYSTEM` |
| 4 | **Answer** | Reply — output `{{#llm.text#}}` |

Click-path:

1. **Studio → Create from Blank → Chatflow** → name **Member Benefits FAQ** → Create.
2. Canvas: **Start → LLM → Answer** (add Knowledge between Start and LLM if teaching RAG).
3. **LLM** → model picker → **OpenRouter** → light instruct model.
4. User prompt: `{{#sys.query#}}`.
5. **Preview** (multi-turn: PPO deductible, then HMO PCP rule) → **Publish** → enable API access; store App API key outside git.

Reference sample graph: [HOW_TO_OPENROUTER_CANVAS.md](../HOW_TO_OPENROUTER_CANVAS.md) (existing lab app).

## Portal student path

Students use the portal BFF only — see [DEPLOY_AND_STUDENT_TENANCY.md](../DEPLOY_AND_STUDENT_TENANCY.md).

1. Portal session identifies the student; backend holds the Dify **App API key** (never in the browser).
2. Launch lab for slug **`member-benefits-faq`** (confirm with extract below).
3. BFF calls Dify Service API `POST /v1/chat-messages` with:
   - `Authorization: Bearer <APP_API_KEY>`
   - `user=student:<portal_user_id>` (e.g. `student:12345`)
4. Portal UI renders chat; conversation history is scoped per `user`.

Confirm slug from catalog extract:

```bash
./scripts/lab-view.sh --extract m1-l01-member-benefits-faq
# expect portal_slug: member-benefits-faq
```

Wire map for cohort instances: `./scripts/lab-wire.sh cohort-default`.

## Verify

```bash
# Blueprint schema + FAQ walkthrough fixture (starts mock-claims if needed)
./scripts/lab-light-test.sh

# Slug / lab metadata sanity
./scripts/lab-view.sh --extract m1-l01-member-benefits-faq

# Full programme stack (before slice eval)
./scripts/programme-gate.sh
```

Studio acceptance (manual): multi-turn FAQ does not contradict lab facts; API key not committed.
