# Redaction spec and remediation flow (secret-scan/references/redaction-and-remediation.md)

The complete details behind Sections 5 and 6 of the main file.

## Redaction rules

1. A secret may appear in the report in only three representations:
   - Type marker + first 6 characters + ellipsis: `GitHub token ghp_abc…`
   - Hash reference: `first 12 hex chars of sha256` (`echo -n '<value>' | sha256sum` then truncate, so logs can be cross-checked without leaking the value)
   - Location reference: `file:line + commit hash` (e.g. `src/ci/deploy.sh:12 @ a1b2c3d`)
2. Never allowed: the full secret, raw gitleaks JSON from before `--redact`, or echoed secrets pasted in the terminal.
3. Run the self-check after every generated report:

```sh
grep -nE '(ghp_[A-Za-z0-9]|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]|-----BEGIN (RSA|OPENSSH|EC) )' report.md
```

Expected output: no matches. A match means the report itself leaks — fix it before delivering.

## The four remediation steps (fixed order)

### 1. Rotate

- Generate a new value at the issuer (GitHub/GitLab/cloud vendor).
- Replace every usage: `git grep -l '<first 6 chars of the old secret>'` finds the referencing files, then replace one by one.
- Completion criterion: the new secret works (one successful run of the original purpose with the new value) and the old secret is referenced by no configuration (`git grep '<first 6 chars>'` hits nothing).

### 2. Revoke

- Revoke the old secret in the console.
- Completion criterion: the console shows it revoked; where the vendor supports it, call the API once with the old value and expect 401/403 (the call sends only the old, already-revoked value — safe).

### 3. Purge history (optional, high risk)

```sh
git filter-repo --path <leaked file> --invert-paths --force
git push origin --force --all
```

- Hard preconditions (missing either one → do not run, write the recommendation only): a complete repository backup (`git clone --mirror <url> backup.git`); every collaborator informed and agreed to rebase.
- Known cost: all commit hashes change; PR/CI associations all break.
- Alternative when not running it: keep the history and write "historical secret rotated + revoked (Tier D); residual history not purged because <reason>".

### 4. Defend (gates)

- `.gitignore` exclusions: `printf '.env*\n*.pem\n' >> .gitignore` (already-tracked files additionally need `git rm --cached <file>`).
- Pre-commit gate (`.pre-commit-config.yaml` fragment):

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.3
    hooks:
      - id: gitleaks
```

- CI gate (one step in any CI): `gitleaks detect --source . -v`, failing on any non-zero exit.
- Completion criterion: deliberately commit a fake secret (e.g. `ghp_FAKE0000000000000000000000000000FAKE`) to a test branch — the gate must block it; after the block is confirmed, the test commit may be removed.
