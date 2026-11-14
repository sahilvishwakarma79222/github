import urllib.request
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

MODULE_ROOTS = [
    {"module": "01 - Introduction to section", "id": "1wJlBzi9by2kAXQYZEg38H4bg0xT1RQZp"},
    {"module": "02 - Introduction to VCS and Git Setup", "id": "1rN4H2UhfkDJYFYSUdvDdPdORfNOS0Gar"},
    {"module": "03 - Terminal Basics and Commands", "id": "11e0lCz3z8pFlkyD9iwlS3lc7dQjU6_aA"},
    {"module": "04 - Git Core Concepts - Git Fundamentals", "id": "1nE_V683spq1xUzqP-qEY5Tjq11UU0NFt"},
    {"module": "05 - Git Branching and Project Flows", "id": "1vy2NSCvg-bq6vRFArVjnNshFikzrnj86"},
    {"module": "06 - Github Concepts", "id": "1vrURhwdvv6z6IsXMvLKaxO3RbgFFpw3m"},
    {"module": "07 - Collaboration and Team Work", "id": "1QoPgZrPokdQHtiARWVZul1uNTUAPdeRk"},
    {"module": "08 - Git Advance Concepts", "id": "1U8B-jzO7yvJHQFNkAUYlKLXMh5EBsAHj"},
    {"module": "09 - Github Pages and Actions", "id": "1r0ydSWl3oPrVPv2gIYC_aNKRxLZdxRYH"},
    {"module": "10 - Interview Questions-Answers", "id": "1MsLZo4YPx5zAdVZipW3axdbp8C6JLhtW"},
]

def fetch_folder_items(folder_id, retries=3):
    url = f'https://drive.google.com/drive/folders/{folder_id}'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
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
            time.sleep(1)
            if attempt == retries - 1:
                print(f"Failed to fetch {folder_id} after {retries} attempts: {e}")
    return []

print("Starting crawling all modules...")
all_subfolders = []

# Fetch all subfolders for each module
with ThreadPoolExecutor(max_workers=5) as executor:
    future_to_mod = {executor.submit(fetch_folder_items, m["id"]): m for m in MODULE_ROOTS}
    for future in as_completed(future_to_mod):
        m = future_to_mod[future]
        items = future.result()
        print(f"Module '{m['module']}' has {len(items)} items")
        for item in items:
            if item['mimeType'] == 'application/vnd.google-apps.folder':
                all_subfolders.append({
                    'module': m['module'],
                    'subfolder_title': item['title'],
                    'subfolder_id': item['id']
                })

print(f"Total subfolders across all modules: {len(all_subfolders)}")

# Now fetch files in each subfolder
drive_files_map = {} # key: (module, subfolder, file_title) -> file_id

def process_subfolder(sf):
    files = fetch_folder_items(sf['subfolder_id'])
    results = []
    for f in files:
        results.append({
            'module': sf['module'],
            'subfolder': sf['subfolder_title'],
            'file_id': f['id'],
            'file_title': f['title'],
            'mimeType': f['mimeType']
        })
    return results

with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_sf = {executor.submit(process_subfolder, sf): sf for sf in all_subfolders}
    completed = 0
    for future in as_completed(future_to_sf):
        completed += 1
        res = future.result()
        for r in res:
            drive_files_map[(r['module'], r['subfolder'], r['file_title'])] = r
        if completed % 20 == 0 or completed == len(all_subfolders):
            print(f"Completed {completed}/{len(all_subfolders)} subfolders...")

print(f"Total files crawled: {len(drive_files_map)}")

# Save all crawled files
serialized = [
    {
        'module': k[0],
        'subfolder': k[1],
        'file_title': k[2],
        'file_id': v['file_id'],
        'mimeType': v['mimeType']
    }
    for k, v in drive_files_map.items()
]

with open('all_drive_files.json', 'w', encoding='utf-8') as f:
    json.dump(serialized, f, indent=2)
print("Saved all_drive_files.json!")
