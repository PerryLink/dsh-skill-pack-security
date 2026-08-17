<div align="center">

# dsh-skill-pack-security

**Oito skills de auditoria de segurança mais um portão automático de cadeia de suprimentos de plugins para o DeepSeek Harness.**

*As skills ensinam a metodologia de auditoria; a ferramenta `plugin_vet` executa a varredura pré-instalação — licença / SBOM / pin de commit / padrões maliciosos / cartão de risco em cinco dimensões.*

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

| Superfície | Status |
|---|---|
| Harness | DeepSeek Harness `0.1.0-rc.6` |
| Node | `^22.19.0 \|\| >=24.0.0` (o runtime do DeepSeek Harness) |
| Plataformas | Todas (as skills são conteúdo; o provider é um plugin de host) |
| Modelo | Qualquer (as skills carregam sob demanda com a ferramenta `skill`; `plugin_vet` é determinístico) |

## What you get

O `dsh-skill-pack-security` é um **pacote de skills + portão de cadeia de suprimentos** para o DeepSeek Harness. Ele distribui oito metodologias de segurança como bundles `SKILL.md` que o modelo descobre no catálogo da sessão e carrega sob demanda com a ferramenta `skill`, mais o scanner automático `plugin_vet` pré-instalação. **As skills ensinam a metodologia; o plugin executa as verificações estáticas.**

- **Oito skills, duas edições** — cada skill é distribuída com nomes e metadados idênticos em `skills/` (chinês) e `skills-en/` (inglês); instale um idioma por raiz.
- **Portão `plugin_vet`** — um scanner sem dependências (licença / SBOM / pin de commit / padrões maliciosos / cartão de risco em cinco dimensões) registrado pelo plugin opcional `provider/` em `ctx.tools`.
- **Os achados citam as skills** — cada achado aponta para a seção de skill correspondente (por exemplo `supply-chain-review §1`) para continuar a auditoria manual.
- **Executável por um modelo** — cada passo de skill é um comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) com amostra de saída esperada e critério de código de saída.

## The eight skills

| Skill | Propósito | Quando usar |
|---|---|---|
| `security-audit` | Fluxo de auditoria em cinco fases: escopo → inventário → classificação de riscos → verificação → modelo de relatório | Auditorias de repo completo, relatórios, planejamento |
| `secret-scan` | Auditoria de credenciais: uso de gitleaks/trivy, níveis de falso positivo, relatórios redigidos, ordem de remediação | Varredura de segredos, triagem de alertas, relatórios de vazamento |
| `dependency-audit` | Auditoria de cadeia de suprimentos: leitura de pnpm/npm audit, licenças, risco de typosquat, deriva do lockfile | Revisão de dependências, interpretação de relatórios |
| `supply-chain-review` | Revisão rápida de PR/novas dependências: scripts de instalação perigosos, typosquat, builds reproduzíveis | Revisar PRs que adicionam dependências |
| `prompt-injection-review` | Revisão de superfícies de injeção em projetos de agentes: AGENTS.md, skills, descrições de ferramentas, MCP, web | Revisar superfícies de injeção do contexto do modelo |
| `threat-model` | Modelagem de ameaças em fase de projeto: limites de confiança, tabela STRIDE, árvores de ataque, mitigações | Modelar novos recursos, revisão de segurança em fase de projeto |
| `vuln-intel` | Inteligência de vulnerabilidades: consultas NVD/CISA-KEV/GHSA/OSV com critérios de veredicto | Dado um id CVE/GHSA, verificar impacto e exploração |
| `incident-response` | Resposta a incidentes em ambientes de agentes: conter → evidência → recuperar → postmortem | Incidentes suspeitos em configurações DSH/de agentes |

Cada bundle mantém seu arquivo principal ≤ 300 linhas (divulgação progressiva; os detalhes vivem em `references/`).

## plugin_vet — the automated pre-install gate

O `plugin_vet` é o complemento automático do pacote: um scanner sem dependências registrado pelo plugin `provider/` em `ctx.tools`. Aponte-o para um `owner/repo` do GitHub ou para um caminho de pacote local — ele baixa o tarball uma única vez (respeitando timeout + `AbortSignal`), varre dentro dos limites de orçamento e devolve um cartão renderizado.

- **Varredura de licença** — localiza o arquivo LICENSE e o campo `license`; `NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <arquivo>`, um arquivo ou campo ausente é marcado; ids SPDX comuns são reconhecidos.
- **SBOM** — extrai a árvore de dependências com versões do lockfile (pnpm/npm/yarn).
- **Bloqueio de commit** — refs do manifesto de instalação e ações de workflows devem ser SHAs de commit imutáveis de 40 hex; refs `@tag`/ramo são marcadas como mutáveis.
- **Padrões maliciosos** — scripts de ciclo de vida (`preinstall`/`install`/`postinstall`), domínios de exfiltração e payloads ofuscados/codificados.
- **Relatório de risco em cinco dimensões** — licença / origem / dependências / scripts de build / manutenção, cada uma 0–100, dobradas em um veredicto global: PASS, WARN ou FAIL.

**Portão de instalação.** O veredicto alimenta um portão de instalação — `gate.policy: warn` (padrão, não bloqueante) imprime um aviso ante FAIL; `gate.policy: deny` bloqueia a instalação:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # bloqueia instalações que falham no plugin_vet
```

## Quick start

```sh
# 1. instale o bundle no seu perfil
dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"

# ou do npm (versões publicadas)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. reinicie e verifique a linha
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Install & uninstall

