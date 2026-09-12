# Changelog

All notable changes to dsh-skill-pack-security are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.16] - 2026-09-12

### Fixed

- Write every version carrier from `VERSION` with `scripts/bump-version.mjs` before tagging.
  The 2.2.15 tag left `VERSION` and the derived carriers at 2.2.14, so the Publish
  workflow's 25-check verification failed at `version carriers drifted from VERSION 2.2.14`
  and no npm version shipped. 2.2.16 carries the rc.2 pin move and the provider-subtree
  sync that 2.2.15 was meant to deliver.

## [2.2.15] - 2026-09-12

### Fixed

- The vet provider's README corpus (`readmeTextOf`, the telemetry-disclosure input) selected files with `/^readme(\.|$)/i`, which covered `README.md` and the old `README.<lang>.md` names but not the renamed `README-<lang>.md` — so the scan silently stopped reading the four translations. The filter now accepts either separator, which also keeps third-party repositories on the dotted layout covered.

### Changed

- Rename the four translated READMEs to `README-<lang>.md`. npm selects the package-page readme as the first markdown file matching its `{README,README.*}` glob (`@npmcli/package-json`, publish path), and that glob order puts `README.<lang>.md` ahead of `README.md` — so npm was serving the Simplified-Chinese file for this package too (measured on 15/15 sampled packages of the family). The new names sit outside the glob, so the English source is served again. No content changed apart from the language-switcher link each translation holds to its siblings, and the repo readme gate still passes. Takes effect with the next release; an already-published version cannot gain a corrected readme retroactively.
- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.2` line and record `0.1.5-rc.2` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.2`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

## [2.2.14] - 2026-09-10

### Changed

- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.1` line and record `0.1.5-rc.1` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.1`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-rc.1` (verified 2026-09-10).


### Fixed

- **The `verify` workflow failed on the Windows runner with `version carriers drifted: 1 file(s)` / `DRIFT VERSION`.** The GitHub Actions `windows-latest` checkout applies `core.autocrlf=true`, so `VERSION` read back as `2.2.13\r\n` while `scripts/bump-version.mjs --check` compares against the literal `"2.2.13\n"` carrier content; the Ubuntu job passed because it checks out LF. The repository now ships a `.gitattributes` (`* text=auto eol=lf`, binary overrides) so every checkout is LF, and `--check` compares line-ending-insensitively so a CRLF working tree can never read as drift again.
- **`pnpm install` failed the supply-chain policy check on a cold CI runner with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`.** `minimumReleaseAgeExclude` matches package names/patterns, not `name@version` specs: the `@perrylink/dsh-skill-pack-security-provider@2.2.12` entry never exempted the lockfile check, which only passed while the runner's metadata cache was warm. The entry is now the bare package name, which exempts this repository's own exactly-pinned provider from the 24-hour age gate on a cold cache (verified with `--config.cacheDir`/`--store-dir` pointed at empty directories).

### Changed

- Root integration pin backfilled to the published provider 2.2.13: `dependencies["@perrylink/dsh-skill-pack-security-provider"]` and `pnpm-lock.yaml` now resolve `2.2.13` (post-publish step 10 of `docs/release-checklist.md`).

## [2.2.13] - 2026-09-09

### Fixed

- **`verify/verify-skill-pack.mts` hardcoded session format version 2, so it could never pass on a v3 harness.** The agent mock built its session header as `{ version: 2, ... }`, but `Session.create()` rejects any header whose version differs from the checkout's own `SESSION_FORMAT_VERSION` (`session header version must be 3, got 2` on harness master `19d2e38480`, while the CI-pinned ref `d347e70390` is still v2). The script now reads the live `SESSION_FORMAT_VERSION` from the harness session module and accepts 2 or 3; an absent or unsupported value fails loud instead of silently defaulting. `Inbox` had the same ruler split - a live class on the pinned ref, an interface only on master - so the mock now uses the class when the checkout exports one and otherwise a structural `unsupportedInbox()` stub mirroring the official `dsh-agent-loop-testkit`, whose mutators throw. Re-verified 25/25 on both the local v3 checkout and the pinned v2 copy.

