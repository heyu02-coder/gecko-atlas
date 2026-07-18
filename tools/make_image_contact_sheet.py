from pathlib import Path
from PIL import Image, ImageDraw
import json
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

root = Path("assets/museum")
data = json.loads((root / "image-manifest.json").read_text(encoding="utf-8"))
for item in data["items"]:
    print(f"{item['subject']} | {item['fileTitle']} | {item['license']} | {item['author']}")

thumbs = []
for item in data["items"]:
    image = Image.open(item["desktop"]).convert("RGB")
    image.thumbnail((360, 220))
    card = Image.new("RGB", (380, 270), "#101710")
    card.paste(image, ((380 - image.width) // 2, 8))
    ImageDraw.Draw(card).text((10, 238), item["subject"], fill="white")
    thumbs.append(card)

sheet = Image.new("RGB", (380 * 4, 270 * 5), "#050805")
for index, image in enumerate(thumbs):
    sheet.paste(image, ((index % 4) * 380, (index // 4) * 270))
sheet.save(".review/museum-image-library.jpg", quality=88)
