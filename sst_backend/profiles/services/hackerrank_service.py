import requests
import logging

logger = logging.getLogger(__name__)

class HackerRankService:
    @staticmethod
    def get_profile(username):
        if not username:
            return None
            
        url = f"https://www.hackerrank.com/rest/contests/master/hackers/{username}/profile"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code != 200:
                return None
                
            data = response.json()
            model = data.get("model", {})
            if not model:
                return None
                
            # Attempt to fetch badges using master API endpoint
            badges_url = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
            badges_data = []
            try:
                b_res = requests.get(badges_url, headers=headers, timeout=5)
                if b_res.status_code == 200:
                    models = b_res.json().get("models", [])
                    badges_data = [
                        {"name": b.get("badge_name", ""), "stars": b.get("stars", 0)}
                        for b in models
                    ]
            except Exception as e:
                logger.warning(f"Failed to fetch HackerRank badges for {username}: {e}")
                
            return {
                "badges": badges_data,
                "skills": [] 
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"HackerRank fetch failed for {username}: {e}")
            return None
        except Exception as e:
            logger.error(f"HackerRank parse error for {username}: {e}")
            return None
