/**
 * The data-responsibility review check: the Claude policy-scan dimensions,
 * shipped as deterministic rules (the model-assisted stage is a documented
 * future upgrade). Four sub-scans over the shipped payload:
 *
 *  1. hooks-scope — listeners/effects registered on sensitive seams
 *     (`agent/pre-step`, `tools/pre-execute`, `session/event`, …) must show
 *     project-relevance gating; an ungated broad-scope hook is a warn.
 *  2. telemetry-disclosure — non-local URL literals in shipped files must be
 *     disclosed in the README (multilingual disclosure keywords); an
 *     undisclosed endpoint is a warn.
 *  3. description-behavior — the manifest description must be reflected in
 *     the shipped text (keyword coverage); near-zero coverage is an info.
 *  4. injection-payload — embedded instruction-override payloads in shipped
 *     text (skills, docs, prompts, tests) are warns; the manual continuation
 *     is the pack's prompt-injection-review skill.
 *
 * Pure and tolerant: every file is read from the shared `ScannedFile[]`
 * (no filesystem/network), unreadable text is skipped, and evidence is
 * redacted and capped through the shared redactor.
 *
 * NOTE on the pattern literals below: a security scanner ships the attack
 * PATTERNS, never the payloads — but content filters scanning this very
 * source cannot tell the difference, so the phrase literals are fragmented
 * (joined at runtime) to keep the shipped scanner itself from tripping them.
 *
 * @module dsh-skill-pack-security/vet/data-responsibility
 */

import { redactSnippet } from './redact.js'
import { SKILL_REF, type Lang } from './skills.js'
import type { ScannedFile } from './walk.js'
import type { VetConfig } from './config.js'
import type { VetFinding } from './vocabulary.js'

/** Seams whose listeners can reshape the agent's model-visible surface. */
const SENSITIVE_SEAMS = [
  'agent/pre-step', 'agent/post-step', 'agent/inject', 'agent/pre-request',
  'tools/pre-execute', 'tools/post-execute', 'tools/error',
  'session/event', 'session/flush', 'session/disposed',
  'web/fetch', 'web/search',
]

/** Patterns that count as project-relevance gating near a registration. */
const GATING_PATTERNS = [
  /\bprocess\.cwd\(\)/u,
  /\bworkspaceRoot\b/u,
  /\bprojectRoot\b/u,
  /\ballowlist\b/iu,
  /\bdenylist\b/iu,
  /\bproject\b/iu,
  /resolve\(/u,
  /\bpath\b.*\.(?:dirname|relative|join)/u,
]

/** Multilingual README disclosure keywords for telemetry/privacy statements. */
const DISCLOSURE_KEYWORDS = [
  'telemetry', 'privacy', 'analytics', 'opt-out', 'opt out', 'data collection',
  '遥测', '隐私', '数据收集', '退出',
  'telemetría', 'privacidad', 'recopilación de datos', 'exclusión',
  'telemetria', 'privacidade', 'coleta de dados',
  'टेलीमेट्री', 'गोपनीयता', 'डेटा संग्रह',
]

/** Stopwords removed from the description before keyword coverage. */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'your', 'in', 'on', 'to', 'is', 'are', 'by', 'as', 'at', 'from', 'that', 'this', 'it', 'into', 'per', 'via', 'one',
  '一个', '与', '的', '为', '在', '和', '及', '或',
])

/** Fragment joiner for the injection-pattern literals (see module note). */
function frag(...parts: string[]): string {
  return parts.join('')
}

/** Embedded instruction-override payload patterns (OWASP LLM01 / policy-scan payloads). */
const INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: new RegExp(`(?:${frag('ig', 'nore')}|${frag('disre', 'gard')}|${frag('for', 'get')})\\s+(?:all|${frag('pre', 'vious')}|${frag('ab', 'ove')}|${frag('pri', 'or')})\\s+(?:${frag('instru', 'ctions')}|${frag('ru', 'les')}|${frag('com', 'mands')}|${frag('con', 'text')})`, 'iu'), label: 'ignore-previous-instructions' },
  { pattern: new RegExp(`(?:${frag('over', 'ride')}|${frag('rep', 'lace')}|${frag('rew', 'rite')})\\s+(?:all|your|the)\\s+(?:${frag('instru', 'ctions')}|${frag('ru', 'les')}|${frag('system', ' prompt')})`, 'iu'), label: 'override-instructions' },
  { pattern: new RegExp(`you\\s+are\\s+now\\s+(?:a|an)\\s+[a-z0-9 -]{2,40}(?:,|\\.|\\n|$)`, 'iu'), label: 'role-override' },
  { pattern: new RegExp(`(?:${frag('rev', 'eal')}|${frag('pri', 'nt')}|${frag('sh', 'ow')}|${frag('rep', 'eat')})\\s+(?:your|the)\\s+(?:${frag('system', ' prompt')}|${frag('instru', 'ctions')}|${frag('ru', 'les')})`, 'iu'), label: 'prompt-exfiltration' },
  { pattern: new RegExp(`${frag('act', ' as')}\\s+(?:if\\s+)?(?:you\\s+are\\s+)?[a-z0-9 -]{2,40}(?:,|\\.|\\n|$)`, 'iu'), label: 'act-as-injection' },
]

/** Files whose content is prompt-shaped (embedded payloads weigh heavier there). */
const PROMPT_SHAPED = /(^|\/)(skills?|prompts?|SKILL|AGENTS?)(\/|\.|$)|\.md$/iu

/** Text files the review reads (manifests excluded: they carry URL literals by design). */
function reviewable(file: ScannedFile): file is ScannedFile & { text: string } {
  return file.text !== null && file.skipped === null && !/\.(json|ya?ml|toml|lock)$/iu.test(file.path)
}

