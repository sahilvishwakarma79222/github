import urllib.request
import json

# Find a quiz.json from all_drive_files.json
with open('all_drive_files.json', 'r', encoding='utf-8') as f:
    files = json.load(f)

quiz_jsons = [f for f in files if f['file_title'] == 'quiz.json']
print(f"Total quiz.json files: {len(quiz_jsons)}")

if quiz_jsons:
    q = quiz_jsons[0]
    print("Testing quiz:", q)
    url = f"https://drive.google.com/uc?export=download&id={q['file_id']}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            print("Content preview (first 400 chars):")
            print(content[:400])
    except Exception as e:
        print("Error downloading quiz.json:", e)
