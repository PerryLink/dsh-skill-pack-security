# License, poisoning, and lockfile drift (dependency-audit/references/license-and-lockfile.md)

The complete checklists and threshold tables behind Sections 3, 4, and 5 of the main file.

## License check command matrix

| Check | Command | Sample hit | Criterion |
|---|---|---|---|
| Full list | `pnpm licenses list --json` | `{ "name": "x", "license": "MIT" }` | Structure per the actual output; empty/null license = undeclared |
| Single package | `npm view <package> license --json` | `"MIT"` or `"SEE LICENSE IN LICENSE"` | `SEE LICENSE IN` → unpack and read that file before concluding |
| Dependency chain | `pnpm why <package>` | `prod-dep@1.0.0 → x@2.0.0` | For locating copyleft usage |
| Source reference check | `grep -rn '<package name>' <src> --include='*.ts' --include='*.js'` | Hits an import line | No hits = "unused dependency", a separate entry |

## Strong-copyleft list (mandatory check when in **direct dependencies**)

GPL-2.0 / GPL-2.0+ / GPL-3.0 / GPL-3.0+ / AGPL-3.0 / SSPL-1.0 / CPAL-1.0 / EUPL-1.1 / EUPL-1.2 / OSL-3.0.
Weak copyleft (MPL-2.0, EPL-2.0, LGPL-3.0) is only recorded, never upgraded to a finding, unless statically linked (that judgment needs build-output evidence — never a verbal assertion).
Non-SPDX identifiers (e.g. `MIT OR custom`, a bare `BSD`) are recorded as "non-standard identifier" and manually checked against the actual file.

## The five poisoning checks: commands + threshold table

| # | Check | Command | High-risk threshold | Notes |
|---|---|---|---|---|
| 1 | Name similarity | `npm view <package> time.created`; `npm view <package> --json` for downloads | created < 30 days and weekly downloads < 100 | Hand to supply-chain-review for the edit-distance judgment |
| 2 | Install scripts | `npm view <package> scripts --json` | preinstall/install/postinstall non-empty | Non-empty → expand and check the dangerous patterns (supply-chain-review Section 1) |
| 3 | Publisher/repository | `npm view <package> repository.url maintainers --json` | repository missing or pointing at a fork; zero maintainer history | One hit alone is only a record |
| 4 | Network behavior | `npm pack <package> --pack-destination .tmp`; `grep -rnE 'https?://' .tmp/<package>/` | Domains unrelated to the purpose appear | The unpack directory is temporary — delete it after checking |
| 5 | Provenance | `npm view <package> provenance --json` | No provenance | None does not equal malicious; goes into the risk record |

Upgrade rule: **two or more hits upgrade a "record" to a "finding"**; a single hit neither blocks nor false-positives an obscure-but-legitimate package.

## Lockfile drift: commands and classification

```sh
git diff HEAD -- pnpm-lock.yaml | head -n 40            # review the changes
pnpm install --frozen-lockfile                            # re-verify under CI semantics
grep -c 'integrity' pnpm-lock.yaml                        # integrity entry count
```

Drift causes and their verification commands:

| Cause | Signature | Verification command | Handling |
|---|---|---|---|
| package.json hand-edited without reinstall | package.json and lockfile versions mismatch | `pnpm install --frozen-lockfile` fails with ERR_PNPM_OUTDATED_LOCKFILE | Reinstall and commit the lockfile |
| Merge conflict mis-resolved | Lockfile contains `<<<<<<<`/`=======` residue | `grep -nE '^(<<<<<<<|=======|>>>>>>>)' pnpm-lock.yaml` | Re-merge properly |
| Platform optional dependencies | Local passes, CI fails | Run `pnpm install --frozen-lockfile` on CI and read the failing package names | Compare package-by-package platform conditions; do not turn off frozen-lockfile |

## lockfileVersion and pnpm major-version mapping (sample; per reality)

| lockfileVersion | pnpm major |
|---|---|
| 5.x (including `lockfileVersion: 5.4`) | 7 |
| 6.0 | 8 |
| 9.0 | 9 / 10 |

Criterion: a lockfileVersion/tool mismatch = an inconsistent environment — unify the pnpm version before continuing the audit (`git grep -n 'lockfileVersion' pnpm-lock.yaml | head -n 1` reads it).
