/**
 * Headless verification for dsh-skill-pack-security.
 *
 * Drives the OFFICIAL @deepseek-ai/dsh-skill-filesystem parser and the REAL
 * `skill` tool from @deepseek-ai/dsh-tool-skill (both imported from the local
 * deepseek-harness checkout) against this pack:
 *
 *   1. layout + kebab-case names + official/community name-conflict check
 *   2. registry discovery of all 5 skills through the official provider
 *   3. full-definition load via ctx.skills.get() (body, whenToUse, invocation,
 *      metadata, catalog-safe description length)
 *   4. the real `skill` tool via ctx.tools.execute() for all 5 skills
 *   5. the real model-facing session catalog (name + description only;
 *      whenToUse must NOT appear)
 *   6. 13 bad-frontmatter fixtures exercising the official fail-closed rules
 *   7. flat-file discovery, nested-dir exclusion, dir/frontmatter name mismatch
 *   8. the optional provider plugin (mount → list → dispose)
 *
 * Run: <checkout>\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
 * Requires a local deepseek-harness checkout; the script resolves it relative
 * to its own location (Project/Plugins/<pack>/verify -> ../../../../).
 */

import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, realpath, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Resolve the harness checkout and import its official sources via file URLs
// (the pack lives outside the pnpm workspace, so bare specifiers would fail).
// ---------------------------------------------------------------------------
const HARNESS = new URL('../../../../', import.meta.url)
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
const { CallId } = await harnessImport('packages/llm/llm/src/index.ts')

// ---------------------------------------------------------------------------
const PACK_DIR = fileURLToPath(new URL('..', import.meta.url))
const SKILLS_ROOT = join(PACK_DIR, 'skills')
const SKILL_NAMES = ['dependency-audit', 'prompt-injection-review', 'secret-scan', 'security-audit', 'supply-chain-review']

const OFFICIAL_SKILLS = [
  'dsh-archive-agent-notes', 'dsh-code-review', 'dsh-doc-site-sync', 'dsh-doc-standards',
  'dsh-find-simplifications', 'dsh-merging-stacked-prs', 'dsh-plugin-guide',
  'dsh-pre-push-checks', 'dsh-prose-standard', 'dsh-translate-docs', 'dsh-trim-cot-leakage',
  'record-browser-gif',
]
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