## [2.2.12] - 2026-09-09

### Fixed

- **The 2.2.11 release never reached npm.** The Publish workflow's `skill pack verification (25 checks) before publish` job failed in `provider version: package.json syncs to the VERSION file` with `AssertionError: '2.2.11' !== '2.2.10'`: the bump moved `provider/package.json` and the two runtime user-agent defaults to 2.2.11 but left `VERSION`, the 16 `SKILL.md` `metadata.version` fields, and the five README `vet.userAgent` rows at 2.2.10. The tag `v2.2.11` published nothing, so `@perrylink/dsh-skill-pack-security-provider` stayed at 2.2.10 on npm. All 26 carriers are now in lockstep at 2.2.12.

### Added

- `scripts/bump-version.mjs`: one command writes every version carrier from a single input (`node scripts/bump-version.mjs 2.2.12`), and `--check` asserts all 26 carriers equal `VERSION` with a per-file drift report. A renamed carrier fails loud instead of silently skipping.
- `verify/verify-skill-pack.mts` check 11 now runs that `--check` instead of comparing `provider/package.json` alone, so a partial bump cannot pass verification again.

### Changed

- The root `dependencies["@perrylink/dsh-skill-pack-security-provider"]` pin is no longer bumped in the release commit. pnpm 11 runs a dependency-status check before every `pnpm run`, and the root lockfile resolves that dependency from the registry, so pinning the not-yet-published release version breaks `pnpm run check:readmes` with `ERR_PNPM_NO_MATCHING_VERSION`. The pin (and the root lockfile) are refreshed right after the npm publish — `docs/release-checklist.md` step 10.
- Root integration pin backfilled to the published provider 2.2.12: `dependencies["@perrylink/dsh-skill-pack-security-provider"]` and `pnpm-lock.yaml` now resolve `2.2.12` (the release commit deliberately stayed on 2.2.10 because a lockfile cannot resolve an unpublished version). The generated root `pnpm-workspace.yaml` carries the `minimumReleaseAgeExclude` entry pnpm requires for a version published inside the minimum-release-age window, so `pnpm install --frozen-lockfile` passes the supply-chain policy check; `node scripts/bump-version.mjs --check` still reports all 26 carriers at 2.2.12.

### Docs

- `docs/release-checklist.md` lists all 26 carriers and makes the bump script the release path (the PowerShell batch command stays as the documented manual fallback).

## [2.2.11] - 2026-09-09

