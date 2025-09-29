from django.urls import path
from . import views

app_name = 'loan'

urlpatterns = [
    path("", views.credit_assessment_view, name="credit_assessment"),
    path('api/check-customer/', views.check_customer, name='api_check_customer'),
    path('api/loan-products/', views.get_loan_products, name='api_get_loan_products'),
    path('api/assess-credit/', views.assess_credit, name='api_assess_credit'),
    path('api/generate-pdf-report/', views.generate_pdf_report, name='api_generate_pdf_report'),
]
