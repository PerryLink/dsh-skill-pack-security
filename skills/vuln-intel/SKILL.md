---
name: vuln-intel
description: '漏洞情报检索与判定：NVD/CISA-KEV/GHSA/OSV 四处权威源的查询命令、响应解读与误判判据，把 CVE/GHSA 编号变成"是否在野利用 × 是否影响本项目"的带证据结论。给定 CVE/GHSA 编号查详情与影响、判断在野利用状态或写漏洞简报时用；无编号的泛漏洞科普不展开。'
whenToUse: '用户给出 CVE/GHSA 编号要求查详情与影响、判断漏洞是否被在野利用（KEV）、评估漏洞对当前项目/依赖的适用性或汇总漏洞情报简报时使用；没有具体编号的通用安全学习、与特定漏洞无关的讨论不触发本技能。'
metadata:
  pack: dsh-skill-pack-security
  version: '2.2.0'
---

# 漏洞情报（vuln-intel）

目标：把一个漏洞编号变成**每条都有出处命令**的风险结论。只转述来源数据（severity 照抄 NVD/GHSA，不自行推断）；结论结构 = 编号 + 严重性 + 是否在野利用 + 是否影响本项目 + 修复建议。

## 1. 工具就绪与速率限制

```sh
curl --version; jq --version; gh --version
```

样例输出：`curl 8.9.1` / `jq-1.7.1` / `gh version 2.61.0`。
判据：curl 与 jq 必须可用（所有查询都是 curl+jq）；`gh` 可选（仅第 4 节认证查询用）。无 key 速率限制：NVD 每 30 秒约 5 次、GitHub API 每小时 60 次——批量查询时每请求间隔 6 秒，超限会收到 403/429，那是限流不是"漏洞不存在"。

## 2. NVD（CVE 基线：描述、CVSS、参考链接）

```sh
curl -s 'https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2024-1234' | jq '.vulnerabilities[0].cve | {id, published, lastModified, metrics, references: [.references[].url]}'
```

样例输出（以实际输出为准）：

```json
{ "id": "CVE-2024-1234", "published": "2024-03-01T00:00:00.000", "lastModified": "2024-06-01T00:00:00.000", "metrics": { "cvssMetricV31": [ { "cvssData": { "baseSeverity": "HIGH", "baseScore": 8.1 } } ] }, "references": ["https://github.com/example/example-lib/security/advisories/GHSA-xxxx-yyyy-zzzz"] }
```

判据：`vulnerabilities` 数组为空 = 编号不存在或拼错，先复核编号再下结论；CVSS 只照抄 `baseScore`/`baseSeverity`，禁止自己换算；`lastModified` 比 `published` 晚很多 = 条目被更新过，以最新为准。

## 3. CISA KEV（在野利用的唯一权威判据）

```sh
curl -s 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json' | jq '.vulnerabilities[] | select(.cveID=="CVE-2024-1234")'
```

样例输出（命中）：

```json
{ "cveID": "CVE-2024-1234", "vendorProject": "Example", "product": "example-lib", "vulnerabilityName": "Example RCE", "dateAdded": "2024-04-15", "knownRansomwareCampaignUse": "Unknown" }
```

判据：**命中 = 已知在野利用**，结论直接升级为"立即修复"级；未命中 ≠ 未利用——KEV 收录有延迟，结论写"截至查询日未列入 KEV"。`knownRansomwareCampaignUse: Known` = 勒索软件正在利用，优先级再提前。

## 4. GHSA（生态内修复建议与受影响版本）

```sh
curl -s 'https://api.github.com/advisories/GHSA-xxxx-yyyy-zzzz' | jq '{ghsa_id, severity, cvss, summary, vulnerabilities, references}'
# 认证查询（可选，提升速率限制）：gh api graphql -f query='{ securityAdvisory(ghsaId:"GHSA-xxxx-yyyy-zzzz") { severity summary vulnerabilities { firstPatchedVersion { identifier } } } }'
```

样例输出（以实际输出为准）：`{ "ghsa_id": "GHSA-xxxx-yyyy-zzzz", "severity": "high", "vulnerabilities": [ { "package": { "name": "example-lib", "ecosystem": "npm" }, "first_patched_version": "2.3.1" } ] }`
判据：GHSA 的 `severity` 与 NVD 不一致时**两边都记录**（来源与评分者不同），不互相覆盖；`first_patched_version` 是修复建议的直接依据——没有就写"暂无修复版本"，不得声称"升级即可修复"。

## 5. OSV（跨生态精确包版本范围）

```sh
curl -s -X POST 'https://api.osv.dev/v1/query' -H 'Content-Type: application/json' -d '{"package":{"name":"example-lib","ecosystem":"npm"}}' | jq '.vulns[] | {id, aliases, summary, affected}'
```

样例输出：`{ "id": "GHSA-xxxx-yyyy-zzzz", "aliases": ["CVE-2024-1234"], "summary": "...", "affected": [ { "ranges": [ { "events": [ { "introduced": "0" }, { "fixed": "2.3.1" } ] } ] } ] }`
判据：OSV 的价值是**精确到版本的受影响范围**（`introduced`/`fixed` 事件）；`aliases` 用于跨源对号（同一条目在 NVD 叫 CVE、在 GitHub 叫 GHSA）。OSV 未收录 ≠ 无漏洞，只说明该源没有数据。

## 6. 落地判定：与当前项目的依赖树对照

```sh
pnpm why example-lib
grep -n '"example-lib' pnpm-lock.yaml
```

样例输出：`dependencies: prod-dep 1.0.0 → example-lib 2.2.9`；锁文件命中行带版本号。
判据：包不在依赖树 = 结论写"不适用（本仓库不依赖该包）"，附 `pnpm why` 无输出为证；在依赖树且版本落在受影响范围 = 发现，转 `dependency-audit` 走完整修复流程；版本高于 `fixed` = 已修复，附版本行作证。拿不到依赖树证据的"可能影响"一律写进"观察"。

## 7. 简报模板与自检

每条结论 = 编号 + severity（注明来源）+ KEV 命中与否（注明查询日）+ 本项目适用性（附命令输出）+ 修复建议（附 patched 版本）。多编号任务输出表格：编号/严重性/在野利用/本项目影响/修复。四源对照表、jq 速查与离线路径见 `references/advisory-sources.md`。
自检命令（预期输出：无匹配；有匹配 = 简报里有没标来源的严重性判断）：

```sh
grep -nE '^-[[:space:]]*(high|critical|严重|高危)' 简报.md
```

## 与其他技能的分工

- `dependency-audit`：判定"影响本项目"之后的修复与全量依赖审计归它。
- `security-audit`：审计中发现具体 CVE 时，用本技能查详情后回填审计报告。
- `threat-model`：设计阶段引用组件时查其历史漏洞，作为攻击路径证据。
