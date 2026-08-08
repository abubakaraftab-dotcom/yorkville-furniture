import urllib.request
import os

images = {
    'on.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Toronto_skyline_from_the_islands.jpg/800px-Toronto_skyline_from_the_islands.jpg',
    'qc.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chateau_Frontenac_from_Levis.jpg/800px-Chateau_Frontenac_from_Levis.jpg',
    'bc.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Vancouver_skyline_from_Stanley_Park.jpg/800px-Vancouver_skyline_from_Stanley_Park.jpg',
    'ab.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Banff_Avenue_with_Cascade_Mountain_in_background.jpg/800px-Banff_Avenue_with_Cascade_Mountain_in_background.jpg'
}

req_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

os.makedirs('public/images/provinces', exist_ok=True)

for filename, url in images.items():
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req) as response:
            with open(os.path.join('public/images/provinces', filename), 'wb') as f:
                f.write(response.read())
        print(f"Success: {filename}")
    except Exception as e:
        print(f"Failed {filename}: {e}")
