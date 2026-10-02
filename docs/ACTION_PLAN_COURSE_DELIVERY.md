# Action plan — deliver the course outline on Dify

Transforms the n8n outline into a sequenced delivery plan. Pair with [SPEC_CAPABILITIES.md](./SPEC_CAPABILITIES.md) and [CURRICULUM_REFACTOR_N8N_TO_DIFY.md](./CURRICULUM_REFACTOR_N8N_TO_DIFY.md).

## Outcome definition (done means)

1. Instructors can build/maintain all Module 1–6 lab templates in Dify Studio.  
2. Students launch every lab from the **existing portal with one login**.  
3. Stack runs on a hostname of our choice (private network).  
4. Synthetic health-insurance scenarios only (no real PHI).  
5. LMS description + instructor guides use Dify naming (n8n removed).

---

## Phase 0 — Foundations (lab hardening)

**Owner:** platform / this repo  

| # | Action | Output | Status |
|---|--------|--------|--------|
| 0.1 | Keep Compose lab reproducible (`scripts/*`, pin 1.17.1) | `./scripts/up.sh` green | Done |
| 0.2 | OpenRouter wired; light model proven | Chat 200 with llama-3.1-8b | Done |
| 0.3 | Sample Chatflow on canvas | Member Benefits FAQ | Done |
| 0.4 | Durable memory + specs + links | `AGENTS.md`, `docs/*` | This change |
| 0.5 | Create App API key for sample; store in portal secrets pattern | Key in secret store (not git) | Todo |
| 0.6 | Custom-domain `.env` template for target site | `lab/prod.env.template` | Todo |
| 0.7 | Re-run Context7 Dify queries when quota resets; diff vs these specs | Note in DECISIONS.md | Todo |

---

## Phase 1 — Student portal path (login minimization)

**Owner:** portal eng + lab  

| # | Action | Output |
|---|--------|--------|
| 1.1 | Implement portal BFF: `POST /labs/{slug}/chat` → Dify `/v1/chat-messages` | Working proxy |
| 1.2 | Set `user=student:{portalUserId}` on every call | Isolation proof (two students, separate histories) |
| 1.3 | Portal button “Launch Member Benefits FAQ” | One-click from logged-in portal |
| 1.4 | Do **not** require Dify/Open WebUI student accounts | Policy confirmed |
| 1.5 | Decide: portal-native chat UI vs thin embed of public `/chat/{code}` | ADR in `docs/memory/DECISIONS.md` |

**Exit criteria:** Student completes a multi-turn FAQ lab with zero Dify login.

---

## Phase 2 — Module template factory (builders)

Build once in Studio; export DSL; version in repo under `templates/` (todo).

| Module | Template to build | Key nodes | Synthetic data |
|--------|-------------------|-----------|----------------|
| 1 | Member Benefits FAQ (exists) | LLM + optional KB | Benefits FAQ PDF |
| 2 | Member Service + Memory | Memory window, conversation var `plan_type` | Scripted multi-turn |
| 3 | Claims Status Agent | HTTP/Tool → mock API; optional MCP publish | Mock prior-auth JSON |
| 4 | Prior-Auth Intake | Parameter Extractor, If-Else, error path | Incomplete payload cases |
| 5 | Coverage Denial Appeal HITL | Human Input before external act | Appeal packet fixture |
| 6 | Ethics Audit Pack | Annotation + checklist (not necessarily an agent) | Rubric worksheet |

| # | Action | Output |
|---|--------|--------|
| 2.1 | Stand up **mock claims API** (tiny FastAPI/Hono in-repo or wiremock) | OpenAPI + docker service |
| 2.2 | Build modules 2–5 Apps; export DSL YAML | `templates/module-0N-*.yml` |
| 2.3 | Knowledge base for benefits (chunk + retrieve settings) | Shared KB attached to M1/M2 |
| 2.4 | Publish each App; record API keys in secret manager | Portal slug → key map |
| 2.5 | Instructor dry-run of canvas + Preview | Checklist signed off |

**Exit criteria:** All six labs runnable via portal (M6 may be worksheet-only).

---

## Phase 3 — Curriculum packaging

| # | Action | Output |
|---|--------|--------|
| 3.1 | Finalize LMS blurb | Update from `COURSE_DESCRIPTION_DIFY.md` |
| 3.2 | Instructor guides (click-path per module) | `docs/runbooks/module-0N.md` |
| 3.3 | Student worksheets (no canvas) | PDF/Markdown pack |
| 3.4 | Slide deck delta: replace n8n screenshots with Dify | Deck vNext |
| 3.5 | Assessment rubric (HITL + ethics) | Rubric aligned to skills gained |

---

## Phase 4 — Production deploy

| # | Action | Output |
|---|--------|--------|
| 4.1 | Deploy Dify to chosen hostname + TLS | `https://dify.<org>/` |
| 4.2 | Set public URL env vars; smoke Studio + API | Green checks |
| 4.3 | Lock Studio to instructors (VPN / IdP / firewall) | Access matrix |
| 4.4 | Point models at enterprise gateway (drop OpenRouter if required) | Provider config |
| 4.5 | Log retention + synthetic-data policy | Written policy |
| 4.6 | Cohort dry-run (5 pilot students) | Issues list closed |

---

## Phase 5 — Operate & improve

| # | Action | Cadence |
|---|--------|---------|
| 5.1 | Export DSL after each template change | Per change |
| 5.2 | Rotate App API keys between cohorts | Per cohort |
| 5.3 | Review Dify release notes before upgrade | Per upgrade |
| 5.4 | Refresh REFERENCE_LINKS from `llms.txt` | Quarterly |
| 5.5 | Capture new decisions in `docs/memory/DECISIONS.md` | Ongoing |

---

## Day-of-class runbook (2-day)

### Day 1 — Modules 1–3

| Block | Mode | Artifact |
|-------|------|----------|
| Concepts: agentic AI | Lecture | Slides |
| Lab 1: FAQ agent | Portal launch | M1 app |
| Components: model + memory | Lecture + demo Studio | M2 |
| Lab 2: remember plan type | Portal | M2 |
| Tools / MCP | Lecture; show Tool + MCP publish | M3 |
| Lab 3: claims status | Portal → tool-backed app | M3 + mock API |

### Day 2 — Modules 4–6

| Block | Mode | Artifact |
|-------|------|----------|
| Building resilient apps | Studio demo | M4 |
| Lab 4: incomplete intake | Portal | M4 |
| Collaborative / HITL | Studio demo Human Input | M5 |
| Lab 5: denial appeal approval | Portal + instructor approval queue | M5 |
| Ethics & security | Workshop | Worksheet + logs |
| Lab 6: audit | Worksheet | Rubric |

Instructors may open Studio; students stay in portal.

---

## RACI (simplified)

| Workstream | R | A | C | I |
|------------|---|---|---|---|
| Dify platform | Lab eng | Platform lead | Security | Instructors |
| Portal BFF | Portal eng | Portal lead | Lab eng | Instructors |
| Templates / DSL | Instructors | Curriculum lead | Lab eng | Students |
| Security / PHI | Security | CISO/delegate | Curriculum | All |

---

## Immediate next three actions

1. **Create App API key** for Member Benefits FAQ; document secret path (not git).  
2. **Scaffold portal BFF** endpoint contract against `/v1/chat-messages` + `user`.  
3. **Add mock claims API** + Module 3 template so tools lab is real.

Track progress by checking boxes in [SPEC_CAPABILITIES.md §7](./SPEC_CAPABILITIES.md#7-acceptance-criteria-lab-environment).
