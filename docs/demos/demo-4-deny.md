# plugin_vet ali-meoo/meoo-cli

## plugin_vet ali-meoo/meoo-cli

🔴 **Verdict: FAIL** — License 0/100 · Source 95/100 · Dependencies 60/100 · Build scripts 100/100 · Maintenance 92/100 · overall 67/100

🛑 **Gate DENY: this plugin failed the supply-chain checks; installation is blocked by policy**
Load the supply-chain-review / dependency-audit skills for a manual deep-dive, or have a trusted maintainer change the gate policy and retry.

Target: ali-meoo/meoo-cli@main · 2026-08-16T12:58:00.976Z

- 🔴 [FAIL] License scan — deep-dive skill: `dependency-audit §3`
  - 🔴 No license at all: no LICENSE file and no license field — Evidence: `no LICENSE* file; no package.json license field; GitHub detected no license`
- ⚪ [SKIP] SBOM dependency tree — deep-dive skill: `dependency-audit §7`
  - ⚪ skip: no package.json, cannot build a dependency tree
- 🟢 [PASS] Commit lock verification — deep-dive skill: `supply-chain-review §3`
  - ⚪ this scan fetched "main" (not a commit); pin the install to a 40-hex commit (DSH git installs run prepare scripts)
- 🟢 [PASS] Install script checks — deep-dive skill: `supply-chain-review §1`
  - ⚪ no preinstall/install/postinstall/prepare lifecycle scripts
- 🟢 [PASS] Network exfiltration scan — deep-dive skill: `dependency-audit §4.4`
  - ⚪ scanned 2 script/manifest files, no exfiltration-domain indicators
- 🟢 [PASS] Obfuscation scan — deep-dive skill: `supply-chain-review §1`
  - ⚪ scanned 0 code files, no obfuscation indicators
- 🟡 [WARN] Source trust signals — deep-dive skill: `dependency-audit §4.3`
  - 🟡 no CI workflows (no automated build/test evidence)
- 🟢 [PASS] Maintenance status — deep-dive skill: `security-audit §3`
  - ⚪ pushed within the last 19 days: actively maintained

**SBOM** (no lockfile) — direct 0 + dev 0, unique packages 0

Scan budget: 11 files · 85124 bytes · 0 skipped

**Manual deep-dive (load these skills to continue)**: `security-audit`, `dependency-audit`
