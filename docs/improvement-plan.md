# dsh-skill-pack-security 完善与提升方案

> 状态：**1.3.0 已全部实施（2026-08-14）**。下文"1.3.0 完善记录"为最新一轮；"1.2.0 实施记录"保留作为历史对照。验证套件 19 项全绿，provider 已发布 npm。

## 1.3.0 完善记录（2026-08-14）

| 项 | 结果 |
|---|---|
| 新增技能 ×3 | ✅ `threat-model`（设计期威胁建模：信任边界/STRIDE/攻击树）、`vuln-intel`（NVD/KEV/GHSA/OSV 四源检索与判定）、`incident-response`（agent 环境事件响应：控制→取证→恢复→复盘），双语言版同步，8 技能全部通过 19 项验证 |
| 生态冲突复查 | ✅ 三个新名与官方 12 技能、社区包（dsh-reverse-skill 85 技能、dsh-cyber-sec 21 技能、dsh-mcpguard）逐一核对零重名；最近名仅主题相近（`threat-hunting`、`component-vuln-intel`） |
| provider npm 发布 | ✅ scope `@dsh-skill-pack-security` 不为维护者所有（org API 403），按发布清单改名 `@perrylink/dsh-skill-pack-security-provider` 并发布；`cordis.patch.yml` name 行与全部文档同步 |
| 版本同步 | ✅ 1.3.0：VERSION + 16 个 SKILL.md + provider/package.json |
| 文档同步 | ✅ README（8 技能表/徽章/roadmap/npm 路径）、CHANGELOG、CONTRIBUTING（16 处版本点）、release-checklist（新增 npm 发布步骤）、ecosystem 快照刷新（2026-08-14）、provider README、prompt-injection 内引用计数 |

## 1.2.0 实施记录（2026-08-14）

| 项 | 结果 |
|---|---|
| A1 release-checklist UTF-8 | ✅ 批量命令改读 UTF-8、写**无 BOM** UTF-8（PS 5.1 的 `Set-Content -Encoding UTF8` 会加 BOM，官方解析器首行 `---` 校验失败会静默丢技能）；verify 第 19 项 + 布局 BOM 断言防回归 |
| A2 `\s` → `[[:space:]]` | ✅ 4 处（zh/en）；verify 第 17 项 grep 可移植性 lint 兜底 |
| A3 provider 响亮失败 | ✅ 空/不存在 `skillsDir` 与无布局均 throw；双布局解析（仓库/发布） |
| A4 advisories 措辞 | ✅ zh/en 改"按 advisory id 键控的对象" |
| A5 CI pin harness | ✅ `ref: 47f9438…`（上游 master，为本地验证所用 checkout 的祖先） |
| B1–B9 验证增强 | ✅ 19 项检查（zh↔en 结构对齐、references 接线、provider 版本同步、rank 文档对照、grep 可移植性、密钥自检、UTF-8 检查、OFFICIAL_SKILLS 动态推导、provider 负例、Windows CI job） |
| C1/C2 npm bundle | ✅ `prepack` 嵌入双语言版、`dsh.bundle` + `cordis.patch.yml`、tarball 实测自包含 |
| C3 安装脚本 | ✅ manifest + `-Uninstall`/`-DryRun`/`-Force`，PS 5.1 与 bash 实测通过 |
| C4 README | ✅ rank 链补 custom 300、`dsh plugin add` 路径、徽章与检查数更新 |
| D1–D5 技能内容 | ✅ 五技能 zh/en 同步升级（trufflehog/osv-scanner/SBOM/provenance/git-prepare/Action pinning/DSH 内建防御/IaC 容器面/发现编号） |
| E1–E4 治理 | ✅ CHANGELOG/SECURITY/CONTRIBUTING、dependabot、roadmap 更新 |
| 版本 | ✅ 1.2.0（VERSION + 10 个 SKILL.md + provider/package.json） |

## 0. 现状评估

本包已做到的高质量部分（保持不动）：复用官方 `FileSystemSkillProvider`（零解析逻辑复制）、配置为 Schemastery Schema、注册即 effect、`whenToUse` 不进模型目录（官方设计）、12 项 CI 检查覆盖 fail-closed frontmatter 规则、双语言版同元数据、安装脚本覆盖四个根。**技能内容全部为可执行命令 + 判据 + 误报判据，无不可验证断言——后续所有内容升级必须维持这一不变量。**

