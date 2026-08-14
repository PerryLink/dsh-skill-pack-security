# Source comparison and quick reference (vuln-intel/references/advisory-sources.md)

The full comparison table and offline paths for sections 1–7 of the main file.

## The four sources compared

| Source | Content | Strength | Limit | Unauthenticated rate limit |
|---|---|---|---|---|
| NVD `services.nvd.nist.gov` | CVE description, CVSS, references | authoritative ids, carries CVSS | entry lag; CVSS is a generic score, not project-specific | ~5 per 30 seconds |
| CISA KEV | list of known exploited vulnerabilities | the official active-exploitation criterion | only exploited ones, with delay | none (static JSON) |
| GitHub Advisories (GHSA) | in-ecosystem advisories, fixed versions, affected packages | most direct remediation advice | GitHub-centric ecosystem | 60 per hour |
| OSV `api.osv.dev` | cross-ecosystem precise version ranges | `introduced`/`fixed` precise to versions | no independent description, aggregates sources | no hard limit (be considerate) |

## Common jq filter quick reference

```sh
# NVD: only the CVSS 3.1 score
jq '.vulnerabilities[0].cve.metrics.cvssMetricV31[0].cvssData.baseScore'
# KEV: entries added on/after a date
jq '[.vulnerabilities[] | select(.dateAdded >= "2024-01-01")] | length'
# OSV: list all aliases (cross-source matching)
jq '.vulns[] | {id, aliases}'
# OSV: npm ecosystem only
curl -s -X POST 'https://api.osv.dev/v1/query' -H 'Content-Type: application/json' -d '{"package":{"name":"example-lib","ecosystem":"npm"}}' | jq '[.vulns[] | select(.affected[].package.ecosystem=="npm")]'
```

Criterion: jq filters are view selection only — **they do not change the data**; never put a filtered-out field into the verdict (e.g. filtering out description and then claiming "this source has no description").

## EPSS (optional reference, never tiers anything)

EPSS (`api.first.org/data/v1/epss?cve=CVE-2024-1234`) is a model score for "probability of exploitation within 30 days". Use it only to order remediation priority — **it does not change severity and does not replace KEV**; a model score is not a fact.

## Offline paths

- NVD: download the official feeds (`https://nvd.nist.gov/vuln/data-feeds`, gzip JSON) and grep locally; state the feed date in the report.
- KEV: download the same JSON to a local cache (`curl -o kev.json <URL>`) and query with `jq`.
- OSV: `osv-scanner` supports `--offline` (with local OSV data), see `dependency-audit` section 6.
- Fully offline: the verdict must state "data as of <feed date>, not checked live".

## Brief table template

| Id | Severity (source) | KEV (query date) | Project impact (command evidence) | Remediation |
|---|---|---|---|---|
| CVE-2024-1234 | HIGH (NVD) | not listed (2026-08-14) | not applicable: `pnpm why` empty | — |
| GHSA-xxxx-yyyy-zzzz | high (GHSA) | — | affected: example-lib 2.2.9 < 2.3.1 | upgrade to 2.3.1 |
