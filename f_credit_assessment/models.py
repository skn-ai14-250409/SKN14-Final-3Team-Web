from django.db import models
from django.contrib.auth.models import User

class Customer(models.Model):
    """고객 정보 모델"""
    
    # 기본 정보
    first_name = models.CharField(max_length=50, verbose_name="성")
    last_name = models.CharField(max_length=50, verbose_name="이름")
    rrn = models.CharField(max_length=14, unique=True, verbose_name="주민번호")  # 123456-1234567
    phone = models.CharField(max_length=13, verbose_name="연락처")  # 010-1234-5678
    email = models.EmailField(blank=True, null=True, verbose_name="이메일")
    
    # 개인 정보
    age = models.IntegerField(verbose_name="나이")
    GENDER_CHOICES = [
        ('M', '남성'),
        ('F', '여성'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="성별")
    
    # 교육 및 직업 정보
    EDUCATION_CHOICES = [
        ('high_school', '고등학교'),
        ('college', '대학교'),
        ('graduate', '대학원'),
        ('other', '기타'),
    ]
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, verbose_name="교육 수준")
    company_name = models.CharField(max_length=100, verbose_name="회사명")
    job_title = models.CharField(max_length=50, verbose_name="직종")
    years_of_service = models.IntegerField(verbose_name="근속년수")
    
    # 주거 정보
    HOUSING_CHOICES = [
        ('owned', '자가'),
        ('rented', '전세'),
        ('monthly_rent', '월세'),
        ('other', '기타'),
    ]
    housing_status = models.CharField(max_length=20, choices=HOUSING_CHOICES, verbose_name="주택 상태")
    
    # 계좌 정보
    account_number = models.CharField(max_length=20, verbose_name="계좌번호")
    
    # 시스템 정보
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    class Meta:
        db_table = 'customers'
        verbose_name = '고객'
        verbose_name_plural = '고객들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.last_name}{self.first_name} ({self.rrn})"
    
    @property
    def full_name(self):
        """전체 이름 반환"""
        return f"{self.last_name}{self.first_name}"
    
    @property
    def formatted_phone(self):
        """포맷된 전화번호 반환"""
        return self.phone
    
    @property
    def formatted_rrn(self):
        """포맷된 주민번호 반환"""
        return self.rrn


class LoanProduct(models.Model):
    """대출 상품 모델"""
    
    name = models.CharField(max_length=100, verbose_name="상품명")
    purpose = models.CharField(max_length=50, verbose_name="대출 목적")
    min_amount = models.BigIntegerField(verbose_name="최소 대출 금액")
    max_amount = models.BigIntegerField(verbose_name="최대 대출 금액")
    min_period = models.IntegerField(verbose_name="최소 대출 기간(개월)")
    max_period = models.IntegerField(verbose_name="최대 대출 기간(개월)")
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="금리(%)")
    description = models.TextField(blank=True, verbose_name="상품 설명")
    is_active = models.BooleanField(default=True, verbose_name="활성화 여부")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    class Meta:
        db_table = 'loan_products'
        verbose_name = '대출 상품'
        verbose_name_plural = '대출 상품들'
        ordering = ['purpose', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.purpose})"


class CreditAssessment(models.Model):
    """여신 심사 모델"""
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name="고객")
    loan_product = models.ForeignKey(LoanProduct, on_delete=models.CASCADE, verbose_name="대출 상품")
    loan_amount = models.BigIntegerField(verbose_name="대출 신청 금액")
    loan_period = models.IntegerField(verbose_name="대출 기간(개월)")
    
    # 심사 결과
    ASSESSMENT_STATUS_CHOICES = [
        ('pending', '심사 대기'),
        ('approved', '승인'),
        ('rejected', '거부'),
        ('under_review', '심사 중'),
    ]
    status = models.CharField(max_length=20, choices=ASSESSMENT_STATUS_CHOICES, default='pending', verbose_name="심사 상태")
    
    # 심사 정보
    credit_score = models.IntegerField(blank=True, null=True, verbose_name="신용 점수")
    monthly_income = models.BigIntegerField(blank=True, null=True, verbose_name="월 소득")
    employment_type = models.CharField(max_length=20, blank=True, verbose_name="고용 형태")
    
    # 결과 정보
    approved_amount = models.BigIntegerField(blank=True, null=True, verbose_name="승인 금액")
    approved_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, verbose_name="승인 금리")
    monthly_payment = models.BigIntegerField(blank=True, null=True, verbose_name="월 상환액")
    credit_grade = models.CharField(max_length=10, blank=True, verbose_name="신용 등급")
    
    # 시스템 정보
    assessed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="심사자")
    assessed_at = models.DateTimeField(blank=True, null=True, verbose_name="심사일")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")
    
    class Meta:
        db_table = 'credit_assessments'
        verbose_name = '여신 심사'
        verbose_name_plural = '여신 심사들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.loan_product.name} ({self.status})"
