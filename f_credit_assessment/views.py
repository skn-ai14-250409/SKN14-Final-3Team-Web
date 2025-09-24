from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
import json
import logging
import plotly.graph_objects as go
import plotly.express as px
import plotly.utils
import joblib
import numpy as np

from .models import Customer, LoanProduct

logger = logging.getLogger(__name__)

# ML 모델 로드
try:
    PERSONAL_MODEL = joblib.load('ml_models/personal_loan_lgbm.pkl')
    PERSONAL_SCALER = joblib.load('ml_models/personal_loan_scaler.pkl')
    CORPORATE_MODEL = joblib.load('ml_models/corporate_loan_lgbm.pkl')
    CORPORATE_SCALER = joblib.load('ml_models/corporate_loan_scaler.pkl')
except Exception as e:
    logger.warning(f"ML 모델 로드 실패: {e}")
    PERSONAL_MODEL = None
    PERSONAL_SCALER = None
    CORPORATE_MODEL = None
    CORPORATE_SCALER = None

def create_credit_score_chart(score):
    """고급 신용점수 원형 차트 생성"""
    percentage = score / 1000 * 100
    
    fig = go.Figure(go.Pie(
        values=[percentage, 100 - percentage],
        hole=0.65,
        marker=dict(
            colors=[
                'rgba(16, 185, 129, 0.9)',  # 메인 색상
                'rgba(243, 244, 246, 0.3)'  # 배경 색상
            ],
            line=dict(
                color='rgba(255, 255, 255, 0.8)',
                width=3
            )
        ),
        textinfo='none',
        hoverinfo='none',
        showlegend=False,
        rotation=90,
        direction='clockwise'
    ))
    
    # 점수 텍스트
    fig.add_annotation(
        text=f"{score}",
        x=0.5, y=0.55,
        font=dict(
            size=20,
            color='#1f2937',
            family='Arial, sans-serif'
        ),
        showarrow=False
    )
    
    # "점" 텍스트
    fig.add_annotation(
        text="점",
        x=0.5, y=0.4,
        font=dict(
            size=12,
            color='#6b7280',
            family='Arial, sans-serif'
        ),
        showarrow=False
    )
    
    fig.update_layout(
        width=140,
        height=140,
        margin=dict(l=0, r=0, t=0, b=0),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)'
    )
    
    return plotly.utils.PlotlyJSONEncoder().encode(fig)

def create_progress_chart(data):
    """프로그레스 바 차트 생성"""
    labels = list(data.keys())
    values = list(data.values())
    
    # 색상 매핑
    colors = []
    for value in values:
        if value >= 80:
            colors.append('#10b981')  # 녹색
        elif value >= 50:
            colors.append('#f59e0b')  # 주황색
        else:
            colors.append('#ef4444')  # 빨간색
    
    fig = go.Figure(data=[
        go.Bar(
            x=labels,
            y=values,
            marker_color=colors,
            text=[f"{v}%" for v in values],
            textposition='auto',
        )
    ])
    
    fig.update_layout(
        height=200,
        margin=dict(l=0, r=0, t=0, b=0),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(showgrid=False),
        yaxis=dict(showgrid=False, range=[0, 100])
    )
    
    return plotly.utils.PlotlyJSONEncoder().encode(fig)

def predict_credit_score(customer_data, loan_data, customer_type='personal'):
    """ML 모델을 사용한 신용점수 예측"""
    try:
        if customer_type == 'personal' and PERSONAL_MODEL and PERSONAL_SCALER:
            # 개인 고객 특성 추출
            features = np.array([
                customer_data.get('age', 30),
                customer_data.get('years_of_service', 5),
                loan_data.get('amount', 10000000),
                loan_data.get('period', 12),
                customer_data.get('education_level', 3),
                customer_data.get('housing_status', 1)
            ]).reshape(1, -1)
            
            scaled_features = PERSONAL_SCALER.transform(features)
            prediction = PERSONAL_MODEL.predict(scaled_features)[0]
            
        elif customer_type == 'corporate' and CORPORATE_MODEL and CORPORATE_SCALER:
            # 기업 고객 특성 추출
            features = np.array([
                customer_data.get('years_of_service', 5),
                loan_data.get('amount', 10000000),
                loan_data.get('period', 12),
                customer_data.get('company_size', 50)
            ]).reshape(1, -1)
            
            scaled_features = CORPORATE_SCALER.transform(features)
            prediction = CORPORATE_MODEL.predict(scaled_features)[0]
            
        else:
            # 모델이 없을 경우 기본값
            prediction = 750
        
        # 0-1000 점수로 변환
        credit_score = max(0, min(1000, int(prediction * 1000)))
        
        return {
            'credit_score': credit_score,
            'credit_rating': get_credit_rating(credit_score),
            'approval_status': 'approved' if credit_score >= 600 else 'rejected',
            'recommended_limit': calculate_recommended_limit(credit_score, loan_data.get('amount', 0))
        }
        
    except Exception as e:
        logger.error(f"신용점수 예측 중 오류: {e}")
        return {
            'credit_score': 750,
            'credit_rating': 'B',
            'approval_status': 'approved',
            'recommended_limit': 30000000
        }

