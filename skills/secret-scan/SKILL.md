---
name: secret-scan
description: '凭据/密钥暴露审计：gitleaks、trivy 全历史扫描命令与参数、告警误报分级判据、脱敏报告规范、按轮换→撤销→清除历史→CI 门禁排序的修复流程。任务涉及仓库内密钥/token/密码/私钥的检测、历史提交泄露排查、扫描告警真伪判定或泄露报告撰写时用；与凭据无关的常规代码审查不用。'
whenToUse: '用户要求扫描或检查仓库的密钥泄露、排查某提交或某文件中的 token、给扫描告警定真伪、写脱敏泄露报告或规划密钥轮换时使用；纯功能开发与常规代码审查不触发本技能。'
metadata:
  pack: dsh-skill-pack-security
  version: '1.0.0'
---

# 凭据扫描（secret-scan）

目标：找出仓库（含历史）中的真实凭据并推动修复。硬性纪律：**任何输出、报告、日志中不出现密钥明文**。

## 1. 工具就绪

```sh
gitleaks --version
trivy --version
```

样例输出（以本机实际输出为准）：`gitleaks version 8.24.3` / `Version: 0.61.0`。
判据：退出码 0 = 可用；非 0 或 `command not found` = 未安装。
安装（装不上就跳过并走第 4 节降级 grep，报告注明）：

```sh
# Windows: scoop install gitleaks trivy   （或 winget install Gitleaks.Gitleaks AquaSecurity.Trivy）
# macOS/Linux: brew install gitleaks trivy
```

把实际版本号写进报告（可复现审计的前提）。

## 2. 全历史扫描（默认路径）

```sh
gitleaks detect --source . --report-format json --report-path .gitleaks-report.json --redact -v
```

- 退出码：0 = 未发现；**1 = 发现告警，也可能是配置/参数错误**——必须看 stderr 区分。
- 样例 stderr（真发现）：`INFO: 42 leaks found. 120 commits scanned.`
- 样例 stderr（配置错误）：`unable to load config` —— 此时退出码 1 不代表有泄露。
- 判据：只有 stderr 出现 `leaks found` **且** JSON 中 `Findings` 数组非空才算发现；两者缺一 = 修复配置后重扫。
- 输出样例（`--redact` 已把 `match` 打码）：

```json
{ "Description": "Generic API Key", "StartLine": 12, "File": "src/ci/deploy.sh",
  "Commit": "a1b2c3d4", "RuleID": "generic-api-key", "Secret": "REDACTED" }
```

- 误报分级与允许列表：完整四级判据表、`.gitleaks.toml` allowlist 写法、baseline 流程见 `references/tool-usage.md`。分级速记：
  - 级A 真实密钥（调用验证接口确认有效）→ 立即轮换；
  - 级B 格式真实但无法确认有效性 → 按真实处理；
  - 级C 测试夹具/占位符/文档示例 → 允许列表登记；
  - 级D 已轮换的历史密钥 → 记录，可不追历史。
  判据要点：不能仅凭"这是测试文件"放行；级C 需要文件名与内容双重佐证（如文件路径含 `test`/`fixture` 且值含 `example`/`xxx`）。

## 3. Trivy 交叉验证（降低误报，不做唯一依据）

```sh
trivy fs --scanners secret --severity HIGH,CRITICAL .
```

样例输出行：

```
src/ci/deploy.sh (secrets)

Total: 1 (HIGH: 1)
```

判据：与 gitleaks **两边都报** → 大概率真实，升级复核；只有一边报 → 进级B 复核流程，勿直接定级。
Trivy 按文件系统扫描（不含已删除历史），覆盖范围与 gitleaks 全历史不同——报告注明两者差异。

## 4. 无工具降级 grep（有界执行，必须限制 rev-list 深度）

```sh
git rev-list --all | head -n 500 | while read rev; do
  git grep -nE 'AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}' "$rev" -- '*.js' '*.ts' '*.json' '*.env' 2>/dev/null
done
```

样例输出：`a1b2c3d:src/ci/deploy.sh:12:export GITHUB_TOKEN=ghp_...`
判据：匹配行含 `example`/`placeholder`/`xxx` 或位于测试文件 → 级C（仍需在报告列出）；否则按级B 处理。
限制说明：grep 只能命中仍存在于某提交树中的内容，覆盖不了已删除历史——所以这只是降级路径，不是等价替代。

## 5. 脱敏报告规范

完整细则见 `references/redaction-and-remediation.md`。要点：

- 报告只记录：类型 + 前 6 字符 + 文件/提交位置 + 判定级别，绝无完整密钥。
  例：`GitHub token ghp_abc… | src/ci/deploy.sh:12 | commit a1b2c3d | 级A`
- 自检命令（预期输出：无匹配）：

```sh
grep -nE '(ghp_[A-Za-z0-9]|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]|-----BEGIN (RSA|OPENSSH|EC) )' 报告.md
```

- 有效性验证（级A 确认用）：先轮换再验证；只在厂商控制台/API 输入**已被轮换掉的旧值**，绝不把现役密钥发送给任何第三方验证服务。

## 6. 修复优先级（固定顺序，禁止跳级）

1. **轮换（rotate）**：先在密钥签发方生成新值并替换使用处——顺序不可逆，先删历史再轮换没有意义。
2. **撤销（revoke）**：旧密钥在厂商控制台撤销；轮换完成的判据 = 新密钥生效且旧密钥显示已撤销。
3. **清除历史（可选、高风险）**：`git filter-repo --path <文件> --invert-paths`，两条硬性前置：仓库完整备份 + 通知所有协作者 force-push 后 rebase；不满足前置就不执行，只写建议。
4. **防护**：`.gitignore` 排除（`echo '.env*' >> .gitignore`）、gitleaks pre-commit 或 CI 门禁（配置片段见 `references/redaction-and-remediation.md`）；门禁完成判据 = 故意提交一个假密钥被拦截。
