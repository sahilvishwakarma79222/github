import urllib.request
import re
import json
from concurrent.futures import ThreadPoolExecutor

def fetch_folder_items(folder_id):
    url = f'https://drive.google.com/drive/folders/{folder_id}'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*'((?:[^'\\]|\\.)*)';", html)
            if not m:
                m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*\"((?:[^\"\\]|\\.)*)\";", html)
            if m:
                raw_str = m.group(1)
                # handle unicode escapes safely
                decoded_str = raw_str.encode('utf-8').decode('unicode_escape')
                data = json.loads(decoded_str)
                items = data[0] if isinstance(data, list) and len(data) > 0 else []
                res = []
                for item in items:
                    if isinstance(item, list) and len(item) > 3:
                        res.append({
                            'id': item[0],
                            'title': item[2],
                            'mimeType': item[3]
                        })
                return res
    except Exception as e:
        print(f"Error {folder_id}: {e}")
    return []

# Test module 02: 1rN4H2UhfkDJYFYSUdvDdPdORfNOS0Gar
m2_subfolders = fetch_folder_items("1rN4H2UhfkDJYFYSUdvDdPdORfNOS0Gar")
print(f"Module 2 subfolders found: {len(m2_subfolders)}")
for sf in m2_subfolders[:3]:
    print("Subfolder:", sf['title'], sf['id'])
    items = fetch_folder_items(sf['id'])
    for it in items:
        print("  -> File:", it['title'], it['id'], it['mimeType'])