已核实的问题（按优先级分四批）：

## 1. P0 正确性缺陷（先修，每个都有证据）

### A1. `docs/release-checklist.md` 批量改版本命令会损坏 UTF-8 中文（Windows PowerShell 5.1）

- 证据：本包 `install.ps1` 声明 `#Requires -Version 5.1`，目标用户就是 PS 5.1；实测在 zh-CN 系统上 `Get-Content`（默认 ANSI 编码）读取 UTF-8 的 `SKILL.md` 得到乱码且行数错乱（95 行被读成 64 行）。`release-checklist.md` 第 16–21 行的批量命令用裸 `Get-Content` + `Set-Content -NoNewline`，会把全部中文重编码为 GBK 写入文件，静默损坏 10 个 `SKILL.md`。
- 改动：该命令改为 `Get-Content -Encoding UTF8 -Raw` / `Set-Content -Encoding UTF8 -NoNewline`；或改用 .NET `[IO.File]::ReadAllText/WriteAllText`（明确 UTF-8）。同时在 `verify-skill-pack.mts` 增加检查：release-checklist 中的命令片段必须包含 `UTF8`（防回归）。
- 验收：在 PS 5.1（zh-CN）执行批量命令后 `git diff` 为空（版本号已同步时）；或对 `skills/` 文件校验编码不变。

### A2. `prompt-injection-review` 的 `grep -E '^\s*…'` 在 BSD grep（macOS）下失效

- 证据：POSIX ERE 中 `\s` 是未定义转义；macOS 自带 BSD grep 将其当作字面 `s`，`^\s*` 静默变成匹配行首 `s` 的另一种语义；仅 GNU grep（Linux）支持 `\s` 扩展。本包宣称支持 macOS（`brew install` 路径）。共 4 处：`skills/prompt-injection-review/SKILL.md:41`、`skills/prompt-injection-review/references/injection-surfaces.md:10`，及 `skills-en/` 同位置两处。
- 改动：`\s` → `[[:space:]]`（POSIX 标准写法），zh/en 四处同步。
- 验收：新增 verify 检查（见 B5）在 CI 拦截所有 `grep -E` 模式中的 GNU 专属转义。

### A3. provider 对错误 `skillsDir` 静默失败

- 证据：`provider/src/index.ts` 的 `skillsDir` 接受空串；`FileSystemSkillProvider` 对 `resolve('')` 得到 cwd、对不存在的目录返回空目录列表——用户配错后插件"正常"加载但一个技能都没有，DSH 约定是"错误配置响亮失败"。
- 改动：
  - Schema 改为 `skillsDir: z.string().min(1)`（可选，去掉 `null` 分支）。
  - `apply()` 内同步校验选定的目录存在且包含至少一个 `*/SKILL.md`，否则 `throw` 带可操作信息（给出实际解析出的路径与候选布局）。
  - 顺带修 `PACK_ROOT`：当前 `../..` 只对仓库布局成立，发布 tarball 后（`lib/` 与 `skills/` 同在包根）会解析错。改为候选布局探测：`[仓库布局 ../../, 发布布局 ..]`，取第一个同时含 `skills/` 与 `skills-en/` 的；都没有则响亮报错。
- 验收：verify 第 8 项增加负例：`skillsDir: ''` 与不存在的目录都必须让 `ctx.plugin(providerPlugin)` reject。

### A4. `dependency-audit` 对 `pnpm audit --json` 结构的描述有误

- 证据：pnpm 的 `advisories` 是**按 advisory id 键控的对象**（`references/pnpm-audit-reading.md` 中的样例就是对象），而 zh/en 主文件均写"`advisories` 数组元素"。
- 改动：两版主文件措辞改为"`advisories` 对象（按 advisory id 键控），下例为其一个值"。
- 验收：verify 现有检查跑绿即可（措辞修正无结构变化）。

### A5. CI 对上游 harness 使用浮动 checkout，验证不可复现

- 证据：`.github/workflows/verify.yml` 第 18–22 行 checkout `deepseek-ai/deepseek-harness` 未指定 `ref`，始终取默认分支；上游技能格式/接口变化（如 frontmatter 规则、包路径移动）会在本包零改动时打红 CI，且无法复现历史验证。
- 改动：给 harness checkout 加 `ref: <固定 commit SHA>`，并随版本升级定期 bump（写进 release-checklist）；verify 脚本打印实际使用的 `DSH_HARNESS_CHECKOUT` 与 git rev。
- 验收：CI 绿；release-checklist 增加"bump harness ref"步骤。

