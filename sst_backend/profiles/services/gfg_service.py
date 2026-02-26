import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class GFGService:
    @staticmethod
    def get_profile(username):
        if not username:
            return None
            
        url = f"https://auth.geeksforgeeks.org/user/{username}/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code != 200:
                # 404 or profile not found
                return None
                
            html = response.text
            
            score = 0
            problems_solved = 0
            
            import re
            
            # The JSON might be escaped like \"score\":151
            score_match = re.search(r'\\*"score\\*"\s*:\s*(\d+)', html)
            if score_match:
                score = int(score_match.group(1))

            problems_match = re.search(r'\\*"total_problems_solved\\*"\s*:\s*(\d+)', html)
            if problems_match:
                problems_solved = int(problems_match.group(1))
            
            # Fallbacks omitted for brevity since GFG relies entirely on this Next.js payload now.
            # If the user doesn't exist, the page won't contain these tags or will 404.

            return {
                "score": score,
                "problems_solved": problems_solved
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"GFG fetch failed for {username}: {e}")
            return None
        except Exception as e:
            logger.error(f"GFG parse error for {username}: {e}")
            return None
