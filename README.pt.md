<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Metodologia de auditoria de segurança para o DeepSeek Harness — oito agent skills, zero código em tempo de execução.</b><br/>
  varredura de segredos · auditoria de dependências · revisão de cadeia de suprimentos · revisão de injeção de prompt · orquestração de auditoria · modelagem de ameaças · inteligência de vulnerabilidades · resposta a incidentes
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.es.md">Español</a> ·
  <b><a href="README.pt.md">Português</a></b> ·
  <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/stargazers"><img src="https://img.shields.io/github/stars/PerryLink/dsh-skill-pack-security?style=flat-square&color=yellow" alt="Stars"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/network/members"><img src="https://img.shields.io/github/forks/PerryLink/dsh-skill-pack-security?style=flat-square&color=blue" alt="Forks"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/v/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=cb3837" alt="versão npm"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/dw/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=blue" alt="downloads npm (semanal)"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Licença: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Tópico: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Tópico: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-8-8257D0" alt="8 skills">
  <img src="https://img.shields.io/badge/verified-19%2F19%20checks-brightgreen" alt="Verificado: 19/19 verificações">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Idiomas: EN/ZH/ES/PT/HI">
</p>

---

## O que é isto?

Um **pacote de skills puro** para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — o harness de agentes "tudo é um plugin" construído sobre o [Cordis](https://github.com/cordiverse/cordis). Ele distribui oito metodologias de segurança como bundles `SKILL.md`: o modelo as descobre no catálogo da sessão e carrega o corpo sob demanda com a ferramenta `skill`.

> Repositório: https://github.com/PerryLink/dsh-skill-pack-security

**Zero código em tempo de execução.** Nenhuma ferramenta é registrada, nenhum serviço é registrado, nenhum comportamento de sessão muda. O único executável é o plugin opcional `provider/` — uma demonstração de empacotamento — e o pacote funciona igualmente sem ele.

Cada skill é **executável por um modelo**: cada passo é um comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) com uma amostra de saída esperada, um critério de código de saída e critérios de falso positivo. Nenhuma afirmação não verificável.

## Por que skills, e não ferramentas?

| Forma | O que faz | O que não consegue fazer |
|---|---|---|
| Plugin de ferramentas (ex.: scanners) | **Executa** varreduras, devolve achados | Interpretar alertas, classificar falsos positivos, escrever relatórios redigidos |
| Camada de protocolo | **Restringe** um protocolo | Generalizar entre repositórios e agentes |
| **Pacote de skills (este repo)** | **Ensina metodologia**: triagem, relatórios, ordem de remediação | Executar varreduras por conta própria |

Instalado junto com um plugin de segurança do tipo ferramenta, os dois se compõem: a ferramenta executa a varredura, a skill conduz a interpretação, a triagem e o relatório — o modelo segue a metodologia deste pacote enquanto chama as ferramentas do plugin.

As 3000+ skills do ecossistema Claude Code provam o valor de distribuição dessa forma. O frontmatter `SKILL.md` do DSH (`name`, `description`, `whenToUse`) é compatível com o formato de skills do CC; este pacote usa apenas o subconjunto comum e seu conteúdo é totalmente original.

## As oito skills

| Skill | Propósito em uma linha | Quando usar |
|---|---|---|
| `security-audit` | Fluxo de auditoria em cinco fases: escopo → inventário → classificação de risco → verificação → modelo de relatório | Auditorias de repositório inteiro, relatórios, planejamento |
| `secret-scan` | Auditoria de credenciais: uso de gitleaks/trivy, níveis de falso positivo, relatórios redigidos, ordem de remediação | Varredura de segredos, triagem de alertas, relatórios de vazamento |
| `dependency-audit` | Auditoria de cadeia de suprimentos: leitura de pnpm/npm audit, licenças, risco de typosquat, deriva do lockfile | Revisão de dependências, interpretação de relatórios de auditoria |
| `supply-chain-review` | Revisão rápida de PR/novas dependências: scripts de instalação perigosos, typosquat, builds reproduzíveis | Revisar PRs que adicionam dependências |
| `prompt-injection-review` | Revisão de superfícies de injeção em projetos de agentes: AGENTS.md, skills, descrições de ferramentas, MCP, web | Revisar superfícies de injeção do contexto do modelo |
| `threat-model` | Modelagem de ameaças na fase de design: limites de confiança, tabela STRIDE, árvores de ataque, mitigações | Modelar novos recursos, revisão de segurança na fase de design |
| `vuln-intel` | Inteligência de vulnerabilidades: consultas a NVD/CISA-KEV/GHSA/OSV com critérios de veredito | Dado um id de CVE/GHSA, verificar impacto e exploração |
| `incident-response` | Resposta a incidentes em ambiente de agentes: conter → evidência → recuperar → post-mortem | Incidentes de segurança suspeitos em configurações de DSH/agentes |

