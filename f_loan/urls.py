from django.urls import path
from . import views

urlpatterns = [
    path("", views.loan, name="loan"),
    path("predict", views.predict_loan, name="loan_predict"),
]
