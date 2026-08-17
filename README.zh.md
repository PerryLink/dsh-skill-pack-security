<div align="center">

# dsh-skill-pack-security

**面向 DeepSeek Harness 的八个安全审计技能 + 一个自动化插件供应链门禁。**

*技能教审计方法论；`plugin_vet` 工具执行安装前扫描——许可证 / SBOM / commit 锁定 / 恶意模式 / 五维风险卡片。*

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

| 维度 | 状态 |
|---|---|
| Harness | DeepSeek Harness `0.1.0-rc.6` |
| Node | `^22.19.0 \|\| >=24.0.0`（DeepSeek Harness 运行时） |
| 平台 | 任意（技能是内容；provider 是 host 插件） |
| 模型 | 任意（技能经 `skill` 工具按需加载；`plugin_vet` 是确定性的） |

## What you get

`dsh-skill-pack-security` 是面向 DeepSeek Harness 的**技能包 + 供应链门禁**。它把 8 套安全方法论做成 `SKILL.md` 技能（模型在会话目录中发现它们，用 `skill` 工具按需加载），并附自动化安装前扫描器 `plugin_vet`。**技能教方法论，插件执行静态检查。**

- **八个技能、双语双套** —— 每个技能以相同名称与元数据提供 `skills/`（中文）与 `skills-en/`（英文）两个版本；每个根目录只装一种语言。
- **`plugin_vet` 门禁** —— 由可选 `provider/` 插件注册到 `ctx.tools` 的零依赖扫描器（许可证 / SBOM / commit 锁定 / 恶意模式 / 五维风险卡片）。
- **发现引用技能** —— 每个发现指向对应技能章节（如 `supply-chain-review §1`），agent 可继续人工审计。
- **可被模型执行** —— 每个技能步骤都是真实命令（`gitleaks`、`trivy`、`pnpm audit`、`npm view`、`git …`），附预期输出样例与退出码判据。

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
- **五维风险报告** —— 许可证 / 来源 / 依赖 / 构建脚本 / 维护状态，各 0–100 分，汇总为整体判定：PASS、WARN 或 FAIL。

**安装前门禁。** 判定结果进入安装门禁——`gate.policy: warn`（默认，不阻断）在 FAIL 时打印警告；`gate.policy: deny` 直接阻断安装：

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # 阻断 plugin_vet 不过的安装
```

## Quick start

```sh
# 1. 把 bundle 安装进 profile
dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"

# 或从 npm（发布版本）
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. 重启并校验该行
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Install & uninstall

- **git 通道**（最新 `main`）：`dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"` —— 挂载 provider bundle；`prepack` 把双语言版嵌入 tarball。
- **npm 通道**（发布版本）：`dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`。
- **tarball 通道**：在 `provider/` 里 `pnpm pack`，再 `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`。
- **卸载**：`dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider`（或删除该行；纯技能副本用安装器的 `-Uninstall` / `--uninstall` 删除）。

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
| `vet.userAgent` | `dsh-skill-pack-security/2.0.0 (+https://github.com/PerryLink/dsh-skill-pack-security)` | 下载用的 user-agent |
| `vet.gate.policy` | `warn` | 安装门禁：`warn`（不阻断）或 `deny`（FAIL 时阻断） |

## Tools & surfaces

| 表面 | 类型 | 说明 |
|---|---|---|
| `plugin_vet` | tool | 安装前供应链扫描（许可证 / SBOM / commit 锁定 / 恶意 / 风险卡片）；发现引用技能章节 |
| `skill-pack-security` | skill provider | 把本包的 `skills/` 或 `skills-en/` 版本注册到 `ctx.skills` |
| 八个 `SKILL.md` 技能 | skills | 审计方法论，两个语言版 |
| 安装门禁 | gate | `vet.gate.policy: warn \| deny` 决定安装是否放行 |

## Permissions & data

- **权限**：`dshWorkshop` manifest 声明 `files:read` 与 `network:fetch`。
- **数据**：`plugin_vet` 一次性下载 tarball（遵守超时与 `AbortSignal`），报告会打码密钥形态文本；插件不注入任何 prompt 段。

## Security boundaries

- **零依赖引擎。** `plugin_vet` 只用 `node:` 内置与相对导入。
- **窄范围安装前门禁。** 不是通用安全审计工具——刻意与扫描器插件、官方 `dsh-plugin-check` 契约校验器互补。
- **默认不阻断。** 安装门禁默认为 `warn`，除非显式选择 `deny`。
- **内容原创。** 与 Claude Code 技能格式兼容，但不复制 CC 技能内容、不设技能市场。

## Verification

`verify/verify-skill-pack.mts` 从本地 `deepseek-harness` checkout 导入**官方** `dsh-skill-filesystem` 解析器、**真实** `skill` 工具与**真实**工具运行时，对两个语言版断言 25 项检查：目录结构与 frontmatter 合法性、与官方/社区技能零重名、`ctx.skills.get()` 完整加载、`plugin_vet` 走真实工具运行时的行为、零依赖不变量与报告脱敏。同样的 25 项检查由 `.github/workflows/verify.yml` 在 GitHub 上执行（Ubuntu 与 Windows）。

## Known limitations

- **不是完整审计工具。** `plugin_vet` 是窄范围的安装前信任门禁，不能端到端取代人工审计。
- **仅静态扫描。** 恶意模式与维护状态信号是对发布包的启发式判断，不是动态分析。
- **每根目录一个语言版。** 同名技能在同一根目录内按 rank 去重，只有一个语言版进入会话目录。

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # 把两个语言版嵌入 tarball
tsx verify/verify-skill-pack.mts    # 25 项 headless 校验
```

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) —— 作者与维护者：双语版八个技能、安装脚本、验证套件、provider 包、CI 与文档。

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
