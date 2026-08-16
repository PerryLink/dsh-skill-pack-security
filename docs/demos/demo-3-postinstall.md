# plugin_vet frida/frida-node

## plugin_vet frida/frida-node

🟢 **Verdict: PASS** — License 75/100 · Source 90/100 · Dependencies 90/100 · Build scripts 94/100 · Maintenance 92/100 · overall 88/100

Target: frida/frida-node@main · 2026-08-16T12:57:53.892Z

- 🟡 [WARN] License scan — deep-dive skill: `dependency-audit §3`
  - 🟡 No LICENSE file found (a license field exists but no license text is committed)
  - 🟡 license field "LGPL-2.0 WITH WxWindows-exception-3.1" is not a common SPDX id — verify manually — Evidence: `LGPL-2.0 WITH WxWindows-exception-3.1`
- 🟡 [WARN] SBOM dependency tree — deep-dive skill: `dependency-audit §7`
  - 🟡 3 direct dependencies are not pinned to exact versions: bindings@^1.5.0, minimatch@^10.0.1, prebuild-install@^7.1.3
  - ⚪ dependency tree: 156 unique packages (direct 3 + dev 8), lockfile package-lock.json v3
- 🟡 [WARN] Commit lock verification — deep-dive skill: `supply-chain-review §3`
  - 🟡 workflow action "v4" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/publish.yml:37`
  - 🟡 workflow action "v6" is not a pinned 40-hex commit (tags/branches are mutable) `.github/workflows/publish.yml:42`
  - ⚪ this scan fetched "main" (not a commit); pin the install to a 40-hex commit (DSH git installs run prepare scripts)
- 🟡 [WARN] Install script checks — deep-dive skill: `supply-chain-review §1`
  - 🟡 install: the invoked scripts/install.js downloads content and executes it (build-tool install script, an ecosystem convention — confirm with the supply-chain-review §1 allowlist criteria) `scripts/install.js` — Evidence: `import { execSync } from 'child_process'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; const pkgRoot = path.dirname(path.…`
- 🟢 [PASS] Network exfiltration scan — deep-dive skill: `dependency-audit §4.4`
  - ⚪ scanned 71 script/manifest files, no exfiltration-domain indicators
- 🟢 [PASS] Obfuscation scan — deep-dive skill: `supply-chain-review §1`
  - ⚪ scanned 65 code files, no obfuscation indicators
- 🟢 [PASS] Source trust signals — deep-dive skill: `dependency-audit §4.3`
  - ⚪ source signals complete (repository/README/CI verifiable)
- 🟢 [PASS] Maintenance status — deep-dive skill: `security-audit §3`
  - ⚪ pushed within the last 2 days: actively maintained

**SBOM** (package-lock.json) — direct 3 + dev 8, unique packages 156 (total 188)
```text
bindings@1.5.0
minimatch@10.0.1
prebuild-install@7.1.3
@types/bindings@1.5.5
@types/chai@5.2.1
@types/mocha@10.0.10
@types/node@22.13.16
chai@5.2.0
mocha@11.1.0
ts-node@10.9.2
typescript@5.8.2
  file-uri-to-path@1.0.0
  brace-expansion@2.0.2
  detect-libc@2.0.2
  expand-template@2.0.3
  github-from-package@0.0.0
  minimist@1.2.8
  mkdirp-classic@0.5.3
  napi-build-utils@2.0.0
  node-abi@3.51.0
  pump@3.0.0
  rc@1.2.8
  simple-get@4.0.1
  tar-fs@2.1.4
  tunnel-agent@0.6.0
  @types/deep-eql@4.0.2
  undici-types@6.20.0
  assertion-error@2.0.1
  check-error@2.1.1
  deep-eql@5.0.2
  loupe@3.1.3
  pathval@2.0.0
  ansi-colors@4.1.3
  browser-stdout@1.3.1
  chokidar@3.5.3
  debug@4.4.0
  diff@5.2.0
  escape-string-regexp@4.0.0
  find-up@5.0.0
  glob@10.5.0
```
… (tree capped at 40 lines)

Scan budget: 95 files · 370985 bytes · 3 skipped

**Manual deep-dive (load these skills to continue)**: `security-audit`, `dependency-audit`, `supply-chain-review`
