/**
 * plugin_vet engine: resolves a target, runs the eight checks, scores the five
 * risk dimensions, applies the installation gate, and returns the canonical
 * report. Pure orchestration — all side effects live in `source.ts`/`fetch.ts`
 * and every value produced here is JSON-safe and redacted.
 *
 * @module dsh-skill-pack-security/vet/engine
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ALL_CHECK_IDS, type CheckId, type Dimension, type GatePolicy, type VetCheck, type VetReport, type VetScores, type Verdict } from './vocabulary.js'
import type { VetConfig } from './config.js'
import { runChecks } from './checks.js'
import { parseLockfile, parseManifest } from './manifest.js'
import { resolveTarget } from './source.js'
import { VetFetchError } from './fetch.js'
import { probeDependencyScanner, type ScannerResult } from './scanners.js'
import { CHECK_NAME, SKILL_REF, T, type Lang } from './skills.js'

/** Engine-level failure: target unusable (not found, offline, budget). */
export class VetTargetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VetTargetError'
  }
}

/** Tool argument shape (already JSON-validated by defineTool). */
export interface VetArgs {
  readonly target: string
  readonly ref?: string
  readonly checks?: string[]
  readonly policy?: 'inherit' | GatePolicy
}

/** Parse and validate the requested check subset. */
function requestedChecks(args: VetArgs): CheckId[] {
  if (args.checks === undefined || args.checks.length === 0) return [...ALL_CHECK_IDS]
  const selected: CheckId[] = []
  for (const raw of args.checks) {
    const id = raw.trim() as CheckId
    if (!ALL_CHECK_IDS.includes(id)) {
      throw new VetTargetError(`unknown check "${raw}"; available: ${ALL_CHECK_IDS.join(', ')}`)
    }
    if (!selected.includes(id)) selected.push(id)
  }
  return selected
}

/** Read a local git HEAD commit without spawning git (best effort). */
async function readLocalHead(root: string): Promise<string> {
  try {
    const head = (await readFile(join(root, '.git', 'HEAD'), 'utf8')).trim()
    const direct = /^[0-9a-f]{40}$/i.exec(head)
    if (direct !== null) return direct[0]
    const refMatch = /^ref:\s*(.+)$/.exec(head)
    if (refMatch === null) return ''
    const ref = (await readFile(join(root, '.git', refMatch[1]), 'utf8')).trim()
    return /^[0-9a-f]{40}$/i.test(ref) ? ref : ''
  } catch {
    return ''
  }
}

const WEIGHTS: Record<Dimension, number> = { license: 0.25, source: 0.2, dependencies: 0.15, 'build-scripts': 0.25, maintenance: 0.15 }

/**
 * Recursively drop `undefined` properties from plain objects/arrays so the
 * canonical value is always lossless JSON (the tool runtime rejects anything
 * less). Engine internals may carry optional undefined fields; only this
 * projection is surfaced.
 */
function jsonClean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(jsonClean)
  if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (child === undefined) continue
      out[key] = jsonClean(child)
    }
    return out
  }
  return value
}

/** Dimension → checks contributing to it. */
const DIMENSION_CHECKS: Record<Dimension, CheckId[]> = {
  license: ['license'],
  source: ['source', 'commit-lock', 'data-responsibility'],
  dependencies: ['sbom'],
  'build-scripts': ['install-scripts', 'network-exfil', 'obfuscation'],
  maintenance: ['maintenance'],
}

/** Weight factors per check inside the `source` dimension (they sum to 1). */
const SOURCE_WEIGHTS: Partial<Record<CheckId, number>> = {
  source: 0.5,
  'commit-lock': 0.3,
  'data-responsibility': 0.2,
}

/** Build the five-dimension scorecard from executed checks. */
function scoreDimensions(checks: VetCheck[]): VetScores {
  const byId = new Map(checks.map(check => [check.id, check]))
  const dims = {} as Record<Dimension, number>
  for (const dim of Object.keys(DIMENSION_CHECKS) as Dimension[]) {
    const contributors = DIMENSION_CHECKS[dim].map(id => byId.get(id)).filter((check): check is VetCheck => check !== undefined)
    const run = contributors.filter(check => check.verdict !== 'skip')
    if (run.length === 0) {
      dims[dim] = 60 // unknown: neither penalize nor credit
      continue
    }
    const weighted = run.map(check => {
      if (dim === 'build-scripts') {
        const factor = check.id === 'install-scripts' ? 0.4 : check.id === 'network-exfil' ? 0.35 : 0.25
        return check.score * factor
      }
      if (dim === 'source') {
        return check.score * (SOURCE_WEIGHTS[check.id] ?? 1)
      }
      return check.score
    })
    // build-scripts and source already sum their weight factors to 1; other
    // dimensions average their contributors.
    const divisor = dim === 'build-scripts' || dim === 'source' ? 1 : weighted.length
    dims[dim] = Math.round(weighted.reduce((a, b) => a + b, 0) / divisor)
  }
  const overall = Math.round((Object.keys(dims) as Dimension[]).reduce((sum, dim) => sum + dims[dim] * WEIGHTS[dim], 0))
  return {
    license: dims.license,
    source: dims.source,
    dependencies: dims.dependencies,
    'build-scripts': dims['build-scripts'],
    maintenance: dims.maintenance,
    overall,
  }
}

