---
name: dependency-audit
description: 'Dependency supply-chain audit: reading pnpm/npm audit output and exit codes, a license and poisoning risk checklist, and lockfile-drift detection commands. Use when the task requires auditing a project dependencies known vulnerabilities, license risks, suspicious packages, or lockfile consistency and writing a conclusion; installing/upgrading one dependency or plain feature work does not expand this flow.'
whenToUse: 'Use when the user asks to audit or inventory project dependency security (vulnerabilities, licenses, poisoning, lockfile drift), to interpret an audit report, to judge whether a dependency may be introduced, or to write a dependency-audit conclusion. Upgrading a single dependency and plain feature development do not trigger this skill.'
metadata:
  pack: dsh-skill-pack-security
  version: '2.1.0'
---
# Dependency audit (dependency-audit)

Goal: produce an audit of the repository's dependency surface in which **every conclusion carries command evidence**. The output has seven blocks: known vulnerabilities, licenses, poisoning risk, lockfile drift, multi-ecosystem vulnerabilities, the SBOM inventory, and provenance/signatures.

## Automated pre-check: the plugin_vet tool

`plugin_vet` already runs the static parts of sections 3/4/7 (license verdicts, the poisoning checklist, the SBOM dependency tree), and its findings cite those section numbers. After an automated hit, verify the evidence and rule out false positives with each section's commands.

## 1. Locate the package manager and lockfile

```sh
git ls-files -- 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock' 'bun.lockb' 'npm-shrinkwrap.json'
node --version; pnpm --version
osv-scanner --version
```

Sample output (a pnpm repository): one line each for `package.json` and `pnpm-lock.yaml`.
Criterion: the lockfile decides the command family (pnpm → Section 2; npm → the npm variant in the same section); **multiple lockfiles side by side = repository anomaly**, write it as a finding; version numbers go into the report (audit data varies with the registry and tool versions); a missing `osv-scanner` only affects Section 6 — note it.

## 2. Known vulnerabilities: pnpm audit

```sh
pnpm audit --prod --json > audit.json; echo $LASTEXITCODE
```

(bash uses `$?`; PowerShell uses `$LASTEXITCODE`.)

- Exit code: 0 = no known vulnerabilities; non-zero = vulnerabilities **or** an unreachable registry (stderr containing `fetch`/`ECONNREFUSED`/`ETIMEDOUT` means a network failure, not findings — retry before concluding).
- `--prod` audits production dependencies only; for a full view, also run `pnpm audit --json` and apply the devDependencies downgrade rule below to that part.
- Sample output (`advisories` is an **object keyed by advisory id**; the example below is one of its values — fields per the actual output):

```json
{ "id": "GHSA-xxxx-yyyy-zzzz", "severity": "high",
  "module_name": "example-lib", "vulnerable_versions": "<2.3.0",
  "patched_versions": ">=2.3.1", "recommendation": "Upgrade to 2.3.1",
  "found": { "paths": ["prod-dep@1.0.0 > example-lib@2.2.9"] } }
```

- Reading rules:
  - `severity`: trust only the registry value (low/moderate/high/critical); never infer your own.
  - Check every advisory for `patched_versions`; when absent there is no fixed version — record "no fixed version", never claim "upgrade and it is fixed".
  - Impact paths only inside devDependencies → report one tier lower by default, unless that devDep enters the build output (proved with code evidence, never asserted verbally).
- False-positive criteria (full table in `references/pnpm-audit-reading.md`): advisory status disputed/withdrawn, version range not covering the installed version, unreachable path (unreachable needs call-site evidence: `pnpm why <package>` plus source grep with no references).
- npm project variant: `npm audit --json` (same 0/non-zero exit-code semantics; the structure is a `vulnerabilities` object instead of an `advisories` object — sample in the references).

## 3. License check

```sh
pnpm licenses list --json
```

Sample row: `{ "name": "example-lib", "license": "MIT" }` (structure per the actual output).
Hunt for three problem classes:

1. **Undeclared**: license field empty/null → record "no license declaration" (usage itself is a compliance risk).
2. **Strong copyleft**: GPL/AGPL/SSPL/CPAL etc. among direct dependencies (full list in `references/license-and-lockfile.md`) → locate the purpose: `pnpm why <package>` gives the dependency chain.
3. **Non-SPDX**: value containing `SEE LICENSE IN <file>` → `git ls-files -- '<package dir>/**/LICENSE*'` or unpack and read that file before concluding.