### Changed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` and pin the dev/test dependencies to the published `0.1.5-alpha.1` line: adaptation to DeepSeek Harness `dsh-v0.1.5-alpha.1` (session format V3, `ctx.agent` removal, `Inbox` type-only interface); runtime behavior is unchanged for every supported host line.
- Record `0.1.5-alpha.1` in `dshWorkshop.compatibility.dshVersions`.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-alpha.1` (verified 2026-09-09).

## [2.2.10] - 2026-09-07

### Docs

- Fix the DSH plugin badge URL: shields.io rejects the four-segment static badge form with "404 badge not found"; the label now uses the documented double-dash form (`dsh--plugin`), rendering identically; no behavior change.


## [2.2.9] - 2026-09-07

### Docs

- Refresh the five-language README support-version wording (GitHub tag `dsh-v0.1.3-alpha.1` leads, npm `0.1.2-rc.1` stays the dependency-pin line) and carry 2.2.9 through every version carrier; no behavior change.


## [2.2.8] - 2026-09-06

### Changed

- All version carriers aligned to 2.2.8: `VERSION`, root and provider `package.json`, the 16 tracked `SKILL.md` files, the provider runtime user-agent/config strings, and the five-language README `vet.userAgent` rows.

### Fixed

- The provider's published peer ranges for `@deepseek-ai/dsh-skill-filesystem` and `@deepseek-ai/dsh-tools` started at `>=0.1.0-rc.8`, which under prerelease-tuple resolution matched only the 0.1.0-rc.8 line and broke fresh tarball installs against the published `0.1.2-rc.1` wave. Both now start at `>=0.1.2-rc.1 <0.2.0`, matching the root manifest; the provider README peer list is synced to the actual four peers and their current ranges. No behavior change.

## [2.2.7] - 2026-09-04

### Changed

- Align the provider dev pins and `dshWorkshop.compatibility.dshVersions` to the published dsh `0.1.2-rc.1` line, and advance the pinned deepseek-harness verification ref from `76fda72979` to `d347e70390` (dsh-v0.1.3-alpha.1) across the verify and publish workflows; no behavior change.
- All version carriers aligned to 2.2.7: `VERSION`, root and provider `package.json`, the 16 tracked `SKILL.md` files, and the provider runtime user-agent/config strings.

### Fixed

- 2.2.6 never left CI: its release run failed in the harness checkout step during a transient GitHub fetch outage, so 2.2.7 repackages the same changes with the verification ref advanced to the new baseline.

## [2.2.5] - 2026-09-03

### Changed

- `dshWorkshop.compatibility.dshVersions` raised from `0.1.2-alpha.3` to `0.1.2-alpha.5` (the provider dev pins were already on the alpha.5 line).
- All version carriers aligned to 2.2.5: `VERSION`, root and provider `package.json`, the 32 tracked `SKILL.md` frontmatter blocks, and the provider runtime user-agent/config strings; the root dependency on `@perrylink/dsh-skill-pack-security-provider` raised to 2.2.5.

## [2.2.4] - 2026-09-02

### Docs

- Sync the five-language READMEs to the 0.1.2-alpha.5 facts; no behavior change.

## [2.2.3] - 2026-09-02

### Changed

- Align the devDependency pins to the published dsh 0.1.2-alpha.5 line and re-verify the adaptation claims; no behavior change.

## [2.2.2] - 2026-09-01

### Changed

- Align the compatibility pins to the published dsh `0.1.2-alpha.3` line: the root and provider `dshWorkshop.compatibility.dshVersions` list `0.1.2-alpha.3`, the provider devDependencies pin `0.1.2-alpha.3` (cordis `^4.0.2`, schemastery `^3.18.2`), the verify/publish workflows checkout harness commit `dd6322d604`, and the compat probe installs the `0.1.2-alpha.3` CLI/base/headless. No behavior change.

## [2.2.1] - 2026-08-30

### Fixed

- CI verify workflow: the `Readme sync (five languages)` step was nested under the `Install harness workspace` step's keys, so GitHub Actions rejected the YAML and recorded the run as a failure with 0 jobs. The step is now a sibling step (the sync script belongs to this repo and runs at the repo root).
- The 25-check verification no longer imports the dsh-llm `CallId` brand from the harness checkout. Harness master renamed it to `ToolCallId`, so the script now derives the brand from the dsh-tools execution contract (`verify/call-id.ts`, mirroring `dsh-click/tests/call-id.ts`) and stays green on the pinned ref (`b150a551`) and on a future pin lift. The pinned harness ref is unchanged: this batch made no peer-dependency change.

## [2.2.0] - 2026-08-26

### Added

- **Dependency-scanner Provider seam** (`provider/src/vet/scanners.ts`). The `sbom` check now probes `osv-scanner` and `npm audit` CLIs and, when present, orchestrates their vulnerability output to replace the self-computed dependency scan; when neither CLI is available (or the target is remote), it degrades to the built-in zero-dependency tree scan. Every report annotates the effective source (`builtin` / `osv-scanner` / `npm-audit`) on the SBOM summary and on each vulnerability finding, so findings are never misattributed.
- **`vet.externalScanners` config** (default `true`) gates the external-scanner orchestration; `false` forces the built-in self-computed scan.

## [2.1.4] - 2026-08-23

### Added

- `THIRD_PARTY_NOTICES.md` records the project's third-party posture: the zero-dependency `plugin_vet` engine bundles no third-party code; the GPL-Radar / LLM-detective / Sus-PY assets were evaluated for porting but no licensed public source was found, so the license-scan and malicious-pattern checks remain original implementations; the installed-not-bundled peer dependencies are listed with their MIT licenses. Documented across all five README editions.

### Changed

- Root and provider manifests declare `engines.node` (`^22.19.0 || >=24.0.0`) and `packageManager` (`pnpm@11.7.0`) to match the dsh-plugin family baseline.

## [2.1.3] - 2026-08-22

### Changed

- Upgraded the provider's `@deepseek-ai/dsh-*` dev dependencies to `0.1.1-rc.2` (`dsh-skill-filesystem`, `dsh-tools`, `dsh-llm`) and synced the declared DSH compatibility (`dshWorkshop.compatibility.dshVersions`) in both manifests to `0.1.1-rc.2`. Peer ranges stay `>=0.1.0-rc.8 <0.2.0` (the provider uses no rc2-only API). CI pins sync to the `dsh-v0.1.1-rc.2` harness checkout (`b150a55`), and the compat profile installs `dsh`/`dsh-base`/`dsh-headless` at rc2. Verified against the rc2 harness: the 25-check skill-pack verification, the provider build/pack smoke, and a real headless profile run (mock LLM, `SMOKE-OK`) all pass.

## [2.1.2] - 2026-08-21

### Changed

- Upgraded the provider's `@deepseek-ai/dsh-*` dev and peer ranges to `0.1.0-rc.8` (`dsh-skill-filesystem`, `dsh-tools`, `dsh-llm`) and the root manifest's `dsh-skill-filesystem` peer to `>=0.1.0-rc.8 <0.2.0`; the declared DSH compatibility (`dshWorkshop`), the README compatibility tables, and the CI pins (harness checkout `141eb6f` = `dsh-v0.1.0-rc.8`; compat profile `dsh`/`dsh-base`/`dsh-headless` rc.8) all sync to rc8. Verified against the rc8 harness: the 25-check skill-pack verification, the provider build/pack smoke, and a real headless profile run (mock LLM, `SMOKE-OK`) all pass.

## [2.1.1] - 2026-08-19

### Fixed

- The publish workflow now runs the full 25-check skill verification before publishing (`needs: verify`); tag pushes previously bypassed it.
- Version-pin drift: the root manifest's provider dependency and the README's `vet.userAgent` default now track the provider version (both were left at 2.0.x at 2.1.0).

## [2.1.0] - 2026-08-18

### Added

- `plugin_vet` gains the `data-responsibility` check (the Claude policy-scan dimensions as deterministic rules; a model-assisted stage is the documented future upgrade): ungated listeners on sensitive seams, outbound endpoints without README telemetry/privacy disclosure, description-behavior keyword coverage, and embedded instruction-override payloads in shipped text — every finding cites the `prompt-injection-review` skill for the manual deep-dive. Config `vet.dataResponsibility` (default true) disables it per deployment; the `source` risk dimension now folds it in (weights source 0.5 / commit-lock 0.3 / data-responsibility 0.2).
- The scanner's injection-pattern literals are runtime-fragmented so the shipped scanner source itself does not trip content filters (a security scanner ships patterns, never payloads).

## [2.0.2] - 2026-08-17

### Fixed

- The provider's `@deepseek-ai/dsh-tools` peer range started at `>=0.0.1-rc.1`, so lowest-direct resolvers (pnpm v10+ default) resolved the unpublished-transitive `rc.1` era and a fresh `pnpm add` died with `ERR_PNPM_FETCH_404` on `@deepseek-ai/dsh-type-meta`. The lower bound now matches the family baseline: `>=0.1.0-rc.5 <0.2.0`.

## [2.0.1] - 2026-08-17

### Fixed

- Provider tarball was incomplete: `package.json#files` shipped only `lib/index.js` + type declarations, while `lib/index.js` imports `./vet/config.js` and `./vet/tool.js` — every published provider failed to load with `Cannot find module '…/lib/vet/config.js'` (reported as `Cannot find package '@perrylink/dsh-skill-pack-security-provider'` by install-time loaders). The `files` whitelist now ships `lib/vet/**`.
- CI pack smoke now asserts `package/lib/vet/config.js` inside the tarball so the gate engine can never silently drop out of a release again.

