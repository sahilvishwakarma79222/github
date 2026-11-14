import json

with open('root_folder_items.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Inspect the structure of data
print(f"data is list of len {len(data)}")
items = data[0] if isinstance(data, list) and len(data) > 0 else data

for i, item in enumerate(items):
    if isinstance(item, list) and len(item) > 3:
        file_id = item[0]
        title = item[2]
        mime_type = item[3]
        print(f"[{i}] ID: {file_id} | Type: {mime_type} | Title: {title}")
    else:
        print(f"[{i}] Raw item: {str(item)[:100]}")
