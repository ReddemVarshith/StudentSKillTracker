# Student Skill Tracker (SST) - Backend

A production-ready Django REST API built to aggregate competitive programming profiles across multiple platforms including LeetCode, CodeChef, GeeksforGeeks, and HackerRank.

## Architecture

This project strictly follows Clean Architecture principles:
- **`profiles/models.py`**: Defines the `StudentProfile` PostgreSQL-ready data model.
- **`profiles/views.py`**: A unified generic aggregated API view that handles concurrent fetching and caching (5-min).
- **`profiles/services/`**: Independent generic service modules to interact with external platform endpoints.

## Features Included
- ✅ Unified API aggregator Endpoint `GET /api/profile/`
- ✅ Multi-threading concurrency for external requests via `ThreadPoolExecutor`
- ✅ 5-minute Django Cache (Memory caching enabled)
- ✅ Independent Service Handlers for every platform
- ✅ Graceful error handling (returns `null` without blowing up the request)
- ✅ 5s fetch timeouts to prevent blocked connections
- ✅ CORS Headers enabled for frontend clients
- ✅ Configured proper logging

## Setup Instructions

1. **Clone & Setup Virtual Environment**
   ```bash
   cd sst_backend
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Create a `.env` file in the root project folder:
   ```env
   DATABASE_URL=postgresql://neondb_owner:<password>@ep-round-resonance-a15dz28v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Initialize Superuser (Optional)**
   ```bash
   python manage.py createsuperuser
   # Manage your student profiles at http://localhost:8000/admin/
   ```

6. **Run the Development Server**
   ```bash
   python manage.py runserver
   ```

---

## API Usage Reference

### Endpoint
`GET /api/profile/`

**Query Parameters:**
- `leetcode`: LeetCode Username
- `codechef`: CodeChef Username
- `gfg`: GeeksForGeeks Username
- `hackerrank`: HackerRank Username

### Example cURL Request
```bash
curl -X GET "http://127.0.0.1:8000/api/profile/?leetcode=lee215&codechef=tourist&gfg=geeksforgeeks"
```

### Sample Successful JSON Response
```json
{
    "leetcode": {
        "username": "lee215",
        "ranking": 112033,
        "reputation": 227878,
        "solved": 618
    },
    "codechef": null,
    "gfg": {
        "score": 0,
        "problems_solved": 0
    },
    "hackerrank": null
}
```
*(Note: CodeChef, HackerRank, and GFG currently might return `null` or 0-values gracefully depending on network responses, user existence, or undocumented changes made to the third-party platforms. They fail softly thanks to exception handling inside their respective services.)*
