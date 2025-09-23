from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
import json
import logging

from .models import Customer, LoanProduct

logger = logging.getLogger(__name__)

def credit_assessment_view(request):
    """여신 심사 페이지"""
    return render(request, 'credit_assessment/credit_assessment.html')

@csrf_exempt
@require_http_methods(["POST"])
def check_customer(request):
    """고객 정보 확인 API"""
    try:
        data = json.loads(request.body)
        customer_name = data.get('customer_name', '').strip()
        customer_rrn = data.get('customer_rrn', '').strip()
        customer_phone = data.get('customer_phone', '').strip()
        customer_email = data.get('customer_email', '').strip()
        
        logger.info(f"고객 정보 조회 요청: {customer_name}, {customer_rrn}, {customer_phone}, {customer_email}")
        
        # 입력값 검증
        if not customer_name or not customer_rrn or not customer_phone:
            return JsonResponse({
                'success': False,
                'message': '고객명, 주민번호, 연락처는 필수 입력 항목입니다.'
            })
        
        # 고객 정보 조회 (주민번호로 우선 조회)
        customer = None
        try:
            customer = Customer.objects.get(rrn=customer_rrn)
            logger.info(f"고객 정보 발견: {customer.full_name}")
        except Customer.DoesNotExist:
            # 주민번호로 찾지 못한 경우, 이름과 전화번호로 추가 검색
            customers = Customer.objects.filter(
                Q(first_name__icontains=customer_name.split()[0] if customer_name else '') |
                Q(last_name__icontains=customer_name.split()[-1] if customer_name else ''),
                phone=customer_phone
            )
            
            if customers.exists():
                customer = customers.first()
                logger.info(f"이름과 전화번호로 고객 정보 발견: {customer.full_name}")
            else:
                logger.info("고객 정보를 찾을 수 없습니다.")
                return JsonResponse({
                    'success': False,
                    'message': '가입하지 않은 고객입니다.',
                    'customer_found': False
                })
        
        # 고객 정보 반환
        customer_data = {
            'success': True,
            'customer_found': True,
            'customer': {
                'id': customer.id,
                'full_name': customer.full_name,
                'first_name': customer.first_name,
                'last_name': customer.last_name,
                'rrn': customer.formatted_rrn,
                'phone': customer.formatted_phone,
                'email': customer.email or '',
                'age': customer.age,
                'gender': customer.get_gender_display(),
                'education_level': customer.get_education_level_display(),
                'company_name': customer.company_name,
                'job_title': customer.job_title,
                'years_of_service': customer.years_of_service,
                'housing_status': customer.get_housing_status_display(),
                'account_number': customer.account_number,
            }
        }
        
        return JsonResponse(customer_data)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': '잘못된 요청 데이터입니다.'
        })
    except Exception as e:
        logger.error(f"고객 정보 조회 중 오류 발생: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': '고객 정보 조회 중 오류가 발생했습니다.'
        })

@csrf_exempt
@require_http_methods(["POST"])
def get_loan_products(request):
    """대출 목적에 따른 대출 상품 조회 API"""
    try:
        data = json.loads(request.body)
        loan_purpose = data.get('loan_purpose', '')
        
        if not loan_purpose:
            return JsonResponse({
                'success': False,
                'message': '대출 목적을 선택해주세요.'
            })
        
        # 해당 목적의 활성화된 대출 상품 조회
        products = LoanProduct.objects.filter(
            purpose=loan_purpose,
            is_active=True
        ).order_by('name')
        
        products_data = []
        for product in products:
            products_data.append({
                'id': product.id,
                'name': product.name,
                'purpose': product.purpose,
                'min_amount': product.min_amount,
                'max_amount': product.max_amount,
                'min_period': product.min_period,
                'max_period': product.max_period,
                'interest_rate': float(product.interest_rate),
                'description': product.description,
            })
        
        return JsonResponse({
            'success': True,
            'products': products_data
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': '잘못된 요청 데이터입니다.'
        })
    except Exception as e:
        logger.error(f"대출 상품 조회 중 오류 발생: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': '대출 상품 조회 중 오류가 발생했습니다.'
        })
