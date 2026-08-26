/**
 * Shared vocabulary for the plugin_vet supply-chain gate.
 *
 * Everything here is plain data (JSON-safe, no live runtime objects) so the
 * scan engine stays a pure, harness-free module: the tool definition in
 * `tool.ts` is the only part that touches ctx/defineTool.
 *
 * @module dsh-skill-pack-security/vet/vocabulary
 */

/** The five risk dimensions every report scores. */
export type Dimension = 'license' | 'source' | 'dependencies' | 'build-scripts' | 'maintenance'

/** Per-check and overall verdicts. `skip` = the check could not run (offline, budget). */
export type Verdict = 'pass' | 'warn' | 'fail' | 'skip'

/** One of the two gate policies. */
export type GatePolicy = 'warn' | 'deny'

/** How a scan target is addressed. */
export type TargetKind = 'github-repo' | 'local-path' | 'npm-package'

/** Stable check ids; each maps to exactly one dimension and one skill section. */
export type CheckId =
  | 'license'
  | 'sbom'
  | 'commit-lock'
  | 'install-scripts'
  | 'network-exfil'
  | 'obfuscation'
  | 'source'
  | 'maintenance'
  | 'data-responsibility'

export const ALL_CHECK_IDS: readonly CheckId[] = [
  'license',
  'sbom',
  'commit-lock',
  'install-scripts',
  'network-exfil',
  'obfuscation',
  'source',
  'maintenance',
  'data-responsibility',
]

/** Finding severity: fail blocks the check, warn downgrades, info is an observation. */
export type FindingLevel = 'fail' | 'warn' | 'info'

/**
 * One machine-checkable finding. `skill` points at the pack skill (and its
 * section) that continues the manual audit; `evidence` is a redacted, capped
 * snippet or fact — never a secret, never a full file body.
 */
export interface VetFinding {
  readonly level: FindingLevel
  /** Short human-readable claim, in the report language. */
  readonly message: string
  /** File:line location when known (e.g. `package.json:7` or `README.md:12`). */
  readonly location?: string
  /** Pack skill + section to continue the manual audit, e.g. `supply-chain-review §1`. */
  readonly skill: string
  /** Redacted, capped evidence text (≤ 160 chars per entry). */
  readonly evidence?: string
}

/** One executed check: verdict, findings, skill pointer, and its 0–100 dimension score. */
export interface VetCheck {
  readonly id: CheckId
  readonly name: string
  readonly verdict: Verdict
  /** Why the check was skipped (offline, budget, unsupported target). */
  readonly skipReason?: string
  readonly score: number
  /** All findings capped by config.maxFindingsPerCheck (truncated notes the cut). */
  readonly findings: VetFinding[]
  readonly truncatedFindings: boolean
  /** Primary skill + section for manual deep-dive of this check's subject. */
  readonly skill: string
}

/** One SBOM tree entry (deduped by name@version). */
export interface VetPackage {
  readonly name: string
  readonly version: string
  /** Depth from the root manifest (0 = direct dependency). */
  readonly depth: number
  /** License string as declared, when the lockfile/manifest carried one. */
  readonly license?: string
  /** Whether the entry came from devDependencies only. */
  readonly dev: boolean
}

/** Where the dependency-scan evidence came from. */
export type ScannerSource = 'builtin' | 'osv-scanner' | 'npm-audit'

/** One vulnerability reported by a dependency scanner. */
export interface VulnIssue {
  /** Advisory id when known (GHSA-…, CVE-…, or npm advisory id). */
  readonly id?: string
  /** Affected package name. */
  readonly package: string
  /** Affected version range, when the scanner reported one. */
  readonly version?: string
  readonly severity: 'critical' | 'high' | 'moderate' | 'low' | 'unknown'
  /** Short human-readable summary. */
  readonly title: string
}

/** SBOM summary produced by the `sbom` check. */
export interface VetSbom {
  readonly lockfile: string | null
  readonly lockfileVersion?: string
  readonly directDependencies: number
  readonly directDevDependencies: number
  readonly packages: VetPackage[]
  readonly truncated: boolean
  readonly totalPackages: number
  /** Direct dependency specs that are not pinned to an exact version. */
  readonly unpinned: string[]
  /** Which scanner produced the dependency evidence (`builtin` = self-computed). */
  readonly source: ScannerSource
  /** Vulnerabilities reported by an external scanner; empty for `builtin`. */
  readonly vulnerabilities: VulnIssue[]
}

/** Scorecard: the five dimensions plus the overall weighted score. */
export interface VetScores {
  readonly license: number
  readonly source: number
  readonly dependencies: number
  readonly 'build-scripts': number
  readonly maintenance: number
  readonly overall: number
}

/** Resolved target metadata recorded in the report. */
export interface VetTarget {
  readonly raw: string
  readonly kind: TargetKind
  /** owner/repo for remote targets, resolved absolute path for local ones. */
  readonly resolved: string
  /** Effective ref for remote targets (branch/tag/commit or npm version). */
  readonly ref: string
}

/** Gate result: policy applied and whether installation is blocked. */
export interface VetGate {
  readonly policy: GatePolicy
  readonly applied: boolean
  readonly blocked: boolean
  /** One-line reason when blocked (deny policy + fail verdict). */
  readonly reason?: string
}

/** Scan budget facts so truncation is never presented as completeness. */
export interface VetBudget {
  readonly filesScanned: number
  readonly filesSkipped: number
  readonly bytesScanned: number
  readonly truncated: boolean
  readonly truncatedReason?: string
}

/** The canonical plugin_vet report (validated by the tool output schema). */
export interface VetReport {
  readonly kind: 'vet-report'
  readonly target: VetTarget
  readonly fetchedAt: string
  readonly checks: VetCheck[]
  readonly scores: VetScores
  readonly verdict: Verdict
  readonly gate: VetGate
  readonly sbom: VetSbom
  readonly budget: VetBudget
  /** Skill names worth loading for the manual follow-up audit. */
  readonly followupSkills: string[]
}
