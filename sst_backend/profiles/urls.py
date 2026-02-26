from django.urls import path
from .views import AggregatedProfileView, RegisterAPIView, LoginAPIView, CurrentUserProfileView, LeaderboardAPIView, HackathonAPIView

urlpatterns = [
    path('profile/', AggregatedProfileView.as_view(), name='aggregated-profile'),
    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('me/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('leaderboard/', LeaderboardAPIView.as_view(), name='leaderboard'),
    path('hackathons/', HackathonAPIView.as_view(), name='hackathons'),
]

