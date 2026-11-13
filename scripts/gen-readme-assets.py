#!/usr/bin/env python3
"""Generate README image assets for dsh-skill-pack-security (docs/assets/).

Outputs (idempotent overwrite)
------------------------------
  dsh-skill-pack-security-hero-{zh,en}-{light,dark}.webp   1440 x 576
      Hero banner, drawn with Pillow. Left column: kicker pill / title /
      two value lines / one subline / one mono meta line / footer. Right
      side: the plugin_vet risk card -- five weighted dimensions with
      0-100 gauges, the PASS / WARN / FAIL verdict selector and the
      `gate.policy: warn | deny` segment. No scores are printed, so the
      card reads as the report's shape, not as a claimed scan result.

  dsh-skill-pack-security-flow-v5-{light,dark}.svg         1100 x 660
      Hand-written SVG structure diagram. Grammar: a grouped merge table --
      the nine checks ALL_CHECK_IDS are grouped under the five weighted
      dimensions (DIMENSION_CHECKS), each group bracketed into a dimension
      chip that carries its weight, all five chips feed a summation bus,
      and the verdict panel on the right is the decision staircase
      (any fail -> FAIL, overall < 60 -> WARN, else PASS) plus the gate.

  dsh-skill-pack-security-evidence-{zh,en}-{light,dark}.webp   1600 x 560
      Poison-sample benchmark F1 bars, values quoted verbatim from
      benchmark/RESULTS.md.

Facts used by the diagrams (provider/src/vet, read from source, not invented)
----------------------------------------------------------------------------
  vocabulary.ts  ALL_CHECK_IDS: license, sbom, commit-lock, install-scripts,
                 network-exfil, obfuscation, source, maintenance,
                 data-responsibility  (9 checks)
  engine.ts      DIMENSION_CHECKS + WEIGHTS:
                   license       0.25  <- license
                   source        0.20  <- source, commit-lock, data-responsibility
                   dependencies  0.15  <- sbom
                   build-scripts 0.25  <- install-scripts, network-exfil, obfuscation
                   maintenance   0.15  <- maintenance
                 verdict: any check fail -> FAIL, else overall < 60 -> WARN,
                          else PASS; gate applies only on FAIL, blocked when
                          policy is deny
  skills.ts      every check cites a skill section (SKILL_REF), e.g.
                 license -> dependency-audit §3
  config.ts      scan budget: 800 files / 256 KiB per file / 64 MiB extract,
                 15 s timeout (README config table)

Run once:  python scripts/gen-readme-assets.py
Requires:  Pillow
"""
from __future__ import annotations

import os
import sys
from xml.sax.saxutils import escape

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets")

FONT_DIR = r"C:\Windows\Fonts"
FONT_FILES = {
    "reg": os.path.join(FONT_DIR, "msyh.ttc"),
    "bold": os.path.join(FONT_DIR, "msyhbd.ttc"),
    "mono": os.path.join(FONT_DIR, "consola.ttf"),
}
for _name, _path in FONT_FILES.items():
    if not os.path.exists(_path):
        sys.exit(f"FATAL: required font missing: {_path} "
                 f"(expected msyh.ttc / msyhbd.ttc / consola.ttf)")

_CACHE: dict = {}


def F(kind: str, size: float) -> ImageFont.FreeTypeFont:
    key = (kind, size)
    if key not in _CACHE:
        _CACHE[key] = ImageFont.truetype(FONT_FILES[kind], int(round(size)))
    return _CACHE[key]


def hx(value: str, alpha: int = 255) -> tuple:
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16),
            int(value[4:6], 16), alpha)


