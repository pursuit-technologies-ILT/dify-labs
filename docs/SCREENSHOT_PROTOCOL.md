# Screenshot protocol (Vibium + Chrome)

Durable way for instructors and agents to regenerate **“what to click”** lab materials for the Dify CE 1.17.1 training lab.

## Tool choice

| Tool | Role |
|------|------|
| **Vibium** (`vibium` npm **26.8.21**) | **Primary** — browser automation from the terminal |
| **Chrome / Chrome for Testing** | Engine Vibium launches (`engine: 'chrome'`) |
| Playwright | **Fallback only** if Vibium cannot drive Chrome in the environment |

This lab uses Vibium successfully with headless Chrome. Document any Playwright fallback in `docs/memory/DECISIONS.md` if you must switch.

## Prerequisites

1. Lab up: `./scripts/up.sh` then `./scripts/status.sh`
2. Node.js **≥ 18**
3. Optional Studio login shots: gitignored `lab-creds.env` at repo root:

   ```bash
   DIFY_ADMIN_EMAIL=lab-admin@example.com
   DIFY_ADMIN_PASSWORD=your-password
   DIFY_ADMIN_NAME="Lab Admin"
   ```

   Quote values that contain spaces. **Never commit** this file or print passwords.

4. Always open Dify as **`http://localhost:3847`** (not `127.0.0.1`) so Studio auth cookies match the API host.

## Install Vibium

```bash
cd tools/vibium
npm install
# First install downloads Chrome for Testing under ~/.cache/vibium/
```

System Chrome (`google-chrome` / `google-chrome-stable`) may already be present; Vibium still uses its managed Chrome for Testing by default.

## Capture (one command)

```bash
./scripts/screenshots/capture-lab.sh
```

Options:

```bash
./scripts/screenshots/capture-lab.sh --headed          # visible Chrome
CAPTURE_HEADED=1 ./scripts/screenshots/capture-lab.sh
./scripts/screenshots/capture-lab.sh --skip-login      # public pages only
SCREENSHOT_OUT=/tmp/shots ./scripts/screenshots/capture-lab.sh
```

Underlying Node entrypoint:

```bash
node tools/vibium/capture-lab.js --help
```

## Output locations

| Path | Purpose |
|------|---------|
| `artifacts/screenshots/*.png` | Full proof run + `manifest.json` (gitignored bulk) |
| `docs/lab-materials/screenshots/*.png` | Curated mirrors for worksheets (≤ ~750 KB each; regenerable) |
| `/opt/cursor/artifacts/screenshots/` | Operator-visible copies when that path exists |

Oversized proof shots (e.g. dense Open WebUI home) stay in `artifacts/screenshots/` and `/opt/cursor/...` but are **not** copied into `docs/lab-materials/` so the git tree stays lean. Override with `MAX_CURATED_BYTES`.

## Naming convention

```
proof-<letter>[-qualifier]-<surface>.png   # minimum proof set A–D
lab-m<module>-<step-slug>.png              # course module worksheets
```

### Minimum proof set

| ID | File stem | What it proves |
|----|-----------|----------------|
| A | `proof-A-dify-install-or-home` | Install finished / public landing |
| A2 | `proof-A2-dify-studio-home` | Studio home after login |
| B | `proof-B-dify-apps` | Apps list (Member Benefits FAQ) |
| C | `proof-C-dify-chatflow-canvas` | Chatflow editor for app `2615218e-…` |
| D | `proof-D-open-webui-home` | Open WebUI home (needs `LAB_MODE=full`) |

If Open WebUI is down (`LAB_MODE=dify`), proof-D is skipped and noted in `manifest.json`.

Module-oriented stems are listed in [lab-materials/SHOT_LIST.md](lab-materials/SHOT_LIST.md).

## Using shots in lab worksheets

1. Capture or regenerate with the script above.
2. Pick PNGs from `docs/lab-materials/screenshots/` (or copy from `artifacts/screenshots/`).
3. In worksheets, caption each image with **one** click instruction, e.g.  
   “Click **Apps** → open **Member Benefits FAQ** → **Orchestrate**.”
4. Prefer one job per figure; do not collage multiple UI steps into one screenshot.
5. Redact any accidental secrets (API keys, emails of real people) before publishing materials outside the lab VM.

## Verification checklist

```bash
./scripts/status.sh
./scripts/screenshots/capture-lab.sh
find artifacts/screenshots -name '*.png' -printf '%s %p\n'
# every PNG should have size > 0
file artifacts/screenshots/proof-*.png
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login stays on `/signin` | Fix `lab-creds.env`; quote `DIFY_ADMIN_NAME` if it has spaces |
| Empty / missing apps | Confirm sample app exists; re-run Studio bootstrap from prior lab setup |
| proof-D missing | `LAB_MODE=full` in `.env`, then `./scripts/up.sh` |
| Chrome fails in headless sandbox | Install Chrome deps (`libgbm1`, `libnss3`, …) or run with `CAPTURE_HEADED=1` under Xvfb/`DISPLAY` |
| Cookies fail with `127.0.0.1` | Switch all URLs to `localhost` |

## Architecture constraints (do not break)

- Dify CE **1.17.1**, OpenRouter keys-only, portal BFF `user=student:<id>` tenancy
- Default `LAB_MODE=dify`; Open WebUI optional
- No secrets in git
