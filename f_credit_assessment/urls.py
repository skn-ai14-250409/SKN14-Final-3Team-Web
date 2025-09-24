from django.urls import path
from . import views

app_name = 'credit_assessment'

urlpatterns = [
    path('', views.credit_assessment_view, name='credit_assessment'),
    path('api/check-customer/', views.check_customer, name='check_customer'),
    path('api/loan-products/', views.get_loan_products, name='get_loan_products'),
    path('api/assess-credit/', views.assess_credit, name='assess_credit'),
]
