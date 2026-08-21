/**
 * Provider plugin for dsh-skill-pack-security — "skill 教流程，插件自动执行".
 *
 * Registers two capabilities:
 *  1. a SkillProvider on `ctx.skills` whose candidates are this package's own
 *     `skills/` directory (reusing the official `FileSystemSkillProvider`, so
 *     frontmatter parsing semantics are byte-identical with the built-in
 *     provider), and
 *  2. the `plugin_vet` supply-chain gate tool on `ctx.tools`: an automated
 *     pre-install scanner (license / SBOM / commit pinning / malicious
 *     patterns / five-dimension risk score) whose every finding cites the
 *     pack skill section to continue as a manual audit.
 *
 * The scan engine is zero-dependency (Node built-ins only) and the plugin
 * injects no prompt paragraphs: the gate lives entirely in the tool result,
 * keeping the session persona untouched.
 *
 * @module dsh-skill-pack-security/provider
 */

import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem'
import z from '@deepseek-ai/schemastery'
import type Schema from '@deepseek-ai/schemastery'
import { resolveVetConfig, type VetConfigInput } from './vet/config.js'
import { buildVetTool } from './vet/tool.js'

export const name = 'skill-pack-security'
export const inject = ['skills', 'tools']

/** The skill language the provider publishes (and the plugin_vet report language). */
export type PackLanguage = 'zh' | 'en'

/** plugin_vet gate policy: warn (default, non-blocking) or deny (blocks install on FAIL). */
export type GatePolicy = 'warn' | 'deny'

/** Configuration for the packaged skill provider. */
export interface Config {
  /** Whether to watch the packaged skills directory; packaged content is static, so default false. */
  watch?: boolean
  /** Language edition to publish: the Chinese `skills/` or the English `skills-en/`. Ignored when `skillsDir` is set. */
  language?: PackLanguage
  /** Explicit skills root; overrides the `language`-derived default. Must be a non-empty path to an existing root with `<skill>/SKILL.md` bundles. */
  skillsDir?: string
  /** plugin_vet scanner + installation-gate configuration. */
  vet?: VetConfigInput
}

export const Config: Schema<Config> = z.object({
  watch: z.boolean().default(false),
  language: z.union(['zh', 'en'] as const).default('zh'),
  skillsDir: z.string().min(1),
  vet: z.object({
    enable: z.boolean().default(true),
    timeoutMs: z.natural().min(1000).max(300000).default(15000),
    maxFiles: z.natural().min(1).max(20000).default(800),
    maxFileBytes: z.natural().min(1024).max(16 * 1024 * 1024).default(256 * 1024),
    maxExtractBytes: z.natural().min(1024).max(512 * 1024 * 1024).default(64 * 1024 * 1024),
    maxDepNodes: z.natural().min(1).max(10000).default(600),
    maxFindingsPerCheck: z.natural().min(1).max(100).default(12),
    userAgent: z.string().max(200).default('dsh-skill-pack-security/2.1.2 (+https://github.com/PerryLink/dsh-skill-pack-security)'),
    dataResponsibility: z.boolean().default(true),
    gate: z.object({
      policy: z.union(['warn', 'deny'] as const).default('warn'),
    }),
  }),
})

/** Directory of this module: `provider/src` under tsx or `provider/lib` when built. */
const MODULE_DIR = dirname(fileURLToPath(import.meta.url))

/**
 * Candidate pack roots, in preference order. The repository layout keeps
 * `skills/` and `skills-en/` beside `provider/`, two levels above this module;
 * the published npm layout embeds both editions in `pack/` beside `lib/`.
 */
const PACK_ROOT_CANDIDATES = [join(MODULE_DIR, '..', '..'), join(MODULE_DIR, '..', 'pack')]

/** Whether a directory contains at least one `<skill>/SKILL.md` bundle. */
function hasSkillBundles(dir: string): boolean {
  if (!existsSync(dir)) return false
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return false
  }
  return entries.some(entry => entry.isDirectory() && existsSync(join(dir, entry.name, 'SKILL.md')))
}

/**
 * Resolve the skills root to publish and fail loud on misconfiguration:
 * an explicit `skillsDir` must exist and hold bundles, and the derived
 * default must find one of the supported layouts — never mount silently with
 * zero skills.
 * @param skillsDir - explicit config override, if any.
 * @param language - edition to select for the derived default.
 * @returns the validated skills root.
 */
function resolveSkillsRoot(skillsDir: string | undefined, language: PackLanguage): string {
  if (skillsDir !== undefined) {
    const root = resolve(skillsDir)
    if (!hasSkillBundles(root)) {
      throw new Error(`skill-pack-security: config.skillsDir "${skillsDir}" does not exist or contains no <skill>/SKILL.md bundles`)
    }
    return root
  }
  const edition = language === 'zh' ? 'skills' : 'skills-en'
  for (const candidate of PACK_ROOT_CANDIDATES) {
    const root = join(candidate, edition)
    if (hasSkillBundles(root)) return root
  }
  throw new Error(`skill-pack-security: no ${language} edition found near ${MODULE_DIR}; expected the repository layout (${edition}/ beside provider/) or the published layout (pack/${edition}/ inside the package). Set config.skillsDir to an explicit root.`)
}

/** Register the packaged skills directory as a custom-root provider. */
export function apply(ctx: Context, config: Config = {}): void {
  const skillsRoot = resolveSkillsRoot(config.skillsDir, config.language ?? 'zh')
  ctx.effect(function* () {
    yield ctx.skills.registerProvider(control => new FileSystemSkillProvider(ctx, control, {
      providerName: 'skill-pack-security',
      includeDefaultRoots: false,
      customSkillDirs: [skillsRoot],
      watch: config.watch ?? false,
    }))
  })

  const vet = resolveVetConfig(config.vet)
  if (vet.enable) {
    ctx.effect(function* () {
      yield ctx.tools.register(buildVetTool(vet, config.language ?? 'zh'))
    })
  }
}
