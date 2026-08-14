# 发布清单 / Release checklist

> 发布新版本时需要同步的位置，及发布流程。同步不一致会被 `verify/verify-skill-pack.mts` 第 1 项在 CI 拦截。

## 版本号同步点 / Version sync points

单一事实来源是仓库根目录的 `VERSION` 文件；以下位置必须与它一致（CI 断言）：

1. `VERSION`（先改这里）
2. `skills/<skill>/SKILL.md` 的 `metadata.version`（5 个中文技能）
3. `skills-en/<skill>/SKILL.md` 的 `metadata.version`（5 个英文技能）
4. `provider/package.json` 的 `version`（与包同步）

批量命令（PowerShell；必须写**无 BOM** 的 UTF-8——Windows PowerShell 5.1 的 `Set-Content -Encoding UTF8` 会加 BOM，官方解析器要求首行恰好是 `---`，BOM 会让全部技能静默失效）：

```powershell
$v = (Get-Content VERSION -Raw).Trim()
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
Get-ChildItem skills,skills-en -Recurse -Filter SKILL.md | ForEach-Object {
  $content = (Get-Content $_.FullName -Raw -Encoding UTF8) -replace "version: '\d+\.\d+\.\d+'", "version: '$v'"
  [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
}
```

## 发布流程 / Release flow

1. 同步版本号（上表全部 4 处）。
2. 把 `CHANGELOG.md` 的 Unreleased 段移到新版本段（Keep a Changelog 格式）。
3. 本地验证：`verify/verify-skill-pack.mts`（全部检查）、`cd provider && pnpm install --frozen-lockfile && pnpm run build && pnpm pack --pack-destination .tmp`。
4. 更新 `docs/ecosystem-conflict-check.md`（仅当技能名/定位变化时；查询方式见文件头）。
5. 若 provider 的 peerDependencies 或技能格式依赖上游变化：bump `.github/workflows/verify.yml` 中 harness checkout 的 `ref`（当前 pin 的 commit 需为上游 master 祖先）。
6. 提交并推送 `main`，等待 CI 各 job（verify + windows + provider）全绿。
7. 打 tag：`git tag -a v$v -m "dsh-skill-pack-security v$v"`；`git push origin v$v`。
8. 在 GitHub Releases 按 tag 发布；发布说明取自 CHANGELOG 对应段。
9. 若该版本新增/改名技能：重跑生态冲突排查并更新 README 的技能表与 verify 内的社区技能名对照（`COMMUNITY_SKILLS`）。

## 语言版规则 / Language-edition rules

- `skills/`（中文）与 `skills-en/`（英文）**技能名必须一致**（同名 = 同一技能的两个语言版）。
- 两个版本的前置元数据（name/metadata.pack/metadata.version）逐字段一致；description/whenToUse/正文分别用各自语言撰写。
- 新增技能时必须两个语言版同时新增，并在同一次提交内完成，否则 CI 布局检查失败。
- 同一扫描根目录内不要同时安装两个语言版（同名技能按 rank 去重，只有一个会进入目录）；需要用哪个装哪个：`install.ps1 -Language zh|en` / `install.sh --language zh|en`。
