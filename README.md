<div align="center">

# dsh-skill-pack-security

**Eight security-audit skills plus an automated plugin supply-chain gate for DeepSeek Harness.**

*The skills teach the audit methodology; the `plugin_vet` tool executes the pre-install scan — license / SBOM / commit pinning / malicious patterns / five-dimension risk card.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-skill-pack-security/verify.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-skill-pack-security/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-skill-pack-security?label=version)](https://github.com/PerryLink/dsh-skill-pack-security/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [हिन्दी](README.hi.md)

</div>

---

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `0.1.0-rc.6` |
| Node | `^22.19.0 \|\| >=24.0.0` (the DeepSeek Harness runtime) |
| Platforms | All (the skills are content; the provider is a host plugin) |
| Model | Any (skills load on demand via the `skill` tool; `plugin_vet` is deterministic) |

## What you get

`dsh-skill-pack-security` is a **skill pack + supply-chain gate** for DeepSeek Harness. It ships eight security methodologies as `SKILL.md` bundles that the model discovers in its session catalog and loads on demand with the `skill` tool, plus the automated `plugin_vet` pre-install scanner. **The skills teach the methodology; the plugin executes the static checks.**

- **Eight skills, two editions** — every skill ships with identical names and metadata in `skills/` (Chinese) and `skills-en/` (English); install one language per root.
- **`plugin_vet` gate** — a zero-dependency scanner (license / SBOM / commit pinning / malicious patterns / five-dimension risk card) registered by the optional `provider/` plugin on `ctx.tools`.
- **Findings cite the skills** — every finding points to the matching skill section (for example `supply-chain-review §1`) so the agent can continue the manual audit.
- **Executable by a model** — each skill step is a real command (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) with an expected-output sample and an exit-code criterion.

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
- **SBOM** — extracts the dependency tree with versions from the lockfile (pnpm/npm/yarn).
- **Commit locking** — install-manifest refs and workflow actions must be immutable 40-hex commit SHAs; `@tag`/branch refs are flagged as mutable.
- **Malicious patterns** — lifecycle scripts (`preinstall`/`install`/`postinstall`), network-exfiltration domains, and obfuscated/encoded payloads in shipped code.
- **Five-dimension risk report** — license / source / dependencies / build scripts / maintenance, each 0–100, folded into an overall verdict: PASS, WARN, or FAIL.

**Install gate.** The verdict feeds an installation gate — `gate.policy: warn` (default, non-blocking) prints a warning on FAIL; `gate.policy: deny` blocks the installation:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # block installs that fail plugin_vet
```

## Quick start

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"

# or from npm (published releases)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Install & uninstall

- **git channel** (latest `main`): `dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"` — mounts the provider bundle; `prepack` embeds both editions into the tarball.
- **npm channel** (published releases): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`.
- **tarball channel**: `pnpm pack` in `provider/`, then `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (or remove the row; pure-skill copies are removed with the installer's `-Uninstall` / `--uninstall`).

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
| `vet.userAgent` | `dsh-skill-pack-security/2.0.0 (+https://github.com/PerryLink/dsh-skill-pack-security)` | Fetch user-agent |
| `vet.gate.policy` | `warn` | Install gate: `warn` (non-blocking) or `deny` (block on FAIL) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `plugin_vet` | tool | Pre-install supply-chain scan (license / SBOM / commit lock / malicious / risk card); findings cite skill sections |
| `skill-pack-security` | skill provider | Registers the pack's `skills/` or `skills-en/` edition on `ctx.skills` |
| Eight `SKILL.md` bundles | skills | The audit methodology, in two language editions |
| install gate | gate | `vet.gate.policy: warn \| deny` feeds installation decisions |

## Permissions & data

- **Permissions**: the `dshWorkshop` manifest declares `files:read` and `network:fetch`.
- **Data**: `plugin_vet` downloads a tarball once (timeout + `AbortSignal` respected) and reports redact secret-shaped text; the plugin injects no prompt sections.

## Security boundaries

- **Zero-dependency engine.** `plugin_vet` uses only `node:` builtins and relative imports.
- **Narrow pre-install gate.** Not a general-purpose security-audit tool — deliberately complementary to scanner plugins and the official `dsh-plugin-check` contract validator.
- **Non-blocking by default.** The install gate is `warn` unless you opt into `deny`.
- **Original content.** Format-compatible with Claude Code skills, but no copied CC skill content and no skill marketplace.

## Verification

`verify/verify-skill-pack.mts` imports the **official** `dsh-skill-filesystem` parser, the **real** `skill` tool, and the **real** tools runtime from a local `deepseek-harness` checkout and asserts 25 checks over both language editions: layout and frontmatter validity, zero name conflicts with official/community skills, full `ctx.skills.get()` loads, `plugin_vet` behavior through the real tools runtime, the zero-dependency invariant, and report redaction. The same 25 checks run on GitHub via `.github/workflows/verify.yml` (Ubuntu and Windows).

## Known limitations

- **Not a full audit tool.** `plugin_vet` is a narrow pre-install trust gate; it cannot replace a manual, end-to-end audit.
- **Static scan only.** The malicious-pattern and maintenance signals are heuristics over the shipped package, not dynamic analysis.
- **One edition per root.** Same-name skills in one root resolve by rank, so only one language edition enters a session catalog.

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # embeds both skill editions into the tarball
tsx verify/verify-skill-pack.mts    # 25-check headless verification
```

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — author and maintainer: the eight skills in both language editions, the installers, the verification suite, the provider bundle, CI, and the documentation.

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
