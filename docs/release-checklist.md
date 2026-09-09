# 发布清单 / Release checklist

> 发布新版本时需要同步的位置，及发布流程。同步不一致会被 `verify/verify-skill-pack.mts`（第 1 项 + 第 11 项）在 CI 拦截。
>
> 教训：2.2.11 只改了 `provider/package.json` 与两个运行时 user-agent，漏了 `VERSION`、16 个 `SKILL.md` 与五语 README 的 `vet.userAgent` 行 —— Publish workflow 的 verify job 直接失败（`AssertionError: '2.2.11' !== '2.2.10'`），tag 打了但 npm 一个版本都没发出去。

## 版本号同步点 / Version sync points

单一事实来源是仓库根目录的 `VERSION` 文件（Publish workflow 用它校验 tag：`tag="v$(cat VERSION)"`）。**一条命令**把所有载体从它派生：

```bash
node scripts/bump-version.mjs 2.2.12   # 写入全部 26 个载体
node scripts/bump-version.mjs --check  # 断言全部载体 == VERSION（CI/verify 调用）
```

26 个载体（脚本按此清单读写，任一载体改名/缺失都会报错退出）：

1. `VERSION`
2. 根 `package.json`：`version`
3. `provider/package.json`：`version`
4. `skills/<skill>/SKILL.md` 的 `metadata.version`（8 个中文技能）
5. `skills-en/<skill>/SKILL.md` 的 `metadata.version`（8 个英文技能）
6. `provider/src/index.ts`、`provider/src/vet/config.ts` 的 `userAgent` 默认值
7. 五语 README 的 `vet.userAgent` 行

根 `dependencies` 的 `@perrylink/dsh-skill-pack-security-provider` 钉号**不随发布 bump**：pnpm 11 在每次 `pnpm run` 前做依赖预检，根 lockfile 从 registry 解析该依赖，钉一个尚未发布的版本会让 `pnpm run check:readmes` 直接 `ERR_PNPM_NO_MATCHING_VERSION`。发布成功后按流程第 10 步用 `pnpm add` 同步钉号与 lockfile。

手工兜底（仅在脚本不可用时；PowerShell；必须写**无 BOM** 的 UTF-8——Windows PowerShell 5.1 的 `Set-Content -Encoding UTF8` 会加 BOM，官方解析器要求首行恰好是 `---`，BOM 会让全部技能静默失效）：

```powershell
$v = (Get-Content VERSION -Raw).Trim()
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
Get-ChildItem skills,skills-en -Recurse -Filter SKILL.md | ForEach-Object {
  $content = (Get-Content $_.FullName -Raw -Encoding UTF8) -replace "version: '\d+\.\d+\.\d+'", "version: '$v'"
  [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
}
```

## 发布流程 / Release flow

1. `node scripts/bump-version.mjs <x.y.z>`，再跑 `node scripts/bump-version.mjs --check` 必须输出 `version-carriers: OK`。
2. 把 `CHANGELOG.md` 的 Unreleased 段移到新版本段（Keep a Changelog 格式）。
3. 本地验证：`verify/verify-skill-pack.mts`（全部检查）、`cd provider && pnpm install --frozen-lockfile && pnpm run build && pnpm pack --pack-destination .tmp`。
4. 更新 `docs/ecosystem-conflict-check.md`（仅当技能名/定位变化时；查询方式见文件头）。
5. 若 provider 的 peerDependencies 或技能格式依赖上游变化：bump `.github/workflows/verify.yml` 与 `publish.yml` 中 harness checkout 的 `ref`（当前 pin 的 commit 需为上游 master 祖先），并确认 `verify/verify-skill-pack.mts` 在该 host 线上跑通。
6. 提交并推送 `main`，等待 CI 各 job（verify + windows + provider）全绿。
7. 打 tag：`git tag -a v$v -m "dsh-skill-pack-security v$v"`；`git push origin v$v`。
8. 在 GitHub Releases 按 tag 发布；发布说明取自 CHANGELOG 对应段。
9. 发布 provider 到 npm：`cd provider && npm publish --access public`（包名 `@perrylink/dsh-skill-pack-security-provider`；`prepack` 自动嵌入双语言版，发布后用 `npm view` 复核 tarball 内容）。
10. 发布成功后同步根包 provider 钉号与根 lockfile：`pnpm add @perrylink/dsh-skill-pack-security-provider@<x.y.z>`（在仓库根执行；该版本此刻才在 registry 上可用）。
11. 若该版本新增/改名技能：重跑生态冲突排查并更新 README 的技能表与 verify 内的社区技能名对照（`COMMUNITY_SKILLS`）。

## 语言版规则 / Language-edition rules

- `skills/`（中文）与 `skills-en/`（英文）**技能名必须一致**（同名 = 同一技能的两个语言版）。
- 两个版本的前置元数据（name/metadata.pack/metadata.version）逐字段一致；description/whenToUse/正文分别用各自语言撰写。
- 新增技能时必须两个语言版同时新增，并在同一次提交内完成，否则 CI 布局检查失败。
- 同一扫描根目录内不要同时安装两个语言版（同名技能按 rank 去重，只有一个会进入目录）；需要用哪个装哪个：`install.ps1 -Language zh|en` / `install.sh --language zh|en`。
