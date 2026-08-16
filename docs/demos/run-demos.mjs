/**
 * plugin_vet demo runner: scans three real repositories (one compliant, one
 * without a license, one with a postinstall) plus a deny-gate replay, and
 * writes per-demo markdown, JSON, and a self-contained HTML card page that is
 * screenshotted with headless Chrome/Edge for the README.
 *
 * Run: <harness>/node_modules/.bin/tsx docs/demos/run-demos.mjs
 * Network required (GitHub codeload + api.github.com). Zero dependencies:
 * the engine, the markdown-to-HTML mini renderer, and this runner all use
 * Node built-ins only.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVet } from '../../provider/src/vet/engine.ts'
import { resolveVetConfig } from '../../provider/src/vet/config.ts'
import { renderReport } from '../../provider/src/vet/report.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = here
const config = resolveVetConfig({})

const DEMOS = [
  {
    id: 'demo-1-compliant',
    title: 'Compliant plugin · PASS',
    subtitle: 'PerryLink/dsh-skill-pack-security — license, SBOM, pinned actions all green',
    args: { target: 'PerryLink/dsh-skill-pack-security' },
  },
  {
    id: 'demo-2-no-license',
    title: 'No license · FAIL + gate warning',
    subtitle: 'ali-meoo/meoo-cli — no LICENSE file, no license field (warn policy)',
    args: { target: 'ali-meoo/meoo-cli' },
  },
  {
    id: 'demo-3-postinstall',
    title: 'Postinstall script · WARN (convention)',
    subtitle: 'frida/frida-node — install script downloads a prebuilt native binary (ecosystem convention)',
    args: { target: 'frida/frida-node' },
  },
  {
    id: 'demo-4-deny',
    title: 'Deny gate · BLOCKED',
    subtitle: 'ali-meoo/meoo-cli re-run under gate.policy=deny',
    args: { target: 'ali-meoo/meoo-cli', policy: 'deny' },
  },
]

/** Minimal markdown→HTML for the exact subset renderReport emits. */
function miniMarkdown(text) {
  const lines = []
  let inFence = false
  const fenceLines = []
  for (const raw of text.split('\n')) {
    if (raw.trim().startsWith('```')) {
      if (inFence) {
        lines.push(`<pre>${escapeHtml(fenceLines.join('\n'))}</pre>`)
        fenceLines.length = 0
      }
      inFence = !inFence
      continue
    }
    if (inFence) {
      fenceLines.push(raw)
      continue
    }
    let line = escapeHtml(raw)
    line = line.replace(/`([^`]+)`/g, '<code>$1</code>')
    line = line.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    if (/^##\s/.test(line)) lines.push(`<h4>${line.slice(3)}</h4>`)
    else if (/^\s*-\s/.test(line)) lines.push(`<div class="li">${line.replace(/^\s*-\s/, '')}</div>`)
    else if (line.trim() === '') lines.push('<div class="gap"></div>')
    else lines.push(`<div>${line}</div>`)
  }
  return lines.join('\n')
}

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

const CARD_CSS = `
body { font-family: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #1a1d23; color: #d7dbe0; margin: 24px; }
.card { max-width: 780px; background: #20242c; border: 1px solid #323844; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,.35); }
.head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #262b35; border-bottom: 1px solid #323844; }
.head .tool { font-weight: 600; color: #8fb3ff; }
.pill { margin-left: auto; font-weight: 700; font-size: 12px; padding: 3px 10px; border-radius: 999px; letter-spacing: .4px; }
.pill.pass { background: #123a22; color: #4ade80; border: 1px solid #1f6e3e; }
.pill.warn { background: #3a2f10; color: #facc15; border: 1px solid #6e5a1f; }
.pill.fail { background: #3a1212; color: #f87171; border: 1px solid #6e1f1f; }
.body { padding: 14px 18px; font-size: 13.5px; line-height: 1.65; }
.body h4 { margin: 12px 0 6px; font-size: 15px; color: #eef2f7; }
.body .li { margin: 3px 0 3px 14px; }
.body .gap { height: 8px; }
.body code { background: #2d3340; padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, Consolas, monospace; font-size: 12.5px; }
.body pre { background: #161a20; border: 1px solid #2c323d; border-radius: 6px; padding: 10px; overflow-x: auto; font-family: ui-monospace, Consolas, monospace; font-size: 12.5px; }
.gate { margin: 10px 0; padding: 10px 12px; border-radius: 8px; border: 1px solid; }
.gate.deny { background: #2a1517; border-color: #7f1d1d; color: #fca5a5; }
.gate.warn { background: #2a2313; border-color: #713f12; color: #fde68a; }
.demo-title { color: #9aa4b2; font-size: 12px; margin: 26px 0 8px; }
`

function cardHtml(verdictClass, titleText, subtitle, bodyText, gateClass, gateHtml) {
  return `<div class="demo-title">${escapeHtml(subtitle)}</div>
<div class="card">
  <div class="head"><span class="tool">plugin_vet</span> ${escapeHtml(titleText)} <span class="pill ${verdictClass}">${verdictClass.toUpperCase()}</span></div>
  <div class="body">${gateHtml}${miniMarkdown(bodyText)}</div>
</div>`
}

async function main() {
  const pages = []
  for (const demo of DEMOS) {
    console.log(`running ${demo.id}: ${demo.args.target} policy=${demo.args.policy ?? 'inherit'}`)
    let report
    try {
      report = await runVet(demo.args, config, 'en', new AbortController().signal)
    } catch (error) {
      console.error(`  FAILED: ${error instanceof Error ? error.message : String(error)}`)
      process.exitCode = 1
      continue
    }
    const markdown = renderReport(report, 'en')
    const gateClass = report.gate.blocked ? 'deny' : report.gate.applied ? 'warn' : 'none'
    const gateHtml = gateClass === 'none' ? '' : `<div class="gate ${gateClass}">${escapeHtml(gateClass === 'deny' ? 'Gate DENY — installation blocked by policy' : 'Gate warning — installation strongly discouraged')}</div>`
    const verdictClass = report.verdict === 'pass' ? 'pass' : report.verdict === 'warn' ? 'warn' : 'fail'
    await writeFile(join(outDir, `${demo.id}.md`), `# plugin_vet ${demo.args.target}\n\n${markdown}\n`, 'utf8')
    await writeFile(join(outDir, `${demo.id}.json`), JSON.stringify(report, null, 2), 'utf8')
    await writeFile(join(outDir, `${demo.id}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>${cardHtml(verdictClass, demo.args.target, demo.subtitle, markdown, gateClass, gateHtml)}</body></html>`, 'utf8')
    pages.push({ id: demo.id, verdictClass, title: demo.args.target, subtitle: demo.subtitle, markdown, gateClass, gateHtml })
    console.log(`  verdict=${report.verdict} overall=${report.scores.overall} files=${report.budget.filesScanned} -> ${demo.id}.md/.json/.html`)
  }
  const body = pages.map(page => cardHtml(page.verdictClass, page.title, page.subtitle, page.markdown, page.gateClass, page.gateHtml)).join('\n')
  await writeFile(join(outDir, 'cards.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>${body}</body></html>`, 'utf8')
  console.log('wrote cards.html; screenshot with:')
  console.log('  chrome --headless=new --disable-gpu --screenshot=docs/demos/<id>.png --window-size=860,1100 file:///.../docs/demos/<id>.html')
}

await main()