- **Canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"` — monta o bundle do provider; `prepack` embebe ambas as edições no tarball.
- **Canal npm** (versões publicadas): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`.
- **Canal tarball**: `pnpm pack` em `provider/`, depois `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`.
- **Desinstalar**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (ou remova a linha; as cópias puras de skills são removidas com `-Uninstall` / `--uninstall` do instalador).

## Installing the skills by hand

O provedor local de skills do DSH escaneia quatro raízes por rank (o rank menor vence conflitos de nome dentro de uma camada):

| Rank | Raiz | Escopo |
|---|---|---|
| 100 | `<repoRaiz>/.dsh/skills` | Por projeto, viaja com o repo |
| 200 | `<repoRaiz>/.agents/skills` | Por projeto, diretório de agentes compartilhado |
| 400 | `<dshHome>/skills` (`$DSH_HOME` ou `~/.dsh`) | Por usuário, somente DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` ou `~/.agents`) | Por usuário, entre agentes |

Ranks (o menor vence conflitos de nome dentro de uma camada): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`. O rank custom 300 é registrado por plugin (como o `provider/` opcional deste pack), não é uma raiz de disco.

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (padrão) | en
```

```sh
bash ./scripts/install.sh --target user-agents --language en
```

## Configuration

Todas as opções são campos Schemastery `Config` (modificáveis a partir do cordis.yml). O `provider/cordis.patch.yml` documenta cada chave.

| Chave | Padrão | Significado |
|---|---|---|
| `language` | `zh` | Edição a publicar: a chinesa `skills/` ou a inglesa `skills-en/`; ignorada quando `skillsDir` é definido |
| `watch` | `false` | Observar o diretório de skills empacotado (conteúdo estático, por isso desativado) |
| `skillsDir` | *(não definido)* | Raiz de skills explícita; anula o valor derivado de `language` e deve conter bundles `<skill>/SKILL.md` |
| `vet.enable` | `true` | Registra a ferramenta `plugin_vet` |
| `vet.timeoutMs` | `15000` | Timeout de download do tarball em ms |
| `vet.maxFiles` | `800` | Teto de arquivos varridos |
| `vet.maxFileBytes` | `262144` | Teto de bytes por arquivo |
| `vet.maxExtractBytes` | `67108864` | Teto de bytes de extração |
| `vet.maxDepNodes` | `600` | Teto de nós da árvore de dependências |
| `vet.maxFindingsPerCheck` | `12` | Teto de achados por verificação |
| `vet.userAgent` | `dsh-skill-pack-security/2.0.0 (+https://github.com/PerryLink/dsh-skill-pack-security)` | User-agent de download |
| `vet.gate.policy` | `warn` | Portão de instalação: `warn` (não bloqueante) ou `deny` (bloqueia ante FAIL) |

## Tools & surfaces

| Superfície | Tipo | Notas |
|---|---|---|
| `plugin_vet` | tool | Varredura de cadeia de suprimentos pré-instalação (licença / SBOM / bloqueio de commit / malicioso / cartão de risco); os achados citam seções de skills |
| `skill-pack-security` | skill provider | Registra a edição `skills/` ou `skills-en/` do pack em `ctx.skills` |
| Oito bundles `SKILL.md` | skills | A metodologia de auditoria, em duas edições de idioma |
| portão de instalação | gate | `vet.gate.policy: warn \| deny` decide a instalação |

## Permissions & data

- **Permissões**: o manifesto `dshWorkshop` declara `files:read` e `network:fetch`.
- **Dados**: o `plugin_vet` baixa um tarball uma única vez (respeitando timeout + `AbortSignal`) e os relatórios redigem textos com forma de segredo; o plugin não injeta seções de prompt.

## Security boundaries

- **Motor sem dependências.** O `plugin_vet` usa apenas builtins de `node:` e imports relativos.
- **Portão pré-instalação de escopo acotado.** Não é uma ferramenta de auditoria de propósito geral — deliberadamente complementar aos plugins escâner e ao validador oficial `dsh-plugin-check`.
- **Não bloqueante por padrão.** O portão de instalação é `warn` salvo se você optar por `deny`.
- **Conteúdo original.** Compatível com o formato de skills do Claude Code, mas sem conteúdo copiado de CC e sem marketplace de skills.

## Verification

O `verify/verify-skill-pack.mts` importa o parser **oficial** `dsh-skill-filesystem`, a ferramenta **real** `skill` e o runtime de ferramentas **real** de um checkout local do `deepseek-harness` e executa 25 verificações sobre ambas as edições: estrutura e validade do frontmatter, zero conflitos de nome com skills oficiais/comunitárias, cargas completas via `ctx.skills.get()`, comportamento do `plugin_vet` pelo runtime de ferramentas real, o invariante de zero dependências e a redação de relatórios. As mesmas 25 verificações rodam no GitHub via `.github/workflows/verify.yml` (Ubuntu e Windows).

## Known limitations

- **Não é uma ferramenta de auditoria completa.** O `plugin_vet` é um portão de confiança pré-instalação; não pode substituir uma auditoria manual de ponta a ponta.
- **Somente varredura estática.** As sinalizações de padrões maliciosos e manutenção são heurísticas sobre o pacote distribuído, não análise dinâmica.
- **Uma edição por raiz.** Skills de mesmo nome em uma raiz se resolvem por rank, então apenas uma edição entra em um catálogo de sessão.

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # embebe ambas as edições no tarball
tsx verify/verify-skill-pack.mts    # verificação headless de 25 verificações
```

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor e mantenedor: as oito skills em ambas as edições, os instaladores, a suíte de verificação, o bundle do provider, CI e a documentação.

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
