# Changelog

All notable changes to dsh-skill-pack-security are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