/** Run the whole pipeline for one tool call. */
export async function runVet(args: VetArgs, config: VetConfig, lang: Lang, signal: AbortSignal | undefined): Promise<VetReport> {
  const ids = requestedChecks(args)
  // The data-responsibility review can be disabled per deployment; an explicit
  // per-call request then simply does not run (documented in the tool help).
  const effectiveIds = config.dataResponsibility ? ids : ids.filter(id => id !== 'data-responsibility')
  const policy: GatePolicy = args.policy === undefined || args.policy === 'inherit' ? config.gate.policy : args.policy
  const now = Date.now()
  const fetchedAt = new Date(now).toISOString()

  let resolved
  try {
    resolved = await resolveTarget(args.target, config, signal)
  } catch (error) {
    if (error instanceof VetFetchError) {
      // Offline/timeout: every check skips with the concrete reason.
      const skipReason = `${T[lang].offline}: ${error.message}`
      const checks: VetCheck[] = ALL_CHECK_IDS.map(id => ({
        id,
        name: CHECK_NAME[lang][id],
        verdict: 'skip',
        skipReason,
        score: 60,
        findings: [],
        truncatedFindings: false,
        skill: SKILL_REF[id],
      }))
      return jsonClean({
        kind: 'vet-report',
        target: { raw: args.target, kind: 'github-repo', resolved: args.target, ref: '' },
        fetchedAt,
        checks,
        scores: scoreDimensions(checks),
        verdict: 'skip',
        gate: { policy, applied: false, blocked: false },
        sbom: { lockfile: null, directDependencies: 0, directDevDependencies: 0, packages: [], truncated: false, totalPackages: 0, unpinned: [], source: 'builtin', vulnerabilities: [] },
        budget: { filesScanned: 0, filesSkipped: 0, bytesScanned: 0, truncated: false, truncatedReason: skipReason },
        followupSkills: ['security-audit'],
      }) as VetReport
    }
    throw error
  }

  if (resolved.files.length === 0 && resolved.budget.truncatedReason !== undefined) {
    throw new VetTargetError(resolved.budget.truncatedReason)
  }

  const manifest = parseManifest(resolved.files)
  const lock = parseLockfile(resolved.files)
  const localHead = resolved.kind === 'local-path' ? await readLocalHead(resolved.resolved) : ''

  // External scanners (osv-scanner/npm audit) need a real on-disk project, so
  // they are orchestrated only for local targets; remote targets degrade to
  // the built-in tree scan with an explicit `builtin` source annotation.
  let scanner: ScannerResult | undefined
  if (config.externalScanners && resolved.kind === 'local-path') {
    scanner = await probeDependencyScanner(resolved.resolved, config.timeoutMs, signal)
  }

  const results = runChecks(
    {
      files: resolved.files,
      manifest,
      lock,
      github: resolved.github,
      npm: resolved.npm,
      target: resolved,
      config,
      lang,
      localHead,
      now,
      scanner,
    },
    effectiveIds,
  )
  const checks = results.map(result => result.check)
  const sbom = results.find(result => result.sbom !== undefined)?.sbom

  // Unrequested checks are absent; the scorecard treats them as neutral.
  const scores = scoreDimensions(checks)
  let verdict: Verdict = 'pass'
  if (checks.some(check => check.verdict === 'fail')) verdict = 'fail'
  else if (scores.overall < 60) verdict = 'warn'

  const gateApplied = verdict === 'fail'
  const blocked = gateApplied && policy === 'deny'

  const followupSkills = new Set<string>(['security-audit'])
  for (const check of checks) {
    for (const finding of check.findings) {
      if (finding.level !== 'fail' && finding.level !== 'warn') continue
      const skillName = finding.skill.split(' ')[0]
      if (skillName !== '') followupSkills.add(skillName)
    }
  }

  const budget = { ...resolved.budget }
  if (resolved.files.length === 0) {
    budget.truncated = true
    budget.truncatedReason = resolved.budget.truncatedReason ?? 'target contained no scannable files'
  }

  return jsonClean({
    kind: 'vet-report',
    target: {
      raw: args.target,
      kind: resolved.kind,
      resolved: resolved.resolved,
      ref: resolved.ref,
    },
    fetchedAt,
    checks,
    scores,
    verdict,
    gate: {
      policy,
      applied: gateApplied,
      blocked,
      reason: blocked
        ? lang === 'zh' ? 'verdict=fail 且门禁策略为 deny' : 'verdict=fail with deny gate policy'
        : undefined,
    },
    sbom: sbom ?? {
      lockfile: null,
      directDependencies: 0,
      directDevDependencies: 0,
      packages: [],
      truncated: false,
      totalPackages: 0,
      unpinned: [],
      source: 'builtin',
      vulnerabilities: [],
    },
    budget,
    followupSkills: [...followupSkills],
  }) as VetReport
}
