# Security Policy

## What ships here

`dsh-skill-pack-security` ships methodology content (SKILL.md bundles in two language editions) plus one optional provider plugin. The provider only registers the pack's skills on `ctx.skills` via the official `FileSystemSkillProvider` — it runs no network calls, no subprocesses, and reads only the skill directories it mounts (fail-loud when those do not exist). The install scripts copy files into the selected DSH skill root and record a manifest for exact uninstall.

## Reporting a vulnerability

- **Skill-content issues**: a command in any SKILL.md/references file that could damage a user's repository or leak data (for example, a missing redaction step or an unsafe cleanup order) is a security issue for this pack. Open a private security report or an issue containing the offending command and a reproduction.
- **Provider/installer issues**: anything that writes outside the selected target root, executes remote content, or mishandles the manifest is a vulnerability. Use GitHub's private vulnerability reporting where available; otherwise contact the maintainers listed in the repository.
- **Redaction applies to reports about this repository too**: do not include live secrets in any report — follow the pack's own `secret-scan` redaction spec (type marker + first 6 characters at most).

## Supported versions

Only the latest release is supported. Fixes are released as patch/minor versions following `docs/release-checklist.md`; verify that the fix is mechanically checkable, and prefer adding a check to `verify/verify-skill-pack.mts` so it cannot regress.

## Disclosure expectations

- Provide: affected version, steps to reproduce, expected versus observed behavior.
- Maintainers acknowledge within 7 days and land the fix with a CHANGELOG entry.
