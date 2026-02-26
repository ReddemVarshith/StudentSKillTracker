from django.db import models
from django.contrib.auth.models import User

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True)
    DEPARTMENT_CHOICES = [
        ('CSE', 'Computer Science and Engineering'),
        ('AIML', 'Artificial Intelligence and Machine Learning'),
        ('CYBER', 'Cyber Security'),
        ('ECE', 'Electronics and Communication Engineering'),
        ('EEE', 'Electrical and Electronics Engineering'),
        ('CIVIL', 'Civil Engineering'),
        ('MECH', 'Mechanical Engineering'),
        ('IT', 'Information Technology'),
    ]

    SECTION_CHOICES = [(chr(i), chr(i)) for i in range(ord('A'), ord('H') + 1)]

    BATCH_CHOICES = [
        ('2023-2027', '2023-27'),
        ('2024-2028', '2024-28'),
        ('2025-2029', '2025-29'),
    ]

    hall_ticket_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    section = models.CharField(max_length=1, choices=SECTION_CHOICES)
    batch = models.CharField(max_length=15, choices=BATCH_CHOICES)
    email_id = models.EmailField(unique=True)
    linkedin = models.URLField(blank=True, null=True)

    # Coding Platform Usernames
    leetcode_username = models.CharField(max_length=100, blank=True, null=True)
    codechef_username = models.CharField(max_length=100, blank=True, null=True)
    hackerrank_username = models.CharField(max_length=100, blank=True, null=True)
    gfg_username = models.CharField(max_length=100, blank=True, null=True)

    # Leaderboard Aggregations
    leetcode_solved = models.IntegerField(default=0)
    codechef_rating = models.IntegerField(default=0)
    gfg_score = models.IntegerField(default=0)
    hackerrank_badges = models.IntegerField(default=0)  # Count of badges
    total_score = models.IntegerField(default=0)

    # Cached Platform JSON (stores last successful API response)
    leetcode_data = models.JSONField(blank=True, null=True)
    codechef_data = models.JSONField(blank=True, null=True)
    gfg_data = models.JSONField(blank=True, null=True)
    hackerrank_data = models.JSONField(blank=True, null=True)
    stats_updated_at = models.DateTimeField(blank=True, null=True)

    def calculate_total_score(self):
        """
        Simple balanced metric for demonstration purposes.
        Change the weights depending on what the institution values more.
        """
        return self.leetcode_solved * 10 + self.codechef_rating + self.gfg_score * 5 + self.hackerrank_badges * 50

    def __str__(self):
        return f"{self.name} ({self.hall_ticket_number})"

from cloudinary.models import CloudinaryField

class HackathonParticipation(models.Model):
    PLACE_CHOICES = [
        ('Winner', 'Winner'),
        ('Runner up', 'Runner up'),
        ('Bronze', 'Bronze')
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='hackathons')
    hackathon_name = models.CharField(max_length=255)
    conducted_by = models.CharField(max_length=255)
    date = models.DateField()
    won = models.BooleanField(default=False)
    participation_certificate = CloudinaryField('participation_certificate')
    
    # Conditional Winner Fields
    place = models.CharField(max_length=50, choices=PLACE_CHOICES, blank=True, null=True)
    prize_money = models.CharField(max_length=100, blank=True, null=True)
    project_title = models.CharField(max_length=255, blank=True, null=True)
    domain = models.CharField(max_length=100, blank=True, null=True)
    winning_certificate = CloudinaryField('winning_certificate', blank=True, null=True)

    def __str__(self):
        return f"{self.hackathon_name} - {self.student.name}"
