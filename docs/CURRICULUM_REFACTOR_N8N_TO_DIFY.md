# Curriculum refactor: n8n → Dify (+ Open WebUI)

Source outline: *No-Code Agentic AI: Building Business Automation with n8n* (2-day, health-insurance scenarios).

Goal: keep learning outcomes, audience, and labs; replace **n8n** with a privatizable stack that clears enterprise constraints (n8n unapproved, web training portal, non-technical trainees, pre-built elements).

## Platform roles

| Role | Tool |
|------|------|
| Builder studio (visual agents, tools, RAG, HITL) | **Dify** Chatflow / Workflow / Agent |
| Trainee portal (ChatGPT-like, RBAC) | **Open WebUI** → Dify App OpenAI-compatible API |
| Models | **OpenRouter** (lab) or enterprise LLM gateway (prod) |

Trainees never see the canvas. Builders prepare Apps; trainees run published Apps or WebUI “models”.

## Outcome-preserving renames

| Original (n8n) | Refactored |
|----------------|------------|
| No-Code Agentic AI: Building Business Automation with **n8n** | No-Code Agentic AI: Building Business Automation with **Dify** |
| Build … through **n8n** | Build … through **Dify Apps** (optional Open WebUI portal) |
| Hands-on labs on the **n8n platform** | Hands-on labs on **Dify** (+ trainee portal) |
| Reduce time-to-first-agent through **no-code n8n workflows** | … through **no-code Dify Apps / chatflows** |
| Software: browser + Internet | Browser + lab URLs (Dify `:3847`, Open WebUI `:3848`) + OpenRouter (or internal) key |

Skills gained stay the same except: *“Build basic AI agents … in n8n”* → *“… in Dify”*.

## Module → Dify lab mapping

### Module 1 — Introduction to Agentic AI
**Keep:** definitions, differentiation, benefits/challenges, collaboration vs automation, health-plan use cases.

**Lab (was: stand up n8n + intro agent):**
1. Open Dify → finish admin install (once per environment).
2. Connect OpenRouter (or gateway) model provider.
3. Create a **Chat App** “Member Benefits FAQ” with a system prompt + optional knowledge doc (plan benefits PDF).
4. Publish; verify in Dify App UI **and** (optional) as a model in Open WebUI.

### Module 2 — Components of an Agentic AI
**n8n concepts → Dify:**

| n8n | Dify |
|-----|------|
| Model picker on AI Agent node | App / node model selector (OpenRouter dropdown) |
| Simple Memory node | Chatflow **Conversation / Memory** variables; windowed history |
| Postgres/Redis memory | Dify conversation persistence (Postgres); optional external KB for long-term |
| Episodic memory | Knowledge base / dataset retrieval (RAG) for past “cases” |
| OODA framing | Same teaching content; map Observe→tools/KB, Orient→prompt+memory, Decide→LLM, Act→tools |

**Lab:** Member-service agent that remembers plan type across turns (conversation variables + optional KB).

### Module 3 — Tool Use and MCP Servers
**n8n:** observation vs action tools; AI Agent tools; n8n as MCP client/server.

**Dify:**
- **Custom tools** / OpenAPI tools / HTTP request nodes for claims-status lookup (mock API or fixture).
- **MCP:** Dify’s MCP / plugin ecosystem where available; if enterprise blocks MCP Marketplace, use **HTTP tools + plugin** equivalents and teach MCP conceptually with one approved server.
- “Expose workflow as tool” → publish a Dify Workflow/App and call it from another agent (or via API), analogous to n8n-as-MCP-server.

**Lab:** Claims-status tool + prior-auth status check (mock service in lab or static JSON tool).

### Module 4 — Building Agentic AI Applications
**n8n:** AI Agent Tool node, single-canvas multi-agent.

**Dify:**
- **Chatflow** for single-agent resilient intake.
- **Workflow** + multi-node / multi-agent patterns for task decomposition.
- Failure paths: IF/ELSE, error handling, fallback messages, human review branch.

**Lab:** Prior-authorization intake agent that survives incomplete submission (validation node + clarifying questions).

### Module 5 — Designing Collaborative Agents
**n8n:** human-in-the-loop nodes / wait for approval.

**Dify:**
- **Human-in-the-loop** / approval nodes in Workflow (or “pause for review” pattern with App form).
- Trainee + specialist path: Open WebUI user role vs builder; escalation copy in the agent.
- Debug with a claims specialist as recovery: annotate conversation logs in Dify.

**Lab:** Coverage-denial appeal agent with explicit human approval before external action.

### Module 6 — Ethics and Security
Platform-agnostic audit lab stays; swap “n8n workflow export” for **Dify App definition / tool permissions / logging**.

**Lab checklist additions for Dify:**
- PHI in prompts, logs, knowledge bases, and Open WebUI history
- Tool scopes (read-only vs action) and excessive agency
- Who can edit Apps vs who can only chat
- SSRF/sandbox boundaries (already in compose)

## Suggested day plan (unchanged structure)

| Day | Modules | Builder surface | Trainee surface |
|-----|---------|-----------------|-----------------|
| 1 | 1–3 | Dify Studio | Dify App web / Open WebUI |
| 2 | 4–6 | Dify Workflows + HITL | Same; audit worksheet |

## What we deliberately drop / defer

- n8n-specific MCP “expose this workflow as MCP server” deep-dive → replace with Dify App-as-API + optional MCP plugin.
- n8n credential store UI → Dify tool credentials / env + OpenRouter key in lab `.env`.
- Dense node-grid aesthetics → App Interface emphasis (matches enterprise “pre-made elements” requirement).

## Lab environment hooks (this repo)

```bash
cp .env.example .env   # paste OPENROUTER_API_KEY
./scripts/ensure-docker.sh
./scripts/up.sh
# Builders:  http://localhost:3847/install
# Trainees:  http://localhost:3848
```

See [OPENROUTER_AND_PORTAL.md](./OPENROUTER_AND_PORTAL.md) for wiring Apps into Open WebUI.

## Delivery plan & specs

- Capabilities: [SPEC_CAPABILITIES.md](./SPEC_CAPABILITIES.md)
- Phased action plan: [ACTION_PLAN_COURSE_DELIVERY.md](./ACTION_PLAN_COURSE_DELIVERY.md)
- Reference links: [REFERENCE_LINKS.md](./REFERENCE_LINKS.md)
- Decisions: [memory/DECISIONS.md](./memory/DECISIONS.md)
- Project memory: [../AGENTS.md](../AGENTS.md)

## Remaining follow-ups

1. Per-lab instructor runbooks (`docs/runbooks/module-0N.md`).
2. Fixture mock APIs for claims/prior-auth tools.
3. Trainee worksheet pack (no canvas access).
4. Portal BFF + App API keys (see action plan Phase 1).
5. DSL exports under `templates/` once Modules 2–5 are built.
