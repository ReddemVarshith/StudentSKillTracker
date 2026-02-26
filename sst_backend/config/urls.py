"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
import os

frontend_dir = os.path.join(settings.BASE_DIR.parent, 'sst_frontend')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include('profiles.urls')),
    
    # Frontend Pages
    path('', TemplateView.as_view(template_name='index.html')),
    path('index.html', TemplateView.as_view(template_name='index.html')),
    path('pages/setup.html', TemplateView.as_view(template_name='pages/setup.html')),
    path('pages/dashboard.html', TemplateView.as_view(template_name='pages/dashboard.html')),
    path('pages/leaderboard.html', TemplateView.as_view(template_name='pages/leaderboard.html')),
    path('pages/hackathons.html', TemplateView.as_view(template_name='pages/hackathons.html')),
    
    # Static Assets Handler
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(frontend_dir, 'assets')}),
]
