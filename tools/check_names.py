import json
import re

with open('all_drive_files.json', 'r', encoding='utf-8') as f:
    drive_files = json.load(f)

# Look for subfolders in Module 08 or Module 02
for df in drive_files:
    if 'Understanding Git Rebasing' in df['subfolder'] or 'Reset' in df['subfolder'] or 'Test Yourself' in df['subfolder']:
        print(f"Mod: {df['module']} | Subfolder: {repr(df['subfolder'])} | File: {repr(df['file_title'])} | ID: {df['file_id']}")
