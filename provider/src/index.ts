/**
 * Optional packaging-demo provider plugin for dsh-skill-pack-security.
 *
 * Registers one SkillProvider on `ctx.skills` whose candidates are this
 * package's own `skills/` directory, reusing the official
 * `FileSystemSkillProvider` so frontmatter parsing semantics are byte-identical
 * with the built-in local provider (same fail-closed rules, same kebab-case
 * names, same invocation policy). The pack itself works without this plugin —
 * installing it only avoids copying skills into a scanned root.
 *
 * @module dsh-skill-pack-security/provider
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem'
import z from '@deepseek-ai/schemastery'
import type Schema from '@deepseek-ai/schemastery'

export const name = 'skill-pack-security'
export const inject = ['skills']

/** Configuration for the packaged skill provider. */
export interface Config {
  /** Whether to watch the packaged skills directory; packaged content is static, so default false. */
  watch?: boolean
  /** Explicit skills root; defaults to the pack's own skills/ directory beside this package. */
  skillsDir?: string
}

export const Config: Schema<Config> = z.object({
  watch: z.boolean().default(false),
  skillsDir: z.string(),
})

/** The pack's own skills directory, resolved relative to this module (src/ and built lib/ are both one level under provider/). */
const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'skills')

/** Register the packaged skills directory as a custom-root provider. */
export function apply(ctx: Context, config: Config = {}): void {
  ctx.effect(function* () {
    yield ctx.skills.registerProvider(control => new FileSystemSkillProvider(ctx, control, {
      providerName: 'skill-pack-security',
      includeDefaultRoots: false,
      customSkillDirs: [config.skillsDir ?? SKILLS_DIR],
      watch: config.watch ?? false,
    }))
  })
}
