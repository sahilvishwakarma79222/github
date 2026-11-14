import re
import json

with open('drive_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Look for patterns containing file names or data
# Search for common video extensions or file names in the html
extensions = ['.mp4', '.mkv', '.webm', '.pdf', '.docx', '.pptx', '.txt', '.zip', '.mov', '.avi']
found_exts = {}
for ext in extensions:
    matches = [m.start() for m in re.finditer(re.escape(ext), html, re.IGNORECASE)]
    if matches:
        found_exts[ext] = len(matches)
print("Extensions found:", found_exts)

# Look for folder title
title_match = re.search(r'<title>(.*?)</title>', html)
if title_match:
    print("Page Title:", title_match.group(1))

# Check for JSON blobs or data arrays
# Often Google Drive stores items in data blobs like `_DRIVE_ivd` or `ds:something`
blobs = re.findall(r'window\[\'_DRIVE_.*?\'\]\s*=\s*(.*?);</script>', html)
print(f"DRIVE blobs: {len(blobs)}")

# Let's search for snippets around .mp4 or file-like patterns
for m in re.finditer(r'([a-zA-Z0-9_\-\. ]{3,80}\.(mp4|pdf|mkv|zip|docx|pptx))', html, re.IGNORECASE):
    print("File found:", m.group(1))
