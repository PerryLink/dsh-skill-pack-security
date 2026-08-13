<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Metodologia de auditoria de segurança para o DeepSeek Harness — cinco agent skills, zero código em tempo de execução.</b><br/>
  varredura de segredos · auditoria de dependências · revisão de cadeia de suprimentos · revisão de injeção de prompt · orquestração de auditoria
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.es.md">Español</a> ·
  <b><a href="README.pt.md">Português</a></b> ·
  <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Licença: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Tópico: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Tópico: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-5-8257D0" alt="5 skills">
  <img src="https://img.shields.io/badge/verified-9%2F9%20checks-brightgreen" alt="Verificado: 9/9 verificações">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Idiomas: EN/ZH/ES/PT/HI">
</p>

---

## O que é isto?

Um **pacote de skills puro** para o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — o harness de agentes "tudo é um plugin" construído sobre o [Cordis](https://github.com/cordiverse/cordis). Ele distribui cinco metodologias de auditoria de segurança como bundles `SKILL.md`: o modelo as descobre no catálogo da sessão e carrega o corpo sob demanda com a ferramenta `skill`.

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

## As cinco skills

| Skill | Propósito em uma linha | Quando usar |
|---|---|---|
| `security-audit` | Fluxo de auditoria em cinco fases: escopo → inventário → classificação de risco → verificação → modelo de relatório | Auditorias de repositório inteiro, relatórios, planejamento |
| `secret-scan` | Auditoria de credenciais: uso de gitleaks/trivy, níveis de falso positivo, relatórios redigidos, ordem de remediação | Varredura de segredos, triagem de alertas, relatórios de vazamento |
| `dependency-audit` | Auditoria de cadeia de suprimentos: leitura de pnpm/npm audit, licenças, risco de typosquat, deriva do lockfile | Revisão de dependências, interpretação de relatórios de auditoria |
| `supply-chain-review` | Revisão rápida de PR/novas dependências: scripts de instalação perigosos, typosquat, builds reproduzíveis | Revisar PRs que adicionam dependências |
| `prompt-injection-review` | Revisão de superfícies de injeção em projetos de agentes: AGENTS.md, skills, descrições de ferramentas, MCP, web | Revisar superfícies de injeção do contexto do modelo |

Cada bundle: arquivo principal ≤ 300 linhas (divulgação progressiva; detalhes vivem em `references/`), `description` autocontida sobre "quando usar / quando não usar" e `whenToUse` com gatilhos precisos.

## Início rápido

O provedor local de skills do DSH varre quatro raízes por rank — o rank menor vence conflitos de mesmo nome dentro de uma camada:

| Rank | Raiz | Escopo |
|---|---|---|
| 100 | `<raizDoRepo>/.dsh/skills` | Por projeto, viaja com o repositório |
| 200 | `<raizDoRepo>/.agents/skills` | Por projeto, diretório de agentes compartilhado |
| 400 | `<dshHome>/skills` (`$DSH_HOME` ou `~/.dsh`) | Por usuário, somente DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` ou `~/.agents`) | Por usuário, entre agentes |

Instalação com um comando (PowerShell):

```powershell
./scripts/install.ps1 -Target user-agents   # ou: project-dsh | project-agents | user-dsh
```

Ou cópia manual (exemplo em PowerShell do Windows; qualquer shell serve):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

O catálogo aparece na próxima sessão do DSH. Os corpos das skills recarregam a quente — edite `SKILL.md` e o próximo carregamento com `skill` lê o novo corpo; sem reiniciar. Desinstalar = apagar os diretórios copiados.

Opcional: monte o pacote inteiro sem copiar usando o plugin `provider/` (veja [provider/README.md](provider/README.md)).

## O que há dentro

| Caminho | O que é |
|---|---|
| `skills/<nome>/SKILL.md` | As cinco skills; o frontmatter segue o contrato oficial do `dsh-skill-filesystem` |
| `skills/<nome>/references/` | Detalhes com divulgação progressiva: matrizes de comandos, tabelas de triagem, modelos |
| `scripts/install.ps1` | Instalador de um comando para as quatro raízes |
| `provider/` | Plugin provedor opcional (demonstração de empacotamento, registrado via `ctx.effect()`) |
| `verify/verify-skill-pack.mts` | Verificação headless contra o parser oficial e a ferramenta `skill` real |
| `LICENSE` | Apache License 2.0 |

## Verificação

`verify/verify-skill-pack.mts` importa o parser **oficial** `dsh-skill-filesystem` e a ferramenta **real** `skill` de um checkout local do `deepseek-harness` e verifica 9 conjuntos de asserções:

1. Estrutura: 5 bundles de diretório, sem md planos soltos, `name` do frontmatter coincide com o diretório, ≤ 300 linhas, `references/` conectado
2. Sem conflito de nomes com as 12 skills oficiais de `.agents/skills/` nem com pacotes de skills comunitários conhecidos
3. As 5 skills descobertas pelo provedor oficial
4. `ctx.skills.get()` carrega todos os corpos, metadados e política de invocação
5. A ferramenta `skill` real devolve `<skill_content>` para as 5 skills; nomes desconhecidos/inválidos são rejeitados
6. O catálogo da sessão contém apenas `name` + `description` — `whenToUse` fica fora do catálogo do modelo (design oficial)
7. 13 fixtures de frontmatter inválido exercitam as regras oficiais fail-closed (campos ausentes, chaves camel-case legadas, valores não booleanos, nomes não kebab, diretórios aninhados, divergência de nome)
8. Skills em arquivo plano carregam; `**/SKILL.md` aninhado não é descoberto
9. O plugin provedor opcional monta via `ctx.effect()` e descarta de forma limpa

```powershell
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 9 checks passed for dsh-skill-pack-security.
```

## Roadmap

- `dsh-skill-pack-data-engineering` — pipelines de dados, qualidade de dados, checklists de ETL (mesmo modelo)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triagem de issues, fluxos de mantenedor
- `dsh-skill-pack-performance` — metodologia de profiling, critérios de benchmark, checklists de regressão
- Opcional: empacotar o pack como provedor de badge integrado nos moldes de `dsh-skill-badge`

## Tópicos (Topics)

Se você hospedar este pacote no GitHub, configure os tópicos do repositório: **`dsh`**, **`dsh-plugin`** — mais `skill-pack`, `security-audit`, `supply-chain-security`, `prompt-injection`. As badges `dsh` / `dsh-plugin` acima refletem essa identidade, e `provider/package.json` carrega os mesmos valores em `keywords`.

## Limites

Sem plugin de auditoria de segurança do tipo ferramenta (deliberadamente complementar aos scanners), sem marketplace de skills, sem conteúdo copiado de skills do CC — formato compatível, conteúdo original.

## Licença

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Cobre tanto o conteúdo das skills quanto o plugin provedor opcional.
