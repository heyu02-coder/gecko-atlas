"""Build a license-verified Wikimedia Commons image library for Gecko Atlas."""

from __future__ import annotations

import html
import io
import json
import re
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets" / "museum"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "GeckoAtlasPortfolio/1.0 (educational image attribution builder)"

SPECS = [
    ("species/tokay-gecko", "Gekko gecko", "蛤蚧", "Gekko gecko tokay gecko"),
    ("species/leopard-gecko", "Eublepharis macularius", "豹纹守宫", "Eublepharis macularius leopard gecko"),
    ("species/crested-gecko", "Correlophus ciliatus", "睫角守宫", "Correlophus ciliatus crested gecko"),
    ("species/blue-tongue", "Tiliqua scincoides", "蓝舌石龙子", "Tiliqua scincoides blue tongue"),
    ("species/marine-iguana", "Amblyrhynchus cristatus", "海鬣蜥", "Amblyrhynchus cristatus marine iguana"),
    ("species/panther-chameleon", "Furcifer pardalis", "豹纹变色龙", "Furcifer pardalis panther chameleon"),
    ("species/komodo-dragon", "Varanus komodoensis", "科莫多巨蜥", "Varanus komodoensis Komodo dragon"),
    ("anatomy/gecko-feet", "Gecko toe pads", "壁虎脚趾吸附结构", "Gecko feet"),
    ("anatomy/lizard-tail", "Lizard tail autotomy", "蜥蜴尾部", "Long-Tailed Grass Lizard"),
    ("anatomy/gecko-eye", "Gecko eye", "壁虎眼睛", "The eye of a crested gecko"),
    ("anatomy/chameleon-skin", "Chameleon skin", "变色龙皮肤与鳞片", "Panther chameleon closeup"),
    ("anatomy/chameleon-tongue", "Chameleon tongue", "变色龙伸舌捕食", "Chameleons Tongue"),
    ("habitats/rainforest", "Tropical rainforest", "热带雨林", "tropical rainforest landscape"),
    ("habitats/desert", "Desert", "沙漠", "desert dunes landscape"),
    ("habitats/rock", "Rock cliff", "岩壁", "rock cliff landscape"),
    ("habitats/city", "Urban night", "城市建筑", "city buildings at night"),
    ("habitats/island", "Galapagos Islands", "岛屿生态", "Galapagos island landscape"),
]

ALLOWED_LICENSE_PARTS = (
    "cc0", "public domain", "cc by ", "cc-by-", "cc by-sa", "cc-by-sa",
    "creative commons attribution", "creative commons cc0",
)


def request_json(params: dict) -> dict:
    params = {"format": "json", "formatversion": 2, "origin": "*", **params}
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=35) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 5:
                raise
            time.sleep(4 * (attempt + 1))


def clean_markup(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return " ".join(html.unescape(value).split())


def meta_value(metadata: dict, key: str) -> str:
    return clean_markup(metadata.get(key, {}).get("value", ""))


def search_candidates(query: str) -> list[dict]:
    result = request_json({
        "action": "query",
        "generator": "search",
        "gsrnamespace": 6,
        "gsrlimit": 15,
        "gsrsearch": f'filetype:bitmap {query}',
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": 1800,
    })
    return result.get("query", {}).get("pages", [])


def choose_candidate(query: str) -> tuple[dict, dict]:
    candidates = search_candidates(query)
    ranked = []
    keywords = [token.lower() for token in re.findall(r"[A-Za-z]{4,}", query)[:3]]
    exact_phrase = " ".join(keywords)
    for page in candidates:
        info = (page.get("imageinfo") or [{}])[0]
        metadata = info.get("extmetadata") or {}
        license_name = meta_value(metadata, "LicenseShortName")
        license_url = meta_value(metadata, "LicenseUrl")
        usage_terms = meta_value(metadata, "UsageTerms")
        license_text = f"{license_name} {usage_terms} {license_url}".lower()
        author = meta_value(metadata, "Artist") or meta_value(metadata, "Credit")
        if not any(part in license_text for part in ALLOWED_LICENSE_PARTS):
            continue
        min_width = 400 if query == "Chameleons Tongue" else 900
        min_height = 300 if query == "Chameleons Tongue" else 650
        if not author or info.get("width", 0) < min_width or info.get("height", 0) < min_height:
            continue
        title = page.get("title", "").lower()
        score = sum(4 for word in keywords if word in title)
        if exact_phrase and exact_phrase in re.sub(r"[^a-z]+", " ", title):
            score += 20
        score += min(info.get("width", 0), 5000) / 5000
        if "map" in title or "logo" in title or "museum specimen" in title:
            score -= 5
        ranked.append((score, page, info))
    if not ranked:
        raise RuntimeError(f"No allowed image candidate found for: {query}")
    ranked.sort(key=lambda item: item[0], reverse=True)
    return ranked[0][1], ranked[0][2]


def download_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 5:
                raise
            time.sleep(5 * (attempt + 1))


def save_webp(data: bytes, output: Path, max_width: int) -> tuple[int, int]:
    with Image.open(io.BytesIO(data)) as source:
        source = ImageOps.exif_transpose(source).convert("RGB")
        if source.width > max_width:
            height = round(source.height * max_width / source.width)
            source = source.resize((max_width, height), Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True, exist_ok=True)
        source.save(output, "WEBP", quality=82, method=6)
        return source.size


def main() -> None:
    manifest = []
    for index, (slug, subject, alt, query) in enumerate(SPECS, start=1):
        print(f"[{index:02d}/{len(SPECS)}] {subject}", flush=True)
        page, info = choose_candidate(query)
        metadata = info.get("extmetadata") or {}
        image_url = info.get("thumburl") or info["url"]
        data = download_bytes(image_url)
        folder = ASSET_ROOT / slug
        desktop_size = save_webp(data, folder / "hero-1600.webp", 1600)
        mobile_size = save_webp(data, folder / "hero-800.webp", 800)
        title = page["title"].removeprefix("File:")
        manifest.append({
            "id": slug.replace("/", "-"),
            "subject": subject,
            "alt": alt,
            "fileTitle": title,
            "author": meta_value(metadata, "Artist") or meta_value(metadata, "Credit"),
            "license": meta_value(metadata, "LicenseShortName") or meta_value(metadata, "UsageTerms"),
            "licenseUrl": meta_value(metadata, "LicenseUrl"),
            "sourcePage": info.get("descriptionurl"),
            "originalUrl": info.get("url"),
            "desktop": str((folder / "hero-1600.webp").relative_to(ROOT)).replace("\\", "/"),
            "mobile": str((folder / "hero-800.webp").relative_to(ROOT)).replace("\\", "/"),
            "desktopSize": list(desktop_size),
            "mobileSize": list(mobile_size),
            "changes": ("First frame extracted from the source GIF, resized, converted to WebP, and displayed with CSS crop/color treatment."
                        if title.lower().endswith(".gif") else
                        "Resized, converted to WebP, and displayed with CSS crop/color treatment."),
        })
        time.sleep(1.5)
    manifest_path = ASSET_ROOT / "image-manifest.json"
    manifest_path.write_text(json.dumps({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": "Wikimedia Commons", "items": manifest}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {manifest_path} with {len(manifest)} licensed images.")


if __name__ == "__main__":
    main()
