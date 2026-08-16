/**
 * Model-facing renderers for the plugin_vet report: the canonical JSON value
 * becomes a compact markdown report (render), a pending-call card
 * (presentCall), and a completed gate card (presentResult). Everything is
 * pure and capped — no secrets (the engine redacts before this layer), no
 * unbounded trees.
 *
 * @module dsh-skill-pack-security/vet/report
 */

import { DIMENSION_LABEL, T, type Lang } from './skills.js'
import type { VetCheck, VetReport, VetScores } from './vocabulary.js'

const TREE_CAP = 40
const FINDING_CAP = 6

function verdictMark(verdict: string): string {
  switch (verdict) {
    case 'fail': return '🔴'
    case 'warn': return '🟡'
    case 'pass': return '🟢'
    default: return '⚪'
  }
}

/** Five-dimension score line. */
export function scoresLine(scores: VetScores, lang: Lang): string {
  const dims = ['license', 'source', 'dependencies', 'build-scripts', 'maintenance'] as const
  return dims.map(dim => `${DIMENSION_LABEL[lang][dim]} ${scores[dim]}/100`).join(' · ') + ` · ${lang === 'zh' ? '总分' : 'overall'} ${scores.overall}/100`
}

/** One check section. */
function renderCheck(check: VetCheck, lang: Lang): string {
  const t = T[lang]
  const head = `- ${verdictMark(check.verdict)} [${check.verdict.toUpperCase()}] ${check.name} — ${lang === 'zh' ? '深审技能' : 'deep-dive skill'}: \`${check.skill}\``
  const lines = [head]
  if (check.verdict === 'skip' && check.skipReason !== undefined) {
    lines.push(`  - ⚪ ${t.skip}: ${check.skipReason}`)
    return lines.join('\n')
  }
  for (const finding of check.findings.slice(0, FINDING_CAP)) {
    const loc = finding.location !== undefined ? ` \`${finding.location}\`` : ''
    const evidence = finding.evidence !== undefined ? ` — ${t.evidence}: \`${finding.evidence}\`` : ''
    lines.push(`  - ${verdictMark(finding.level)} ${finding.message}${loc}${evidence}`)
  }
  if (check.truncatedFindings) lines.push(`  - … (${lang === 'zh' ? '其余发现被截断' : 'further findings truncated'})`)
  return lines.join('\n')
}

/** Render the canonical report as model-facing markdown. */
export function renderReport(report: VetReport, lang: Lang): string {
  const t = T[lang]
  const targetLabel = report.target.kind === 'npm-package' ? report.target.resolved : report.target.kind === 'local-path' ? report.target.resolved : `${report.target.resolved}@${report.target.ref}`
  const parts: string[] = []
  parts.push(`## plugin_vet ${report.target.raw}`)
  parts.push('')
  parts.push(`${verdictMark(report.verdict)} **${lang === 'zh' ? '结论' : 'Verdict'}: ${report.verdict.toUpperCase()}** — ${scoresLine(report.scores, lang)}`)
  if (report.budget.truncated) parts.push(`⚠️ ${t.budgetTruncated}: ${report.budget.truncatedReason ?? ''}`)
  parts.push('')
  if (report.gate.applied) {
    if (report.gate.blocked) {
      parts.push(`🛑 **${t.gateDenyTitle}**`)
      parts.push(t.gateDenyBody)
    } else {
      parts.push(`⚠️ **${t.gateWarnTitle}**`)
      parts.push(t.gateWarnBody)
    }
    parts.push('')
  }
  parts.push(`${lang === 'zh' ? '扫描对象' : 'Target'}: ${targetLabel} · ${report.fetchedAt}`)
  parts.push('')
  for (const check of report.checks) {
    parts.push(renderCheck(check, lang))
  }
  parts.push('')
  parts.push(`**SBOM** (${report.sbom.lockfile ?? (lang === 'zh' ? '无锁文件' : 'no lockfile')}) — ${lang === 'zh' ? '直接依赖' : 'direct'} ${report.sbom.directDependencies} + dev ${report.sbom.directDevDependencies}, ${lang === 'zh' ? '唯一包' : 'unique packages'} ${report.sbom.packages.length}${report.sbom.totalPackages > report.sbom.packages.length ? ` (${lang === 'zh' ? '总计' : 'total'} ${report.sbom.totalPackages})` : ''}`)
  if (report.sbom.packages.length > 0) {
    const tree = report.sbom.packages.slice(0, TREE_CAP).map(pkg => `${'  '.repeat(Math.min(pkg.depth, 8))}${pkg.name}@${pkg.version}`).join('\n')
    parts.push('```text')
    parts.push(tree)
    parts.push('```')
    if (report.sbom.packages.length > TREE_CAP) parts.push(`… (${lang === 'zh' ? '树被截断至' : 'tree capped at'} ${TREE_CAP} ${lang === 'zh' ? '行' : 'lines'})`)
  }
  parts.push('')
  parts.push(`${lang === 'zh' ? '扫描预算' : 'Scan budget'}: ${report.budget.filesScanned} ${lang === 'zh' ? '个文件' : 'files'} · ${report.budget.bytesScanned} bytes · ${report.budget.filesSkipped} ${lang === 'zh' ? '跳过' : 'skipped'}${report.budget.truncated ? ` · ⚠️ ${t.budgetTruncated}` : ''}`)
  parts.push('')
  parts.push(`**${t.followup}**: ${report.followupSkills.map(name => `\`${name}\``).join(', ')}`)
  return parts.join('\n')
}

/** Short gate summary for the completed card (≤ a few lines). */
export function gateSummary(report: VetReport, lang: Lang): string {
  const t = T[lang]
  if (report.gate.blocked) return `🛑 ${t.gateDenyTitle}\n${t.gateDenyBody}`
  if (report.gate.applied) return `⚠️ ${t.gateWarnTitle}\n${t.gateWarnBody}`
  return ''
}
