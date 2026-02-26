import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from profiles.models import StudentProfile

def seed():
    # Delete old mocks
    User.objects.filter(username__startswith='mock_').delete()
    
    depts = ['CSE', 'AIML', 'IT', 'ECE']
    
    for i in range(1, 10):
        u = User.objects.create_user(username=f'mock_user_{i}', password='password123', email=f'mock{i}@test.com')
        p = StudentProfile.objects.create(
            user=u,
            hall_ticket_number=f'21B{i}1A050{i}',
            name=f'Mock Student {i}',
            department=random.choice(depts),
            section='A',
            batch='2023-2027',
            email_id=f'mock{i}@student.edu',
            leetcode_solved=random.randint(10, 500),
            codechef_rating=random.randint(1000, 2000),
            gfg_score=random.randint(10, 300),
            hackerrank_badges=random.randint(0, 10)
        )
        p.total_score = p.calculate_total_score()
        p.save()
        
    print("Seeded 9 mock users with random skill scores.")

seed()
