---
name: dependency-audit
description: '依赖供应链审计：pnpm/npm audit 输出与退出码解读、license 与投毒风险检查清单、锁文件漂移检测命令。任务要求审计项目依赖的已知漏洞、许可证风险、可疑包或 lockfile 一致性并出结论时用；单独安装/升级某个依赖或纯功能开发不展开本流程。'
whenToUse: '用户要求审计或盘点项目依赖安全（漏洞、license、投毒、锁文件漂移）、解读 audit 报告、判断某个依赖能否引入，或写依赖审计结论时使用；单个依赖的普通升级与纯功能开发不触发本技能。'
metadata:
  pack: dsh-skill-pack-security
  version: '2.2.4'
---

# 依赖审计（dependency-audit）

目标：对仓库依赖面给出**每条结论都附命令证据**的审计结果。输出分七块：已知漏洞、license、投毒风险、锁文件漂移、多生态漏洞、SBOM 清单、provenance/签名。

## 自动化预检：plugin_vet 工具

`plugin_vet` 已自动执行本技能第 3/4/7 节的静态部分（license 判定、投毒清单、SBOM 依赖树），其结果逐条引用本技能小节编号。自动化命中后，按各节命令复核证据并排除误报。

## 1. 定位包管理器与锁文件

```sh
git ls-files -- 'package.json' 'pnpm-lock.yaml' 'package-lock.json' 'yarn.lock' 'bun.lockb' 'npm-shrinkwrap.json'
node --version; pnpm --version
osv-scanner --version
```

样例输出（pnpm 仓库）：`package.json` 与 `pnpm-lock.yaml` 各一行。
判据：锁文件决定后续命令族（pnpm→第 2 节，npm→同节 npm 变体）；**多个锁文件并存 = 仓库异常**，写进发现；版本号写进报告（audit 数据随 registry 与工具版本变化）；`osv-scanner` 不可用只影响第 6 节，注明即可。

## 2. 已知漏洞：pnpm audit

```sh
pnpm audit --prod --json > audit.json; echo $LASTEXITCODE
```

（bash 用 `$?`；PowerShell 用 `$LASTEXITCODE`。）

- 退出码：0 = 无已知漏洞；非 0 = 有漏洞 **或 registry 不可达**（stderr 含 `fetch`/`ECONNREFUSED`/`ETIMEDOUT` 时为网络失败，不是发现漏洞——重试后再说）。
- `--prod` 只审生产依赖；需要全量视图时补跑 `pnpm audit --json`，devDependencies 部分按下文的降档规则处理。
- 输出样例（`advisories` 是按 advisory id 键控的**对象**，下例为其一个值；字段以实际输出为准）：

```json
{ "id": "GHSA-xxxx-yyyy-zzzz", "severity": "high",
  "module_name": "example-lib", "vulnerable_versions": "<2.3.0",
  "patched_versions": ">=2.3.1", "recommendation": "Upgrade to 2.3.1",
  "found": { "paths": ["prod-dep@1.0.0 > example-lib@2.2.9"] } }
```

- 解读规则：
  - `severity` 只信 registry 值（low/moderate/high/critical），不自行推断。
  - 每个 advisory 查 `patched_versions` 是否存在；不存在 = 暂无修复版本，记录"无修复版本"，不要声称"升级即可修复"。
  - 影响路径只在 devDependencies 中 → 默认降一档报告，除非该 devDep 参与构建产物（用代码证据证明，不能口头认定）。
- 误报/误判判据（全表见 `references/pnpm-audit-reading.md`）：advisory 状态 disputed/withdrawn、版本范围不含当前版本、路径不可达（不可达必须有调用点证据：`pnpm why <包>` + 源码 grep 无引用）。
- npm 项目变体：`npm audit --json`（退出码同为 0/非 0；结构是 `vulnerabilities` 对象而非 `advisories` 对象，样例见 references）。

## 3. license 检查

```sh
pnpm licenses list --json
```

样例行：`{ "name": "example-lib", "license": "MIT" }`（输出结构以实际为准）。
找三类问题：

1. **无声明**：license 字段为空/null → 记录"无许可证声明"（用法本身即合规风险）。
2. **强 copyleft**：直接依赖中出现 GPL/AGPL/SSPL/CPAL 等（完整清单见 `references/license-and-lockfile.md`）→ 定位用途：`pnpm why <包名>` 给出依赖链。
3. **非 SPDX**：值含 `SEE LICENSE IN <file>` → `git ls-files -- '<包目录>/**/LICENSE*'` 或解包读该文件再定论。

