# Handling details and postmortem template (incident-response/references/runbook-and-postmortem.md)

Complete handling details, the timeline template, and the postmortem template for sections 1–5 of the main file.

## Handling details for the four incident types

### Secret leak

| Step | Action | Acceptance command/criterion |
|---|---|---|
| 1 Rotate | create the new value at the issuer and replace every use site | new value live (the service authenticates with it) |
| 2 Revoke | revoke the old value in the vendor console | console shows revoked |
| 3 Locate | `git grep -n '<first 6 chars>' <commit hash> -- '<path>'` finds the leak site | output line hits and is credential-shaped |
| 4 Purge history (optional) | `git filter-repo --path <file> --invert-paths` (skip unless both preconditions hold: full backup + all collaborators notified) | re-scan after the rewrite shows no hit |
| 5 Gate | `gitleaks protect --staged` or a CI gate | committing a fake key on purpose is blocked |

### Prompt-injection trigger

| Step | Action | Acceptance |
|---|---|---|
| 1 Disable | remove the trigger source (MCP/web flow/malicious repo) | source gone from the config dump |
| 2 Isolate | pause sessions and related automation; check whether downloads/exfiltration happened | no same-kind action within 24 hours |
| 3 Investigate | walk every surface with the `prompt-injection-review` three questions | every surface has a verdict |
| 4 Harden | framing declaration + write-approval gate + web-content quarantine | replaying the same injected text triggers no action |

### Dependency poisoning

| Step | Action | Acceptance |
|---|---|---|
| 1 Roll back | `git revert --no-commit <introducing commit>` or revert the lockfile | dependency tree back to pre-introduction |
| 2 Freeze | CI keeps `--frozen-lockfile`; pause dependabot/renovate merges | no automatic dependency changes |
| 3 Analyze | check install scripts/network calls per `supply-chain-review` section 1 | every new package has a verdict |
| 4 Tighten | pin actions to SHAs, forbid unreviewed install scripts | new PRs' dependencies get blocked by review rules |

### Unauthorized action

| Step | Action | Acceptance |
|---|---|---|
| 1 Revoke | revoke all related credentials (GitHub token, CI secrets, session credentials) | old-credential calls return 401 |
| 2 Pause | pause CI/automation, freeze repo write access | no new writes during observation |
| 3 Evidence | `git log --since` timeline + platform audit logs | every suspect action has a record |
| 4 Harden | least privilege, narrower token scopes, 2FA on | the permission matrix passes re-review |

## Timeline template

| Time (UTC) | Actor (person/service/session) | Action | Evidence reference (command + output location) | Re-checked |
|---|---|---|---|---|
| 2026-08-14T10:30Z | CI (deploy token) | unexpected deploy.yml run | `git log --since` entry 3 | yes |

Rules: ISO-8601 times; the "actor" must trace to a specific credential/session; evidence references point into the evidence pack, never paste the raw text (raw text is redacted per `secret-scan`).

## Evidence pack checklist

1. The timeline table (template above);
2. Raw command outputs: `git log`/`git diff`/config dump/scanner alerts (redacted);
3. Copies of involved files: workflows, configs, lockfile diffs;
4. Platform-side records: CI run records, vendor-console revocation records/screenshots.

## The five-part postmortem template

```markdown
# <incident name> postmortem
## 1. Timeline
(table, see above)
## 2. Root cause
(why it happened — separate the direct cause from the systemic cause)
## 3. Impact assessment
(exposure surface / execution surface / availability, backed by evidence commands)
## 4. Handling record
(tick each item of the section-2 containment checklist)
## 5. Hardening items
| Hardening item | Root cause | Acceptance command/criterion | Status |
```

## Hardening acceptance table (example)

| Hardening item | Root cause | Acceptance |
|---|---|---|
| pre-commit gitleaks gate | plaintext secret committed | committing a fake key is blocked |
| framing declaration in the system injection | web content triggered instructions | replaying the injected text does nothing |
| all actions SHA-pinned | tags can be moved | `git grep -nE 'uses: [A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+@v[0-9]' -- '.github/workflows/**'` outputs nothing |
| CI token narrowed to one repo | over-broad token | out-of-scope calls return 403 |
