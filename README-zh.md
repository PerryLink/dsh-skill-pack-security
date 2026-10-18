<div align="center">

# dsh-skill-pack-security
- **1024 商店渠道**：先 `npm i -g dsh1024`，再 `dsh1024 plugin --profile web add dsh-skill-pack-security`（计入 [deepseek1024.com](https://deepseek1024.com) 安装排行）。

**面向 DeepSeek Harness 的八个安全审计技能 + 一个自动化插件供应链门禁。**

*技能教审计方法论；`plugin_vet` 工具执行安装前扫描——许可证 / SBOM / commit 锁定 / 恶意模式 / 五维风险卡片。*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-skill-pack-security)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-skill-pack-security/verify.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-skill-pack-security/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-skill-pack-security?label=version)](https://github.com/PerryLink/dsh-skill-pack-security/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-skill-pack-security?metric=downloads&lang=zh)](https://dshfind.com/zh/plugins/PerryLink/dsh-skill-pack-security?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-skill-pack-security
```


</div>

---

## Install & uninstall

- **git 通道**（最新 `main`）：`dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security` —— 挂载 provider bundle；`prepack` 把双语言版嵌入 tarball。
- **npm 通道**（发布版本）：`dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`。
- **tarball 通道**：在 `provider/` 里 `pnpm pack`，再 `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`。
- **卸载**：`dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider`（或删除该行；纯技能副本用安装器的 `-Uninstall` / `--uninstall` 删除）。

## What is dsh-skill-pack-security?

面向 DeepSeek Harness 的八个安全审计技能 + 一个自动化插件供应链门禁。

技能教审计方法论；`plugin_vet` 工具执行安装前扫描——许可证 / SBOM / commit 锁定 / 恶意模式 / 五维风险卡片。

![dsh-skill-pack-security 终端演示：dsh-skill-pack-security — install the provider, verify all 25 checks](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-hero.png)

![Animated terminal demo of dsh-skill-pack-security](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-demo.gif)

*同一次运行，动图版。*

## Comparison

![dsh-skill-pack-security 的实测对比柱状图](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-evidence.png)

38 poison samples (20 malicious, 18 benign) · benchmark/RESULTS.md

## Compatibility

| 维度 | 状态 |
|---|---|
| Harness | DeepSeek Harness **`dsh-v0.2.1-alpha.1`**（GitHub tag，已于 2026-09-24 核验：完整门禁链 + profile 安装冒烟）。npm 依赖线：`@deepseek-ai/dsh` **0.1.5-rc.2**（peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`）。会话信封保留 ignorable 字段但仅用于存量日志读取兼容——Session.append 仍无法盖章，门控行为不变。 |
| Node | `^22.19.0 \|\| >=24.0.0`（DeepSeek Harness 运行时） |
| 平台 | 任意（技能是内容；provider 是 host 插件） |
| 模型 | 任意（技能经 `skill` 工具按需加载；`plugin_vet` 是确定性的） |

## What you get

`dsh-skill-pack-security` 是面向 DeepSeek Harness 的**技能包 + 供应链门禁**。它把 8 套安全方法论做成 `SKILL.md` 技能（模型在会话目录中发现它们，用 `skill` 工具按需加载），并附自动化安装前扫描器 `plugin_vet`。**技能教方法论，插件执行静态检查。**

- **八个技能、双语双套** —— 每个技能以相同名称与元数据提供 `skills/`（中文）与 `skills-en/`（英文）两个版本；每个根目录只装一种语言。
- **`plugin_vet` 门禁** —— 由可选 `provider/` 插件注册到 `ctx.tools` 的零依赖扫描器（许可证 / SBOM / commit 锁定 / 恶意模式 / 数据责任审查 / 五维风险卡片）。
- **发现引用技能** —— 每个发现指向对应技能章节（如 `supply-chain-review §1`），agent 可继续人工审计。
- **可被模型执行** —— 每个技能步骤都是真实命令（`gitleaks`、`trivy`、`pnpm audit`、`npm view`、`git …`），附预期输出样例与退出码判据。

## Why skills, not tools?

| 形态 | 做什么 | 做不到什么 |
|---|---|---|
| 工具型插件（如扫描器） | **执行**扫描、返回发现 | 解读告警、误报分级、写脱敏报告 |
| 协议层 | **约束**某个协议 | 跨仓库、跨 agent 泛化 |
| **技能包（本仓库）** | **传授方法论**：分级、报告、修复排序——**并**通过 `plugin_vet` 自动执行安装前静态检查 | 端到端取代人工审计 |

与工具型安全插件同装时两者互补：工具负责跑扫描，技能负责解读、分级与报告。本包现在两种形态兼有：技能教方法论，`plugin_vet` 自动跑机械性的静态子集，每个发现都指回技能继续深挖。

Claude Code 生态 3000+ 技能已经证明这种形态的分发价值。DSH 的 `SKILL.md` frontmatter（`name`/`description`/`whenToUse`）与 CC 技能格式兼容；本包只用公共子集，内容全部原创。

## The eight skills

| 技能 | 用途 | 何时用 |
|---|---|---|
| `security-audit` | 五阶段审计流程：范围→资产清单→风险分级→验证→报告模板 | 整体审计、出报告、规划步骤 |
| `secret-scan` | 凭据审计：gitleaks/trivy 用法、误报分级、脱敏报告、修复排序 | 密钥扫描、告警定真伪、泄露报告 |
| `dependency-audit` | 供应链审计：pnpm/npm audit 解读、license、投毒风险、锁文件漂移 | 依赖盘点、audit 报告解读 |
| `supply-chain-review` | PR/新依赖快速评审：危险 install 脚本、typosquat、可复现构建 | 评审引入新依赖的 PR |
| `prompt-injection-review` | agent 项目注入面审查：AGENTS.md、技能、工具描述、MCP、网页 | 审查模型上下文注入面 |
| `threat-model` | 设计期威胁建模：信任边界、STRIDE 表、攻击树、缓解 | 新功能建模、设计阶段安全评审 |
| `vuln-intel` | 漏洞情报：NVD/CISA-KEV/GHSA/OSV 检索与判定 | 拿到 CVE/GHSA 编号后查影响与利用 |
| `incident-response` | agent 环境事件响应：控制→取证→恢复→复盘 | DSH/agent 环境出现疑似安全事件 |

每个技能主文件 ≤ 300 行（渐进披露，细节在 `references/`）。

## plugin_vet — the automated pre-install gate

`plugin_vet` 是本包的自动化补充：由 `provider/` 插件注册到 `ctx.tools` 的零依赖扫描器。传入 GitHub `owner/repo` 或本地包路径即可——一次性下载 tarball（遵守超时与 `AbortSignal`）、在预算上限内扫描，并返回渲染卡片。

- **许可证扫描** —— 定位 LICENSE 文件与 `license` 字段；`NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <file>`、文件缺失或字段缺失都会被标出；常见 SPDX 标识可识别。
- **SBOM** —— 从锁文件（pnpm/npm/yarn）提取带版本的依赖树。
- **commit 锁定** —— 安装清单 ref 与 workflow action 必须是不可变的 40 位 commit SHA；`@tag`/分支 ref 会被标记为可变。
- **恶意模式** —— 生命周期脚本（`preinstall`/`install`/`postinstall`）、网络回传域名、发布代码中的混淆/编码载荷。
- **数据责任审查** —— 策略扫描三维的确定性规则版：敏感 seam（`agent/pre-step`、`tools/pre-execute`、`session/event` 等）上的无门控监听、README 未披露出站端点、描述-行为关键词覆盖率、随包文本中的指令覆盖类注入载荷（技能/文档/提示词/测试）。每条发现都指向 `prompt-injection-review` 供人工深审；可用 `vet.dataResponsibility: false` 按部署关闭。模型辅助审查阶段为已文档化的后续升级。
- **五维风险报告** —— 许可证 / 来源 / 依赖 / 构建脚本 / 维护状态，各 0–100 分，汇总为整体判定：PASS、WARN 或 FAIL。

**安装前门禁。** 判定结果进入安装门禁——`gate.policy: warn`（默认，不阻断）在 FAIL 时打印警告；`gate.policy: deny` 返回拒绝判定；工具本身不拦截宿主的 `dsh plugin add`，需由安装器/CI 执行该判定：

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # 对 plugin_vet 不过的目标返回拒绝判定（由调用方执行）
```

**与 `dsh-plugin-check` 互补。** 官方插件校验器的 36 项检测验证插件的*契约与质量*（配置 Schema、effect 注册、工具 JSON 形态）；`plugin_vet` 验证插件的*来源供应链*是否可信。两者都跑：

| | `dsh-plugin-check`（36 项检测） | `plugin_vet`（本仓库） |
|---|---|---|
| 回答的问题 | 这个插件是否结构良好、符合契约？ | 这个包安装是否安全？ |
| 检查对象 | 插件代码、Schema、注册、工具契约 | LICENSE、锁文件、安装 ref/action、生命周期脚本、回传/混淆、维护状态、数据责任（监听作用域、遥测披露、描述-行为、嵌入式注入载荷） |
| 判定 | 逐项 pass/fail | PASS / WARN / FAIL + 门禁 |
| 时机 | 插件开发或评审时 | `dsh plugin add` 前、PR 评审、CI 供应链门禁 |
| 阻断 | CI 门禁（有违规即非零退出） | 可配置：`warn`（默认）或 `deny` |

## Quick start

```sh
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security
```

```sh
# 1. 把 bundle 安装进 profile
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security

# 或从 npm（发布版本）
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. 重启并校验该行
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Installing the skills by hand

DSH 本地技能提供方按 rank 扫描四个根目录（同层内重名时低 rank 胜出）：

| Rank | 根目录 | 适用范围 |
|---|---|---|
| 100 | `<项目根>/.dsh/skills` | 项目级、随仓库走 |
| 200 | `<项目根>/.agents/skills` | 项目级、跨 agent 共享目录 |
| 400 | `<dshHome>/skills`（`$DSH_HOME` 或 `~/.dsh`） | 用户级、DSH 专用 |
| 500 | `<agentsHome>/skills`（`$DSH_AGENTS_HOME` 或 `~/.agents`） | 用户级、跨 agent 共享 |

Rank 链（同层内重名低者胜）：`project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`。custom 300 是插件注册层（如本包可选的 `provider/`），不是磁盘根目录。

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents；Language: zh（默认）| en
```

```sh
bash ./scripts/install.sh --target user-agents --language en
```

## What's inside

| 路径 | 内容 |
|---|---|
| `skills/<name>/SKILL.md` | 8 个技能（中文版）；frontmatter 逐条符合官方 `dsh-skill-filesystem` 契约 |
| `skills-en/<name>/SKILL.md` | 8 个技能（英文版）；名称与元数据与中文版一致 |
| `skills/<name>/references/` | 渐进披露细节：命令矩阵、分级表、模板 |
| `scripts/install.ps1` | Windows 一键安装（四种根目录、两种语言版）；记录清单，支持 `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | POSIX 等价安装器（`--uninstall`/`--dry-run`/`--force`） |
| `provider/` | npm 可安装的 provider bundle（声明 `dsh.bundle`；`prepack` 把双语言版嵌入 `pack/`；`language: zh\|en`）；经 `ctx.effect()` 注册技能提供方**与** `plugin_vet` 门禁工具，`skillsDir` 配错响亮失败 |
| `provider/src/vet/` | 零依赖 `plugin_vet` 扫描引擎（许可证 / SBOM / commit 锁定 / 恶意模式 / 风险报告） |
| `package.json` | 根 bundle manifest：声明 `dsh.bundle.patch`（→ `provider/cordis.patch.yml`）与 `dshWorkshop` intake 事实 |
| `verify/verify-skill-pack.mts` | 官方解析器 + 真实 `skill` 工具 + 真实工具运行时 headless 校验——双语共 25 项检查 |
| `VERSION` | 版本单一来源；每个 SKILL.md 的 `metadata.version` 与 `provider/package.json` 必须与其一致（CI 强制） |
| `docs/` | 生态冲突检查、发布清单、改进计划与 `plugin_vet` 演示 |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | 发布历史、漏洞报告政策、贡献与校验规则 |
| `.github/workflows/verify.yml` | CI：25 项校验 + 安装器演练 + provider 独立构建/打包冒烟（Ubuntu 与 Windows） |
| `.github/dependabot.yml` | provider 与 GitHub Actions 的每周依赖更新 |
| `LICENSE` | Apache License 2.0 |
| `THIRD_PARTY_NOTICES.md` | 第三方立场：零依赖引擎、已评估未移植的资产、peer 依赖许可 |

## Configuration

所有可调项都是 Schemastery `Config` 字段（可从 cordis.yml 覆盖）。`provider/cordis.patch.yml` 逐键内联注释。

| 键 | 默认值 | 含义 |
|---|---|---|
| `language` | `zh` | 发布的语言版：中文 `skills/` 或英文 `skills-en/`；设置 `skillsDir` 后忽略 |
| `watch` | `false` | 是否监听打包技能目录（内容静态，故默认关闭） |
| `skillsDir` | *(未设置)* | 显式技能根目录；覆盖 `language` 推导的默认值，须含 `<skill>/SKILL.md` 技能 |
| `vet.enable` | `true` | 注册 `plugin_vet` 门禁工具 |
| `vet.timeoutMs` | `15000` | tarball 下载超时（毫秒） |
| `vet.maxFiles` | `800` | 扫描文件数上限 |
| `vet.maxFileBytes` | `262144` | 单文件字节上限 |
| `vet.maxExtractBytes` | `67108864` | 解压字节上限 |
| `vet.maxDepNodes` | `600` | 依赖树节点上限 |
| `vet.maxFindingsPerCheck` | `12` | 每项检查的发现数上限 |
| `vet.dataResponsibility` | `true` | 运行数据责任审查（可按部署禁用） |
| `vet.externalScanners` | `true` | 当 `osv-scanner`/`npm audit` CLI 存在时编排它们；`false` 强制使用内置自计算依赖扫描 |
| `vet.userAgent` | `dsh-skill-pack-security/2.2.24 (+https://github.com/PerryLink/dsh-skill-pack-security)` | 下载用的 user-agent |
| `vet.gate.policy` | `warn` | 安装门禁：`warn`（不阻断）或 `deny`（FAIL 时阻断） |

## Tools & surfaces

| 表面 | 类型 | 说明 |
|---|---|---|
| `plugin_vet` | tool | 安装前供应链扫描（许可证 / SBOM / commit 锁定 / 恶意 / 风险卡片）；发现引用技能章节 |
| `skill-pack-security` | skill provider | 把本包的 `skills/` 或 `skills-en/` 版本注册到 `ctx.skills` |
| 八个 `SKILL.md` 技能 | skills | 审计方法论，两个语言版 |
| 安装门禁 | gate | `vet.gate.policy: warn \| deny` 返回判定；由安装器/CI 放行 |

## Permissions & data

- **权限**：`dshWorkshop` manifest 声明 `files:read` 与 `network:fetch`。
- **数据**：`plugin_vet` 一次性下载 tarball（遵守超时与 `AbortSignal`），报告会打码密钥形态文本；插件不注入任何 prompt 段。

## Security boundaries

- **零依赖引擎。** `plugin_vet` 只用 `node:` 内置与相对导入。
- **窄范围安装前门禁。** 不是通用安全审计工具——刻意与扫描器插件、官方 `dsh-plugin-check` 契约校验器互补。
- **默认不阻断。** 安装门禁默认为 `warn`，除非显式选择 `deny`。
- **内容原创。** 与 Claude Code 技能格式兼容，但不复制 CC 技能内容、不设技能市场。
- **引擎原创、未移植第三方资产。** 许可证扫描与恶意模式检查为原创零依赖实现；GPL-Radar / LLM-detective / Sus-PY 资产经评估未移植（未找到可核实许可证的公开源码）——见 `THIRD_PARTY_NOTICES.md`。

## Verification

`verify/verify-skill-pack.mts` 从本机 `deepseek-harness` checkout 导入**官方** `dsh-skill-filesystem` 解析器、**真实** `skill` 工具与**真实**工具运行时，对两个语言版实测 25 项检查：

1. 目录结构：两个语言版齐备、各 8 个 bundle、无多余平铺 md、frontmatter `name` 与目录名一致、≤ 300 行、`references/` 已接线、`metadata.version` 与 `VERSION` 文件同步
2. 与官方 `.agents/skills/` 技能（运行时从 checkout 推导）及已知社区技能包零重名
3–6. 每个语言版（中文 `skills/`、英文 `skills-en/`）：官方 provider 发现全部 8 个技能、`ctx.skills.get()` 加载全部正文、真实 `skill` 工具返回 `<skill_content>`（未知名/非法名被拒绝）、会话目录只含 `name`+`description`——`whenToUse` 不进入模型目录（官方设计）
7. 13 个坏 frontmatter 用例逐条验证官方 fail-closed 规则（缺字段、驼峰遗留键、非布尔值、非 kebab 名、嵌套目录、名称不一致）；平铺技能可发现，嵌套 `**/SKILL.md` 不被发现
8. 可选 provider 插件经 `ctx.effect()` 挂载中文版与英文版、dispose 干净，并拒绝错误配置（空/不存在的 `skillsDir`）
9–15. 自加固检查：zh↔en 结构对齐、references 接线（无悬空/孤儿文件）、provider 版本同步、文档 rank 对照官方常量、`grep -E` 模式 POSIX 可移植、包内密钥自检、release-checklist UTF-8 安全
16–19. `plugin_vet` 走真实工具运行时：注册到 `ctx.tools`；合规 fixture 通过；无 license fixture 失败并引用 `dependency-audit §3`；恶意 postinstall fixture 失败（脚本/回传/混淆，引用 `supply-chain-review §1`）；`policy: deny` 下门禁阻断安装
20. 扫描引擎零依赖（仅 `node:` 内置与相对导入）
21. 报告脱敏：密钥形态文本不进入渲染输出

```powershell
# 本地运行：默认自动解析包旁的 harness checkout，也可显式指定
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 25 checks passed for dsh-skill-pack-security.
```

同样的 25 项检查由 `.github/workflows/verify.yml` 在 GitHub 上每次 push 自动重跑——Ubuntu 与 Windows 双平台——另有 `install.sh`/`install.ps1` 演练与 provider 独立构建/打包冒烟（断言 tarball 含双语言版与 bundle patch）。

## Known limitations

- **不是完整审计工具。** `plugin_vet` 是窄范围的安装前信任门禁，不能端到端取代人工审计。
- **仅静态扫描。** 恶意模式与维护状态信号是对发布包的启发式判断，不是动态分析。
- **每根目录一个语言版。** 同名技能在同一根目录内按 rank 去重，只有一个语言版进入会话目录。

## Roadmap

- `dsh-skill-pack-data-engineering` —— 数据管道、数据质量、ETL 检查清单（同模板）
- `dsh-skill-pack-oss-collab` —— PR 礼仪、issue 分类、维护者工作流
- `dsh-skill-pack-performance` —— profile 方法论、基准判定、回归清单
- 本包内更多技能（保持纯技能边界）：`sbom-lifecycle`（SBOM 生成/老化/导入工作流）、`pen-test-review`（授权测试的范围界定与报告评审）、`compliance-audit`（ASVS/NIST-CSF 走查）
- 随每次发布刷新 `plugin_vet` 演示产物（`docs/demos/run-demos.mjs`），并随官方校验器新增检测保持 `dsh-plugin-check` 互补表准确

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # 把两个语言版嵌入 tarball
tsx verify/verify-skill-pack.mts    # 25 项 headless 校验
```

### Benchmark

投毒样本回归集（38 个样本的逐类检出率 / 误报率 / F1，以及与 OSV/Socket 的差距）见 [`benchmark/RESULTS.md`](benchmark/RESULTS.md)；用 `pnpm --dir provider run build && node benchmark/run.mjs` 复现（零新依赖）。

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) —— 作者与维护者：双语版八个技能、安装脚本、验证套件、provider 包、CI 与文档。

## PerryLink DSH Plugin Family

本项目是 [PerryLink](https://github.com/PerryLink) 维护的 DeepSeek Harness 插件家族成员：**87 个活跃维护**，名册共 **95** 个，其中 **5 个已冻结**、**3 个已退役**。完整名单默认折叠，避免每个 README 的首屏被长表淹没；点击展开可查看每一行，原因见「状态」列。

<details>
<summary>展开全部 95 个插件</summary>

| 插件 | 一句话 | 状态 |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 已退役 — 见仓库 README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 已冻结 — 见仓库 README |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 已冻结 — 见仓库 README |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 已冻结 — 见仓库 README |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 已冻结 — 见仓库 README |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 已冻结 — 见仓库 README |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 已退役 — 见仓库 README |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 已退役 — 见仓库 README |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors

### 从 DSH Desktop 市场安装

所有 PerryLink 插件均可在 DSH Desktop 内置市场中浏览：**市场 → 来源 → 添加来源 → 粘贴** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ 选中**。安装仍需通过市场的 npm 身份校验与你的确认。
