/**
 * The eight plugin_vet checks. Every function is pure: it reads the shared
 * inputs and returns one `VetCheck` with redacted, capped findings. No check
 * touches the network or the filesystem — resolution happened upstream in
 * `source.ts`.
 *
 * @module dsh-skill-pack-security/vet/checks
 */

import { buildDependencyTree, unpinnedSpecs, type LockData, type Manifest } from './manifest.js'
import { redactSnippet } from './redact.js'
import { isCommitRef, type GitHubMeta, type NpmMeta, type ResolvedTarget } from './source.js'
import { CHECK_NAME, SKILL_REF, type Lang } from './skills.js'
import type { VetConfig } from './config.js'
import type { ScannedFile } from './walk.js'
import { dataResponsibilityFindings, dataResponsibilityScore } from './data-responsibility.js'
import type { CheckId, VetCheck, VetFinding, VetSbom } from './vocabulary.js'

/** Shared inputs every check reads. */
export interface CheckInputs {
  readonly files: ScannedFile[]
  readonly manifest: Manifest
  readonly lock: LockData
  readonly github: GitHubMeta | null
  readonly npm: NpmMeta | null
  readonly target: ResolvedTarget
  readonly config: VetConfig
  readonly lang: Lang
  /** 40-hex HEAD of a local git target, when readable without spawning git. */
  readonly localHead: string
  readonly now: number
}

