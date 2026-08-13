# audit 输出解读（dependency-audit/references/pnpm-audit-reading.md）

主文件第 2 节的完整字段字典、退出码表与误判规则。

## 退出码表

| 命令 | 退出码 | 含义 | 下一步 |
|---|---|---|---|
| `pnpm audit --prod --json` | 0 | 无已知漏洞 | 通过 |
| 同上 | 非 0 | 有漏洞 **或** registry 不可达 | 看 stderr：含 `fetch`/`ECONNREFUSED`/`ETIMEDOUT` = 网络失败，重试；否则读 JSON |
| `npm audit --json` | 0 / 非 0 | 同 pnpm | 同上 |

判据：**网络失败不是发现**。重试两次仍失败 → 报告写"audit 未执行（registry 不可达）"，并改走离线路径（读已提交的锁文件版本对照公开 advisory 列表，标注为人工核对）。

## pnpm audit JSON 字段字典（样例，以实际输出为准）

```json
{
  "auditReportVersion": 2,
  "advisories": {
    "GHSA-xxxx-yyyy-zzzz": {
      "id": "GHSA-xxxx-yyyy-zzzz",
      "severity": "high",
      "module_name": "example-lib",
      "vulnerable_versions": "<2.3.0",
      "patched_versions": ">=2.3.1",
      "recommendation": "Upgrade to 2.3.1",
      "found": { "paths": ["prod-dep@1.0.0 > example-lib@2.2.9"] }
    }
  },
  "metadata": { "vulnerabilities": { "info": 0, "low": 1, "moderate": 2, "high": 3, "critical": 4 } }
}
```

| 字段 | 用途 | 判据 |
|---|---|---|
| `severity` | 只信 registry 值 | 不自行推断；report 里原样引用 |
| `vulnerable_versions` / `patched_versions` | 版本范围 | `patched_versions` 缺失 = 无修复版本，写"无修复版本"，禁止说"升级即可修复" |
| `found.paths` | 依赖路径 | 路径是否含 devDep 前缀决定是否降档（见下） |
| `metadata.vulnerabilities` | 汇总计数 | 与逐条核对，数量不符 = 输出截断/重试 |

## 误判规则（每条都要命令证据）

1. **devDep 降档**：路径只出现在 devDependencies 且该包不参与构建产物。证据命令：`pnpm why <包>` 确认路径；构建产物引用证据：`grep -rn '<包名>' <打包/构建配置> <产物入口>`。无证据 → 不降档。
2. **advisory 状态**：disputed/withdrawn 的 advisory 在 audit 输出中通常已排除；若旧版工具仍报，用 advisory id 查源（`npm view` 无法查 GHSA，用 GitHub Advisory Database 页面/web_search 核对状态）后标注。
3. **不可达路径**：声称"代码没用到"必须同时给出 `pnpm why <包>` 的路径 + 源码 grep 无引用；只有其一 = 观察。
4. **版本范围**：audit 已按安装版本过滤；但全局/peer 安装的版本不在 lockfile 中 → 用 `pnpm ls -r --depth 0` 与实际 node_modules 核对（`node -p "require('<包>/package.json').version"`）。

## npm audit 差异

`npm audit --json` 输出结构：

```json
{ "auditReportVersion": 2,
  "vulnerabilities": {
    "example-lib": {
      "severity": "high", "via": [{ "source": 1099999, "name": "example-lib", "range": "<2.3.0" }],
      "effects": [], "range": "<2.3.0", "fixAvailable": { "name": "example-lib", "version": "2.3.1", "isSemVerMajor": false },
      "isDirect": true
    } } }
```

判据：`fixAvailable` 为 false/缺失 = 无修复版本；`isDirect` 区分直接/传递依赖（传递依赖的修复方式是通过直接依赖升级）。
