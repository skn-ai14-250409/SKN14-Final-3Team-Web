import joblib
import numpy as np
import logging

logger = logging.getLogger(__name__)

# ML 모델 로드
try:
    PERSONAL_MODEL = joblib.load('ml_models/personal_loan_lgbm.pkl')
    PERSONAL_SCALER = joblib.load('ml_models/personal_loan_scaler.pkl')
    CORPORATE_MODEL = joblib.load('ml_models/corporate_loan_lgbm.pkl')
    CORPORATE_SCALER = joblib.load('ml_models/corporate_loan_scaler.pkl')
    logger.info("ML 모델 로딩 성공")
except Exception as e:
    logger.error(f"ML 모델 로드 실패: {e}")
    PERSONAL_MODEL = None
    PERSONAL_SCALER = None
    CORPORATE_MODEL = None
    CORPORATE_SCALER = None

def get_credit_rating(score):
    """신용점수에 따른 등급 반환"""
    if score >= 900: return 'AAA'
    if score >= 800: return 'AA'
    if score >= 700: return 'A'
    if score >= 600: return 'B'
    if score >= 500: return 'C'
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

def map_categorical_features(customer_data):
    """범주형 데이터를 숫자형으로 변환"""
    education_map = {'고등학교': 1, '대학교': 2, '대학원': 3}
    housing_map = {'전/월세': 1, '자가': 2}

    customer_data['education_level_encoded'] = education_map.get(customer_data.get('education_level'), 1)
    customer_data['housing_status_encoded'] = housing_map.get(customer_data.get('housing_status'), 1)
    return customer_data

def predict_credit_score(customer_data, loan_data, customer_type='personal'):
    """ML 모델을 사용한 신용점수 예측"""
    try:
        # 범주형 데이터 변환
        customer_data = map_categorical_features(customer_data)

        if customer_type == 'personal' and PERSONAL_MODEL and PERSONAL_SCALER:
            # 개인 고객 특성 추출
            features = np.array([
                customer_data.get('age', 30),
                customer_data.get('years_of_service', 5),
                loan_data.get('amount', 10000000),
                loan_data.get('period', 12),
                customer_data.get('education_level_encoded', 1),
                customer_data.get('housing_status_encoded', 1)
            ]).reshape(1, -1)
            
            scaled_features = PERSONAL_SCALER.transform(features)
            prediction = PERSONAL_MODEL.predict(scaled_features)[0]
            
        elif customer_type == 'corporate' and CORPORATE_MODEL and CORPORATE_SCALER:
            # 기업 고객 특성 추출 (예시)
            features = np.array([
                customer_data.get('years_of_service', 5),
                loan_data.get('amount', 10000000),
                loan_data.get('period', 12),
                50 # 예시: 기업 규모
            ]).reshape(1, -1)
            
            scaled_features = CORPORATE_SCALER.transform(features)
            prediction = CORPORATE_MODEL.predict(scaled_features)[0]
            
        else:
            # 모델이 없을 경우 기본값
            prediction = 0.75 # 750점에 해당
        
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
        # 오류 발생 시 기본값 반환
        return {
            'credit_score': 750,
            'credit_rating': 'B',
            'approval_status': 'approved',
            'recommended_limit': loan_data.get('amount', 30000000)
        }