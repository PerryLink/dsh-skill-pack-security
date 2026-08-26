// benchmark/run.mjs — deterministic poison-sample regression benchmark for
// dsh-skill-pack-security.
//
// Runs the real malicious-pattern checks from the provider's vet engine
// (installScriptsCheck / networkExfilCheck / obfuscationCheck) over the labeled
// dataset, one class at a time, then writes:
//   benchmark/results.json  — per-class confusion matrix + P/R/F1 + FPR + per-sample verdict
//   benchmark/RESULTS.md    — the human-readable report, including the gap vs OSV/Socket
//
// The scan engine is TypeScript source published under provider/src/vet; the runner
// imports the built provider/lib (tsc) so it runs on plain Node with zero new deps:
//   pnpm --dir provider run build   # emits provider/lib/vet/*.js
//   node benchmark/run.mjs
// Exit 0 on success; a missing build or malformed dataset exits non-zero.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { installScriptsCheck, networkExfilCheck, obfuscationCheck } from '../provider/lib/vet/checks.js'
import { parseManifest } from '../provider/lib/vet/manifest.js'
import { resolveVetConfig } from '../provider/lib/vet/config.js'
import { macroAverage, microAverage, metricsFor } from './metrics.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const datasetPath = join(here, 'dataset', 'poison.json')
const resultsJsonPath = join(here, 'results.json')
const resultsMdPath = join(here, 'RESULTS.md')

const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'))
const config = resolveVetConfig({})

const CHECKS = {
  'install-scripts': installScriptsCheck,
  'network-exfil': networkExfilCheck,
  obfuscation: obfuscationCheck,
}

/** Materialize a labeled sample into the scanned-file list the check consumes. */
function filesFor(sample, kind) {
  if (kind === 'install-scripts') {
    const files = [{ path: 'package.json', text: JSON.stringify(sample.packageJson) }]
    if (typeof sample.code === 'string') files.push({ path: 'install.js', text: sample.code })
    return files
  }
  return [{ path: 'payload.js', text: sample.code }]
}

/** Build the minimal CheckInputs the three checks read. */
function makeInputs(files) {
  const scanned = files.map(file => ({ path: file.path, text: file.text, binary: false, skipped: null }))
  return {
    files: scanned,
    manifest: parseManifest(scanned),
    lock: { kind: null, lockfile: null, lockfileVersion: '', entries: new Map(), hasIntegrity: false },
    github: null,
    npm: null,
    target: { raw: 'benchmark', kind: 'local-path', resolved: 'benchmark', ref: '' },
    config,
    lang: 'en',
    localHead: '',
    now: 0,
    scanner: undefined,
  }
}

/** Detected = the check's verdict is 'fail' (would block under the deny gate). */
function verdictOf(sample, kind) {
  const check = CHECKS[kind]
  if (check === undefined) throw new Error(`unknown check ${kind}`)
  return check(makeInputs(filesFor(sample, kind))).verdict
}

const perClass = dataset.classes.map(cls => {
  const outcomes = cls.samples.map(sample => {
    const verdict = verdictOf(sample, cls.check)
    return { id: sample.id, label: sample.label, predicted: verdict === 'fail', verdict }
  })
  return { id: cls.id, check: cls.check, metrics: metricsFor(outcomes), samples: outcomes }
})

const classMetrics = perClass.map(entry => entry.metrics)
const overall = {
  macro: macroAverage(classMetrics),
  micro: microAverage(classMetrics),
}

const results = {
  name: dataset.name,
  version: dataset.version,
  detector: dataset.detector,
  generatedBy: 'benchmark/run.mjs',
  perClass: perClass.map(entry => ({
    id: entry.id,
    check: entry.check,
    ...entry.metrics,
    samples: entry.samples,
  })),
  overall,
}

writeFileSync(resultsJsonPath, `${JSON.stringify(results, null, 2)}\n`)

// --- Markdown report ---------------------------------------------------------

const fmt = value => Number(value).toFixed(3)

const rows = perClass.map(entry => {
  const m = entry.metrics
  return `| ${entry.id} | ${m.tp} | ${m.fp} | ${m.fn} | ${m.tn} | ${fmt(m.recall)} | ${fmt(m.fpr)} | ${fmt(m.precision)} | ${fmt(m.f1)} |`
}).join('\n')

const misses = []
const falsePositives = []
for (const entry of perClass) {
  for (const sample of entry.samples) {
    if (sample.label && !sample.predicted) misses.push(`${entry.id}/${sample.id}`)
    if (!sample.label && sample.predicted) falsePositives.push(`${entry.id}/${sample.id}`)
  }
}