# ---------------------------------------------------------------------------
# Palette: family accent #4B67B4 (dark #8496f5), light bg #f9f6fd -> #e4eaf8,
# dark bg #131a2a -> #0c1016.
# ---------------------------------------------------------------------------
PAL = {
    "light": dict(
        bg=("#f9f6fd", "#f4f3fd", "#edf0fb", "#e4eaf8"),
        card="#ffffff", back="#f2f4fc", edge="#dde3f3",
        text="#1a2233", sub="#525d75", muted="#7d879c",
        accent="#4B67B4", accent2="#7d90d6",
        tint="#edf0fa", line="#c9d2ec", track="#e8ecf7",
        ok="#1f8f4e", warn="#b06f00", fail="#c0392b",
        on_accent="#ffffff", on_warn="#ffffff",
        shadow=(26, 36, 68), shadow_a=0.10,
        glow=("4B67B4", 12),
        chip_fill="#f6f7fc",
    ),
    "dark": dict(
        bg=("#131a2a", "#151d2f", "#101623", "#0c1016"),
        card="#171f30", back="#121a29", edge="#2a3450",
        text="#eef2ff", sub="#a8b2c9", muted="#7e89a3",
        accent="#8496f5", accent2="#b4befb",
        tint="#1d2740", line="#31406a", track="#232d45",
        ok="#48c97a", warn="#f2b544", fail="#f0786f",
        on_accent="#101623", on_warn="#241a05",
        shadow=(0, 0, 0), shadow_a=0.45,
        glow=("8496f5", 20),
        chip_fill="#1b2438",
    ),
}

# Dimension order as in engine.ts WEIGHTS / README, with the real weights.
DIMENSIONS = [
    ("license", "许可证", "License", 0.25),
    ("source", "来源", "Source", 0.20),
    ("dependencies", "依赖", "Dependencies", 0.15),
    ("build-scripts", "构建脚本", "Build scripts", 0.25),
    ("maintenance", "维护状态", "Maintenance", 0.15),
]
# Illustrative gauge fills (the card prints no numbers; 0-100 is the scale).
GAUGE = [0.86, 0.72, 0.90, 0.64, 0.78]

HERO = {
    "zh": dict(
        kicker="安装前门禁 · 供应链安全",
        title=["先验货，", "再安装。"],
        value=["九个静态检查翻完 tarball，五维各打 0–100。",
               "汇总成一个判定：PASS / WARN / FAIL。"],
        sub="八个审计技能教方法，每条发现都指回章节。",
        meta="9 checks · 5 dims · 0–100 · PASS / WARN / FAIL",
        foot="github.com/PerryLink/dsh-skill-pack-security · Apache-2.0",
        card_title="风险卡片",
        card_target="owner/repo@main",
        card_sub="tarball ×1 · 9 checks · 5 dims · 0–100",
        card_note="门禁只在 FAIL 时生效",
        gate="gate.policy",
    ),
    "en": dict(
        kicker="PRE-INSTALL GATE · SUPPLY CHAIN",
        title=["Inspect first.", "Then install."],
        value=["Nine static checks read the tarball once;",
               "five weighted dimensions score 0–100."],
        sub="Every finding points back into a skill section.",
        meta="9 checks · 5 dims · 0–100 · PASS / WARN / FAIL",
        foot="github.com/PerryLink/dsh-skill-pack-security · Apache-2.0",
        card_title="Risk card",
        card_target="owner/repo@main",
        card_sub="tarball ×1 · 9 checks · 5 dims · 0–100",
        card_note="gate applies on FAIL only",
        gate="gate.policy",
    ),
}

# ---------------------------------------------------------------------------
# Small Pillow helpers
# ---------------------------------------------------------------------------
def gradient(size, corners):
    """Bilinear gradient from four corner colours (smooth, 1-pixel source)."""
    im = Image.new("RGB", (2, 2))
    im.putpixel((0, 0), corners[0])
    im.putpixel((1, 0), corners[1])
    im.putpixel((0, 1), corners[2])
    im.putpixel((1, 1), corners[3])
    return im.resize(size, Image.Resampling.BICUBIC)


def shadow(canvas, box, radius, dy=12, blur=26, color=(20, 30, 60), alpha=0.10):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((box[0], box[1] + dy, box[2], box[3] + dy),
                        radius=radius, fill=color + (int(alpha * 255),))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def tracked(d, xy, text, f, fill, tracking=0.0):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill, anchor="ls")
        x += d.textlength(ch, font=f) + tracking


def seg_text(d, box, text, f, fill):
    cx = (box[0] + box[2]) / 2
    cy = (box[1] + box[3]) / 2
    d.text((cx, cy + 1), text, font=f, fill=fill, anchor="mm")


