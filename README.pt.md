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
| Harness | DeepSeek Harness `0.1.1-rc.2` |
| Node | `^22.19.0 \|\| >=24.0.0` (o runtime do DeepSeek Harness) |
| Plataformas | Todas (as skills são conteúdo; o provider é um plugin de host) |
| Modelo | Qualquer (as skills carregam sob demanda com a ferramenta `skill`; `plugin_vet` é determinístico) |

## What you get

O `dsh-skill-pack-security` é um **pacote de skills + portão de cadeia de suprimentos** para o DeepSeek Harness. Ele distribui oito metodologias de segurança como bundles `SKILL.md` que o modelo descobre no catálogo da sessão e carrega sob demanda com a ferramenta `skill`, mais o scanner automático `plugin_vet` pré-instalação. **As skills ensinam a metodologia; o plugin executa as verificações estáticas.**

- **Oito skills, duas edições** — cada skill é distribuída com nomes e metadados idênticos em `skills/` (chinês) e `skills-en/` (inglês); instale um idioma por raiz.
- **Portão `plugin_vet`** — um scanner sem dependências (licença / SBOM / pin de commit / padrões maliciosos / revisão de responsabilidade de dados / cartão de risco em cinco dimensões) registrado pelo plugin opcional `provider/` em `ctx.tools`.
- **Os achados citam as skills** — cada achado aponta para a seção de skill correspondente (por exemplo `supply-chain-review §1`) para continuar a auditoria manual.
- **Executável por um modelo** — cada passo de skill é um comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) com amostra de saída esperada e critério de código de saída.

## Why skills, not tools?

| Forma | O que faz | O que não consegue fazer |
|---|---|---|
| Plugin de ferramentas (ex.: scanners) | **Executa** varreduras, devolve achados | Interpretar alertas, classificar falsos positivos, escrever relatórios redigidos |
| Camada de protocolo | **Restringe** um protocolo | Generalizar entre repositórios e agentes |
| **Pacote de skills (este repo)** | **Ensina metodologia**: triagem, relatórios, ordem de remediação — **e** automatiza as verificações estáticas pré-instalação via `plugin_vet` | Substituir uma auditoria manual de ponta a ponta |

Instalado junto com um plugin de segurança do tipo ferramenta, os dois se compõem: a ferramenta executa a varredura, a skill conduz a interpretação, a triagem e o relatório. Este pacote combina as duas formas: as skills ensinam a metodologia e o `plugin_vet` executa o subconjunto estático automaticamente, com cada achado apontando de volta para as skills.

As 3000+ skills do ecossistema Claude Code provam o valor de distribuição dessa forma. O frontmatter `SKILL.md` do DSH (`name`, `description`, `whenToUse`) é compatível com o formato de skills do CC; este pacote usa apenas o subconjunto comum e seu conteúdo é totalmente original.

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

**Complementar ao `dsh-plugin-check`.** As 36 verificações do validador oficial verificam o *contrato e a qualidade* de um plugin (esquema de configuração, registro de efeitos, forma JSON das ferramentas); o `plugin_vet` verifica a *cadeia de suprimentos* de onde um plugin vem. Execute ambos:

| | `dsh-plugin-check` (36 verificações) | `plugin_vet` (este repo) |
|---|---|---|
| Pergunta respondida | Este plugin é bem formado e cumpre o contrato? | Este pacote é seguro para instalar? |
| O que olha | Código do plugin, esquema, registros, contratos de ferramentas | LICENSE, lockfile, refs de instalação/ações, scripts de ciclo de vida, exfil/ofuscação, manutenção |
| Veredicto | Passa/falha por verificação | PASS / WARN / FAIL + portão |
| Quando | Desenvolvimento ou revisão de plugins | Antes de `dsh plugin add`, revisão de PR, portão de CI de cadeia de suprimentos |
| Bloqueante | Portão de CI (não zero ante violações) | Configurável: `warn` (padrão) ou `deny` |

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

## What's inside

