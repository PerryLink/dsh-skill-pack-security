<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Supply-chain security gate + audit methodology for DeepSeek Harness — eight agent skills, one automated pre-install scanner.</b><br/>
  plugin_vet · license / SBOM / commit-pin / malware scans · five-dimension risk card · secret scanning · dependency audit · supply-chain review · prompt-injection review · audit orchestration · threat modeling · vuln intel · incident response
</p>

<p align="center">
  <b><a href="README.md">English</a></b> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/stargazers"><img src="https://img.shields.io/github/stars/PerryLink/dsh-skill-pack-security?style=flat-square&color=yellow" alt="Stars"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/network/members"><img src="https://img.shields.io/github/forks/PerryLink/dsh-skill-pack-security?style=flat-square&color=blue" alt="Forks"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/v/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=cb3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/dw/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=blue" alt="npm downloads (weekly)"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Topic: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Topic: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-8-8257D0" alt="8 skills">
  <img src="https://img.shields.io/badge/verified-25%2F25%20checks-brightgreen" alt="Verified: 25/25 checks">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Languages: EN/ZH/ES/PT/HI">
</p>

---

## What is this?

A **skill pack + supply-chain gate** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — the "everything is a plugin" agent harness built on [Cordis](https://github.com/cordiverse/cordis). It ships eight security methodologies as `SKILL.md` bundles that the model discovers in its session catalog and loads on demand with the `skill` tool, plus the automated `plugin_vet` pre-install scanner: the skills teach the audit methodology, the plugin executes the static checks.

> Repository: https://github.com/PerryLink/dsh-skill-pack-security

**Skills teach, the plugin executes.** The optional `provider/` plugin registers the automated `plugin_vet` gate on `ctx.tools` — a zero-dependency scanner (license / SBOM / commit pinning / malicious patterns / five-dimension risk card) whose findings cite the skill sections for the manual deep-dive. Installed as pure skills without the provider, the pack works exactly as before.

Every skill is **executable by a model**: each step is a real command (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) with an expected-output sample, an exit-code criterion, and false-positive criteria. No unverifiable assertions.

## Why skills, not tools?

| Shape | What it does | What it cannot do |
|---|---|---|
| Tool plugin (e.g. security scanners) | *Executes* scans, returns findings | Interpret alerts, tier false positives, write redacted reports |
| Protocol layer | *Constrains* a protocol | Generalize across repos and agents |
| **Skill pack (this repo)** | *Teaches methodology*: triage, reporting, remediation order — **and** automates the static pre-install checks via `plugin_vet` | Replace a manual audit end to end |

Installed together with a tool-type security plugin, the two compose: the tool runs the scan, the skill drives interpretation, triage, and the report — the model follows this pack's methodology while calling the tool plugin's tools. This pack now combines both shapes: the skills teach the methodology, and `plugin_vet` runs the mechanical static subset automatically, with every finding pointing back into the skills.

The Claude Code ecosystem's 3000+ skills prove the distribution value of this shape. DSH's `SKILL.md` frontmatter (`name`, `description`, `whenToUse`) is format-compatible with CC skills; this pack uses only the common subset and its content is entirely original.

## The eight skills

| Skill | One-line purpose | When to use |
|---|---|---|
| `security-audit` | Five-phase audit flow: scope → inventory → risk tiering → verification → report template | Whole-repo audits, audit reports, planning |
| `secret-scan` | Credential audit: gitleaks/trivy usage, false-positive tiers, redacted reports, remediation order | Secret scanning, alert triage, leak reports |
| `dependency-audit` | Supply-chain audit: pnpm/npm audit reading, licenses, typosquat risk, lockfile drift | Dependency review, audit-report interpretation |
| `supply-chain-review` | Quick PR/new-dependency review: dangerous install scripts, typosquat, reproducible builds | Reviewing PRs that add dependencies |
| `prompt-injection-review` | Injection-surface review for agent projects: AGENTS.md, skills, tool descriptions, MCP, web | Reviewing model-context injection surfaces |
| `threat-model` | Design-stage threat modeling: trust boundaries, STRIDE table, attack trees, mitigations | Modeling new features, design-stage security review |
| `vuln-intel` | Vulnerability intelligence: NVD/CISA-KEV/GHSA/OSV lookups with verdict criteria | Given a CVE/GHSA id, checking impact and exploitation |
| `incident-response` | Agent-environment incident response: contain → evidence → recover → postmortem | Suspected security incidents in DSH/agent setups |

Each bundle: main file ≤ 300 lines (progressive disclosure; details live in `references/`), `description` self-contained about "when to use / when not to use", and `whenToUse` with precise triggers.

**Two language editions.** Every skill ships with identical names and metadata in two editions: `skills/` (Chinese) and `skills-en/` (English). Install one language per root — same-name skills in one root resolve by rank, so only one edition enters the session catalog. See [docs/release-checklist.md](docs/release-checklist.md) for the language-edition rules.

## plugin_vet — the automated pre-install gate

`plugin_vet` is the pack's automated complement: a zero-dependency scanner registered by the `provider/` plugin on `ctx.tools`. Point it at a GitHub `owner/repo` or a local package path — it downloads the tarball once (timeout + `AbortSignal` respected), scans within budget limits, and returns a render card.

What it checks:

- **License scan** — finds the LICENSE file and the `license` field; `NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <file>`, a missing file, or a missing field is flagged; common SPDX ids are recognized.
- **SBOM** — extracts the dependency tree with versions from the lockfile (pnpm/npm/yarn).
- **Commit locking** — install-manifest refs and workflow actions must be immutable 40-hex commit SHAs; `@tag`/branch refs are flagged as mutable.
- **Malicious patterns** — lifecycle scripts (`preinstall`/`install`/`postinstall`), network-exfiltration domains, and obfuscated/encoded payloads in shipped code.
- **Five-dimension risk report** — license / source / dependencies / build scripts / maintenance, each 0–100, folded into an overall verdict: PASS, WARN, or FAIL.

Every finding cites the matching skill section (for example `supply-chain-review §1`) so the agent can load that skill and continue the manual audit.

**Install gate.** The verdict feeds an installation gate — `gate.policy: warn` (default, non-blocking) prints a warning on FAIL; `gate.policy: deny` blocks the installation. Configure it in `cordis.yml`:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # block installs that fail plugin_vet
```

**Live demos** (three real repositories, regenerated per release): [compliant PASS](docs/demos/demo-1-compliant.md) · [no license FAIL](docs/demos/demo-2-no-license.md) · [postinstall WARN](docs/demos/demo-3-postinstall.md) · [deny gate BLOCKED](docs/demos/demo-4-deny.md).

**Complementary to `dsh-plugin-check`.** The official plugin validator's 36 checks verify a plugin's *contract and quality* (config schema, effect registration, tool JSON shape); `plugin_vet` verifies the *supply chain* of where a plugin comes from. Run both:

| | `dsh-plugin-check` (36 checks) | `plugin_vet` (this repo) |
|---|---|---|
| Question answered | Is this plugin well-formed and contract-compliant? | Is this package safe to install? |
| Looks at | Plugin code, schema, registrations, tool contracts | LICENSE, lockfile, install refs/actions, lifecycle scripts, exfil/obfuscation, maintenance |
| Verdict | Pass/fail per check | PASS / WARN / FAIL + gate |
| When | Plugin development or review | Before `dsh plugin add`, PR review, CI supply-chain gate |
| Blocking | CI gate (non-zero on violations) | Configurable: `warn` (default) or `deny` |

## Quick start

DSH's local skill provider scans four roots by rank — lower rank wins same-name conflicts within a layer:

| Rank | Root | Scope |
|---|---|---|
| 100 | `<projectRoot>/.dsh/skills` | Project-scoped, travels with the repo |
| 200 | `<projectRoot>/.agents/skills` | Project-scoped, shared agent directory |
| 400 | `<dshHome>/skills` (`$DSH_HOME` or `~/.dsh`) | User-scoped, DSH-only |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` or `~/.agents`) | User-scoped, cross-agent |

