# Security Policy

## What ships here

`dsh-skill-pack-security` ships methodology content (SKILL.md bundles in two language editions) plus one optional provider plugin. The provider only registers the pack's skills on `ctx.skills` via the official `FileSystemSkillProvider` — it runs no network calls, no subprocesses, and reads only the skill directories it mounts (fail-loud when those do not exist). The install scripts copy files into the selected DSH skill root and record a manifest for exact uninstall.

## Reporting a vulnerability

- **Report privately.** Use GitHub's private vulnerability reporting at <https://github.com/PerryLink/dsh-skill-pack-security/security/advisories/new> (Security → Advisories → Report a vulnerability). If private reporting is unavailable, contact the maintainers listed in the repository directly — do not open a public issue for a suspected vulnerability.
- **⚠️ Redact before reporting.** Never include live secrets in a report — no tokens, API keys, credentials, cookies, or request headers. Follow the pack's own `secret-scan` redaction spec (type marker + first 6 characters at most). If you must prove a credential leaked, say where it was found, not what it is.
- Include: affected version, steps to reproduce, and expected versus observed behavior.

- **Skill-content issues**: a command in any SKILL.md/references file that could damage a user's repository or leak data (for example, a missing redaction step or an unsafe cleanup order) is a security issue for this pack.
- **Provider/installer issues**: anything that writes outside the selected target root, executes remote content, or mishandles the manifest is a vulnerability.

## Supported versions

Only the latest release is supported. Fixes are released as patch/minor versions following `docs/release-checklist.md`; verify that the fix is mechanically checkable, and prefer adding a check to `verify/verify-skill-pack.mts` so it cannot regress.

## Response expectations

- Maintainers acknowledge a private report within 7 days and provide a status update within 30 days.
- Fixes land with a CHANGELOG entry and a verification check where the fix is checkable.

## Credits and disclosure

- Reporters are credited by name or handle in the advisory, the release notes, and the CHANGELOG — unless they prefer to stay anonymous.
- Coordinated disclosure: the fix ships first (patch/minor per `docs/release-checklist.md`), and the advisory publishes together with the release. If no fix has landed 90 days after acknowledgement, the reporter may disclose the details publicly.
- This is a volunteer project: there is no bounty program, and reporting is never compensated.
