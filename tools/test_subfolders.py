import urllib.request
import re
import json

def fetch_folder(folder_id):
    url = f'https://drive.google.com/drive/folders/{folder_id}'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*'((?:[^'\\]|\\.)*)';", html)
            if not m:
                m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*\"((?:[^\"\\]|\\.)*)\";", html)
            if m:
                raw_str = m.group(1)
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
        print(f"Error fetching folder {folder_id}: {e}")
    return []

# Test module 01
print("Fetching 01 - Introduction to section...")
m1_items = fetch_folder("1wJlBzi9by2kAXQYZEg38H4bg0xT1RQZp")
print("Items in module 1:", json.dumps(m1_items, indent=2))
