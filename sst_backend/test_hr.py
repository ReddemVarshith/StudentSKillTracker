import requests
from bs4 import BeautifulSoup

def test_hackerrank(username):
    url = f"https://www.hackerrank.com/profile/{username}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    badges = []
    
    # HackerRank uses a client side rendered React app in most places.
    # However we can try to find JSON dumps in script tags
    scripts = soup.find_all('script')
    for s in scripts:
        if s.string and '__INITIAL_STATE__' in s.string or 'PRELOADED_STATE' in s.string:
            print("Found state block!")
            
    # Or try just reading typical badge DOMs
    badge_titles = soup.find_all('div', class_='badge-title')
    for bt in badge_titles:
        badges.append({"name": bt.text.strip(), "stars": 5}) # Approximation if missing
            
    print("Hackerrank HTTP status:", response.status_code)
    print("Hackerrank badges found directly:", badges)

test_hackerrank('tourist')
