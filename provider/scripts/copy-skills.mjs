/**
 * Prepack: embed both skill editions into the package so `pnpm pack`
 * produces a self-contained tarball (npm `files` cannot reach outside the
 * package directory). Copies the canonical ../skills and ../skills-en trees
 * into pack/ beside lib/. Run by the `prepack` lifecycle before pack/publish.
 *
 * Run: node scripts/copy-skills.mjs
 */

import { cp, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const packRoot = join(here, '..', '..')
const targetRoot = join(here, '..', 'pack')

await rm(targetRoot, { recursive: true, force: true })
for (const edition of ['skills', 'skills-en']) {
  await cp(join(packRoot, edition), join(targetRoot, edition), { recursive: true })
  console.log(`copied ${edition} -> pack/${edition}`)
}
