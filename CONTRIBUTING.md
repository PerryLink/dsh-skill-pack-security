# Contributing to dsh-skill-pack-security

## Adding or changing a skill

1. Both language editions change in the same commit: `skills/` (Chinese) and `skills-en/` (English) keep identical structure — same heading levels, same fenced-code-block count, and the same reference file names (CI enforces this).
2. A `SKILL.md` stays at or under 300 lines; details go into `references/`, and the main file must mention every reference file it ships (no dangling or orphan files — CI enforces this too).
3. Every step stays a real command with an expected-output sample, an exit-code criterion, and false-positive criteria — no unverifiable assertions.
4. Shell `grep -E` patterns stay POSIX-portable: use `[[:space:]]` and friends, never GNU-only escapes such as `\s`/`\d`/`\w` (macOS BSD grep misreads them; CI lints every shipped pattern).
5. Versioning: bump `VERSION` first, then sync the 16 `SKILL.md` `metadata.version` values and `provider/package.json` with the release-checklist batch command (keeping `-Encoding UTF8`).

## Verification

- `verify/verify-skill-pack.mts` runs 25 checks against the official `dsh-skill-filesystem` parser, the real `skill` tool, and the real tools runtime from a local deepseek-harness checkout (auto-resolved beside the pack, or set `DSH_HARNESS_CHECKOUT`).
- Provider: `cd provider && pnpm install --frozen-lockfile && pnpm run build && pnpm pack --pack-destination .tmp` — the tarball must carry `lib/` **including `lib/vet/*` (the plugin_vet engine that `lib/index.js` imports)**, both embedded editions under `pack/`, and `cordis.patch.yml` (CI pack smoke asserts these exact paths).
- Installers: exercise `scripts/install.ps1` (Windows PowerShell 5.1) and `scripts/install.sh` (POSIX), including `--dry-run`, the overwrite protection, and `--uninstall`.
- CI runs the same checks on Ubuntu and Windows against a pinned harness commit; bump the `ref` in `.github/workflows/verify.yml` when the provider's peer dependencies or the skill-format assumptions change.

## Release

Follow `docs/release-checklist.md` exactly: sync versions, run local verification, wait for all CI jobs, tag `v<version>`, publish GitHub Releases notes from the CHANGELOG entry. Refresh `docs/ecosystem-conflict-check.md` only when skill names or positioning change.
