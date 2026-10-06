# Troubleshooting — macOS + Docker Desktop

This lab runs Dify via **Docker Compose**. On a Mac, use **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — not the Linux-only `sudo dockerd` path in `scripts/ensure-docker.sh`.

## Recommended workflow

```bash
cp .env.example .env
# OPENROUTER_API_KEY=sk-or-...

# Start Docker Desktop first, then:
./scripts/up.sh
./scripts/status.sh
./scripts/programme-gate.sh
```

Skip `./scripts/ensure-docker.sh` when Docker Desktop is already running. `up.sh` still calls it, but on macOS it only checks `docker info` and prints **Using Docker Desktop** — no sudo.

## “Preparing iptables-legacy + dockerd” and sudo prompts

That message means an **old or Linux sandbox** code path tried to start `dockerd` with `sudo`. Current `ensure-docker.sh` **does not** do that on macOS (`Darwin`).

If you still see sudo prompts:

| What you typed | What it actually is |
|----------------|---------------------|
| Walkthrough / Vercel gate | **`COLLAB_PASSWORD`** — demo site only; not sudo |
| macOS sudo dialog | **Your Mac administrator password** — the account that can install software |
| Lab `.env` | **`OPENROUTER_API_KEY`** — API key only; not sudo |

Three failed sudo attempts usually means the wrong password (often `COLLAB_PASSWORD`) or the Mac user is not an administrator.

## Docker Desktop not running

Symptoms: `Cannot connect to the Docker daemon`, or `ensure-docker.sh` exits with instructions to open Docker Desktop.

1. Open **Docker Desktop** and wait until it is fully started.
2. In Terminal: `docker info` should succeed without sudo.
3. Run `./scripts/up.sh` again.

## Programme gate on Mac

`./scripts/programme-gate.sh` does not use sudo. It runs lab-light tests and `web` lint. Ensure Docker is up if tests need the mock claims stack or containers.

## Linux sandboxes (Cursor Cloud Agent, CI)

Cloud agents and some Linux VMs without systemd use the **iptables-legacy + dockerd** path — that is intentional there, not on your Mac.
