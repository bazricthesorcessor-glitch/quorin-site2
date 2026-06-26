import base64, os, sys
API_KEY = os.environ.get("GROQ_API_KEY", "")
key_file = os.path.expanduser("~/.groq_api_key")
if not API_KEY and os.path.exists(key_file):
    API_KEY = open(key_file).read().strip()

PROMPT = 'Return ONLY JSON: {"product_name": "", "description": "", "category": "", "tags": [], "price_hint": "budget/mid/premium"}'

from groq import Groq
client = Groq(api_key=API_KEY)

images = [
    "/home/dmannu/quorin-site/PHOTOS/Crushed glass/main image/crushed glass.png",
    "/home/dmannu/quorin-site/PHOTOS/resin pigment/6/7.png"
]

for img_path in images:
    print(f"Scanning {img_path}...")
    b64 = base64.b64encode(open(img_path, 'rb').read()).decode()
    resp = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role": "user", "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
        ]}],
        temperature=0.3, max_completion_tokens=512, top_p=1, stream=False
    )
    print(f"{img_path.split('/')[-2]:20s} → {resp.choices[0].message.content[:100]}\n")
