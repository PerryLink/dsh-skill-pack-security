/**
 * Minimal gzip + ustar (POSIX tar) extractor — zero dependencies.
 *
 * Only the pieces needed to unpack registry/codeload tarballs: regular files,
 * directories, symlinks (recorded, never followed), GNU long-name (`L`) and
 * pax (`x`/`g`) extended headers. Hard constraints:
 *  - path traversal is rejected (absolute paths, `..`, drive letters);
 *  - total bytes, per-file bytes, and file count are capped;
 *  - symlink targets are stored as strings only (never materialized).
 *
 * @module dsh-skill-pack-security/vet/tar
 */

import { gunzipSync } from 'node:zlib'

/** Budget caps for one extraction. */
export interface TarBudget {
  /** Hard cap on total extracted payload bytes. */
  readonly maxTotalBytes: number
  /** Per-file cap; larger members are dropped and `truncated` is set. */
  readonly maxFileBytes: number
  /** Hard cap on the number of extracted file members. */
  readonly maxFiles: number
}

/** One extracted member. Directories are implied by file paths. */
export interface TarEntry {
  readonly path: string
  readonly content: Uint8Array
}

/** Result of one extraction. */
export interface TarResult {
  readonly files: Map<string, Uint8Array>
  readonly symlinks: Map<string, string>
  readonly truncated: boolean
  readonly totalBytes: number
}

class TarError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TarError'
  }
}

const BLOCK = 512

/** Decode an ASCII/UTF-8 field, trimming NULs and spaces. */
function field(buffer: Uint8Array, start: number, length: number): string {
  let end = start + length
  while (end > start && (buffer[end - 1] === 0x00 || buffer[end - 1] === 0x20)) end -= 1
  return new TextDecoder().decode(buffer.subarray(start, end))
}

/** Parse a zero-padded octal size field. */
function octalSize(buffer: Uint8Array, start: number, length: number): number {
  const raw = field(buffer, start, length)
  const clean = raw.replace(/\0/g, '').trim()
  const value = /^[0-7]+$/.test(clean) ? Number.parseInt(clean, 8) : NaN
  return Number.isFinite(value) && value >= 0 ? value : 0
}

/** Reject traversal/absolute/Windows-drive paths before they enter the map. */
function safePath(path: string): string {
  if (path.includes('\0')) throw new TarError('tar entry path contains NUL')
  const normalized = path.replaceAll('\\', '/')
  const segments = normalized.split('/')
  for (const segment of segments) {
    if (segment === '..' || segment === '') continue
    if (/^[A-Za-z]:$/.test(segment)) throw new TarError(`tar entry escapes with a drive letter: ${path}`)
  }
  if (segments.includes('..')) throw new TarError(`tar entry path escapes the root: ${path}`)
  if (normalized.startsWith('/')) throw new TarError(`tar entry uses an absolute path: ${path}`)
  return normalized
}

/** Extract one gzipped ustar archive into an in-memory file map. */
export function extractTarGz(gzipped: Uint8Array, budget: TarBudget): TarResult {
  let raw: Uint8Array
  try {
    raw = gunzipSync(gzipped)
  } catch (error) {
    throw new TarError(`not a gzip stream: ${error instanceof Error ? error.message : String(error)}`)
  }
  const files = new Map<string, Uint8Array>()
  const symlinks = new Map<string, string>()
  let truncated = false
  let totalBytes = 0
  let offset = 0
  let pendingName: string | undefined
  let seenEnd = false

  while (offset + BLOCK <= raw.length) {
    const header = raw.subarray(offset, offset + BLOCK)
    if (header.every(byte => byte === 0)) {
      // Two consecutive zero blocks end the archive.
      const next = raw.subarray(offset + BLOCK, offset + 2 * BLOCK)
      if (next.length === 0 || next.every(byte => byte === 0)) {
        seenEnd = true
        break
      }
    }
    const nameField = field(header, 0, 100)
    const size = octalSize(header, 124, 12)
    const typeflag = String.fromCharCode(header[156] ?? 0)
    const linkname = field(header, 157, 100)
    offset += BLOCK

    if (typeflag === 'L') {
      // GNU long name: the payload of this entry is the real path.
      if (size > 1024 * 1024) throw new TarError('oversized long-name entry')
      const body = raw.subarray(offset, offset + size)
      pendingName = new TextDecoder().decode(body).replaceAll('\0', '').trim()
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }
    if (typeflag === 'x' || typeflag === 'g') {
      // pax extended header: only "path=" matters to us.
      const body = new TextDecoder().decode(raw.subarray(offset, offset + size))
      const pathMatch = /(?:^|\n)\d+ path=([^\n]+)/.exec(body)
      if (pathMatch !== null) pendingName = pathMatch[1]
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }
    if (typeflag !== '0' && typeflag !== '\0' && typeflag !== '5' && typeflag !== '2') {
      // Device nodes, fifos, hard links, sparse files, etc. — skip payload.
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }

    const path = safePath(pendingName ?? nameField)
    pendingName = undefined

    if (typeflag === '2') {
      symlinks.set(path, linkname)
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }
    if (typeflag === '5') {
      // Directory entry: no payload to store.
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }
    if (size > budget.maxFileBytes) {
      truncated = true
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }
    if (totalBytes + size > budget.maxTotalBytes || files.size >= budget.maxFiles) {
      truncated = true
      offset += Math.ceil(size / BLOCK) * BLOCK
      continue
    }
    const content = raw.subarray(offset, offset + size)
    files.set(path, content)
    totalBytes += size
    offset += Math.ceil(size / BLOCK) * BLOCK
  }

  if (!seenEnd) throw new TarError('archive ended prematurely (truncated tar stream)')
  return { files, symlinks, truncated, totalBytes }
}