## [2.0.0] - 2026-08-16

### Added

- `plugin_vet` supply-chain gate tool (registered by the provider plugin on `ctx.tools`): license scan (LICENSE + SPDX; missing/unknown/NOASSERTION flagged), SBOM from the lockfile, commit-lock verification (install refs and workflow actions must be immutable 40-hex SHAs), malicious-pattern static checks (lifecycle scripts, network-exfiltration domains, obfuscated payloads), and a five-dimension risk report (license / source / dependencies / build scripts / maintenance) rendered as a card. Every finding cites the matching skill section for the manual deep-dive.
- Installation gate: `vet.gate.policy` — `warn` (default, non-blocking) or `deny` (blocks installs that fail the scan).
- Zero-dependency scan engine (`node:` builtins + relative imports only, enforced by a verification check); network fetches respect timeouts and `AbortSignal`; reports redact secret-shaped text.
- Demo runner `docs/demos/run-demos.mjs` plus artifacts for three real repositories (compliant / no license / postinstall) and the deny-gate replay.
- Verification grew from 19 to 25 checks: `plugin_vet` behavior through the real tools runtime, the zero-dependency invariant, and report redaction.
- GitHub Actions pinned to immutable SHAs in `.github/workflows/verify.yml`.

### Changed

- Provider bumped to 2.0.0 (`@perrylink/dsh-skill-pack-security-provider`): registers the skills provider AND the `plugin_vet` tool.
- Root bundle pins the provider to the exact `2.0.0` release.
- All 16 `SKILL.md` files reference the automated pre-check and carry `metadata.version: 2.0.0`.
- README (all five languages) documents `plugin_vet`, the gate configuration, the live demos, and the complementary relationship with `dsh-plugin-check`'s 36 contract checks.

