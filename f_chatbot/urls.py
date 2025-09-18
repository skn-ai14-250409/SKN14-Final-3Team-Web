from django.urls import path
from . import views

urlpatterns = [
    path("", views.chatbot, name="chatbot"),
    path("api/chat/", views.chat_api, name="chat_api"),
    path("api/chat/health/", views.health_check, name="chat_health"),
]
