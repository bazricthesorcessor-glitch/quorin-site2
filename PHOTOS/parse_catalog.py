#!/usr/bin/env python3
"""Parse raw scan results into a structured product catalog."""
import json
import re
from pathlib import Path

raw = json.load(open("/home/dmannu/quorin-site/PHOTOS/raw_results.json"))

products = []
for item in raw:
    if "error" in item:
        # Try to parse from directory name as fallback
        dir_name = item["dir"]
        # Generate a reasonable product from dir name
        product = {
            "id": len(products) + 1,
            "product_name": dir_name.title(),
            "description": f"Craft supply in {dir_name.title()} category",
            "category": dir_name.title(),
            "tags": [dir_name.lower().replace(" ", "-"), "craft-supply"],
            "price_hint": "budget",
            "image_count": item.get("image_count", 0),
            "image_path": f"/PHOTOS/{dir_name}/1.png",
            "price": 0,
            "featured": False,
            "status": "pending-scan"
        }
        products.append(product)
        continue
    
    result_text = item["result"]
    # Extract JSON from the response (may have markdown backticks)
    match = re.search(r'\{.*\}', result_text, re.DOTALL)
    if not match:
        continue
    
    try:
        data = json.loads(match.group())
    except json.JSONDecodeError:
        continue
    
    product = {
        "id": len(products) + 1,
        "product_name": data.get("product_name", item["dir"].title()),
        "description": data.get("description", f"{data.get('product_name', item['dir'])} for crafting"),
        "category": data.get("category", item["dir"].title()),
        "tags": data.get("tags", [item["dir"].lower().replace(" ", "-")]),
        "price_hint": data.get("price_hint", "budget"),
        "image_count": item.get("image_count", 0),
        "image_path": f"/PHOTOS/{item['dir']}/1.png",
        "price": 0,
        "featured": False,
        "status": "scanned"
    }
    products.append(product)

# Assign prices based on hint and category
price_map = {
    "budget": {"min": 99, "max": 499},
    "mid": {"min": 499, "max": 1999},
    "premium": {"min": 1999, "max": 4999}
}

import random
random.seed(42)  # deterministic

for p in products:
    hint = p["price_hint"]
    price_range = price_map[hint]
    p["price"] = random.randint(price_range["min"], price_range["max"])
    if p["image_count"] > 20:
        p["featured"] = True

# Save catalog
with open("/home/dmannu/quorin-site/PHOTOS/product_catalog.json", "w") as f:
    json.dump(products, f, indent=2)

print(f"Catalog created: {len(products)} products")
for p in products:
    print(f"  #{p['id']:2d} {p['product_name']:30s} ₹{p['price']:6d} [{p['price_hint']:6s}] ({p['status']})")
