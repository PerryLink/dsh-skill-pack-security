# plugin_vet PerryLink/dsh-skill-pack-security

## plugin_vet PerryLink/dsh-skill-pack-security

🟢 **Verdict: PASS** — License 100/100 · Source 50/100 · Dependencies 90/100 · Build scripts 100/100 · Maintenance 92/100 · overall 87/100

Target: PerryLink/dsh-skill-pack-security@main · 2026-08-16T12:54:32.261Z

- 🟢 [PASS] License scan — deep-dive skill: `dependency-audit §3`
  - ⚪ license Apache-2.0 is a common SPDX id — Evidence: `Apache-2.0`
  - ⚪ license file present: LICENSE
- 🟡 [WARN] SBOM dependency tree — deep-dive skill: `dependency-audit §7`
  - 🟡 1 direct dependencies are not pinned to exact versions: @perrylink/dsh-skill-pack-security-provider@^1.3.0
  - ⚪ dependency tree: 1 unique packages (direct 1 + dev 0), lockfile pnpm-lock.yaml v9.0
- 🟡 [WARN] Commit lock verification — deep-dive skill: `supply-chain-review §3`
  - 🟡 workflow action "v7" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/verify.yml:16`
  - 🟡 workflow action "v7" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/verify.yml:19`
  - 🟡 workflow action "v6" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/verify.yml:28`
  - 🟡 workflow action "v7" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/verify.yml:33`
  - 🟡 workflow action "v7" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/verify.yml:73`
  - 🟡 workflow action "v7" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/verify.yml:76`
- 🟢 [PASS] Install script checks — deep-dive skill: `supply-chain-review §1`
  - ⚪ no preinstall/install/postinstall/prepare lifecycle scripts
- 🟢 [PASS] Network exfiltration scan — deep-dive skill: `dependency-audit §4.4`
  - ⚪ scanned 16 script/manifest files, no exfiltration-domain indicators
- 🟢 [PASS] Obfuscation scan — deep-dive skill: `supply-chain-review §1`
  - ⚪ scanned 5 code files, no obfuscation indicators
- 🟢 [PASS] Source trust signals — deep-dive skill: `dependency-audit §4.3`
  - ⚪ carries a DSH mount manifest (cordis patch)
- 🟢 [PASS] Maintenance status — deep-dive skill: `security-audit §3`
  - ⚪ pushed within the last 0 days: actively maintained

**SBOM** (pnpm-lock.yaml) — direct 1 + dev 0, unique packages 1
```text
@perrylink/dsh-skill-pack-security-provider@1.3.0
```

Scan budget: 71 files · 432101 bytes · 0 skipped

**Manual deep-dive (load these skills to continue)**: `security-audit`, `dependency-audit`, `supply-chain-review`
