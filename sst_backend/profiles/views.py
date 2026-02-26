import concurrent.futures
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.cache import cache

from .models import StudentProfile
from .serializers import RegisterSerializer, UserSerializer, StudentProfileSerializer

from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache

from .services.leetcode_service import LeetCodeService
from .services.codechef_service import CodeChefService
from .services.gfg_service import GFGService
from .services.hackerrank_service import HackerRankService

class AggregatedProfileView(APIView):
    """
    GET /api/profile/?leetcode=<username>&codechef=<username>&gfg=<username>&hackerrank=<username>
    Fetches live data from each platform. On success, persists JSON to the StudentProfile.
    On failure, falls back to the last successfully cached data in the DB.
    """
    
    def get(self, request):
        from django.utils import timezone

        leetcode_user = request.GET.get('leetcode')
        codechef_user = request.GET.get('codechef')
        gfg_user = request.GET.get('gfg')
        hackerrank_user = request.GET.get('hackerrank')
        
        # Generate cache key based on query params
        cache_key = f"profile_{leetcode_user}_{codechef_user}_{gfg_user}_{hackerrank_user}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        # Run external requests concurrently
        live = {}
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_lc  = executor.submit(LeetCodeService.get_profile,  leetcode_user)  if leetcode_user  else None
            future_cc  = executor.submit(CodeChefService.get_profile,  codechef_user)  if codechef_user  else None
            future_gfg = executor.submit(GFGService.get_profile,       gfg_user)       if gfg_user       else None
            future_hr  = executor.submit(HackerRankService.get_profile, hackerrank_user) if hackerrank_user else None
            
            live['leetcode']   = future_lc.result()  if future_lc  else None
            live['codechef']   = future_cc.result()  if future_cc  else None
            live['gfg']        = future_gfg.result() if future_gfg else None
            live['hackerrank'] = future_hr.result()  if future_hr  else None
            
        # --- DB persistence & fallback ---
        results = dict(live)  # Start with live results

        if request.user.is_authenticated:
            try:
                profile = request.user.profile
                db_updated = False

                # LeetCode
                if live['leetcode']:
                    profile.leetcode_data = live['leetcode']
                    profile.leetcode_solved = live['leetcode'].get('solved', 0)
                    db_updated = True
                elif not live['leetcode'] and profile.leetcode_data:
                    results['leetcode'] = profile.leetcode_data  # fallback

                # CodeChef
                if live['codechef']:
                    profile.codechef_data = live['codechef']
                    profile.codechef_rating = live['codechef'].get('rating', 0)
                    db_updated = True
                elif not live['codechef'] and profile.codechef_data:
                    results['codechef'] = profile.codechef_data

                # GFG
                if live['gfg']:
                    profile.gfg_data = live['gfg']
                    profile.gfg_score = live['gfg'].get('score', 0)
                    db_updated = True
                elif not live['gfg'] and profile.gfg_data:
                    results['gfg'] = profile.gfg_data

                # HackerRank
                if live['hackerrank']:
                    profile.hackerrank_data = live['hackerrank']
                    profile.hackerrank_badges = len(live['hackerrank'].get('badges', []))
                    db_updated = True
                elif not live['hackerrank'] and profile.hackerrank_data:
                    results['hackerrank'] = profile.hackerrank_data

                if db_updated:
                    profile.total_score = profile.calculate_total_score()
                    profile.stats_updated_at = timezone.now()
                    profile.save()

            except Exception:
                pass  # Safe fallback — return whatever live/cached we have
            
        # In-memory cache for 5 minutes (300 seconds)
        cache.set(cache_key, results, timeout=300)
        
        return Response(results, status=status.HTTP_200_OK)

class LeaderboardAPIView(generics.ListAPIView):
    """
    GET /api/leaderboard/?platform=<platform_name>
    Returns a list of StudentProfiles descending by the chosen platform score or total_score
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        platform = self.request.query_params.get('platform', 'total')
        if platform == 'leetcode':
            return StudentProfile.objects.order_by('-leetcode_solved')[:50]
        elif platform == 'codechef':
            return StudentProfile.objects.order_by('-codechef_rating')[:50]
        elif platform == 'gfg':
            return StudentProfile.objects.order_by('-gfg_score')[:50]
        elif platform == 'hackerrank':
            return StudentProfile.objects.order_by('-hackerrank_badges')[:50]
        return StudentProfile.objects.order_by('-total_score')[:50]

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user_id": user.id}, status=status.HTTP_200_OK)
        return Response({"error": "Wrong Credentials"}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, created = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile, created = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .models import HackathonParticipation
from .serializers import HackathonParticipationSerializer

class HackathonAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            hackathons = profile.hackathons.all().order_by('-date')
            serializer = HackathonParticipationSerializer(hackathons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            profile = request.user.profile
            serializer = HackathonParticipationSerializer(data=request.data)
            if serializer.is_valid():
                # Manually link the student profile
                serializer.save(student=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
