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
  <img src="https://img.shields.io/badge/verified-19%2F19%20checks-brightgreen" alt="Verified: 19/19 checks">
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

**Two language editions.** Every skill ships with identical names and metadata in two editions: `skills/` (Chinese) and `skills-en/` (English). Install one language per root — same-name skills in one root resolve by rank, so only one edition enters the session catalog. See [docs/release-checklist.md](docs/release-checklist.md) for the language-edition rules.

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

Optional: mount the whole pack without copying via the `provider/` plugin — `language: zh|en` picks the edition (see [provider/README.md](provider/README.md)). The provider is npm-installable as a bundle: publish it (or install from a tarball/git) and `dsh plugin add @dsh-skill-pack-security/provider` mounts it with one command.

## What's inside

| Path | What it is |
|---|---|
| `skills/<name>/SKILL.md` | The five skills (Chinese edition); frontmatter follows the official `dsh-skill-filesystem` contract |
| `skills-en/<name>/SKILL.md` | The five skills (English edition); same names and metadata as the Chinese edition |
| `skills/<name>/references/` | Progressive-disclosure detail: command matrices, triage tables, templates |
| `scripts/install.ps1` | One-command Windows installer for all four roots (both language editions); records a manifest, supports `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | The POSIX equivalent (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | Optional npm-installable provider bundle (declares `dsh.bundle`; embeds both editions in `pack/` via `prepack`; `language: zh\|en`); registered via `ctx.effect()`, fails loud on a bad `skillsDir` |
| `verify/verify-skill-pack.mts` | Headless verification against the official parser and the real `skill` tool — 19 checks across both editions |
| `VERSION` | Single version source; every SKILL.md `metadata.version` and `provider/package.json` must match it (CI-enforced) |
| `docs/ecosystem-conflict-check.md` | GitHub topic/name conflict snapshot of the `dsh-plugin` ecosystem |
| `docs/release-checklist.md` | Release flow: version sync points, language-edition rules, tagging |
| `docs/improvement-plan.md` | The 1.2.0 improvement plan with per-item evidence and acceptance criteria |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Release history, vulnerability reporting policy, and contribution/verification rules |
| `.github/workflows/verify.yml` | CI: 19-check verification + install.sh/install.ps1 exercise + provider build/pack smoke, on Ubuntu and Windows against a pinned harness commit |
| `.github/dependabot.yml` | Weekly dependency updates for the provider and GitHub Actions |
| `LICENSE` | Apache License 2.0 |

## Verification

`verify/verify-skill-pack.mts` imports the **official** `dsh-skill-filesystem` parser and the **real** `skill` tool from a local `deepseek-harness` checkout and asserts 19 checks over both language editions:

1. Layout: both editions present, 5 directory bundles each, no stray flat skills, frontmatter `name` matches directory, ≤ 300 lines, `references/` wired, `metadata.version` synced to the `VERSION` file
2. No name conflicts with the official `.agents/skills/` skills (derived from the checkout at run time) or known community skill packs
3–6. Per edition (Chinese `skills/`, English `skills-en/`): registry discovery through the official provider, full `ctx.skills.get()` loads, the real `skill` tool returning `<skill_content>` (unknown/invalid names rejected), and the session catalog containing `name` + `description` only — `whenToUse` stays out of the model catalog (official design)
7. 13 bad-frontmatter fixtures exercise the official fail-closed rules (missing fields, legacy camel-case keys, non-boolean values, non-kebab names, nested dirs, name mismatch); flat-file skills load and nested `**/SKILL.md` is not discovered
8. The optional provider plugin mounts the Chinese and the English edition via `ctx.effect()`, disposes cleanly, and rejects misconfiguration (empty or nonexistent `skillsDir`)
9–15. Self-hardening checks: zh↔en structural parity, references wiring (no dangling/orphan files), provider version sync, documented skill-root ranks vs the official constants, POSIX-portable `grep -E` patterns, secret self-check, UTF-8-safe release checklist

```powershell
# local: auto-resolves the harness checkout beside the pack, or point it explicitly
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 19 checks passed for dsh-skill-pack-security.
```

The same 19 checks run on GitHub on every push via `.github/workflows/verify.yml` (badge above) — on Ubuntu and Windows — plus an `install.sh`/`install.ps1` exercise and a standalone provider build/pack smoke that asserts the tarball carries both embedded editions and the bundle patch (`provider` job). The harness checkout is pinned to a commit for reproducible verification.

## Roadmap

- `dsh-skill-pack-data-engineering` — data pipelines, data quality, ETL checklists (same template)
- `dsh-skill-pack-oss-collab` — PR etiquette, issue triage, maintainer workflows
- `dsh-skill-pack-performance` — profiling methodology, benchmark criteria, regression checklists
- New skills inside this pack (same pure-skill boundary): `threat-model` (lightweight STRIDE/attack-tree modeling for new features), `vuln-intel` (NVD/CISA-KEV/GHSA lookup workflow; re-check the ecosystem snapshot for name clashes before shipping), `incident-response` (agent-environment response checklist)
- Publish the provider bundle to the npm registry (the `dsh.bundle` manifest is already in place; publishing requires ownership of the `@dsh-skill-pack-security` scope or a rename)

## Topics

If you host this pack on GitHub, set the repository topics: **`dsh`**, **`dsh-plugin`** — plus `skill-pack`, `security-audit`, `supply-chain-security`, `prompt-injection`. The `dsh` / `dsh-plugin` badges above reflect that identity, and `provider/package.json` carries the same values in `keywords`.

## Boundaries

No tool-type security-audit plugin (deliberately complementary to scanner plugins), no skill marketplace, no copied CC skill content — format-compatible, content-original.

## License

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Covers the skill content and the optional provider plugin alike.
