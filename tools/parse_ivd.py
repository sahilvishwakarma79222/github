import re
import json

with open('drive_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*'((?:[^'\\]|\\.)*)';", html)
if not m:
    # Try alternate pattern
    m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*\"((?:[^\"\\]|\\.)*)\";", html)

if m:
    raw_str = m.group(1)
    # decode python escape sequences
    decoded_str = raw_str.encode('utf-8').decode('unicode_escape')
    data = json.loads(decoded_str)
    print("Parsed JSON successfully!")
    print(f"Top-level type: {type(data)}, length: {len(data)}")
    
    # Save the parsed json
    with open('root_folder_items.json', 'w', encoding='utf-8') as out:
        json.dump(data, out, indent=2)
    print("Saved root_folder_items.json")
else:
    print("Pattern not matched!")
