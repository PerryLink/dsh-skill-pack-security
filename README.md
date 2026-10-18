<div align="center">

# dsh-skill-pack-security
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add dsh-skill-pack-security` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-skill-pack-security)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-skill-pack-security?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-skill-pack-security?ref=badge)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/PerryLink/dsh-skill-pack-security/badge)](https://api.securityscorecards.dev/projects/github.com/PerryLink/dsh-skill-pack-security)

**Eight security-audit skills plus an automated plugin supply-chain gate for DeepSeek Harness.**

*The skills teach the audit methodology; the `plugin_vet` tool executes the pre-install scan — license / SBOM / commit pinning / malicious patterns / five-dimension risk card.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-skill-pack-security/verify.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-skill-pack-security/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-skill-pack-security?label=version)](https://github.com/PerryLink/dsh-skill-pack-security/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-skill-pack-security
```


</div>

---

## Install & uninstall

- **git channel** (latest `main`): `dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security` — mounts the provider bundle; `prepack` embeds both editions into the tarball.
- **npm channel** (published releases): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`.
- **tarball channel**: `pnpm pack` in `provider/`, then `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (or remove the row; pure-skill copies are removed with the installer's `-Uninstall` / `--uninstall`).

## What is dsh-skill-pack-security?

Eight security-audit skills plus an automated plugin supply-chain gate for DeepSeek Harness.

The skills teach the audit methodology; the `plugin_vet` tool executes the pre-install scan — license / SBOM / commit pinning / malicious patterns / five-dimension risk card.

![Terminal demo of dsh-skill-pack-security: dsh-skill-pack-security — install the provider, verify all 25 checks](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-hero.png)

![Animated terminal demo of dsh-skill-pack-security](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-demo.gif)

*The same run, animated.*

## Comparison

![Measured comparison chart for dsh-skill-pack-security](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-evidence.png)

38 poison samples (20 malicious, 18 benign) · benchmark/RESULTS.md

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness **`dsh-v0.2.1-alpha.1`** (GitHub tag, verified 2026-09-25: full gate chain + profile install smoke). npm dependency line: `@deepseek-ai/dsh` **0.1.5-rc.2** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`). The session envelope keeps its ignorable field for stored-log read compatibility only - Session.append still cannot stamp it, so audit-gate behavior is unchanged. |
| Node | `^22.19.0 \|\| >=24.0.0` (the DeepSeek Harness runtime) |
| Platforms | All (the skills are content; the provider is a host plugin) |
| Model | Any (skills load on demand via the `skill` tool; `plugin_vet` is deterministic) |

## What you get

`dsh-skill-pack-security` is a **skill pack + supply-chain gate** for DeepSeek Harness. It ships eight security methodologies as `SKILL.md` bundles that the model discovers in its session catalog and loads on demand with the `skill` tool, plus the automated `plugin_vet` pre-install scanner. **The skills teach the methodology; the plugin executes the static checks.**

- **Eight skills, two editions** — every skill ships with identical names and metadata in `skills/` (Chinese) and `skills-en/` (English); install one language per root.
- **`plugin_vet` gate** — a zero-dependency scanner (license / SBOM / commit pinning / malicious patterns / data-responsibility review / five-dimension risk card) registered by the optional `provider/` plugin on `ctx.tools`.
- **Findings cite the skills** — every finding points to the matching skill section (for example `supply-chain-review §1`) so the agent can continue the manual audit.
- **Executable by a model** — each skill step is a real command (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) with an expected-output sample and an exit-code criterion.

## Why skills, not tools?

| Shape | What it does | What it cannot do |
|---|---|---|
| Tool plugin (e.g. security scanners) | *Executes* scans, returns findings | Interpret alerts, tier false positives, write redacted reports |
| Protocol layer | *Constrains* a protocol | Generalize across repos and agents |
| **Skill pack (this repo)** | *Teaches methodology*: triage, reporting, remediation order — **and** automates the static pre-install checks via `plugin_vet` | Replace a manual audit end to end |

Installed together with a tool-type security plugin, the two compose: the tool runs the scan, the skill drives interpretation, triage, and the report. This pack combines both shapes: the skills teach the methodology, and `plugin_vet` runs the mechanical static subset automatically, with every finding pointing back into the skills.

The Claude Code ecosystem's 3000+ skills prove the distribution value of this shape. DSH's `SKILL.md` frontmatter (`name`, `description`, `whenToUse`) is format-compatible with CC skills; this pack uses only the common subset and its content is entirely original.

## The eight skills

| Skill | Purpose | When to use |
|---|---|---|
| `security-audit` | Five-phase audit flow: scope → inventory → risk tiering → verification → report template | Whole-repo audits, audit reports, planning |
| `secret-scan` | Credential audit: gitleaks/trivy usage, false-positive tiers, redacted reports, remediation order | Secret scanning, alert triage, leak reports |
| `dependency-audit` | Supply-chain audit: pnpm/npm audit reading, licenses, typosquat risk, lockfile drift | Dependency review, audit-report interpretation |
| `supply-chain-review` | Quick PR/new-dependency review: dangerous install scripts, typosquat, reproducible builds | Reviewing PRs that add dependencies |
| `prompt-injection-review` | Injection-surface review for agent projects: AGENTS.md, skills, tool descriptions, MCP, web | Reviewing model-context injection surfaces |
| `threat-model` | Design-stage threat modeling: trust boundaries, STRIDE table, attack trees, mitigations | Modeling new features, design-stage security review |
| `vuln-intel` | Vulnerability intelligence: NVD/CISA-KEV/GHSA/OSV lookups with verdict criteria | Given a CVE/GHSA id, checking impact and exploitation |
| `incident-response` | Agent-environment incident response: contain → evidence → recover → postmortem | Suspected security incidents in DSH/agent setups |

Each bundle keeps its main file ≤ 300 lines (progressive disclosure; details live in `references/`).

## plugin_vet — the automated pre-install gate

`plugin_vet` is the pack's automated complement: a zero-dependency scanner registered by the `provider/` plugin on `ctx.tools`. Point it at a GitHub `owner/repo` or a local package path — it downloads the tarball once (timeout + `AbortSignal` respected), scans within budget limits, and returns a render card.

- **License scan** — finds the LICENSE file and the `license` field; `NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <file>`, a missing file, or a missing field is flagged; common SPDX ids are recognized.
- **SBOM** — extracts the dependency tree with versions from the lockfile (pnpm/npm/yarn); when `osv-scanner` or `npm audit` is detected on a local target, their vulnerability output replaces the self-computed dependency scan and the report annotates the source (`builtin` / `osv-scanner` / `npm-audit`).
- **Commit locking** — install-manifest refs and workflow actions must be immutable 40-hex commit SHAs; `@tag`/branch refs are flagged as mutable.
- **Malicious patterns** — lifecycle scripts (`preinstall`/`install`/`postinstall`), network-exfiltration domains, and obfuscated/encoded payloads in shipped code.
- **Data-responsibility review** — the policy-scan dimensions as deterministic rules: ungated listeners on sensitive seams (`agent/pre-step`, `tools/pre-execute`, `session/event`, …), outbound endpoints without README telemetry/privacy disclosure, description-behavior keyword coverage, and embedded instruction-override payloads in shipped text (skills, docs, prompts, tests). Every finding cites `prompt-injection-review` for the manual deep-dive; disable per deployment with `vet.dataResponsibility: false`. A model-assisted review stage is the documented future upgrade.
- **Five-dimension risk report** — license / source / dependencies / build scripts / maintenance, each 0–100, folded into an overall verdict: PASS, WARN, or FAIL.

**Install gate.** The verdict feeds an installation gate — `gate.policy: warn` (default, non-blocking) prints a warning on FAIL; `gate.policy: deny` returns a deny verdict. The tool does not intercept the host's `dsh plugin add`; wire the verdict into your installer/CI to enforce it:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # return a deny verdict for failed plugin_vet (caller enforces)
```

**Complementary to `dsh-plugin-check`.** The official plugin validator's 36 checks verify a plugin's *contract and quality* (config schema, effect registration, tool JSON shape); `plugin_vet` verifies the *supply chain* of where a plugin comes from. Run both:

| | `dsh-plugin-check` (36 checks) | `plugin_vet` (this repo) |
|---|---|---|
| Question answered | Is this plugin well-formed and contract-compliant? | Is this package safe to install? |
| Looks at | Plugin code, schema, registrations, tool contracts | LICENSE, lockfile, install refs/actions, lifecycle scripts, exfil/obfuscation, maintenance, data-responsibility (hooks scope, telemetry disclosure, description-behavior, embedded injection payloads) |
| Verdict | Pass/fail per check | PASS / WARN / FAIL + gate |
| When | Plugin development or review | Before `dsh plugin add`, PR review, CI supply-chain gate |
| Blocking | CI gate (non-zero on violations) | Configurable: `warn` (default) or `deny` |

## Quick start

```sh
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security
```

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security

# or from npm (published releases)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Installing the skills by hand

DSH's local skill provider scans four roots by rank (lower rank wins same-name conflicts within a layer):

| Rank | Root | Scope |
|---|---|---|
| 100 | `<projectRoot>/.dsh/skills` | Project-scoped, travels with the repo |
| 200 | `<projectRoot>/.agents/skills` | Project-scoped, shared agent directory |
| 400 | `<dshHome>/skills` (`$DSH_HOME` or `~/.dsh`) | User-scoped, DSH-only |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` or `~/.agents`) | User-scoped, cross-agent |

Ranks (lower wins same-name conflicts within a layer): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`. Custom rank 300 is plugin-registered (such as this pack's optional `provider/`), not a disk root.

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (default) | en
```

```sh
bash ./scripts/install.sh --target user-agents --language en
```

## What's inside

| Path | What it is |
|---|---|
| `skills/<name>/SKILL.md` | The eight skills (Chinese edition); frontmatter follows the official `dsh-skill-filesystem` contract |
| `skills-en/<name>/SKILL.md` | The eight skills (English edition); same names and metadata as the Chinese edition |
| `skills/<name>/references/` | Progressive-disclosure detail: command matrices, triage tables, templates |
| `scripts/install.ps1` | One-command Windows installer for all four roots (both language editions); records a manifest, supports `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | The POSIX equivalent (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | npm-installable provider bundle (declares `dsh.bundle`; embeds both editions in `pack/` via `prepack`; `language: zh\|en`); registers the skills provider AND the `plugin_vet` gate tool via `ctx.effect()`, fails loud on a bad `skillsDir` |
| `provider/src/vet/` | The zero-dependency `plugin_vet` scan engine (license / SBOM / commit lock / malicious patterns / risk report) |
| `package.json` | Root bundle manifest: declares `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) and `dshWorkshop` intake facts |
| `verify/verify-skill-pack.mts` | Headless verification against the official parser, the real `skill` tool, and the real tools runtime — 25 checks across both editions |
| `VERSION` | Single version source; every SKILL.md `metadata.version` and `provider/package.json` must match it (CI-enforced) |
| `docs/` | Ecosystem conflict check, release checklist, improvement plans, and `plugin_vet` demos |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Release history, vulnerability reporting policy, and contribution/verification rules |
| `.github/workflows/verify.yml` | CI: 25-check verification + installer exercise + provider build/pack smoke (Ubuntu and Windows) |
| `.github/dependabot.yml` | Weekly dependency updates for the provider and GitHub Actions |
| `LICENSE` | Apache License 2.0 |
| `THIRD_PARTY_NOTICES.md` | Third-party posture: zero-dependency engine, evaluated-but-not-ported assets, peer dependency licenses |

## Configuration

All tunables are Schemastery `Config` fields (changeable from cordis.yml). `provider/cordis.patch.yml` documents each key inline.

| Key | Default | Meaning |
|---|---|---|
| `language` | `zh` | Edition to publish: the Chinese `skills/` or the English `skills-en/`; ignored when `skillsDir` is set |
| `watch` | `false` | Watch the packaged skills directory (static content, so disabled) |
| `skillsDir` | *(unset)* | Explicit skills root; overrides the `language`-derived default and must hold `<skill>/SKILL.md` bundles |
| `vet.enable` | `true` | Register the `plugin_vet` gate tool |
| `vet.timeoutMs` | `15000` | Tarball-fetch timeout in ms |
| `vet.maxFiles` | `800` | Scan file cap |
| `vet.maxFileBytes` | `262144` | Per-file byte cap |
| `vet.maxExtractBytes` | `67108864` | Extraction byte cap |
| `vet.maxDepNodes` | `600` | Dependency-tree node cap |
| `vet.maxFindingsPerCheck` | `12` | Findings cap per check |
| `vet.dataResponsibility` | `true` | Run the data-responsibility review (disable per deployment) |
| `vet.externalScanners` | `true` | Orchestrate `osv-scanner`/`npm audit` when their CLIs are present; `false` forces the built-in self-computed dependency scan |
| `vet.userAgent` | `dsh-skill-pack-security/2.2.24 (+https://github.com/PerryLink/dsh-skill-pack-security)` | Fetch user-agent |
| `vet.gate.policy` | `warn` | Install gate: `warn` (non-blocking) or `deny` (block on FAIL) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `plugin_vet` | tool | Pre-install supply-chain scan (license / SBOM / commit lock / malicious / risk card); findings cite skill sections |
| `skill-pack-security` | skill provider | Registers the pack's `skills/` or `skills-en/` edition on `ctx.skills` |
| Eight `SKILL.md` bundles | skills | The audit methodology, in two language editions |
| install gate | gate | `vet.gate.policy: warn \| deny` returns a verdict; the caller (installer/CI) enforces it |

## Permissions & data

- **Permissions**: the `dshWorkshop` manifest declares `files:read` and `network:fetch`.
- **Data**: `plugin_vet` downloads a tarball once (timeout + `AbortSignal` respected) and reports redact secret-shaped text; the plugin injects no prompt sections.

## Security boundaries

- **Zero-dependency engine.** `plugin_vet` uses only `node:` builtins and relative imports.
- **Narrow pre-install gate.** Not a general-purpose security-audit tool — deliberately complementary to scanner plugins and the official `dsh-plugin-check` contract validator.
- **Non-blocking by default.** The install gate is `warn` unless you opt into `deny`.
- **Original content.** Format-compatible with Claude Code skills, but no copied CC skill content and no skill marketplace.
- **Original engine, no third-party ports.** The license scan and malicious-pattern checks are original zero-dependency implementations; the GPL-Radar / LLM-detective / Sus-PY assets were evaluated for porting but no licensed public source was found — see `THIRD_PARTY_NOTICES.md`.

## Verification

`verify/verify-skill-pack.mts` imports the **official** `dsh-skill-filesystem` parser, the **real** `skill` tool, and the **real** tools runtime from a local `deepseek-harness` checkout and asserts 25 checks over both language editions:

1. Layout: both editions present, 8 directory bundles each, no stray flat skills, frontmatter `name` matches directory, ≤ 300 lines, `references/` wired, `metadata.version` synced to the `VERSION` file
2. No name conflicts with the official `.agents/skills/` skills (derived from the checkout at run time) or known community skill packs
3–6. Per edition (Chinese `skills/`, English `skills-en/`): registry discovery through the official provider, full `ctx.skills.get()` loads, the real `skill` tool returning `<skill_content>` (unknown/invalid names rejected), and the session catalog containing `name` + `description` only — `whenToUse` stays out of the model catalog (official design)
7. 13 bad-frontmatter fixtures exercise the official fail-closed rules (missing fields, legacy camel-case keys, non-boolean values, non-kebab names, nested dirs, name mismatch); flat-file skills load and nested `**/SKILL.md` is not discovered
8. The optional provider plugin mounts the Chinese and the English edition via `ctx.effect()`, disposes cleanly, and rejects misconfiguration (empty or nonexistent `skillsDir`)
9–15. Self-hardening checks: zh↔en structural parity, references wiring (no dangling/orphan files), provider version sync, documented skill-root ranks vs the official constants, POSIX-portable `grep -E` patterns, secret self-check, UTF-8-safe release checklist
16–19. `plugin_vet` through the real tools runtime: it registers on `ctx.tools`; the compliant fixture passes; the no-license fixture fails and cites `dependency-audit §3`; the malicious postinstall fixture fails (scripts/exfil/obfuscation, citing `supply-chain-review §1`); the gate returns a deny verdict under `policy: deny` (the caller enforces it)
20. The scan engine is zero-dependency (`node:` builtins and relative imports only)
21. Report redaction keeps secret-shaped text out of rendered output

```powershell
# local: auto-resolves the harness checkout beside the pack, or point it explicitly
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 25 checks passed for dsh-skill-pack-security.
```

The same 25 checks run on GitHub on every push via `.github/workflows/verify.yml` — on Ubuntu and Windows — plus an `install.sh`/`install.ps1` exercise and a standalone provider build/pack smoke that asserts the tarball carries both embedded editions and the bundle patch.

## Known limitations

- **Not a full audit tool.** `plugin_vet` is a narrow pre-install trust gate; it cannot replace a manual, end-to-end audit.
- **Static scan only.** The malicious-pattern and maintenance signals are heuristics over the shipped package, not dynamic analysis.
- **One edition per root.** Same-name skills in one root resolve by rank, so only one language edition enters a session catalog.

## Roadmap

- `dsh-skill-pack-data-engineering` — data pipelines, data quality, ETL checklists (same template)
- `dsh-skill-pack-oss-collab` — PR etiquette, issue triage, maintainer workflows
- `dsh-skill-pack-performance` — profiling methodology, benchmark criteria, regression checklists
- More skills inside this pack (same pure-skill boundary): `sbom-lifecycle` (SBOM generation/aging/import workflows), `pen-test-review` (authorized-engagement scoping and report review), `compliance-audit` (ASVS/NIST-CSF walkthroughs)
- Keep the `plugin_vet` demo artifacts fresh (`docs/demos/run-demos.mjs`) and the `dsh-plugin-check` complement table accurate as the official checker adds checks

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # embeds both skill editions into the tarball
tsx verify/verify-skill-pack.mts    # 25-check headless verification
```

### Benchmark

The poison-sample regression set (per-class detection rate / FPR / F1 over 38 samples, plus the OSV/Socket gap) is published in [`benchmark/RESULTS.md`](benchmark/RESULTS.md); regenerate it with `pnpm --dir provider run build && node benchmark/run.mjs` (zero new dependencies).

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — author and maintainer: the eight skills in both language editions, the installers, the verification suite, the provider bundle, CI, and the documentation.

## PerryLink DSH Plugin Family

This project is one of the **87 actively maintained** DeepSeek Harness plugins from [PerryLink](https://github.com/PerryLink). The family roster is **95** plugins in total — **5 frozen**, **3 retired** — and stays collapsed below so every README keeps a short first screen. Expand it to see every row, with the reason in the Status column.

<details>
<summary>Expand all 95 plugins</summary>

| Plugin | One-liner | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRED — see the repo README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 FROZEN — see the repo README |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 FROZEN — see the repo README |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 FROZEN — see the repo README |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 FROZEN — see the repo README |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 FROZEN — see the repo README |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRED — see the repo README |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRED — see the repo README |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

### Install from the DSH Desktop Market

All PerryLink plugins are browsable in the built-in DSH Desktop Market: **Market → Sources → add source → paste** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ select it**. Installation still goes through the Market's npm-identity verification and your confirmation.

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
