#!/usr/bin/env python3
"""Standalone test script for analyze_image.py — tests the Groq multimodal call."""

import base64
import json
import os
import sys

# Read image
image_path = sys.argv[1] if len(sys.argv) > 1 else "/home/dmannu/quorin-site/PHOTOS/Resin/1.png"
prompt = sys.argv[2] if len(sys.argv) > 2 else "Analyze this product image in detail. Return ONLY valid JSON with these exact fields: product_name, description, category, tags (array), price_hint (budget/mid/premium). Describe colors, materials, textures, and what the product is used for."

api_key = os.environ.get("GROQ_API_KEY", "")
if not api_key:
    key_file = os.path.expanduser("~/.groq_api_key")
    if os.path.exists(key_file):
        api_key = open(key_file).read().strip()

if not api_key:
    print("ERROR: No GROQ_API_KEY found", file=sys.stderr)
    sys.exit(1)

# Read and encode image
with open(image_path, "rb") as f:
    b64_data = base64.b64encode(f.read()).decode("utf-8")

print(f"Testing with image: {image_path}")
print(f"Image size: {os.path.getsize(image_path)} bytes")
print(f"Prompt: {prompt}\n")
print("=" * 60)

os.environ["GROQ_API_KEY"] = api_key

from groq import Groq

client = Groq()

completion = client.chat.completions.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_data}"}},
            ],
        }
    ],
    temperature=0.3,
    max_completion_tokens=2048,
    top_p=1,
    stream=False,
)

print(completion.choices[0].message.content)
print("=" * 60)
print(f"\nToken usage: {completion.usage}")
