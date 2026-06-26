#!/usr/bin/env python3
"""Build final product catalog with all scan data."""
import json
import random
import re
from pathlib import Path

random.seed(42)

catalog = [
    # 1. COMBOS - Jigong Heat Tool
    {
        "id": "combo-heat-tool",
        "product_name": "Jigong Heat Tool Kit",
        "description": "Professional heat gun kit for resin crafting, candle making, and DIY projects",
        "category": "Tools",
        "tags": ["heat tool", "hot air gun", "crafting", "diy"],
        "price": 426,
        "mrp": 899,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/COMBOS/Combo - 1 ( heat gun)/1.png"],
        "featured": True,
        "stock": 50,
        "status": "active"
    },
    # 2. Candle Pigment 2.0
    {
        "id": "candle-pigment",
        "product_name": "Quorin Candle Pigment Set",
        "description": "Liquid pigment for coloring candles in 7 vibrant colors",
        "category": "Candle Making",
        "tags": ["candle making", "pigment", "colorant", "liquid"],
        "price": 156,
        "mrp": 349,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/candle pigments/1.png"],
        "featured": True,
        "stock": 120,
        "status": "active"
    },
    # 3. Crushed Glass
    {
        "id": "crushed-glass",
        "product_name": "Crushed Glass Pack",
        "description": "Clear crushed glass for resin art in 3mm size",
        "category": "Resin Art",
        "tags": ["crushed glass", "resin art", "decoration"],
        "price": 299,
        "mrp": 599,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/Crushed glass/main image/crushed glass.png"],
        "featured": False,
        "stock": 80,
        "status": "active"
    },
    # 4. Deburring Tool
    {
        "id": "deburring-tool",
        "product_name": "Deburring System",
        "description": "Professional deburring tool for removing burrs and smoothing surfaces",
        "category": "Tools",
        "tags": ["deburring", "tool", "crafting", "surface finish"],
        "price": 1062,
        "mrp": 1999,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/Deburring tool/1.jpg"],
        "featured": False,
        "stock": 30,
        "status": "active"
    },
    # 5. Fragrances
    {
        "id": "fragrance-oil",
        "product_name": "Quorin Fragrance Oil Collection",
        "description": "Premium fragrance oils for candle making and aromatherapy",
        "category": "Fragrances",
        "tags": ["fragrance oil", "sandalwood", "essential oil", "candle"],
        "price": 224,
        "mrp": 499,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/Fragrances/variation 1/1.png"],
        "featured": True,
        "stock": 200,
        "status": "active"
    },
    # 6. Glitter
    {
        "id": "glitter",
        "product_name": "Quorin Glitter Collection",
        "description": "Premium glitter powder for decorative crafting in multiple colors",
        "category": "Craft Supplies",
        "tags": ["glitter", "crafting", "decorative", "art"],
        "price": 213,
        "mrp": 449,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/GLITTER/bold party/1.png"],
        "featured": True,
        "stock": 150,
        "status": "active"
    },
    # 7. Hand Drill
    {
        "id": "hand-drill",
        "product_name": "Resin Craft Drill Kit",
        "description": "Hand drill with 4 bits for resin and craft work",
        "category": "Tools",
        "tags": ["hand drill", "resin", "crafting", "tools"],
        "price": 170,
        "mrp": 399,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/HAND DRILL WITH 4 BITS/hand drll.jpg"],
        "featured": False,
        "stock": 40,
        "status": "active"
    },
    # 8. Jet Lighter
    {
        "id": "jet-lighter",
        "product_name": "Quorin Blowtorch Jet Lighter",
        "description": "Professional blowtorch for removing air bubbles from resin and candle tops",
        "category": "Tools",
        "tags": ["blowtorch", "lighter", "resin", "crafting"],
        "price": 708,
        "mrp": 1299,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/Jet lighter/Jet.png"],
        "featured": False,
        "stock": 25,
        "status": "active"
    },
    # 9. Liquid Deco Paint
    {
        "id": "liquid-deco-paint",
        "product_name": "Quorin Liquid Deco Paint",
        "description": "Water-based liquid decorative paint for artistic applications",
        "category": "Paint",
        "tags": ["paint", "liquid", "decorative", "art"],
        "price": 445,
        "mrp": 899,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/Liquid deco paint/1.png"],
        "featured": True,
        "stock": 75,
        "status": "active"
    },
    # 10. Moulds Combo
    {
        "id": "moulds-combo",
        "product_name": "Jewellery Mould Set",
        "description": "Silicone moulds for making resin jewellery",
        "category": "Moulds",
        "tags": ["jewelry mould", "resin mould", "jewellery making", "silicone"],
        "price": 478,
        "mrp": 999,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/MOULDS COMBO/1/1.png"],
        "featured": True,
        "stock": 60,
        "status": "active"
    },
    # 11. Magnets Combo
    {
        "id": "magnets-combo",
        "product_name": "Neodymium Magnets Set",
        "description": "Strong round neodymium magnets in various sizes",
        "category": "Supplies",
        "tags": ["neodymium", "magnets", "crafting", "strong"],
        "price": 378,
        "mrp": 799,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/Magnets combo/1.png"],
        "featured": False,
        "stock": 90,
        "status": "active"
    },
    # 12. Resin
    {
        "id": "resin",
        "product_name": "Quorin Epoxy Resin & Hardener",
        "description": "Two-part crystal clear epoxy resin system for art and crafts",
        "category": "Resin Art",
        "tags": ["epoxy", "resin", "hardener", "crystal clear"],
        "price": 677,
        "mrp": 1499,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/Resin/1.png"],
        "featured": True,
        "stock": 100,
        "status": "active"
    },
    # 13. Soap Dye + Mould
    {
        "id": "soap-dye-mould",
        "product_name": "Soap Making Kit with Mould",
        "description": "Complete soap making kit with pigments and silicone mould",
        "category": "Soap Making",
        "tags": ["soap making", "mould", "kit", "diy"],
        "price": 899,
        "mrp": 1799,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/Soap Dye + mould/1.png"],
        "featured": True,
        "stock": 45,
        "status": "active"
    },
    # 14. Soap Dye
    {
        "id": "soap-dye",
        "product_name": "Quorin Soap Pigment Set",
        "description": "Liquid soap pigment in 8 vibrant colors",
        "category": "Soap Making",
        "tags": ["soap making", "pigment", "colorant", "liquid"],
        "price": 315,
        "mrp": 699,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/Soap dye/1.png"],
        "featured": False,
        "stock": 110,
        "status": "active"
    },
    # 15. UV Resin Combo
    {
        "id": "uv-resin-combo",
        "product_name": "UV Resin Kit",
        "description": "UV-curing resin kit for nail art and quick-cure crafting",
        "category": "Resin Art",
        "tags": ["UV resin", "nail art", "crafting", "quick cure"],
        "price": 564,
        "mrp": 1199,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/UV Resin combo/1.png"],
        "featured": False,
        "stock": 70,
        "status": "active"
    },
    # 16. Wick Combo
    {
        "id": "wick-combo",
        "product_name": "Candle Wick Set",
        "description": "Premium cotton wicks for candle making in multiple sizes",
        "category": "Candle Making",
        "tags": ["wicks", "candle making", "cotton", "crafting"],
        "price": 114,
        "mrp": 249,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/Wick COMBOS/1/1.png"],
        "featured": False,
        "stock": 200,
        "status": "active"
    },
    # 17. Christmas Candles
    {
        "id": "christmas-candles",
        "product_name": "Quorin Christmas Candle Set",
        "description": "Handcrafted candles for the festive season",
        "category": "Candles",
        "tags": ["candles", "christmas", "festive", "handcrafted"],
        "price": 690,
        "mrp": 1499,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/christmas candles/1.png"],
        "featured": False,
        "stock": 50,
        "status": "active"
    },
    # 18. Eco Cast
    {
        "id": "eco-cast",
        "product_name": "Quorin Eco Cast Water-Based Product",
        "description": "Eco-friendly water-based casting compound for crafts",
        "category": "Resin Art",
        "tags": ["eco", "water-based", "casting", "crafting"],
        "price": 210,
        "mrp": 449,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/eco-cast/1.png"],
        "featured": False,
        "stock": 80,
        "status": "active"
    },
    # 19. Gilding Glue
    {
        "id": "gilding-glue",
        "product_name": "Quorin Gilding Glue",
        "description": "Premium adhesive for gold leafing and gilding projects",
        "category": "Adhesives",
        "tags": ["gilding", "gold leaf", "adhesive", "crafting"],
        "price": 218,
        "mrp": 449,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/gilding glue/1.png"],
        "featured": False,
        "stock": 90,
        "status": "active"
    },
    # 20. Metal Hook
    {
        "id": "metal-hook",
        "product_name": "Brass Latch & Hook Set",
        "description": "Decorative brass latches and hooks for jewelry boxes and crafts",
        "category": "Hardware",
        "tags": ["brass", "latch", "hook", "hardware"],
        "price": 357,
        "mrp": 749,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/metal hook_/1.png"],
        "featured": False,
        "stock": 100,
        "status": "active"
    },
    # 21. Resin Bubble Remover
    {
        "id": "resin-bubble-remover",
        "product_name": "Resin Bubble Remover Tool",
        "description": "Specialized tool for removing air bubbles from resin crafts",
        "category": "Tools",
        "tags": ["resin", "bubble remover", "tool", "crafting"],
        "price": 407,
        "mrp": 849,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/resin bubble remover/1.png"],
        "featured": False,
        "stock": 55,
        "status": "active"
    },
    # 22. Resin Pigment
    {
        "id": "resin-pigment",
        "product_name": "Quorin Resin Pigment",
        "description": "Liquid pigment for coloring resin crafts",
        "category": "Resin Art",
        "tags": ["resin", "pigment", "colorant", "liquid"],
        "price": 112,
        "mrp": 249,
        "price_hint": "budget",
        "image_paths": ["/PHOTOS/resin pigment/6/7.png"],
        "featured": False,
        "stock": 150,
        "status": "active"
    },
    # 23. Silica
    {
        "id": "silica",
        "product_name": "Quorin Silica Powder",
        "description": "500gm silica powder pouch for resin art and crafting",
        "category": "Supplies",
        "tags": ["silica", "resin art", "crafting", "500gm"],
        "price": 386,
        "mrp": 799,
        "price_hint": "mid",
        "image_paths": ["/PHOTOS/silica 500 gm in pouch/silica for resin art (1).jpg"],
        "featured": False,
        "stock": 70,
        "status": "active"
    }
]

# Save catalog
with open("/home/dmannu/quorin-site/app/src/data/products.json", "w") as f:
    json.dump(catalog, f, indent=2)

print(f"✅ Catalog saved: {len(catalog)} products")
print("\nFeatured products:")
for p in catalog:
    if p["featured"]:
        print(f"  {p['id']:25s} ₹{p['price']:5d}  MRP ₹{p['mrp']:5d}")
