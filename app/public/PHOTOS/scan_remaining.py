#!/usr/bin/env python3
"""Scan the 3 failed directories with resized images."""
import base64
import json
import os
import sys
from pathlib import Path

# Try to install pillow for resizing
subprocess_result = os.system("/run/media/dmannu/D/venvs/mastervenv/bin/pip install pillow -q 2>/dev/null")

if subprocess_result == 0:
    from PIL import Image
    RESIZE_METHOD = "pillow"
else:
    RESIZE_METHOD = "none"

API_KEY = os.environ.get("GROQ_API_KEY", "")
if not API_KEY:
    key_file = os.path.expanduser("~/.groq_api_key")
    if os.path.exists(key_file):
        API_KEY = open(key_file).read().strip()

PHOTOS_DIR = Path("/home/dmannu/quorin-site/PHOTOS")

FAILED_DIRS = ["Crushed glass", "Soap Dye + mould", "resin pigment"]
PROMPT = """Analyze this product image. Return ONLY a JSON object:
{
  "product_name": "short name",
  "description": "one sentence",
  "category": "category",
  "tags": ["tag1", "tag2"],
  "price_hint": "budget/mid/premium",
  "materials": ["material"],
  "colors": ["color"]
}"""

def resize_for_api(path):
    """Resize image to fit Groq API limits (< 4MB)."""
    if RESIZE_METHOD == "pillow":
        img = Image.open(path)
        img.thumbnail((800, 600), Image.LANCZOS)
        # Save to temp
        temp = path.with_suffix('.temp.jpg')
        img.convert('RGB').save(temp, quality=80)
        return str(temp)
    return str(path)

def analyze(image_path):
    from groq import Groq
    client = Groq(api_key=API_KEY)
    
    resized = resize_for_api(image_path)
    b64 = base64.b64encode(open(resized, 'rb').read()).decode()
    
    resp = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role": "user", "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]}],
        temperature=0.3,
        max_completion_tokens=1024,
        top_p=1,
        stream=False
    )
    return resp.choices[0].message.content

for dir_name in FAILED_DIRS:
    dir_path = PHOTOS_DIR / dir_name
    if not dir_path.exists():
        continue
    
    files = sorted([f for f in dir_path.iterdir() if f.is_file()])
    image_files = [f for f in files if f.suffix.lower() in ['.png', '.jpg', '.jpeg']]
    
    if not image_files:
        print(f"[SKIP] {dir_name}: no images")
        continue
    
    print(f"Scanning {dir_name} ({len(image_files)} images)...")
    result = analyze(image_files[0])
    print(f"Result: {result[:100]}...")
    
    # Save to file
    with open(f"/home/dmannu/quorin-site/PHOTOS/{dir_name.replace(' ', '_')}_scan.json", "w") as f:
        f.write(result)
    
    print(f"[OK] {dir_name}\n")

print("All remaining directories scanned!")
