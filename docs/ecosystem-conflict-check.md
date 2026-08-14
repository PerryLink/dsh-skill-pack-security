# 生态冲突排查（Ecosystem conflict check）

> 快照时间：2026-08-14（UTC）。查询方式：GitHub Search API（`/search/repositories`，按 stars 排序取前 10）+ 社区仓库技能名逐一核对（git trees API）。
> Snapshot: 2026-08-14 (UTC). Method: GitHub Search API (`/search/repositories`, top 10 by stars) + per-name skill checks in community repos (git trees API).

## 查询与结果 / Queries and results

### `topic:dsh-plugin security`（total = 6）

| Repo | 形态 / Shape |
|---|---|
| openguardrails/openguardrails | 协议型 / protocol（AI agent 安全协议与基准） |
| **omdsh-dev/dsh-security-audit** | 工具型 / tool plugin（DSH 本机安全审计插件：扫描执行 + 只读脱敏报告） |
| ben7am1n/dsh-security-scan | 工具型 / tool plugin（扫描） |
| ShawnSiao/dsh-credentials-keychain | 工具型 / tool plugin（凭据 provider，规划中） |
| PerryLink/dsh-skill-pack-security | **本包 / this pack — 技能型 / skill pack** |
| 030611/dsh-telemetry-redactor | 工具型 / tool plugin（会话遥测脱敏） |

结论：同主题现有形态均为"工具/协议"，**无同名技能包**。本包与 `dsh-security-audit` 错位（方法论 vs 扫描执行），README「Why skills, not tools?」表格即此对照。

### `topic:dsh-plugin skill`（total = 53）

技能型分发在 `dsh-plugin` 话题下是活跃品类（53 个仓库）。抽查前 10 名中与本包技能名（`security-audit`、`secret-scan`、`dependency-audit`、`supply-chain-review`、`prompt-injection-review`）**无重名**；各仓库均为独立插件/技能主题（可视化、HarmonyOS、workflow 等），与安全审计不重叠。

### `topic:skill topic:security deepseek`（total = 1）

| Repo | 说明 |
|---|---|
| ming-14/Vuln-search-skill | CVE 检索技能（NVD/Exploit-DB/CISA-KEV 集成），面向漏洞检索而非仓库审计流程，且非 DSH 专属 |

### `dsh-skill-pack-security in:name`（total = 1）

仅 `PerryLink/dsh-skill-pack-security` —— **仓库名全局唯一**。

### 1.3.0 新增技能命名核对 / New-skill name checks (2026-08-14)

对 `threat-model`、`vuln-intel`、`incident-response` 三个新技能名：

| 查询 | 结果 |
|---|---|
| `<name> in:name`（GitHub 全站） | 同名仓库均存在但与 DSH 技能分发无关（如 awesome-threat-modelling、PagerDuty/incident-response-docs 等通用资料仓库）；DSH 技能名冲突看的是"同根同层重名技能"，跨生态同名仓库不构成冲突 |
| `topic:dsh <name>` | 三个查询均 **total = 0** —— DSH 话题下无同名仓库 |
| 社区技能包逐名核对 | `dhicoc/dsh-reverse-skill`（85 个技能）：无 `threat-model`/`vuln-intel`/`incident-response`（最近名 `threat-hunting`）；`cyzlmh/dsh-cyber-sec`（21 个技能）：无重名（最近名 `component-vuln-intel`）；`ChenLaoshiYF/dsh-mcpguard`：工具型，无 SKILL.md |
| 官方 `.agents/skills/`（12 个，2026-08 快照） | 零交集 |

结论：三个新名与官方及已知社区技能名零交集；`vuln-intel` 与 `component-vuln-intel`、`threat-model` 与 `threat-hunting` 仅主题相近、名字不同，不构成同层冲突，但后续同名新包出现时需复查。

## 与官方/社区技能名核对 / Skill-name collision check

- 官方 `.agents/skills/`（12 个，2026-08 快照）：`dsh-archive-agent-notes`、`dsh-code-review`、`dsh-doc-site-sync`、`dsh-doc-standards`、`dsh-find-simplifications`、`dsh-merging-stacked-prs`、`dsh-plugin-guide`、`dsh-pre-push-checks`、`dsh-prose-standard`、`dsh-translate-docs`、`dsh-trim-cot-leakage`、`record-browser-gif` —— 与 8 个技能名零交集。
- 社区技能包已知名：`dsh-write-plugin`、`dsh-test-plugin`、`dsh-plugin-dev`、`make-dsh-plugin`、`find-plugins`、`mainline-compat` —— 零交集。
- 机器校验：`verify/verify-skill-pack.mts` 第 2 项断言。

## 备注 / Notes

- 任务简报提及的 `unknowbug/anchorlaw`（协议型）未出现在本次话题搜索结果中；本包定位（纯技能包、零代码）不依赖该仓库的当前状态，README 的形态对照表按"工具型 / 协议型 / 技能型"三类独立成立。
- 话题身份：本仓库已设置 `dsh`、`dsh-plugin`、`skill-pack`、`security-audit`、`supply-chain-security`、`prompt-injection`，与 `provider/package.json` 的 `keywords` 一致。
- npm 侧核对（2026-08-14）：`@dsh-skill-pack-security/provider` 在 npm 不存在，但 scope `@dsh-skill-pack-security` 不为本仓库维护者所有（npm org API 403）——按 `provider/README.md` 发布清单规则改名发布为 `@perrylink/dsh-skill-pack-security-provider`；该名在发布时为空闲状态。
