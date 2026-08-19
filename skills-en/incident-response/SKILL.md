---
name: incident-response
description: 'Security incident response for agent environments: a staged flow of classification, containment, evidence collection, recovery, and postmortem — covering secret leaks, prompt-injection triggers, dependency poisoning, and unauthorized actions, with command evidence for every step. Use when a DSH/agent environment shows a suspected security incident needing response and postmortem; not for day-to-day development or routine maintenance.'
whenToUse: 'Use when an agent environment (DSH sessions, plugins, MCP, CI) shows a suspected security incident — secret leak, injected execution of unauthorized actions, dependency poisoning, permission anomalies — and it needs response, evidence, and a postmortem. Day-to-day development without incident indicators does not trigger this skill.'
metadata:
  pack: dsh-skill-pack-security
  version: '2.1.1'
---

# Incident response (incident-response)

Principle: **contain first, collect evidence second, recover last**. Containment actions (rotate/revoke/disable) do not wait for full attribution — act on suspicion; evidence collection happens after containment, so nothing spreads while you investigate. Never write plaintext secrets; reports follow the `secret-scan` redaction spec.

## 1. Confirm and classify

Answer two questions first: what happened (type), and how wide is the impact (scope). The four incident types and their initial evidence:

| Incident type | Initial evidence | Immediate action (see section 2) |
|---|---|---|
| Secret leak | scanner alerts, a token appearing in a public repo | rotate + revoke |
| Prompt-injection trigger | the session executed out-of-context instructions (download/exfiltrate/change config) | disable the trigger source + isolate |
| Dependency poisoning | a new dependency shows anomalous install scripts/network calls | roll back the dependency + freeze the lockfile |
| Unauthorized action | non-owner commits, unexpected runs in repo/CI | revoke credentials + pause automation |

```sh
git rev-parse HEAD
git log -1 --format='%H %cd' --date=iso-strict
```

Expected sample output: `a1b2c3d4...` plus the commit time.
Criterion: record the current HEAD first — every later evidence command is re-checked against it; when the type is unclear, treat it as a "secret leak" first (rotation is the cheapest and safest assumption).

## 2. Contain the spread (act on suspicion, do not wait for attribution)

- Secrets: follow `secret-scan` section 6 in order — rotate first, revoke second; rotation is complete when the new value is live and the vendor console shows the old one revoked.
- Injection/unauthorized actions: disable the trigger source — take down the related MCP/plugins, pause agent sessions and the related CI:

```sh
git ls-files -- 'cordis.yml' '**/cordis.yml' '.mcp.json' '.github/workflows/**'
dsh --profile <profile> --dump-config
```

Expected sample output: the list of config and workflow paths; the dump shows the mounted plugin inventory.
Criterion: check every plugin/MCP in the dump output for trustworthiness; remove anything suspect from the config immediately (config change → takes effect in a new session). Containment is complete when the incident source is disabled and no new action of the same kind appears within 24 hours.

## 3. Evidence collection (timeline + evidence pack)

```sh
git log --format='%H %cd %s' --date=iso-strict --since='<incident time>' --all
# Windows: Get-ChildItem $env:DSH_HOME -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 20
# macOS/Linux: find ~/.dsh -type f -newermt '<incident time>' -ls
```

Expected sample output: one commit per line (hash + time + subject); the session directory's files sorted newest-first.
Criterion: every timeline entry = time + actor + action + evidence reference; **record only re-checkable facts** — speculation goes into a "to verify" area. The evidence pack = raw command outputs + copies of the involved files, shared only after the `secret-scan` redaction spec is applied.

## 4. Recovery

```sh
git revert --no-commit <suspect commit>
# or roll the whole branch back to a known-good commit: git reset --hard <known-good commit> (back up first!)
```

Expected sample output: after revert, `git status` shows the inverse change staged for commit.
Criterion: recovery order — first revert the malicious/suspect changes, then restore the affected services, last restore automation (CI/agent) and observe for one cycle. Recovery is complete when every anomaly point on the timeline has a matching handling record and nothing recurs during the observation period.

## 5. Postmortem and hardening

The postmortem template (five parts: timeline, root cause, impact assessment, handling record, hardening items) lives in `references/runbook-and-postmortem.md`. Hardening items derive from the root cause, and each must be verifiable:

- Secret-leak root cause → add a `gitleaks protect --staged` gate (`secret-scan`);
- Injection root cause → walk the injection surfaces with `prompt-injection-review` and land its mitigations;
- Dependency root cause → tighten the intake flow with `supply-chain-review` (pin actions, forbid install scripts);
- Permission root cause → least-privilege rework: remove surplus credentials, narrow CI token scopes.

The postmortem is complete when every hardening item has a verification command or acceptance criterion.

## Division of labor with the other skills

- `secret-scan`: detection, tiering, and the rotation flow details for secret-leak incidents.
- `prompt-injection-review`: surface enumeration and the mitigation list for injection-class incidents.
- `supply-chain-review` / `dependency-audit`: intake-vector analysis and dependency audits for dependency-class incidents.
- `security-audit`: the full audit re-check once the incident has settled.
