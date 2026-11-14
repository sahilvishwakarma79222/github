import urllib.request

def download_file(file_id, output_path):
    # Google drive direct download URL
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            with open(output_path, 'wb') as f:
                f.write(content)
            print(f"Downloaded {output_path} ({len(content)} bytes)")
    except Exception as e:
        print(f"Failed to download {output_path}: {e}")

download_file("1L3zBNvaTlsaP1h1EymVzJKAYk6rdl4mz", "existing_course-data.js")
download_file("1o75l-DrigO94Vr45uxxzRO9XQWJmAYVy", "existing_player.html")
