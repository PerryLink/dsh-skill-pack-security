/**
 * Skill cross-references and report-language strings for plugin_vet.
 *
 * Every check cites the pack skill (and section) that continues its subject
 * as a manual audit — "skill 教流程，插件自动执行". Skill names are identical
 * in the zh/en editions, so the reference is language-neutral.
 *
 * @module dsh-skill-pack-security/vet/skills
 */

import type { CheckId, Dimension } from './vocabulary.js'

export type Lang = 'zh' | 'en'

/** check id → pack skill + section (the manual deep-dive continuation). */
export const SKILL_REF: Record<CheckId, string> = {
  license: 'dependency-audit §3',
  sbom: 'dependency-audit §7',
  'commit-lock': 'supply-chain-review §3',
  'install-scripts': 'supply-chain-review §1',
  'network-exfil': 'dependency-audit §4.4',
  obfuscation: 'supply-chain-review §1',
  source: 'dependency-audit §4.3',
  maintenance: 'security-audit §3',
}

/** check id → human-readable check name per language. */
export const CHECK_NAME: Record<Lang, Record<CheckId, string>> = {
  zh: {
    license: '许可证扫描',
    sbom: 'SBOM 依赖树',
    'commit-lock': 'commit 锁定校验',
    'install-scripts': 'install 脚本检查',
    'network-exfil': '网络回传检测',
    obfuscation: '混淆代码检测',
    source: '来源可信信号',
    maintenance: '维护状态',
  },
  en: {
    license: 'License scan',
    sbom: 'SBOM dependency tree',
    'commit-lock': 'Commit lock verification',
    'install-scripts': 'Install script checks',
    'network-exfil': 'Network exfiltration scan',
    obfuscation: 'Obfuscation scan',
    source: 'Source trust signals',
    maintenance: 'Maintenance status',
  },
}

/** dimension → label per language. */
export const DIMENSION_LABEL: Record<Lang, Record<Dimension, string>> = {
  zh: {
    license: '许可证',
    source: '来源',
    dependencies: '依赖',
    'build-scripts': '构建脚本',
    maintenance: '维护状态',
  },
  en: {
    license: 'License',
    source: 'Source',
    dependencies: 'Dependencies',
    'build-scripts': 'Build scripts',
    maintenance: 'Maintenance',
  },
}

/** Messages shared by checks and the report renderer. */
export const T = {
  zh: {
    pass: '通过',
    warn: '警告',
    fail: '失败',
    skip: '跳过',
    verdictPass: 'PASS',
    verdictWarn: 'WARN',
    verdictFail: 'FAIL',
    gateDenyTitle: '门禁 DENY：此插件未通过供应链检查，安装已被策略拒绝',
    gateDenyBody: '请加载 supply-chain-review / dependency-audit 技能人工深审；或由可信维护者修改门禁策略后重试。',
    gateWarnTitle: '门禁警告：plugin_vet 结果为 FAIL，强烈建议停止安装',
    gateWarnBody: '默认策略 warn 不阻断。继续安装前请按下方 skill 引用人工深审，确认风险可接受。',
    followup: '人工深审建议（加载对应技能继续）',
    budget: '扫描预算',
    budgetTruncated: '扫描被预算截断：结果不完整',
    offline: '离线/受限',
    evidence: '证据',
  },
  en: {
    pass: 'pass',
    warn: 'warn',
    fail: 'fail',
    skip: 'skip',
    verdictPass: 'PASS',
    verdictWarn: 'WARN',
    verdictFail: 'FAIL',
    gateDenyTitle: 'Gate DENY: this plugin failed the supply-chain checks; installation is blocked by policy',
    gateDenyBody: 'Load the supply-chain-review / dependency-audit skills for a manual deep-dive, or have a trusted maintainer change the gate policy and retry.',
    gateWarnTitle: 'Gate warning: plugin_vet returned FAIL — installation is strongly discouraged',
    gateWarnBody: 'The default policy is warn (non-blocking). Before continuing the install, follow the skill references below for a manual review and confirm the risk is acceptable.',
    followup: 'Manual deep-dive (load these skills to continue)',
    budget: 'Scan budget',
    budgetTruncated: 'Scan truncated by budget: results are incomplete',
    offline: 'Offline/limited',
    evidence: 'Evidence',
  },
} as const
