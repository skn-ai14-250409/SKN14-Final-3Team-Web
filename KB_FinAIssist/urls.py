"""
URL configuration for KB_FinAIssist project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path, include
from django.views.generic import RedirectView
from django.shortcuts import render

def dashboard_view(request):
    return render(request, 'dashboard/dashboard.html')

def admin_view(request):
    return render(request, 'admin/admin.html')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", RedirectView.as_view(url="/kb_finaIssist/login/"), name="main"),
    path("kb_finaIssist/", include([
        path("login/", include("f_login.urls")),
        path("dashboard/", dashboard_view, name="dashboard"),
        path("chatbot/", include("f_chatbot.urls")),
        path("admin/", admin_view, name="admin"),
    ])),
]