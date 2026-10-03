# Project concepts (vocabulary)

Stable terms for agents, instructors, and portal engineers. Update when a new pattern lands in `lab/framework/`.

| Term | Meaning |
|------|---------|
| **Blueprint** | `templates/module-0N-*.lab.yaml` — canonical Studio graph spec for a module capstone |
| **Lab catalog entry** | Row in `templates/lab-catalog.yaml` — a teachable lab (core, stretch, or instructor-only) |
| **Instance** | `lab/instances/*.instance.yaml` — binds catalog labs to URLs, slugs, and env for one deployment |
| **Light test** | Handler in `lab/framework/light-tests/` — no LLM; validates fixtures, HTTP mocks, or schema |
| **Wire manifest** | JSON from `lab/framework/wire.mjs` — portal slug → Dify API, mock tool base URLs |
| **Extract view** | Markdown/JSON from `lab/framework/view.mjs` — what an agent should build next |
| **Integrator** | Single role allowed to set `OPENROUTER_LIVE=1` for one ping per run |
| **Student path** | Portal BFF → Dify `/v1/chat-messages` with `user=student:<id>` |
| **Builder path** | Dify Studio on `:3847`; DSL export → `templates/exports/` |
| **Collaborator demo** | Vercel walkthrough + BYO OpenRouter — not the student path |
