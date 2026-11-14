import json
import re

with open('course-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'window\.COURSE_DATA\s*=\s*(\{.*\});?', content)
if m:
    data = json.loads(m.group(1))
    print("Course title:", data.get('courseTitle'))
    modules = data.get('modules', [])
    print(f"Total modules: {len(modules)}")
    total_posts = 0
    types = {}
    for mod in modules:
        posts = mod.get('posts', [])
        total_posts += len(posts)
        for p in posts:
            t = p.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1
    print(f"Total items/posts: {total_posts}")
    print("Types breakdown:", types)