# ---------------------------------------------------------------------------
# 1. Hero banner (Pillow), 1440 x 576
# ---------------------------------------------------------------------------
def hero(lang: str, skin: str) -> None:
    s = PAL[skin]
    t = HERO[lang]
    W, H = 1440, 576
    img = gradient((W, H), [hx(c)[:3] for c in s["bg"]]).convert("RGBA")

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gc, ga = s["glow"]
    gd.ellipse((780, -60, 1560, 640), fill=hx(gc, ga))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))

    d = ImageDraw.Draw(img)

    # -- left column -------------------------------------------------------
    kick_f = F("bold", 18)
    kw = d.textlength(t["kicker"], font=kick_f) + 44
    d.rounded_rectangle((72, 56, 72 + kw, 92), radius=18,
                        fill=s["tint"], outline=s["line"], width=1)
    tracked(d, (94, 80), t["kicker"], kick_f, s["accent"], tracking=0.6)

    title_f = F("bold", 82)
    for i, line in enumerate(t["title"]):
        d.text((72, 176 + 90 * i), line, font=title_f,
               fill=s["text"], anchor="ls")

    val_f = F("reg", 26)
    for i, line in enumerate(t["value"]):
        d.text((72, 314 + 34 * i), line, font=val_f,
               fill=s["sub"], anchor="ls")

    d.text((72, 396), t["sub"], font=F("reg", 25),
           fill=s["muted"], anchor="ls")
    d.text((72, 442), t["meta"], font=F("mono", 20),
           fill=s["muted"], anchor="ls")

    d.line((72, 482, 560, 482), fill=s["edge"], width=1)
    d.text((72, 528), t["foot"], font=F("mono", 18),
           fill=s["muted"], anchor="ls")

    # -- risk card ---------------------------------------------------------
    card = (726, 64, 1368, 494)
    back = (738, 78, 1380, 500)
    shadow(img, back, 22, dy=10, blur=26, color=s["shadow"],
           alpha=s["shadow_a"] * 0.6)
    shadow(img, card, 22, dy=14, blur=30, color=s["shadow"],
           alpha=s["shadow_a"])
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(back, radius=22, fill=s["back"], outline=s["edge"],
                        width=1)
    d.rounded_rectangle(card, radius=22, fill=s["card"], outline=s["edge"],
                        width=1)

    d.text((756, 104), t["card_title"], font=F("bold", 22),
           fill=s["text"], anchor="ls")
    d.text((1338, 104), t["card_target"], font=F("mono", 15.5),
           fill=s["muted"], anchor="rs")
    d.text((756, 130), t["card_sub"], font=F("mono", 15),
           fill=s["muted"], anchor="ls")
    d.line((756, 146, 1338, 146), fill=s["edge"], width=1)

    for i, (dim, zh, en, w) in enumerate(DIMENSIONS):
        top = 152 + 56 * i
        cy = top + 19
        label = zh if lang == "zh" else en
        lf = F("bold", 18.5)
        d.text((756, cy), label, font=lf, fill=s["text"], anchor="ls")
        if lang == "zh":
            lw = d.textlength(label, font=lf)
            d.text((756 + lw + 10, cy), dim, font=F("mono", 14.5),
                   fill=s["muted"], anchor="ls")
        d.text((1338, cy), f"×{w:.2f}", font=F("mono", 15.5),
               fill=s["sub"], anchor="rs")

        d.rounded_rectangle((756, top + 31, 1338, top + 39), radius=4,
                            fill=s["track"])
        fill_w = 582 * GAUGE[i]
        d.rounded_rectangle((756, top + 31, 756 + fill_w, top + 39), radius=4,
                            fill=s["accent"])
        if i < len(DIMENSIONS) - 1:
            d.line((756, top + 50, 1338, top + 50), fill=s["edge"], width=1)

    d.line((756, 438, 1338, 438), fill=s["edge"], width=1)
    d.text((756, 472), t["card_note"], font=F("reg", 16),
           fill=s["muted"], anchor="ls")

    chips = [("PASS", s["ok"], False), ("WARN", s["warn"], True),
             ("FAIL", s["fail"], False)]
    for i, (label, color, active) in enumerate(chips):
        x = 1034 + 104 * i
        box = (x, 448, x + 96, 484)
        if active:
            d.rounded_rectangle(box, radius=16, fill=color)
            fill = s["on_warn"]
        else:
            d.rounded_rectangle(box, radius=16, fill=s["chip_fill"],
                                outline=s["edge"], width=1)
            fill = s["muted"]
        seg_text(d, box, label, F("bold", 16), fill)

    # -- gate policy dock --------------------------------------------------
    dock = (726, 504, 1368, 556)
    d.rounded_rectangle(dock, radius=20, fill=s["back"], outline=s["edge"],
                        width=1)
    d.text((750, 535), t["gate"], font=F("mono", 16),
           fill=s["muted"], anchor="ls")
    d.rounded_rectangle((1090, 512, 1344, 548), radius=16, fill=s["track"],
                        outline=s["edge"], width=1)
    d.rounded_rectangle((1090, 512, 1217, 548), radius=16, fill=s["accent"])
    d.rectangle((1201, 512, 1217, 548), fill=s["accent"])
    seg_text(d, (1090, 512, 1217, 548), "warn", F("bold", 16), s["on_accent"])
    seg_text(d, (1217, 512, 1344, 548), "deny", F("bold", 16), s["muted"])

    out = os.path.join(OUT, f"dsh-skill-pack-security-hero-{lang}-{skin}.webp")
    img.convert("RGB").save(out, "WEBP", quality=93, method=6)
    print(f"  hero {os.path.basename(out)}")


