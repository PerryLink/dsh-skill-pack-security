# 情报源对照与速查（vuln-intel/references/advisory-sources.md）

主文件第 1–7 节的完整对照表与离线路径。

## 四源对照

| 源 | 内容 | 强项 | 局限 | 无认证速率限制 |
|---|---|---|---|---|
| NVD `services.nvd.nist.gov` | CVE 描述、CVSS、参考链接 | 编号权威、有 CVSS | 收录滞后、CVSS 是通用评分不看具体项目 | ~5 次/30 秒 |
| CISA KEV | 已知在野利用清单 | 在野利用的官方判据 | 只收被利用的、有延迟 | 无（静态 JSON） |
| GitHub Advisories (GHSA) | 生态内公告、修复版本、受影响包 | 修复建议最直接 | 以 GitHub 生态为主 | 60 次/小时 |
| OSV `api.osv.dev` | 跨生态精确版本范围 | `introduced`/`fixed` 精确到版本 | 无独立描述，聚合各源 | 无硬限制（请节制） |

## 常用 jq 过滤速查

```sh
# NVD：只看 CVSS 3.1 分数
jq '.vulnerabilities[0].cve.metrics.cvssMetricV31[0].cvssData.baseScore'
# KEV：给定日期之后新增的条目
jq '[.vulnerabilities[] | select(.dateAdded >= "2024-01-01")] | length'
# OSV：列出所有别名（跨源对号）
jq '.vulns[] | {id, aliases}'
# OSV：只看 npm 生态
curl -s -X POST 'https://api.osv.dev/v1/query' -H 'Content-Type: application/json' -d '{"package":{"name":"example-lib","ecosystem":"npm"}}' | jq '[.vulns[] | select(.affected[].package.ecosystem=="npm")]'
```

判据：jq 过滤只是视图选择，**不改变数据**；任何被过滤掉的字段不得出现在结论里（如过滤掉 description 后声称"该源无描述"）。

## EPSS（可选参考，不参与定级）

EPSS（`api.first.org/data/v1/epss?cve=CVE-2024-1234`）是"未来 30 天内被利用的概率"模型分。只作为排优先级参考，**不改变 severity、不替代 KEV**——模型分不是事实。

## 离线路径

- NVD：下载官方 feeds（`https://nvd.nist.gov/vuln/data-feeds`，gzip JSON）本地 grep；报告注明 feed 日期。
- KEV：下载同一 JSON 到本地缓存（`curl -o kev.json <URL>`）再 `jq` 查。
- OSV：`osv-scanner` 支持 `--offline`（配合本地 OSV 数据），见 `dependency-audit` 第 6 节。
- 全部离线时：结论必须写明"数据截至 <feed 日期>，未实时核对"。

## 简报表格模板

| 编号 | 严重性（来源） | KEV（查询日） | 本项目影响（命令证据） | 修复建议 |
|---|---|---|---|---|
| CVE-2024-1234 | HIGH（NVD） | 未列入（2026-08-14） | 不适用：`pnpm why` 无输出 | — |
| GHSA-xxxx-yyyy-zzzz | high（GHSA） | — | 影响：example-lib 2.2.9 < 2.3.1 | 升级到 2.3.1 |
