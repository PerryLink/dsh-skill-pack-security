---
name: threat-model
description: 'Lightweight threat modeling for new features/systems: fix the target, scope and trust boundaries, asset inventory, per-asset STRIDE table, optional attack tree, mitigations and priority — producing a threat-model document ready for design review. Use for design-stage security review of new features/changes, mapping trust boundaries, or drawing attack trees; not for unrelated pure bug fixes, and teams with an established modeling process need not run this flow.'
whenToUse: 'Use when the user asks for threat modeling of a new feature/system, design-stage security review, STRIDE analysis, attack-tree analysis, or wants security considered up front at design time. Pure implementation detail discussions and changes unrelated to trust boundaries do not trigger this skill.'
metadata:
  pack: dsh-skill-pack-security
  version: '1.3.0'
---

# Threat modeling (threat-model)

This skill does **design-stage** lightweight threat modeling: for one change or one new component, it produces trust boundaries, a STRIDE threat table, and a mitigation list. It covers the modeling method only; tiering existing audit findings goes to `security-audit`, and looking up specific vulnerabilities goes to `vuln-intel`. The output carries no secrets and can go into design documents.

## 1. Fix the modeling target (an unfixed target makes the model unreproducible)

```sh
git rev-parse --show-toplevel
git log -1 --format='%H %cd' --date=iso-strict
```

Expected sample output (use the actual output):

```
D:\repo\example
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0 2026-08-14T10:30:00+08:00
```

Criterion: exit code 0 and the first line is an absolute path; the threat-model document header must record this commit hash so reviewers know which version the model targets.

## 2. Scope: what changed, where the boundaries are

```sh
git diff --stat <base>...HEAD
git diff --name-only <base>...HEAD
```

Expected sample output: `src/auth/session.ts | 40 ++++`, followed by the changed file paths.
Criterion: the scope = the files and components this diff touches; **never model the whole repository** (a whole-repo model is too large and nobody reviews it). For a brand-new module with no diff, use `git ls-files -- '<module dir>'` instead.
Four trust-boundary classes; every asset must state its boundary: in-process (code within one process), inter-process (IPC/HTTP/RPC), system boundary (local machine/kernel/filesystem), external (third-party services/users/upstream data).

## 3. Asset inventory (the rows of the STRIDE table)

```sh
git ls-files -- 'package.json' 'pnpm-lock.yaml' '.env*' '.github/workflows/**' 'Dockerfile*' '*.tf' 'cordis.yml' '**/cordis.yml' '*.pem' '**/*.key'
```

Expected sample output: one relative path per line; no matches = that class of asset does not exist.
Criterion: the inventory covers at least four classes — data (secrets, user data, configuration), code (the changed module), channels (APIs, messages, logs), hosts (CI, containers, external dependencies). Fill in whatever class is missing; do not list only the files in this diff.

## 4. Per-asset STRIDE threat table

Ask the six questions for every asset from section 3 (full definitions and question prompts live in `references/stride-and-attack-tree.md`):

| Asset | S spoofing | T tampering | R repudiation | I info disclosure | D DoS | E elevation | Entry path | Mitigation |
|---|---|---|---|---|---|---|---|---|
| e.g. session token | forged token | tampered claims | no audit log | token in logs | session storm | swap identity | API lacks signature check | signature + least privilege |

Criterion: **every cell either names a threat or states "not applicable (reason)"** — a blank cell means no modeling happened; a threat must state "who, through which path, with what impact" — missing any one of the three downgrades it to "observation".
After filling the table, cross-check: does every asset's "entry path" cross a trust boundary? An asset whose paths cross no boundary means the boundary map is incomplete — go back to section 2.

## 5. Attack tree (optional: only for high-risk surfaces)

```sh
dot -Tpng attack-tree.dot -o attack-tree.png
# without graphviz, use an indented text tree instead (example in references)
```

Expected sample output: exit code 0 and `attack-tree.png` produced.
Criterion: draw trees only for section-4 threats that are "high impact × multiple preconditions"; root = the attack goal, leaves = preconditions; **every leaf must be verifiable** (one command proves the precondition holds or not) — leaves that cannot be verified are labeled "unverified assumption". Both the `.dot` source and the rendered image go into the review material.

## 6. Mitigations and priority

Pick mitigations from four directions (landing templates for each live in `references/stride-and-attack-tree.md`):

- Eliminate: change the design so the path does not exist (highest priority — ask "can we not build this" first in the review);
- Transfer: hand it to existing defenses (authentication to SSO, secrets to KMS/CI secrets);
- Mitigate: add checks at the boundary (signatures, authz, rate limits, redacted logs);
- Accept: state the reason and the residual risk, recorded as an "accepted risk".

Priority criterion = exploitability × impact (the `security-audit` three factors minus "exposed" — at design stage nothing is exposed yet).

## 7. Deliverables and self-check

Deliverables: trust-boundary description (text or diagram) + asset inventory + STRIDE table + (optional) attack tree + mitigation list.
Self-check command (expected output: no matches; a match means a table row is unfinished):

```sh
grep -nE '\| *TBD *\||待定' threat-model.md
```

## Division of labor with the other skills

- `security-audit`: full audits and tiering of existing repositories — high-risk paths found by this model go there for item-by-item verification.
- `vuln-intel`: when a third-party component referenced in the design has a CVE, look up its details and impact.
- `supply-chain-review`: when the modeled scope adds dependencies, run the quick supply-chain review on them.
- `secret-scan`: secret-class assets in the inventory go straight to it for scanning and redaction.
