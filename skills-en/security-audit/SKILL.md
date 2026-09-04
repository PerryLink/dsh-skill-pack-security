---
name: security-audit
description: 'Repository/software security audit overview: a staged flow of scope definition, asset inventory, risk tiering, item-by-item verification, and a report template, dispatching to the four specialist skills secret-scan, dependency-audit, supply-chain-review, and prompt-injection-review as needed. Use when the user asks for a whole-repo audit, an audit plan, or a consolidated multi-class findings report; for a single topic such as secrets or dependencies, load the matching specialist skill directly.'
whenToUse: 'Use when the user asks for a security audit of a code repository or project, an audit plan, staged audit steps, a consolidated findings report, or is unsure which specialist skill to start with. Single-topic tasks (only secrets, only dependencies, only one PR, only injection surfaces) load the matching specialist skill directly and do not trigger this overview.'
metadata:
  pack: dsh-skill-pack-security
  version: '2.2.6'
---
# Security audit overview (security-audit)

This skill orchestrates the complete flow of one repository security audit and produces a report in which **every finding can be re-verified with a single command**. It only orchestrates; the check details for the four topics live in `secret-scan` (secrets), `dependency-audit` (dependencies), `supply-chain-review` (new-dependency review), and `prompt-injection-review` (injection surfaces of agent projects). When a stage is reached, load the matching specialist skill on demand with the `skill` tool — do not rewrite its details here.

## Automated pre-check: the plugin_vet tool

The pack's provider also registers the `plugin_vet` tool (license scan / SBOM / commit pinning / malicious patterns / five-dimension scoring). It performs only machine pre-checks; every finding cites the matching skill section of this pack, and after a hit you continue with this skill's manual audit flow. A FAIL verdict under a deny gate policy blocks installation.

## Stage 0: fix the audit target (an unfixed target makes the report unreproducible)

```sh
git rev-parse --show-toplevel
git log -1 --format='%H %cd' --date=iso-strict
```

Expected sample output (use the actual output):

```
D:\repo\example
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0 2026-08-14T10:30:00+08:00
```

Criterion: `git rev-parse` exits 0 and the first line is an absolute path; a non-zero exit means this is not a git repository — stop and explain why.
The report metadata must record this commit hash so a reviewer can replay every check command at any time.

Confirm tool availability (each specialist skill has a degraded path for missing tools; never claim a check was "scanned" when it was not run):

```sh
gitleaks --version; trivy --version; pnpm --version
checkov --version
```

Sample output: `gitleaks version 8.24.3` / `Version: 0.61.0` / `10.9.0` / `3.2.x`.
Criterion: exit code 0 per command = available; non-zero or `command not found` = unavailable — the report states "not run (tool unavailable)". A missing checkov does not block the audit (the IaC surface uses `trivy config` or degrades to manual review).

## Stage 1: scope definition

Deliverable: the **audit scope list** — enumerate the files, directories, dependencies, and configuration paths included in the audit, with every exclusion and its reason.

```sh
git ls-files | wc -l
git ls-files -- 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock' '*.toml' '*.yaml' '*.yml' '.github/workflows/**'
```

Sample output: `1234` (the first line is the total file count), followed by the manifest and configuration file paths; a missing class of files yields an empty line for that class.
Criterion: empty output = the class of files does not exist — the report writes "not found" instead of omitting the class.
Boundary assumptions go into the report: by default only files tracked by `git ls-files` are audited; whether submodules, upstream mirrors, and CI environment variables are included must be stated in the scope list.

## Stage 2: asset inventory

List assets along four surfaces (command output goes directly into the report appendix):

```sh
git ls-files -- '.env*' '*.pem' '**/id_rsa' '**/id_ed25519' '**/*.key'
git ls-files -- 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock'
git submodule status
git ls-files -- '.github/workflows/**' '.mcp.json' 'cordis.yml' '**/cordis.yml'
git ls-files -- 'Dockerfile*' 'docker-compose*.yml' 'compose*.yml' '*.tf' '*.tfvars' '*.hcl' 'serverless.yml'
```

Sample output: one relative path per line; no matches = no output.
Criterion: empty output = no assets on that surface — the report writes "not found".
The asset inventory feeds every later stage: the secrets surface goes to `secret-scan`, the dependency surface to `dependency-audit`, and the CI/configuration plus IaC/container surfaces are checked within this report.

## Stage 3: risk tiering

Tier definitions, the coarse CVSS mapping, handling deadlines, and report wording live in `references/risk-classification.md`.
Every finding must fill this table (all three factors are required to tier anything; without them an item is an "observation", not a "finding"):

| Finding | Location (file:line/commit) | Exploitability | Impact | Exposed | Tier |
|---|---|---|---|---|---|
| e.g. GitHub token in plaintext | src/ci/deploy.sh:12 | High | Repo write access | Pushed to a public repo | Critical |

Criterion: a tier may only come from "exploitability × impact × exposed"; anything tiered by feel is downgraded to "observation".

## Stage 4: item-by-item verification

Principle: **every finding in the report must be re-verifiable by a reviewer with one command**; anything that cannot be re-verified goes into "observations", not "findings".
Verification commands per topic come from the matching specialist skill (load it and use its commands):

- Secrets: `git grep -n '<first 6 redacted characters>' <commit hash> -- '<file path>'` (details in `secret-scan`)
- Dependencies: `pnpm why <package>`, and search the `pnpm audit --json` output by advisory id (see `dependency-audit`)
- New dependencies: `git log --oneline --follow -- <lockfile>` to locate the introducing commit (see `supply-chain-review`)
- Injection surfaces: the original-source extraction command of the quoted text (see `prompt-injection-review`)
- CI/workflows: `git grep -n 'pull_request_target' -- '.github/workflows/**'` (a hit where the workflow uses secrets after checking out PR code → high-severity finding); `git grep -nE 'uses: [A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+@v[0-9]' -- '.github/workflows/**'` (actions not pinned to a commit SHA → record)
- IaC/containers: `trivy config .` (or `checkov -d .` without trivy); images with `trivy image <image>` (image unavailable or tools missing → write "not run")

False-positive rule: a verification command that yields no evidence → downgrade to "observation" or delete; anything kept without verification must state the reason.

## Stage 5: report

The report skeleton (title, metadata, verdict summary, findings table, verification-command appendix, method limitations) lives in `references/report-template.md`.
Hard redaction rule: the report must never contain a secret in plaintext — only the type marker plus the first 6 characters; details in the `secret-scan` redaction spec.
Self-check before delivery (expected output: no matches; a match means the report itself leaks a secret — fix it before delivering):

```sh
grep -nE '(ghp_[A-Za-z0-9]|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]|-----BEGIN)' report.md
```

## Division of labor with the other skills

- `secret-scan`: secret detection, false-positive tiers, redaction, and remediation order — the secrets surface of the asset inventory.
- `dependency-audit`: known vulnerabilities, licenses, poisoning, lockfile drift — the dependency surface of the asset inventory.
- `supply-chain-review`: a minutes-fast review of PRs and new dependencies — new dependencies appearing during the audit.
- `prompt-injection-review`: the context injection surfaces of agent projects — mandatory when the repository itself is an agent project.
