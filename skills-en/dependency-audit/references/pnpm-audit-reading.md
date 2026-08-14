# Reading audit output (dependency-audit/references/pnpm-audit-reading.md)

The complete field dictionary, exit-code table, and misjudgment rules behind Section 2 of the main file.

## Exit-code table

| Command | Exit code | Meaning | Next step |
|---|---|---|---|
| `pnpm audit --prod --json` | 0 | No known vulnerabilities | Pass |
| Same | Non-zero | Vulnerabilities **or** registry unreachable | Read stderr: `fetch`/`ECONNREFUSED`/`ETIMEDOUT` = network failure, retry; otherwise read the JSON |
| `npm audit --json` | 0 / non-zero | Same as pnpm | Same as above |

Criterion: **a network failure is not a finding**. Two retries still failing → the report writes "audit not run (registry unreachable)" and switches to the offline path (compare the committed lockfile versions against public advisory lists, marked as manually cross-checked).

## pnpm audit JSON field dictionary (sample; per the actual output)

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

| Field | Purpose | Criterion |
|---|---|---|
| `severity` | Trust only the registry value | Never infer your own; quote it verbatim in the report |
| `vulnerable_versions` / `patched_versions` | Version ranges | Missing `patched_versions` = no fixed version; write "no fixed version", never claim "upgrade fixes it" |
| `found.paths` | Dependency paths | Whether a path carries a devDep prefix decides the tier downgrade (below) |
| `metadata.vulnerabilities` | Aggregate counts | Cross-check against the per-item list; a mismatch = truncated output / retry |

## Misjudgment rules (each needs command evidence)

1. **devDep downgrade**: paths appear only in devDependencies and the package does not enter the build output. Evidence commands: `pnpm why <package>` confirms the path; build-output evidence: `grep -rn '<package name>' <packaging/build config> <output entry>`. No evidence → no downgrade.
2. **Advisory status**: disputed/withdrawn advisories are usually already excluded from audit output; if an older tool still reports one, look the advisory id up at the source (npm view cannot query GHSA — use the GitHub Advisory Database page or a web search to confirm status) and annotate it.
3. **Unreachable path**: claiming "the code never uses it" requires both `pnpm why <package>` showing the path and a source grep with no references; only one of them = observation.
4. **Version range**: audit already filters by installed version; but versions installed globally/as peers are not in the lockfile → cross-check with `pnpm ls -r --depth 0` and the real node_modules (`node -p "require('<package>/package.json').version"`).

## npm audit differences

`npm audit --json` output structure:

```json
{ "auditReportVersion": 2,
  "vulnerabilities": {
    "example-lib": {
      "severity": "high", "via": [{ "source": 1099999, "name": "example-lib", "range": "<2.3.0" }],
      "effects": [], "range": "<2.3.0", "fixAvailable": { "name": "example-lib", "version": "2.3.1", "isSemVerMajor": false },
      "isDirect": true
    } } }
```

Criterion: `fixAvailable` false/missing = no fixed version; `isDirect` distinguishes direct from transitive dependencies (transitive ones are fixed by upgrading the direct dependency).
