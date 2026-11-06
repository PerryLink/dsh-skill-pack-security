#!/usr/bin/env python3
"""Generate README image assets for dsh-skill-pack-security (docs/assets/).

Outputs (idempotent overwrite):
  dsh-skill-pack-security-flow-light.svg / dsh-skill-pack-security-flow-dark.svg
      Hero pipeline diagram. Two hand-written SVG files (vector — never
      rasterized to webp). Text inside is command-surface tokens only
      (plugin_vet, gate.policy, ctx.skills, ...), so all five README
      languages share the same pair.
  dsh-skill-pack-security-evidence-{zh,en}-{light,dark}.webp
      Per-class F1 bar chart, data quoted verbatim from benchmark/RESULTS.md
      (38 poison samples, 20 malicious / 18 benign). Chinese needs an
      explicit CJK font — probed below; the script aborts loudly when none
      is found.

Existing hand-made assets are left untouched:
  dsh-skill-pack-security-demo.gif / -demo.png / -evidence.png / -flow.svg

Run once:  python scripts/gen-readme-assets.py
Requires:  Pillow (pip install pillow)
"""
from __future__ import annotations

import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets")

# --- palette: PerryLink family (accent) + GitHub page backgrounds ----------
FAMILY = "#4B67B4"   # family accent (badges labelColor family uses #2B3245)
GREEN = {"light": "#16a34a", "dark": "#3fb950"}
ORANGE = {"light": "#bc4c00", "dark": "#d29922"}
SKIN = {
    "light": dict(bg="#ffffff", box="#f6f8fa", border="#d0d7de",
                  text="#1f2328", sub="#57606a", track="#eaeef2"),
    "dark": dict(bg="#0d1117", box="#161b22", border="#30363d",
                 text="#f0f6fc", sub="#8b949e", track="#21262d"),
}

# --- CJK font probe: Chinese must never render as tofu boxes ----------------
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",      # Microsoft YaHei
    r"C:\Windows\Fonts\simhei.ttf",    # SimHei
    r"C:\Windows\Fonts\Deng.ttf",      # DengXian
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/System/Library/Fonts/PingFang.ttc",
]
FONT_PATH = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)
if FONT_PATH is None:
    sys.exit("FATAL: no CJK font found (looked for msyh.ttc, simhei.ttf, "
             "Deng.ttf, Noto Sans CJK, PingFang). Refusing to render Chinese "
             "as tofu boxes; install one of the probed fonts and re-run.")


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size)


# ---------------------------------------------------------------------------
# 1. Hero pipeline SVG (light + dark)
# ---------------------------------------------------------------------------
FLOW_NODES = [
    ("owner/repo", "tarball x1"),
    ("plugin_vet", "zero dependency"),
    ("5 checks", "license/sbom/lock"),
    ("risk card", "0-100 x 5 dims"),
    ("PASS|WARN|FAIL", "gate: warn|deny"),
]


def flow_svg(skin: str) -> str:
    s = SKIN[skin]
    w, h = 1200, 420
    nw, nh, gap = 180, 96, 45
    y0 = 150
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}" role="img" '
        f'aria-label="dsh-skill-pack-security pipeline">',
        f'<title>dsh-skill-pack-security pipeline</title>',
        f'<rect width="{w}" height="{h}" rx="18" fill="{s["bg"]}"/>',
        f'<text x="60" y="62" fill="{s["text"]}" font-family="ui-sans-serif,'
        f'system-ui,sans-serif" font-size="30" font-weight="700">'
        f'dsh-skill-pack-security</text>',
        f'<text x="60" y="94" fill="{s["sub"]}" font-family="ui-monospace,'
        f'monospace" font-size="16">plugin_vet pre-install gate + 8 SKILL.md '
        f'audit skills</text>',
        f'<line x1="60" y1="116" x2="1140" y2="116" stroke="{s["border"]}"/>',
    ]
    for i, (label, sub) in enumerate(FLOW_NODES):
        x = 60 + i * (nw + gap)
        accent = (GREEN[skin] if i == len(FLOW_NODES) - 1
                  else FAMILY if i == 1 else s["border"])
        parts.append(
            f'<rect x="{x}" y="{y0}" width="{nw}" height="{nh}" rx="14" '
            f'fill="{s["box"]}" stroke="{accent}" stroke-width="2"/>')
        parts.append(
            f'<text x="{x + nw // 2}" y="{y0 + 40}" fill="{s["text"]}" '
            f'text-anchor="middle" font-family="ui-monospace,monospace" '
            f'font-size="16" font-weight="700">{label}</text>')
        parts.append(
            f'<text x="{x + nw // 2}" y="{y0 + 68}" fill="{s["sub"]}" '
            f'text-anchor="middle" font-family="ui-monospace,monospace" '
            f'font-size="12">{sub}</text>')
        if i < len(FLOW_NODES) - 1:
            ax = x + nw + 6
            ay = y0 + nh // 2
            parts.append(
                f'<path d="M{ax} {ay}h{gap - 12}" stroke="{s["sub"]}" '
                f'stroke-width="3"/>')
            parts.append(
                f'<path d="M{ax + gap - 14} {ay - 7}l10 7-10 7" fill="none" '
                f'stroke="{s["sub"]}" stroke-width="3" '
                f'stroke-linecap="round" stroke-linejoin="round"/>')
    # skills band under the pipeline
    bx, bw, by, bh = 60, 1080, 296, 56
    parts.append(
        f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="12" '
        f'fill="{s["box"]}" stroke="{FAMILY}" stroke-width="2"/>')
    parts.append(
        f'<text x="{bx + bw // 2}" y="{by + 35}" fill="{s["text"]}" '
        f'text-anchor="middle" font-family="ui-monospace,monospace" '
        f'font-size="14">skills/ · skills-en/ · 8 x SKILL.md -> ctx.skills '
        f'-> skill tool</text>')
    parts.append(
        f'<text x="60" y="392" fill="{s["sub"]}" font-family="ui-monospace,'
        f'monospace" font-size="13">findings cite skill sections · e.g. '
        f'supply-chain-review §1 · dependency-audit §3 · '
        f'prompt-injection-review</text>')
    parts.append('</svg>')
    return "\n".join(parts) + "\n"