/** One check run: the check plus its optional SBOM payload. */
export interface CheckResult {
  readonly check: VetCheck
  readonly sbom?: VetSbom
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

/** Best level across findings: fail > warn > info. */
function worst(findings: VetFinding[]): 'fail' | 'warn' | 'info' | null {
  if (findings.some(f => f.level === 'fail')) return 'fail'
  if (findings.some(f => f.level === 'warn')) return 'warn'
  if (findings.some(f => f.level === 'info')) return 'info'
  return null
}

/** Assemble one check: verdict derived from capped findings. */
function makeCheck(id: CheckId, score: number, findings: VetFinding[], lang: Lang, config: VetConfig, skipReason?: string): VetCheck {
  let capped = findings
  let truncated = false
  if (findings.length > config.maxFindingsPerCheck) {
    capped = findings.slice(0, config.maxFindingsPerCheck)
    truncated = true
  }
  const worstLevel = worst(capped)
  const verdict: VetCheck['verdict'] = skipReason !== undefined ? 'skip' : worstLevel === 'fail' ? 'fail' : worstLevel === 'warn' ? 'warn' : 'pass'
  return {
    id,
    name: CHECK_NAME[lang][id],
    verdict,
    skipReason,
    score: clamp(score),
    findings: capped,
    truncatedFindings: truncated,
    skill: SKILL_REF[id],
  }
}

// --- license -----------------------------------------------------------------

/** Curated SPDX id set (common enough to validate against without a dependency). */
const KNOWN_SPDX = new Set([
  'MIT', 'Apache-2.0', 'Apache-1.1', 'BSD-2-Clause', 'BSD-3-Clause', 'BSD-4-Clause',
  'ISC', 'MPL-2.0', 'MPL-1.1', 'Unlicense', 'CC0-1.0', 'CC-BY-4.0', 'CC-BY-SA-4.0',
  'WTFPL', 'Zlib', '0BSD', 'MIT-0', 'BlueOak-1.0.0', 'PostgreSQL', 'Python-2.0',
  'GPL-2.0-only', 'GPL-2.0-or-later', 'GPL-3.0-only', 'GPL-3.0-or-later',
  'LGPL-2.1-only', 'LGPL-2.1-or-later', 'LGPL-3.0-only', 'LGPL-3.0-or-later',
  'AGPL-3.0-only', 'AGPL-3.0-or-later', 'EPL-2.0', 'EPL-1.0', 'EUPL-1.2',
  'MS-PL', 'MS-RL', 'BSL-1.0', 'OFL-1.1', 'Artistic-2.0', 'CDDL-1.0',
  'SSPL-1.0', 'CPAL-1.0', 'OSL-3.0', 'AFL-3.0', 'GPL-2.0', 'GPL-3.0',
  'LGPL-2.1', 'LGPL-3.0', 'AGPL-3.0', 'EPL-1.0',
])

const UNKNOWN_LICENSE = new Set(['unknown', 'UNKNOWN', 'NOASSERTION', 'none', 'None', 'Custom', 'Other', 'UNLICENSED', 'SEE LICENSE IN LICENSE', 'SEE LICENSE IN FILE'])
const COPYLEFT_PREFIX = /^(GPL|AGPL|SSPL|CPAL)/i
const WEAK_COPYLEFT_PREFIX = /^(LGPL|EUPL|MPL)/i

function licenseFilePaths(files: ScannedFile[]): string[] {
  return files
    .filter(file => /^(licen[cs]e|copying)(\.|$)/i.test(file.path.split('/').pop() ?? ''))
    .map(file => file.path)
}

export function licenseCheck(inputs: CheckInputs): VetCheck {
  const { files, manifest, github, npm, lang, config } = inputs
  const findings: VetFinding[] = []
  const licenseFiles = licenseFilePaths(files)
  const declared = manifest.license !== '' ? manifest.license : (npm?.license ?? '')
  const spdx = github?.licenseSpdx ?? null
  let score = 100
  const zh = lang === 'zh'

  if (licenseFiles.length === 0 && declared === '' && (spdx === null || spdx === '')) {
    findings.push({
      level: 'fail',
      message: zh ? '仓库没有任何许可证：既无 LICENSE 文件，也无 license 字段声明' : 'No license at all: no LICENSE file and no license field',
      skill: SKILL_REF.license,
      evidence: zh ? '无 LICENSE* 文件；package.json 无 license 字段；GitHub 未检测到许可证' : 'no LICENSE* file; no package.json license field; GitHub detected no license',
    })
    score = 0
  } else {
    if (licenseFiles.length === 0) {
      findings.push({
        level: 'warn',
        message: zh ? '未发现 LICENSE 文件（license 字段存在，但仓库内无许可证文本）' : 'No LICENSE file found (a license field exists but no license text is committed)',
        skill: SKILL_REF.license,
      })
      score -= 15
    }
    if (declared !== '') {
      const base = declared.split(/\s+(?:OR|AND|WITH)\s+/i)[0]?.trim() ?? declared
      if (UNKNOWN_LICENSE.has(declared) || UNKNOWN_LICENSE.has(base)) {
        findings.push({
          level: 'fail',
          message: zh ? `license 字段为 "${redactSnippet(declared, 40)}"：缺失/unknown/NOASSERTION 视为无有效许可` : `license field is "${redactSnippet(declared, 40)}": missing/unknown/NOASSERTION counts as no effective license`,
          skill: SKILL_REF.license,
          evidence: redactSnippet(declared, 80),
        })
        score = Math.min(score, 55)
      } else if (!KNOWN_SPDX.has(base) && !declared.includes('SEE LICENSE')) {
        findings.push({
          level: 'warn',
          message: zh ? `license 字段 "${redactSnippet(declared, 40)}" 不是常见 SPDX 标识，需人工确认` : `license field "${redactSnippet(declared, 40)}" is not a common SPDX id — verify manually`,
          skill: SKILL_REF.license,
          evidence: redactSnippet(declared, 80),
        })
        score -= 10
      } else if (COPYLEFT_PREFIX.test(base)) {
        findings.push({
          level: 'warn',
          message: zh ? `强 copyleft 许可证 ${base}：确认用途与依赖链后再引入` : `strong copyleft license ${base}: confirm usage and dependency chain before adopting`,
          skill: SKILL_REF.license,
          evidence: redactSnippet(declared, 80),
        })
        score = Math.min(score, 70)
      } else if (WEAK_COPYLEFT_PREFIX.test(base)) {
        findings.push({
          level: 'info',
          message: zh ? `弱 copyleft 许可证 ${base}：静态/动态链接场景建议人工确认` : `weak copyleft license ${base}: confirm linking scenario manually`,
          skill: SKILL_REF.license,
        })
        score = Math.min(score, 85)
      } else {
        findings.push({
          level: 'info',
          message: zh ? `许可证 ${base} 为常见 SPDX 标识` : `license ${base} is a common SPDX id`,
          skill: SKILL_REF.license,
          evidence: redactSnippet(declared, 80),
        })
      }
    }
    if (spdx !== null && spdx !== '' && declared === '') {
      if (UNKNOWN_LICENSE.has(spdx)) {
        findings.push({
          level: 'fail',
          message: zh ? `GitHub 检测的许可证为 "${spdx}"（无有效许可）` : `GitHub-detected license is "${spdx}" (no effective license)`,
          skill: SKILL_REF.license,
        })
        score = Math.min(score, 55)
      } else if (COPYLEFT_PREFIX.test(spdx)) {
        findings.push({
          level: 'warn',
          message: zh ? `GitHub 检测为强 copyleft 许可证 ${spdx}` : `GitHub detects strong copyleft license ${spdx}`,
          skill: SKILL_REF.license,
        })
        score = Math.min(score, 70)
      }
    }
    if (licenseFiles.length > 0 && score > 90) {
      findings.push({
        level: 'info',
        message: zh ? `发现许可证文件：${licenseFiles.join(', ')}` : `license file present: ${licenseFiles.join(', ')}`,
        skill: SKILL_REF.license,
      })
    }
  }
  return makeCheck('license', score, findings, lang, config)
}

// --- sbom --------------------------------------------------------------------

export function sbomCheck(inputs: CheckInputs): CheckResult {
  const { manifest, lock, config, lang } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 100
  const direct = Object.keys(manifest.dependencies).length
  const dev = Object.keys(manifest.devDependencies).length
  const unpinned = unpinnedSpecs(manifest)

  if (!manifest.present) {
    return {
      check: makeCheck('sbom', 0, [], lang, config, zh ? '无 package.json，无法生成依赖树' : 'no package.json, cannot build a dependency tree'),
      sbom: { lockfile: null, directDependencies: 0, directDevDependencies: 0, packages: [], truncated: false, totalPackages: 0, unpinned: [] },
    }
  }

  if (lock.lockfile === null) {
    if (direct + dev > 20) {
      findings.push({
        level: 'fail',
        message: zh ? `无锁文件且直接依赖 ${direct + dev} 个（> 20）：不可复现安装` : `no lockfile with ${direct + dev} direct dependencies (> 20): unreproducible install`,
        skill: SKILL_REF.sbom,
      })
      score = Math.min(score, 45)
    } else {
      findings.push({
        level: 'warn',
        message: zh ? '仓库未提交锁文件：依赖解析不可复现' : 'no committed lockfile: dependency resolution is not reproducible',
        skill: SKILL_REF.sbom,
      })
      score = Math.min(score, 70)
    }
  } else if (lock.kind === 'pnpm' && !lock.hasIntegrity) {
    findings.push({
      level: 'warn',
      message: zh ? 'pnpm 锁文件缺少 integrity 字段：可能被手改或损坏' : 'pnpm lockfile lacks integrity fields: possibly hand-edited or corrupt',
      skill: SKILL_REF.sbom,
    })
    score -= 15
  }
  if (unpinned.length > 0) {
    findings.push({
      level: 'warn',
      message: zh ? `${unpinned.length} 个直接依赖未锁定精确版本：${unpinned.slice(0, 5).join(', ')}${unpinned.length > 5 ? '…' : ''}` : `${unpinned.length} direct dependencies are not pinned to exact versions: ${unpinned.slice(0, 5).join(', ')}${unpinned.length > 5 ? '…' : ''}`,
      skill: SKILL_REF.sbom,
    })
    score -= 10
  }

  const tree = buildDependencyTree(manifest, lock, config.maxDepNodes)
  const sbom: VetSbom = {
    lockfile: lock.lockfile,
    lockfileVersion: lock.lockfileVersion || undefined,
    directDependencies: direct,
    directDevDependencies: dev,
    packages: tree.packages,
    truncated: tree.truncated,
    totalPackages: tree.total,
    unpinned,
  }
  if (tree.truncated) {
    findings.push({
      level: 'info',
      message: zh ? `依赖树超过 ${config.maxDepNodes} 节点上限被截断` : `dependency tree truncated at the ${config.maxDepNodes}-node cap`,
      skill: SKILL_REF.sbom,
    })
  }
  findings.push({
    level: 'info',
    message: zh ? `依赖树：${tree.packages.length} 个唯一包（直接 ${direct} + dev ${dev}）${lock.lockfile !== null ? `，锁文件 ${lock.lockfile}${lock.lockfileVersion !== '' ? ` v${lock.lockfileVersion}` : ''}` : ''}` : `dependency tree: ${tree.packages.length} unique packages (direct ${direct} + dev ${dev})${lock.lockfile !== null ? `, lockfile ${lock.lockfile}${lock.lockfileVersion !== '' ? ` v${lock.lockfileVersion}` : ''}` : ''}`,
    skill: SKILL_REF.sbom,
  })
  return { check: makeCheck('sbom', score, findings, lang, config), sbom }
}

// --- commit-lock ---------------------------------------------------------------

interface RefHit {
  readonly path: string
  readonly ref: string
  readonly kind: 'manifest-dep' | 'workflow' | 'patch-row' | 'install-doc' | 'install-script'
}

/** Scan the collected files for git/action refs that must be 40-hex commits. */
function collectRefHits(files: ScannedFile[], manifest: Manifest): RefHit[] {
  const hits: RefHit[] = []
  for (const file of files) {
    if (file.text === null) continue
    const lines = file.text.split('\n')
    const isWorkflow = /^\.github\/workflows\/.+\.ya?ml$/.test(file.path)
    const isPatch = /(cordis.*\.(yml|yaml)|\.patch\.ya?ml)$/.test(file.path)
    const isInstallScript = /(^|\/)install\.(ps1|sh|psm1|mjs|js)$/.test(file.path) || /^scripts\/install/.test(file.path)
    const isDoc = /\.md$/i.test(file.path)
    lines.forEach((line, index) => {
      if (isWorkflow) {
        for (const match of line.matchAll(/uses:\s*([^\s@/]+\/[^\s@]+)@([^\s#]+)/g)) {
          if (!isCommitRef(match[2])) {
            hits.push({ path: `${file.path}:${index + 1}`, ref: match[2], kind: 'workflow' })
          }
        }
      }
      if (isPatch || isInstallScript || isDoc) {
        for (const match of line.matchAll(/(?:github:[\w.-]+\/[\w.-]+|git\+https?:\/\/[^\s"'#]+\.git|https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\.git)@([^\s"'|\\]+)/g)) {
          if (!isCommitRef(match[1])) {
            hits.push({ path: `${file.path}:${index + 1}`, ref: match[1], kind: isPatch ? 'patch-row' : isInstallScript ? 'install-script' : 'install-doc' })
          }
        }
      }
    })
  }
  for (const [name, spec] of [...Object.entries(manifest.dependencies), ...Object.entries(manifest.devDependencies), ...Object.entries(manifest.optionalDependencies)]) {
    const match = /(?:git\+https?:\/\/[^\s#]+|github:[^\s#]+)#([^\s"']+)/.exec(spec)
    if (match !== null && !isCommitRef(match[1])) {
      hits.push({ path: `package.json (${name})`, ref: match[1], kind: 'manifest-dep' })
    }
  }
  return hits
}

export function commitLockCheck(inputs: CheckInputs): VetCheck {
  const { files, manifest, github, npm, target, localHead, lang, config } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 100
  const hits = collectRefHits(files, manifest)
  const kindLabel = (kind: RefHit['kind']): string => {
    switch (kind) {
      case 'workflow': return zh ? 'workflow action' : 'workflow action'
      case 'manifest-dep': return zh ? 'git 依赖' : 'git dependency'
      case 'patch-row': return zh ? '挂载清单引用' : 'mount-manifest reference'
      case 'install-doc': return zh ? '安装文档引用' : 'install-doc reference'
      case 'install-script': return zh ? '安装脚本引用' : 'install-script reference'
    }
  }
  for (const hit of hits) {
    const level: 'fail' | 'warn' = hit.kind === 'manifest-dep' || hit.kind === 'patch-row' ? 'fail' : 'warn'
    findings.push({
      level,
      message: zh
        ? `${kindLabel(hit.kind)} "${hit.ref}" 未锁定 40 位 commit（tag/分支可被移动）`
        : `${kindLabel(hit.kind)} "${hit.ref}" is not a pinned 40-hex commit (tags/branches are mutable)`,
      location: hit.path,
      skill: SKILL_REF['commit-lock'],
    })
    score -= level === 'fail' ? 25 : 10
  }

  if (npm !== null && npm.exists) {
    if (npm.gitHead !== '' && isCommitRef(npm.gitHead)) {
      findings.push({
        level: 'info',
        message: zh ? `npm 包带 gitHead 40 位 commit：${npm.gitHead}` : `npm package carries a 40-hex gitHead: ${npm.gitHead}`,
        skill: SKILL_REF['commit-lock'],
      })
    } else {
      findings.push({
        level: 'warn',
        message: zh ? 'npm 包缺少 gitHead（registry 未记录发布 commit），无法核对构建来源' : 'npm package lacks gitHead (registry does not record the publish commit); build origin cannot be verified',
        skill: SKILL_REF['commit-lock'],
      })
      score -= 10
    }
  }
  if (target.kind === 'local-path' && localHead !== '') {
    findings.push({
      level: 'info',
      message: zh ? `本地目标 HEAD 已锁定 40 位 commit：${localHead}` : `local target HEAD is a 40-hex commit: ${localHead}`,
      skill: SKILL_REF['commit-lock'],
    })
  }
  if (target.kind === 'github-repo' && !isCommitRef(target.ref) && github?.exists) {
    findings.push({
      level: 'info',
      message: zh ? `本次扫描按 "${target.ref}"（非 commit）获取；安装时请用 40 位 commit 锁定（DSH git 安装会执行 prepare 脚本）` : `this scan fetched "${target.ref}" (not a commit); pin the install to a 40-hex commit (DSH git installs run prepare scripts)`,
      skill: SKILL_REF['commit-lock'],
    })
  }
  return makeCheck('commit-lock', score, findings, lang, config)
}

// --- install scripts ------------------------------------------------------------

const DOWNLOAD = /(curl|wget|iwr\b|Invoke-WebRequest|Invoke-RestMethod|bitsadmin|certutil|Start-BitsTransfer)\b/i
const NETWORK_CALL = /(curl|wget|\bfetch\s*\(|https?\.(?:get|request)\s*\(|Invoke-WebRequest|Invoke-RestMethod|axios|\bgot\s*\(|undici|prebuild-install|node-pre-gyp|node-gyp-build)/i
const PREBUILD_FAMILY = /(prebuild-install|node-pre-gyp|node-gyp-build)/i
const EXEC = /(eval\b|\bexec\b|\bexecSync\b|\bsh\b|\bbash\b|\bnode\b|powershell|python3?|\bperl\b|\bruby\b|\bcmd\b|\bchmod\b|Invoke-Expression|\biex\b|spawn\s*\(|spawnSync|execFile|child_process)/i
const ENCODED = /(base64\s+(-d|--decode|-D)\b|FromBase64String|\[Convert\]::FromBase64String|atob\(|Buffer\.from\([^)]*base64)/i
const CRED_TOUCH = /(\.ssh\b|id_rsa|id_ed25519|\.npmrc|\.gitconfig|\.aws\b|credentials|known_hosts)/i
const GLOBAL_WRITE = /(\/etc\/profile|\.zshrc|\.bashrc|\.bash_profile|\.profile\b|%APPDATA%|HKCU\\Software|HKEY_CURRENT_USER)/i
const OUTPUT_DOWNLOAD = /(-o\s+|--output\s+|-O\s+|OutFile\s+)/i
const LIFECYCLE_SCRIPTS = ['preinstall', 'install', 'postinstall', 'prepare']

/** Build tools whose download/exec install scripts are ecosystem convention (manual verdict per skill). */
const KNOWN_BUILD_TOOLS = new Set(['esbuild', '@esbuild/win32-x64', 'sharp', 'core-js', 'node-gyp', 'puppeteer', 'cypress', 'playwright', 'electron', 'swc', '@swc/core'])

export function installScriptsCheck(inputs: CheckInputs): VetCheck {
  const { files, manifest, npm, config, lang } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 100
  const scripts = manifest.present ? manifest.scripts : (npm?.scripts ?? {})
  const knownBuildTool = KNOWN_BUILD_TOOLS.has(manifest.name) || (npm !== null && KNOWN_BUILD_TOOLS.has(npm.name))
  let checked = 0
  for (const hook of LIFECYCLE_SCRIPTS) {
    const body = scripts[hook]
    if (body === undefined || body === '') continue
    checked += 1
    const location = `${manifest.present ? 'package.json' : 'npm registry'} scripts.${hook}`
    const hasDownload = DOWNLOAD.test(body)
    const hasExec = EXEC.test(body)
    const hasEncoded = ENCODED.test(body)
    const hasCred = CRED_TOUCH.test(body)
    const hasGlobal = GLOBAL_WRITE.test(body)
    const hasOutput = OUTPUT_DOWNLOAD.test(body)
    const plainHttp = /http:\/\/(?!localhost|127\.0\.0\.1)/i.test(body)
    let level: 'fail' | 'warn' | 'info' | null = null
    let reason = ''
    let evidence = redactSnippet(body)
    let findingLocation = location
    if (hasEncoded && hasExec) {
      level = 'fail'
      reason = zh ? '混淆载荷（base64/hex 解码后执行）' : 'obfuscated payload (decoded then executed)'
    } else if (hasCred || hasGlobal) {
      level = 'fail'
      reason = zh ? '触碰用户凭据或全局配置' : 'touches user credentials or global config'
    } else if (hasDownload && hasExec) {
      level = knownBuildTool ? 'warn' : 'fail'
      reason = zh ? '下载可执行内容并执行' : 'downloads executable content and runs it'
      if (knownBuildTool) {
        reason += zh ? '（生态惯例的构建工具安装脚本——按 supply-chain-review §1 放行判据人工确认）' : ' (build-tool install script, an ecosystem convention — confirm with the supply-chain-review §1 allowlist criteria)'
      }
    } else if (hasDownload && hasOutput) {
      level = 'warn'
      reason = zh ? '安装期下载二进制（未见执行，需确认用途）' : 'downloads a binary at install time (no exec seen; confirm purpose)'
    } else if (PREBUILD_FAMILY.test(body)) {
      level = 'warn'
      reason = zh ? '安装期下载/构建原生二进制（prebuild 生态惯例——按 supply-chain-review §1 放行判据人工确认）' : 'downloads/builds a native binary at install time (prebuild ecosystem convention — confirm with the supply-chain-review §1 allowlist criteria)'
    } else if (plainHttp) {
      level = 'warn'
      reason = zh ? '安装脚本使用明文 HTTP 下载' : 'install script downloads over plain HTTP'
    } else {
      // Follow `node install.mjs`-style scripts into the referenced file and
      // scan its real content (mirrors supply-chain-review §1: unpack and
      // read the actual script, never trust the manifest alone).
      const referenced = /(?:^|\s)(?:node|npm exec|npx)\s+['"]?([^\s"'`]+\.(?:mjs|js|cjs))['"]?/.exec(body)
      if (referenced !== null) {
        const scriptFile = files.find(file => file.path.endsWith(referenced[1]) || file.path === referenced[1])
        if (scriptFile !== undefined && scriptFile.text !== null && scriptFile.skipped === null) {
          const fileHasNetwork = NETWORK_CALL.test(scriptFile.text)
          const fileHasExec = EXEC.test(scriptFile.text)
          const filePrebuildOnly = PREBUILD_FAMILY.test(scriptFile.text) && !/(curl|wget|\bfetch\s*\(|https?\.(?:get|request)\s*\(|axios|\bgot\s*\(|undici)/i.test(scriptFile.text)
          if (fileHasNetwork && fileHasExec) {
            level = (knownBuildTool || filePrebuildOnly) ? 'warn' : 'fail'
            reason = zh ? `被调用的 ${referenced[1]} 下载内容并执行` : `the invoked ${referenced[1]} downloads content and executes it`
            if (knownBuildTool || filePrebuildOnly) {
              reason += zh ? '（生态惯例的构建工具安装脚本——按 supply-chain-review §1 放行判据人工确认）' : ' (build-tool install script, an ecosystem convention — confirm with the supply-chain-review §1 allowlist criteria)'
            }
          } else if (fileHasNetwork) {
            level = 'warn'
            reason = zh ? `被调用的 ${referenced[1]} 在安装期发起网络下载` : `the invoked ${referenced[1]} performs network downloads at install time`
          }
          findingLocation = scriptFile.path
          evidence = redactSnippet(scriptFile.text)
        }
      }
    }
    if (level !== null) {
      findings.push({ level, message: `${hook}: ${reason}`, location: findingLocation, skill: SKILL_REF['install-scripts'], evidence })
      score -= level === 'fail' ? 30 : 15
    } else {
      findings.push({ level: 'info', message: zh ? `${hook} 脚本存在但未命中危险特征` : `${hook} script present, no dangerous pattern matched`, location, skill: SKILL_REF['install-scripts'] })
    }
  }
  if (checked === 0) {
    findings.push({ level: 'info', message: zh ? '无 preinstall/install/postinstall/prepare 生命周期脚本' : 'no preinstall/install/postinstall/prepare lifecycle scripts', skill: SKILL_REF['install-scripts'] })
  }
  return makeCheck('install-scripts', score, findings, lang, config)
}

// --- network exfiltration ---------------------------------------------------------

const EXFIL_DOMAINS = [
  'webhook.site', 'requestbin.net', 'requestcatcher.com', 'beeceptor.com', 'ngrok.io', 'ngrok-free.app',
  'localhost.run', 'oast.fun', 'oastify.com', 'oast.pro', 'interact.sh', 'burpcollaborator.net',
  'pipedream.net', 'pastebin.com', 'transfer.sh', 'file.io', '0x0.st', 'rentry.co', 'canarytokens.com',
  'discord.com/api/webhooks', 'api.telegram.org/bot',
]
const CHEAP_TLD = /\.(tk|ml|ga|cf|gq|top|xyz|icu|rest|quest)$/i
const SCRIPT_EXTS = /\.(js|mjs|cjs|ts|mts|cts|jsx|tsx|sh|bash|ps1|psm1|py|rb|pl|lua)$/i

interface UrlHit {
  readonly host: string
  readonly url: string
  readonly path: string
  readonly isScript: boolean
}

function collectUrlHits(files: ScannedFile[], maxFiles: number): { hits: UrlHit[]; scanned: number } {
  const hits: UrlHit[] = []
  let scanned = 0
  const cap = maxFiles * 4
  for (const file of files) {
    if (file.text === null || file.skipped !== null) continue
    // package.json holds lifecycle-script bodies: executable context, treated
    // like a script file for exfiltration ranking.
    const isScript = SCRIPT_EXTS.test(file.path) || file.path === 'package.json'
    const isManifest = /\.(json|yml|yaml|toml)$/.test(file.path)
    if (!isScript && !isManifest) continue
    scanned += 1
    const lines = file.text.split('\n')
    for (let index = 0; index < lines.length; index += 1) {
      for (const match of lines[index].matchAll(/https?:\/\/[^\s"'`<>)\]]+/g)) {
        const raw = match[0]
        let host = ''
        try {
          host = new URL(raw).host
        } catch {
          continue
        }
        hits.push({ host, url: raw, path: `${file.path}:${index + 1}`, isScript })
        if (hits.length >= cap) return { hits, scanned }
      }
    }
  }
  return { hits, scanned }
}

export function networkExfilCheck(inputs: CheckInputs): VetCheck {
  const { files, config, lang } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 100
  const { hits, scanned } = collectUrlHits(files, config.maxFiles)
  const seenDomains = new Set<string>()
  for (const hit of hits) {
    if (seenDomains.has(hit.host)) continue
    let level: 'fail' | 'warn' | 'info' | null = null
    let reason = ''
    if (EXFIL_DOMAINS.some(domain => hit.host === domain || hit.host.endsWith(`.${domain}`))) {
      level = hit.isScript ? 'fail' : 'warn'
      reason = zh ? '回传/接收器域名（数据外发特征）' : 'exfil/receiver domain (data-exfiltration indicator)'
    } else if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hit.host) || hit.host.includes(':')) {
      level = hit.isScript ? 'warn' : 'info'
      reason = zh ? '直连 IP 地址的 URL' : 'URL pointing at a raw IP address'
    } else if (CHEAP_TLD.test(hit.host)) {
      level = hit.isScript ? 'warn' : 'info'
      reason = zh ? '可疑免费 TLD 域名' : 'suspicious free-TLD domain'
    } else {
      continue
    }
    seenDomains.add(hit.host)
    findings.push({
      level,
      message: zh ? `${reason}：${hit.host}` : `${reason}: ${hit.host}`,
      location: hit.path,
      skill: SKILL_REF['network-exfil'],
      evidence: redactSnippet(hit.url, 140),
    })
    score -= level === 'fail' ? 40 : level === 'warn' ? 15 : 5
  }
  if (findings.length === 0) {
    findings.push({
      level: 'info',
      message: zh ? `扫描 ${scanned} 个脚本/清单文件，未发现回传域名特征` : `scanned ${scanned} script/manifest files, no exfiltration-domain indicators`,
      skill: SKILL_REF['network-exfil'],
    })
  }
  return makeCheck('network-exfil', score, findings, lang, config)
}

// --- obfuscation -------------------------------------------------------------------

const BASE64_BLOB = /(?:atob|FromBase64String|\[Convert\]::FromBase64String|Buffer\.from)\s*\(\s*['"][A-Za-z0-9+/]{40,}={0,2}['"]|[A-Za-z0-9+/]{100,}={0,2}/g
const HEX_BLOB = /0x[0-9a-fA-F]{32,}|(?:\\x[0-9a-fA-F]{2}){20,}/g
const FROM_CHAR_CODE = /String\.fromCharCode\([^)]*(?:,[^)]*){8,}\)/g
const EVAL_CALL = /\beval\s*\(|(?:new\s+)?Function\s*\(/g
const TEST_PATH = /(test|spec|fixture|__tests__)/i

export function obfuscationCheck(inputs: CheckInputs): VetCheck {
  const { files, config, lang } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 100
  let scanned = 0
  for (const file of files) {
    if (file.text === null || file.skipped !== null || !SCRIPT_EXTS.test(file.path)) continue
    scanned += 1
    const isTest = TEST_PATH.test(file.path)
    const text = file.text
    const evalHits = [...text.matchAll(EVAL_CALL)].length
    const base64Hits = [...text.matchAll(BASE64_BLOB)].length
    const hexHits = [...text.matchAll(HEX_BLOB)].length
    const charCodeHits = [...text.matchAll(FROM_CHAR_CODE)].length
    const minified = text.split('\n').filter(line => line.length > 600).length
    if (evalHits > 0 && (base64Hits > 0 || hexHits > 0)) {
      findings.push({
        level: isTest ? 'warn' : 'fail',
        message: zh ? `动态求值 + 编码载荷（eval/Function ${evalHits} 处，编码块 ${base64Hits + hexHits} 处）` : `dynamic eval + encoded payload (eval/Function ×${evalHits}, encoded blobs ×${base64Hits + hexHits})`,
        location: file.path,
        skill: SKILL_REF.obfuscation,
      })
      score -= isTest ? 20 : 35
    } else if (base64Hits > 0 || hexHits > 0 || charCodeHits > 0) {
      findings.push({
        level: isTest ? 'info' : 'warn',
        message: zh ? `编码载荷特征（base64/hex/fromCharCode 块 ${base64Hits + hexHits + charCodeHits} 处）` : `encoded-payload indicators (base64/hex/fromCharCode blobs ×${base64Hits + hexHits + charCodeHits})`,
        location: file.path,
        skill: SKILL_REF.obfuscation,
      })
      score -= isTest ? 5 : 15
    } else if (minified > 0) {
      findings.push({
        level: 'info',
        message: zh ? `疑似压缩/混淆代码（${minified} 个超长高密度行）` : `possibly minified/obfuscated code (${minified} very long dense lines)`,
        location: file.path,
        skill: SKILL_REF.obfuscation,
      })
      score -= 5
    }
    if (findings.length >= config.maxFindingsPerCheck * 2) break
  }
  if (findings.length === 0) {
    findings.push({
      level: 'info',
      message: zh ? `扫描 ${scanned} 个代码文件，未发现混淆特征` : `scanned ${scanned} code files, no obfuscation indicators`,
      skill: SKILL_REF.obfuscation,
    })
  }
  return makeCheck('obfuscation', score, findings, lang, config)
}

// --- source trust signals -------------------------------------------------------------

export function sourceCheck(inputs: CheckInputs): VetCheck {
  const { files, manifest, github, npm, target, lang, config } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 100
  const has = (re: RegExp): boolean => files.some(file => re.test(file.path))

  if (manifest.present && manifest.repository !== '') {
    const repoPath = manifest.repository.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^https?:\/\/github\.com\//, '').replace(/^ssh:\/\/git@github\.com\//, '')
    if (target.kind === 'github-repo' && repoPath !== '' && repoPath.toLowerCase() !== target.resolved.toLowerCase()) {
      findings.push({
        level: 'warn',
        message: zh ? `package.json repository（${repoPath}）与扫描目标（${target.resolved}）不一致` : `package.json repository (${repoPath}) does not match the scan target (${target.resolved})`,
        skill: SKILL_REF.source,
      })
      score -= 15
    }
  } else if (manifest.present) {
    findings.push({
      level: 'fail',
      message: zh ? 'package.json 未声明 repository 字段：无法核对发布来源' : 'package.json declares no repository: publish origin cannot be verified',
      skill: SKILL_REF.source,
    })
    score -= 25
  }

  if (!has(/^readme(\.|$)/i)) {
    findings.push({ level: 'warn', message: zh ? '无 README 文件' : 'no README file', skill: SKILL_REF.source })
    score -= 10
  }
  if (!has(/^\.github\/workflows\/.+\.ya?ml$/)) {
    findings.push({ level: 'warn', message: zh ? '无 CI 工作流（缺少自动化构建/测试证据）' : 'no CI workflows (no automated build/test evidence)', skill: SKILL_REF.source })
    score -= 10
  }
  if (manifest.present && has(/(cordis\.patch\.yml|cordis\.yml|\.patch\.ya?ml)$/)) {
    findings.push({ level: 'info', message: zh ? '含 DSH 挂载清单（cordis patch）' : 'carries a DSH mount manifest (cordis patch)', skill: SKILL_REF.source })
  }
  if (npm !== null && npm.exists) {
    if (npm.gitHead !== '' && isCommitRef(npm.gitHead)) {
      findings.push({ level: 'info', message: zh ? `发布 commit：${npm.gitHead}` : `publish commit: ${npm.gitHead}`, skill: SKILL_REF.source })
    } else {
      findings.push({ level: 'warn', message: zh ? 'npm 包未记录 gitHead（registry 侧无发布 commit 证据）' : 'npm package records no gitHead (no publish-commit evidence on the registry)', skill: SKILL_REF.source })
      score -= 10
    }
    if (npm.distIntegrity === '') {
      findings.push({ level: 'warn', message: zh ? 'npm 包缺少 dist.integrity' : 'npm package lacks dist.integrity', skill: SKILL_REF.source })
      score -= 10
    }
  }
  if (findings.length === 0) {
    findings.push({ level: 'info', message: zh ? '来源信号齐全（repository/README/CI 可核对）' : 'source signals complete (repository/README/CI verifiable)', skill: SKILL_REF.source })
  }
  return makeCheck('source', score, findings, lang, config)
}

// --- maintenance ----------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000

function ageDays(iso: string, now: number): number | null {
  if (iso === '') return null
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return null
  return Math.floor((now - time) / DAY)
}

export function maintenanceCheck(inputs: CheckInputs): VetCheck {
  const { github, npm, target, lang, config, now } = inputs
  const zh = lang === 'zh'
  const findings: VetFinding[] = []
  let score = 60
  if (github !== null && github.exists) {
    const pushed = ageDays(github.pushedAt, now)
    const created = ageDays(github.createdAt, now)
    if (github.rateLimited) {
      findings.push({ level: 'warn', message: zh ? 'GitHub API 限流：pushed_at/archived 等维护数据不可用（文件扫描不受影响），维护状态按未知计' : 'GitHub API rate-limited: pushed_at/archived maintenance data unavailable (file scan unaffected); maintenance treated as unknown', skill: SKILL_REF.maintenance })
      score = 60
    } else if (github.archived) {
      findings.push({ level: 'fail', message: zh ? '仓库已被归档（archived）：不再维护' : 'repository is archived: unmaintained', skill: SKILL_REF.maintenance })
      score = 5
    } else if (pushed === null) {
      score = 60
      findings.push({ level: 'warn', message: zh ? '无 pushed_at 数据，维护状态未知' : 'no pushed_at data; maintenance status unknown', skill: SKILL_REF.maintenance })
    } else if (pushed > 730) {
      findings.push({ level: 'fail', message: zh ? `最后推送距今 ${pushed} 天（> 2 年）：基本停止维护` : `last push ${pushed} days ago (> 2 years): effectively unmaintained`, skill: SKILL_REF.maintenance })
      score = 15
    } else if (pushed > 365) {
      findings.push({ level: 'warn', message: zh ? `最后推送距今 ${pushed} 天（> 1 年）` : `last push ${pushed} days ago (> 1 year)`, skill: SKILL_REF.maintenance })
      score = 40
    } else if (pushed > 180) {
      findings.push({ level: 'info', message: zh ? `最后推送距今 ${pushed} 天（> 半年）` : `last push ${pushed} days ago (> 6 months)`, skill: SKILL_REF.maintenance })
      score = 70
    } else if (pushed > 90) {
      findings.push({ level: 'info', message: zh ? `最后推送距今 ${pushed} 天` : `last push ${pushed} days ago`, skill: SKILL_REF.maintenance })
      score = 80
    } else {
      findings.push({ level: 'info', message: zh ? `最近 ${pushed} 天内有推送，维护活跃` : `pushed within the last ${pushed} days: actively maintained`, skill: SKILL_REF.maintenance })
      score = 92
    }
    if (created !== null && created < 30 && github.stars > 50) {
      findings.push({
        level: 'warn',
        message: zh ? `仓库创建不足 30 天但已有 ${github.stars} stars：结合 supply-chain-review §2 做 typosquat/刷星判定` : `repository created < 30 days ago yet has ${github.stars} stars: run the supply-chain-review §2 typosquat/star-bomb check`,
        skill: 'supply-chain-review §2',
      })
      score -= 10
    }
  } else if (npm !== null && npm.exists) {
    if (npm.deprecated !== '') {
      findings.push({ level: 'fail', message: zh ? 'npm 包已标记 deprecated' : 'npm package is deprecated', skill: SKILL_REF.maintenance })
      score = 10
    } else {
      findings.push({ level: 'info', message: zh ? 'npm 包未标记 deprecated；修改时间未拉取（维护状态按未知计）' : 'npm package is not deprecated; modified time was not fetched (maintenance treated as unknown)', skill: SKILL_REF.maintenance })
      score = 60
    }
  } else {
    findings.push({ level: 'info', message: zh ? `本地目标（${target.resolved}）无远程维护信息，按未知计` : `local target (${target.resolved}) has no remote maintenance metadata; treated as unknown`, skill: SKILL_REF.maintenance })
    score = 60
  }
  return makeCheck('maintenance', score, findings, lang, config)
}

// --- data-responsibility ------------------------------------------------------

/** README text across the shipped files (the telemetry-disclosure corpus). */
function readmeTextOf(files: ScannedFile[]): string {
  return files
    .filter(file => file.text !== null && /^readme(\.|$)/i.test(file.path.split('/').pop() ?? ''))
    .map(file => file.text)
    .join('\n')
}

export function dataResponsibilityCheck(inputs: CheckInputs): VetCheck {
  const { files, manifest, lang, config } = inputs
  const findings = dataResponsibilityFindings(files, manifest.description, readmeTextOf(files), lang, config)
  if (findings.length === 0) {
    return makeCheck('data-responsibility', 100, [{
      level: 'info',
      message: lang === 'zh' ? '随包文本未发现无门控敏感监听、未披露出站端点或注入载荷特征' : 'no ungated sensitive-seam listeners, undisclosed outbound endpoints, or injection-payload indicators in shipped text',
      skill: SKILL_REF['data-responsibility'],
    }], lang, config)
  }
  return makeCheck('data-responsibility', dataResponsibilityScore(findings), findings, lang, config)
}

// --- runner ----------------------------------------------------------------------------

/** Run the requested checks over shared inputs. */
export function runChecks(inputs: CheckInputs, ids: readonly CheckId[]): CheckResult[] {
  const results: CheckResult[] = []
  for (const id of ids) {
    switch (id) {
      case 'license': results.push({ check: licenseCheck(inputs) }); break
      case 'sbom': results.push(sbomCheck(inputs)); break
      case 'commit-lock': results.push({ check: commitLockCheck(inputs) }); break
      case 'install-scripts': results.push({ check: installScriptsCheck(inputs) }); break
      case 'network-exfil': results.push({ check: networkExfilCheck(inputs) }); break
      case 'obfuscation': results.push({ check: obfuscationCheck(inputs) }); break
      case 'source': results.push({ check: sourceCheck(inputs) }); break
      case 'maintenance': results.push({ check: maintenanceCheck(inputs) }); break
      case 'data-responsibility': results.push({ check: dataResponsibilityCheck(inputs) }); break
    }
  }
  return results
}
