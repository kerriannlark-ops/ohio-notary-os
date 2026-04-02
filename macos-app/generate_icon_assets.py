from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
MACOS_DIR = ROOT / "macos-app"
ICONSET_DIR = MACOS_DIR / "AppIcon.iconset"
MASTER_PATH = MACOS_DIR / "AppIcon-master.png"
ICNS_PATH = MACOS_DIR / "AppIcon.icns"

PARCHMENT = (247, 244, 237, 255)
MIST = (232, 239, 243, 255)
INK = (31, 45, 53, 255)
TEAL = (59, 107, 103, 255)
BLUE = (52, 106, 137, 255)
RUST = (181, 110, 92, 255)
BRASS = (199, 160, 98, 255)
WHITE = (255, 255, 255, 255)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def lerp(a, b, t: float):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build_gradient(size: int) -> Image.Image:
    top = (252, 248, 241)
    mid = (232, 239, 243)
    bottom = (219, 230, 233)
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
    gdraw.ellipse((120, 120, 904, 904), fill=(255, 255, 255, 140))
    glow = glow.filter(ImageFilter.GaussianBlur(24))
    image.alpha_composite(glow)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((170, 170, 854, 854), radius=156, fill=(10, 28, 37, 45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    image.alpha_composite(shadow)

    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((176, 164, 848, 860), radius=160, fill=PARCHMENT, outline=(207, 216, 219, 255), width=6)

    draw.rounded_rectangle((252, 236, 704, 306), radius=28, fill=BLUE)
    draw.rounded_rectangle((724, 220, 796, 418), radius=24, fill=RUST)
    draw.polygon(((724, 392), (796, 392), (760, 452)), fill=(205, 131, 113, 255))

    for box in (
        (254, 362, 692, 390),
        (254, 420, 768, 448),
        (254, 478, 722, 506),
        (254, 536, 654, 564),
    ):
        draw.rounded_rectangle(box, radius=14, fill=MIST)

    center = (524, 566)
    outer = 176
    inner = 132
    draw.ellipse((center[0] - outer, center[1] - outer, center[0] + outer, center[1] + outer), fill=(228, 238, 241, 255), outline=BLUE, width=16)
    draw.ellipse((center[0] - inner, center[1] - inner, center[0] + inner, center[1] + inner), fill=(245, 249, 250, 255), outline=(118, 157, 177, 255), width=8)

    for angle in range(0, 360, 30):
        import math
        radians = math.radians(angle)
        x1 = center[0] + int(144 * math.cos(radians))
        y1 = center[1] + int(144 * math.sin(radians))
        x2 = center[0] + int(166 * math.cos(radians))
        y2 = center[1] + int(166 * math.sin(radians))
        draw.line((x1, y1, x2, y2), fill=BRASS, width=10)

    draw.ellipse((470, 512, 578, 620), outline=TEAL, width=12)
    draw.line((440, 610, 604, 610), fill=TEAL, width=12)
    draw.line((438, 610, 412, 690), fill=TEAL, width=10)
    draw.line((606, 610, 632, 690), fill=TEAL, width=10)
    draw.arc((374, 676, 500, 758), start=0, end=180, fill=TEAL, width=9)
    draw.arc((544, 676, 670, 758), start=0, end=180, fill=TEAL, width=9)

    draw.ellipse((648, 648, 842, 842), fill=TEAL, outline=(42, 86, 83, 255), width=10)
    draw.line((704, 748, 744, 786), fill=WHITE, width=24)
    draw.line((744, 786, 808, 706), fill=WHITE, width=24)

    draw.ellipse((248, 182, 300, 234), fill=BRASS)

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
