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
    const assessmentResults = document.getElementById('assessment_results');
    const resultsContent = document.getElementById('results_content');
    
    // 토글 버튼들
    const toggleButtons = document.querySelectorAll('.toggle_btn');
    let currentCustomerType = 'individual'; // 기본값: 개인
    
    // 폼 요소들
    const form = document.querySelector('.credit_assessment_content');
    const inputs = form.querySelectorAll('input, select');
    
    // 대출 상품 관련 요소들
    const loanPurposeSelect = document.getElementById('loan_purpose');
    const loanProductSelect = document.getElementById('loan_product');
    
    // 토글 버튼 이벤트
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 토글 버튼에서 active 클래스 제거
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 현재 고객 타입 업데이트
            currentCustomerType = this.dataset.type;
            
            // 고객 타입에 따른 UI 업데이트
            updateUIForCustomerType(currentCustomerType);
        });
    });
    
    // 여신 심사 요청 버튼 클릭 이벤트
    btnAssess.addEventListener('click', function() {
        if (validateForm()) {
            performAssessment();
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
        
        // 에러 메시지 초기화
        clearAllErrors();
        
        // 필수 입력 필드 검증
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
        
        return isValid;
    }
    
    function showError(input, message) {
        // input에 error 클래스 추가
        input.classList.add('error');
        
        // 에러 메시지 표시
        const errorElement = document.getElementById(input.id + '_error');
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        // 0.4초 후 error 클래스 제거 (애니메이션 완료 후)
        setTimeout(() => {
            input.classList.remove('error');
        }, 400);
    }
    
    function clearAllErrors() {
        // 모든 input에서 error 클래스 제거
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
        
        // 모든 에러 메시지 초기화
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.textContent = '';
        });
    }
    
    
    // 고객 정보 확인
    function checkCustomerInfo() {
        // 필수 입력값 검증
        if (!validateForm()) {
            return;
        }
        
        const customerName = document.getElementById('customer_name').value.trim();
        const customerRrn = document.getElementById('customer_rrn').value.trim();
        const customerPhone = document.getElementById('customer_phone').value.trim();
        const customerEmail = document.getElementById('customer_email').value.trim();
        
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
    
    // 고객 타입에 따른 UI 업데이트
    function updateUIForCustomerType(customerType) {
        const headerIcon = document.querySelector('.customer_info_header .header_icon');
        const headerText = document.querySelector('.customer_info_header span');
        
        if (customerType === 'individual') {
            headerIcon.className = 'bi bi-person-fill header_icon';
            headerText.textContent = '고객 정보 입력';
        } else {
            headerIcon.className = 'bi bi-building header_icon';
            headerText.textContent = '기업 정보 입력';
        }
    }
    
    // 심사 수행
    function performAssessment() {
        // 로딩 상태 표시
        btnAssess.disabled = true;
        btnAssess.innerHTML = '<i class="bi bi-hourglass-split"></i><span>심사 중...</span>';
        
        // 임시 데이터로 시뮬레이션 (2초 후 결과 표시)
        setTimeout(() => {
            const assessmentData = generateMockAssessmentData();
            displayAssessmentResults(assessmentData);
            
            // 심사 결과 영역 표시
            assessmentResults.style.display = 'flex';
            
            // 버튼 상태 복원
            btnAssess.disabled = false;
            btnAssess.innerHTML = '<i class="bi bi-clipboard-check"></i><span>여신 심사 요청</span>';
        }, 2000);
    }
    
    // 임시 심사 데이터 생성
    function generateMockAssessmentData() {
        const isApproved = Math.random() > 0.3; // 70% 승인률
        const creditScore = Math.floor(Math.random() * 200) + 700; // 700-900점
        const creditRating = creditScore >= 850 ? 'A' : creditScore >= 800 ? 'B' : creditScore >= 750 ? 'C' : 'D';
        
        return {
            customerType: currentCustomerType,
            creditScore: creditScore,
            creditRating: creditRating,
            approvalStatus: isApproved ? 'approved' : 'rejected',
            approvalStatusText: isApproved ? '승인' : '거절',
            recommendedLimit: isApproved ? Math.floor(Math.random() * 5000) + 1000 : 0,
            riskFactors: {
                creditworthiness: Math.floor(Math.random() * 40) + 60,
                incomeStability: Math.floor(Math.random() * 30) + 70,
                repaymentAbility: Math.floor(Math.random() * 35) + 65,
                collateralValue: Math.floor(Math.random() * 25) + 75,
                marketEnvironment: Math.floor(Math.random() * 20) + 80
            },
            financialIndicators: {
                debtRatio: Math.floor(Math.random() * 30) + 20,
                incomeStability: Math.floor(Math.random() * 20) + 80,
                repaymentAbility: Math.floor(Math.random() * 25) + 75,
                creditHistory: Math.floor(Math.random() * 15) + 85
            },
            riskMatrix: [
                { type: '신용위험', level: 'low', class: 'low' },
                { type: '시장위험', level: 'medium', class: 'medium' },
                { type: '유동성위험', level: 'high', class: 'high' },
                { type: '운영위험', level: 'low', class: 'low' },
                { type: '법률위험', level: 'medium', class: 'medium' },
                { type: '평판위험', level: 'low', class: 'low' }
            ],
            overallRisk: creditRating,
            recommendation: isApproved ? '승인 권장' : '추가 서류 검토 필요'
        };
    }
    
    // 심사 결과 표시
    function displayAssessmentResults(data) {
        const resultsHtml = `
            <div class="assessment_summary">
                <div class="summary_card">
                    <div class="summary_label">신용점수</div>
                    <div class="summary_value credit_score">${data.creditScore}</div>
                </div>
                <div class="summary_card">
                    <div class="summary_label">신용등급</div>
                    <div class="summary_value credit_rating">${data.creditRating}</div>
                </div>
                <div class="summary_card">
                    <div class="summary_label">승인여부</div>
                    <div class="summary_value approval_status ${data.approvalStatus}">${data.approvalStatusText}</div>
                </div>
                <div class="summary_card">
                    <div class="summary_label">추천한도</div>
                    <div class="summary_value">${data.recommendedLimit.toLocaleString()}만원</div>
                </div>
            </div>
            
            <div class="assessment_details">
                <div class="detail_section">
                    <div class="section_title">재무 안정성 지표</div>
                    <div class="detail_grid">
                        <div class="detail_item">
                            <span class="detail_label">부채비율</span>
                            <span class="detail_value">${data.financialIndicators.debtRatio}%</span>
                        </div>
                        <div class="detail_item">
                            <span class="detail_label">소득 안정성</span>
                            <span class="detail_value">${data.financialIndicators.incomeStability}%</span>
                        </div>
                        <div class="detail_item">
                            <span class="detail_label">상환능력</span>
                            <span class="detail_value">${data.financialIndicators.repaymentAbility}%</span>
                        </div>
                        <div class="detail_item">
                            <span class="detail_label">신용이력</span>
                            <span class="detail_value">${data.financialIndicators.creditHistory}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail_section">
                    <div class="section_title">리스크 매트릭스</div>
                    <div class="risk_matrix">
                        ${data.riskMatrix.map(risk => `
                            <div class="risk_item ${risk.class}">
                                <div>${risk.level === 'low' ? '낮음' : risk.level === 'medium' ? '중간' : '높음'}</div>
                                <div>${risk.type}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 8px; text-align: center; font-size: 11px; color: #666;">
                        종합 위험도: ${data.overallRisk} | ${data.recommendation}
                    </div>
                </div>
            </div>
            
            <div class="recommendation">
                <div class="recommendation_title">
                    <i class="bi bi-lightbulb"></i>
                    AI 추천사항
                </div>
                <div class="recommendation_text">
                    ${data.approvalStatus === 'approved' 
                        ? `고객의 신용도가 양호하여 대출 승인을 권장합니다. 신용점수 ${data.creditScore}점, 신용등급 ${data.creditRating}등급으로 안정적인 상환 능력을 보여줍니다.`
                        : `고객의 신용도 검토가 필요합니다. 추가 서류 제출 및 면담을 통해 상환 능력을 재평가하시기 바랍니다.`
                    }
                </div>
            </div>
        `;
        
        resultsContent.innerHTML = resultsHtml;
    }
    
    // 폼 초기화
    function resetForm() {
        // 모든 입력 필드 초기화
        inputs.forEach(input => {
            input.value = '';
        });
        
        // 입력 폼 다시 보이기
        firstRow.style.display = 'flex';
        
        // 고객 정보 표시 영역 숨기기
        customerInfoDisplay.style.display = 'none';
        
        // 대출 정보 섹션 숨기기
        secondRow.style.display = 'none';
        
        // 심사 요청 버튼 섹션 숨기기
        thirdRow.style.display = 'none';
        
        // 심사 결과 영역 숨기기
        assessmentResults.style.display = 'none';
        
        // 토글 버튼 초기화 (개인으로)
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-type="individual"]').classList.add('active');
        currentCustomerType = 'individual';
        updateUIForCustomerType('individual');
    }
    
    
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
