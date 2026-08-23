# Third-Party Notices

This file records the third-party posture of `dsh-skill-pack-security`. It is
kept beside `LICENSE` so that consumers of the published provider bundle can
audit exactly what ships in the artifact.

## Own code

All source in this repository — the eight skills (`skills/`, `skills-en/`), the
installers, the verification suite, and the `plugin_vet` scan engine
(`provider/src/vet/`) — is original work by the dsh-skill-pack-security
contributors and is licensed under the [Apache License 2.0](LICENSE)
© 2026 dsh-skill-pack-security contributors.

## No bundled third-party code

The `plugin_vet` engine is zero-dependency: it imports only Node.js builtins
(`node:*`) and its own relative modules. No third-party source is copied into
the engine, and the two skill editions are original content. This invariant is
enforced by verification check 20 (`vet engine: zero-dependency`).

## Evaluated but not ported assets

The project direction prioritized porting the author's earlier assets
GPL-Radar (rolling-hash + Winnowing code similarity and GPL-pollution
detection), LLM-detective (third-party LLM API fingerprint authenticity), and
Sus-PY (static analysis of AI-generated suspicious Python code) into the
license-scan and malicious-pattern checks. No public source repository with a
verifiable license could be located for any of the three, so **no code was
ported**. The equivalent checks are original implementations shipped in
`provider/src/vet/checks.ts`:

- license scan — SPDX id recognition plus missing/unknown/NOASSERTION flagging;
- malicious patterns — lifecycle scripts, network-exfiltration domains, and
  obfuscated/encoded payloads.

This notice will be updated (and the engine extended) if a licensed source for
any of the three assets becomes available.

## Peer dependencies (installed, not bundled)

The provider declares the following as peer/dev dependencies, resolved from the
npm registry at install time rather than bundled into the tarball. Each is
governed by its own license (all MIT as published by DeepSeek Harness):

- `@deepseek-ai/cordis` — MIT
- `@deepseek-ai/schemastery` — MIT
- `@deepseek-ai/dsh-skill-filesystem` — MIT
- `@deepseek-ai/dsh-tools` — MIT
- `@deepseek-ai/dsh-llm` — MIT (dev-only, type bridge for the tool adapter)
