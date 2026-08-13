<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Security-audit methodology for DeepSeek Harness — five agent skills, zero runtime code.</b><br/>
  secret scanning · dependency audit · supply-chain review · prompt-injection review · audit orchestration
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
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Topic: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Topic: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-5-8257D0" alt="5 skills">
  <img src="https://img.shields.io/badge/verified-9%2F9%20checks-brightgreen" alt="Verified: 9/9 checks">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Languages: EN/ZH/ES/PT/HI">
</p>

---

## What is this?

A **pure skill pack** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — the "everything is a plugin" agent harness built on [Cordis](https://github.com/cordiverse/cordis). It ships five security-audit methodologies as `SKILL.md` bundles that the model discovers in its session catalog and loads on demand with the `skill` tool.

> Repository: https://github.com/PerryLink/dsh-skill-pack-security

**Zero runtime code.** No tools are registered, no services are registered, no session behavior changes. The only executable is the optional `provider/` plugin — a packaging demo — and the pack works identically without it.

Every skill is **executable by a model**: each step is a real command (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) with an expected-output sample, an exit-code criterion, and false-positive criteria. No unverifiable assertions.

## Why skills, not tools?

| Shape | What it does | What it cannot do |
|---|---|---|
| Tool plugin (e.g. security scanners) | *Executes* scans, returns findings | Interpret alerts, tier false positives, write redacted reports |
| Protocol layer | *Constrains* a protocol | Generalize across repos and agents |
| **Skill pack (this repo)** | *Teaches methodology*: triage, reporting, remediation order | Execute scans itself |

Installed together with a tool-type security plugin, the two compose: the tool runs the scan, the skill drives interpretation, triage, and the report — the model follows this pack's methodology while calling the tool plugin's tools.

The Claude Code ecosystem's 3000+ skills prove the distribution value of this shape. DSH's `SKILL.md` frontmatter (`name`, `description`, `whenToUse`) is format-compatible with CC skills; this pack uses only the common subset and its content is entirely original.

## The five skills

| Skill | One-line purpose | When to use |
|---|---|---|
| `security-audit` | Five-phase audit flow: scope → inventory → risk tiering → verification → report template | Whole-repo audits, audit reports, planning |
| `secret-scan` | Credential audit: gitleaks/trivy usage, false-positive tiers, redacted reports, remediation order | Secret scanning, alert triage, leak reports |
| `dependency-audit` | Supply-chain audit: pnpm/npm audit reading, licenses, typosquat risk, lockfile drift | Dependency review, audit-report interpretation |
| `supply-chain-review` | Quick PR/new-dependency review: dangerous install scripts, typosquat, reproducible builds | Reviewing PRs that add dependencies |
| `prompt-injection-review` | Injection-surface review for agent projects: AGENTS.md, skills, tool descriptions, MCP, web | Reviewing model-context injection surfaces |

Each bundle: main file ≤ 300 lines (progressive disclosure; details live in `references/`), `description` self-contained about "when to use / when not to use", and `whenToUse` with precise triggers.

## Quick start

DSH's local skill provider scans four roots by rank — lower rank wins same-name conflicts within a layer:

| Rank | Root | Scope |
|---|---|---|
| 100 | `<projectRoot>/.dsh/skills` | Project-scoped, travels with the repo |
| 200 | `<projectRoot>/.agents/skills` | Project-scoped, shared agent directory |
| 400 | `<dshHome>/skills` (`$DSH_HOME` or `~/.dsh`) | User-scoped, DSH-only |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` or `~/.agents`) | User-scoped, cross-agent |

One-command install (PowerShell):

```powershell
./scripts/install.ps1 -Target user-agents   # or: project-dsh | project-agents | user-dsh
```

Or copy by hand (Windows PowerShell shown; any shell works):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

The catalog appears in the next DSH session. Skill bodies hot-reload — edit `SKILL.md` and the next `skill` load reads the new body; no restart. Uninstall = delete the copied directories.

Optional: mount the whole pack without copying via the `provider/` plugin (see [provider/README.md](provider/README.md)).

## What's inside

| Path | What it is |
|---|---|
| `skills/<name>/SKILL.md` | The five skills; frontmatter follows the official `dsh-skill-filesystem` contract |
| `skills/<name>/references/` | Progressive-disclosure detail: command matrices, triage tables, templates |
| `scripts/install.ps1` | One-command installer for all four roots |
| `provider/` | Optional provider plugin (packaging/distribution demo, registered via `ctx.effect()`) |
| `verify/verify-skill-pack.mts` | Headless verification against the official parser and the real `skill` tool |
| `docs/ecosystem-conflict-check.md` | GitHub topic/name conflict snapshot of the `dsh-plugin` ecosystem |
| `.github/workflows/verify.yml` | CI: installs the harness and runs all 9 checks on every push |
| `LICENSE` | Apache License 2.0 |

## Verification

`verify/verify-skill-pack.mts` imports the **official** `dsh-skill-filesystem` parser and the **real** `skill` tool from a local `deepseek-harness` checkout and asserts 9 checks:

1. Layout: 5 directory bundles, no stray flat skills, frontmatter `name` matches directory, ≤ 300 lines, `references/` wired
2. No name conflicts with the 12 official `.agents/skills/` skills or known community skill packs
3. All 5 skills discovered through the official provider
4. `ctx.skills.get()` loads every body, metadata, and invocation policy
5. The real `skill` tool returns `<skill_content>` for all 5 skills; unknown/invalid names are rejected
6. The session catalog contains `name` + `description` only — `whenToUse` stays out of the model catalog (official design)
7. 13 bad-frontmatter fixtures exercise the official fail-closed rules (missing fields, legacy camel-case keys, non-boolean values, non-kebab names, nested dirs, name mismatch)
8. Flat-file skills load; nested `**/SKILL.md` is not discovered
9. The optional provider plugin mounts via `ctx.effect()` and disposes cleanly

```powershell
# local: auto-resolves the harness checkout beside the pack, or point it explicitly
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 9 checks passed for dsh-skill-pack-security.
```

The same 9 checks also run on GitHub on every push via `.github/workflows/verify.yml` (badge above).

## Roadmap

- `dsh-skill-pack-data-engineering` — data pipelines, data quality, ETL checklists (same template)
- `dsh-skill-pack-oss-collab` — PR etiquette, issue triage, maintainer workflows
- `dsh-skill-pack-performance` — profiling methodology, benchmark criteria, regression checklists
- Optional: package the pack as a bundled badge provider modeled on `dsh-skill-badge`

## Topics

If you host this pack on GitHub, set the repository topics: **`dsh`**, **`dsh-plugin`** — plus `skill-pack`, `security-audit`, `supply-chain-security`, `prompt-injection`. The `dsh` / `dsh-plugin` badges above reflect that identity, and `provider/package.json` carries the same values in `keywords`.

## Boundaries

No tool-type security-audit plugin (deliberately complementary to scanner plugins), no skill marketplace, no copied CC skill content — format-compatible, content-original.

## License

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Covers the skill content and the optional provider plugin alike.
