#!/usr/bin/env python3
"""Regenerate clean logo assets from the uploaded dark wordmark.

The uploaded webp has a dark serif wordmark on a near-white background.
We threshold the background to transparent and emit:
  - public/images/logo-clean-transparent.png : dark wordmark, transparent bg (header)
  - public/images/logo-clean-white-inverted.png : pure white wordmark, transparent bg (footer)
"""
from PIL import Image
import numpy as np
try:
    from scipy import ndimage
except ImportError:
    ndimage = None

SRC = "/home/ubuntu/upload/yorkville_clean_header_wordmark.webp"
OUT_DIR = "public/images"

img = Image.open(SRC).convert("RGB")
arr = np.array(img).astype(np.float32)

# Luminance: dark text on light bg
lum = arr.mean(axis=2)

# Background is ~248-253. Text is dark (<150). Soft alpha ramp between 140 and 235.
lo, hi = 130.0, 238.0
alpha = np.clip((hi - lum) / (hi - lo), 0.0, 1.0)

# Suppress faint noise: anything below a small alpha becomes fully transparent
alpha[alpha < 0.08] = 0.0

# Remove large low-alpha ghost blocks: if alpha is in the faint range AND surrounded
# by transparent pixels (a large connected faint region), zero it out.
from scipy import ndimage
faint = (alpha > 0) & (alpha < 0.35)
labels, n = ndimage.label(faint)
for i in range(1, n + 1):
    size = (labels == i).sum()
    if size > 3000:  # large ghost blocks (e.g. white card rectangle) → remove
        alpha[labels == i] = 0.0

# Anti-aliased text color: compute color from original, with white background removed.
# Foreground color estimate = (observed - bg*alpha) / alpha, clamp to [0,255].
bg = np.array([252.0, 250.0, 246.0])
fg = np.zeros_like(arr)
safe = alpha > 1e-3
fg[safe] = (arr[safe] - (1 - alpha[safe, None]) * bg) / alpha[safe, None]
fg = np.clip(fg, 0, 255)

out_dir = OUT_DIR
Image.MAX_IMAGE_PIXELS = None

# Dark wordmark (header)
dark = np.dstack([fg, alpha * 255]).astype(np.uint8)
dimg = Image.fromarray(dark, "RGBA")
# trim to content bbox with small padding
a255 = alpha > 0.3
ys, xs = np.where(a255)
pad = 8
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, arr.shape[0] - 1)
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, arr.shape[1] - 1)
dimg = dimg.crop((x0, y0, x1 + 1, y1 + 1))
dimg.save(f"{out_dir}/logo-clean-transparent.png")
print("header:", dimg.size)

# White wordmark (footer) - alpha from dark version, color pure white
white = np.dstack([np.full_like(fg, 255.0), alpha * 255]).astype(np.uint8)
wimg = Image.fromarray(white, "RGBA").crop((x0, y0, x1 + 1, y1 + 1))
wimg.save(f"{out_dir}/logo-clean-white-inverted.png")
print("footer inverted:", wimg.size)

# White card version (about page) - white text on a card
# keep as is (user previously approved), but regenerate to match trim
wcard = Image.new("RGBA", wimg.size, (255, 255, 255, 255))
wcard.alpha_composite(wimg)
wcard.save(f"{out_dir}/logo-clean-white.png")
print("white card:", wcard.size)
