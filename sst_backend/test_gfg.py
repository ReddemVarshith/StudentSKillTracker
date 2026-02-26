import requests
from bs4 import BeautifulSoup

def test_gfg(username):
    url = f"https://auth.geeksforgeeks.org/user/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    }
    response = requests.get(url, headers=headers)
    print("GFG Status:", response.status_code)
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Try different selector combinations and print them
    scoreList = soup.find_all('div', class_='score_card_value')
    if scoreList:
        print("Score Cards found by 'score_card_value':")
        for i, s in enumerate(scoreList):
            print(f"  {i}: {s.text}")
            
    # Look for "Coding Score" text
    divs = soup.find_all('div')
    for d in divs:
        text = d.text.strip()
        if 'Coding Score' in text and len(text) < 30:
            print("Found 'Coding Score' div:", text)
            print("  Parent:", d.parent.text.strip())
            
        if 'Problems Solved' in text and len(text) < 30:
            print("Found 'Problems Solved' div:", text)
            print("  Parent:", d.parent.text.strip())
            
    # Let's just find the text and its siblings
    texts = soup.find_all(string=lambda t: t and 'Coding Score' in t)
    for t in texts:
        print("Direct string 'Coding Score':")
        parent = t.parent
        print("  Parent dump:", parent)
        print("  Parent's parent dump:", parent.parent)
        
    texts = soup.find_all(string=lambda t: t and 'Problems Solved' in t)
    for t in texts:
        print("Direct string 'Problems Solved':")
        parent = t.parent
        print("  Parent dump:", parent)
        print("  Parent's parent dump:", parent.parent)

test_gfg('reddemvasrtp')
