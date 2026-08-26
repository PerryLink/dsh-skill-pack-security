# dsh-skill-pack-security poison-sample benchmark results

> Deterministic malicious-pattern benchmark. Regenerate with
> `pnpm --dir provider run build && node benchmark/run.mjs` (zero new dependencies; the
> checks are the shipped `provider/src/vet` engine, run from the built `provider/lib`).

## Method

- **Detector**: the three malicious-pattern checks from `provider/src/vet/checks.ts` —
  `installScriptsCheck` (download+exec, obfuscated eval, credential/global-config touches),
  `networkExfilCheck` (exfil/receiver domains in script files), and
  `obfuscationCheck` (dynamic eval + base64/hex payloads).
- **Detection** = the check's `verdict` is `fail` (the state that blocks installation
  under the `deny` gate policy). A `warn` is not counted as a detection.
- **Labels**: `label: true` = a malicious sample of that class; `label: false` = a benign
  plugin file (no lifecycle scripts, harmless URL, or clean readable code).
- **Placeholders only**: every URL/domain is a harmless placeholder (`example.com`,
  `webhook.site`, `pastebin.com`, …) used purely as a detection signal; nothing is contacted.

## Per-class metrics

| Class | TP | FP | FN | TN | Detection rate (recall) | FPR | Precision | F1 |
|---|---|---|---|---|---|---|---|---|
| install-scripts | 8 | 0 | 0 | 8 | 1.000 | 0.000 | 1.000 | 1.000 |
| network-exfil | 4 | 0 | 2 | 5 | 0.667 | 0.000 | 1.000 | 0.800 |
| obfuscation | 5 | 0 | 1 | 5 | 0.833 | 0.000 | 1.000 | 0.909 |

## Overall

| Aggregate | Precision | Recall | F1 |
|---|---|---|---|
| Macro (mean of the three classes) | 1.000 | 0.833 | 0.903 |
| Micro (pooled TP/FP/FN across classes) | 1.000 | 0.850 | 0.919 |

- Samples: 38 total
  (20 malicious,
   18 benign).
- Overall false-positive rate (micro): 0.000.

## Per-sample notes

- Missed malicious samples (false negatives): network-exfil/ne-pos-03, network-exfil/ne-pos-04, obfuscation/ob-pos-01.
- Flagged benign samples (false positives): none.

## Gap vs OSV / Socket (honest)

This benchmark measures **only** the self-built static heuristics. OSV and Socket are
database/telemetry-backed: OSV matches lockfile versions against published advisories, and
Socket layers maintainer/adversary telemetry (install-script provenance, package age,
typosquat scores) on top of static analysis. The gap, in both directions:

- **Coverage**: the self-built checks catch the *shapes* they were written for (download+exec,
  decoded-then-executed payloads, credential/global touches, exfil domains, eval+base64). They
  have **no vulnerability database**, so a known CVE in a pinned dependency is invisible to
  `install-scripts`/`network-exfil`/`obfuscation` — that evidence belongs to the
  `sbom` check, which delegates to `osv-scanner`/`npm audit` when those CLIs are present
  (not exercised here, which needs a real on-disk project).
- **Precision**: the heuristics are pattern-based, so renamed or lightly re-encoded payloads
  evade them, while Socket's telemetry can also flag *reputational* risk the heuristics cannot
  see. The FPR reported here is only the pattern-level false-positive rate on a curated benign
  set, not a whole-ecosystem FPR.

## Known limitations (honest)

- **Shape, not intent.** These checks fire on syntactic indicators; they do not execute
  anything or model adversarial intent.
- **Single-file heuristic view.** The dataset feeds one file (or a `package.json`) per
  sample; the real engine walks a whole package, and cross-file payloads are out of scope here.
- **Telegram/Discord webhook domains are dead entries.** `EXFIL_DOMAINS` lists
  `api.telegram.org/bot` and `discord.com/api/webhooks` (host + path), but the check
  compares them against the bare URL host, so those two receiver domains never match
  (`ne-pos-03`, `ne-pos-04`).
- **Obfuscation base64 must be inline.** The base64-blob regex matches a literal directly
  inside `atob()`/`Buffer.from()` or a 100+ char standalone blob, so
  `const s='<short-base64>'; eval(atob(s))` is missed (`ob-pos-01`).
- **No evasion corpus.** Obfuscation samples use plain `atob`/base64; re-encoded,
  split, or novel obfuscation is not in this regression set.
