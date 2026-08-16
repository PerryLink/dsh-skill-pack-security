---
name: vuln-intel
description: 'Vulnerability intelligence lookup and triage: query commands for the four authoritative sources NVD/CISA-KEV/GHSA/OSV, response interpretation, and misjudgment criteria — turning a CVE/GHSA id into an evidence-backed verdict of "actively exploited? × does it affect this project?". Use when given a CVE/GHSA id to look up details and impact, to judge active-exploitation status, or to write a vulnerability brief; not for id-less general vulnerability education.'
whenToUse: 'Use when the user gives a CVE/GHSA id and asks for details and impact, whether a vulnerability is actively exploited (KEV), its applicability to the current project/dependencies, or a vulnerability intelligence brief. General security learning without a specific id, and discussions unrelated to a specific vulnerability, do not trigger this skill.'
metadata:
  pack: dsh-skill-pack-security
  version: '2.0.0'
---

# Vulnerability intelligence (vuln-intel)

Goal: turn one vulnerability id into a risk verdict **where every line carries its source command**. Only relay source data (severity is copied from NVD/GHSA, never inferred); the verdict structure = id + severity + actively exploited? + affects this project? + remediation advice.

## 1. Tool readiness and rate limits

```sh
curl --version; jq --version; gh --version
```

Sample output: `curl 8.9.1` / `jq-1.7.1` / `gh version 2.61.0`.
Criterion: curl and jq must be available (every query is curl+jq); `gh` is optional (only for the authenticated query in section 4). Unauthenticated rate limits: NVD roughly 5 requests per 30 seconds, GitHub API 60 per hour — when batch querying, wait 6 seconds between requests; a 403/429 means rate-limited, not "the vulnerability does not exist".

## 2. NVD (the CVE baseline: description, CVSS, references)

```sh
curl -s 'https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2024-1234' | jq '.vulnerabilities[0].cve | {id, published, lastModified, metrics, references: [.references[].url]}'
```

Expected sample output (use the actual output):

```json
{ "id": "CVE-2024-1234", "published": "2024-03-01T00:00:00.000", "lastModified": "2024-06-01T00:00:00.000", "metrics": { "cvssMetricV31": [ { "cvssData": { "baseSeverity": "HIGH", "baseScore": 8.1 } } ] }, "references": ["https://github.com/example/example-lib/security/advisories/GHSA-xxxx-yyyy-zzzz"] }
```

Criterion: an empty `vulnerabilities` array = the id does not exist or is misspelled — re-check the id before concluding; copy CVSS `baseScore`/`baseSeverity` verbatim, never recompute; a `lastModified` much later than `published` = the entry was updated — treat the latest as authoritative.

## 3. CISA KEV (the only authoritative actively-exploited criterion)

```sh
curl -s 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json' | jq '.vulnerabilities[] | select(.cveID=="CVE-2024-1234")'
```

Expected sample output (a hit):

```json
{ "cveID": "CVE-2024-1234", "vendorProject": "Example", "product": "example-lib", "vulnerabilityName": "Example RCE", "dateAdded": "2024-04-15", "knownRansomwareCampaignUse": "Unknown" }
```

Criterion: **a hit = known active exploitation**, and the verdict upgrades to "fix immediately"; no hit ≠ not exploited — KEV entry lags, so the verdict states "not in KEV as of the query date". `knownRansomwareCampaignUse: Known` = ransomware is exploiting it — raise the priority further.

## 4. GHSA (ecosystem-specific remediation and affected versions)

```sh
curl -s 'https://api.github.com/advisories/GHSA-xxxx-yyyy-zzzz' | jq '{ghsa_id, severity, cvss, summary, vulnerabilities, references}'
# authenticated query (optional, higher rate limit): gh api graphql -f query='{ securityAdvisory(ghsaId:"GHSA-xxxx-yyyy-zzzz") { severity summary vulnerabilities { firstPatchedVersion { identifier } } } }'
```

Expected sample output (use the actual output): `{ "ghsa_id": "GHSA-xxxx-yyyy-zzzz", "severity": "high", "vulnerabilities": [ { "package": { "name": "example-lib", "ecosystem": "npm" }, "first_patched_version": "2.3.1" } ] }`
Criterion: when GHSA `severity` disagrees with NVD, **record both** (different sources and scorers) — never let one overwrite the other; `first_patched_version` is the direct basis for remediation advice — without it write "no fixed version yet", never claim "upgrading fixes it".

## 5. OSV (precise cross-ecosystem package version ranges)

```sh
curl -s -X POST 'https://api.osv.dev/v1/query' -H 'Content-Type: application/json' -d '{"package":{"name":"example-lib","ecosystem":"npm"}}' | jq '.vulns[] | {id, aliases, summary, affected}'
```

Expected sample output: `{ "id": "GHSA-xxxx-yyyy-zzzz", "aliases": ["CVE-2024-1234"], "summary": "...", "affected": [ { "ranges": [ { "events": [ { "introduced": "0" }, { "fixed": "2.3.1" } ] } ] } ] }`
Criterion: OSV's value is the **version-precise affected ranges** (`introduced`/`fixed` events); `aliases` cross-references sources (one entry is a CVE on NVD and a GHSA on GitHub). OSV has no entry ≠ no vulnerability — it only means that source has no data.

## 6. Landing verdict: match against the current project's dependency tree

```sh
pnpm why example-lib
grep -n '"example-lib' pnpm-lock.yaml
```

Expected sample output: `dependencies: prod-dep 1.0.0 → example-lib 2.2.9`; the lockfile hit line carries the version.
Criterion: package not in the dependency tree = verdict "not applicable (this repository does not depend on it)" with the empty `pnpm why` output as evidence; in the tree and the version falls in the affected range = a finding, hand it to `dependency-audit` for the full remediation flow; version above `fixed` = already fixed, with the version line as evidence. Any "possible impact" without dependency-tree evidence goes into "observations".

## 7. Brief template and self-check

Each verdict = id + severity (with source) + KEV hit or not (with query date) + project applicability (with command output) + remediation (with patched version). Multi-id tasks produce a table: id / severity / actively exploited / project impact / fix. The four-source comparison table, jq quick reference, and offline paths live in `references/advisory-sources.md`.
Self-check command (expected output: no matches; a match means the brief contains a source-less severity claim):

```sh
grep -nE '^-[[:space:]]*(high|critical|严重|高危)' brief.md
```

## Division of labor with the other skills

- `dependency-audit`: the remediation after "affects this project" and full dependency audits belong to it.
- `security-audit`: when an audit finds a specific CVE, use this skill to look up details and fill them back into the audit report.
- `threat-model`: when a design references a component, look up its vulnerability history as attack-path evidence.
