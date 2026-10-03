# Capability specification — what we can deliver with Dify CE

Grounded in the official Dify documentation index ([docs.dify.ai/llms.txt](https://docs.dify.ai/llms.txt)) and this lab’s running CE 1.17.1 instance.

> Prefer Context7 for Dify library docs when quota allows. If Context7 is unavailable, use the official Self-Host docs index and the links in [REFERENCE_LINKS.md](./REFERENCE_LINKS.md).

## 1. Product surfaces we will use

| Surface | Docs concept | Course use |
|---------|--------------|------------|
| **Studio** | Orchestrate apps | Instructors build/maintain lab templates |
| **Chatflow** | Conversational workflow each turn | Default for member-service / claims agents |
| **Workflow** | Single-turn / batch | Intake forms, prior-auth processing, audits |
| **Agent** (node or app) | Tool-using reasoner | Modules 3–4 when autonomy is the lesson |
| **Knowledge** | RAG datasets | Benefits FAQ, policy snippets, episodic “case” memory |
| **Integrations / Model Providers** | LLMs, embeddings | OpenRouter (lab) / enterprise gateway (prod) |
| **Publish → Web App** | Chat / workflow web UIs | Optional direct links; secondary to portal |
| **Publish → API** | Service API `/v1` | **Primary student path** via portal BFF |
| **Publish → MCP Server** | Expose app as MCP | Module 3 teaching alternative to n8n-as-MCP |
| **Human Input** | Pause for human | Module 5 HITL |
| **Monitor / Logs** | Runs, costs, annotations | Module 6 audit + instructor review |
| **DSL export** | YAML portability | Version lab templates across environments |

Basic legacy types (Chatbot, Agent chat, Text Generator) exist; **prefer Chatflow/Workflow** per Dify guidance.

## 2. Orchestration building blocks (canvas)

From Self-Host → Use → Orchestrate → Nodes (docs index):

**Always-on for our outline**

- User Input / Start  
- LLM  
- Answer / Output  
- Knowledge Retrieval  
- If-Else, Question Classifier  
- HTTP Request, Tool  
- Agent  
- Iteration / Loop  
- Code, Template, Parameter Extractor  
- Variable Assigner (conversation vars)  
- Human Input  
- Error handling + Variable Inspector (debug)

**Mapped teaching ideas**

| Agentic concept | Dify mechanism |
|-----------------|----------------|
| Observe | Tools, HTTP, Knowledge Retrieval, user input |
| Orient | Prompts + memory window + conversation variables |
| Decide | LLM / Agent / Question Classifier / If-Else |
| Act | Tools, HTTP, downstream branches |
| Episodic memory | Knowledge base |
| Working memory | Chatflow memory + conversation variables |
| HITL | Human Input node |
| Multi-agent | Multiple Agent/LLM branches or nested patterns |
| Expose as tool | Publish app as API or MCP server |

## 3. Identity & tenancy (students)

Documented behavior ([End User Identity](https://docs.dify.ai/en/api-reference/guides/end-user-identity)):

- Service API `user` string scopes conversations, files, stop/resume.
- Dify **does not authenticate** `user` — the portal must.
- One App API key can serve many end users.
- API conversations ≠ Web App conversations (same logical person can have two histories).

**Our spec:** Portal session → BFF → `/v1/chat-messages` with `user=student:<portal_id>`.

## 4. Deployment

Self-Host → Deploy → Docker Compose is the supported privatized path.

- Custom domain via reverse proxy + URL env vars (`CONSOLE_*`, `APP_*`, `FILES_URL`, sockets).
- Lab overlay: lean workers, ports 3847/3848, OpenRouter-ready.
- See `docs/DEPLOY_AND_STUDENT_TENANCY.md`.

## 5. Explicit non-goals (CE lab)

| Non-goal | Notes |
|----------|-------|
| Student Dify Studio seats | Conflicts with “pre-made elements” + login minimization |
| Relying on Open WebUI as primary student IdP | Extra accounts unless deep SSO work |
| Assuming Enterprise SSO features in CE | Console/webapp SSO enforcement is Enterprise-oriented |
| Full air-gap without prep | Marketplace plugin install + image pulls need outbound or offline mirrors |

## 6. Capability ↔ course module matrix

| Module | Outcome | Dify capability package | Student delivery |
|--------|---------|-------------------------|------------------|
| 1 Intro | End-to-end toolchain | Chatflow + model provider + Publish | Portal launch → FAQ app |
| 2 Components | Model + memory | LLM model select, memory window, conversation vars, optional KB | Same app upgraded |
| 3 Tools / MCP | Observation vs action | HTTP/Tool nodes; optional MCP publish; Agent node | Claims/prior-auth tool app |
| 4 Build apps | Decomposition, resilience | If-Else, Parameter Extractor, error handling, multi-node | Prior-auth intake Workflow/Chatflow |
| 5 Collaborative | HITL | Human Input, logs for specialist review | Denial appeal with approval gate |
| 6 Ethics / security | Risk audit | Logs, tool scopes, KB/PII review, annotations | Worksheet + instructor log review |

## 7. Acceptance criteria (lab environment)

- [x] Dify Compose up; `/install` completed  
- [x] OpenRouter provider active; light model callable  
- [x] Sample Chatflow **Member Benefits FAQ** on canvas  
- [ ] App API key created and stored for portal BFF  
- [x] Mock claims/prior-auth HTTP tool available (`services/mock-claims`, port 3860)  
- [ ] Portal BFF prototype (`user` isolation verified)  
- [ ] Custom-domain env template for target site  
- [ ] Module 1–6 instructor runbooks + trainee DSL exports  
- [x] Module 1–6 builder blueprints (`templates/*.lab.yaml`) + light tests  

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Context7/doc drift | Pin CE version; re-check `llms.txt` before each cohort |
| OpenRouter credits | Prefer tiny models; budget alerts; prod uses internal gateway |
| PHI in logs | Synthetic data only in lab; retention policy; no real member data |
| Portal↔API identity mixup | Never mix webapp and API histories for grading |
| Nested Docker networking | Documented in scripts (`iptables-legacy`, FORWARD accept) |
