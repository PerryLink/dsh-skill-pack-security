---
name: incident-response
description: 'agent 环境安全事件响应：分类→控制蔓延→取证留痕→恢复→复盘的分步处置流程，覆盖密钥泄露、提示注入触发、依赖投毒、未授权操作四类事件，每条处置附命令证据。DSH/agent 环境出现疑似安全事件需要按流程处置与复盘时用；日常开发与例行维护不用。'
whenToUse: 'agent 环境（DSH 会话、插件、MCP、CI）出现疑似安全事件——密钥泄露、被注入执行了未授权操作、依赖投毒、权限异常——需要响应、留证与复盘时使用；没有事件迹象的日常开发不触发本技能。'
metadata:
  pack: dsh-skill-pack-security
  version: '2.1.4'
---

# 事件响应（incident-response）

原则：**先控制，再取证，后恢复**。控制动作（轮换/撤销/停用）不依赖完整归因——疑似即执行；取证在控制之后做，避免"边查边扩散"。全程不写密钥明文，报告遵守 `secret-scan` 脱敏规范。

## 1. 确认与分类

先回答两个问题：发生了什么（类型），影响面多大（范围）。四类事件与初步证据：

| 事件类型 | 初步证据 | 立即动作（见第 2 节） |
|---|---|---|
| 密钥泄露 | 扫描告警、公开仓库出现 token | 轮换 + 撤销 |
| 提示注入触发 | 会话执行了上下文外指令（下载/外发/改配置） | 停用触发源 + 隔离 |
| 依赖投毒 | 新依赖出现异常 install 脚本/网络请求 | 回滚依赖 + 锁文件冻结 |
| 未授权操作 | 仓库/CI 出现非本人提交、非预期运行 | 撤销凭据 + 暂停自动化 |

```sh
git rev-parse HEAD
git log -1 --format='%H %cd' --date=iso-strict
```

预期输出样例：`a1b2c3d4...` 与提交时间。
判据：先记录当前 HEAD——后续所有证据命令都相对它复核；不确定类型时先按"密钥泄露"假设处置（轮换成本最低、最安全）。

## 2. 控制蔓延（疑似即执行，不等归因）

- 密钥类：按 `secret-scan` 第 6 节顺序——先轮换、再撤销；轮换完成判据 = 新值生效且旧值在厂商控制台已撤销。
- 注入/未授权操作类：停用触发源——下线相关 MCP/插件、暂停 agent 会话与相关 CI：

```sh
git ls-files -- 'cordis.yml' '**/cordis.yml' '.mcp.json' '.github/workflows/**'
dsh --profile <配置文件> --dump-config
```

样例输出：配置与工作流路径列表；dump 输出中能看到已挂载插件清单。
判据：dump 输出里逐个核对插件/MCP 是否受信；存疑的立即从配置移除（改配置 → 新会话生效）。控制完成判据 = 事件源已停用且 24 小时内无同类新动作。

## 3. 取证留痕（时间线 + 证据包）

```sh
git log --format='%H %cd %s' --date=iso-strict --since='<事发时间>' --all
# Windows：Get-ChildItem $env:DSH_HOME -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 20
# macOS/Linux：find ~/.dsh -type f -newermt '<事发时间>' -ls
```

样例输出：一行一条提交（哈希 + 时间 + 摘要）；会话目录里按时间倒序的文件列表。
判据：时间线每条 = 时间 + 主体 + 动作 + 证据引用；**只记录可复核的事实**，推测写进"待验证"区。证据包 = 命令输出原文 + 相关文件副本，按 `secret-scan` 脱敏规范处理后再共享。

## 4. 恢复

```sh
git revert --no-commit <可疑提交>
# 或回退整个分支到已知良好提交：git reset --hard <已知良好提交>（先备份！）
```

样例输出：revert 后 `git status` 显示待提交的逆变更。
判据：恢复顺序——先撤恶意/可疑变更，再恢复受影响服务，最后恢复自动化（CI/agent）并观察一个周期。恢复完成判据 = 时间线中所有异常点都有对应处置记录，且观察期内无复发。

## 5. 复盘与加固

复盘模板（五段：时间线、根因、影响评估、处置记录、加固项）见 `references/runbook-and-postmortem.md`。加固项从根因反推，每项都要可验证：

- 密钥类根因 → 补 `gitleaks protect --staged` 门禁（`secret-scan`）；
- 注入类根因 → 按 `prompt-injection-review` 过一遍注入面并落地缓解；
- 依赖类根因 → 按 `supply-chain-review` 收紧引入流程（pin action、禁 install 脚本）；
- 权限类根因 → 最小权限改造：删除多余凭据、限制 CI 令牌范围。

复盘完成判据 = 每个加固项都有验证命令或验收标准。

## 与其他技能的分工

- `secret-scan`：密钥泄露事件的检测、分级与轮换流程细节。
- `prompt-injection-review`：注入类事件的注入面排查与缓解清单。
- `supply-chain-review` / `dependency-audit`：依赖类事件的引入向量分析与依赖审计。
- `security-audit`：事件平息后的全量审计复查。
