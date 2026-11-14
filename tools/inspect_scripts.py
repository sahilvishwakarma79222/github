import re
import json

with open('drive_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect the script tags
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script tags: {len(scripts)}")

for i, s in enumerate(scripts):
    if '_DRIVE_' in s or 'AF_initDataCallback' in s:
        print(f"\n--- Script #{i} (len {len(s)}) ---")
        print(s[:500])
        # search for folder or item names
        # Let's see if there are strings with letters and numbers
        # Save this script to inspect
        with open(f"script_{i}.js", "w", encoding="utf-8") as sf:
            sf.write(s)
