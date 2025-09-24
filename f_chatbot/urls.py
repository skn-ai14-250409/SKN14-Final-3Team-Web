from django.urls import path
from . import views

urlpatterns = [
    path("", views.chatbot, name="chatbot"),
    path("api/chat/", views.chat_api, name="chat_api"),
    path("api/chat/health/", views.health_check, name="chat_health"),
    path("api/session/<str:session_id>/", views.session_info, name="session_info"),
    path("api/session/<str:session_id>/delete/", views.delete_session, name="delete_session"),
    path("api/sessions/stats/", views.session_stats, name="session_stats"),
    path("pdf/<path:file_path>", views.serve_pdf, name="serve_pdf"),
]
