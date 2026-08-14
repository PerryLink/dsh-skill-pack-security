# Risk tiering details (security-audit/references/risk-classification.md)

The complete definitions behind Stage 3 of the main file. Tiering uses only three factors: **exploitability × impact × exposed**; all three are written into the report row — none may be missing.

## The four tiers

| Tier | Definition | Handling deadline | Report wording template |
|---|---|---|---|
| Critical | Exposed real credentials, directly remotely exploitable vulnerabilities, injection surfaces that bypass all defenses | Handle immediately; disposition before the audit ends | "Confirmed: <type> at <location> is exposed to <scope> with <impact>." |
| High | Exploitable locally / with low privilege, or broad impact whose exploitation needs preconditions | Handle within the current iteration | "Found: <type> at <location>; exploitation requires <precondition>." |
| Medium | Defense-in-depth gaps, configuration hazards, known vulnerabilities in dependencies with no exploitable path | Schedule for a planned release | "Observation: <type>; suggested to handle in <version/plan>." |
| Low | Information exposure, style/hygiene issues, historical leftovers | Record it | "Recorded: <type> poses no current risk." |

## Coarse CVSS mapping (reference only; it does not replace the three factors)

- Critical 9.0–10.0 → Critical
- High 7.0–8.9 → High
- Medium 4.0–6.9 → Medium
- Low 0.1–3.9 → Low

Criterion: CVSS is only the upstream score; whether this repository is affected must be re-derived from the three factors (for example, a vulnerable package that lives only in devDependencies and never enters the build may be downgraded to Medium even with a critical CVSS — with the reason written down).

## Verification commands

| Finding type | Verification command | Pass criterion |
|---|---|---|
| Secret | `git grep -n '<first 6 characters>' <commit hash> -- '<path>'` | Output hits the line and the content is credential-shaped |
| Dependency vulnerability | Search the `pnpm audit --json` output by advisory id | The id exists and `severity` matches the report |
| New dependency | `git log --oneline --follow -- <lockfile>` | The introducing commit exists and matches the dependency version |
| Injection surface | Original-source grep (see prompt-injection-review) | The original text exists and its context matches the quotation |

## Upgrade / downgrade rules

- A tier that cannot be verified → always downgraded to "observation".
- Verification failure (command empty, content mismatch) → downgrade to "observation" or delete; keeping the original tier without deleting requires writing the reason in the report.
- Multiple findings sharing one root cause are merged into one row listing every location.

## Compliance mapping (optional appendix; reference only, never part of tiering)

When the report must align with a compliance framework, add a coarse mapping in the appendix: group findings by OWASP ASVS verification requirements or by NIST CSF functions (Identify/Protect/Detect/Respond/Recover). The mapping is a communication annotation only — tiers still come from the three factors alone; "compliance requires it" may never be used to argue a tier upward.
