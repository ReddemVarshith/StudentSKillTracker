import requests
import logging

logger = logging.getLogger(__name__)

class LeetCodeService:
    @staticmethod
    def get_profile(username):
        if not username:
            return None
            
        url = "https://leetcode.com/graphql"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://leetcode.com/",
            "Content-Type": "application/json"
        }
        query = """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    ranking
                    reputation
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
        """
        variables = {"username": username}
        
        try:
            response = requests.post(
                url, 
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            data = response.json()
            
            user_data = data.get("data", {}).get("matchedUser")
            if not user_data:
                return None
                
            stats = user_data.get("submitStats", {}).get("acSubmissionNum", [])
            total_solved = next((item["count"] for item in stats if item["difficulty"] == "All"), 0)
            
            # Ranking could be huge numbers or 0. Sometimes it's string.
            ranking = user_data.get("profile", {}).get("ranking", 0)
            
            return {
                "username": user_data.get("username", username),
                "ranking": int(ranking) if str(ranking).isdigit() else 0,
                "reputation": user_data.get("profile", {}).get("reputation", 0),
                "solved": total_solved
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"LeetCode fetch failed for {username}: {e}")
            return None
        except Exception as e:
            logger.error(f"LeetCode parse error for {username}: {e}")
            return None