# ---------------------------------------------------------------------------
# 2. Structure diagram (hand-written SVG), 1100 x 660
# ---------------------------------------------------------------------------
UI = ("'Segoe UI','Microsoft YaHei',system-ui,-apple-system,"
      "'Helvetica Neue',Arial,sans-serif")
MONO = "Consolas,'SFMono-Regular','Cascadia Mono',Menlo,monospace"

# check id -> dimension, and the skill section each finding cites (SKILL_REF).
CHECK_REF = {
    "license": "dependency-audit §3",
    "sbom": "dependency-audit §7",
    "install-scripts": "supply-chain-review §1",
    "network-exfil": "dependency-audit §4.4",
    "obfuscation": "supply-chain-review §1",
    "source": "dependency-audit §4.3",
    "commit-lock": "supply-chain-review §3",
    "data-responsibility": "prompt-injection-review §2",
    "maintenance": "security-audit §3",
}
GROUPS = [
    ("license", 0.25, ["license"]),
    ("dependencies", 0.20, ["sbom"]),
    ("build-scripts", 0.25, ["install-scripts", "network-exfil", "obfuscation"]),
    ("source", 0.20, ["source", "commit-lock", "data-responsibility"]),
    ("maintenance", 0.15, ["maintenance"]),
]

SVG = {
    "light": dict(
        bg1="#f9f6fd", bg2="#e4eaf8",
        card="#ffffff", edge="#dfe4f2", sunken="#f7f8fd",
        text="#1a2233", sub="#525d75", muted="#7b859b",
        accent="#4B67B4", soft="#eef1fa", line="#c5cfec", track="#e8ecf7",
        ok="#1f8f4e", ok_soft="#e7f4ec",
        warn="#a96800", warn_soft="#fbf1de",
        fail="#bd3a2c", fail_soft="#fbeae7",
        shadow="#1b2a52", shadow_op="0.10",
        dim={"license": "#4B67B4", "dependencies": "#8494d6",
             "build-scripts": "#4160b2", "source": "#677fca",
             "maintenance": "#9aa8e0"},
    ),
    "dark": dict(
        bg1="#131a2a", bg2="#0c1016",
        card="#161e2f", edge="#2a3450", sunken="#1b2438",
        text="#eef2ff", sub="#a8b2c9", muted="#7e89a3",
        accent="#8496f5", soft="#1d2740", line="#33406a", track="#232d45",
        ok="#48c97a", ok_soft="#14291f",
        warn="#f2b544", warn_soft="#2a2214",
        fail="#f0786f", fail_soft="#2a1818",
        shadow="#000000", shadow_op="0.45",
        dim={"license": "#8496f5", "dependencies": "#b4befb",
             "build-scripts": "#7385ec", "source": "#9dabf7",
             "maintenance": "#c9d1fc"},
    ),
}


def txt(x, y, value, size, fill, *, weight=400, family=UI, anchor="start",
        extra=""):
    return (f'<text x="{x}" y="{y}" fill="{fill}" font-family="{family}" '
            f'font-size="{size}" font-weight="{weight}" '
            f'text-anchor="{anchor}"{extra}>{escape(value)}</text>')


def rrect(x, y, w, h, radius, fill, *, stroke=None, sw=1, extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
            f'fill="{fill}"{s}{extra}/>')


