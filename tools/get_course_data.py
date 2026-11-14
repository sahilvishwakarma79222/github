import urllib.request
import urllib.parse
import http.cookiejar
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

file_id = "1L3zBNvaTlsaP1h1EymVzJKAYk6rdl4mz"
url = f"https://drive.google.com/uc?export=download&id={file_id}"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
resp = opener.open(req)
content = resp.read()

# Check if warning page
if b'Google Drive - Virus scan warning' in content or b'download-form' in content:
    html = content.decode('utf-8', errors='ignore')
    # Extract action and inputs
    action_match = re.search(r'action="([^"]+)"', html)
    action_url = action_match.group(1) if action_match else "https://drive.usercontent.google.com/download"
    
    inputs = re.findall(r'<input type="hidden" name="([^"]+)" value="([^"]*)"', html)
    params = dict(inputs)
    params['confirm'] = 't'
    
    download_url = action_url + "?" + urllib.parse.urlencode(params)
    print("Fetching actual file from:", download_url)
    req2 = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    resp2 = opener.open(req2)
    final_content = resp2.read()
    with open('course-data.js', 'wb') as f:
        f.write(final_content)
    print(f"Successfully saved course-data.js, size: {len(final_content)} bytes")
else:
    with open('course-data.js', 'wb') as f:
        f.write(content)
    print(f"Saved directly, size: {len(content)} bytes")
