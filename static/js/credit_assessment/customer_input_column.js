// KB국민은행 직원 업무시스템 - 고객 정보 입력 JavaScript

console.log('=== customer_input_column.js 로드됨 ===');

// 전역 변수
let currentCustomerData = null;
let currentAssessmentType = 'personal'; // 기본값: 개인

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

// 에러 표시 함수
function showError(input, message) {
    input.classList.add('error');
    const errorElement = document.getElementById(input.id + '_error');
    if (errorElement) {
        errorElement.innerHTML = message;
    }
}

// 모든 에러 제거 함수
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.innerHTML = '';
    });
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

// 고객 정보 표시 함수
function displayCustomerInfo(customer) {
    const customerDisplayContent = document.getElementById('customer_display_content');
    if (!customerDisplayContent) return;
    
    const html = `
    <div class="customer_info_grid">
        <div class="info_item"><div class="info_label">고객 ID</div><div class="info_value">${customer.id}</div></div>
        <div class="info_item"><div class="info_label">고객명</div><div class="info_value">${customer.full_name}</div></div>
        <div class="info_item"><div class="info_label">나이</div><div class="info_value">${customer.age}세</div></div>
        <div class="info_item"><div class="info_label">성별</div><div class="info_value">${customer.gender}</div></div>
        <div class="info_item"><div class="info_label">연락처</div><div class="info_value">${customer.phone}</div></div>
        <div class="info_item"><div class="info_label">이메일</div><div class="info_value">${customer.email}</div></div>
        <div class="info_item"><div class="info_label">최종 학력</div><div class="info_value">${customer.education_level}</div></div>
        <div class="info_item"><div class="info_label">회사명</div><div class="info_value">${customer.company_name}</div></div>
        <div class="info_item"><div class="info_label">직종</div><div class="info_value">${customer.job_title}</div></div>
        <div class="info_item"><div class="info_label">근속년수</div><div class="info_value">${customer.years_of_service}년</div></div>
        <div class="info_item"><div class="info_label">주택 상태</div><div class="info_value">${customer.housing_status}</div></div>
    </div>`;
    customerDisplayContent.innerHTML = html;
}

// 고객 정보 없음 표시 함수
function displayCustomerNotFound(message) {
    const customerDisplayContent = document.getElementById('customer_display_content');
    if (!customerDisplayContent) return;
    
    customerDisplayContent.innerHTML = `
    <div class="customer_not_found">
        <i class="bi bi-person-x"></i>
        <p>${message || '가입하지 않은 고객입니다.'}</p>
    </div>`;
}

// 고객 정보 확인 함수
function checkCustomerInfo() {
    console.log('=== checkCustomerInfo 함수 호출됨 ===');
    let isValid = true;
    clearAllErrors();
    
    const customerName = document.getElementById('customer_name');
    const customerRrn = document.getElementById('customer_rrn');
    const customerPhone = document.getElementById('customer_phone');
    
    console.log('고객 정보 입력값:', {
        name: customerName ? customerName.value : 'null',
        rrn: customerRrn ? customerRrn.value : 'null',
        phone: customerPhone ? customerPhone.value : 'null'
    });

    if (!customerName.value.trim()) {
        const nameLabel = currentAssessmentType === 'personal' ? '고객명' : '대표자명';
        showError(customerName, `${nameLabel}을 입력해주세요.`);
        isValid = false;
    }
    if (!customerRrn.value.trim()) {
        const rrnLabel = currentAssessmentType === 'personal' ? '주민번호' : '사업자등록번호';
        showError(customerRrn, `${rrnLabel}을 입력해주세요.`);
        isValid = false;
    }
    if (!customerPhone.value.trim()) {
        const phoneLabel = currentAssessmentType === 'personal' ? '연락처' : '대표 연락처';
        showError(customerPhone, `${phoneLabel}을 입력해주세요.`);
        isValid = false;
    }
    if (!isValid) return;

    // 버튼 로딩 상태로 변경
    const btnCheckCustomer = document.getElementById('btn_check_customer');
    if (btnCheckCustomer) {
        btnCheckCustomer.disabled = true;
        btnCheckCustomer.innerHTML = '<i class="bi bi-hourglass-split"></i><span>확인 중...</span>';
    }

    // 서버로 고객 정보 전송
    fetch('/kb_bank/credit_assessment/api/check-customer/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
            customer_name: customerName.value.trim(),
            customer_rrn: customerRrn.value.trim(),
            customer_phone: customerPhone.value.trim(),
        }),
    })
    .then((response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            return response.json();
        } else {
            return response.text().then((text) => {
                throw new Error('서버로부터 유효하지 않은 응답을 받았습니다. 응답 내용:\n' + text.substring(0, 200) + '...');
            });
        }
    })
    .then((data) => {
        console.log('고객 정보 확인 응답:', data);
        if (data.success && data.customer_found) {
            console.log('고객 정보 확인 성공');
            
            // 헤더 스위칭
            const customerInfoHeader = document.querySelector('.customer_info_header');
            const customerDisplayHeader = document.querySelector('.customer_display_header');
            if (customerInfoHeader) customerInfoHeader.style.display = 'none';
            if (customerDisplayHeader) customerDisplayHeader.style.display = 'flex';

            // 개인/기업 토글 숨기기
            const assessmentTypeToggle = document.querySelector('.assessment_type_toggle');
            if (assessmentTypeToggle) {
                assessmentTypeToggle.style.display = 'none';
            }

            displayCustomerInfo(data.customer);
            currentCustomerData = data.customer;
            // 전역 접근을 위해 window 객체에도 저장
            window.currentCustomerData = data.customer;

            // 좌측 입력영역 토글
            const inputGrid = document.querySelector('.input_grid');
            const bankerNotes = document.querySelector('.banker_notes');
            const customerCheckActions = document.querySelector('.customer_check_actions');
            if (inputGrid) inputGrid.style.display = 'none';
            if (bankerNotes) bankerNotes.style.display = 'none';
            if (customerCheckActions) customerCheckActions.style.display = 'none';

            const customerDisplayContent = document.getElementById('customer_display_content');
            if (customerDisplayContent) customerDisplayContent.style.display = 'block';
            
            // 두 번째 row 표시
            const secondRow = document.querySelector('.second_row');
            if (secondRow) secondRow.style.display = 'flex';
            
            console.log('고객 정보 확인 완료');
        } else {
            displayCustomerNotFound(data.message || '가입하지 않은 고객입니다.');
        }
    })
    .catch((error) => {
        console.error('고객 정보 확인 오류:', error);
        displayCustomerNotFound('고객 정보 확인 중 오류가 발생했습니다.');
    })
    .finally(() => {
        // 버튼 상태 복원
        if (btnCheckCustomer) {
            btnCheckCustomer.disabled = false;
            btnCheckCustomer.innerHTML = '<i class="bi bi-search"></i><span>고객 정보 확인</span>';
        }
    });
}

