import requests

def download_gfg(username):
    url = f"https://auth.geeksforgeeks.org/user/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    }
    response = requests.get(url, headers=headers)
    with open('gfg_dump.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print("Downloaded to gfg_dump.html")

download_gfg('reddemvasrtp')
