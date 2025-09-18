from django.shortcuts import render

# Create your views here.
def loan(request) : 
    return render(request, 'credit_assessment/credit_assessment.html')