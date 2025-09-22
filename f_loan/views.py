from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

from .models import LoanAssessment
from .ml.inference import model, build_features_from_application

# Create your views here.
def loan(request) : 
    return render(request, 'credit_assessment/credit_assessment.html')


@csrf_exempt
@require_POST
def predict_loan(request: HttpRequest):
    """
    Simple prediction endpoint.

    Accepts JSON:
    - { "features": { ... } }  OR
    - { "application_id": 123 }
    Returns: { "prob": float, "decision": 0|1 }
    """
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Direct features
    if isinstance(payload, dict) and "features" in payload:
        features = payload["features"]
        if not isinstance(features, dict):
            return JsonResponse({"error": "features must be an object"}, status=400)
        try:
            result = model.predict(features)
            return JsonResponse(result, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # Or map from existing application
    app_id = payload.get("application_id") if isinstance(payload, dict) else None
    if app_id is None:
        return JsonResponse({"error": "Missing features or application_id"}, status=400)

    try:
        application = LoanAssessment.objects.select_related("customer").get(seq_id=app_id)
    except LoanAssessment.DoesNotExist:
        return JsonResponse({"error": f"LoanAssessment {app_id} not found"}, status=404)

    try:
        features = build_features_from_application(application)
        result = model.predict(features)
        return JsonResponse(result, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
