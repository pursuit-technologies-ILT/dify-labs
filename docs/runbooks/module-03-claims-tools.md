# Module 3 — Claims status read (instructor runbook)

| Field | Value |
|-------|--------|
| **Catalog lab id** | `m3-l01-claims-status-read` |
| **Catalog title** | Claims status tool (read-only) |
| **Blueprint id** | `module-03-claims-status` |
| **Blueprint file** | `templates/module-03-claims-status.lab.yaml` |
| **Portal slug** | `claims-status` |
| **Dify mode** | Chatflow |
| **Mock claims API** | `http://127.0.0.1:3860` |

## Objective

Wire an **Agent** node with read-only HTTP tools against the lab mock claims service so students practice **observation** (lookup status) without **action** (no payment posting). Fixtures: member **M1001**, prior auth **PA-9001**.

## Prerequisites

- OpenRouter + Studio access (prior modules).
- Mock claims running on **`http://127.0.0.1:3860`** (compose or `lab-light-test.sh` auto-start). OpenAPI: `services/mock-claims/openapi.yaml`.
- Tool operations: `getClaimByMemberId`, `getPriorAuthById`.

## Studio steps

Tools (blueprint):

| Tool id | Type | Operation |
|---------|------|-----------|
| `claims_lookup` | HTTP (OpenAPI) | `getClaimByMemberId` |
| `prior_auth_lookup` | HTTP (OpenAPI) | `getPriorAuthById` |

Node checklist:

| Order | Node | Label / notes |
|-------|------|----------------|
| 1 | **Start** | User Input |
| 2 | **Agent** | Claims assistant — tools: `claims_lookup`, `prior_auth_lookup`; OpenRouter model |
| 3 | **Answer** | Reply |

Click-path:

1. **Studio → Create from Blank → Chatflow** → **Claims Status Agent** → Create.
2. **Tools → Import from OpenAPI** (or HTTP tool): point base URL at lab mock **`http://127.0.0.1:3860`** (or Docker network URL your lab uses; catalog tests use host `127.0.0.1:3860`).
3. Add **Agent** node; attach both tools; system prompt: read-only status, cite tool results, no write actions.
4. **Start → Agent → Answer**.
5. **Preview**: ask for claim status for member **M1001**; optionally PA **PA-9001** → **Publish**.

Teach: tool call = observation; declining to “pay” or “approve” = boundary.

## Portal student path

1. Portal launches slug **`claims-status`**.
2. BFF calls Service API with `user=student:<portal_user_id>`.
3. Published app tool URLs must resolve to the mock service on the lab network (same base as Studio tests: **`http://127.0.0.1:3860`** from the host, or `mock-claims:3860` inside compose).

Extract slug:

```bash
./scripts/lab-view.sh --extract m3-l01-claims-status-read
# expect portal_slug: claims-status
```

[DEPLOY_AND_STUDENT_TENANCY.md](../DEPLOY_AND_STUDENT_TENANCY.md).

## Verify

```bash
# Health + blueprint + mock_claims_member_m1001
./scripts/lab-light-test.sh

./scripts/lab-view.sh --extract m3-l01-claims-status-read

# Direct mock sanity (optional in class)
curl -sf http://127.0.0.1:3860/health
curl -sf "http://127.0.0.1:3860/claims/M1001" | head

./scripts/programme-gate.sh
```

Studio acceptance: agent calls mock for **M1001** / **PA-9001** fixtures; students never receive Studio credentials.
