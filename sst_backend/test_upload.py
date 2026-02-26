import requests
import sqlite3
import os

conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
cur.execute("SELECT key FROM authtoken_token LIMIT 1")
token = cur.fetchone()[0]
conn.close()

headers = {'Authorization': f'Token {token}'}
data = {
    'hackathon_name': 'Test Hackathon',
    'conducted_by': 'Test Conductor',
    'date': '2026-01-01',
    'won': 'false'
}
files = {'participation_certificate': ('test.pdf', b'test file content', 'application/pdf')}
response = requests.post('http://127.0.0.1:8000/api/hackathons/', headers=headers, data=data, files=files)
print(response.status_code)
print(response.text)