## 2. P1 验证体系增强（防回归，每项先写检查证明当前失败再修复）

在 `verify/verify-skill-pack.mts` 追加检查（编号顺延为 13–20，README 徽章与文案同步更新）：

- **B1 zh↔en 结构对齐**：两个语言版的同名技能必须有一致的 `##` 标题序列、一致的 `references/` 文件名集合、一致的代码块数量。防止只更新中文版造成漂移（当前没有任何检查管这件事）。
- **B2 references 悬空/孤儿检查**：主文件提到的每个 `references/<file>` 必须存在；`references/` 下每个文件必须被主文件引用。
- **B3 provider/package.json 的 version 必须等于 `VERSION`**：release-checklist 列了 4 个同步点，CI 只断言了 10 个 SKILL.md 的 metadata，漏了第 4 点。
- **B4 安装器 rank 表格与官方常量对照**：从 checkout 的 `packages/skill/skill-filesystem/src/index.ts` 源码正则抽取 `PROJECT_DSH_RANK/PROJECT_AGENTS_RANK/CUSTOM_RANK/USER_DSH_RANK/USER_AGENTS_RANK`，断言 `README.md`、`install.ps1`、`install.sh` 打印的 rank 值与之一致（官方常量未导出，用源码抽取实现"活文档"检查）。
- **B5 grep 可移植性 lint**：抽取全部 shell `grep -…E '…'` 模式，编译并拒绝 `\s \d \w \b` 等 GNU 专属转义（A2 的机制化）。
- **B6 包内密钥自检**：用本包自己的脱敏 grep 扫 `skills/`、`skills-en/`、`docs/` 文本（预期无匹配，证明样例与命令都不含真实密钥形态）。
- **B7 `OFFICIAL_SKILLS` 动态推导**：当前硬编码 12 个官方技能名（第 75–80 行），改为读取 checkout `.agents/skills/` 目录名——上游新增技能时不再需要手工同步。
- **B8 Windows CI job**：新增 `windows-latest` job，跑 verify（脚本已处理 win32 junction）+ 实跑 `install.ps1`（`-Language zh` 与 `en`、`-Target user-dsh` 断言落盘）。当前 CI 只在 Ubuntu 跑，Windows 主安装路径零覆盖。
- **B9 provider 负例**：见 A3 验收。

## 3. P1 分发与安装体验