Cada bundle: arquivo principal ≤ 300 linhas (divulgação progressiva; detalhes vivem em `references/`), `description` autocontida sobre "quando usar / quando não usar" e `whenToUse` com gatilhos precisos.

**Duas edições de idioma.** Cada skill é distribuída com nomes e metadados idênticos em duas edições: `skills/` (chinês) e `skills-en/` (inglês). Instale um idioma por raiz — skills de mesmo nome em uma raiz são resolvidas por rank, então apenas uma edição entra no catálogo da sessão. Veja [docs/release-checklist.md](docs/release-checklist.md) para as regras das edições de idioma.

## Início rápido

O provedor local de skills do DSH varre quatro raízes por rank — o rank menor vence conflitos de mesmo nome dentro de uma camada:

| Rank | Raiz | Escopo |
|---|---|---|
| 100 | `<raizDoRepo>/.dsh/skills` | Por projeto, viaja com o repositório |
| 200 | `<raizDoRepo>/.agents/skills` | Por projeto, diretório de agentes compartilhado |
| 400 | `<dshHome>/skills` (`$DSH_HOME` ou `~/.dsh`) | Por usuário, somente DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` ou `~/.agents`) | Por usuário, entre agentes |

Ranks (o menor vence conflitos de mesmo nome dentro de uma camada): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`. O rank custom 300 é registrado por plugin (como o `provider/` opcional deste pacote), não é uma raiz de disco.

