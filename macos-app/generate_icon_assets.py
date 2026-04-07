from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
MACOS_DIR = ROOT / "macos-app"
ICONSET_DIR = MACOS_DIR / "AppIcon.iconset"
MASTER_PATH = MACOS_DIR / "AppIcon-master.png"
ICNS_PATH = MACOS_DIR / "AppIcon.icns"

PARCHMENT = (247, 241, 234, 255)
ROSE = (236, 221, 217, 255)
INK = (40, 26, 28, 255)
OXBLOOD = (126, 31, 43, 255)
DEEP_RED = (155, 45, 58, 255)
BRASS = (181, 141, 86, 255)
SHADOW = (35, 12, 18, 55)
WHITE = (255, 255, 255, 255)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def lerp(a, b, t: float):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build_gradient(size: int) -> Image.Image:
    top = (253, 248, 243)
    mid = (239, 225, 220)
    bottom = (223, 198, 194)
    gradient = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)
    for y in range(size):
        t = y / max(1, size - 1)
        if t < 0.5:
            color = lerp(top, mid, t / 0.5)
        else:
            color = lerp(mid, bottom, (t - 0.5) / 0.5)
        draw.line((0, y, size, y), fill=color + (255,))
    return gradient


def build_master() -> Image.Image:
    size = 1024
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    image.paste(build_gradient(size), (0, 0), rounded_mask(size, 220))

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((110, 120, 914, 924), fill=(255, 255, 255, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    image.alpha_composite(glow)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((170, 170, 854, 854), radius=156, fill=SHADOW)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    image.alpha_composite(shadow)

    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((176, 164, 848, 860), radius=160, fill=PARCHMENT, outline=(211, 191, 183, 255), width=6)

    draw.rounded_rectangle((252, 236, 704, 306), radius=28, fill=OXBLOOD)
    draw.rounded_rectangle((724, 220, 800, 420), radius=24, fill=BRASS)
    draw.polygon(((724, 394), (800, 394), (762, 454)), fill=(193, 154, 98, 255))

    for box in (
        (254, 362, 694, 390),
        (254, 420, 774, 448),
        (254, 478, 722, 506),
        (254, 536, 654, 564),
    ):
        draw.rounded_rectangle(box, radius=14, fill=ROSE)

    center = (520, 608)
    outer = 188
    inner = 138
    draw.ellipse((center[0] - outer, center[1] - outer, center[0] + outer, center[1] + outer), fill=(245, 233, 227, 255), outline=OXBLOOD, width=18)
    draw.ellipse((center[0] - inner, center[1] - inner, center[0] + inner, center[1] + inner), fill=(251, 245, 240, 255), outline=(180, 126, 116, 255), width=8)

    import math
    for angle in range(0, 360, 30):
        radians = math.radians(angle)
        x1 = center[0] + int(150 * math.cos(radians))
        y1 = center[1] + int(150 * math.sin(radians))
        x2 = center[0] + int(174 * math.cos(radians))
        y2 = center[1] + int(174 * math.sin(radians))
        draw.line((x1, y1, x2, y2), fill=BRASS, width=10)

    draw.ellipse((470, 554, 570, 654), outline=OXBLOOD, width=12)
    draw.line((434, 646, 606, 646), fill=OXBLOOD, width=12)
    draw.line((438, 646, 412, 724), fill=OXBLOOD, width=10)
    draw.line((602, 646, 628, 724), fill=OXBLOOD, width=10)
    draw.arc((372, 710, 500, 792), start=0, end=180, fill=OXBLOOD, width=9)
    draw.arc((540, 710, 668, 792), start=0, end=180, fill=OXBLOOD, width=9)

    draw.ellipse((640, 676, 846, 882), fill=DEEP_RED, outline=(94, 19, 30, 255), width=10)
    draw.line((700, 780, 742, 820), fill=WHITE, width=24)
    draw.line((742, 820, 810, 732), fill=WHITE, width=24)

    draw.ellipse((248, 182, 304, 238), fill=BRASS)
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
