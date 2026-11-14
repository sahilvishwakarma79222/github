import urllib.request
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

with open('tools/all_drive_files.json', encoding='utf-8') as f:
    files = json.load(f)

html_files = [f for f in files if f['file_title'].endswith('.html')]
print(f"Total HTML files to fetch: {len(html_files)}")

html_content_map = {} # file_id -> html_text

def fetch_html_file(hf):
    fid = hf['file_id']
    url = f"https://drive.google.com/uc?export=download&id={fid}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read()
                # Check if virus warning or actual html
                text = raw.decode('utf-8', errors='ignore')
                return fid, text
        except Exception as e:
            time.sleep(0.5)
    return fid, None

with ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(fetch_html_file, hf) for hf in html_files]
    for fut in as_completed(futures):
        fid, text = fut.result()
        if text:
            html_content_map[fid] = text

print(f"Successfully downloaded {len(html_content_map)} of {len(html_files)} HTML files")

# Save to html_contents.json
with open('tools/html_contents.json', 'w', encoding='utf-8') as f:
    json.dump(html_content_map, f, ensure_ascii=False)
print("Saved tools/html_contents.json!")
