/**
 * The `plugin_vet` tool definition: schema-validated arguments, a strictly
 * validated canonical report, a model-facing markdown render, and the
 * pending/completed UI cards. This is the only module in the vet engine that
 * imports harness packages; everything below it is plain zero-dependency code.
 *
 * @module dsh-skill-pack-security/vet/tool
 */

import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { VetConfig } from './config.js'
import { runVet } from './engine.js'
import { renderReport } from './report.js'
import type { Lang } from './skills.js'
import type { VetReport } from './vocabulary.js'

/** Output-side JSON Schema dialect entry for one finding. */
const FINDING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    level: { type: 'string', required: true, enum: ['fail', 'warn', 'info'] },
    message: { type: 'string', required: true },
    location: { type: 'string' },
    skill: { type: 'string', required: true },
    evidence: { type: 'string' },
  },
} as const

const CHECK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    verdict: { type: 'string', required: true, enum: ['pass', 'warn', 'fail', 'skip'] },
    skipReason: { type: 'string' },
    score: { type: 'integer', required: true },
    findings: { type: 'array', required: true, items: FINDING_SCHEMA },
    truncatedFindings: { type: 'boolean', required: true },
    skill: { type: 'string', required: true },
  },
} as const

const REPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', required: true, const: 'vet-report' },
    target: {
      type: 'object', required: true, additionalProperties: false,
      properties: {
        raw: { type: 'string', required: true },
        kind: { type: 'string', required: true, enum: ['github-repo', 'local-path', 'npm-package'] },
        resolved: { type: 'string', required: true },
        ref: { type: 'string', required: true },
      },
    },
    fetchedAt: { type: 'string', required: true },
    checks: { type: 'array', required: true, items: CHECK_SCHEMA },
    scores: {
      type: 'object', required: true, additionalProperties: false,
      properties: {
        license: { type: 'integer', required: true },
        source: { type: 'integer', required: true },
        dependencies: { type: 'integer', required: true },
        'build-scripts': { type: 'integer', required: true },
        maintenance: { type: 'integer', required: true },
        overall: { type: 'integer', required: true },
      },
    },
    verdict: { type: 'string', required: true, enum: ['pass', 'warn', 'fail', 'skip'] },
    gate: {
      type: 'object', required: true, additionalProperties: false,
      properties: {
        policy: { type: 'string', required: true, enum: ['warn', 'deny'] },
        applied: { type: 'boolean', required: true },
        blocked: { type: 'boolean', required: true },
        reason: { type: 'string' },
      },
    },
    sbom: {
      type: 'object', required: true, additionalProperties: false,
      properties: {
        lockfile: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
        lockfileVersion: { type: 'string' },
        directDependencies: { type: 'integer', required: true },
        directDevDependencies: { type: 'integer', required: true },
        packages: {
          type: 'array', required: true,
          items: {
            type: 'object', additionalProperties: false,
            properties: {
              name: { type: 'string', required: true },
              version: { type: 'string', required: true },
              depth: { type: 'integer', required: true },
              license: { type: 'string' },
              dev: { type: 'boolean', required: true },
            },
          },
        },
        truncated: { type: 'boolean', required: true },
        totalPackages: { type: 'integer', required: true },
        unpinned: { type: 'array', required: true, items: { type: 'string' } },
      },
    },
    budget: {
      type: 'object', required: true, additionalProperties: false,
      properties: {
        filesScanned: { type: 'integer', required: true },
        filesSkipped: { type: 'integer', required: true },
        bytesScanned: { type: 'integer', required: true },
        truncated: { type: 'boolean', required: true },
        truncatedReason: { type: 'string' },
      },
    },
    followupSkills: { type: 'array', required: true, items: { type: 'string' } },
  },
} as const

function textBlock(text: string): ContentBlock {
  return { type: 'text', text }
}

/**
 * Build the plugin_vet tool bound to the resolved plugin configuration.
 * @param config - resolved vet configuration (defaults already applied).
 * @param lang - report language, driven by the plugin's `language` config.
 */
export function buildVetTool(config: VetConfig, lang: Lang) {
  return defineTool({
    name: 'plugin_vet',
    description:
      'Supply-chain security gate for DSH plugin repositories/packages. Scans a target (GitHub `owner/repo[@ref]`, an `npm:name@version` package, or a local path) and returns a five-dimension risk report: license, source, dependencies, build scripts, maintenance. Checks: LICENSE/SPDX detection (missing/unknown/NOASSERTION flagged), SBOM dependency tree, 40-hex commit pinning of install references, dangerous postinstall/preinstall scripts, network-exfiltration domains, obfuscated code, source trust signals, maintenance status. Each finding cites the matching dsh-skill-pack-security skill section for a manual deep-dive. Use it BEFORE installing any plugin (`dsh plugin add`); a FAIL verdict warns or blocks depending on the configured gate policy (default warn). Read-only: never modifies the target. Respects timeouts; bounded network use.',
    parameters: {
      target: {
        type: 'string',
        required: true,
        description: 'Target to vet: GitHub `owner/repo` or `owner/repo@ref`, npm package `npm:name@version`, or a local absolute/relative path.',
      },
      ref: {
        type: 'string',
        description: 'Optional git ref override for GitHub targets (prefer a 40-hex commit). Defaults to the repository default branch.',
      },
      checks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional subset of check ids: license, sbom, commit-lock, install-scripts, network-exfil, obfuscation, source, maintenance. Default: all.',
      },
      policy: {
        type: 'string',
        enum: ['inherit', 'warn', 'deny'],
        description: 'Per-call gate policy override. inherit (default) uses the configured gate.policy; deny blocks installation on FAIL.',
      },
    },
    output: {
      schema: REPORT_SCHEMA,
      render: (_args, value: unknown) => [textBlock(renderReport(value as VetReport, lang))],
    },
    timeoutMs: Math.max(config.timeoutMs * 4 + 5000, 30000),
    async execute(args, exec) {
      return await runVet(
        { target: args.target, ref: args.ref, checks: args.checks, policy: args.policy },
        config,
        lang,
        exec.signal,
      )
    },
    presentCall(args) {
      return { card: 'generic', kind: 'search', title: `plugin_vet ${args.target}`, rawInput: { target: args.target } }
    },
    presentResult(args, result) {
      const content = result.content as ContentBlock[]
      const firstText = content.find(block => block.type === 'text') as { text?: string } | undefined
      const verdict = /Verdict:\s*(\w+)/.exec(firstText?.text ?? '')?.[1]?.toUpperCase() ?? 'done'
      return { card: 'generic', title: `plugin_vet ${args.target}: ${verdict}`, content }
    },
  })
}
