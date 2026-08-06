"""
Generates the GREX AI brand-mark raster assets (app icon, adaptive icon
foreground, splash icon, favicon) as an original radial-gradient "orb"
mark on transparent or solid backgrounds, matching the app's design
tokens (see src/constants/theme.ts).

Run once during scaffolding: python3 scripts/generate_assets.py
Safe to re-run any time to regenerate the assets.
"""
import math
from PIL import Image, ImageDraw, ImageFilter

BG = (10, 10, 15, 255)          # #0A0A0F
ORB_CENTER = (167, 139, 250)    # #A78BFA (light violet highlight)
ORB_EDGE = (91, 33, 182)        # #5B21B6 (deep violet)
ORB_GLOW = (139, 92, 246)       # #8B5CF6 (brand purple)


def radial_gradient_orb(circle_size, center_color, edge_color, pad_ratio=0.0):
    """Draws a smooth radial-gradient filled circle of `circle_size`
    diameter, inset within a square RGBA canvas that is padded by
    `pad_ratio` on every side. The padding matters when the caller
    plans to Gaussian-blur the result: without transparent margin the
    blur has nowhere to fade into and gets clipped into a visible
    square by the layer's own canvas edge."""
    canvas_size = int(circle_size * (1 + 2 * pad_ratio))
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    px = img.load()
    cx, cy = canvas_size / 2, canvas_size / 2
    r = circle_size / 2
    for y in range(canvas_size):
        for x in range(canvas_size):
            d = math.hypot(x - cx, y - cy) / r
            if d > 1:
                continue
            t = d ** 1.15
            cr = round(center_color[0] + (edge_color[0] - center_color[0]) * t)
            cg = round(center_color[1] + (edge_color[1] - center_color[1]) * t)
            cb = round(center_color[2] + (edge_color[2] - center_color[2]) * t)
            px[x, y] = (cr, cg, cb, 255)
    return img, canvas_size


def make_icon(path, canvas_size=1024, orb_ratio=0.62, with_bg=True):
    canvas = Image.new("RGBA", (canvas_size, canvas_size), BG if with_bg else (0, 0, 0, 0))
    orb_size = int(canvas_size * orb_ratio)

    # soft ambient glow behind the orb — generous padding so the blur
    # fades to fully transparent well before its own canvas edge
    glow_circle = int(orb_size * 1.05)
    glow, glow_canvas = radial_gradient_orb(glow_circle, ORB_GLOW, ORB_GLOW, pad_ratio=0.6)
    glow = glow.filter(ImageFilter.GaussianBlur(glow_circle * 0.12))
    glow.putalpha(glow.split()[3].point(lambda a: int(a * 0.30)))
    off = (canvas_size - glow_canvas) // 2
    canvas.alpha_composite(glow, (off, off))

    # the orb itself — crisp gradient disk, no blur
    orb, orb_canvas = radial_gradient_orb(orb_size, ORB_CENTER, ORB_EDGE, pad_ratio=0.0)
    off = (canvas_size - orb_canvas) // 2
    canvas.alpha_composite(orb, (off, off))

    # small glassy highlight, upper-left of the orb
    hl_circle = int(orb_size * 0.24)
    hl, hl_canvas = radial_gradient_orb(hl_circle, (255, 255, 255), (255, 255, 255), pad_ratio=0.9)
    hl = hl.filter(ImageFilter.GaussianBlur(hl_circle * 0.22))
    hl.putalpha(hl.split()[3].point(lambda a: int(a * 0.50)))
    hx = (canvas_size - orb_size) // 2 + int(orb_size * 0.20) - (hl_canvas - hl_circle) // 2
    hy = (canvas_size - orb_size) // 2 + int(orb_size * 0.18) - (hl_canvas - hl_circle) // 2
    canvas.alpha_composite(hl, (hx, hy))

    canvas.save(path)
    print("wrote", path, canvas.size)


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "..", "assets", "images")
    os.makedirs(out, exist_ok=True)
    make_icon(os.path.join(out, "icon.png"), 1024, orb_ratio=0.60, with_bg=True)
    make_icon(os.path.join(out, "adaptive-icon-foreground.png"), 1024, orb_ratio=0.42, with_bg=False)
    make_icon(os.path.join(out, "splash-icon.png"), 768, orb_ratio=0.66, with_bg=False)
    make_icon(os.path.join(out, "favicon.png"), 196, orb_ratio=0.66, with_bg=True)
    print("done")
