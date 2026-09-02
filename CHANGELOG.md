# Changelog

All notable changes to dsh-skill-pack-security are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
