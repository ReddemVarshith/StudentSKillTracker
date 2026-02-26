import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class CodeChefService:
    @staticmethod
    def get_profile(username):
        if not username:
            return None
            
        url = f"https://www.codechef.com/users/{username}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code != 200:
                return None
                
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
                
            # Global Rank
            try:
                rank_list = soup.find('ul', class_='inline-list')
                if rank_list:
                    strongs = rank_list.find_all('strong')
                    if strongs:
                        # First strong is global rank
                        global_rank_text = strongs[0].text.strip()
                        if global_rank_text.isdigit():
                            global_rank = int(global_rank_text)
            except Exception as e:
                logger.warning(f"Failed to parse CodeChef rank for {username}: {e}")
                
            # If nothing was found, it might be an invalid user or drastically changed DOM
            if rating == 0 and stars == "":
                return None

            return {
                "rating": rating,
                "stars": stars,
                "global_rank": global_rank
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"CodeChef fetch failed for {username}: {e}")
            return None
        except Exception as e:
            logger.error(f"CodeChef parse error for {username}: {e}")
            return None
