/**
 * Report redaction: no secret-shaped text may ever leave the scan engine.
 *
 * Applied to every evidence snippet and finding message before a value enters
 * the canonical report, mirroring the pack's `secret-scan` redaction rule
 * (type marker only, never the value). Patterns cover the token families the
 * `secret-scan` skill documents plus webhook/bot URLs.
 *
 * @module dsh-skill-pack-security/vet/redact
 */

const REDACTIONS: ReadonlyArray<{ readonly pattern: RegExp; readonly replace: string }> = [
  // Private key blocks (PEM / OpenSSH), multiline.
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, replace: '[REDACTED private key]' },
  // GitHub tokens.
  { pattern: /ghp_[A-Za-z0-9]{30,}/g, replace: 'ghp_***' },
  { pattern: /github_pat_[A-Za-z0-9_]{20,}/g, replace: 'github_pat_***' },
  // AWS access keys.
  { pattern: /AKIA[0-9A-Z]{16}/g, replace: 'AKIA***' },
  // Generic sk- / xox tokens (OpenAI, Slack…).
  { pattern: /sk-[A-Za-z0-9]{16,}/g, replace: 'sk-***' },
  { pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g, replace: 'xox*-***' },
  // Azure storage keys.
  { pattern: /AZURE_STORAGE_[A-Za-z0-9]+=[A-Za-z0-9+/=]+/g, replace: 'AZURE_STORAGE_***=***' },
  // npm registry auth.
  { pattern: /_authToken\s*=\s*[^\s"']+/g, replace: '_authToken=***' },
  { pattern: /\/\/registry\.npmjs\.org\/:_authToken=[^\s"']+/g, replace: '//registry.npmjs.org/:_authToken=***' },
  // Discord webhooks and Telegram bot tokens.
  { pattern: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g, replace: 'https://discord.com/api/webhooks/[REDACTED]' },
  { pattern: /https:\/\/api\.telegram\.org\/bot[0-9]+:[A-Za-z0-9_-]+/g, replace: 'https://api.telegram.org/bot[REDACTED]' },
  // Assignment-style credentials of any name.
  { pattern: /(password|passwd|secret|api[_-]?key|token|credential[a-z]*)\s*[:=]\s*["'][^"']{6,}["']/gi, replace: '$1=[REDACTED]' },
]

/** Replace every secret-shaped substring with a type marker. */
export function redact(text: string): string {
  let out = text
  for (const { pattern, replace } of REDACTIONS) {
    out = out.replace(pattern, replace)
  }
  return out
}

/** Cap a raw snippet and redact it for use as finding evidence. */
export function redactSnippet(text: string, maxChars = 160): string {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  const cut = trimmed.length > maxChars ? `${trimmed.slice(0, maxChars - 1)}…` : trimmed
  return redact(cut)
}
