from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path('/home/ubuntu/upload/Almond.png')
colour_dir = root / 'public' / 'images' / 'colours'
colour_dir.mkdir(parents=True, exist_ok=True)
if source.exists():
    Image.open(source).convert('RGBA').save(colour_dir / 'Almond.png')

logo_path = root / 'public' / 'images' / 'logo.png'
out_path = root / 'public' / 'images' / 'logo-transparent.png'
im = Image.open(logo_path).convert('RGBA')
pixels = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = pixels[x, y]
        # Remove the light paper background so the monogram merges into the header.
        if r > 238 and g > 238 and b > 238:
            pixels[x, y] = (r, g, b, 0)
# Remove dark border pixels connected to the outer edge, while preserving the central mark.
from collections import deque
seen = set()
queue = deque()
for x in range(im.width):
    queue.extend([(x, 0), (x, im.height - 1)])
for y in range(im.height):
    queue.extend([(0, y), (im.width - 1, y)])
while queue:
    x, y = queue.popleft()
    if (x, y) in seen or x < 0 or y < 0 or x >= im.width or y >= im.height:
        continue
    seen.add((x, y))
    r, g, b, a = pixels[x, y]
    if a and r < 120 and g < 120 and b < 120:
        pixels[x, y] = (r, g, b, 0)
        queue.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
    elif a and r > 220 and g > 220 and b > 220:
        queue.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
im.save(out_path)
print(f'Prepared {colour_dir / "Almond.png"} and {out_path}')