判据：license 风险结论 = 包名 + 依赖链 + 许可证 + 用途；找不到用途（源码无 import）的按"未使用依赖"另记一条。

## 4. 投毒风险检查清单（对每个"新/可疑"依赖逐项打勾）

完整命令与阈值表见 `references/license-and-lockfile.md`，五项速记：

1. **名称相似性**：`npm view <包> time.created`（样例：`2026-08-10T02:00:00.000Z`）。判据：创建 < 30 天且下载量极低 → 高风险标记，转 `supply-chain-review` 做 typosquat 判定。
2. **install 脚本**：`npm view <包> scripts --json`（样例：`{ "postinstall": "node scripts/download.js" }`）。非空 → 转 `supply-chain-review` 第 1 节逐条查危险特征。
3. **发布者与仓库**：`npm view <包> repository.url maintainers --json`。判据：repository 缺失/指向可疑 fork + 维护者历史为零 → 记录。
4. **网络行为**：`npm pack <包> --pack-destination .tmp` 后 `grep -rnE 'https?://' .tmp/<包>/` 看请求域。判据：出现与包用途无关的域名 → 记录并人工复核。
5. **provenance**：`npm view <包> provenance --json`。判据：无 provenance 不等于恶意，但写进风险记录。

判据：单条命中只是"记录"，**两条及以上同时命中才升级为"发现"**——防止单项误判。

## 5. 锁文件漂移检测

步骤与命令：

```sh
git diff HEAD -- pnpm-lock.yaml | head -n 40
pnpm install --frozen-lockfile
grep -c 'integrity' pnpm-lock.yaml
```

- 步骤 1 判据：diff 非空 = 锁文件有改动，逐块看是否意外（合并冲突残留 `<<<<<<<` 也算）。
- 步骤 2 判据：CI 语义下任何漂移立即失败。
  样例失败输出：`ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json`
  本地通过 + CI 失败 = 平台差异（optionalDependencies）→ 逐包核对，**不要关掉 frozen-lockfile**。
- 步骤 3 判据：integrity 条目数 ≈ 依赖条目数；明显偏少 = 锁文件被手改/损坏。
- 漂移原因分类与复核命令、lockfileVersion 对照表见 `references/license-and-lockfile.md`。

## 6. 多生态与离线：osv-scanner

```sh
osv-scanner scan -r .
```

样例输出行（以实际输出为准）：

```
Scanning dir .
Scanned <project>/package-lock.json file and found 2 packages
```

- 判据：退出码 0 = 未发现；非 0 = 有漏洞或参数错误（stderr 区分）。`-r .` 自动识别目录中的全部锁文件（pnpm/npm/yarn/bun/pip/Cargo/Go/Maven 等）；单文件用 `osv-scanner scan lockfile <文件>`。
- 与 pnpm audit 差异：osv-scanner 查 OSV 数据库（聚合 GitHub Advisories 等来源），覆盖 pnpm audit 看不到的其他生态；两边不一致时按 advisory id 逐条核对，不互相当作误报依据。
- 离线路径：`osv-scanner scan -r . --offline`（配合本地 OSV 数据）用于 registry 不可达环境；报告注明数据版本。

## 7. SBOM 资产清单（机器可复核的盘点）

```sh
trivy sbom . --format cyclonedx -o sbom.cdx.json
# 或 syft dir:. -o spdx-json=sbom.spdx.json
```

样例输出：退出码 0，并打印产物路径（`sbom.cdx.json`）。
判据：SBOM 作为依赖盘点附录随报告提交；条目数与 `pnpm licenses list` 条目数量级一致，不一致 = 记录并说明原因。SBOM 不含密钥但含依赖拓扑，按报告同等级别保管。

## 8. provenance 与签名

```sh
npm view <包> provenance --json
npm view <包> dist.integrity --json
npm audit signatures
```

- 判据：`provenance` 非空 = 包由 CI 构建并带构建来源声明；`dist.integrity` 与锁文件中同版本包的 `integrity` 值必须一致，不一致 = 锁文件被手改或包被替换，立即升级为发现。
- `npm audit signatures` 校验 registry 签名：退出码 0 = 通过；非 0 输出列出签名缺失/无效的包，记录并人工复核来源。
- 无 provenance 不等于恶意，但写进风险记录（第 4 节第 5 项同规则）。

## 结论格式

每条结论 = 断言 + 命令 + 输出摘要 + 误报排除说明（"我排除了 X，因为 <证据>"）。无证据的担忧写进"观察"，不进"发现"。
