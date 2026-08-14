#Requires -Version 5.1
<#
.SYNOPSIS
  Install or uninstall dsh-skill-pack-security skills in a DSH skill root.
.DESCRIPTION
  Copies skills/* (zh, default) or skills-en/* (-Language en) — one directory
  bundle per skill — into one of the four roots the official
  dsh-skill-filesystem provider scans. Lower rank wins same-name conflicts
  within a layer.
  Ranks: project-dsh 100 < project-agents 200 < user-dsh 400 < user-agents 500
  (custom 300 is plugin-registered, not a disk root).
  Install records a manifest (<root>/skills/.dsh-skill-pack-security.manifest)
  so -Uninstall removes exactly what this pack installed.
.PARAMETER Target
  project-agents | project-dsh | user-dsh | user-agents (default: user-agents)
.PARAMETER Language
  zh | en — which language edition to install (default: zh)
.PARAMETER Uninstall
  Remove only the skill directories recorded by this pack's manifest.
.PARAMETER DryRun
  Print what would happen without changing anything.
.PARAMETER Force
  Replace existing same-name skill directories that have no manifest from
  this pack (default: refuse and list them).
#>
param(
  [ValidateSet('project-agents', 'project-dsh', 'user-dsh', 'user-agents')]
  [string] $Target = 'user-agents',
  [ValidateSet('zh', 'en')]
  [string] $Language = 'zh',
  [switch] $Uninstall,
  [switch] $DryRun,
  [switch] $Force
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = if ($Language -eq 'en') { Join-Path $here '..\skills-en' } else { Join-Path $here '..\skills' }
$packVersion = (Get-Content (Join-Path $here '..\VERSION') -Raw).Trim()

function Get-GitRoot {
  $out = & git rev-parse --show-toplevel 2>$null
  if ($LASTEXITCODE -eq 0) { return ($out -join '').Trim() }
  return (Get-Location).Path
}

switch ($Target) {
  'project-dsh'   { $root = Join-Path (Get-GitRoot) '.dsh' }
  'project-agents' { $root = Join-Path (Get-GitRoot) '.agents' }
  'user-dsh'      { $baseHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }; $root = $baseHome }
  'user-agents'   { $baseHome = if ($env:DSH_AGENTS_HOME) { $env:DSH_AGENTS_HOME } else { Join-Path $HOME '.agents' }; $root = $baseHome }
}
$dest = Join-Path $root 'skills'
$manifest = Join-Path $dest '.dsh-skill-pack-security.manifest'

function Read-ManifestSkills {
  param([string] $Path)
  $skills = @()
  foreach ($line in Get-Content $Path) {
    if ($line -like 'skill=*') { $skills += $line.Substring(6) }
  }
  return $skills
}

if ($Uninstall) {
  if (-not (Test-Path $manifest)) {
    throw "No dsh-skill-pack-security manifest at $manifest; refusing to touch skill directories this pack did not install (delete them manually if you know they are ours)."
  }
  $ours = (Get-Content $manifest | Where-Object { $_ -eq 'pack=dsh-skill-pack-security' }).Count -gt 0
  if (-not $ours) { throw "Manifest at $manifest does not belong to dsh-skill-pack-security; refusing to remove anything." }
  $skills = Read-ManifestSkills $manifest
  if ($skills.Count -eq 0) { throw "Manifest at $manifest records no skill directories." }
  foreach ($name in $skills) {
    $dir = Join-Path $dest $name
    if ($DryRun) { Write-Host "would remove: $dir"; continue }
    if (Test-Path $dir) { Remove-Item $dir -Recurse -Force; Write-Host "removed: $dir" }
  }
  if (-not $DryRun) { Remove-Item $manifest -Force; Write-Host "removed manifest: $manifest" }
  Write-Host 'Uninstall done. Skills from other packs and local edits remain untouched.'
  exit 0
}

if (-not (Test-Path $source)) { throw "skills source not found: $source" }
$skillDirs = @(Get-ChildItem $source -Directory)
if ($skillDirs.Count -eq 0) { throw "no skill bundles in $source" }

# Refuse to silently overwrite same-name directories another pack or the user
# created; -Force opts into replacement.
$foreign = @()
foreach ($dir in $skillDirs) {
  $destDir = Join-Path $dest $dir.Name
  if ((Test-Path $destDir) -and -not (Test-Path $manifest)) { $foreign += $dir.Name }
}
if ($foreign.Count -gt 0 -and -not $Force) {
  throw ("Refusing to overwrite existing skill directories not installed by this pack: {0}. Re-run with -Force to replace them." -f ($foreign -join ', '))
}

if ($DryRun) {
  Write-Host "dry-run: target $dest (language $Language, version $packVersion)"
  foreach ($dir in $skillDirs) { Write-Host "would install: $(Join-Path $dest $dir.Name)" }
  exit 0
}

New-Item -ItemType Directory -Path $dest -Force | Out-Null
$names = @()
foreach ($dir in $skillDirs) {
  $destDir = Join-Path $dest $dir.Name
  if (Test-Path $destDir) { Remove-Item $destDir -Recurse -Force }
  Copy-Item $dir.FullName $destDir -Recurse
  $names += $dir.Name
  Write-Host "installed: $destDir"
}

$manifestLines = @("pack=dsh-skill-pack-security", "version=$packVersion", "language=$Language")
foreach ($name in $names) { $manifestLines += "skill=$name" }
Set-Content -Path $manifest -Value $manifestLines -Encoding ASCII
Write-Host "recorded manifest: $manifest"

Write-Host ''
Write-Host 'Done. DSH skill roots and precedence (lower rank wins within a layer):'
Write-Host '  rank 100  <project>/.dsh/skills'
Write-Host '  rank 200  <project>/.agents/skills'
Write-Host '  rank 400  <dshHome>/skills      (DSH_HOME or ~/.dsh)'
Write-Host '  rank 500  <agentsHome>/skills   (DSH_AGENTS_HOME or ~/.agents)'
Write-Host "Uninstall: .\scripts\install.ps1 -Target $Target -Language $Language -Uninstall"
