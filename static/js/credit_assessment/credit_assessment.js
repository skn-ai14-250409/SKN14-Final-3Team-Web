// KB국민은행 직원 업무시스템 - 여신 심사 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소들
    const btnAssess = document.getElementById('btn_assess');
    const btnReset = document.getElementById('btn_reset');
    const btnCheckCustomer = document.getElementById('btn_check_customer');
    const customerInfoDisplay = document.getElementById('customer_info_display');
    const customerDisplayContent = document.getElementById('customer_display_content');
    const firstRow = document.querySelector('.first_row');
    const secondRow = document.getElementById('second_row');
    const thirdRow = document.getElementById('third_row');
    
    // 폼 요소들
    const form = document.querySelector('.credit_assessment_content');
    const inputs = form.querySelectorAll('input, select');
    
    // 대출 상품 관련 요소들
    const loanPurposeSelect = document.getElementById('loan_purpose');
    const loanProductSelect = document.getElementById('loan_product');
    
    // 여신 심사 요청 버튼 클릭 이벤트
    btnAssess.addEventListener('click', function() {
        if (validateForm()) {
            alert('여신 심사 요청이 완료되었습니다!');
        }
    });
    
    // 초기화 버튼 클릭 이벤트
    btnReset.addEventListener('click', function() {
        resetForm();
    });
    
    // 고객 정보 확인 버튼 클릭 이벤트
    btnCheckCustomer.addEventListener('click', function() {
        checkCustomerInfo();
    });
    
    // 대출 목적 변경 이벤트
    loanPurposeSelect.addEventListener('change', function() {
        updateLoanProducts();
    });
    
    // 폼 유효성 검사
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '#e5e7eb';
            }
        });
        
        if (!isValid) {
            alert('필수 입력 항목을 모두 입력해주세요.');
        }
        
        return isValid;
    }
    
    
    // 고객 정보 확인
    function checkCustomerInfo() {
        const customerName = document.getElementById('customer_name').value.trim();
        const customerRrn = document.getElementById('customer_rrn').value.trim();
        const customerPhone = document.getElementById('customer_phone').value.trim();
        const customerEmail = document.getElementById('customer_email').value.trim();
        
        // 필수 입력값 검증
        if (!customerName || !customerRrn || !customerPhone) {
            alert('고객명, 주민번호, 연락처는 필수 입력 항목입니다.');
            return;
        }
        
        // 로딩 상태 표시
        btnCheckCustomer.disabled = true;
        btnCheckCustomer.innerHTML = '<i class="bi bi-hourglass-split"></i><span>확인 중...</span>';
        
        // 임시 데이터로 시뮬레이션 (1초 후 결과 표시)
        setTimeout(() => {
            // 임시 고객 데이터 생성
            const mockCustomer = {
                id: 'KB2024001',
                full_name: customerName || '홍길동',
                first_name: customerName.split(' ')[0] || '길동',
                last_name: customerName.split(' ')[1] || '홍',
                rrn: customerRrn || '123456-1234567',
                phone: customerPhone || '010-1234-5678',
                email: customerEmail || 'hong@example.com',
                age: 35,
                gender: '남성',
                education_level: '대학교',
                company_name: 'KB국민은행',
                job_title: '대리',
                years_of_service: 8,
                housing_status: '자가',
                account_number: '123-456-789012'
            };
            
            // 기존 입력 폼 숨기기
            firstRow.style.display = 'none';
            
            // 고객 정보 표시
            displayCustomerInfo(mockCustomer);
            
            // 고객 정보 표시 영역 보이기
            customerInfoDisplay.style.display = 'flex';
            
            // 대출 정보 섹션 표시
            secondRow.style.display = 'flex';
            
            // 심사 요청 버튼 섹션 표시
            thirdRow.style.display = 'flex';
            
            // 버튼 상태 복원
            btnCheckCustomer.disabled = false;
            btnCheckCustomer.innerHTML = '<i class="bi bi-search"></i><span>고객 정보 확인</span>';
        }, 1000);
    }
    
    // 고객 정보 표시
    function displayCustomerInfo(customer) {
        const customerInfoHtml = `
            <div class="customer_info_grid">
                <div class="info_item">
                    <div class="info_label">고객명</div>
                    <div class="info_value">${customer.full_name}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">주민번호</div>
                    <div class="info_value">${customer.rrn}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">연락처</div>
                    <div class="info_value">${customer.phone}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">이메일</div>
                    <div class="info_value">${customer.email || '-'}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">나이</div>
                    <div class="info_value">${customer.age}세</div>
                </div>
                <div class="info_item">
                    <div class="info_label">성별</div>
                    <div class="info_value">${customer.gender}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">교육 수준</div>
                    <div class="info_value">${customer.education_level}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">근속년수</div>
                    <div class="info_value">${customer.years_of_service}년</div>
                </div>
                <div class="info_item">
                    <div class="info_label">주택 상태</div>
                    <div class="info_value">${customer.housing_status}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">회원 ID</div>
                    <div class="info_value">${customer.id}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">회사명</div>
                    <div class="info_value">${customer.company_name}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">직종</div>
                    <div class="info_value">${customer.job_title}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">계좌번호</div>
                    <div class="info_value">${customer.account_number}</div>
                </div>
            </div>
        `;
        
        customerDisplayContent.innerHTML = customerInfoHtml;
        customerInfoDisplay.style.display = 'block';
    }
    
    // 고객 정보 없음 표시
    function displayCustomerNotFound() {
        const notFoundHtml = `
            <div class="customer_not_found">
                <i class="bi bi-person-x"></i>
                <p>가입하지 않은 고객입니다.</p>
            </div>
        `;
        
        customerDisplayContent.innerHTML = notFoundHtml;
        customerInfoDisplay.style.display = 'block';
    }
    
    // 대출 상품 업데이트
    function updateLoanProducts() {
        const loanPurpose = loanPurposeSelect.value;
        
        // 대출 상품 선택 옵션 초기화
        loanProductSelect.innerHTML = '<option value="">대출 목적을 먼저 선택하세요</option>';
        
        if (!loanPurpose) {
            return;
        }
        
        // 로딩 상태 표시
        loanProductSelect.innerHTML = '<option value="">상품을 불러오는 중...</option>';
        loanProductSelect.disabled = true;
        
        // 임시 데이터로 시뮬레이션 (0.5초 후 결과 표시)
        setTimeout(() => {
            // 임시 대출 상품 데이터
            const mockProducts = {
                'house': [
                    { id: '1', name: 'KB주택담보대출', interest_rate: 3.5, min_amount: 10000000, max_amount: 500000000 },
                    { id: '2', name: 'KB전세자금대출', interest_rate: 4.2, min_amount: 5000000, max_amount: 200000000 },
                    { id: '3', name: 'KB신축주택대출', interest_rate: 3.8, min_amount: 20000000, max_amount: 300000000 }
                ],
                'business': [
                    { id: '4', name: 'KB사업자대출', interest_rate: 5.5, min_amount: 10000000, max_amount: 100000000 },
                    { id: '5', name: 'KB창업자금대출', interest_rate: 4.8, min_amount: 5000000, max_amount: 50000000 },
                    { id: '6', name: 'KB운영자금대출', interest_rate: 6.2, min_amount: 3000000, max_amount: 30000000 }
                ],
                'education': [
                    { id: '7', name: 'KB교육비대출', interest_rate: 4.5, min_amount: 1000000, max_amount: 50000000 },
                    { id: '8', name: 'KB유학자금대출', interest_rate: 5.8, min_amount: 5000000, max_amount: 100000000 }
                ],
                'medical': [
                    { id: '9', name: 'KB의료비대출', interest_rate: 6.5, min_amount: 1000000, max_amount: 30000000 },
                    { id: '10', name: 'KB건강보험대출', interest_rate: 5.2, min_amount: 500000, max_amount: 10000000 }
                ],
                'living': [
                    { id: '11', name: 'KB생활비대출', interest_rate: 7.2, min_amount: 500000, max_amount: 20000000 },
                    { id: '12', name: 'KB신용대출', interest_rate: 8.5, min_amount: 1000000, max_amount: 50000000 }
                ],
                'other': [
                    { id: '13', name: 'KB기타목적대출', interest_rate: 6.8, min_amount: 1000000, max_amount: 30000000 }
                ]
            };
            
            const products = mockProducts[loanPurpose] || [];
            
            loanProductSelect.innerHTML = '<option value="">대출 상품을 선택하세요</option>';
            
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (${product.interest_rate}%)`;
                option.dataset.minAmount = product.min_amount;
                option.dataset.maxAmount = product.max_amount;
                option.dataset.interestRate = product.interest_rate;
                loanProductSelect.appendChild(option);
            });
            
            loanProductSelect.disabled = false;
        }, 500);
    }
    
    // CSRF 토큰 가져오기
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // 폼 초기화
    function resetForm() {
        // 모든 입력 필드 초기화
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#e5e7eb';
        });
        
        // 입력 폼 다시 보이기
        firstRow.style.display = 'flex';
        
        // 고객 정보 표시 영역 숨기기
        customerInfoDisplay.style.display = 'none';
        
        // 대출 정보 섹션 숨기기
        secondRow.style.display = 'none';
        
        // 심사 요청 버튼 섹션 숨기기
        thirdRow.style.display = 'none';
        
        // 단계 초기화
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }
    
    // 입력 필드 포커스 이벤트
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3b82f6';
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#10b981';
            } else {
                this.style.borderColor = '#e5e7eb';
            }
        });
    });
    
    // 숫자 입력 필드 포맷팅 (대출 신청 금액만)
    const loanAmountInput = document.getElementById('loan_amount');
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function() {
            if (this.value) {
                // 천 단위 콤마 추가 (표시용)
                const value = this.value.replace(/,/g, '');
                if (!isNaN(value)) {
                    this.value = parseInt(value).toLocaleString();
                }
            }
        });
    }
    
    // 전화번호 자동 포맷팅
    const phoneInput = document.getElementById('customer_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 10) {
                value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            } else if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1-$2');
            }
            this.value = value;
        });
    }
    
    // 주민번호 자동 포맷팅
    const rrnInput = document.getElementById('customer_rrn');
    if (rrnInput) {
        rrnInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 7) {
                value = value.replace(/(\d{6})(\d{7})/, '$1-$2');
            }
            this.value = value;
        });
    }
});
