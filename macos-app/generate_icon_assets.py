from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
MACOS_DIR = ROOT / "macos-app"
ICONSET_DIR = MACOS_DIR / "AppIcon.iconset"
MASTER_PATH = MACOS_DIR / "AppIcon-master.png"
ICNS_PATH = MACOS_DIR / "AppIcon.icns"

PARCHMENT = (248, 241, 232, 255)
PARCHMENT_DARK = (231, 214, 199, 255)
PAPER = (255, 251, 246, 255)
INK = (52, 31, 30, 255)
OXBLOOD = (133, 24, 39, 255)
DEEP_RED = (167, 40, 56, 255)
BLUSH = (228, 202, 194, 255)
BRASS = (187, 145, 84, 255)
BRASS_DARK = (134, 97, 49, 255)
LINE_RED = (194, 155, 150, 255)
LINE_SOFT = (226, 213, 206, 255)
SHADOW = (44, 18, 22, 68)
WHITE = (255, 255, 255, 255)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def lerp(a, b, t: float):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build_gradient(size: int) -> Image.Image:
    top = (252, 246, 239)
    mid = (237, 220, 211)
    bottom = (215, 185, 182)
    gradient = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)
    for y in range(size):
        t = y / max(1, size - 1)
        if t < 0.55:
            color = lerp(top, mid, t / 0.55)
        else:
            color = lerp(mid, bottom, (t - 0.55) / 0.45)
        draw.line((0, y, size, y), fill=color + (255,))
    return gradient


def build_master() -> Image.Image:
    size = 1024
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    image.paste(build_gradient(size), (0, 0), rounded_mask(size, 220))

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((140, 110, 930, 890), fill=(255, 255, 255, 105))
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(36)))

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((150, 136, 866, 886), radius=148, fill=SHADOW)
    image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(32)))

    draw = ImageDraw.Draw(image)

    # notepad body
    left, top, right, bottom = 184, 154, 830, 876
    draw.rounded_rectangle((left, top, right, bottom), radius=146, fill=PAPER, outline=PARCHMENT_DARK, width=6)

    # notepad header
    draw.rounded_rectangle((left + 34, top + 28, right - 34, top + 132), radius=34, fill=OXBLOOD)

    # rings
    ring_y = top + 78
    for x in (288, 392, 496, 600, 704):
        draw.rounded_rectangle((x - 14, top + 8, x + 14, top + 82), radius=12, fill=BRASS, outline=BRASS_DARK, width=4)
        draw.ellipse((x - 18, ring_y - 18, x + 18, ring_y + 18), outline=WHITE, width=6)

    # paper lines
    for y in range(top + 194, bottom - 120, 62):
        draw.rounded_rectangle((left + 72, y, right - 72, y + 10), radius=5, fill=LINE_SOFT)
    draw.rounded_rectangle((left + 72, top + 196, left + 108, bottom - 84), radius=12, fill=LINE_RED)

    # ribbon tab
    draw.rounded_rectangle((right - 108, top + 182, right - 36, top + 332), radius=22, fill=DEEP_RED)
    draw.polygon(((right - 108, top + 332), (right - 36, top + 332), (right - 72, top + 392)), fill=DEEP_RED)

    # legal scales centerpiece
    cx, cy = 507, 542
    draw.ellipse((cx - 162, cy - 162, cx + 162, cy + 162), fill=(251, 245, 239, 255), outline=OXBLOOD, width=16)
    draw.ellipse((cx - 130, cy - 130, cx + 130, cy + 130), fill=(248, 238, 230, 255), outline=BLUSH, width=8)

    # pillar
    draw.rounded_rectangle((cx - 16, cy - 92, cx + 16, cy + 82), radius=10, fill=BRASS, outline=BRASS_DARK, width=4)
    draw.polygon(((cx - 34, cy - 92), (cx + 34, cy - 92), (cx, cy - 138)), fill=BRASS)
    draw.rounded_rectangle((cx - 86, cy + 82, cx + 86, cy + 108), radius=12, fill=BRASS, outline=BRASS_DARK, width=4)

    # beam
    beam_y = cy - 48
    draw.rounded_rectangle((cx - 136, beam_y - 10, cx + 136, beam_y + 10), radius=10, fill=BRASS, outline=BRASS_DARK, width=4)
    draw.ellipse((cx - 18, beam_y - 18, cx + 18, beam_y + 18), fill=BRASS)

    # chains + pans
    for direction in (-1, 1):
        x = cx + direction * 102
        pan_top = beam_y + 44
        pan_bottom = beam_y + 102
        draw.line((x, beam_y + 8, x - 24, pan_top), fill=BRASS_DARK, width=5)
        draw.line((x, beam_y + 8, x + 24, pan_top), fill=BRASS_DARK, width=5)
        draw.arc((x - 42, pan_top - 6, x + 42, pan_bottom), start=0, end=180, fill=BRASS_DARK, width=6)
        draw.line((x - 34, pan_bottom - 10, x + 34, pan_bottom - 10), fill=BRASS, width=8)

    # legal checklist marks near bottom
    checkbox_x = left + 132
    start_y = 688
    for idx in range(3):
        y = start_y + idx * 58
        draw.rounded_rectangle((checkbox_x, y, checkbox_x + 30, y + 30), radius=8, outline=DEEP_RED, width=4, fill=(255, 252, 248, 255))
        if idx < 2:
            draw.line((checkbox_x + 7, y + 16, checkbox_x + 14, y + 23), fill=OXBLOOD, width=5)
            draw.line((checkbox_x + 14, y + 23, checkbox_x + 24, y + 9), fill=OXBLOOD, width=5)
        draw.rounded_rectangle((checkbox_x + 48, y + 10, right - 126, y + 18), radius=4, fill=LINE_SOFT)

    # seal accent
    seal_center = (706, 746)
    draw.ellipse((seal_center[0] - 92, seal_center[1] - 92, seal_center[0] + 92, seal_center[1] + 92), fill=DEEP_RED, outline=(95, 18, 29, 255), width=8)
    draw.ellipse((seal_center[0] - 58, seal_center[1] - 58, seal_center[0] + 58, seal_center[1] + 58), fill=(250, 241, 235, 255), outline=BRASS, width=6)
    draw.line((seal_center[0] - 24, seal_center[1] + 2, seal_center[0] - 2, seal_center[1] + 24), fill=OXBLOOD, width=14)
    draw.line((seal_center[0] - 2, seal_center[1] + 24, seal_center[0] + 30, seal_center[1] - 16), fill=OXBLOOD, width=14)

    # corner accent
    draw.ellipse((228, 192, 286, 250), fill=BRASS)

    return image


def write_iconset(master: Image.Image) -> None:
    ICONSET_DIR.mkdir(parents=True, exist_ok=True)
    sizes = {
        "icon_16x16.png": 16,
        "icon_16x16@2x.png": 32,
        "icon_32x32.png": 32,
        "icon_32x32@2x.png": 64,
        "icon_128x128.png": 128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png": 256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png": 512,
        "icon_512x512@2x.png": 1024,
    }
    for filename, px in sizes.items():
        master.resize((px, px), Image.Resampling.LANCZOS).save(ICONSET_DIR / filename)


def main() -> None:
    master = build_master()
    master.save(MASTER_PATH)
    write_iconset(master)
    master.save(ICNS_PATH)
    print(f"Wrote {MASTER_PATH}")
    print(f"Prepared iconset at {ICONSET_DIR}")
    print(f"Wrote {ICNS_PATH}")


if __name__ == "__main__":
    main()
