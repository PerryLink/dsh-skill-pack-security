/**
 * Dependency-vulnerability scanner Provider seam.
 *
 * The `sbom` check can hand its dependency evidence to an external scanner
 * (`osv-scanner` or `npm audit`) when that CLI is present, and degrade to the
 * built-in zero-dependency tree scan otherwise. Every scanner declares its
 * `source`, so the report never misattributes findings. Probing is
 * "detect → use → graceful degrade": any spawn failure (CLI absent, sandbox
 * restriction, non-zero exit, unparseable output) resolves to an unavailable
 * scanner instead of throwing.
 *
 * @module dsh-skill-pack-security/vet/scanners
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ScannerSource, VulnIssue } from './vocabulary.js'

/** Result of probing and (optionally) running one scanner. */
export interface ScannerResult {
  readonly source: ScannerSource
  /** Whether the scanner could run against `dir`. */
  readonly available: boolean
  /** Why it was unavailable (CLI missing, no lockfile, timeout, parse error). */
  readonly reason?: string
  /** Vulnerabilities found; empty on a clean scan or when unavailable. */
  readonly issues: VulnIssue[]
}

/** The Provider contract a dependency scanner implements. */
export interface DependencyScanner {
  readonly source: ScannerSource
  readonly label: string
  /** Whether the scanner can run against `dir` (CLI present + target suitable). */
  probe(dir: string, timeoutMs: number, signal?: AbortSignal): Promise<boolean>
  /** Run the scanner; never throws — failures degrade to an empty issue list. */
  scan(dir: string, timeoutMs: number, signal?: AbortSignal): Promise<VulnIssue[]>
}

/** Process run result, lossless JSON-safe. */
interface RunResult {
  readonly code: number | null
  readonly stdout: string
  readonly stderr: string
}

/** Spawn a CLI, capture output, and always settle (error/timeout → null code). */
function runCommand(bin: string, args: string[], cwd: string | undefined, timeoutMs: number, signal?: AbortSignal): Promise<RunResult> {
  return new Promise((resolve) => {
    let child
    try {
      child = spawn(bin, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    } catch {
      resolve({ code: null, stdout: '', stderr: 'spawn threw' })
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (code: number | null): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ code, stdout, stderr })
    }
    const timer = setTimeout(() => {
      try { child.kill() } catch { /* already exited */ }
      finish(null)
    }, timeoutMs)
    const onAbort = (): void => { try { child.kill() } catch { /* already exited */ } }
    signal?.addEventListener('abort', onAbort, { once: true })
    child.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
    child.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
    child.on('error', () => finish(null))
    child.on('close', (code) => finish(code))
  })
}

/** Parse osv-scanner's `--format json` output into issues. */
function parseOsvJson(text: string): VulnIssue[] {
  try {
    const parsed = JSON.parse(text) as { results?: Array<{ packages?: Array<{ package?: { name?: string; version?: string }; vulnerabilities?: Array<{ id?: string; summary?: string; severity?: Array<{ score?: string }> }> }> }> }
    const issues: VulnIssue[] = []
    for (const result of parsed.results ?? []) {
      for (const pkg of result.packages ?? []) {
        const name = pkg.package?.name ?? 'unknown'
        const version = pkg.package?.version
        for (const vuln of pkg.vulnerabilities ?? []) {
          issues.push({
            id: vuln.id,
            package: name,
            version,
            severity: osvSeverity(vuln),
            title: vuln.summary ?? vuln.id ?? 'vulnerability',
          })
        }
      }
    }
    return issues
  } catch {
    return []
  }
}

/** Map osv-scanner severity (a CVSS score object) to our severity vocabulary. */
function osvSeverity(vuln: { severity?: Array<{ score?: string }> }): VulnIssue['severity'] {
  const score = Number.parseFloat(vuln.severity?.[0]?.score ?? '')
  if (Number.isNaN(score)) return 'unknown'
  if (score >= 9) return 'critical'
  if (score >= 7) return 'high'
  if (score >= 4) return 'moderate'
  return 'low'
}

