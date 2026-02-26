import requests
from bs4 import BeautifulSoup
import json

def test_codechef(username):
    url = f"https://www.codechef.com/users/{username}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    rating = 0
    stars = ""
    global_rank = 0
    
    # Rating
    rating_div = soup.find('div', class_='rating-number')
    if rating_div:
        try: rating = int(rating_div.text.strip())
        except: pass
        
    # Stars
    stars_div = soup.find('div', class_='rating-star')
    if stars_div:
        stars = stars_div.text.strip()
        
    # Global Rank strategy: 
    # Usually strong tags inside rating-ranks -> list class inline-list -> a strong
    try:
        rank_list = soup.find('ul', class_='inline-list')
        if rank_list:
            strongs = rank_list.find_all('strong')
            if strongs:
                # First strong is global rank, second is country rank
                global_rank = int(strongs[0].text.strip())
    except: pass
    
    print("Codechef:", {"rating": rating, "stars": stars, "global_rank": global_rank})

test_codechef('tourist')
