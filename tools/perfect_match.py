import json
import re

with open('course-data.js', 'r', encoding='utf-8') as f:
    cd_text = f.read()

m = re.search(r'window\.COURSE_DATA\s*=\s*(\{.*\});?', cd_text)
course_data = json.loads(m.group(1))

with open('all_drive_files.json', 'r', encoding='utf-8') as f:
    drive_files = json.load(f)

def clean(s):
    if not s:
        return ""
    # strip anything that is not alphanumeric
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

matched = 0
unmatched = []

for mod in course_data['modules']:
    mod_name = mod['module']
    mod_clean = clean(mod_name)
    mod_files = [df for df in drive_files if clean(df['module']) == mod_clean]
    
    for post in mod.get('posts', []):
        subfolder = post['folder']
        filename = post['file']
        ptype = post.get('type')
        
        # Extract index prefix like "01 - " or "11 - "
        sf_idx_m = re.match(r'^(\d+)', subfolder)
        sf_idx = sf_idx_m.group(1) if sf_idx_m else None
        
        target_f_clean = clean(filename)
        
        found = None
        # Try exact filename match first across module
        for df in mod_files:
            if clean(df['subfolder']) == clean(subfolder) and clean(df['file_title']) == target_f_clean:
                found = df
                break
        
        # If not found, try matching subfolder index prefix and file type/name
        if not found and sf_idx:
            candidates = [
                df for df in mod_files
                if re.match(rf'^{sf_idx}\b', df['subfolder'])
            ]
            for c in candidates:
                c_clean = clean(c['file_title'])
                if target_f_clean == c_clean:
                    found = c
                    break
                if ptype == 'quiz' and c['file_title'].endswith('.html'):
                    found = c
                    break
                if ptype == 'video' and (c['file_title'].endswith('.mp4') or 'mp4' in c['mimeType']):
                    if clean(c['file_title'][:15]) in target_f_clean or target_f_clean[:15] in clean(c['file_title']):
                        found = c
                        break
                if ptype == 'pdf' and (c['file_title'].endswith('.pdf') or 'pdf' in c['mimeType']):
                    if clean(c['file_title'][:15]) in target_f_clean or target_f_clean[:15] in clean(c['file_title']):
                        found = c
                        break
        
        if found:
            matched += 1
            post['driveId'] = found['file_id']
            post['driveMime'] = found['mimeType']
            post['driveTitle'] = found['file_title']
        else:
            unmatched.append((mod_name, subfolder, filename, ptype))

print(f"Total posts: {sum(len(m['posts']) for m in course_data['modules'])}")
print(f"Matched: {matched}")
print(f"Unmatched: {len(unmatched)}")
for u in unmatched:
    print("Unmatched:", u)