const md = `# dsh-skill-pack-security poison-sample benchmark results

> Deterministic malicious-pattern benchmark. Regenerate with
> \`pnpm --dir provider run build && node benchmark/run.mjs\` (zero new dependencies; the
> checks are the shipped \`provider/src/vet\` engine, run from the built \`provider/lib\`).

## Method

- **Detector**: the three malicious-pattern checks from \`provider/src/vet/checks.ts\` —
  \`installScriptsCheck\` (download+exec, obfuscated eval, credential/global-config touches),
  \`networkExfilCheck\` (exfil/receiver domains in script files), and
  \`obfuscationCheck\` (dynamic eval + base64/hex payloads).
- **Detection** = the check's \`verdict\` is \`fail\` (the state that blocks installation
  under the \`deny\` gate policy). A \`warn\` is not counted as a detection.
- **Labels**: \`label: true\` = a malicious sample of that class; \`label: false\` = a benign
  plugin file (no lifecycle scripts, harmless URL, or clean readable code).
- **Placeholders only**: every URL/domain is a harmless placeholder (\`example.com\`,
  \`webhook.site\`, \`pastebin.com\`, …) used purely as a detection signal; nothing is contacted.

## Per-class metrics

| Class | TP | FP | FN | TN | Detection rate (recall) | FPR | Precision | F1 |
|---|---|---|---|---|---|---|---|---|
${rows}

## Overall

| Aggregate | Precision | Recall | F1 |
|---|---|---|---|
| Macro (mean of the three classes) | ${fmt(overall.macro.precision)} | ${fmt(overall.macro.recall)} | ${fmt(overall.macro.f1)} |
| Micro (pooled TP/FP/FN across classes) | ${fmt(overall.micro.precision)} | ${fmt(overall.micro.recall)} | ${fmt(overall.micro.f1)} |

- Samples: ${perClass.reduce((sum, entry) => sum + entry.samples.length, 0)} total
  (${classMetrics.reduce((sum, m) => sum + m.positives, 0)} malicious,
   ${classMetrics.reduce((sum, m) => sum + m.negatives, 0)} benign).
- Overall false-positive rate (micro): ${fmt(overall.micro.fpr)}.

## Per-sample notes

- Missed malicious samples (false negatives): ${misses.length === 0 ? 'none' : misses.join(', ')}.
- Flagged benign samples (false positives): ${falsePositives.length === 0 ? 'none' : falsePositives.join(', ')}.

## Gap vs OSV / Socket (honest)

This benchmark measures **only** the self-built static heuristics. OSV and Socket are
database/telemetry-backed: OSV matches lockfile versions against published advisories, and
Socket layers maintainer/adversary telemetry (install-script provenance, package age,
typosquat scores) on top of static analysis. The gap, in both directions:

- **Coverage**: the self-built checks catch the *shapes* they were written for (download+exec,
  decoded-then-executed payloads, credential/global touches, exfil domains, eval+base64). They
  have **no vulnerability database**, so a known CVE in a pinned dependency is invisible to
  \`install-scripts\`/\`network-exfil\`/\`obfuscation\` — that evidence belongs to the
  \`sbom\` check, which delegates to \`osv-scanner\`/\`npm audit\` when those CLIs are present
  (not exercised here, which needs a real on-disk project).
- **Precision**: the heuristics are pattern-based, so renamed or lightly re-encoded payloads
  evade them, while Socket's telemetry can also flag *reputational* risk the heuristics cannot
  see. The FPR reported here is only the pattern-level false-positive rate on a curated benign
  set, not a whole-ecosystem FPR.

## Known limitations (honest)

- **Shape, not intent.** These checks fire on syntactic indicators; they do not execute
  anything or model adversarial intent.
- **Single-file heuristic view.** The dataset feeds one file (or a \`package.json\`) per
  sample; the real engine walks a whole package, and cross-file payloads are out of scope here.
- **Telegram/Discord webhook domains are dead entries.** \`EXFIL_DOMAINS\` lists
  \`api.telegram.org/bot\` and \`discord.com/api/webhooks\` (host + path), but the check
  compares them against the bare URL host, so those two receiver domains never match
  (\`ne-pos-03\`, \`ne-pos-04\`).
- **Obfuscation base64 must be inline.** The base64-blob regex matches a literal directly
  inside \`atob()\`/\`Buffer.from()\` or a 100+ char standalone blob, so
  \`const s='<short-base64>'; eval(atob(s))\` is missed (\`ob-pos-01\`).
- **No evasion corpus.** Obfuscation samples use plain \`atob\`/base64; re-encoded,
  split, or novel obfuscation is not in this regression set.
`;

writeFileSync(resultsMdPath, md)

// --- stdout summary ----------------------------------------------------------

console.log(`dsh-skill-pack-security poison benchmark: ${perClass.length} classes, ${results.perClass.reduce((s, t) => s + t.total, 0)} samples`)
for (const entry of perClass) {
  const m = entry.metrics
  console.log(`  ${entry.id.padEnd(16)} detection=${fmt(m.recall)} FPR=${fmt(m.fpr)} P=${fmt(m.precision)} F1=${fmt(m.f1)} (TP ${m.tp}, FP ${m.fp}, FN ${m.fn})`)
}
console.log(`  macro F1=${fmt(overall.macro.f1)}  micro F1=${fmt(overall.micro.f1)}  micro FPR=${fmt(overall.micro.fpr)}`)
console.log(`wrote ${resultsJsonPath} and ${resultsMdPath}`)
