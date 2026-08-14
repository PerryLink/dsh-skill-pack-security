# gitleaks/trivy 用法与误报分级（secret-scan/references/tool-usage.md）

主文件第 2、3 节的完整命令表与四级判据。

## gitleaks 命令表

| 目的 | 命令 | 退出码/判据 |
|---|---|---|
| 全历史扫描 | `gitleaks detect --source . --report-format json --report-path r.json --redact -v` | 0=未发现；1=有发现或配置错误（看 stderr 区分） |
| 只看当前工作树 | `gitleaks detect --source . --no-git` | 同上；不含历史，报告注明 |
| 有界历史扫描（超大仓库） | `gitleaks detect --source . --log-opts="--since=2.years" -v` | 同全量；报告注明只扫了最近 2 年 |
| staged 门禁（pre-commit） | `gitleaks protect --staged` | 0=通过；非 0=暂存区含告警，拦截提交 |
| 扫描到基线 | `gitleaks detect --source . --baseline-path baseline.json -v` | 基线内告警不再报；基线只记"已知"，不记"已修复" |
| 生成基线 | `gitleaks detect --source . --report-format json --report-path r.json -v; gitleaks baseline --source . --report-path r.json --baseline-path baseline.json` | 只对已评审确认"已知且接受"的告警生成基线 |
| 单文件快速查 | `gitleaks dir <路径>` | 输出告警行；不覆盖历史 |

### 输出 JSON 结构样例（`--redact` 后）

```json
{
  "Description": "Generic API Key",
  "StartLine": 12,
  "EndLine": 12,
  "StartColumn": 20,
  "Match": "REDACTED",
  "Secret": "REDACTED",
  "File": "src/ci/deploy.sh",
  "SymlinkFile": "",
  "Commit": "a1b2c3d4e5f6",
  "Entropy": 4.2,
  "Author": "dev@example.com",
  "Email": "dev@example.com",
  "Date": "2026-08-01T10:00:00+08:00",
  "Message": "add deploy script",
  "RuleID": "generic-api-key",
  "Fingerprint": "a1b2c3d4e5f6:src/ci/deploy.sh:generic-api-key:12"
}
```

字段判据：`Commit` 定位历史告警（树中已不存在）；`Fingerprint` 用于跨次扫描去重；`Entropy` 低且 `RuleID` 为 generic-* 的告警更可能是误报，但**熵低本身不足以放行**，必须走四级判据。

## allowlist 配置（`.gitleaks.toml` 最小样例）

```toml
[allowlist]
  description = "团队已评审的允许项"
  paths = ['''tests?/''', '''fixtures?/''']
  regexes = ['''EXAMPLE_[A-Za-z0-9_]+''']
  commits = ["a1b2c3d4e5f6"]  # 仅用于"已确认轮换"的历史提交
```

判据：paths/regexes 用具体前缀（`tests?/`），不用 `.` 全放行；commits 白名单每条都要有评审记录，防止把"含真实密钥的提交"整体掩盖。

## trivy 命令表

| 目的 | 命令 | 判据 |
|---|---|---|
| 密钥扫描（当前树） | `trivy fs --scanners secret --severity HIGH,CRITICAL .` | 退出码非 0 = 有高危发现；输出行列出文件与数量 |
| 含低危 | `trivy fs --scanners secret .` | 用于对比 gitleaks 的级C/D |
| 指定目录 | `trivy fs --scanners secret --severity HIGH,CRITICAL <dir>` | 同规则 |

与 gitleaks 差异：trivy 不看 git 历史；trivy 的 `secret` 规则与 gitleaks 规则集不同源。两边都报 = 升级复核；只有一边报 = 级B 流程。

## trufflehog 命令表

| 目的 | 命令 | 判据 |
|---|---|---|
| 全历史 + 自动验证 | `trufflehog git file://. --only-verified` | `Verified` = 级A 的直接证据（工具已用只读请求验证）；`Unverified` = 级B |
| 禁用验证 | `trufflehog git file://. --no-verification` | 组织禁止外发验证时用；告警一律按级B |
| 仅当前目录 | `trufflehog filesystem .` | 不看历史，报告注明 |

判据要点：trufflehog 的验证请求由工具以所发现的密钥发出（多为只读健康检查，如 `/user` 查询）；任何外发验证都必须在报告注明（哪些密钥被发往哪些厂商端点）。

## 四级误报判据（每级含复核命令）

| 级 | 定义 | 复核命令 | 放行条件 |
|---|---|---|---|
| A 真实 | 密钥可验证有效（trufflehog `Verified`，或厂商控制台/API 查询确认） | 厂商控制台/API 查询（只输入已轮换旧值） | 不成立 → 立即轮换 |
| B 疑似 | 格式真实、无法确认 | `git log -p -S'<前6字符>' -- <文件>` 看引入上下文 | 无放行条件，按真实处理 |
| C 测试/占位 | 测试夹具、文档示例 | 文件名与内容双查：路径含 test/fixture 且值含 example/xxx | 两者同时成立才允许列表登记 |
| D 历史已轮换 | 已轮换且撤销完成 | 控制台撤销状态截图/记录 + 轮换时间 | 有记录可放行，不追历史 |

通用判据：**任何一条告警，缺证据时一律按高级别处理**；放行必须留记录（级别+复核命令+输出），不允许"看着像误报"式放行。