Ranks (lower wins same-name conflicts within a layer): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`. Custom rank 300 is plugin-registered (such as this pack's optional `provider/`), not a disk root.

One-command install (PowerShell, Windows):

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (default) | en
```

Or bash (macOS/Linux/CI):

```sh
bash ./scripts/install.sh --target user-agents --language en
```

Or copy by hand (Windows PowerShell shown; any shell works — use `skills-en\` for the English edition):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

The catalog appears in the next DSH session. Skill bodies hot-reload — edit `SKILL.md` and the next `skill` load reads the new body; no restart. Uninstall = run the installer with `-Uninstall` / `--uninstall` (it removes exactly what its manifest recorded) or delete the copied directories by hand.

Optional: mount the whole pack without copying via the `provider/` plugin — `language: zh|en` picks the edition (see [provider/README.md](provider/README.md)). The provider is published on npm as [`@perrylink/dsh-skill-pack-security-provider`](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider): `dsh plugin add @perrylink/dsh-skill-pack-security-provider` mounts it with one command.

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
| `package.json` | Root bundle manifest: declares `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) and `dshWorkshop` intake facts, so `dsh plugin add github:PerryLink/dsh-skill-pack-security` mounts the pack through the published provider |
| `verify/verify-skill-pack.mts` | Headless verification against the official parser, the real `skill` tool, and the real tools runtime — 25 checks across both editions |
| `VERSION` | Single version source; every SKILL.md `metadata.version` and `provider/package.json` must match it (CI-enforced) |
| `docs/ecosystem-conflict-check.md` | GitHub topic/name conflict snapshot of the `dsh-plugin` ecosystem |
| `docs/release-checklist.md` | Release flow: version sync points, language-edition rules, tagging |
| `docs/improvement-plan.md` | Improvement plans with per-item evidence and acceptance criteria (1.2.0 record + 1.3.0 record) |
| `docs/demos/` | `plugin_vet` demos against three real repositories (compliant / no license / postinstall) plus the deny-gate replay — regenerated with `docs/demos/run-demos.mjs` |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Release history, vulnerability reporting policy, and contribution/verification rules |
| `.github/workflows/verify.yml` | CI: 25-check verification + install.sh/install.ps1 exercise + provider build/pack smoke, on Ubuntu and Windows against a pinned harness commit; every action pinned to an immutable SHA |
| `.github/dependabot.yml` | Weekly dependency updates for the provider and GitHub Actions |
| `LICENSE` | Apache License 2.0 |

