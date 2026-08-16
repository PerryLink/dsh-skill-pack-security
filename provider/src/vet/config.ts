/**
 * Resolved plugin_vet configuration: plain values with defaults applied.
 *
 * The Schemastery schema lives in `../index.ts` next to the skills-provider
 * config; this module only consumes the already-validated plain object so the
 * engine never depends on Schemastery at runtime.
 *
 * @module dsh-skill-pack-security/vet/config
 */

import type { GatePolicy } from './vocabulary.js'

/** Raw config block as validated by the Schemastery schema. */
export interface VetConfigInput {
  readonly enable?: boolean
  readonly timeoutMs?: number
  readonly maxFiles?: number
  readonly maxFileBytes?: number
  readonly maxExtractBytes?: number
  readonly maxDepNodes?: number
  readonly maxFindingsPerCheck?: number
  readonly userAgent?: string
  readonly gate?: { readonly policy?: GatePolicy }
}

/** Fully resolved configuration with defaults applied. */
export interface VetConfig {
  readonly enable: boolean
  readonly timeoutMs: number
  readonly maxFiles: number
  readonly maxFileBytes: number
  readonly maxExtractBytes: number
  readonly maxDepNodes: number
  readonly maxFindingsPerCheck: number
  readonly userAgent: string
  readonly gate: { readonly policy: GatePolicy }
}

export const VET_DEFAULTS: VetConfig = {
  enable: true,
  timeoutMs: 15000,
  maxFiles: 800,
  maxFileBytes: 256 * 1024,
  maxExtractBytes: 64 * 1024 * 1024,
  maxDepNodes: 600,
  maxFindingsPerCheck: 12,
  userAgent: 'dsh-skill-pack-security/2.0.0 (+https://github.com/PerryLink/dsh-skill-pack-security)',
  gate: { policy: 'warn' },
}

/** Merge raw config over the defaults (the schema already validated shape/ranges). */
export function resolveVetConfig(raw: VetConfigInput | undefined): VetConfig {
  if (raw === undefined) return VET_DEFAULTS
  return {
    enable: raw.enable ?? VET_DEFAULTS.enable,
    timeoutMs: raw.timeoutMs ?? VET_DEFAULTS.timeoutMs,
    maxFiles: raw.maxFiles ?? VET_DEFAULTS.maxFiles,
    maxFileBytes: raw.maxFileBytes ?? VET_DEFAULTS.maxFileBytes,
    maxExtractBytes: raw.maxExtractBytes ?? VET_DEFAULTS.maxExtractBytes,
    maxDepNodes: raw.maxDepNodes ?? VET_DEFAULTS.maxDepNodes,
    maxFindingsPerCheck: raw.maxFindingsPerCheck ?? VET_DEFAULTS.maxFindingsPerCheck,
    userAgent: raw.userAgent ?? VET_DEFAULTS.userAgent,
    gate: { policy: raw.gate?.policy ?? VET_DEFAULTS.gate.policy },
  }
}
