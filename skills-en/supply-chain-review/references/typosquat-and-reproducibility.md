# Typosquat judgment and reproducible builds (supply-chain-review/references/typosquat-and-reproducibility.md)

The complete checklists, threshold tables, and comment templates behind Sections 2, 3, and 4 of the main file.

## Confusion-pair list (check common pairs first, then edit distance)

| Impersonated | Common variants |
|---|---|
| lodash | lodahs / lodas-h / l0dash / lodashx |
| react / react-dom | react-domm / reactjs-dom / raect-dom |
| axios | axois / axioss / axio-s |
| express | expres / expresss / experss |
| request | requests2 / request-promise-x |
| moment | momemt / momet / moment-js |

Edit-distance command (PowerShell or Node; a result ≤ 2 enters the suspect set):

```sh
node -e "const lv=(a,b)=>{const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]};console.log(lv(process.argv[1],process.argv[2]))" <new package> <popular package>
```

Sample output: `2`
Criterion: edit distance ≤ 2 is a **necessary condition, not sufficient** — "short creation time / extremely low downloads" must stack on top before blocking.

## npm view field notes

| Command | Field | Handling when missing |
|---|---|---|
| `npm view <package> time.created` | Creation time | No output = the package does not exist / registry unreachable — confirm the spelling first |
| `npm view <package> --json` → `downloads`/`weeklyDownloads` | Download counts | Some registries do not return it → record as "unknown", never conclude from it |
| `npm view <package> repository.url` | Source repository | Missing / suspicious fork → record, hand to dependency-audit item 4 |
| `npm view <package> dist.fileCount dist.tarball --json` | Package size and download origin | An abnormally large fileCount (> 1000) or a tarball host that is not `registry.npmjs.org` → record and review manually |

## The three reproducible-build factors and their criteria

| Factor | Command | Pass criterion |
|---|---|---|
| Lockfile committed | `git ls-files -- '*lock*'` | At least one lockfile path in the output |
| CI frozen install | `grep -nE 'frozen-lockfile|npm ci' .github/workflows/*` | At least one hit |
| integrity fields | `grep -c 'integrity' <lockfile>` | Count > 0 and on the same order as the dependency entries |

The three-tier decision:

- **Pass**: all three factors present + no blocking item from Sections 1 and 2.
- **Request changes**: any one factor missing, or exactly one suspicious condition from Section 2.
- **Block**: any Section-1 blocking pattern; both Section-2 conditions at once; no lockfile with more than 20 new direct dependencies.

## Additional re-checks (they do not change the three-tier threshold, but must accompany the verdict)

- **CI action pinning**: `git diff <base>...HEAD -- .github/workflows | grep -nE '^\+.*uses:'`. A new/changed `uses: <owner>/<repo>@v<number>` not pinned to a commit SHA (`@<40-hex>`) → request changes; read-only third-party actions that never touch secrets are recorded only.
- **Lockfile growth**: compare `git diff <base>...HEAD -- <lockfile> | grep -cE '^\+'` with the number of new direct dependencies; 1 declared dependency but +500 lines → record and inspect the diff manually.

## PR comment templates

Pass:

```
Dependency review: passed. Evidence: npm view <package> scripts shows no install script; creation time/downloads normal; lockfile + CI frozen install + integrity all present. False-positive exclusion: <package>'s build script is ecosystem convention (purpose-consistent, no credential touch).
```

Request changes:

```
Dependency review: request changes. <Specific gap> is not satisfied: <evidence command and output summary>. Please <add the lockfile / add frozen install / explain the download numbers> and I will re-review.
```

Block:

```
Dependency review: blocked. <Dangerous pattern / both typosquat conditions> hit: <evidence command and output summary>. Risk: <one-sentence consequence>. Suggestion: <switch package / pin a trusted source>.
```
