#!/usr/bin/env python3
"""Scan all product directories using Groq vision API."""
import base64
import json
import os
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.environ.get("GROQ_API_KEY", "")
if not API_KEY:
    key_file = os.path.expanduser("~/.groq_api_key")
    if os.path.exists(key_file):
        API_KEY = open(key_file).read().strip()

if not API_KEY:
    print("ERROR: No GROQ_API_KEY", file=sys.stderr)
    sys.exit(1)

PHOTOS_DIR = Path("/home/dmannu/quorin-site/PHOTOS")
PROMPT = """Analyze this product image. Return ONLY a JSON object (no markdown, no backticks, no extra text):
{
  "product_name": "short product name",
  "description": "one-sentence product description",
  "category": "category name",
  "tags": ["tag1", "tag2", "tag3"],
  "price_hint": "budget/mid/premium",
  "materials": ["material1"],
  "colors": ["color1"]
}
Describe what the product is, its materials, colors, and intended use."""

def analyze_dir(dir_name, image_paths):
    """Analyze first image in a directory and return product info."""
    first_img = None
    for p in image_paths:
        if p.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            first_img = p
            break
    if not first_img:
        return None

    try:
        b64 = base64.b64encode(open(first_img, 'rb').read()).decode()
        from groq import Groq
        client = Groq(api_key=API_KEY)

        resp = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{"role": "user", "content": [
                {"type": "text", "text": PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
            ]}],
            temperature=0.3,
            max_completion_tokens=1024,
            top_p=1,
            stream=False
        )
        result = resp.choices[0].message.content
        return {"dir": dir_name, "image_count": len(image_paths), "result": result}
    except Exception as e:
        return {"dir": dir_name, "image_count": len(image_paths), "error": str(e)}

# Collect all directories
results = []
for dir_path in sorted(PHOTOS_DIR.iterdir()):
    if not dir_path.is_dir():
        continue
    files = sorted([f for f in dir_path.rglob("*") if f.is_file()])
    info = analyze_dir(dir_path.name, files)
    if info:
        results.append(info)
    time.sleep(0.5)

# Save all raw results
with open("/home/dmannu/quorin-site/PHOTOS/raw_results.json", "w") as f:
    json.dump(results, f, indent=2)

# Print summary
print(f"\nScanned {len(results)} directories")
for r in results:
    status = "OK" if "result" in r else f"ERROR: {r.get('error', 'unknown')}"
    print(f"  [{status}] {r['dir']} ({r['image_count']} images)")
print(f"\nResults saved to raw_results.json")
