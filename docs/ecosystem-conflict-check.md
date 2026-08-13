# 生态冲突排查（Ecosystem conflict check）

> 快照时间：2026-08-13（UTC）。查询方式：GitHub Search API（`/search/repositories`，按 stars 排序取前 10）。
> Snapshot: 2026-08-13 (UTC). Method: GitHub Search API (`/search/repositories`, top 10 by stars).

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

## 与官方/社区技能名核对 / Skill-name collision check

- 官方 `.agents/skills/`（12 个，2026-08 快照）：`dsh-archive-agent-notes`、`dsh-code-review`、`dsh-doc-site-sync`、`dsh-doc-standards`、`dsh-find-simplifications`、`dsh-merging-stacked-prs`、`dsh-plugin-guide`、`dsh-pre-push-checks`、`dsh-prose-standard`、`dsh-translate-docs`、`dsh-trim-cot-leakage`、`record-browser-gif` —— 与 5 个技能名零交集。
- 社区技能包已知名：`dsh-write-plugin`、`dsh-test-plugin`、`dsh-plugin-dev`、`make-dsh-plugin`、`find-plugins`、`mainline-compat` —— 零交集。
- 机器校验：`verify/verify-skill-pack.mts` 第 2 项断言（9/9 通过）。

## 备注 / Notes

- 任务简报提及的 `unknowbug/anchorlaw`（协议型）未出现在本次话题搜索结果中；本包定位（纯技能包、零代码）不依赖该仓库的当前状态，README 的形态对照表按"工具型 / 协议型 / 技能型"三类独立成立。
- 话题身份：本仓库已设置 `dsh`、`dsh-plugin`、`skill-pack`、`security-audit`、`supply-chain-security`、`prompt-injection`，与 `provider/package.json` 的 `keywords` 一致。