## Verification

`verify/verify-skill-pack.mts` imports the **official** `dsh-skill-filesystem` parser, the **real** `skill` tool, and the **real** tools runtime from a local `deepseek-harness` checkout and asserts 25 checks over both language editions:

1. Layout: both editions present, 8 directory bundles each, no stray flat skills, frontmatter `name` matches directory, ≤ 300 lines, `references/` wired, `metadata.version` synced to the `VERSION` file
2. No name conflicts with the official `.agents/skills/` skills (derived from the checkout at run time) or known community skill packs
3–6. Per edition (Chinese `skills/`, English `skills-en/`): registry discovery through the official provider, full `ctx.skills.get()` loads, the real `skill` tool returning `<skill_content>` (unknown/invalid names rejected), and the session catalog containing `name` + `description` only — `whenToUse` stays out of the model catalog (official design)
7. 13 bad-frontmatter fixtures exercise the official fail-closed rules (missing fields, legacy camel-case keys, non-boolean values, non-kebab names, nested dirs, name mismatch); flat-file skills load and nested `**/SKILL.md` is not discovered
8. The optional provider plugin mounts the Chinese and the English edition via `ctx.effect()`, disposes cleanly, and rejects misconfiguration (empty or nonexistent `skillsDir`)
9–15. Self-hardening checks: zh↔en structural parity, references wiring (no dangling/orphan files), provider version sync, documented skill-root ranks vs the official constants, POSIX-portable `grep -E` patterns, secret self-check, UTF-8-safe release checklist
16–19. `plugin_vet` through the real tools runtime: it registers on `ctx.tools`; the compliant fixture passes; the no-license fixture fails and cites `dependency-audit §3`; the malicious postinstall fixture fails (scripts/exfil/obfuscation, citing `supply-chain-review §1`); the gate blocks installation under `policy: deny`
20. The scan engine is zero-dependency (`node:` builtins and relative imports only)
21. Report redaction keeps secret-shaped text out of rendered output