| Caminho | O que é |
|---|---|
| `skills/<nome>/SKILL.md` | As oito skills (edição chinesa); o frontmatter segue o contrato oficial do `dsh-skill-filesystem` |
| `skills-en/<nome>/SKILL.md` | As oito skills (edição inglesa); mesmos nomes e metadados da edição chinesa |
| `skills/<nome>/references/` | Detalhe com divulgação progressiva: matrizes de comandos, tabelas de triagem, modelos |
| `scripts/install.ps1` | Instalador Windows de um comando para as quatro raízes (ambas as edições); registra um manifesto, suporta `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | O equivalente POSIX (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | Bundle provedor instalável por npm (declara `dsh.bundle`; embebe ambas as edições em `pack/` via `prepack`; `language: zh\|en`); registra o provedor de skills E o portão `plugin_vet` via `ctx.effect()`, falha em alto ante um `skillsDir` inválido |
| `provider/src/vet/` | O motor de varredura `plugin_vet` sem dependências (licença / SBOM / bloqueio de commit / padrões maliciosos / relatório de risco) |
| `package.json` | Manifest do bundle raiz: declara `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) e os dados de intake `dshWorkshop` |
| `verify/verify-skill-pack.mts` | Verificação headless contra o parser oficial, a ferramenta `skill` real e o runtime de ferramentas real — 25 verificações sobre ambas as edições |
| `VERSION` | Fonte única de versão; cada `metadata.version` de SKILL.md e `provider/package.json` deve coincidir com ela (aplicado por CI) |
| `docs/` | Verificação de conflitos do ecossistema, lista de publicação, planos de melhoria e demos do `plugin_vet` |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Histórico de versões, política de relato de vulnerabilidades e regras de contribuição/verificação |
| `.github/workflows/verify.yml` | CI: verificação de 25 itens + exercício dos instaladores + build/pack do provider (Ubuntu e Windows) |
| `.github/dependabot.yml` | Atualizações semanais de dependências para o provider e GitHub Actions |
| `LICENSE` | Apache License 2.0 |
| `THIRD_PARTY_NOTICES.md` | Postura de terceiros: motor sem dependências, ativos avaliados mas não portados, licenças de dependências peer |

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
| `vet.userAgent` | `dsh-skill-pack-security/2.1.4 (+https://github.com/PerryLink/dsh-skill-pack-security)` | User-agent de download |
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
- **Motor original, sem ports de terceiros.** O escaneo de licença e as verificações de padrões maliciosos são implementações originais sem dependências; os ativos GPL-Radar / LLM-detective / Sus-PY foram avaliados para portar, mas nenhum código-fonte público licenciado foi encontrado — veja `THIRD_PARTY_NOTICES.md`.

## Verification

O `verify/verify-skill-pack.mts` importa o parser **oficial** `dsh-skill-filesystem`, a ferramenta **real** `skill` e o runtime de ferramentas **real** de um checkout local do `deepseek-harness` e executa 25 verificações sobre ambas as edições de idioma:

1. Estrutura: ambas as edições presentes, 8 bundles de diretório em cada edição, sem skills planas soltas, `name` do frontmatter coincide com o diretório, ≤ 300 linhas, `references/` conectado, `metadata.version` sincronizado com o arquivo `VERSION`
2. Sem conflitos de nome com as skills oficiais de `.agents/skills/` (derivadas do checkout em tempo de execução) nem com pacotes de skills comunitários conhecidos
3–6. Por edição (chinesa `skills/`, inglesa `skills-en/`): descoberta pelo registro via provedor oficial, cargas completas via `ctx.skills.get()`, a ferramenta `skill` real devolvendo `<skill_content>` (nomes desconhecidos/inválidos rejeitados), e o catálogo de sessão contendo apenas `name` + `description` — `whenToUse` fica fora do catálogo do modelo (design oficial)
7. 13 fixtures de frontmatter inválido exercitam as regras oficiais fail-closed (campos ausentes, chaves camel-case legadas, valores não booleanos, nomes não kebab, diretórios aninhados, desajuste de nome); skills em arquivo plano carregam e o aninhado `**/SKILL.md` não é descoberto
8. O plugin provedor opcional monta a edição chinesa e a inglesa via `ctx.effect()`, desmonta limpo e rejeita má configuração (`skillsDir` vazio ou inexistente)
9–15. Verificações de auto-endurecimento: paridade estrutural zh↔en, cabeamento de referências (sem arquivos pendentes/órfãos), sincronização de versão do provider, ranks de raízes de skills documentados frente às constantes oficiais, padrões `grep -E` portáveis a POSIX, auto-verificação de segredos, lista de publicação segura em UTF-8
16–19. `plugin_vet` pelo runtime de ferramentas real: registra-se em `ctx.tools`; o fixture conforme passa; o fixture sem licença falha e cita `dependency-audit §3`; o fixture postinstall malicioso falha (scripts/exfil/ofuscação, citando `supply-chain-review §1`); o portão bloqueia a instalação sob `policy: deny`
20. O motor de varredura não tem dependências (apenas builtins `node:` e imports relativos)
21. A redação de relatórios mantém os textos com forma de segredo fora do resultado renderizado

