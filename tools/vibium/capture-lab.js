#!/usr/bin/env node
/**
 * Capture lab proof + curated worksheet screenshots via Vibium (Chrome).
 *
 * Usage (prefer the shell wrapper):
 *   ./scripts/screenshots/capture-lab.sh
 *   node tools/vibium/capture-lab.js [--headed] [--skip-login] [--out DIR]
 *
 * Credentials: gitignored lab-creds.env at repo root (never printed).
 * URLs use localhost (not 127.0.0.1) so Dify Studio cookies stick.
 */

'use strict'

const fs = require('fs')
const path = require('path')
const { browser } = require('vibium/sync')

const REPO_ROOT = path.resolve(__dirname, '../..')
const DEFAULT_OUT = path.join(REPO_ROOT, 'artifacts/screenshots')
const CURATED_OUT = path.join(REPO_ROOT, 'docs/lab-materials/screenshots')
const OPT_CURSOR_OUT = '/opt/cursor/artifacts/screenshots'
const CREDS_PATH = path.join(REPO_ROOT, 'lab-creds.env')

const DIFY_BASE = process.env.DIFY_BASE_URL || 'http://localhost:3847'
const WEBUI_BASE = process.env.WEBUI_BASE_URL || 'http://localhost:3848'
const APP_ID =
  process.env.DIFY_SAMPLE_APP_ID || '2615218e-4cd3-4f56-bad4-866a62c93627'

const VIEWPORT = { width: 1440, height: 900 }

function parseArgs(argv) {
  const opts = {
    headed: false,
    skipLogin: false,
    out: DEFAULT_OUT,
    copyCurated: true,
    copyOptCursor: true,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--headed') opts.headed = true
    else if (a === '--skip-login') opts.skipLogin = true
    else if (a === '--out') opts.out = path.resolve(argv[++i])
    else if (a === '--no-curated') opts.copyCurated = false
    else if (a === '--no-opt-cursor') opts.copyOptCursor = false
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: node capture-lab.js [options]
  --headed          Show Chrome window (default: headless)
  --skip-login      Skip Studio login (public pages only)
  --out DIR         Output directory (default: artifacts/screenshots)
  --no-curated      Do not mirror curated shots to docs/lab-materials/screenshots
  --no-opt-cursor   Do not copy proof shots to /opt/cursor/artifacts/screenshots`)
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${a}`)
    }
  }
  return opts
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const env = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1)
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    env[k] = v
  }
  return env
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function httpOk(url) {
  try {
    const res = require('child_process').execFileSync(
      'curl',
      ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-L', '--max-time', '5', url],
      { encoding: 'utf8' }
    )
    const code = Number(res.trim())
    return code >= 200 && code < 500
  } catch {
    return false
  }
}

function savePng(page, destPath, label) {
  ensureDir(path.dirname(destPath))
  const png = page.screenshot()
  if (!png || png.length === 0) {
    throw new Error(`Empty screenshot for ${label}`)
  }
  fs.writeFileSync(destPath, png)
  const st = fs.statSync(destPath)
  if (st.size <= 0) throw new Error(`Zero-byte PNG for ${label}`)
  console.log(`OK  ${label}  ${destPath}  (${st.size} bytes)`)
  return destPath
}

function waitSettle(page, ms = 1500) {
  page.wait(ms)
}

