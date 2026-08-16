/**
 * Bounded file collection: walks a local directory or normalizes an extracted
 * tarball into one shared `ScannedFile` list. Everything is budget-capped so a
 * hostile or simply huge target can never exhaust memory or wall time; caps are
 * reported back as truncation, never hidden.
 *
 * @module dsh-skill-pack-security/vet/walk
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

/** One collected file: path relative to the target root, decoded text when readable. */
export interface ScannedFile {
  readonly path: string
  readonly text: string | null
  /** Binary content (NUL byte detected); text is null. */
  readonly binary: boolean
  /** Files that exceeded per-file budget or failed to decode; null for normal files. */
  readonly skipped: 'too-large' | 'binary' | 'decode' | null
}

/** Budget facts so reports never present truncation as completeness. */
export interface ScanBudget {
  filesScanned: number
  filesSkipped: number
  bytesScanned: number
  truncated: boolean
  truncatedReason?: string
}

/** Directories never descended into (generated/third-party content). */
const SKIPPED_DIRS = new Set([
  'node_modules', '.git', '.hg', '.svn', '.pnpm-store',
  'dist', 'build', '.next', '.nuxt', '.cache', '.parcel-cache', 'coverage',
  'target', '.venv', 'venv', '__pycache__', '.tmp', '.idea', '.vscode', '.turbo',
  'pack', 'out',
])

/** File names never collected. */
const SKIPPED_FILES = new Set(['.DS_Store', 'Thumbs.db', '.gitignore', '.npmignore', '.eslintcache'])

/** Detect binary content cheaply: NUL bytes within the first 8 KiB. */
function looksBinary(buffer: Uint8Array): boolean {
  const probe = buffer.subarray(0, Math.min(buffer.byteLength, 8192))
  return probe.includes(0)
}

/** Decode UTF-8 lossily; the decoder replaces invalid sequences instead of throwing. */
function decodeText(buffer: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer)
}

/** Normalize an extracted tarball's file map into the shared scanned-file list. */
export function filesFromMap(files: Map<string, Uint8Array>, maxFileBytes: number): { files: ScannedFile[]; budget: ScanBudget } {
  const scanned: ScannedFile[] = []
  let bytesScanned = 0
  let skipped = 0
  let truncated = false
  let truncatedReason: string | undefined
  for (const [path, content] of files) {
    const name = basename(path)
    if (SKIPPED_FILES.has(name)) continue
    if (content.byteLength > maxFileBytes) {
      skipped += 1
      truncated = true
      truncatedReason = `file ${path} exceeded the ${maxFileBytes}-byte per-file cap`
      scanned.push({ path, text: null, binary: false, skipped: 'too-large' })
      continue
    }
    if (looksBinary(content)) {
      skipped += 1
      scanned.push({ path, text: null, binary: true, skipped: 'binary' })
      continue
    }
    scanned.push({ path, text: decodeText(content), binary: false, skipped: null })
    bytesScanned += content.byteLength
  }
  return {
    files: scanned,
    budget: { filesScanned: scanned.length, filesSkipped: skipped, bytesScanned, truncated, truncatedReason },
  }
}

/** Walk a local directory with caps; symlinks are never followed. */
export async function walkLocal(root: string, maxFiles: number, maxFileBytes: number): Promise<{ files: ScannedFile[]; budget: ScanBudget }> {
  const scanned: ScannedFile[] = []
  let skipped = 0
  let truncated = false
  let truncatedReason: string | undefined
  let bytesScanned = 0
  let seen = 0

  async function visit(dir: string, base: string): Promise<void> {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (truncated) return
      const abs = join(dir, entry.name)
      const rel = (base === '' ? entry.name : `${base}/${entry.name}`)
      if (entry.isDirectory()) {
        if (SKIPPED_DIRS.has(entry.name)) continue
        await visit(abs, rel)
        continue
      }
      if (!entry.isFile()) continue
      seen += 1
      if (seen > maxFiles) {
        truncated = true
        truncatedReason = `target exceeds the ${maxFiles}-file scan cap`
        return
      }
      if (SKIPPED_FILES.has(entry.name)) continue
      let buffer: Uint8Array
      try {
        const info = await stat(abs)
        if (info.size > maxFileBytes) {
          skipped += 1
          scanned.push({ path: rel, text: null, binary: false, skipped: 'too-large' })
          continue
        }
        buffer = await readFile(abs)
      } catch {
        skipped += 1
        scanned.push({ path: rel, text: null, binary: false, skipped: 'decode' })
        continue
      }
      if (looksBinary(buffer)) {
        skipped += 1
        scanned.push({ path: rel, text: null, binary: true, skipped: 'binary' })
        continue
      }
      scanned.push({ path: rel, text: decodeText(buffer), binary: false, skipped: null })
      bytesScanned += buffer.byteLength
    }
  }

  await visit(root, '')
  return {
    files: scanned,
    budget: {
      filesScanned: scanned.length,
      filesSkipped: skipped,
      bytesScanned,
      truncated: truncated || scanned.some(f => f.skipped === 'too-large'),
      truncatedReason: truncatedReason ?? (scanned.some(f => f.skipped === 'too-large') ? 'some files exceeded the per-file byte cap' : undefined),
    },
  }
}

/** Resolve the strip-prefix of a codeload/npm tarball (its single top-level dir). */
export function stripRoot(files: Map<string, Uint8Array>): string {
  let prefix = ''
  for (const path of files.keys()) {
    const slash = path.indexOf('/')
    if (slash === -1) continue
    const candidate = path.slice(0, slash)
    if (prefix === '') prefix = candidate
    else if (candidate !== prefix) return ''
  }
  return prefix
}