## [1.3.0] - 2026-08-14

### Added

- Three new skills in both language editions (8 skills total), each following the pack's executable-command invariant:
  - `threat-model`: design-stage threat modeling — fix the target, trust boundaries, asset inventory, STRIDE per-asset table, optional graphviz attack trees, mitigation directions, deliverable self-check.
  - `vuln-intel`: vulnerability intelligence — NVD / CISA-KEV / GHSA / OSV query commands with response interpretation, rate-limit and misjudgment criteria, dependency-tree landing verdicts, and a brief template (`references/advisory-sources.md` carries the source-comparison table, jq quick reference, EPSS note, and offline paths).
  - `incident-response`: agent-environment incident response — classify → contain → evidence → recover → postmortem for secret leaks, prompt-injection triggers, dependency poisoning, and unauthorized actions (`references/runbook-and-postmortem.md` carries the per-type handling tables, timeline template, evidence-pack checklist, and hardening acceptance table).
- Ecosystem snapshot refreshed (2026-08-14): the three new skill names have no DSH name clashes; newly sighted community packs (`dhicoc/dsh-reverse-skill`, `cyzlmh/dsh-cyber-sec`, `ChenLaoshiYF/dsh-mcpguard`) were checked name-by-name.

### Changed

- Provider package renamed to `@perrylink/dsh-skill-pack-security-provider` and published to the npm registry — the unowned `@dsh-skill-pack-security` scope is not available to this publisher, so the bundle name, `cordis.patch.yml` name row, and all documentation now use the published name; `dsh plugin add @perrylink/dsh-skill-pack-security-provider` mounts the pack in one command.
- Verification suite now drives 8 skills per edition through the official provider, the real `skill` tool, and the session catalog (still 19 checks — they are per-catalog, not per-skill).
- Version sync points, skill counts, and the cross-skill references updated across README, localized READMEs, CONTRIBUTING, and the release checklist.