function loginStudio(page, creds) {
  const email = creds.DIFY_ADMIN_EMAIL
  const password = creds.DIFY_ADMIN_PASSWORD
  if (!email || !password) {
    throw new Error(
      'Missing DIFY_ADMIN_EMAIL / DIFY_ADMIN_PASSWORD in lab-creds.env'
    )
  }
  page.go(`${DIFY_BASE}/signin`)
  page.waitForLoad('complete')
  waitSettle(page, 1500)
  page.find('input[name=email]', { timeout: 15000 }).fill(email)
  page.find('input[name=password]', { timeout: 15000 }).fill(password)
  page.find({ role: 'button', text: 'Sign in' }, { timeout: 10000 }).click()
  // Wait until we leave the sign-in route (cookie session established).
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    waitSettle(page, 500)
    const url = page.url()
    if (!url.includes('/signin') && !url.includes('/install')) break
  }
  waitSettle(page, 1500)
  const url = page.url()
  if (url.includes('/signin')) {
    throw new Error('Login did not leave /signin — check lab-creds.env')
  }
  console.log('Logged into Dify Studio')
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  ensureDir(opts.out)

  let vibiumVersion = '26.8.21'
  try {
    const pkgPath = require.resolve('vibium')
    const pkgJson = path.join(path.dirname(pkgPath), '..', 'package.json')
    if (fs.existsSync(pkgJson)) {
      vibiumVersion = JSON.parse(fs.readFileSync(pkgJson, 'utf8')).version
    }
  } catch {
    /* keep default pin */
  }

  const manifest = {
    tool: 'vibium',
    vibiumVersion,
    engine: 'chrome',
    headless: !opts.headed,
    difyBase: DIFY_BASE,
    webuiBase: WEBUI_BASE,
    appId: APP_ID,
    capturedAt: new Date().toISOString(),
    shots: [],
  }

  const creds = parseEnvFile(CREDS_PATH)
  const difyUp = httpOk(DIFY_BASE)
  const webuiUp = httpOk(WEBUI_BASE)
  console.log(`Dify ${DIFY_BASE}: ${difyUp ? 'up' : 'DOWN'}`)
  console.log(`Open WebUI ${WEBUI_BASE}: ${webuiUp ? 'up' : 'down/skip'}`)

  if (!difyUp) {
    throw new Error('Dify is not reachable — run ./scripts/up.sh and retry')
  }

  const bro = browser.start({ headless: !opts.headed, engine: 'chrome' })
  const page = bro.page()
  page.setViewport(VIEWPORT)

  const shot = (name, label) => {
    const dest = path.join(opts.out, `${name}.png`)
    savePng(page, dest, label)
    manifest.shots.push({ name, label, path: dest, url: page.url() })
    return dest
  }

  try {
    // A) Landing / install-finished or studio home (pre-login public surface)
    page.go(`${DIFY_BASE}/install`)
    page.waitForLoad('complete')
    waitSettle(page, 1500)
    shot('proof-A-dify-install-or-home', 'A Dify install/landing')

    // Sign-in page (useful for lab worksheets)
    page.go(`${DIFY_BASE}/signin`)
    page.waitForLoad('complete')
    waitSettle(page, 1200)
    shot('lab-m0-dify-signin', 'M0 Sign-in screen')

    if (!opts.skipLogin) {
      if (!fs.existsSync(CREDS_PATH)) {
        console.warn(
          'WARN lab-creds.env missing — skipping authenticated Studio shots'
        )
      } else {
        loginStudio(page, creds)

        // Studio home after login
        page.go(`${DIFY_BASE}/`)
        page.waitForLoad('complete')
        waitSettle(page, 2000)
        shot('proof-A2-dify-studio-home', 'A2 Studio home (logged in)')

        // B) Apps list
        page.go(`${DIFY_BASE}/apps`)
        page.waitForLoad('complete')
        waitSettle(page, 2500)
        shot('proof-B-dify-apps', 'B Apps list / Member Benefits FAQ')

        // C) Chatflow canvas
        page.go(`${DIFY_BASE}/app/${APP_ID}/workflow`)
        page.waitForLoad('complete')
        waitSettle(page, 3500)
        shot(
          'proof-C-dify-chatflow-canvas',
          'C Chatflow canvas (Member Benefits FAQ)'
        )

        // Module-oriented extras when reachable (Dify 1.17: Integrations → Model Provider)
        try {
          page.go(`${DIFY_BASE}/integrations/model-provider`)
          page.waitForLoad('complete')
          waitSettle(page, 2500)
          const bodyText = String(
            page.evaluate(
              'document.body ? document.body.innerText.slice(0, 80) : ""'
            ) || ''
          )
          if (/404|could not be found/i.test(bodyText)) {
            console.warn('WARN model-provider returned 404 — skipping curated bad shot')
          } else {
            shot('lab-m1-model-providers', 'M1 Model providers (Integrations)')
          }
        } catch (e) {
          console.warn('WARN model-provider shot skipped:', e.message)
        }
      }
    }

    // D) Open WebUI (optional)
    if (webuiUp) {
      page.go(`${WEBUI_BASE}/`)
      page.waitForLoad('complete')
      waitSettle(page, 2000)
      shot('proof-D-open-webui-home', 'D Open WebUI home')
    } else {
      console.log(
        'NOTE Open WebUI not up — LAB_MODE may be dify-only; proof-D skipped'
      )
      manifest.notes = manifest.notes || []
      manifest.notes.push(
        'Open WebUI unreachable; set LAB_MODE=full and ./scripts/up.sh for proof-D'
      )
    }
  } finally {
    try {
      bro.stop()
    } catch {
      /* ignore */
    }
  }

  // Curated mirrors for worksheets (skip oversized binaries in-repo)
  const curatedNames = [
    'proof-A-dify-install-or-home',
    'proof-A2-dify-studio-home',
    'proof-B-dify-apps',
    'proof-C-dify-chatflow-canvas',
    'proof-D-open-webui-home',
    'lab-m0-dify-signin',
    'lab-m1-model-providers',
  ]
  const MAX_CURATED_BYTES = Number(process.env.MAX_CURATED_BYTES || 750000)
  if (opts.copyCurated) {
    ensureDir(CURATED_OUT)
    for (const name of curatedNames) {
      const src = path.join(opts.out, `${name}.png`)
      if (!fs.existsSync(src)) continue
      const size = fs.statSync(src).size
      if (size > MAX_CURATED_BYTES) {
        console.log(
          `SKIP curated (too large for git, ${size} bytes > ${MAX_CURATED_BYTES}): ${name}.png — kept in artifacts/`
        )
        continue
      }
      const dest = path.join(CURATED_OUT, `${name}.png`)
      copyFile(src, dest)
      console.log(`CURATED  ${dest}`)
    }
  }

  // Operator-visible copies
  if (opts.copyOptCursor && fs.existsSync('/opt/cursor/artifacts')) {
    ensureDir(OPT_CURSOR_OUT)
    for (const name of curatedNames) {
      const src = path.join(opts.out, `${name}.png`)
      if (fs.existsSync(src)) {
        copyFile(src, path.join(OPT_CURSOR_OUT, `${name}.png`))
      }
    }
    console.log(`Copied proof set to ${OPT_CURSOR_OUT}`)
  }

  const manifestPath = path.join(opts.out, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`Manifest ${manifestPath}`)
  console.log(`Captured ${manifest.shots.length} screenshots with Vibium+Chrome`)
}

try {
  main()
} catch (err) {
  console.error('capture-lab failed:', err.message || err)
  process.exit(1)
}
