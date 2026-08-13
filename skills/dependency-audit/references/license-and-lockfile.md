# license、投毒与锁文件漂移（dependency-audit/references/license-and-lockfile.md）

主文件第 3、4、5 节的完整清单与阈值表。

## license 检查命令矩阵

| 检查 | 命令 | 命中样例 | 判据 |
|---|---|---|---|
| 全量清单 | `pnpm licenses list --json` | `{ "name": "x", "license": "MIT" }` | 结构以实际输出为准；license 为空/null = 无声明 |
| 单包查询 | `npm view <包> license --json` | `"MIT"` 或 `"SEE LICENSE IN LICENSE"` | `SEE LICENSE IN` → 解包读该文件再定论 |
| 依赖链定位 | `pnpm why <包>` | `prod-dep@1.0.0 → x@2.0.0` | 用于 copyleft 用途定位 |
| 源码引用核对 | `grep -rn '<包名>' <src> --include='*.ts' --include='*.js'` | 命中 import 行 | 无命中 = "未使用依赖"另记一条 |

## copyleft 强传染清单（出现在**直接依赖**时必查）

GPL-2.0 / GPL-2.0+ / GPL-3.0 / GPL-3.0+ / AGPL-3.0 / SSPL-1.0 / CPAL-1.0 / EUPL-1.1 / EUPL-1.2 / OSL-3.0。
弱 copyleft（MPL-2.0、EPL-2.0、LGPL-3.0）只记录，不升级为发现，除非被静态链接（该判断需要构建产物证据，禁止口头断言）。
非 SPDX 标识（如 `MIT OR custom`、裸 `BSD`）记录为"标识不规范"，人工核对实际文件。

## 投毒检查五项：命令 + 阈值表

| # | 检查 | 命令 | 高风险阈值 | 说明 |
|---|---|---|---|---|
| 1 | 名称相似性 | `npm view <包> time.created`；`npm view <包> --json` 看 downloads | created < 30 天且周下载 < 100 | 转 supply-chain-review 做编辑距离判定 |
| 2 | install 脚本 | `npm view <包> scripts --json` | preinstall/install/postinstall 非空 | 非空即展开查危险特征（转 supply-chain-review 第 1 节） |
| 3 | 发布者/仓库 | `npm view <包> repository.url maintainers --json` | repository 缺失或指向 fork；maintainers 历史为零 | 单条只记录 |
| 4 | 网络行为 | `npm pack <包> --pack-destination .tmp`；`grep -rnE 'https?://' .tmp/<包>/` | 出现与用途无关域名 | 解包目录是临时文件，查完删除 |
| 5 | provenance | `npm view <包> provenance --json` | 无 provenance | 无 ≠ 恶意，写进风险记录 |

升级规则：**两条及以上命中才从"记录"升级为"发现"**；单条命中不阻断、不误杀小众正常包。

## 锁文件漂移：命令与分类

```sh
git diff HEAD -- pnpm-lock.yaml | head -n 40            # 看改动内容
pnpm install --frozen-lockfile                            # CI 语义复验
grep -c 'integrity' pnpm-lock.yaml                        # 完整性条目数
```

漂移原因分类与复核命令：

| 原因 | 特征 | 复核命令 | 处理 |
|---|---|---|---|
| 手改 package.json 未重装 | package.json 与锁文件版本不符 | `pnpm install --frozen-lockfile` 失败 + 报 ERR_PNPM_OUTDATED_LOCKFILE | 重装并提交锁文件 |
| 合并冲突误解决 | 锁文件含 `<<<<<<<`/`=======` 残留 | `grep -nE '^(<<<<<<<|=======|>>>>>>>)' pnpm-lock.yaml` | 重新合并解决 |
| 平台可选依赖 | 本地通过、CI 失败 | CI 上跑 `pnpm install --frozen-lockfile` 看失败包名 | 逐包核对平台条件，不关 frozen-lockfile |

## lockfileVersion 与 pnpm 大版本对照（样例，以实际为准）

| lockfileVersion | pnpm 大版本 |
|---|---|
| 5.x（含 `lockfileVersion: 5.4`） | 7 |
| 6.0 | 8 |
| 9.0 | 9 / 10 |

判据：lockfileVersion 与工具大版本不匹配 = 环境不一致，先统一 pnpm 版本再继续审计（`git grep -n 'lockfileVersion' pnpm-lock.yaml | head -n 1` 取值）。