Criterion: a license-risk conclusion = package name + dependency chain + license + purpose; a package whose purpose cannot be found (no import in source) is recorded separately as "unused dependency".

## 4. Poisoning-risk checklist (check each item for every "new/suspicious" dependency)

The complete commands and threshold table live in `references/license-and-lockfile.md`; the five items in shorthand:

1. **Name similarity**: `npm view <package> time.created` (sample: `2026-08-10T02:00:00.000Z`). Criterion: created < 30 days ago with extremely low downloads → high-risk flag; hand to `supply-chain-review` for the typosquat judgment.
2. **Install scripts**: `npm view <package> scripts --json` (sample: `{ "postinstall": "node scripts/download.js" }`). Non-empty → hand to `supply-chain-review` Section 1 to check the dangerous patterns one by one.
3. **Publisher and repository**: `npm view <package> repository.url maintainers --json`. Criterion: missing repository / pointing at a suspicious fork + zero maintainer history → record.
4. **Network behavior**: `npm pack <package> --pack-destination .tmp` then `grep -rnE 'https?://' .tmp/<package>/` to inspect requested domains. Criterion: domains unrelated to the package's purpose → record and review manually.
5. **Provenance**: `npm view <package> provenance --json`. Criterion: no provenance does not equal malicious, but it goes into the risk record.

Criterion: one hit is only a "record"; **two or more simultaneous hits upgrade it to a "finding"** — this prevents single-item misjudgment.

## 5. Lockfile drift detection

Steps and commands:

```sh
git diff HEAD -- pnpm-lock.yaml | head -n 40
pnpm install --frozen-lockfile
grep -c 'integrity' pnpm-lock.yaml
```

- Step 1 criterion: a non-empty diff = the lockfile changed; review block by block for anything unintended (merge-conflict residue `<<<<<<<` counts too).
- Step 2 criterion: under CI semantics any drift fails immediately.
  Sample failure output: `ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json`
  Local passes + CI fails = a platform difference (optionalDependencies) → compare package by package; **never turn off frozen-lockfile**.
- Step 3 criterion: the integrity entry count should be on the same order as the dependency entry count; clearly fewer = the lockfile was hand-edited/corrupted.
- Drift cause classification, verification commands, and the lockfileVersion table live in `references/license-and-lockfile.md`.

## 6. Multi-ecosystem and offline: osv-scanner

```sh
osv-scanner scan -r .
```

Sample output lines (use the actual output):

```
Scanning dir .
Scanned <project>/package-lock.json file and found 2 packages
```

- Criterion: exit code 0 = nothing found; non-zero = vulnerabilities or an argument error (stderr tells them apart). `-r .` auto-detects every lockfile in the directory (pnpm/npm/yarn/bun/pip/Cargo/Go/Maven and more); for a single file use `osv-scanner scan lockfile <file>`.
- Difference from pnpm audit: osv-scanner queries the OSV database (aggregating GitHub Advisories and other sources) and covers ecosystems pnpm audit cannot see; when the two disagree, compare advisory by id — neither one is a false-positive authority over the other.
- Offline path: `osv-scanner scan -r . --offline` (with local OSV data) for registry-unreachable environments; the report states the data version.

## 7. SBOM inventory (a machine-replayable asset list)

```sh
trivy sbom . --format cyclonedx -o sbom.cdx.json
# or syft dir:. -o spdx-json=sbom.spdx.json
```

Sample output: exit code 0, printing the artifact path (`sbom.cdx.json`).
Criterion: attach the SBOM to the report as the dependency inventory appendix; its entry count should be on the same order as `pnpm licenses list` — a mismatch is recorded with a reason. An SBOM holds no secrets but does carry the dependency topology; protect it at the same level as the report.

## 8. Provenance and signatures

```sh
npm view <package> provenance --json
npm view <package> dist.integrity --json
npm audit signatures
```

- Criterion: a non-empty `provenance` = the package was built in CI and carries a build-source attestation; `dist.integrity` must equal the same package version's `integrity` value in the lockfile — a mismatch means the lockfile was hand-edited or the package was replaced, so upgrade it to a finding immediately.
- `npm audit signatures` verifies registry signatures: exit code 0 = pass; non-zero lists packages with missing/invalid signatures — record them and review their origin manually.
- No provenance does not equal malicious, but it goes into the risk record (same rule as Section 4 item 5).

## Conclusion format

Every conclusion = assertion + command + output summary + false-positive exclusion note ("I excluded X because <evidence>"). Worries without evidence go into "observations", never into "findings".
