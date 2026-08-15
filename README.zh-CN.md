<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>面向 DeepSeek Harness 的安全审计方法论 — 8 个 agent 技能，零运行时代码。</b><br/>
  密钥扫描 · 依赖审计 · 供应链评审 · 提示注入审查 · 审计总编排 · 威胁建模 · 漏洞情报 · 事件响应
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <b><a href="README.zh-CN.md">中文</a></b> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/stargazers"><img src="https://img.shields.io/github/stars/PerryLink/dsh-skill-pack-security?style=flat-square&color=yellow" alt="Stars"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/network/members"><img src="https://img.shields.io/github/forks/PerryLink/dsh-skill-pack-security?style=flat-square&color=blue" alt="Forks"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/v/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=cb3837" alt="npm 版本"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/dw/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=blue" alt="npm 周下载量"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Topic: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Topic: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-8-8257D0" alt="8 个技能">
  <img src="https://img.shields.io/badge/verified-19%2F19%20checks-brightgreen" alt="Verified: 19/19 checks">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Languages: EN/ZH/ES/PT/HI">
</p>

---

## 这是什么？

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的**纯技能包**——`dsh` 是构建于 [Cordis](https://github.com/cordiverse/cordis) 之上的"一切皆插件" agent 框架。本包把 8 套安全方法论做成 `SKILL.md` 技能：模型在会话目录中发现它们，按需用 `skill` 工具加载全文。

> 仓库地址：https://github.com/PerryLink/dsh-skill-pack-security

**零运行时代码。** 不注册任何工具、不注册任何服务、不改变会话行为。唯一的可执行物是可选的 `provider/` 插件（打包分发示范）——不装它，技能包照常工作。

每个技能都**可被模型直接执行**：每个步骤都是真实命令（`gitleaks`、`trivy`、`pnpm audit`、`npm view`、`git …`），附预期输出样例、退出码判据与误报判据，不写任何不可验证的断言。

## 为什么是技能，而不是工具？

| 形态 | 做什么 | 做不到什么 |
|---|---|---|
| 工具型插件（如扫描器） | **执行**扫描、返回发现 | 解读告警、误报分级、写脱敏报告 |
| 协议层 | **约束**某个协议 | 跨仓库、跨 agent 泛化 |
| **技能包（本仓库）** | **传授方法论**：分级、报告、修复排序 | 亲自执行扫描 |

与工具型安全插件同装时两者互补：工具负责跑扫描，技能负责解读、分级与报告——模型按本包方法论调用工具插件的工具，产出可复核的审计报告。

Claude Code 生态 3000+ 技能已经证明这种形态的分发价值。DSH 的 `SKILL.md` frontmatter（`name`/`description`/`whenToUse`）与 CC 技能格式兼容；本包只用公共子集，内容全部原创。

## 八个技能

| 技能 | 一句话定位 | 何时用 |
|---|---|---|
| `security-audit` | 五阶段审计流程：范围→资产清单→风险分级→验证→报告模板 | 整体审计、出报告、规划步骤 |
| `secret-scan` | 凭据审计：gitleaks/trivy 用法、误报分级、脱敏报告、修复排序 | 密钥扫描、告警定真伪、泄露报告 |
| `dependency-audit` | 供应链审计：pnpm/npm audit 解读、license、投毒风险、锁文件漂移 | 依赖盘点、audit 报告解读 |
| `supply-chain-review` | PR/新依赖快速评审：危险 install 脚本、typosquat、可复现构建 | 评审引入新依赖的 PR |
| `prompt-injection-review` | agent 项目注入面审查：AGENTS.md、技能、工具描述、MCP、网页 | 审查模型上下文注入面 |
| `threat-model` | 设计期威胁建模：信任边界、STRIDE 表、攻击树、缓解 | 新功能建模、设计阶段安全评审 |
| `vuln-intel` | 漏洞情报：NVD/CISA-KEV/GHSA/OSV 四源检索与判定 | 拿到 CVE/GHSA 编号后查影响与在野利用 |
| `incident-response` | agent 环境事件响应：控制→取证→恢复→复盘 | DSH/agent 环境出现疑似安全事件 |

每个技能：主文件 ≤ 300 行（渐进披露，细节在 `references/`）；`description` 自包含"何时用/何时不用"；`whenToUse` 给出精确触发条件。

**双语双套。** 每个技能以相同名称与元数据提供两个语言版：`skills/`（中文）与 `skills-en/`（英文）。每个根目录只安装一种语言——同名技能在同一根目录内按 rank 去重，只有一个语言版会进入会话目录。语言版规则见 [docs/release-checklist.md](docs/release-checklist.md)。

## 快速开始

DSH 本地技能提供方按 rank 扫描四种根目录，同层内重名时低 rank 胜出：

| Rank | 根目录 | 适用范围 |
|---|---|---|
| 100 | `<项目根>/.dsh/skills` | 项目级、随仓库走 |
| 200 | `<项目根>/.agents/skills` | 项目级、跨 agent 共享目录 |
| 400 | `<dshHome>/skills`（`$DSH_HOME` 或 `~/.dsh`） | 用户级、DSH 专用 |
| 500 | `<agentsHome>/skills`（`$DSH_AGENTS_HOME` 或 `~/.agents`） | 用户级、跨 agent 共享 |

Rank 链（同层内重名低者胜）：`project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`。custom 300 是插件注册层（如本包可选的 `provider/`），不是磁盘根目录。

一键安装（PowerShell，Windows）：

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents；Language: zh（默认）| en
```

或 bash（macOS/Linux/CI）：

```sh
bash ./scripts/install.sh --target user-agents --language en
```

或手动复制（以 Windows PowerShell 为例，任意 shell 均可；英文版用 `skills-en\`）：

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

下一个 DSH 会话即可看到技能目录；正文热更新（改 `SKILL.md` 后下次 `skill` 加载即新内容，无需重启）。卸载 = 用安装器的 `-Uninstall` / `--uninstall`（只删除其清单记录的内容）或手动删除复制过去的目录。

可选：通过 `provider/` 插件挂载整个技能包、免复制（`language: zh|en` 选择语言版，见 [provider/README.md](provider/README.md)）。provider 已发布在 npm：[`@perrylink/dsh-skill-pack-security-provider`](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)——一条 `dsh plugin add @perrylink/dsh-skill-pack-security-provider` 即完成挂载。

## 目录结构

| 路径 | 内容 |
|---|---|
| `skills/<name>/SKILL.md` | 8 个技能（中文版）；frontmatter 逐条符合官方 `dsh-skill-filesystem` 契约 |
| `skills-en/<name>/SKILL.md` | 8 个技能（英文版）；名称与元数据与中文版一致 |
| `skills/<name>/references/` | 渐进披露细节：命令矩阵、分级表、模板 |
| `scripts/install.ps1` | Windows 一键安装（四种根目录、两种语言版）；记录清单，支持 `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | POSIX 等价安装器（`--uninstall`/`--dry-run`/`--force`） |
| `provider/` | 可选 npm 可安装的 provider bundle（声明 `dsh.bundle`；`prepack` 把双语言版嵌入 `pack/`；`language: zh\|en`）；经 `ctx.effect()` 注册，`skillsDir` 配错响亮失败 |
| `verify/verify-skill-pack.mts` | 官方解析器 + 真实 `skill` 工具 headless 校验——双语共 19 项检查 |
| `VERSION` | 版本单一来源；每个 SKILL.md 的 `metadata.version` 与 `provider/package.json` 必须与其一致（CI 强制） |
| `docs/ecosystem-conflict-check.md` | `dsh-plugin` 生态的 GitHub 话题/命名冲突排查快照 |
| `docs/release-checklist.md` | 发布流程：版本同步点、语言版规则、打 tag 步骤 |
| `docs/improvement-plan.md` | 1.2.0 完善方案（逐项证据与验收标准）与 1.3.0 完善记录 |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | 发布历史、漏洞报告政策、贡献与校验规则 |
| `.github/workflows/verify.yml` | CI：19 项校验 + install.sh/install.ps1 演练 + provider 独立构建/打包冒烟（Ubuntu 与 Windows，harness 固定 commit） |
| `.github/dependabot.yml` | provider 与 GitHub Actions 的每周依赖更新 |
| `LICENSE` | Apache License 2.0 |

## 校验

`verify/verify-skill-pack.mts` 从本机 `deepseek-harness` checkout 导入**官方** `dsh-skill-filesystem` 解析器与**真实** `skill` 工具，对两个语言版实测 19 项检查：

1. 目录结构：两个语言版齐备、各 8 个 bundle、无多余平铺 md、frontmatter `name` 与目录名一致、≤ 300 行、`references/` 已接线、`metadata.version` 与 `VERSION` 文件同步
2. 与官方 `.agents/skills/` 技能（运行时从 checkout 推导）及已知社区技能包零重名
3–6. 每个语言版（中文 `skills/`、英文 `skills-en/`）：官方 provider 发现全部 8 个技能、`ctx.skills.get()` 加载全部正文/metadata/调用策略、真实 `skill` 工具返回 `<skill_content>`（未知名/非法名被拒绝）、会话目录只含 `name`+`description`——`whenToUse` 不进入模型目录（官方设计）
7. 13 个坏 frontmatter 用例逐条验证官方 fail-closed 规则（缺字段、驼峰遗留键、非布尔值、非 kebab 名、嵌套目录、名称不一致）；平铺 `flat.md` 技能可发现，嵌套 `**/SKILL.md` 不被发现
8. 可选 provider 插件经 `ctx.effect()` 挂载中文版与英文版、dispose 干净，并拒绝错误配置（空/不存在的 `skillsDir`）
9–15. 自加固检查：zh↔en 结构对齐、references 接线（无悬空/孤儿文件）、provider 版本同步、文档 rank 对照官方常量、`grep -E` 模式 POSIX 可移植、包内密钥自检、release-checklist UTF-8 安全

```powershell
# 本地运行：默认自动解析包旁的 harness checkout，也可显式指定
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 19 checks passed for dsh-skill-pack-security.
```

同样的 19 项检查由 `.github/workflows/verify.yml` 在 GitHub 上每次 push 自动重跑（徽章见上方）——Ubuntu 与 Windows 双平台——另有 `install.sh`/`install.ps1` 演练与 provider 独立构建/打包冒烟（断言 tarball 含双语言版与 bundle patch 的 `provider` job）。harness checkout 固定 commit，保证验证可复现。

## Roadmap

- `dsh-skill-pack-data-engineering` —— 数据管道、数据质量、ETL 检查清单（同模板）
- `dsh-skill-pack-oss-collab` —— PR 礼仪、issue 分类、维护者工作流
- `dsh-skill-pack-performance` —— profile 方法论、基准判定、回归清单
- 本包内更多技能（保持纯技能边界）：`sbom-lifecycle`（SBOM 生成/老化/导入工作流）、`pen-test-review`（授权测试的范围界定与报告评审；发布前复查生态快照防重名）、`compliance-audit`（ASVS/NIST-CSF 走查）
- provider bundle 已发布 npm：`@perrylink/dsh-skill-pack-security-provider`（`dsh plugin add` 可用）；每次发布按 `docs/release-checklist.md` 保持同步

## 话题（Topics）

在 GitHub 托管本包时，请设置仓库话题：**`dsh`**、**`dsh-plugin`**、**`deepseek-harness`**、**`skill-pack`**、**`skills`**、**`security`**、**`security-audit`**、**`supply-chain`**、**`supply-chain-security`**、**`prompt-injection`**。上方 `dsh` / `dsh-plugin` 徽章即该身份标识，`provider/package.json` 的 `keywords` 同步携带同样取值。

## 边界

不做工具型安全审计插件（与扫描器插件刻意互补）、不做技能市场、不复制 CC 技能内容——格式兼容、内容原创。

## 贡献者

感谢所有为本项目做出贡献的人。

| 贡献者 | 贡献内容 |
|---|---|
| [@PerryLink](https://github.com/PerryLink) | 作者与维护者 —— 双语版 8 个技能、安装脚本、验证套件、provider 包、CI 与文档 |

你的名字也可以出现在这里 —— 参见 [CONTRIBUTING.md](CONTRIBUTING.md) 并提交 issue 或 PR。新贡献者会加入此名单。

## 协议

[Apache License 2.0](LICENSE) —— © 2026 dsh-skill-pack-security contributors。技能内容与可选 provider 插件同受此协议约束。