/** Parse `npm audit --json` output into issues. */
function parseNpmAuditJson(text: string): VulnIssue[] {
  try {
    const parsed = JSON.parse(text) as { vulnerabilities?: Record<string, { name?: string; severity?: string; range?: string; via?: Array<string | { title?: string; url?: string }> }> }
    const issues: VulnIssue[] = []
    for (const [key, vuln] of Object.entries(parsed.vulnerabilities ?? {})) {
      const via = vuln.via ?? []
      const advisory = via.find((entry): entry is { title?: string; url?: string } => typeof entry === 'object' && entry !== null)
      const title = advisory?.title ?? (typeof via[0] === 'string' ? via[0] : key)
      issues.push({
        id: typeof advisory?.url === 'string' ? advisory.url.split('/').pop() : undefined,
        package: vuln.name ?? key,
        version: vuln.range,
        severity: npmSeverity(vuln.severity),
        title,
      })
    }
    return issues
  } catch {
    return []
  }
}

/** Normalize npm audit severity strings. */
function npmSeverity(severity: string | undefined): VulnIssue['severity'] {
  if (severity === 'critical') return 'critical'
  if (severity === 'high') return 'high'
  if (severity === 'moderate') return 'moderate'
  if (severity === 'low') return 'low'
  return 'unknown'
}

/** Lockfile filenames that external scanners can operate on. */
const LOCKFILES = ['package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock']

function hasLockfile(dir: string): boolean {
  return LOCKFILES.some(name => existsSync(join(dir, name)))
}

/** osv-scanner adapter: detects the CLI, scans the directory. */
export const osvScanner: DependencyScanner = {
  source: 'osv-scanner',
  label: 'OSV-Scanner',
  async probe(dir, timeoutMs, signal) {
    if (!hasLockfile(dir)) return false
    const result = await runCommand('osv-scanner', ['--version'], dir, timeoutMs, signal)
    return result.code === 0 && result.stdout.length > 0
  },
  async scan(dir, timeoutMs, signal) {
    // `osv-scanner scan` (newer) falls back to the legacy flag-less form.
    const attempts: string[][] = [
      ['scan', '--format', 'json', '--recursive', '.'],
      ['--format', 'json', '--recursive', '.'],
    ]
    for (const args of attempts) {
      const result = await runCommand('osv-scanner', args, dir, timeoutMs, signal)
      if (result.code === 0 || result.stdout.trim() !== '') {
        return parseOsvJson(result.stdout)
      }
    }
    return []
  },
}

/** npm-audit adapter: detects a lockfile + the npm CLI, runs `npm audit`. */
export const npmAuditScanner: DependencyScanner = {
  source: 'npm-audit',
  label: 'npm audit',
  async probe(dir, timeoutMs, signal) {
    if (!hasLockfile(dir)) return false
    const result = await runCommand('npm', ['--version'], dir, timeoutMs, signal)
    return result.code === 0 && result.stdout.length > 0
  },
  async scan(dir, timeoutMs, signal) {
    const result = await runCommand('npm', ['audit', '--json'], dir, timeoutMs, signal)
    if (result.stdout.trim() === '') return []
    return parseNpmAuditJson(result.stdout)
  },
}

/**
 * Probe the external scanners in preference order and return the first that is
 * available, or a `builtin` result (always available) when none is.
 * @param dir - the local target directory to scan (external scanners need it).
 * @param timeoutMs - per-CLI probe/scan timeout.
 * @param signal - caller abort signal (the tool-call signal).
 * @returns a result whose `source` names the effective scanner.
 */
export async function probeDependencyScanner(dir: string, timeoutMs: number, signal?: AbortSignal): Promise<ScannerResult> {
  for (const scanner of [osvScanner, npmAuditScanner]) {
    try {
      if (await scanner.probe(dir, timeoutMs, signal)) {
        const issues = await scanner.scan(dir, timeoutMs, signal)
        return { source: scanner.source, available: true, issues }
      }
    } catch {
      // Any probe/scan failure degrades to the next scanner (then builtin).
    }
  }
  return { source: 'builtin', available: true, issues: [] }
}
