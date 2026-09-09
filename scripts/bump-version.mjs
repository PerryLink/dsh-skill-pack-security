#!/usr/bin/env node
/**
 * Single-command release version bump for dsh-skill-pack-security.
 *
 *   node scripts/bump-version.mjs 2.2.12   # write every version carrier
 *   node scripts/bump-version.mjs --check  # assert every carrier == VERSION
 *
 * The single source of truth is the repo-root `VERSION` file (the Publish
 * workflow already gates the release tag on it: `tag="v$(cat VERSION)"`).
 * This script derives every mirror from that one input so a release cannot
 * leave a carrier behind — the 2.2.11 release updated provider/package.json
 * and the runtime user-agent but left VERSION, the 16 SKILL.md metadata and
 * the five README `vet.userAgent` rows at 2.2.10, which failed the Publish
 * workflow's verify job with `AssertionError: '2.2.11' !== '2.2.10'` and
 * shipped no npm version at all.
 *
 * Carriers written (all from the same input):
 *   1. VERSION
 *   2. package.json                        version
 *   3. provider/package.json               version
 *   4. skills/<name>/SKILL.md + skills-en/<name>/SKILL.md  metadata.version (16 files)
 *   5. provider/src/index.ts, provider/src/vet/config.ts   user-agent default
 *   6. README.md + README.{zh,es,pt,hi}.md   vet.userAgent table rows
 *
 * NOT a carrier: the root `dependencies["@perrylink/dsh-skill-pack-security-provider"]`
 * pin. pnpm 11 runs a dependency-status check before every `pnpm run`, and the
 * root lockfile resolves that dependency from the registry — so pinning a
 * version that is not published yet breaks `pnpm run check:readmes` with
 * ERR_PNPM_NO_MATCHING_VERSION. The pin is refreshed after the npm publish
 * (docs/release-checklist.md step 10):
 *   pnpm add @perrylink/dsh-skill-pack-security-provider@<version>
 *
 * Writes are BOM-less UTF-8 (the official skill parser drops a SKILL.md whose
 * first bytes are not exactly `---`). Run with --check in CI/verify.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SKILL_ROOTS = ['skills', 'skills-en']
const READMES = ['README.md', 'README.zh.md', 'README.es.md', 'README.pt.md', 'README.hi.md']
const PROVIDER = '@perrylink/dsh-skill-pack-security-provider'
const UA_PREFIX = 'dsh-skill-pack-security/'
const UA_FILES = [
  'provider/src/index.ts',
  'provider/src/vet/config.ts',
  ...READMES,
]

const SEMVER = /^\d+\.\d+\.\d+$/

const read = rel => readFileSync(path.join(ROOT, rel), 'utf8')
const write = (rel, text) => writeFileSync(path.join(ROOT, rel), text, 'utf8')

/** Every SKILL.md path, in a stable order; fails loud when one is missing. */
function skillFiles() {
  const files = []
  for (const root of SKILL_ROOTS) {
    const dir = path.join(ROOT, root)
    if (!existsSync(dir)) throw new Error(`${root}/ is missing`)
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue
      const rel = `${root}/${entry.name}/SKILL.md`
      if (!existsSync(path.join(ROOT, rel))) throw new Error(`${rel} is missing`)
      files.push(rel)
    }
  }
  return files
}

/**
 * Replace the first match of `pattern` and require that it matched, so a
 * renamed field can never turn a bump into a silent no-op.
 */
function replaceOne(rel, text, pattern, replacement) {
  const probe = pattern.global ? new RegExp(pattern.source, pattern.flags.replace('g', '')) : pattern
  if (!probe.test(text)) throw new Error(`${rel}: no match for ${String(pattern)} (carrier moved or renamed?)`)
  return text.replace(pattern, replacement)
}