def get_credit_rating(score):
    """신용점수에 따른 등급 반환"""
    if score >= 900:
        return 'AAA'
    elif score >= 800:
        return 'AA'
    elif score >= 700:
        return 'A'
    elif score >= 600:
        return 'B'
    elif score >= 500:
        return 'C'
    else:
        return 'D'

def calculate_recommended_limit(score, requested_amount):
    """신용점수에 따른 추천 한도 계산"""
    if score >= 800:
        return min(requested_amount * 1.2, 100000000)
    elif score >= 700:
        return min(requested_amount * 1.1, 80000000)
    elif score >= 600:
        return min(requested_amount * 1.0, 50000000)
    else:
        return min(requested_amount * 0.8, 30000000)

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

@csrf_exempt
@require_http_methods(["POST"])
def assess_credit(request):
    """ML 모델을 사용한 신용평가 API"""
    try:
        data = json.loads(request.body)
        customer_data = data.get('customer_data', {})
        loan_data = data.get('loan_data', {})
        customer_type = data.get('customer_type', 'personal')
        
        logger.info(f"신용평가 요청: {customer_type}, {customer_data.get('full_name', 'Unknown')}")
        
        # ML 모델로 신용점수 예측
        prediction_result = predict_credit_score(customer_data, loan_data, customer_type)
        
        # 차트 데이터 생성
        credit_score_chart = create_credit_score_chart(prediction_result['credit_score'])
        
        # 재무 안정성 지표 (예시 데이터 - 실제로는 ML 모델에서 계산)
        financial_indicators = {
            '부채비율': min(100, max(0, 100 - (prediction_result['credit_score'] / 10))),
            '소득 안정성': min(100, max(0, prediction_result['credit_score'] / 12)),
            '상환능력': min(100, max(0, prediction_result['credit_score'] / 11)),
            '신용이력': min(100, max(0, prediction_result['credit_score'] / 9)),
            '현금보유비율': min(100, max(0, prediction_result['credit_score'] / 15)),
            '자산증가율': min(100, max(0, prediction_result['credit_score'] / 13))
        }
        
        progress_chart = create_progress_chart(financial_indicators)
        
        # 리스크 매트릭스 (신용점수 기반)
        risk_matrix = generate_risk_matrix(prediction_result['credit_score'])
        
        # AI 추천사항 생성
        recommendation = generate_recommendation(prediction_result, financial_indicators)
        
        response_data = {
            'success': True,
            'assessment_result': {
                'credit_score': prediction_result['credit_score'],
                'credit_rating': prediction_result['credit_rating'],
                'approval_status': prediction_result['approval_status'],
                'recommended_limit': prediction_result['recommended_limit'],
                'credit_score_chart': credit_score_chart,
                'progress_chart': progress_chart,
                'financial_indicators': financial_indicators,
                'risk_matrix': risk_matrix,
                'recommendation': recommendation
            }
        }
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': '잘못된 요청 데이터입니다.'
        })
    except Exception as e:
        logger.error(f"신용평가 중 오류 발생: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': '신용평가 중 오류가 발생했습니다.'
        })

def generate_risk_matrix(credit_score):
    """신용점수 기반 리스크 매트릭스 생성"""
    if credit_score >= 800:
        return [
            {'level': 'low', 'type': '신용위험'},
            {'level': 'low', 'type': '시장위험'},
            {'level': 'low', 'type': '유동성위험'},
            {'level': 'low', 'type': '운영위험'},
            {'level': 'low', 'type': '법률위험'},
            {'level': 'low', 'type': '평판위험'}
        ]
    elif credit_score >= 600:
        return [
            {'level': 'low', 'type': '신용위험'},
            {'level': 'medium', 'type': '시장위험'},
            {'level': 'low', 'type': '유동성위험'},
            {'level': 'low', 'type': '운영위험'},
            {'level': 'medium', 'type': '법률위험'},
            {'level': 'low', 'type': '평판위험'}
        ]
    else:
        return [
            {'level': 'high', 'type': '신용위험'},
            {'level': 'high', 'type': '시장위험'},
            {'level': 'high', 'type': '유동성위험'},
            {'level': 'medium', 'type': '운영위험'},
            {'level': 'high', 'type': '법률위험'},
            {'level': 'medium', 'type': '평판위험'}
        ]

def generate_recommendation(prediction_result, financial_indicators):
    """AI 추천사항 생성"""
    credit_score = prediction_result['credit_score']
    approval_status = prediction_result['approval_status']
    
    if approval_status == 'approved':
        if credit_score >= 800:
            return "고객의 신용도가 매우 우수하여 대출 승인을 강력히 권장합니다. 신용점수 {}점, 신용등급 {}등급으로 안정적인 상환 능력을 보여줍니다.".format(
                credit_score, prediction_result['credit_rating']
            )
        else:
            return "고객의 신용도가 양호하여 대출 승인을 권장합니다. 신용점수 {}점, 신용등급 {}등급으로 상환 능력이 확인되었습니다.".format(
                credit_score, prediction_result['credit_rating']
            )
    else:
        return "현재 신용상태를 고려할 때 대출 승인에 신중을 기해야 합니다. 신용점수 {}점으로 추가 심사가 필요합니다.".format(credit_score)
