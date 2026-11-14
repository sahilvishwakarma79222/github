import json
import re

with open('course-data.js', 'r', encoding='utf-8') as f:
    cd_text = f.read()

prefix = "window.COURSE_DATA = "
start_idx = cd_text.find(prefix)
if start_idx != -1:
    json_str = cd_text[start_idx + len(prefix):].strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1].strip()
    course_data = json.loads(json_str)
    print("Parsed JSON successfully, modules:", len(course_data['modules']))
else:
    raise ValueError("Could not find window.COURSE_DATA")

with open('tools/html_contents.json', 'r', encoding='utf-8') as f:
    html_contents = json.load(f)

print(f"Total HTML contents downloaded: {len(html_contents)}")

attached = 0
for mod in course_data['modules']:
    for post in mod.get('posts', []):
        did = post.get('driveId')
        if did and did in html_contents:
            post['htmlContent'] = html_contents[did]
            attached += 1

print(f"Attached htmlContent to {attached} posts in course-data.js")

with open('course-data.js', 'w', encoding='utf-8') as f:
    f.write("// Complete Enriched Course Data with embedded Quiz & Article contents\n")
    f.write("window.COURSE_DATA = ")
    json.dump(course_data, f, ensure_ascii=False)
    f.write(";\n")

print("Updated course-data.js successfully!")