def flow_svg(skin: str) -> str:
    c = SVG[skin]
    W, H = 1100, 660
    PX, PY, PW = 40, 150, 320
    ROW_H, GAP = 39, 10
    CHIP_X0, CHIP_X1 = 410, 664
    BUS_X = 678
    VX0, VX1, VY0, VY1 = 700, 1060, 150, 561
    o = []
    a = o.append

    a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
      f'viewBox="0 0 {W} {H}" role="img" aria-label="plugin_vet structure: '
      f'the nine checks grouped into five weighted risk dimensions, merged '
      f'into a verdict staircase (FAIL, WARN, PASS) and the gate policy">')
    a('<title>plugin_vet: nine checks, five weighted dimensions, one verdict</title>')
    a('<defs>')
    a(f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
      f'<stop offset="0" stop-color="{c["bg1"]}"/>'
      f'<stop offset="1" stop-color="{c["bg2"]}"/></linearGradient>')
    a(f'<filter id="sh" x="-12%" y="-12%" width="124%" height="124%">'
      f'<feDropShadow dx="0" dy="10" stdDeviation="16" '
      f'flood-color="{c["shadow"]}" flood-opacity="{c["shadow_op"]}"/></filter>')
    a('</defs>')
    a(f'<rect width="{W}" height="{H}" rx="22" fill="url(#bg)"/>')

    # -- header ------------------------------------------------------------
    a(txt(40, 44, "PLUGIN_VET · STRUCTURE", 14, c["accent"],
          weight=700, extra=' letter-spacing="2.2"'))
    a(txt(40, 86, "Nine checks, five weighted dimensions, one verdict",
          27, c["text"], weight=700))
    a(txt(40, 112, "target → tarball ×1 → 9 checks → 5 weighted dims → "
                   "verdict → gate · zero dependency", 15, c["sub"]))
    a(txt(1060, 112, "budget 800 files · 256 KiB · 64 MiB", 14,
          c["muted"], family=MONO, anchor="end"))

    # -- column labels -----------------------------------------------------
    a(txt(40, 140, "CHECKS · 9", 14, c["muted"], weight=700,
          extra=' letter-spacing="1.4"'))
    a(txt(410, 140, "DIMENSION × WEIGHT", 14, c["muted"], weight=700,
          extra=' letter-spacing="1.4"'))
    a(txt(700, 140, "VERDICT → GATE", 14, c["muted"], weight=700,
          extra=' letter-spacing="1.4"'))

    # -- checks panel ------------------------------------------------------
    groups = []
    y = PY + 10
    for dim, weight, checks in GROUPS:
        h = len(checks) * ROW_H
        groups.append(dict(dim=dim, weight=weight, checks=checks,
                           top=y, h=h, cy=y + h / 2))
        y += h + GAP
    panel_h = (y - GAP + 10) - PY

    a(rrect(PX, PY, PW, panel_h, 22, c["card"], stroke=c["edge"],
            extra=' filter="url(#sh)"'))
    for g in groups:
        for i, cid in enumerate(g["checks"]):
            top = g["top"] + i * ROW_H
            cy = top + ROW_H / 2
            a(rrect(PX + 12, cy - 9, 4, 18, 2, c["dim"][g["dim"]],
                    extra=' opacity="0.9"'))
            a(txt(PX + 28, top + 16, cid, 17, c["text"],
                  weight=600, family=MONO))
            a(txt(PX + 28, top + 32, CHECK_REF[cid], 14, c["muted"],
                  family=MONO))
            if i < len(g["checks"]) - 1:
                a(f'<line x1="{PX + 24}" y1="{top + ROW_H}" '
                  f'x2="{PX + PW - 14}" y2="{top + ROW_H}" '
                  f'stroke="{c["edge"]}" stroke-width="1"/>')
        # bracket
        a(f'<path d="M{PX + PW + 28} {g["top"] + 6}'
          f'V{g["top"] + g["h"] - 6}" '
          f'stroke="{c["dim"][g["dim"]]}" stroke-width="2" '
          f'stroke-linecap="round" opacity="0.55"/>')
        a(f'<path d="M{PX + PW + 28} {g["cy"]}H{CHIP_X0}" '
          f'stroke="{c["dim"][g["dim"]]}" stroke-width="2" opacity="0.55"/>')

        # dimension chip
        box = (CHIP_X0, g["cy"] - 20, CHIP_X1, g["cy"] + 20)
        a(rrect(box[0], box[1], box[2] - box[0], box[3] - box[1], 14,
                c["soft"], stroke=c["line"]))
        a(rrect(box[0] + 10, g["cy"] - 11, 3, 22, 1.5, c["dim"][g["dim"]]))
        a(txt(box[0] + 22, g["cy"] + 5.5, g["dim"], 16.5, c["text"],
              weight=700, family=MONO))
        a(txt(box[2] - 18, g["cy"] + 5.5, f'×{g["weight"]:.2f}', 14.5,
              c["sub"], family=MONO, anchor="end"))
        # stub into the summation bus
        a(f'<path d="M{CHIP_X1} {g["cy"]}H{BUS_X}" '
          f'stroke="{c["dim"][g["dim"]]}" stroke-width="2" opacity="0.55"/>')

    # -- summation bus -----------------------------------------------------
    first = groups[0]["cy"]
    last = groups[-1]["cy"]
    a(f'<path d="M{BUS_X} {first}V{last}" stroke="{c["accent"]}" '
      f'stroke-width="2" stroke-linecap="round" opacity="0.45"/>')
    a(f'<circle cx="{BUS_X}" cy="206" r="13" fill="{c["card"]}" '
      f'stroke="{c["accent"]}" stroke-width="1.5"/>')
    a(txt(BUS_X, 211, "Σ", 15, c["accent"], weight=700,
          family=MONO, anchor="middle"))
    a(f'<path d="M691 206H694" stroke="{c["accent"]}" stroke-width="2"/>')
    a(f'<path d="M694 200l7 6-7 6" fill="none" stroke="{c["accent"]}" '
      f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')

    # -- verdict panel -----------------------------------------------------
    a(rrect(VX0, VY0, VX1 - VX0, VY1 - VY0, 22, c["card"], stroke=c["edge"],
            extra=' filter="url(#sh)"'))
    a(txt(VX0 + 20, 180, "VERDICT", 14, c["accent"], weight=700,
          extra=' letter-spacing="1.8"'))
    a(txt(VX1 - 20, 180, "plugin_vet.report", 14, c["muted"],
          family=MONO, anchor="end"))
    a(txt(VX0 + 20, 206, "overall = Σ(dim × weight)", 14.5, c["sub"],
          family=MONO))

    # 0-100 scale with the real WARN cutoff at 60
    gx0, gx1 = VX0 + 20, VX1 - 20
    a(rrect(gx0, 220, gx1 - gx0, 10, 5, c["track"]))
    cut = gx0 + (gx1 - gx0) * 0.6
    a(f'<path d="M{cut} 215V235" stroke="{c["text"]}" stroke-width="2" '
      f'opacity="0.45"/>')
    a(txt(gx0, 252, "0", 14, c["muted"], family=MONO))
    a(txt(cut, 252, "60", 14, c["muted"], family=MONO, anchor="middle"))
    a(txt(gx1, 252, "100", 14, c["muted"], family=MONO, anchor="end"))
    a(f'<line x1="{gx0}" y1="268" x2="{gx1}" y2="268" '
      f'stroke="{c["edge"]}" stroke-width="1"/>')

    # decision staircase: first match wins
    steps = [
        ("any check fails", "FAIL", c["fail"], c["fail_soft"], 284),
        ("overall < 60", "WARN", c["warn"], c["warn_soft"], 352),
        ("otherwise", "PASS", c["ok"], c["ok_soft"], 420),
    ]
    for i, (rule, verdict, color, soft, top) in enumerate(steps):
        x = VX0 + 20 + 14 * i
        w = 300
        a(rrect(x, top, w, 56, 16, c["sunken"], stroke=c["edge"]))
        a(rrect(x + 16, top + 14, 3, 28, 1.5, color))
        a(txt(x + 30, top + 34, rule, 15.5, c["text"]))
        a(rrect(x + w - 84, top + 14, 70, 28, 14, soft,
                stroke=color, sw=1.2))
        a(txt(x + w - 49, top + 34, verdict, 14, color,
              weight=700, family=MONO, anchor="middle"))

    a(f'<line x1="{gx0}" y1="494" x2="{gx1}" y2="494" '
      f'stroke="{c["edge"]}" stroke-width="1"/>')
    a(txt(VX0 + 20, 516, "gate.policy", 14.5, c["text"], weight=700,
          family=MONO))
    a(txt(VX1 - 20, 516, "applies only on FAIL", 14, c["muted"],
          family=MONO, anchor="end"))
    a(rrect(VX0 + 20, 520, 176, 30, 15, c["soft"], stroke=c["line"]))
    a(txt(VX0 + 108, 540, "warn · non-blocking", 14, c["accent"],
          family=MONO, anchor="middle"))
    a(rrect(VX0 + 204, 520, 122, 30, 15, c["sunken"], stroke=c["edge"]))
    a(txt(VX0 + 265, 540, "deny · blocks", 14, c["muted"],
          family=MONO, anchor="middle"))

    # -- footer ------------------------------------------------------------
    a(txt(40, 604, "Every finding cites a section of the 8 bundled SKILL.md "
                   "skills · zh / en editions", 14, c["muted"]))
    a(txt(1060, 604, "dsh-skill-pack-security", 14, c["muted"],
          family=MONO, anchor="end"))
    a('</svg>')
    return "\n".join(o) + "\n"


# ---------------------------------------------------------------------------
# 3. Evidence bar chart (values from benchmark/RESULTS.md)
# ---------------------------------------------------------------------------
# The chart keeps its original GitHub-page skin (white / #0d1117) and the
# original green/orange pair; only the F1 numbers and notes live here, so the
# four files stay byte-identical to their previous revision.
F1 = [("install-scripts", 1.000), ("network-exfil", 0.800),
      ("obfuscation", 0.909), ("macro F1", 0.903), ("micro F1", 0.919)]

EVIDENCE_SKIN = {
    "light": dict(bg="#ffffff", text="#1f2328", sub="#57606a",
                  track="#eaeef2", good="#16a34a", warn="#bc4c00"),
    "dark": dict(bg="#0d1117", text="#f0f6fc", sub="#8b949e",
                 track="#21262d", good="#3fb950", warn="#d29922"),
}

EVIDENCE_TEXT = {
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
    s = EVIDENCE_SKIN[skin]
    t = EVIDENCE_TEXT[lang]
    w, h = 1600, 560
    img = Image.new("RGB", (w, h), s["bg"])
    d = ImageDraw.Draw(img)
    pad = 70
    d.text((pad, 44), t["title"], font=F("reg", 36), fill=s["text"])
    d.text((pad, 100), t["sub"], font=F("reg", 19), fill=s["sub"])
    label_w = 260
    bar_x, bar_max = pad + label_w + 24, 1000
    row_h, bar_h = 56, 34
    top = 170
    for i, (name, val) in enumerate(F1):
        y = top + i * row_h
        lb = d.textbbox((0, 0), name, font=F("reg", 22))
        d.text((bar_x - 24 - (lb[2] - lb[0]), y + 4), name,
               font=F("reg", 22), fill=s["text"])
        d.rounded_rectangle([bar_x, y, bar_x + bar_max, y + bar_h],
                            radius=9, fill=s["track"])
        color = s["good"] if val >= 0.999 else s["warn"]
        d.rounded_rectangle([bar_x, y, bar_x + int(bar_max * val), y + bar_h],
                            radius=9, fill=color)
        d.text((bar_x + bar_max + 18, y + 2), f"{val:.3f}",
               font=F("reg", 24), fill=s["text"])
    ny = top + len(F1) * row_h + 18
    d.text((pad, ny), t["note1"], font=F("reg", 17), fill=s["sub"])
    d.text((pad, ny + 32), t["note2"], font=F("reg", 17), fill=s["sub"])
    out = os.path.join(
        OUT, f"dsh-skill-pack-security-evidence-{lang}-{skin}.webp")
    img.save(out, "WEBP", quality=90)
    print(f"  evidence {os.path.basename(out)}")


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    print("hero:")
    for lang in ("zh", "en"):
        for skin in ("light", "dark"):
            hero(lang, skin)
    print("structure:")
    for skin in ("light", "dark"):
        name = f"dsh-skill-pack-security-flow-v5-{skin}.svg"
        with open(os.path.join(OUT, name), "w", encoding="utf-8",
                  newline="\n") as fh:
            fh.write(flow_svg(skin))
        print(f"  {name}")
    print("evidence:")
    for lang in ("zh", "en"):
        for skin in ("light", "dark"):
            evidence(lang, skin)
    print("done")


if __name__ == "__main__":
    main()