Instalação com um comando (PowerShell, Windows):

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (default) | en
```

Ou bash (macOS/Linux/CI):

```sh
bash ./scripts/install.sh --target user-agents --language en
```

Ou copie manualmente (exemplo em PowerShell do Windows; qualquer shell serve — use `skills-en\` para a edição em inglês):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

O catálogo aparece na próxima sessão do DSH. Os corpos das skills recarregam a quente — edite `SKILL.md` e o próximo carregamento com `skill` lê o novo corpo; sem reiniciar. Desinstalar = executar o instalador com `-Uninstall` / `--uninstall` (ele remove exatamente o que seu manifesto registrou) ou apagar os diretórios copiados manualmente.

Opcional: monte o pacote inteiro sem copiar via o plugin `provider/` — `language: zh|en` escolhe a edição (veja [provider/README.md](provider/README.md)). O provedor é publicado no npm como [`@perrylink/dsh-skill-pack-security-provider`](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider): `dsh plugin add @perrylink/dsh-skill-pack-security-provider` o monta com um comando.

## O que há dentro

| Caminho | O que é |
|---|---|
| `skills/<nome>/SKILL.md` | As oito skills (edição em chinês); o frontmatter segue o contrato oficial do `dsh-skill-filesystem` |
| `skills-en/<nome>/SKILL.md` | As oito skills (edição em inglês); mesmos nomes e metadados da edição em chinês |
| `skills/<nome>/references/` | Detalhes com divulgação progressiva: matrizes de comandos, tabelas de triagem, modelos |
| `scripts/install.ps1` | Instalador de um comando para Windows para as quatro raízes (ambas as edições de idioma); registra um manifesto, suporta `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | O equivalente POSIX (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | Bundle de provedor opcional instalável via npm (declara `dsh.bundle`; embute ambas as edições em `pack/` via `prepack`; `language: zh\|en`); registrado via `ctx.effect()`, falha de forma explícita em um `skillsDir` inválido |
| `package.json` | Manifesto do bundle raiz: declara `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) e os fatos de intake `dshWorkshop`, para que `dsh plugin add github:PerryLink/dsh-skill-pack-security` monte o pacote pelo provedor publicado |
| `verify/verify-skill-pack.mts` | Verificação headless contra o parser oficial e a ferramenta `skill` real — 19 verificações nas duas edições |
| `VERSION` | Fonte única de versão; todo `metadata.version` de SKILL.md e `provider/package.json` deve corresponder a ela (aplicado por CI) |
| `docs/ecosystem-conflict-check.md` | Instantâneo de conflitos de tópicos/nomes do GitHub no ecossistema `dsh-plugin` |
| `docs/release-checklist.md` | Fluxo de release: pontos de sincronização de versão, regras de edição de idioma, tagging |
| `docs/improvement-plan.md` | O plano de melhoria 1.2.0 com evidência por item e critérios de aceitação |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Histórico de releases, política de relato de vulnerabilidades e regras de contribuição/verificação |
| `.github/workflows/verify.yml` | CI: as 19 verificações + exercício de install.sh/install.ps1 + smoke de build/pack do provider, no Ubuntu e no Windows contra um commit fixado do harness |
| `.github/dependabot.yml` | Atualizações semanais de dependências para o provider e GitHub Actions |
| `LICENSE` | Apache License 2.0 |

## Verificação

`verify/verify-skill-pack.mts` importa o parser **oficial** `dsh-skill-filesystem` e a ferramenta **real** `skill` de um checkout local do `deepseek-harness` e aplica 19 verificações sobre ambas as edições de idioma:

1. Layout: ambas as edições presentes, 8 bundles de diretório cada, sem skills planas soltas, `name` do frontmatter coincide com o diretório, ≤ 300 linhas, `references/` conectado, `metadata.version` sincronizado com o arquivo `VERSION`
2. Sem conflito de nomes com as skills oficiais de `.agents/skills/` (derivadas do checkout em tempo de execução) nem com pacotes de skills comunitários conhecidos
3–6. Por edição (chinês `skills/`, inglês `skills-en/`): descoberta de registro pelo provedor oficial, carregamentos completos de `ctx.skills.get()`, a ferramenta `skill` real devolvendo `<skill_content>` (nomes desconhecidos/inválidos rejeitados), e o catálogo da sessão contendo apenas `name` + `description` — `whenToUse` fica fora do catálogo do modelo (design oficial)
7. 13 fixtures de frontmatter inválido exercitam as regras oficiais fail-closed (campos ausentes, chaves camel-case legadas, valores não booleanos, nomes não kebab, diretórios aninhados, divergência de nome); skills em arquivo plano carregam e `**/SKILL.md` aninhado não é descoberto
8. O plugin provedor opcional monta a edição em chinês e a em inglês via `ctx.effect()`, descarta de forma limpa e rejeita configuração incorreta (`skillsDir` vazio ou inexistente)
9–15. Verificações de auto-endurecimento: paridade estrutural zh↔en, fiação de referências (sem arquivos órfãos/pendurados), sincronização de versão do provider, ranks documentados de raiz de skills vs as constantes oficiais, padrões `grep -E` portáveis em POSIX, auto-verificação de segredos, checklist de release seguro em UTF-8

```powershell
# local: auto-resolves the harness checkout beside the pack, or point it explicitly
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 19 checks passed for dsh-skill-pack-security.
```

As mesmas 19 verificações rodam no GitHub a cada push via `.github/workflows/verify.yml` (badge acima) — no Ubuntu e no Windows — além de um exercício de `install.sh`/`install.ps1` e um smoke independente de build/pack do provider que verifica que o tarball carrega ambas as edições embutidas e o patch do bundle (job `provider`). O checkout do harness é fixado em um commit para verificação reproduzível.

## Roadmap

- `dsh-skill-pack-data-engineering` — pipelines de dados, qualidade de dados, checklists de ETL (mesmo modelo)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triagem de issues, fluxos de mantenedor
- `dsh-skill-pack-performance` — metodologia de profiling, critérios de benchmark, checklists de regressão
- Mais skills dentro deste pacote (mesmo limite de skill pura): `sbom-lifecycle` (fluxos de geração/envelhecimento/importação de SBOM), `pen-test-review` (escopo de engajamento autorizado e revisão de relatórios; verifique novamente o instantâneo do ecossistema para conflitos de nome antes de publicar), `compliance-audit` (walkthroughs ASVS/NIST-CSF)
- Bundle de provedor publicado no npm como `@perrylink/dsh-skill-pack-security-provider` (pronto para `dsh plugin add`); mantenha-o em sincronia com cada release via `docs/release-checklist.md`

## Tópicos (Topics)

Se você hospedar este pacote no GitHub, configure os tópicos do repositório: **`dsh`**, **`dsh-plugin`**, **`deepseek-harness`**, **`skill-pack`**, **`skills`**, **`security`**, **`security-audit`**, **`supply-chain`**, **`supply-chain-security`**, **`prompt-injection`**. As badges `dsh` / `dsh-plugin` acima refletem essa identidade, e `provider/package.json` carrega os mesmos valores em `keywords`.

## Limites

Sem plugin de auditoria de segurança do tipo ferramenta (deliberadamente complementar aos scanners), sem marketplace de skills, sem conteúdo copiado de skills do CC — formato compatível, conteúdo original.

## Contribuidores

Obrigado a todos que contribuíram com este projeto.

| Contribuidor | Contribuições |
|---|---|
| [@PerryLink](https://github.com/PerryLink) | Autor e mantenedor — as oito skills em ambas as edições de idioma, instaladores, a suíte de verificação, o bundle do provedor, CI e documentação |

Seu nome pode estar aqui — veja [CONTRIBUTING.md](CONTRIBUTING.md) e abra um issue ou PR. Novos contribuidores são adicionados a esta lista.

## Licença

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Cobre tanto o conteúdo das skills quanto o plugin provedor opcional.