```powershell
# local: auto-resolves the harness checkout beside the pack, or point it explicitly
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 25 checks passed for dsh-skill-pack-security.
```

The same 25 checks run on GitHub on every push via `.github/workflows/verify.yml` (badge above) — on Ubuntu and Windows — plus an `install.sh`/`install.ps1` exercise and a standalone provider build/pack smoke that asserts the tarball carries both embedded editions and the bundle patch (`provider` job). The harness checkout is pinned to a commit for reproducible verification, and every workflow action is pinned to an immutable SHA.

## Roadmap

- `dsh-skill-pack-data-engineering` — data pipelines, data quality, ETL checklists (same template)
- `dsh-skill-pack-oss-collab` — PR etiquette, issue triage, maintainer workflows
- `dsh-skill-pack-performance` — profiling methodology, benchmark criteria, regression checklists
- More skills inside this pack (same pure-skill boundary): `sbom-lifecycle` (SBOM generation/aging/import workflows), `pen-test-review` (authorized-engagement scoping and report review; re-check the ecosystem snapshot for name clashes before shipping), `compliance-audit` (ASVS/NIST-CSF walkthroughs)
- Keep the `plugin_vet` demo artifacts fresh (`docs/demos/run-demos.mjs`) and the `dsh-plugin-check` complement table accurate as the official checker adds checks

## Topics

If you host this pack on GitHub, set the repository topics: **`dsh`**, **`dsh-plugin`**, **`deepseek-harness`**, **`skill-pack`**, **`skills`**, **`security`**, **`security-audit`**, **`supply-chain`**, **`supply-chain-security`**, **`prompt-injection`**. The `dsh` / `dsh-plugin` badges above reflect that identity, and `provider/package.json` carries the same values in `keywords`.

## Boundaries

No general-purpose security-audit tool — `plugin_vet` is a narrow pre-install trust gate, deliberately complementary to scanner plugins and to the official `dsh-plugin-check` contract validator. No skill marketplace, no copied CC skill content — format-compatible, content-original.

## Contributors

Thanks to everyone who has contributed to this project.

| Contributor | Contributions |
|---|---|
| [@PerryLink](https://github.com/PerryLink) | Author and maintainer — the eight skills in both language editions, installers, the verification suite, the provider bundle, CI, and documentation |

Your name could be here — see [CONTRIBUTING.md](CONTRIBUTING.md) and open an issue or PR. New contributors are added to this list.

## License

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Covers the skill content and the optional provider plugin alike.

## PerryLink DSH Plugin Family

This project is one of the [15 DeepSeek Harness plugins](https://github.com/PerryLink) maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Engineering-discipline guard: requirements grill, test gates, adversary review |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Durable background child agents with a Web UI sidebar, messaging and interrupt |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP diagnostics, formatting, completion, code actions and rename over language servers |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | Claude Code outputStyles-equivalent runtime style switching |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Claude Code-style declarative allow/deny/ask permission rules with audit |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Second-model auto-review on the approval chain, fail-closed by default |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Pin sessions in the Web sidebar with durable ordering |
| [dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) | Terminal-style input history for the web composer: arrows, Ctrl+R search |
| [dsh-github](https://github.com/PerryLink/dsh-github) | GitHub PR/issues integration for DSH, every write gated by approval |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Plugin-development knowledge base as an on-demand agent skill |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH |
