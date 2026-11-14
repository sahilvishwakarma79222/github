import urllib.request

url = "https://drive.google.com/uc?export=download&id=1sPy3rQ06f1lT7xw30PBJM33QjV3GOTxn"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read()
        with open('image.jpg', 'wb') as f:
            f.write(content)
        print(f"Downloaded image.jpg ({len(content)} bytes)")
except Exception as e:
    print("Error:", e)