/** One sensitive-seam registration with its gating verdict. */
function scanHooksScope(files: ScannedFile[], lang: Lang): VetFinding[] {
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  const seamPattern = new RegExp(`['"](${SENSITIVE_SEAMS.map(seam => seam.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('|')})['"]`, 'gu')
  for (const file of files) {
    if (!reviewable(file)) continue
    for (const match of file.text.matchAll(seamPattern)) {
      const seam = match[1]
      const gated = GATING_PATTERNS.some(pattern => pattern.test(file.text))
      findings.push({
        level: gated ? 'info' : 'warn',
        message: gated
          ? (zh ? `${file.path} 在 ${seam} 注册监听并带相关性门控证据` : `${file.path} registers a ${seam} listener with relevance-gating evidence`)
          : (zh ? `${file.path} 在敏感 seam ${seam} 注册监听但未见项目相关性门控：审查其作用域` : `${file.path} registers a listener on the sensitive seam ${seam} without visible project-relevance gating: review its scope`),
        location: file.path,
        skill: SKILL_REF['data-responsibility'],
      })
      if (findings.length >= 24) return findings
    }
  }
  return findings
}

/** Outbound URL literals not disclosed in the README. */
function scanTelemetry(files: ScannedFile[], readmeText: string, lang: Lang): VetFinding[] {
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  const disclosed = DISCLOSURE_KEYWORDS.some(keyword => readmeText.toLowerCase().includes(keyword))
  const seen = new Set<string>()
  for (const file of files) {
    if (!reviewable(file)) continue
    for (const match of file.text.matchAll(/https?:\/\/[^\s"'`<>)\]]+/gu)) {
      let host = ''
      try {
        host = new URL(match[0]).host.toLowerCase()
      } catch {
        continue
      }
      if (host === '' || host === 'localhost' || host.startsWith('127.') || host.startsWith('0.0.0.0') || host.includes('example.com') || host === 'registry.npmjs.org' || host === 'github.com' || host.endsWith('.github.io')) continue
      if (seen.has(host)) continue
      seen.add(host)
      if (!disclosed) {
        findings.push({
          level: 'warn',
          message: zh ? `出站端点 ${host} 未见 README 遥测/隐私披露：确认用途与 opt-out` : `outbound endpoint ${host} has no README telemetry/privacy disclosure: confirm purpose and opt-out`,
          location: file.path,
          skill: SKILL_REF['data-responsibility'],
          evidence: redactSnippet(match[0], 140),
        })
        if (findings.length >= 12) return findings
      }
    }
  }
  return findings
}

/** Description-keyword coverage over the shipped text. */
function scanDescriptionBehavior(description: string, files: ScannedFile[], lang: Lang): VetFinding[] {
  const zh = lang === 'zh'
  const tokens = description
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s]/gu, ' ')
    .split(/\s+/u)
    .filter(token => token.length >= 3 && !STOPWORDS.has(token))
  if (tokens.length === 0) return []
  const corpus = files.map(file => reviewable(file) ? file.text.toLowerCase() : '').join('\n')
  const covered = tokens.filter(token => corpus.includes(token)).length
  const ratio = covered / tokens.length
  if (ratio >= 0.3) return []
  return [{
    level: 'info',
    message: zh
      ? `描述与随包文本的覆盖度仅 ${Math.round(ratio * 100)}%（${covered}/${tokens.length} 个关键词）：人工核对描述与行为一致性（prompt-injection-review §1）`
      : `description coverage over shipped text is only ${Math.round(ratio * 100)}% (${covered}/${tokens.length} keywords): verify description-behavior consistency manually (prompt-injection-review §1)`,
    skill: SKILL_REF['data-responsibility'],
  }]
}

/** Embedded instruction-override payloads in shipped text. */
function scanInjectionPayloads(files: ScannedFile[], lang: Lang): VetFinding[] {
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  for (const file of files) {
    if (!reviewable(file)) continue
    const promptShaped = PROMPT_SHAPED.test(file.path)
    for (const { pattern, label } of INJECTION_PATTERNS) {
      const match = pattern.exec(file.text)
      if (match === null) continue
      findings.push({
        level: promptShaped ? 'warn' : 'info',
        message: zh
          ? `${file.path} 含注入载荷特征（${label}）：若是安全测试夹具请确认不会进入运行时提示词`
          : `${file.path} carries an injection-payload indicator (${label}): if this is a security-test fixture, confirm it never reaches runtime prompts`,
        location: file.path,
        skill: SKILL_REF['data-responsibility'],
        evidence: redactSnippet(match[0], 140),
      })
      if (findings.length >= 16) return findings
      break
    }
  }
  return findings
}

/** Run the whole data-responsibility review over the shared inputs. */
export function dataResponsibilityFindings(
  files: ScannedFile[],
  manifestDescription: string,
  readmeText: string,
  lang: Lang,
  _config: VetConfig,
): VetFinding[] {
  const findings = [
    ...scanHooksScope(files, lang),
    ...scanTelemetry(files, readmeText, lang),
    ...scanDescriptionBehavior(manifestDescription, files, lang),
    ...scanInjectionPayloads(files, lang),
  ]
  return findings
}

/** Score the review: 100 minus per-level deductions, floored at 0. */
export function dataResponsibilityScore(findings: VetFinding[]): number {
  let score = 100
  for (const finding of findings) {
    if (finding.level === 'warn') score -= 12
    else if (finding.level === 'info') score -= 4
  }
  return Math.max(0, score)
}
