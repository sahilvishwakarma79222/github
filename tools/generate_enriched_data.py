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
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

global_lesson_id = 0
all_posts_list = []

for m_idx, mod in enumerate(course_data['modules']):
    mod_name = mod['module']
    mod_clean = clean(mod_name)
    mod_files = [df for df in drive_files if clean(df['module']) == mod_clean]
    
    # Clean module title for display: e.g. "01 - Introduction to section" -> "Introduction to Section"
    clean_mod_title = re.sub(r'^\d+\s*[-–—]\s*', '', mod_name).strip()
    mod['displayName'] = clean_mod_title
    mod['moduleIndex'] = m_idx + 1
    
    for p_idx, post in enumerate(mod.get('posts', [])):
        global_lesson_id += 1
        subfolder = post['folder']
        filename = post['file']
        ptype = post.get('type', 'video')
        
        # Clean lesson title
        raw_name = post['name']
        clean_name = re.sub(r'\.mp4$', '', raw_name, flags=re.IGNORECASE)
        clean_name = re.sub(r'\s*@hmaracollege\s*$', '', clean_name, flags=re.IGNORECASE)
        clean_name = re.sub(r'_lyst\d+$', '', clean_name, flags=re.IGNORECASE)
        clean_name = re.sub(r'_+', ' ', clean_name).strip()
        
        # Extract folder index like "01 - "
        sf_idx_m = re.match(r'^(\d+)', subfolder)
        sf_idx = sf_idx_m.group(1) if sf_idx_m else str(p_idx + 1).zfill(2)
        
        target_f_clean = clean(filename)
        found = None
        
        for df in mod_files:
            if clean(df['subfolder']) == clean(subfolder) and clean(df['file_title']) == target_f_clean:
                found = df
                break
                
        if not found and sf_idx:
            candidates = [df for df in mod_files if re.match(rf'^{sf_idx}\b', df['subfolder'])]
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
        
        post['id'] = global_lesson_id
        post['moduleIndex'] = m_idx + 1
        post['lessonIndex'] = p_idx + 1
        post['cleanTitle'] = clean_name
        post['localPath'] = f"{mod_name}/{subfolder}/{filename}"
        
        if found:
            drive_id = found['file_id']
            post['driveId'] = drive_id
            post['previewUrl'] = f"https://drive.google.com/file/d/{drive_id}/preview"
            post['viewUrl'] = f"https://drive.google.com/file/d/{drive_id}/view?usp=sharing"
            post['downloadUrl'] = f"https://drive.google.com/uc?export=download&id={drive_id}"
        else:
            post['driveId'] = None
            post['previewUrl'] = None
            post['viewUrl'] = None
            post['downloadUrl'] = None
            
        all_posts_list.append(post)

print(f"Total processed: {len(all_posts_list)}")
missing_drive = [p for p in all_posts_list if not p['driveId']]
print(f"Missing drive IDs: {len(missing_drive)}")

# Save to course_data_enriched.js and course_data_enriched.json
with open('course_data_enriched.json', 'w', encoding='utf-8') as f:
    json.dump(course_data, f, indent=2)

with open('course_data_enriched.js', 'w', encoding='utf-8') as f:
    f.write("// Enriched Course Data with full Google Drive IDs and metadata\n")
    f.write("window.COURSE_DATA = ")
    json.dump(course_data, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print("Generated course_data_enriched.json and course_data_enriched.js successfully!")
