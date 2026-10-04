# Module 2 — Plan type memory (instructor runbook)

| Field | Value |
|-------|--------|
| **Catalog lab id** | `m2-l01-plan-type-memory` |
| **Catalog title** | Remember plan type across turns |
| **Blueprint id** | `module-02-plan-memory` |
| **Blueprint file** | `templates/module-02-plan-memory.lab.yaml` |
| **Portal slug** | `member-service-memory` |
| **Dify mode** | Chatflow |

## Objective

Teach conversation variables and memory window so the agent remembers `plan_type` (e.g. HDHP) across turns without re-asking, while keeping each student’s history isolated on the portal path.

## Prerequisites

- Studio at http://localhost:3847; OpenRouter configured ([HOW_TO_OPENROUTER_CANVAS.md](../HOW_TO_OPENROUTER_CANVAS.md)).
- Students completed Module 1 mental model (Chatflow, Publish, API key hygiene).

## Studio steps

Node checklist (matches blueprint):

| Order | Node | Label / notes |
|-------|------|----------------|
| 1 | **Start** | User Input |
| 2 | **Variable assigner** | Capture `plan_type` — from user message or LLM extraction |
| 3 | **LLM** | Member service agent — enable **memory** (window **10**); include conversation variable **`plan_type`** in context |
| 4 | **Answer** | Reply |

Click-path:

1. **Studio → Create from Blank → Chatflow** → name **Member Service + Plan Memory** (or catalog title) → Create.
2. Add **Variable assigner** after Start; define conversation variable `plan_type`.
3. Wire **Start → Variable assigner → LLM → Answer**.
4. On **LLM**: OpenRouter model; system prompt instructs use of stored plan type for deductible/benefit answers.
5. **Memory**: conversation window 10; attach variable `plan_type` to the node memory settings.
6. **Preview**: turn 1 — “I’m on an HDHP”; turn 2 — “What’s my deductible?” (should not re-ask plan type) → **Publish**.

## Portal student path

Same app slug for all students; isolation is the `user` field on the Service API.

1. Launch lab slug **`member-service-memory`** from the portal.
2. BFF `POST /v1/chat-messages` with `user=student:<portal_user_id>`.
3. Two students with different ids must not share conversation history.

Confirm slug:

```bash
./scripts/lab-view.sh --extract m2-l01-plan-type-memory
# expect portal_slug: member-service-memory
```

See [DEPLOY_AND_STUDENT_TENANCY.md](../DEPLOY_AND_STUDENT_TENANCY.md).

## Verify

```bash
./scripts/lab-light-test.sh
./scripts/lab-view.sh --extract m2-l01-plan-type-memory
./scripts/programme-gate.sh
```

Light test id **`walkthrough_memory_turns`** covers the memory fixture; Studio acceptance: HDHP stated once, deductible question uses HDHP on turn 2.