- **C1 让 provider 成为可发布、自带技能的 npm 包**：`provider/package.json` 增加 `prepack` 脚本把 `../skills`、`../skills-en` 拷入 `provider/pack/`，`files` 增加 `pack/**`；配 A3 的双布局 `PACK_ROOT` 解析后，`pnpm pack` 的 tarball 自带技能，README 中"npm 打包注意"一节改写。
- **C2 bundle 支持（`dsh plugin add`）**：`provider/package.json` 增加 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`，新增 `provider/cordis.patch.yml`（insert 一行：`name` 与包名一致、`config: { language: zh }`）。用户从"复制目录/手写 cordis.yml"升级为一条 `dsh plugin add` 命令（官方 publish 流程）。
  - 发布前置检查：确认 npm scope `@dsh-skill-pack-security` 的所有权，未拥有则改用 `@perrylink/…` 或无 scope 包名。
- **C3 安装脚本升级**：
  - 安装时在目标根写清单文件（如 `.dsh-skill-pack-security.json`：版本、语言、安装的技能目录列表）→ 支持 `-Uninstall`/`--uninstall` 精确删除只属于本包的内容。
  - 覆盖同名目录前检查：目标目录存在且没有本包清单 → 警告并要求 `-Force`（当前 `rm -rf` 静默覆盖他包同名技能）。
  - 增加 `-WhatIf`/`--dry-run`。
  - 安装后提示"新会话生效"与卸载命令。
- **C4 README 修正**：Quick start 的四根表格补 rank 300 `custom` 行（安装脚本注释里已有，README 遗漏）；增加 `dsh plugin add` 安装路径小节；"12/12 checks" 徽章随 B 系列检查数更新。

## 4. P2 技能内容升级（保持"每条命令可复核"不变量）

- **D1 `secret-scan`**：新增第三个工具 trufflehog（git 历史 + 自动验证真伪，与 gitleaks 手工分级互补）；补 `gitleaks protect`（staged 门禁）与 `--log-opts`（超大仓库有界历史扫描）；补扫描产物清理步骤（`.gitleaks-report.json` 不入库/扫描后删除）；降级 grep 增加更多 token 家族（`github_pat_`、`AZURE_STORAGE_`、`xox[bap]-`、JWT 三段的宽松形态、npm `_authToken`）；明确 `--redact` 后的 JSON 仍含文件位置等敏感元数据，不得上传。
- **D2 `dependency-audit`**：新增 `osv-scanner scan -r .`（多生态锁文件 + 离线可用的 OSV 数据，覆盖 pnpm/npm/yarn/bun/pip/Cargo/Go）；新增 SBOM 清单步骤（`trivy sbom` 或 `syft`）作为资产盘点的机器可复核形式；新增 provenance/签名验证（`npm audit signatures`、`npm view <pkg> dist.integrity` 与锁文件对照）；修 A4 措辞。
- **D3 `supply-chain-review`**：新增 git 安装向量检查（`prepare`/`preinstall` 脚本——DSH git 安装会执行 `prepare`，是 review 必查项）；新增 GitHub Actions 依赖 pinning 检查（`actions/*@vX` → commit SHA）；新增 `npm view <pkg> dist.fileCount/dist.tarball` 异常判据；新增锁文件 diff 的新增包计数阈值（与现有"缺锁文件且新增 >20"呼应）。
- **D4 `prompt-injection-review`**：修 A2 的 `\s`；新增"DSH 内建防御对照"小节（引用官方实现事实：`skill` 的 `/name` 手势只认用户来源消息、目录与 skill 内容的 `escapeText`/`escapeAttr`、catalog 分帧），让审查者核对项目是否依赖这些机制而非自造解析；注入面矩阵新增：subagent/workflow 脚本提示词、工具 `presentCall`/render 输出、终端回显、图像/PDF 提取文本、`cordis.yml` 的 `!!js` 代码块（共享配置仓库场景下最高危面）；缓解清单新增作用域权限、写工具审批门、网页内容隔离。
- **D5 `security-audit`**：阶段 2 资产清单增加第四面：IaC/云/容器（`trivy config`、可选 checkov；`trivy image` 镜像扫描，工具不可用则注明未执行）；CI 面增加 `pull_request_target` 密钥暴露、未 pin 的 action 检查；报告模板增加发现编号与跟踪建议；可选附录：OWASP ASVS / NIST CSF 粗映射（标注为参考而非定级依据）。

## 5. P3 治理与文档

- **E1** 新增 `CHANGELOG.md`（Keep a Changelog，回填 1.0.0/1.1.0）、`SECURITY.md`（本包零运行时代码的边界声明、技能内容缺陷的报告与处置）、`CONTRIBUTING.md`（双语言版同提交、≤300 行预算、references 接线、verify 检查、发布清单）。
- **E2** `docs/ecosystem-conflict-check.md` 快照按需刷新（仅命名/定位变化时，维持现有规则）。
- **E3** 新增 `.github/dependabot.yml`：provider 的 peer/devDependencies（特别是 `dsh-skill-filesystem` 的精确 pin）与 actions 版本。
- **E4** 可选新技能路线（保持纯技能边界，不做工具插件）：`threat-model`（STRIDE/攻击树轻量建模）、`vuln-intel`（NVD/CISA-KEV/GHSA 检索流程，发布前查重避免与 ming-14/Vuln-search-skill 撞名）、`incident-response`（agent 环境事件响应清单）。

## 6. 实施顺序与验收

1. **阶段一（P0）**：A1–A5 + B3。先写检查（B3、A1 的 UTF8 检查）证明当前失败，再修复。
2. **阶段二（P1）**：B1–B9、C1–C4。B4/B5/B7/B8 需要新检查与新 CI job；C1/C2 在发布前本地 `pnpm pack` 试装到干净 profile 验证。
3. **阶段三（P2）**：D1–D5 内容升级，zh/en 同步改、两语言版结构对齐检查（B1）护航。
4. **阶段四（P3）**：E1–E4。

每阶段验收：`verify/verify-skill-pack.mts` 全绿（含新增检查）、`cd provider && pnpm install --frozen-lockfile && pnpm run build`、CI 两/三 job 绿、行为验证用 `dsh --dump-config` 与实际会话各做一次（技能目录可见、`skill` 工具可加载）。
