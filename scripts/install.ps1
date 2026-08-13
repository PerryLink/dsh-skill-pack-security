#Requires -Version 5.1
<#
.SYNOPSIS
  Install dsh-skill-pack-security skills into a DSH skill root.
.DESCRIPTION
  Copies skills/* (one directory bundle per skill) into one of the four roots
  the official dsh-skill-filesystem provider scans. Lower rank wins same-name
  conflicts within a layer.
  Ranks: project-dsh 100 < project-agents 200 < user-dsh 400 < user-agents 500.
.PARAMETER Target
  project-agents | project-dsh | user-dsh | user-agents (default: user-agents)
#>
param(
  [ValidateSet('project-agents', 'project-dsh', 'user-dsh', 'user-agents')]
  [string] $Target = 'user-agents'
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $here '..\skills'

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

if (-not (Test-Path $source)) { throw "skills source not found: $source" }
New-Item -ItemType Directory -Path $dest -Force | Out-Null

foreach ($dir in Get-ChildItem $source -Directory) {
  $destDir = Join-Path $dest $dir.Name
  if (Test-Path $destDir) { Remove-Item $destDir -Recurse -Force }
  Copy-Item $dir.FullName $destDir -Recurse
  Write-Host "installed: $destDir"
}

Write-Host ''
Write-Host "Done. DSH skill roots and precedence (lower rank wins within a layer):"
Write-Host "  rank 100  <project>/.dsh/skills"
Write-Host "  rank 200  <project>/.agents/skills"
Write-Host "  rank 400  <dshHome>/skills      (DSH_HOME or ~/.dsh)"
Write-Host "  rank 500  <agentsHome>/skills   (DSH_AGENTS_HOME or ~/.agents)"
Write-Host "Uninstall: delete the skill directories under $dest"
