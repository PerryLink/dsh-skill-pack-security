#!/usr/bin/env bash
# Install or uninstall dsh-skill-pack-security skills in a DSH skill root.
#
# Copies skills/* (zh, default) or skills-en/* (--language en) — one directory
# bundle per skill — into one of the four roots the official
# dsh-skill-filesystem provider scans. Lower rank wins same-name conflicts
# within a layer. Ranks: project-dsh 100 < project-agents 200 < user-dsh 400 <
# user-agents 500 (custom 300 is plugin-registered, not a disk root).
# Install records a manifest (<root>/skills/.dsh-skill-pack-security.manifest)
# so --uninstall removes exactly what this pack installed.
#
# Usage: install.sh [--target <root>] [--language zh|en]
#                   [--uninstall] [--dry-run] [--force]
set -euo pipefail

TARGET="user-agents"
LANGUAGE="zh"
UNINSTALL=0
DRY_RUN=0
FORCE=0

usage() {
  echo "Usage: $0 [--target <root>] [--language zh|en] [--uninstall] [--dry-run] [--force]"
  echo "  --target: project-agents | project-dsh | user-dsh | user-agents (default: user-agents)"
  echo "  --language: zh | en (default: zh)"
  echo "  --uninstall: remove only the skill directories recorded by this pack's manifest"
  echo "  --dry-run: print what would happen without changing anything"
  echo "  --force: replace existing same-name skill directories that have no manifest from this pack"
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target|-t)
      [[ $# -ge 2 ]] || usage
      TARGET="$2"; shift 2 ;;
    --language|-l)
      [[ $# -ge 2 ]] || usage
      LANGUAGE="$2"; shift 2 ;;
    --uninstall|-u) UNINSTALL=1; shift ;;
    --dry-run|-n) DRY_RUN=1; shift ;;
    --force|-f) FORCE=1; shift ;;
    -h|--help) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

case "$TARGET" in
  project-agents|project-dsh|user-dsh|user-agents) ;;
  *) echo "invalid target: $TARGET" >&2; usage ;;
esac
case "$LANGUAGE" in
  zh|en) ;;
  *) echo "invalid language: $LANGUAGE (expected zh or en)" >&2; usage ;;
esac

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pack_version="$(tr -d '\r\n' < "$here/../VERSION")"
if [[ "$LANGUAGE" == "en" ]]; then
  source_dir="$here/../skills-en"
else
  source_dir="$here/../skills"
fi

git_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

case "$TARGET" in
  project-dsh)   root="$(git_root)/.dsh" ;;
  project-agents) root="$(git_root)/.agents" ;;
  user-dsh)      root="${DSH_HOME:-$HOME/.dsh}" ;;
  user-agents)   root="${DSH_AGENTS_HOME:-$HOME/.agents}" ;;
esac
dest="$root/skills"
manifest="$dest/.dsh-skill-pack-security.manifest"

if [[ "$UNINSTALL" == "1" ]]; then
  if [[ ! -f "$manifest" ]]; then
    echo "no dsh-skill-pack-security manifest at $manifest; refusing to touch skill directories this pack did not install (delete them manually if you know they are ours)" >&2
    exit 1
  fi
  grep -q '^pack=dsh-skill-pack-security$' "$manifest" || {
    echo "manifest at $manifest does not belong to dsh-skill-pack-security; refusing to remove anything" >&2
    exit 1
  }
  while IFS= read -r line; do
    [[ "$line" == skill=* ]] || continue
    name="${line#skill=}"
    dir="$dest/$name"
    if [[ "$DRY_RUN" == "1" ]]; then echo "would remove: $dir"; continue; fi
    if [[ -d "$dir" ]]; then rm -rf "$dir"; echo "removed: $dir"; fi
  done < "$manifest"
  if [[ "$DRY_RUN" != "1" ]]; then rm -f "$manifest"; echo "removed manifest: $manifest"; fi
  echo "Uninstall done. Skills from other packs and local edits remain untouched."
  exit 0
fi

if [[ ! -d "$source_dir" ]]; then
  echo "skills source not found: $source_dir" >&2
  exit 1
fi

# Refuse to silently overwrite same-name directories another pack or the user
# created; --force opts into replacement.
foreign=()
for dir in "$source_dir"/*/; do
  [[ -d "$dir" ]] || continue
  name="$(basename "$dir")"
  if [[ -d "$dest/$name" && ! -f "$manifest" ]]; then foreign+=("$name"); fi
done
if [[ ${#foreign[@]} -gt 0 && "$FORCE" != "1" ]]; then
  echo "refusing to overwrite existing skill directories not installed by this pack: ${foreign[*]}" >&2
  echo "re-run with --force to replace them" >&2
  exit 1
fi

if [[ "$DRY_RUN" == "1" ]]; then
  echo "dry-run: target $dest (language $LANGUAGE, version $pack_version)"
  for dir in "$source_dir"/*/; do
    [[ -d "$dir" ]] && echo "would install: $dest/$(basename "$dir")"
  done
  exit 0
fi

mkdir -p "$dest"
names=()
for dir in "$source_dir"/*/; do
  [[ -d "$dir" ]] || continue
  name="$(basename "$dir")"
  dest_dir="$dest/$name"
  rm -rf "$dest_dir"
  cp -R "$dir" "$dest_dir"
  names+=("$name")
  echo "installed: $dest_dir"
done

{
  echo "pack=dsh-skill-pack-security"
  echo "version=$pack_version"
  echo "language=$LANGUAGE"
  for name in "${names[@]}"; do echo "skill=$name"; done
} > "$manifest"
echo "recorded manifest: $manifest"

echo
echo "Done. DSH skill roots and precedence (lower rank wins within a layer):"
echo "  rank 100  <project>/.dsh/skills"
echo "  rank 200  <project>/.agents/skills"
echo "  rank 400  <dshHome>/skills      (DSH_HOME or ~/.dsh)"
echo "  rank 500  <agentsHome>/skills   (DSH_AGENTS_HOME or ~/.agents)"
echo "Uninstall: $0 --target $TARGET --language $LANGUAGE --uninstall"
