---
name: security-audit
description: '仓库/软件安全审计总览：范围界定→资产清单→风险分级→逐项验证→报告模板的分阶段流程，按需转调 secret-scan、dependency-audit、supply-chain-review、prompt-injection-review 四个专项技能。用户要求整体审计仓库、规划审计步骤或汇总多类发现出报告时用；只查密钥/依赖等单一主题时直接加载对应专项技能，不用本总览。'
whenToUse: '用户要求对代码仓库或项目做安全审计、制定审计计划、划分审计阶段、汇总多类发现成报告，或不确定该从哪个专项技能开始时使用；单一主题任务（只查密钥、只查依赖、只评审一个 PR、只查注入面）直接加载对应专项技能，不触发本技能。'
metadata:
  pack: dsh-skill-pack-security
  version: '2.1.2'
---

# 安全审计总览（security-audit）

本技能编排一次仓库安全审计的完整流程，产出**每条发现都能用一条命令复核**的报告。
它只编排；四类主题的检查细节分别在 `secret-scan`（密钥）、`dependency-audit`（依赖）、`supply-chain-review`（新增依赖评审）、`prompt-injection-review`（agent 项目注入面）中。进入相应阶段时，用 `skill` 工具按需加载对应专项技能，不要在本文件里重写其细节。

## 自动化预检：plugin_vet 工具

本包 provider 同时注册 `plugin_vet` 工具（license 扫描 / SBOM / commit 锁定 / 恶意模式 / 五维评分）。它只做机器预检，结果中每条 finding 都标注本包对应技能小节，命中后按本技能流程继续人工审计；工具结果 fail 且门禁策略为 deny 时安装被阻断。

## 阶段 0：固定审计对象（不固定对象，报告不可复现）

```sh
git rev-parse --show-toplevel
git log -1 --format='%H %cd' --date=iso-strict
```

预期输出样例（以实际输出为准）：

```
D:\repo\example
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0 2026-08-14T10:30:00+08:00
```

判据：`git rev-parse` 退出码为 0 且第一行是绝对路径；非 0 表示不在 git 仓库内，停止并说明原因。
报告元数据必须记录该提交哈希——审阅者据此在任意时刻重放全部检查命令。

确认工具能力（缺哪个，对应专项技能里都有降级路径；不要声称"扫过"未执行的检查）：

```sh
gitleaks --version; trivy --version; pnpm --version
checkov --version
```

样例输出：`gitleaks version 8.24.3` / `Version: 0.61.0` / `10.9.0` / `3.2.x`。
判据：每条命令退出码 0 = 可用；非 0 或 `command not found` = 不可用，报告中注明"未执行（工具不可用）"。checkov 不可用不阻塞审计（IaC 面改用 `trivy config` 或降级人工审）。

## 阶段 1：范围界定

产物：**审计范围清单**——逐条列出纳入审计的文件、目录、依赖与配置路径，并写出排除项及理由。

```sh
git ls-files | wc -l
git ls-files -- 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock' '*.toml' '*.yaml' '*.yml' '.github/workflows/**'
```

样例输出：`1234`（第一行是总文件数），随后是包清单与配置文件路径列表；某类文件不存在时对应行为空。
判据：空输出 = 该类文件不存在，报告中写"未发现"，而不是省略该类别。
边界假设要写进报告：默认只审当前仓库 `git ls-files` 跟踪的文件；子模块、上游镜像、CI 环境变量是否纳入，必须在范围清单里写明。

## 阶段 2：资产清单

按四个面列资产（命令输出直接进报告附录）：

```sh
git ls-files -- '.env*' '*.pem' '**/id_rsa' '**/id_ed25519' '**/*.key'
git ls-files -- 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock'
git submodule status
git ls-files -- '.github/workflows/**' '.mcp.json' 'cordis.yml' '**/cordis.yml'
git ls-files -- 'Dockerfile*' 'docker-compose*.yml' 'compose*.yml' '*.tf' '*.tfvars' '*.hcl' 'serverless.yml'
```

样例输出：每行一个相对路径；无匹配时无输出。
判据：空输出 = 该面无资产，报告写"未发现"。
资产清单是后续所有阶段的输入：密钥面交给 `secret-scan`，依赖面交给 `dependency-audit`，CI/配置面与 IaC/容器面在本报告内检查。

## 阶段 3：风险分级

分级定义、CVSS 粗映射、处置时限与报告措辞见 `references/risk-classification.md`。
每条发现必须填下表（三要素缺一不可定级，缺了就是"观察"不是"发现"）：

| 发现 | 位置（文件:行/提交） | 可利用性 | 影响 | 是否已暴露 | 级别 |
|---|---|---|---|---|---|
| 例：GitHub token 明文 | src/ci/deploy.sh:12 | 高 | 仓库写权限 | 已推送到公开仓库 | 严重 |

判据：级别只能由"可利用性 × 影响 × 是否已暴露"得出；凭感觉定级的一律降为"观察"。

## 阶段 4：逐项验证

原则：**报告里的每条发现，审阅者必须能用一条命令复核**；无法复核的不写进"发现"，写进"观察"。
复核命令按主题取自对应专项技能的验证节（加载后用其命令）：

- 密钥类：`git grep -n '<已脱敏的前 6 字符>' <提交哈希> -- '<文件路径>'`（细节见 `secret-scan`）
- 依赖类：`pnpm why <包名>`、在 `pnpm audit --json` 输出中按 advisory id 检索（见 `dependency-audit`）
- 新依赖类：`git log --oneline --follow -- <锁文件>` 定位引入提交（见 `supply-chain-review`）
- 注入面类：被引文本的原文出处命令（见 `prompt-injection-review`）
- CI/工作流类：`git grep -n 'pull_request_target' -- '.github/workflows/**'`（命中且该 workflow 检出 PR 代码后使用 secrets → 高危发现）；`git grep -nE 'uses: [A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+@v[0-9]' -- '.github/workflows/**'`（action 未 pin commit SHA → 记录）
- IaC/容器类：`trivy config .`（无 trivy 用 `checkov -d .`）；镜像扫描 `trivy image <镜像>`（镜像不可用或工具缺失 → 写"未执行"）

误报处理规则：复核命令拿不到证据 → 降级为"观察"或删除；保留但无法复核的必须写明原因。

## 阶段 5：报告

报告骨架（标题、元数据、结论摘要、发现表、验证命令附录、方法限制）见 `references/report-template.md`。
硬性脱敏规则：报告中不得出现任何密钥明文，只允许类型标记 + 前 6 字符；细节见 `secret-scan` 的脱敏规范。
交付前自检（预期输出：无匹配；有匹配 = 报告自身泄露了密钥，先整改再交付）：

```sh
grep -nE '(ghp_[A-Za-z0-9]|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]|-----BEGIN)' 报告文件.md
```

## 与其他技能的分工

- `secret-scan`：密钥检测、误报分级、脱敏与修复排序 —— 资产清单的密钥面。
- `dependency-audit`：已知漏洞、license、投毒、锁文件漂移 —— 资产清单的依赖面。
- `supply-chain-review`：PR/新增依赖的几分钟快速评审 —— 审计期间出现的新增依赖。
- `prompt-injection-review`：agent 项目上下文注入面 —— 仓库本身就是 agent 项目时必做。