// 대출 상품 업데이트 함수
function updateLoanProducts() {
    const loanPurposeSelect = document.getElementById('loan_purpose');
    const loanProductSelect = document.getElementById('loan_product');
    
    if (!loanPurposeSelect || !loanProductSelect) return;
    
    const loanPurpose = loanPurposeSelect.value;
    loanProductSelect.innerHTML = '<option value="">대출 목적을 먼저 선택하세요</option>';
    if (!loanPurpose) return;

    loanProductSelect.innerHTML = '<option value="">상품을 불러오는 중...</option>';
    loanProductSelect.disabled = true;

    setTimeout(() => {
        const mockProducts = {
            house: [
                { id: '1', name: 'KB주택담보대출', interest_rate: 3.5, min_amount: 10000000, max_amount: 500000000 },
                { id: '2', name: 'KB전세자금대출', interest_rate: 4.2, min_amount: 5000000, max_amount: 200000000 },
                { id: '3', name: 'KB신축주택대출', interest_rate: 3.8, min_amount: 20000000, max_amount: 300000000 },
            ],
            business: [
                { id: '4', name: 'KB사업자대출', interest_rate: 5.5, min_amount: 10000000, max_amount: 100000000 },
                { id: '5', name: 'KB운전자금대출', interest_rate: 6.2, min_amount: 5000000, max_amount: 50000000 },
                { id: '6', name: 'KB설비자금대출', interest_rate: 5.8, min_amount: 20000000, max_amount: 200000000 },
            ],
            education: [
                { id: '7', name: 'KB학자금대출', interest_rate: 2.9, min_amount: 1000000, max_amount: 50000000 },
                { id: '8', name: 'KB교육비대출', interest_rate: 4.5, min_amount: 1000000, max_amount: 30000000 },
            ],
            medical: [
                { id: '9', name: 'KB의료비대출', interest_rate: 5.2, min_amount: 1000000, max_amount: 20000000 },
                { id: '10', name: 'KB성형수술대출', interest_rate: 7.5, min_amount: 1000000, max_amount: 10000000 },
            ],
            living: [
                { id: '11', name: 'KB생활비대출', interest_rate: 6.5, min_amount: 1000000, max_amount: 20000000 },
                { id: '12', name: 'KB급전대출', interest_rate: 8.2, min_amount: 500000, max_amount: 10000000 },
            ],
            other: [{ id: '13', name: 'KB기타목적대출', interest_rate: 6.8, min_amount: 1000000, max_amount: 30000000 }],
        };

        const products = mockProducts[loanPurpose] || [];
        loanProductSelect.innerHTML = '<option value="">대출 상품을 선택하세요</option>';
        products.forEach((p) => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.name} (${p.interest_rate}%)`;
            option.dataset.minAmount = p.min_amount;
            option.dataset.maxAmount = p.max_amount;
            option.dataset.interestRate = p.interest_rate;
            loanProductSelect.appendChild(option);
        });
        loanProductSelect.disabled = false;
    }, 500);
}

// 개인/기업 폼 업데이트 함수
function updateFormForAssessmentType(type) {
    const customerNameInput = document.getElementById('customer_name');
    const customerRrnInput = document.getElementById('customer_rrn');
    const customerPhoneInput = document.getElementById('customer_phone');
    const customerNameLabel = document.querySelector('label[for="customer_name"]');
    const customerRrnLabel = document.querySelector('label[for="customer_rrn"]');
    const customerPhoneLabel = document.querySelector('label[for="customer_phone"]');
    
    if (type === 'personal') {
        console.log('개인 여신심사 모드로 전환');
        
        // 개인용 라벨로 변경
        if (customerNameLabel) customerNameLabel.textContent = '고객명';
        if (customerRrnLabel) customerRrnLabel.textContent = '주민번호';
        if (customerPhoneLabel) customerPhoneLabel.textContent = '연락처';
        
        // 개인용 플레이스홀더로 변경
        if (customerNameInput) customerNameInput.placeholder = '홍길동';
        if (customerRrnInput) customerRrnInput.placeholder = '123456-1234567';
        if (customerPhoneInput) customerPhoneInput.placeholder = '010-1234-5678';
        
    } else if (type === 'corporate') {
        console.log('기업 여신심사 모드로 전환');
        
        // 기업용 라벨로 변경
        if (customerNameLabel) customerNameLabel.textContent = '대표자명';
        if (customerRrnLabel) customerRrnLabel.textContent = '사업자등록번호';
        if (customerPhoneLabel) customerPhoneLabel.textContent = '대표 연락처';
        
        // 기업용 플레이스홀더로 변경
        if (customerNameInput) customerNameInput.placeholder = '김대표';
        if (customerRrnInput) customerRrnInput.placeholder = '123-45-67890';
        if (customerPhoneInput) customerPhoneInput.placeholder = '02-1234-5678';
    }
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 고객 정보 입력 JavaScript 초기화 시작 ===');
    
    // DOM 요소들 가져오기
    const btnCheckCustomer = document.getElementById('btn_check_customer');
    const toggleButtons = document.querySelectorAll('.toggle_button');
    
    // 고객 정보 확인 버튼 이벤트 리스너
    if (btnCheckCustomer) {
        btnCheckCustomer.addEventListener('click', checkCustomerInfo);
        console.log('✅ btnCheckCustomer 이벤트 리스너 추가됨');
    } else {
        console.log('❌ btnCheckCustomer 요소를 찾을 수 없음');
    }
    
    // 개인/기업 토글 버튼 이벤트 리스너
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            currentAssessmentType = type;
            updateFormForAssessmentType(type);
        });
    });
    
    // 대출 목적 선택 이벤트 리스너
    const loanPurposeSelect = document.getElementById('loan_purpose');
    if (loanPurposeSelect) {
        loanPurposeSelect.addEventListener('change', updateLoanProducts);
        console.log('✅ loanPurposeSelect 이벤트 리스너 추가됨');
    } else {
        console.log('❌ loanPurposeSelect 요소를 찾을 수 없음');
    }
    
    // 전화번호 입력 포맷팅
    const phoneInput = document.getElementById('customer_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length >= 10) value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            else if (value.length >= 6) value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            else if (value.length >= 3) value = value.replace(/(\d{3})(\d{3})/, '$1-$2');
            this.value = value;
            
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
    }
    
    // 주민번호/사업자등록번호 입력 포맷팅
    const rrnInput = document.getElementById('customer_rrn');
    if (rrnInput) {
        rrnInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            
            // 개인/기업 모드에 따른 포맷팅
            if (currentAssessmentType === 'personal') {
                // 개인: 주민번호 포맷팅 (123456-1234567)
                if (value.length > 13) value = value.substring(0, 13);
                if (value.length >= 7) value = value.replace(/(\d{6})(\d{7})/, '$1-$2');
            } else {
                // 기업: 사업자등록번호 포맷팅 (123-45-67890)
                if (value.length > 10) value = value.substring(0, 10);
                if (value.length >= 5) value = value.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
            }
            
            this.value = value;
            
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
    }
    
    // 고객명 입력 에러 제거 이벤트 리스너
    const customerNameInput = document.getElementById('customer_name');
    if (customerNameInput) {
        customerNameInput.addEventListener('input', function () {
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
    }
    
    // 대출 금액 입력 포맷팅
    const loanAmountInput = document.getElementById('loan_amount');
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function () {
            let value = this.value.replace(/[^0-9]/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString('ko-KR');
            }
            this.value = value;
            
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
        
        // 숫자만 입력 허용
        loanAmountInput.addEventListener('keypress', function (e) {
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) e.preventDefault();
        });
    }
    
    // 대출 목적 선택 에러 제거 이벤트 리스너
    const loanPurposeSelectForError = document.getElementById('loan_purpose');
    if (loanPurposeSelectForError) {
        loanPurposeSelectForError.addEventListener('change', function () {
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
    }
    
    // 대출 상품 선택 에러 제거 이벤트 리스너
    const loanProductSelect = document.getElementById('loan_product');
    if (loanProductSelect) {
        loanProductSelect.addEventListener('change', function () {
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
    }
    
    // 대출 기간 선택 에러 제거 이벤트 리스너
    const loanPeriodSelect = document.getElementById('loan_period');
    if (loanPeriodSelect) {
        loanPeriodSelect.addEventListener('change', function () {
            // 에러 클래스 제거
            this.classList.remove('error');
            const errorElement = document.getElementById(this.id + '_error');
            if (errorElement) {
                errorElement.innerHTML = '';
            }
        });
    }
    
    // 페이지 로드 시 기본값 설정
    updateFormForAssessmentType('personal');
    
    // 여신 심사 요청 버튼 이벤트 리스너
    const btnAssess = document.getElementById('btn_assess');
    if (btnAssess) {
        btnAssess.addEventListener('click', performAssessment);
        console.log('✅ btnAssess 이벤트 리스너 추가됨');
    } else {
        console.log('❌ btnAssess 요소를 찾을 수 없음');
    }
    
    // 초기화 버튼 이벤트 리스너 추가
    const btnReset = document.getElementById('btn_reset');
    console.log('btnReset 요소 찾기:', btnReset);
    
    if (btnReset) {
        console.log('✅ btnReset 이벤트 리스너 추가됨');
        btnReset.addEventListener('click', function(e) {
            console.log('초기화 버튼 클릭됨');
            e.preventDefault();
            e.stopPropagation();
            resetToInitialState();
        });
    } else {
        console.log('❌ btnReset 요소를 찾을 수 없음');
        // DOM이 완전히 로드될 때까지 기다린 후 다시 시도
        setTimeout(() => {
            const btnResetRetry = document.getElementById('btn_reset');
            console.log('btnReset 재시도:', btnResetRetry);
            if (btnResetRetry) {
                btnResetRetry.addEventListener('click', function(e) {
                    console.log('초기화 버튼 클릭됨 (재시도)');
                    e.preventDefault();
                    e.stopPropagation();
                    resetToInitialState();
                });
                console.log('✅ btnReset 이벤트 리스너 추가됨 (재시도)');
            }
        }, 1000);
    }

    console.log('=== 고객 정보 입력 JavaScript 초기화 완료 ===');
});

// 초기화 버튼 이벤트 리스너 (DOMContentLoaded 외부에서도 작동)
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btn_reset') {
        console.log('초기화 버튼 클릭 감지 (전역 이벤트)');
        e.preventDefault();
        e.stopPropagation();
        resetToInitialState();
    }
});

// ---------- 초기화 관련 함수들 ----------

// 초기 상태로 리셋하는 함수
function resetToInitialState() {
    console.log('=== 초기 상태로 리셋 시작 ===');
    console.log('resetToInitialState 함수 호출됨');
    
    // 1. 모든 입력 필드 초기화
    const inputFields = [
        'customer_name', 'customer_rrn', 'customer_phone', 'customer_email',
        'loan_amount', 'loan_purpose', 'loan_product', 'loan_period'
    ];
    
    inputFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
            field.classList.remove('error');
        }
    });
    
    // 1-1. 고객 정보 확인 버튼 상태 초기화
    const btnCheckCustomer = document.getElementById('btn_check_customer');
    if (btnCheckCustomer) {
        btnCheckCustomer.disabled = false;
        btnCheckCustomer.innerHTML = '<i class="bi bi-search"></i><span>고객 정보 확인</span>';
    }
    
    // 2. 모든 에러 메시지 제거
    clearAllErrors();
    
    // 3. 고객 정보 표시 영역 숨기기 (기본 UI는 유지)
    const customerDisplayContent = document.getElementById('customer_display_content');
    const customerDisplayHeader = document.querySelector('.customer_display_header');
    const customerInfoHeader = document.querySelector('.customer_info_header');
    
    if (customerDisplayContent) {
        customerDisplayContent.style.display = 'none';
        customerDisplayContent.innerHTML = '';
    }
    
    if (customerDisplayHeader) {
        customerDisplayHeader.style.display = 'none';
    }
    
    if (customerInfoHeader) {
        customerInfoHeader.style.display = 'block';
    }
    
    // 4. first_row 안의 모든 요소들이 보이도록 보장 (단, customer_display_header는 제외)
    const firstRow = document.querySelector('.first_row');
    if (firstRow) {
        // first_row 안의 모든 자식 요소들을 표시 (customer_display_header 제외)
        const allChildren = firstRow.querySelectorAll('*');
        allChildren.forEach(child => {
            if (child.style && !child.classList.contains('customer_display_header')) {
                child.style.display = '';
            }
        });
        
        // first_row의 gap 스타일 복원
        firstRow.style.gap = '0.625rem';
        
        // customer_display_header는 명시적으로 숨기기
        const customerDisplayHeader = firstRow.querySelector('.customer_display_header');
        if (customerDisplayHeader) {
            customerDisplayHeader.style.display = 'none';
        }
    }
    
    // 4-1. usage_guide_container 스타일 초기화 (인라인 스타일 제거)
    const usageGuideContainer = document.getElementById('usage_guide_container');
    if (usageGuideContainer) {
        usageGuideContainer.style.display = '';
        console.log('usage_guide_container 스타일 초기화됨');
    } else {
        console.log('usage_guide_container 요소를 찾을 수 없음');
        // usage_guide_container가 없다면 third_column에서 찾아보기
        const thirdColumn = document.querySelector('.third_column');
        if (thirdColumn) {
            const existingUsageGuide = thirdColumn.querySelector('#usage_guide_container');
            if (existingUsageGuide) {
                existingUsageGuide.style.display = '';
                console.log('third_column에서 usage_guide_container 찾아서 스타일 초기화됨');
            } else {
                console.log('third_column에도 usage_guide_container가 없음');
            }
        }
    }
    
    // 5. 두 번째 row 숨기기 (하지만 assessment_actions는 보이도록)
    const secondRow = document.getElementById('second_row');
    if (secondRow) {
        secondRow.style.display = 'none';
    }
    
    // 6. 세 번째 row는 숨기지 않고 표시 (assessment_actions가 있으므로)
    const thirdRow = document.getElementById('third_row');
    if (thirdRow) {
        thirdRow.style.display = 'block';
        console.log('third_row 표시됨');
    }
    
    // 6-1. assessment_actions 스타일 초기화 (인라인 스타일 제거)
    const assessmentActions = document.querySelector('.assessment_actions');
    if (assessmentActions) {
        assessmentActions.style.display = '';
        console.log('assessment_actions 스타일 초기화됨');
    }
    
    // 7. 전역 변수 초기화
    currentCustomerData = null;
    currentAssessmentType = 'personal';
    
    // 8. 심사 결과 컬럼 초기화
    if (window.clearAssessmentResults) {
        window.clearAssessmentResults();
    }
    
    // 9. 보고서 컬럼은 초기화하지 않음 (사용자가 생성한 보고서는 유지)
    
    // 10. 대출 상품 옵션 초기화
    const loanProductSelect = document.getElementById('loan_product');
    if (loanProductSelect) {
        loanProductSelect.innerHTML = '<option value="">대출 목적을 먼저 선택하세요</option>';
    }
    
    // 11. 개인/기업 토글을 개인으로 초기화
    const personalToggle = document.querySelector('.toggle_button[data-type="personal"]');
    const corporateToggle = document.querySelector('.toggle_button[data-type="corporate"]');
    
    if (personalToggle && corporateToggle) {
        personalToggle.classList.add('active');
        corporateToggle.classList.remove('active');
    }
    
    console.log('=== 초기 상태로 리셋 완료 ===');
    
    // 사용자에게 알림
    alert('모든 정보가 초기화되었습니다.');
}

// ---------- 여신 심사 관련 함수들 ----------

// 대출 데이터 수집 함수
function getLoanData() {
    const amountRaw = document.getElementById('loan_amount').value.replace(/[^0-9]/g, '');
    const period = document.getElementById('loan_period').value;
    const loanProductSelect = document.getElementById('loan_product');
    const selectedOption = loanProductSelect.options[loanProductSelect.selectedIndex];
    const interestRate = selectedOption ? selectedOption.dataset.interestRate : '5.0'; // 기본값 5.0

    return {
        amount: parseInt(amountRaw, 10) || 0,
        period: parseInt(period, 10) || 12,
        interest_rate: parseFloat(interestRate) || 5.0,
    };
}

// 여신 심사 실행 함수
function performAssessment() {
    console.log('=== performAssessment 함수 호출됨 ===');
    
    // 폼 검증
    if (!validateForm()) {
        console.log('폼 검증 실패');
        return;
    }
    
    const btnAssess = document.getElementById('btn_assess');
    if (btnAssess) {
        btnAssess.disabled = true;
        btnAssess.innerHTML = '<i class="bi bi-hourglass-split"></i><span>심사 중...</span>';
    }

    // 로딩 화면 표시
    showLoadingScreen();
    callMLAssessmentAPI();
}

// ML 심사 API 호출 함수
function callMLAssessmentAPI() {
    const requestData = {
        customer_data: currentCustomerData,
        loan_data: getLoanData(),
    };

    console.log('ML 심사 요청 데이터:', requestData);

    fetch('/kb_bank/credit_assessment/api/assess-credit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(requestData),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log('ML 심사 응답:', data);
        if (data.success) {
            // 시각화/텍스트 렌더는 방어적으로 수행
            try {
                const safe = (obj, key, fallback) => (obj && obj[key] != null ? obj[key] : fallback);
                const r = data.assessment_result || {};
                
                // credit_rating 값이 항상 문자열이 되도록 보장
                let creditRating = safe(r, 'credit_rating', '-');
                if (typeof creditRating !== 'string') creditRating = '-';

                displayMLAssessmentResults({
                    credit_score: safe(r, 'credit_score', 0),
                    credit_rating: creditRating,
                    approval_status: safe(r, 'approval_status', 'pending'),
                    recommended_limit: safe(r, 'recommended_limit', 0),
                    credit_score_chart: safe(r, 'credit_score_chart', {}),
                    progress_chart: safe(r, 'progress_chart', {}),
                    risk_analysis_chart: safe(r, 'risk_analysis_chart', {}),
                    financial_indicators: safe(r, 'financial_indicators', {}),
                    risk_matrix: safe(r, 'risk_matrix', []),
                    ai_report: safe(r, 'ai_report', {}),
                });
            } catch (error) {
                console.error('결과 렌더링 오류:', error);
                alert('심사 결과 표시 중 오류가 발생했습니다.');
            }
        } else {
            alert('심사 처리 중 오류가 발생했습니다: ' + (data.message || '알 수 없는 오류'));
            hideResultsPage();
        }
    })
    .catch((error) => {
        console.error('ML 심사 API 오류:', error);
        alert('심사 API 호출 중 오류가 발생했습니다.');
        hideResultsPage();
    })
    .finally(() => {
        const btnAssess = document.getElementById('btn_assess');
        if (btnAssess) {
            btnAssess.disabled = false;
            btnAssess.innerHTML = '<i class="bi bi-clipboard-check"></i><span>여신 심사 요청</span>';
        }
    });
}

// 폼 검증 함수
function validateForm() {
    let isValid = true;
    clearAllErrors();

    // 고객 정보 검증 (currentCustomerData가 없을 때만)
    if (!currentCustomerData) {
        const customerName = document.getElementById('customer_name');
        const customerRrn = document.getElementById('customer_rrn');
        const customerPhone = document.getElementById('customer_phone');
        if (!customerName.value.trim()) {
            showError(customerName, '고객명을 입력해주세요.');
            isValid = false;
        }
        if (!customerRrn.value.trim()) {
            showError(customerRrn, '주민번호를 입력해주세요.');
            isValid = false;
        }
        if (!customerPhone.value.trim()) {
            showError(customerPhone, '연락처를 입력해주세요.');
            isValid = false;
        }
    }

    // 대출 정보 검증 (항상 수행)
    const loanAmount = document.getElementById('loan_amount');
    const loanPurpose = document.getElementById('loan_purpose');
    const loanProduct = document.getElementById('loan_product');
    const loanPeriod = document.getElementById('loan_period');

    if (!loanAmount.value.trim()) {
        showError(loanAmount, '대출 금액을 입력해주세요.');
        isValid = false;
    }
    if (!loanPurpose.value) {
        showError(loanPurpose, '대출 목적을 선택해주세요.');
        isValid = false;
    }
    if (!loanProduct.value) {
        showError(loanProduct, '대출 상품을 선택해주세요.');
        isValid = false;
    }
    if (!loanPeriod.value) {
        showError(loanPeriod, '대출 기간을 선택해주세요.');
        isValid = false;
    }
    
    return isValid;
}

// 로딩 화면 표시 함수
function showLoadingScreen() {
    console.log('=== showLoadingScreen 함수 호출됨 ===');
    
    // 사용법 안내는 숨기지 않음 (초기화 후에는 보여야 함)
    // const usageGuide = document.getElementById('usage_guide_container');
    // if (usageGuide) {
    //     usageGuide.style.display = 'none';
    // }
    
    // 심사 결과 숨기기
    const assessmentResults = document.getElementById('assessment_results');
    if (assessmentResults) {
        assessmentResults.style.display = 'none';
    }
    
    // 로딩 화면 표시
    const loadingScreen = document.getElementById('assessment_loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    
    console.log('로딩 화면 표시 완료');
}

// 결과 페이지 표시 함수
function showResultsPage() {
    console.log('=== showResultsPage 함수 호출됨 ===');
    
    // 로딩 화면 숨기기
    const loadingScreen = document.getElementById('assessment_loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // 사용법 안내 숨기기
    const usageGuide = document.getElementById('usage_guide_container');
    if (usageGuide) {
        usageGuide.style.display = 'none';
    }
    
    // 심사 결과 표시
    const assessmentResults = document.getElementById('assessment_results');
    if (assessmentResults) {
        assessmentResults.style.display = 'flex';
    }
    
    console.log('결과 페이지 표시 완료');
}

// 결과 페이지 숨기기 함수
function hideResultsPage() {
    const assessmentResults = document.getElementById('assessment_results');
    const usageGuideContainer = document.getElementById('usage_guide_container');
    if (assessmentResults) assessmentResults.style.display = 'none';
    if (usageGuideContainer) usageGuideContainer.style.display = 'flex';
}

// ML 심사 결과 표시 함수
function displayMLAssessmentResults(data) {
    console.log('ML 심사 결과 표시:', data);
    updateBasicInfo(data);
    updateCreditScoreDescription(data.credit_score);
    renderCreditScoreChart(data.credit_score_chart);
    renderProgressChart(data.progress_chart);
    renderRiskAnalysisChart(data.risk_analysis_chart);
    updateFinancialIndicators(data.financial_indicators || {});
    updateRiskMatrix(data.risk_matrix || []);
    updateAiReport(data.ai_report || {}, data.approval_status);
    
    // 결과 표시 후 결과 페이지로 전환
    showResultsPage();
}

// 기본 정보 업데이트 함수
function updateBasicInfo(data) {
    const creditScoreElement = document.querySelector('.credit_score');
    const creditRatingElement = document.querySelector('.credit_rating');
    const approvalStatusElement = document.querySelector('.approval_status');
    const recommendedLimitElement = document.getElementById('recommended_limit');
    const scoreDetailText = document.getElementById('credit_score_detail_text');
    const scoreDescriptionMain = document.getElementById('credit_score_description_main');

    if (creditScoreElement) creditScoreElement.textContent = data.credit_score;
    if (creditRatingElement) creditRatingElement.textContent = data.credit_rating;
    if (approvalStatusElement) {
        approvalStatusElement.textContent = data.approval_status === 'approved' ? '승인 가능' : '불가능';
        approvalStatusElement.className = `summary_value approval_status ${data.approval_status}`;
    }
    if (recommendedLimitElement) {
        recommendedLimitElement.textContent = `${Math.floor((data.recommended_limit || 0) / 10000).toLocaleString()}만원`;
    }
    if (scoreDetailText) scoreDetailText.textContent = `${data.credit_score}/1000점`;
    if (scoreDescriptionMain) {
        scoreDescriptionMain.innerHTML = `<strong>신용점수 ${data.credit_score}점</strong>은 1000점 만점 기준으로 <strong>${data.credit_rating}</strong> 등급에 해당합니다.`;
    }
}

// 신용점수 설명 업데이트 함수
function updateCreditScoreDescription(score) {
    const detailEl = document.getElementById('credit_score_description_detail');
    const benefitEl = document.querySelector('.credit_score_discription .description_benefit');
    if (!detailEl || !benefitEl) return;

    let detailText, benefitText;

    if (score >= 850) {
        detailText = "고객은 지속적인 신용거래 이력과 우수한 상환 습관을 보유하고 있으며, 최근 연체·부실 기록이 거의 없어 신용리스크가 극히 낮습니다. 내부 자동심사 기준을 충족하여 최소한의 서류 확인만으로도 신속한 한도 산정과 금리 적용이 가능하며, 대규모 공여의 경우에도 내부 추가 검증을 거쳐 우대조건을 제공할 수 있습니다. 전반적으로 대출 취급에 있어 예외적인 리스크가 없으므로 비대면 처리 및 우선 심사 대상으로 분류됩니다.";
        benefitText = "<strong>대출 승인 가능성: 최상</strong> | <strong>적용 가능 금리: 업계 최저·우대금리</strong> | <strong>예상 한도: 최대 한도 승인 가능(심사조건 충족 시)</strong> | <strong>심사 처리: 즉시 자동 승인·우선 처리</strong> | <strong>필요 서류: 최소화(전자소득조회 등 자동 확인)</strong>";
    } else if (score >= 700) {
        detailText = "전반적인 신용활동과 상환능력이 양호하여 금융기관 관점에서 신뢰도가 높은 편입니다. 소액의 과거 연체가 있었더라도 회복된 이력이 있다면 우수 등급으로 분류되며, 대부분의 금융상품을 유리한 조건으로 이용할 수 있습니다. 다만 개인별 DTI(부채비율)나 최근 채무증가와 같은 개별 리스크 요인에 따라 한도나 금리가 조정될 수 있으므로, 고액 신청 시 추가 소득증빙을 요구하거나 조건부 한도가 제시될 수 있습니다.";
        benefitText = "<strong>대출 승인 가능성: 매우 높음</strong> | <strong>우대 금리 적용 가능</strong> | <strong>예상 한도: 비교적 높은 한도 승인 예상</strong> | <strong>심사 처리: 대부분 자동 또는 조건부 자동 심사</strong> | <strong>권장 조치: DTI 개선 시 추가 혜택 및 한도 상향 가능</strong>";
    } else if (score >= 500) {
        detailText = "신용 상태가 평균 수준으로 정상적인 금융거래는 가능하나 일부 상품이나 고액 대출에 대해서는 제약이 발생할 수 있습니다. 과거 연체 이력, 소득 불안정, 혹은 근속기간 미충족 등의 요인이 있으면 심사 시 가중치가 부여되어 추가 서류 제출이나 수동심사가 요구될 가능성이 큽니다. 신용 점수 향상을 위해 규칙적인 상환, 사용패턴 개선 및 부채 축소 노력이 권장됩니다.";
        benefitText = "<strong>대출 승인 가능성: 보통</strong> | <strong>적용 금리: 표준 금리 적용</strong> | <strong>예상 한도: 심사 후 한도 결정(조건부 한도 적용 가능)</strong> | <strong>요구 서류: 추가 소득·재직증빙 필요할 수 있음</strong> | <strong>권장 조치: 부채통합 및 상환계획 수립 권고</strong>";
    } else {
        detailText = "현재 신용점수는 낮은 수준으로 평가되며, 연체·부실 발생 가능성이 높아 즉시 대출 승인되기 어렵거나 매우 엄격한 조건(담보·보증인 제공, 고금리 적용 등)이 요구될 수 있습니다. 반복적 연체나 파산 이력이 있는 경우에는 자동거절 규정이 적용될 수 있으므로 우선적으로 채무 정리와 상환 계획 수립이 필요합니다. 필요시 금융 상담을 통해 채무조정 및 재무구조 개선 방안을 안내합니다.";
        benefitText = "<strong>대출 승인 가능성: 낮음</strong> | <strong>적용 금리: 높은 금리 적용</strong> | <strong>예상 한도: 제한적 또는 담보·보증인 필요</strong> | <strong>심사 처리: 수동심사 및 추가심사 필요</strong> | <strong>권장 조치: 채무조정·상환플랜 수립 권고</strong>";
    }

    detailEl.textContent = detailText;
    benefitEl.innerHTML = benefitText;
}

// 차트 렌더링 함수들
function renderCreditScoreChart(chartData) {
    const chartContainer = document.getElementById('credit_score_chart_container');
    if (chartContainer && window.Plotly) {
        const cfg = safeJSONParse(chartData);
        Plotly.newPlot('credit_score_chart_container', cfg.data, cfg.layout, {
            responsive: true,
            displayModeBar: false,
        });
    }
}

function renderProgressChart(chartData) {
    const chartContainer = document.getElementById('progress_chart_container');
    if (chartContainer && window.Plotly) {
        const cfg = safeJSONParse(chartData);
        Plotly.newPlot('progress_chart_container', cfg.data, cfg.layout, {
            responsive: true,
            displayModeBar: false,
        });
    }
}

function renderRiskAnalysisChart(chartData) {
    const chartContainer = document.getElementById('risk_analysis_chart_container');
    if (chartContainer && window.Plotly) {
        const cfg = safeJSONParse(chartData);
        updateRiskAnalysisDescription(cfg); // 시나리오 업데이트 함수 호출
        Plotly.newPlot(chartContainer, cfg, {}, {
            responsive: true,
            displayModeBar: false,
        });
    }
}

function updateRiskAnalysisDescription(chartData) {
    const detailEl = document.querySelector('.risk_analysis_grid .risk_analysis_detail');
    const mainDescEl = document.querySelector('.risk_analysis_discription .description_main');
    const detailDescEl = document.querySelector('.risk_analysis_discription .description_detail');

    if (!detailEl || !mainDescEl || !detailDescEl) return;

    const values = chartData.data?.[0]?.r || [];
    const avgScore = values.reduce((sum, val) => sum + val, 0) / (values.length || 1);

    let riskLevelText, mainDescText, detailDescText;

    if (avgScore >= 75) {
        riskLevelText = "종합 위험도: 안정";
        mainDescText = "모든 금융 지표가 매우 안정적입니다.";
        detailDescText = "고객의 소득, 신용 상태, 부채 수준 등 모든 면에서 리스크가 매우 낮아 긍정적인 심사 결과가 예상됩니다.";
    } else if (avgScore >= 50) {
        riskLevelText = "종합 위험도: 양호";
        mainDescText = "전반적으로 양호하나 일부 지표에 대한 관리가 필요합니다.";
        detailDescText = "대부분의 지표가 안정적이지만, 일부 항목(예: 소득 대비 대출 비율)에서 약간의 리스크가 발견되었습니다. 추가적인 검토가 필요할 수 있습니다.";
    } else if (avgScore >= 30) {
        riskLevelText = "종합 위험도: 주의";
        mainDescText = "일부 지표에서 리스크가 발견되어 주의가 필요합니다.";
        detailDescText = "소득 안정성 또는 신용 이력 등 특정 지표에서 주의가 필요한 수준의 리스크가 확인되었습니다. 해당 항목에 대한 심층 분석이 필요합니다.";
    } else {
        riskLevelText = "종합 위험도: 위험";
        mainDescText = "다수의 지표에서 리스크가 높아 심사에 부정적 영향이 예상됩니다.";
        detailDescText = "전반적인 재무 상태가 불안정하며, 상환 능력에 대한 리스크가 높게 평가되었습니다. 대출 승인에 신중한 접근이 요구됩니다.";
    }

    detailEl.textContent = riskLevelText;
    mainDescEl.textContent = mainDescText;
    detailDescEl.innerHTML = `지표는 <strong>수입, 요청 대출금, 대출 금리, 수입 대비 대출률, 신용 점수</strong>의 5가지 축으로 구성되며, ${detailDescText}`;
}

function updateFinancialIndicators(indicators) {
    const detailItems = document.querySelectorAll('.detail_section .detail_item');
    const keys = Object.keys(indicators);
    keys.forEach((key, idx) => {
        if (!detailItems[idx]) return;
        const value = indicators[key];
        const valueEl = detailItems[idx].querySelector('.detail_value');
        const fill = detailItems[idx].querySelector('.progress_fill');
        if (valueEl) valueEl.textContent = `${value}%`;
        if (fill) {
            fill.style.width = `${value}%`;
            const bar = fill.parentElement;
            bar.className = 'progress_bar';
            if (value >= 80) bar.classList.add('low_risk');
            else if (value >= 50) bar.classList.add('medium_risk');
            else bar.classList.add('high_risk');
        }
    });
}

function updateRiskMatrix(riskMatrix) {
    const riskItems = document.querySelectorAll('.risk_item');
    riskMatrix.forEach((risk, i) => {
        if (!riskItems[i]) return;
        riskItems[i].className = `risk_item ${risk.level}`;
        const riskLevel = risk.level === 'low' ? '낮음' : risk.level === 'medium' ? '중간' : '높음';
        riskItems[i].children[0].textContent = riskLevel;
        riskItems[i].children[1].textContent = risk.type;
    });
}

function updateAiReport(reportData, approvalStatus) {
    const summaryIcon = document.getElementById('ai_summary_icon');
    const summaryTitle = document.getElementById('ai_summary_title');
    const summaryDesc = document.getElementById('ai_summary_description');
    const analysisDetailsContainer = document.querySelector('.analysis_details');
    const recommendationsList = document.querySelector(
        '.analysis_recommendations .recommendation_section:nth-child(1) .recommendation_list'
    );
    const warningsList = document.querySelector(
        '.analysis_recommendations .recommendation_section:nth-child(2) .recommendation_list'
    );

    const isApproved = approvalStatus === 'approved';
    if (summaryIcon) summaryIcon.className = isApproved ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill';
    if (summaryTitle) summaryTitle.textContent = reportData.summary_title || '결과 요약';
    if (summaryDesc) summaryDesc.innerHTML = reportData.summary_description || '';

    if (analysisDetailsContainer && Array.isArray(reportData.analysis_details)) {
        const items = analysisDetailsContainer.querySelectorAll('.detail_item');
        reportData.analysis_details.forEach((d, i) => {
            if (!items[i]) return;
            items[i].querySelector('.detail_label').textContent = d.label || '';
            items[i].querySelector('.detail_value').textContent = d.value || '';
            items[i].querySelector('.detail_description').textContent = d.description || '';
        });
    }

    function updateList(listEl, items, isWarning = false) {
        if (!listEl) return;
        listEl.innerHTML = '';
        (items || []).forEach((t) => {
            const div = document.createElement('div');
            div.className = `recommendation_item ${isWarning ? 'warning' : ''}`;
            div.innerHTML = `<i class="bi ${isWarning ? 'bi-exclamation-circle' : 'bi-check-circle'}"></i><span>${t}</span>`;
            listEl.appendChild(div);
        });
    }

    updateList(recommendationsList, reportData.recommendations, false);
    updateList(warningsList, reportData.warnings, true);
}

// JSON 파싱 안전 함수
function safeJSONParse(maybeJson, fallback = { data: [], layout: {} }) {
    try {
        if (typeof maybeJson === 'string') return JSON.parse(maybeJson);
        if (typeof maybeJson === 'object' && maybeJson !== null) return maybeJson;
        return fallback;
    } catch {
        return fallback;
    }
}