```powershell
# local: resolve automaticamente o checkout do harness junto ao pack, ou aponte-o explicitamente
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 25 checks passed for dsh-skill-pack-security.
```

As mesmas 25 verificações rodam no GitHub a cada push via `.github/workflows/verify.yml` — no Ubuntu e Windows — mais um exercício de `install.sh`/`install.ps1` e um build/pack independente do provider que verifica se o tarball carrega ambas as edições embutidas e o patch do bundle.

## Known limitations

- **Não é uma ferramenta de auditoria completa.** O `plugin_vet` é um portão de confiança pré-instalação; não pode substituir uma auditoria manual de ponta a ponta.
- **Somente varredura estática.** As sinalizações de padrões maliciosos e manutenção são heurísticas sobre o pacote distribuído, não análise dinâmica.
- **Uma edição por raiz.** Skills de mesmo nome em uma raiz se resolvem por rank, então apenas uma edição entra em um catálogo de sessão.

## Roadmap

- `dsh-skill-pack-data-engineering` — pipelines de dados, qualidade de dados, listas de verificação ETL (mesma plantilla)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triagem de issues, fluxos de mantenedor
- `dsh-skill-pack-performance` — metodologia de profiling, critérios de benchmark, listas de regressão
- Mais skills dentro deste pack (mesmo limite de skill puro): `sbom-lifecycle` (fluxos de geração/envelhecimento/importação de SBOM), `pen-test-review` (escopo de compromissos autorizados e revisão de relatórios), `compliance-audit` (percursos ASVS/NIST-CSF)
- Mantenha frescos os artefatos de demo do `plugin_vet` (`docs/demos/run-demos.mjs`) e precisa a tabela de complementaridade com `dsh-plugin-check`

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

## PerryLink DSH Plugin Family

Este projeto é um dos [plugins do DeepSeek Harness](https://github.com/PerryLink) mantidos por [PerryLink](https://github.com/PerryLink). Se este ajudar você, os outros provavelmente também ajudarão:

| Plugin | Em uma linha |
|---|---|
| [dsh-mask](https://github.com/PerryLink/dsh-mask) | Middleware de mascaramento de PII: anonimiza no limite do modelo, restaura na camada de exibição |
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Painel MCP somente leitura: comando /mcp + aba de configurações com status, ferramentas e erros |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Guarda de disciplina de engenharia: interrogatório de requisitos, portões de teste, revisão adversária |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Agentes filhos em segundo plano com barra lateral web, mensagens e interrupção |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | Diagnóstico, formatação, autocompletar, ações de código e renomear via LSP |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | Troca de estilo em runtime equivalente ao outputStyles do Claude Code |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Equivalente ao /rewind do Claude Code: snapshots, forks de sessão, restauração em um clique |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Regras de permissão declarativas allow/deny/ask estilo Claude Code, com auditoria |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Revisão automática de segundo modelo na cadeia de aprovação, fail-closed por padrão |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Memória entre sessões com aprovação: seam ctx.memory + SQLite + ferramenta memory |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Pacote de skills de auditoria de segurança: varredura de segredos, revisão de dependências e cadeia de suprimentos |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Fixa sessões na barra lateral web com ordenação durável |
| [dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) | Histórico de entrada estilo terminal para o compositor web: setas, busca Ctrl+R |
| [dsh-github](https://github.com/PerryLink/dsh-github) | Integração de PR/issues do GitHub para DSH, toda escrita com aprovação |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Base de conhecimento de desenvolvimento de plugins como skill de agente sob demanda |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migra sessões, memória, skills e CLAUDE.md do Claude Code para DSH |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
