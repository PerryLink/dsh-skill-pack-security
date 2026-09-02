---
name: secret-scan
description: 'Credential/secret exposure audit: gitleaks and trivy full-history scan commands and arguments, false-positive alert tiers, the redacted-report spec, and the remediation flow ordered rotate → revoke → purge history → CI gate. Use for detecting secrets/tokens/passwords/private keys in a repository, investigating leaked history commits, judging whether scan alerts are real, or writing a leak report; ordinary code review unrelated to credentials does not use this skill.'
whenToUse: 'Use when the user asks to scan or inspect a repository for secret leaks, to hunt tokens in a commit or file, to tier scan alerts as real or false, to write a redacted leak report, or to plan secret rotation. Plain feature development and ordinary code review do not trigger this skill.'
metadata:
  pack: dsh-skill-pack-security
  version: '2.2.3'
---
# Secret scanning (secret-scan)

Goal: find real credentials in a repository (including its history) and drive remediation. Hard discipline: **no secret plaintext may appear in any output, report, or log**.

## 1. Tool readiness

```sh
gitleaks --version
trivy --version
trufflehog --version
```

Sample output (use the machine's actual output): `gitleaks version 8.24.3` / `Version: 0.61.0` / `trufflehog 3.88.12`.
Criterion: exit code 0 = available; non-zero or `command not found` = not installed.
Installation (if it cannot be installed, skip and use the Section-4 degraded grep, noting it in the report):

```sh
# Windows: scoop install gitleaks trivy trufflehog   (or winget install Gitleaks.Gitleaks AquaSecurity.Trivy TruffleSecurity.Trufflehog)
# macOS/Linux: brew install gitleaks trivy trufflehog
```

Write the actual version numbers into the report (a prerequisite of a reproducible audit).

## 2. Full-history scan (the default path)

```sh
gitleaks detect --source . --report-format json --report-path .gitleaks-report.json --redact -v
```

- Exit code: 0 = nothing found; **1 = findings, but also possibly a configuration/argument error** — stderr must be read to tell them apart.
- Sample stderr (real findings): `INFO: 42 leaks found. 120 commits scanned.`
- Sample stderr (configuration error): `unable to load config` — in this case exit code 1 does not mean leaks exist.
- Criterion: only stderr showing `leaks found` **and** a non-empty `Findings` array in the JSON count as findings; either one missing = fix the configuration and rescan.
- Sample output (with `--redact` the `match` is masked):

```json
{ "Description": "Generic API Key", "StartLine": 12, "File": "src/ci/deploy.sh",
  "Commit": "a1b2c3d4", "RuleID": "generic-api-key", "Secret": "REDACTED" }
```

- False-positive tiers and the allowlist: the complete four-tier table, the `.gitleaks.toml` allowlist syntax, and the baseline workflow live in `references/tool-usage.md`. Tier shorthand:
  - Tier A real secret (confirmed valid through the vendor's verification interface) → rotate immediately;
  - Tier B format-real but validity unconfirmable → treat as real;
  - Tier C test fixture / placeholder / documentation example → register in the allowlist;
  - Tier D already-rotated historical secret → record it; history cleanup is optional.
  Criterion: "this is a test file" alone never clears an alert; Tier C needs double evidence from file name and content (for example, the path contains `test`/`fixture` and the value contains `example`/`xxx`).
- Output hygiene: `.gitleaks-report.json` must not be committed — delete it after the scan or add it to `.gitignore` (`echo '.gitleaks-report.json' >> .gitignore`). `--redact` only masks secret values; the JSON still carries sensitive metadata such as file paths and commit hashes.
- Bounded-history scanning for huge repositories and the staged gate live in `references/tool-usage.md` (`--log-opts`, `gitleaks protect --staged`).

## 3. Trivy and Trufflehog cross-validation (lowers false positives; never the sole authority)

```sh
trivy fs --scanners secret --severity HIGH,CRITICAL .
```

Sample output lines:

```
src/ci/deploy.sh (secrets)

Total: 1 (HIGH: 1)
```

Criterion: reported by **both** gitleaks and trivy → very likely real, escalate for review; reported by only one → enter the Tier-B review flow, do not tier it directly.
Trivy scans the filesystem (it does not cover deleted history), so its coverage differs from gitleaks full-history — the report notes the difference.

Trufflehog (git history + automatic verification; the most direct tool evidence for a Tier-A judgment):

```sh
trufflehog git file://. --only-verified
```

Sample output lines (use the actual output):

```
Found verified result 🐷🔑
Detector Type: GitHub
```

Criterion: `Verified` = the tool already confirmed the secret with a read-only request → direct Tier-A evidence, rotate immediately; `Unverified` → treat as Tier B. Note: trufflehog issues the verification request using the found secret (mostly read-only health checks); if organizational policy forbids any outbound verification, use `--no-verification` and treat every alert as Tier B. Both trufflehog and gitleaks cover git history while trivy sees only the current tree — state the coverage differences in the report.

## 4. Degraded grep without the tools (bounded execution; rev-list depth must be limited)

```sh
git rev-list --all | head -n 500 | while read rev; do
  git grep -nE 'AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|sk-[A-Za-z0-9]{20,}|xox[bap]-[A-Za-z0-9-]{10,}|AZURE_STORAGE_[A-Za-z0-9]+=' "$rev" -- '*.js' '*.ts' '*.json' '*.env' 2>/dev/null
done
```

Sample output: `a1b2c3d:src/ci/deploy.sh:12:export GITHUB_TOKEN=ghp_...`
Criterion: a matching line containing `example`/`placeholder`/`xxx` or located in a test file → Tier C (still listed in the report); otherwise treat as Tier B.
The loose JWT shape (three `eyJ… .… .…` segments) matches too much and is only for spot-checking: `git grep -nE 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' "$rev" -- '*.json' '*.ts' '*.js'` — every hit still goes through the four tiers.
Limitation: grep only hits content still present in some commit tree and cannot cover deleted history — this is a degraded path, not an equivalent substitute.

## 5. Redacted report spec

The full details live in `references/redaction-and-remediation.md`. Key points:

- The report records only: type + first 6 characters + file/commit location + tier, never the full secret.
  Example: `GitHub token ghp_abc… | src/ci/deploy.sh:12 | commit a1b2c3d | Tier A`
- Self-check command (expected output: no matches):

```sh
grep -nE '(ghp_[A-Za-z0-9]|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]|-----BEGIN (RSA|OPENSSH|EC) )' report.md
```

- Validity verification (for Tier-A confirmation): rotate first, verify second; only enter the **already-rotated old value** into the vendor console/API — never send a live secret to any third-party verification service.

## 6. Remediation order (fixed order; skipping steps is forbidden)

1. **Rotate**: generate a new value at the issuer and replace every usage — the order is irreversible; purging history before rotating is meaningless.
2. **Revoke**: revoke the old secret in the vendor console; rotation is complete when the new secret works and the console shows the old one revoked.
3. **Purge history (optional, high risk)**: `git filter-repo --path <file> --invert-paths`, with two hard preconditions: a full repository backup + every collaborator notified and agreed to rebase after the force-push; without the preconditions, do not run it — write the recommendation only.
4. **Defend**: `.gitignore` exclusions (`echo '.env*' >> .gitignore`), a gitleaks pre-commit or CI gate (config fragments in `references/redaction-and-remediation.md`); the gate is complete when a deliberately committed fake secret is blocked.
