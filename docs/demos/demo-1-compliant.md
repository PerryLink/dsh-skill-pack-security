# plugin_vet PerryLink/dsh-skill-pack-security

## plugin_vet PerryLink/dsh-skill-pack-security

🟢 **Verdict: PASS** — License 100/100 · Source 100/100 · Dependencies 100/100 · Build scripts 89/100 · Maintenance 92/100 · overall 96/100

Target: PerryLink/dsh-skill-pack-security@main · 2026-08-16T12:57:45.482Z

- 🟢 [PASS] License scan — deep-dive skill: `dependency-audit §3`
  - ⚪ license Apache-2.0 is a common SPDX id — Evidence: `Apache-2.0`
  - ⚪ license file present: LICENSE, verify/fixtures/vet/clean/LICENSE
- 🟢 [PASS] SBOM dependency tree — deep-dive skill: `dependency-audit §7`
  - ⚪ dependency tree: 1 unique packages (direct 1 + dev 0), lockfile pnpm-lock.yaml v9.0
- 🟢 [PASS] Commit lock verification — deep-dive skill: `supply-chain-review §3`
  - ⚪ this scan fetched "main" (not a commit); pin the install to a 40-hex commit (DSH git installs run prepare scripts)
- 🟢 [PASS] Install script checks — deep-dive skill: `supply-chain-review §1`
  - ⚪ no preinstall/install/postinstall/prepare lifecycle scripts
- 🟡 [WARN] Network exfiltration scan — deep-dive skill: `dependency-audit §4.4`
  - 🟡 exfil/receiver domain (data-exfiltration indicator): webhook.site `verify/fixtures/vet/postinstall/package.json:17` — Evidence: `https://webhook.site/FAKE-FIXTURE-ID`
- 🟡 [WARN] Obfuscation scan — deep-dive skill: `supply-chain-review §1`
  - ⚪ possibly minified/obfuscated code (1 very long dense lines) `provider/src/vet/tool.ts`
  - 🟡 dynamic eval + encoded payload (eval/Function ×1, encoded blobs ×1) `verify/fixtures/vet/postinstall/src/payload.js`
- 🟢 [PASS] Source trust signals — deep-dive skill: `dependency-audit §4.3`
  - ⚪ carries a DSH mount manifest (cordis patch)
- 🟢 [PASS] Maintenance status — deep-dive skill: `security-audit §3`
  - ⚪ pushed within the last 0 days: actively maintained

**SBOM** (pnpm-lock.yaml) — direct 1 + dev 0, unique packages 1
```text
@perrylink/dsh-skill-pack-security-provider@2.0.0
```

Scan budget: 114 files · 712138 bytes · 0 skipped

**Manual deep-dive (load these skills to continue)**: `security-audit`, `dependency-audit`, `supply-chain-review`