async function main(): Promise<void> {
  const steps: Array<() => Promise<void>> = []

  // --- 1. layout, kebab-case, name conflicts ---------------------------------
  steps.push(check('layout: exactly 5 directory bundles, no stray flat skills', async () => {
    const entries = await readdir(SKILLS_ROOT, { withFileTypes: true })
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name)
    const files = entries.filter(e => !e.isDirectory()).map(e => e.name)
    assert.deepEqual(dirs.slice().sort(), [...SKILL_NAMES].sort())
    assert.deepEqual(files, [], 'skills root must contain only skill directories')
    for (const name of SKILL_NAMES) {
      assert.ok(isSkillName(name), `${name} must be kebab-case`)
      const skillMd = join(SKILLS_ROOT, name, 'SKILL.md')
      const raw = await readFile(skillMd, 'utf8')
      const lines = raw.split('\n').length
      assert.ok(lines <= 300, `${name}/SKILL.md has ${lines} lines (> 300)`)
      const nameMatch = /^name:\s*([a-z0-9-]+)\s*$/m.exec(raw)
      assert.equal(nameMatch?.[1], name, `${name}/SKILL.md frontmatter name must match dir name`)
      const refs = await readdir(join(SKILLS_ROOT, name, 'references')).catch(() => [])
      assert.ok(refs.length >= 1, `${name} must have at least one references file`)
      assert.match(raw, /references\//, `${name}/SKILL.md must point into references/`)
    }
  }))

  steps.push(check('name conflicts: no overlap with official/community skill names', () => {
    for (const name of SKILL_NAMES) {
      assert.ok(!OFFICIAL_SKILLS.includes(name), `${name} collides with an official skill`)
      assert.ok(!COMMUNITY_SKILLS.includes(name), `${name} collides with a community skill-pack name`)
    }
  }))

  // --- 2/3. official provider discovery + full loads -------------------------
  const ctx = new Context()
  await ctx.plugin(SkillRegistry)
  await ctx.plugin(skillFilesystem, {
    includeDefaultRoots: false,
    customSkillDirs: [SKILLS_ROOT],
    watch: false,
    providerName: 'verify-pack',
  })

  steps.push(check('registry discovery: all 5 skills found via the official provider', async () => {
    const listed = await ctx.skills.list()
    assert.deepEqual(listed.map(s => s.name), [...SKILL_NAMES].sort())
    for (const summary of listed) {
      assert.equal(summary.provider, 'verify-pack')
      assert.equal(summary.source, 'custom')
      assert.deepEqual(summary.invocation, { modelInvocable: true, userInvocable: true })
      assert.ok(summary.whenToUse && summary.whenToUse.length > 20, `${summary.name} whenToUse missing`)
      assert.ok(summary.description.length <= catalogMax, `${summary.name} description would truncate in the catalog`)
    }
  }))

  steps.push(check('full load: ctx.skills.get() returns bodies with metadata', async () => {
    for (const name of SKILL_NAMES) {
      const def = await ctx.skills.get(name)
      assert.ok(def, `${name} must load`)
      assert.equal(def.name, name)
      assert.ok(def.content.length > 500, `${name} body too small`)
      assert.deepEqual(def.metadata, { pack: 'dsh-skill-pack-security', version: '1.0.0' }, `${name} metadata`)
      assert.ok(!normalized(def.description).includes(normalized(def.whenToUse!)), `${name}: description must not duplicate whenToUse`)
    }
  }))

  // --- 4/5. the real `skill` tool + real session catalog ---------------------
  const toolCtx = new Context()
  await toolCtx.plugin(SystemPrompt)
  await toolCtx.plugin(ToolRuntime)
  await toolCtx.plugin(AgentRegistry)
  await toolCtx.plugin(SkillRegistry)
  await toolCtx.plugin(skillFilesystem, {
    includeDefaultRoots: false,
    customSkillDirs: [SKILLS_ROOT],
    watch: false,
    providerName: 'verify-tool',
  })
  await toolCtx.plugin(toolSkill)
  const agent = agentForCwd(PACK_DIR)
  const signal = new AbortController().signal

  steps.push(check('skill tool: ctx.tools.execute loads all 5 skills', async () => {
    assert.ok(toolCtx.tools.get('skill', agent), 'skill tool must be registered')
    for (const name of SKILL_NAMES) {
      const result = await toolCtx.tools.execute({
        signal,
        callId: CallId(`verify-${name}`),
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
  }))

  steps.push(check('skill tool: unknown and invalid names are rejected', async () => {
    const unknown = await toolCtx.tools.execute({
      signal, callId: CallId('verify-unknown'), name: 'skill', arguments: { name: 'does-not-exist' }, agent,
    })
    assert.equal(unknown.isError, true)
    const invalid = await toolCtx.tools.execute({
      signal, callId: CallId('verify-invalid'), name: 'skill', arguments: { name: 'Bad_Name' }, agent,
    })
    assert.equal(invalid.isError, true)
  }))

  steps.push(check('session catalog: name + description only, whenToUse excluded', async () => {
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
  steps.push(check('provider plugin: mounts the pack via ctx.effect, disposes cleanly', async () => {
    // The pack sits outside the pnpm workspace, so give the plugin's bare
    // imports a resolution shim (junctions into the harness packages).
    const shimBase = join(PACK_DIR, 'node_modules', '@deepseek-ai')
    await mkdir(shimBase, { recursive: true })
    const resolverBase = join(fileURLToPath(HARNESS), 'packages/skill/skill-filesystem/node_modules/@deepseek-ai')
    const links: Array<[string, string]> = [
      ['dsh-skill-filesystem', join(fileURLToPath(HARNESS), 'packages/skill/skill-filesystem')],
      ['schemastery', await realpath(join(resolverBase, 'schemastery'))],
    ]
    for (const [pkg, target] of links) {
      const dest = join(shimBase, pkg)
      try {
        await symlink(target, dest, 'junction')
      } catch {
        // already present from a previous run
      }
    }
    try {
      const providerPlugin = await import(new URL('../provider/src/index.ts', import.meta.url).href)
      assert.equal(providerPlugin.name, 'skill-pack-security')
      assert.deepEqual(providerPlugin.inject, ['skills'])

      const pctx = new Context()
      await pctx.plugin(SkillRegistry)
      const fiber = await pctx.plugin(providerPlugin)
      const listed = await pctx.skills.list()
      assert.deepEqual(listed.map(s => s.name), [...SKILL_NAMES].sort())
      for (const s of listed) assert.equal(s.provider, 'skill-pack-security')

      await fiber.dispose()
      assert.deepEqual((await pctx.skills.list()).map(s => s.name), [])
    } finally {
      for (const [pkg] of links) await rm(join(shimBase, pkg), { force: true })
      await rm(join(PACK_DIR, 'node_modules'), { recursive: true, force: true })
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
