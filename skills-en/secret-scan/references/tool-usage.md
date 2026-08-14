# gitleaks/trivy usage and false-positive tiers (secret-scan/references/tool-usage.md)

The complete command tables and four-tier criteria behind Sections 2 and 3 of the main file.

## gitleaks command table

| Purpose | Command | Exit code / criterion |
|---|---|---|
| Full-history scan | `gitleaks detect --source . --report-format json --report-path r.json --redact -v` | 0 = nothing found; 1 = findings or a configuration error (read stderr to tell them apart) |
| Current working tree only | `gitleaks detect --source . --no-git` | Same as above; excludes history — the report notes it |
| Bounded-history scan (huge repositories) | `gitleaks detect --source . --log-opts="--since=2.years" -v` | Same as full scan; the report notes only the last 2 years were scanned |
| Staged gate (pre-commit) | `gitleaks protect --staged` | 0 = pass; non-zero = the staged content holds alerts, block the commit |
| Scan against a baseline | `gitleaks detect --source . --baseline-path baseline.json -v` | Alerts already in the baseline are not reported again; a baseline records "known", never "fixed" |
| Generate a baseline | `gitleaks detect --source . --report-format json --report-path r.json -v; gitleaks baseline --source . --report-path r.json --baseline-path baseline.json` | Only generate a baseline for alerts reviewed and accepted as "known" |
| Quick single-file check | `gitleaks dir <path>` | Prints alert lines; does not cover history |

### Sample JSON structure (after `--redact`)

```json
{
  "Description": "Generic API Key",
  "StartLine": 12,
  "EndLine": 12,
  "StartColumn": 20,
  "Match": "REDACTED",
  "Secret": "REDACTED",
  "File": "src/ci/deploy.sh",
  "SymlinkFile": "",
  "Commit": "a1b2c3d4e5f6",
  "Entropy": 4.2,
  "Author": "dev@example.com",
  "Email": "dev@example.com",
  "Date": "2026-08-01T10:00:00+08:00",
  "Message": "add deploy script",
  "RuleID": "generic-api-key",
  "Fingerprint": "a1b2c3d4e5f6:src/ci/deploy.sh:generic-api-key:12"
}
```

Field criteria: `Commit` locates historical alerts (no longer present in the tree); `Fingerprint` deduplicates across scans; an alert with low `Entropy` and a `generic-*` `RuleID` is more likely a false positive, but **low entropy alone never clears it** — the four-tier criteria still apply.

## Allowlist configuration (minimal `.gitleaks.toml` example)

```toml
[allowlist]
  description = "team-reviewed allowances"
  paths = ['''tests?/''', '''fixtures?/''']
  regexes = ['''EXAMPLE_[A-Za-z0-9_]+''']
  commits = ["a1b2c3d4e5f6"]  # only for "rotation confirmed" historical commits
```

Criterion: paths/regexes use concrete prefixes (`tests?/`), never a blanket `.`; every commits allowlist entry needs a review record, so a commit holding a real secret cannot be masked wholesale.

## trivy command table

| Purpose | Command | Criterion |
|---|---|---|
| Secret scan (current tree) | `trivy fs --scanners secret --severity HIGH,CRITICAL .` | Non-zero exit = high-severity findings; output lines list files and counts |
| Including low severity | `trivy fs --scanners secret .` | For comparing with gitleaks Tier C/D |
| A specific directory | `trivy fs --scanners secret --severity HIGH,CRITICAL <dir>` | Same rules |

Difference from gitleaks: trivy does not read git history; trivy's `secret` rules come from a different ruleset than gitleaks. Both report → escalate for review; only one reports → Tier-B flow.

## trufflehog command table

| Purpose | Command | Criterion |
|---|---|---|
| Full history + automatic verification | `trufflehog git file://. --only-verified` | `Verified` = direct Tier-A evidence (the tool already confirmed the secret with a read-only request); `Unverified` = Tier B |
| Verification disabled | `trufflehog git file://. --no-verification` | Use when organizational policy forbids outbound verification; every alert is treated as Tier B |
| Current directory only | `trufflehog filesystem .` | Does not read history — the report notes it |

Criterion: trufflehog issues its verification requests using the found secret (mostly read-only health checks such as a `/user` query); any outbound verification must be stated in the report (which secrets were sent to which vendor endpoints).

## Four-tier false-positive criteria (each tier with its verification command)

| Tier | Definition | Verification command | Clear condition |
|---|---|---|---|
| A real | Secret verifiably valid (trufflehog `Verified`, or confirmed through the vendor console/API) | Vendor console/API query (enter only the rotated old value) | Never clears → rotate immediately |
| B suspected | Format-real, unconfirmable | `git log -p -S'<first 6 chars>' -- <file>` to read the introducing context | No clear condition; treat as real |
| C test/placeholder | Test fixture, documentation example | Double check of name and content: path contains test/fixture and value contains example/xxx | Allowlist registration only when both hold |
| D historical rotated | Rotated and revocation completed | Console revocation screenshot/record + rotation time | With a record, clear; history cleanup optional |

General criterion: **any alert without evidence is treated at the higher tier**; clearing requires a written record (tier + verification command + output) — "it looks like a false positive" is never a valid clearance.
