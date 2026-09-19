#!/usr/bin/env node
// scripts/typecheck-checkout.mjs - the checkout face of this repo's type ruler.
//
// The two rulers exist to measure two different type universes:
//   - this script (tsconfig.check.json): `paths` point at the D:\deepseek-harness
//     checkout's built types -> "the shape of the host source line".
//   - `typecheck:ci` (tsconfig.check.ci.json, no `paths`): the published line ->
//     "the shape a user actually installs".
// Before this guard existed both configs resolved the same node_modules, so the
// second ruler was decorative.
//
// The checkout only exists on a developer machine. On a runner it is absent and this
// ruler is simply UNVERIFIABLE: print one line and exit 0 - never hand CI a step that
// can only ever be red. `typecheck:ci` still runs everywhere.
//
// Exit codes: 0 = passed or unverifiable; 2 = type errors (tsc's own non-zero code).

import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHECKOUT_ROOT = 'D:/deepseek-harness'
const REQUIRED_TYPE_FACES = [
  'vendor/cordis/lib/types/index.d.ts',
  'packages/llm/llm/lib/types/index.d.ts',
  'packages/skill/skill-filesystem/lib/types/index.d.ts',
  'packages/core/tools/lib/types/index.d.ts',
  'vendor/schemastery/lib/types/index.d.ts',
]

const missing = REQUIRED_TYPE_FACES.filter((relative) => !existsSync(path.join(CHECKOUT_ROOT, relative)))
if (missing.length > 0) {
  console.log('typecheck(checkout face): unverifiable - ' + CHECKOUT_ROOT + ' is missing ' + missing.length + ' type entry(ies), e.g. ' + missing[0])
  console.log('  No host checkout on this machine (CI runners are like this). Run the published-line ruler instead.')
  process.exit(0)
}

const result = spawnSync('npx', ['tsc', '-p', path.join(repoRoot, 'tsconfig.check.json')], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)