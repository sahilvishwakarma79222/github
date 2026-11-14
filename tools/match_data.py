import json
import re

with open('course-data.js', 'r', encoding='utf-8') as f:
    cd_text = f.read()

m = re.search(r'window\.COURSE_DATA\s*=\s*(\{.*\});?', cd_text)
course_data = json.loads(m.group(1))

with open('all_drive_files.json', 'r', encoding='utf-8') as f:
    drive_files = json.load(f)

print(f"Course data modules: {len(course_data['modules'])}")
print(f"Drive files indexed: {len(drive_files)}")

# Build lookup by (module_norm, subfolder_norm, filename_norm)
def norm(s):
    if not s:
        return ""
    # normalize unicode dashes, spaces, lowercase
    s = s.lower().strip()
    s = re.sub(r'[\u2013\u2014\-]+', '-', s)
    s = re.sub(r'[\s_]+', ' ', s)
    return s

lookup = {}
for df in drive_files:
    key = (norm(df['module']), norm(df['subfolder']), norm(df['file_title']))
    lookup[key] = df
    # Also key without extension
    title_no_ext = re.sub(r'\.[a-zA-Z0-9]+$', '', df['file_title'])
    key2 = (norm(df['module']), norm(df['subfolder']), norm(title_no_ext))
    lookup[key2] = df

matched = 0
unmatched = []

for mod in course_data['modules']:
    mod_name = mod['module']
    for post in mod.get('posts', []):
        subfolder = post['folder']
        filename = post['file']
        
        # Try direct match
        key = (norm(mod_name), norm(subfolder), norm(filename))
        found = lookup.get(key)
        if not found:
            # Try matching by filename within same module & subfolder
            candidates = [
                df for df in drive_files
                if norm(df['module']) == norm(mod_name) and norm(df['subfolder']) == norm(subfolder)
            ]
            if len(candidates) == 1:
                found = candidates[0]
            elif len(candidates) > 1:
                # find closest match
                for c in candidates:
                    if norm(c['file_title']) in norm(filename) or norm(filename) in norm(c['file_title']):
                        found = c
                        break
                    if post['type'] == 'quiz' and c['file_title'].endswith('.html'):
                        found = c
                        break
        
        if found:
            matched += 1
            post['driveId'] = found['file_id']
            post['driveMime'] = found['mimeType']
        else:
            unmatched.append((mod_name, subfolder, filename, post['type']))

print(f"Matched: {matched}")
print(f"Unmatched: {len(unmatched)}")
if unmatched:
    print("First 10 unmatched:")
    for u in unmatched[:10]:
        print(" ", u)
