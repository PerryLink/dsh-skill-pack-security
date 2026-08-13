# typosquat 判定与可复现构建（supply-chain-review/references/typosquat-and-reproducibility.md）

主文件第 2、3、4 节的完整清单、阈值表与评论模板。

## 名称混淆对清单（先查常见对，再做编辑距离）

| 被仿对象 | 常见变体 |
|---|---|
| lodash | lodahs / lodas-h / l0dash / lodashx |
| react / react-dom | react-domm / reactjs-dom / raect-dom |
| axios | axois / axioss / axio-s |
| express | expres / expresss / experss |
| request | requests2 / request-promise-x |
| moment | momemt / momet / moment-js |

编辑距离命令（PowerShell/Node 任一；结果 ≤ 2 进入可疑集）：

```sh
node -e "const lv=(a,b)=>{const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]};console.log(lv(process.argv[1],process.argv[2]))" <新包名> <流行包名>
```

样例输出：`2`
判据：编辑距离 ≤ 2 是**必要条件不是充分条件**——必须叠加"创建时间短/下载量极低"才定阻断。

## npm view 字段说明

| 命令 | 字段 | 缺失时的处理 |
|---|---|---|
| `npm view <包> time.created` | 创建时间 | 无输出 = 包不存在/registry 不通，先确认包名拼写 |
| `npm view <包> --json` 的 `downloads`/`weeklyDownloads` | 下载量 | 部分 registry 不返回 → 按"未知"记录，不据此定论 |
| `npm view <包> repository.url` | 源码仓库 | 缺失/可疑 fork → 记录，转 dependency-audit 第 4 项 |

## 可复现构建三要素与判据

| 要素 | 命令 | 通过判据 |
|---|---|---|
| 锁文件已提交 | `git ls-files -- '*lock*'` | 输出至少一个锁文件路径 |
| CI 冻结安装 | `grep -nE 'frozen-lockfile|npm ci' .github/workflows/*` | 至少一行命中 |
| integrity 字段 | `grep -c 'integrity' <锁文件>` | 计数 > 0 且与依赖条目数量级一致 |

三档决策：

- **通过**：三要素齐全 + 第 1、2 节无阻断项。
- **要求修改**：缺任一要素，或第 2 节只中一条可疑条件。
- **阻断**：第 1 节任一阻断模式；第 2 节两条同时成立；缺锁文件且新增直接依赖 > 20。

## PR 评论模板

通过：

```
依赖评审通过。证据：npm view <包> scripts 无 install 脚本；时间/下载量正常；锁文件+CI 冻结安装+integrity 齐全。误报排除：<包> 的构建脚本属于生态惯例（与用途一致、不触碰凭据）。
```

要求修改：

```
依赖评审：要求修改。<具体缺口> 不满足：<证据命令与输出摘要>。请 <补锁文件/加冻结安装/说明下载量来源> 后我再复核。
```

阻断：

```
依赖评审：阻断。<危险模式/typosquat 两条条件> 命中：<证据命令与输出摘要>。风险：<一句话后果>。建议：<换包/锁定可信来源>。
```