## [1.2.0] - 2026-08-14

### Fixed

- `docs/release-checklist.md` batch version command now reads UTF-8 and writes **BOM-less** UTF-8 via `[System.IO.File]::WriteAllText` (Windows PowerShell 5.1's `Set-Content -Encoding UTF8` adds a BOM, which the official parser rejects because the first line must be exactly `---`); a verification check asserts the BOM-less write and the layout check rejects any BOM in a SKILL.md.
- `prompt-injection-review`: `grep -E '^\s*…'` replaced with POSIX `[[:space:]]` in both editions (the GNU-only `\s` silently changes meaning under macOS BSD grep); a lint check now forbids GNU-only escapes in shipped shell greps.
- provider plugin fails loud on misconfiguration: empty/nonexistent `skillsDir` (or no resolvable layout) throws at `apply()` instead of mounting zero skills; root resolution supports both the repository and the published layouts.
- `dependency-audit`: `pnpm audit --json` `advisories` described correctly as an object keyed by advisory id (was "array") in both editions.
- CI pins the deepseek-harness checkout to a commit for reproducible verification.

### Added

- Verification: 7 new checks (19 total) — zh↔en structural parity, references wiring, provider-version sync, documented skill-root ranks vs official constants, grep portability, secret self-check, UTF-8-safe release checklist; `OFFICIAL_SKILLS` now derives from the checkout; Windows CI job runs the verification and the `install.ps1` exercise.
- Distribution: provider is now an npm bundle (`dsh.bundle` + `cordis.patch.yml`, `dsh plugin add` ready); `prepack` embeds both editions into the tarball; publishing checklist documented in `provider/README.md`.
- Installers: manifest-based install with `-Uninstall`/`--uninstall`, `-DryRun`/`--dry-run`, and overwrite protection (`-Force`/`--force` to replace foreign same-name skills).
- `secret-scan`: trufflehog (history + automatic verification), `gitleaks protect --staged`, `--log-opts` bounded scans, report-file hygiene, more token families in the degraded grep.
- `dependency-audit`: osv-scanner multi-ecosystem/offline section, SBOM inventory, provenance/signature verification (`npm audit signatures`, `dist.integrity`).
- `supply-chain-review`: git-dependency `prepare` script vector, GitHub Action SHA pinning, `dist.fileCount`/tarball-host anomalies, lockfile-growth re-check.
- `prompt-injection-review`: DSH built-in defense checklist (user-only `/name` gesture, catalog/body escaping, framing declaration), new surfaces (subagent/workflow prompts, tool render outputs, terminal echoes, image/PDF text, `cordis.yml` `!!js` blocks), write-approval and web-quarantine mitigations.
- `security-audit`: IaC/container asset surface (`trivy config`/`checkov`, `trivy image`), `pull_request_target` and action-pinning checks, finding ids (F-01…), optional compliance mapping appendix.
- Governance: `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`, and Dependabot configuration.

## [1.1.0] - 2026-08

- Added the English edition (`skills-en/`), the installer scripts for the four DSH skill roots, the optional provider plugin, and the 12-check verification suite with CI.

## [1.0.0] - 2026-07

- Initial release: the five security-audit skills (`security-audit`, `secret-scan`, `dependency-audit`, `supply-chain-review`, `prompt-injection-review`) in the Chinese edition.
