import urllib.request
import re
import json

url = 'https://drive.google.com/drive/folders/192CEvhf7ESUhp_nCacvDCHPQbKZoHofY?usp=sharing'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Status OK, HTML length: {len(html)}")
        with open('drive_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("Written to drive_page.html")
except Exception as e:
    print(f"Error fetching: {e}")