# ---------------------------------------------------------------------------
# 2. Evidence bar chart (zh/en x light/dark), data from benchmark/RESULTS.md
# ---------------------------------------------------------------------------
# F1 quoted verbatim from benchmark/RESULTS.md (38 poison samples: 20
# malicious / 18 benign; regenerate: pnpm --dir provider run build &&
# node benchmark/run.mjs).
F1 = [("install-scripts", 1.000), ("network-exfil", 0.800),
      ("obfuscation", 0.909), ("macro F1", 0.903), ("micro F1", 0.919)]

TEXT = {
    "zh": dict(
        title="dsh-skill-pack-security 投毒样本基准 — F1",
        sub="38 个样本（20 恶意 / 18 良性）· 数据出自 benchmark/RESULTS.md",
        note1="Micro 召回 0.850 · 误报率 0.000 · 漏检 3 个：ne-pos-03、"
              "ne-pos-04、ob-pos-01",
        note2="未覆盖：CVE 情报（属 sbom 检查，需 osv-scanner/npm audit）"
              "与动态分析"),
    "en": dict(
        title="dsh-skill-pack-security poison-sample benchmark — F1",
        sub="38 samples (20 malicious, 18 benign) · "
            "from benchmark/RESULTS.md",
        note1="Micro recall 0.850 · FPR 0.000 · 3 missed: ne-pos-03, "
              "ne-pos-04, ob-pos-01",
        note2="Not measured: CVE intelligence (the sbom check, needs "
              "osv-scanner/npm audit) and dynamic analysis"),
}


def evidence(lang: str, skin: str) -> None:
    s = SKIN[skin]
    t = TEXT[lang]
    w, h = 1600, 560
    img = Image.new("RGB", (w, h), s["bg"])
    d = ImageDraw.Draw(img)
    pad = 70
    d.text((pad, 44), t["title"], font=font(36), fill=s["text"])
    d.text((pad, 100), t["sub"], font=font(19), fill=s["sub"])
    label_w = 260
    bar_x, bar_max = pad + label_w + 24, 1000
    row_h, bar_h = 56, 34
    top = 170
    for i, (name, val) in enumerate(F1):
        y = top + i * row_h
        lb = d.textbbox((0, 0), name, font=font(22))
        d.text((bar_x - 24 - (lb[2] - lb[0]), y + 4), name,
               font=font(22), fill=s["text"])
        d.rounded_rectangle([bar_x, y, bar_x + bar_max, y + bar_h],
                            radius=9, fill=s["track"])
        color = GREEN[skin] if val >= 0.999 else ORANGE[skin]
        d.rounded_rectangle([bar_x, y, bar_x + int(bar_max * val), y + bar_h],
                            radius=9, fill=color)
        d.text((bar_x + bar_max + 18, y + 2), f"{val:.3f}",
               font=font(24), fill=s["text"])
    ny = top + len(F1) * row_h + 18
    d.text((pad, ny), t["note1"], font=font(17), fill=s["sub"])
    d.text((pad, ny + 32), t["note2"], font=font(17), fill=s["sub"])
    img.save(os.path.join(
        OUT, f"dsh-skill-pack-security-evidence-{lang}-{skin}.webp"),
        "WEBP", quality=90)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for skin in ("light", "dark"):
        with open(os.path.join(
                OUT, f"dsh-skill-pack-security-flow-{skin}.svg"),
                "w", encoding="utf-8", newline="\n") as fh:
            fh.write(flow_svg(skin))
    for lang in ("zh", "en"):
        for skin in ("light", "dark"):
            evidence(lang, skin)
    print("wrote 2 SVG + 4 WebP assets to docs/assets/")


if __name__ == "__main__":
    main()