/** Desired content of every carrier for `version`; throws when a carrier is absent. */
function carriersFor(version) {
  const out = new Map()
  out.set('VERSION', `${version}\n`)

  let rootPkg = read('package.json')
  rootPkg = replaceOne('package.json', rootPkg, /("version":\s*")[^"]+(")/, `$1${version}$2`)
  out.set('package.json', rootPkg)

  const providerPkg = read('provider/package.json')
  out.set('provider/package.json', replaceOne('provider/package.json', providerPkg, /("version":\s*")[^"]+(")/, `$1${version}$2`))

  for (const rel of skillFiles()) {
    const text = read(rel)
    const matches = text.match(/^(\s*version:\s*['"]?)\d+\.\d+\.\d+(['"]?\s*)$/gm) ?? []
    if (matches.length !== 1) throw new Error(`${rel}: expected exactly one metadata version line, found ${matches.length}`)
    out.set(rel, replaceOne(rel, text, /^(\s*version:\s*['"]?)\d+\.\d+\.\d+(['"]?\s*)$/m, `$1${version}$2`))
  }

  for (const rel of UA_FILES) {
    const text = read(rel)
    const pattern = new RegExp(`(${UA_PREFIX.replaceAll('/', '\\/')})\\d+\\.\\d+\\.\\d+`, 'g')
    const found = text.match(pattern) ?? []
    if (found.length === 0) throw new Error(`${rel}: no ${UA_PREFIX}<version> carrier found`)
    out.set(rel, text.replace(pattern, `$1${version}`))
  }
  return out
}

const argv = process.argv.slice(2)
const check = argv.includes('--check')
const target = argv.find(arg => arg !== '--check')

if (check) {
  const expected = read('VERSION').trim()
  if (!SEMVER.test(expected)) {
    console.error(`VERSION is not a plain x.y.z version: ${JSON.stringify(expected)}`)
    process.exit(1)
  }
  let drift = 0
  let carriers
  try {
    carriers = carriersFor(expected)
  } catch (error) {
    console.error(`version-carriers: BROKEN (${error instanceof Error ? error.message : String(error)})`)
    process.exit(1)
  }
  for (const [rel, want] of carriers) {
    const have = read(rel)
    if (have === want) continue
    drift += 1
    const wantLine = want.split('\n').find(line => line.includes(expected))?.trim()
    const haveLine = have.split('\n').find(line => new RegExp(`${UA_PREFIX}\\d`).test(line))?.trim()
      ?? have.split('\n').find(line => /"version"/.test(line))?.trim()
      ?? have.split('\n').find(line => /version:/.test(line))?.trim()
    console.error(`DRIFT ${rel}`)
    if (haveLine !== undefined) console.error(`  have: ${haveLine.slice(0, 200)}`)
    if (wantLine !== undefined) console.error(`  want: ${wantLine.slice(0, 200)}`)
  }
  if (drift > 0) {
    console.error(`\nversion carriers drifted: ${drift} file(s) do not carry VERSION ${expected}`)
    console.error('fix: node scripts/bump-version.mjs ' + expected)
    process.exit(1)
  }
  console.log(`version-carriers: OK (VERSION ${expected} carried by ${carriers.size} files)`)
  process.exit(0)
}

if (target === undefined) {
  console.error('usage: node scripts/bump-version.mjs <x.y.z> | --check')
  process.exit(2)
}
if (!SEMVER.test(target)) {
  console.error(`not a plain x.y.z version: ${JSON.stringify(target)}`)
  process.exit(2)
}

let changed = 0
const carriers = carriersFor(target)
for (const [rel, want] of carriers) {
  if (read(rel) === want) {
    console.log(`= ${rel} (already ${target})`)
    continue
  }
  write(rel, want)
  changed += 1
  console.log(`~ ${rel}`)
}
console.log(`\nbumped ${changed}/${carriers.size} carriers to ${target}`)
console.log('next: update CHANGELOG.md, then run the gate chain and verify/verify-skill-pack.mts')
