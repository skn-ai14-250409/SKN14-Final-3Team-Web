// KB국민은행 직원 업무시스템 - 여신 심사 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소들
    const btnAssess = document.getElementById('btn_assess');
    const btnReset = document.getElementById('btn_reset');
    const btnCheckCustomer = document.getElementById('btn_check_customer');
    const customerDisplayContent = document.getElementById('customer_display_content');
    const firstRow = document.querySelector('.first_row');
    const secondRow = document.getElementById('second_row');
    const usageGuideContainer = document.getElementById('usage_guide_container');
    const thirdRow = document.getElementById('third_row');
    const assessmentResults = document.getElementById('assessment_results');
    const resultsContent = document.getElementById('results_content');
    
    // 조회된 고객 정보를 저장할 전역 변수
    let currentCustomerData = null;

    // 기본 차트 초기화
    initializeDefaultChart();
    
    // 기본 차트 초기화 함수
    function initializeDefaultChart() {
        // Plotly 로드 대기
        function waitForPlotly() {
            if (window.Plotly) {
                createDefaultChart();
            } else {
                setTimeout(waitForPlotly, 100);
            }
        }
        
        function createDefaultChart() {
            // 고급 신용점수 차트 (850점)
            const defaultCreditChart = {
                data: [{
                    values: [85, 15],
                    type: 'pie',
                    hole: 0.65,
                    marker: {
                        colors: [
                            'rgba(16, 185, 129, 0.9)',  // 메인 색상
                            'rgba(243, 244, 246, 0.3)'  // 배경 색상
                        ],
                        line: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            width: 3
                        }
                    },
                    textinfo: 'none',
                    hoverinfo: 'none',
                    showlegend: false,
                    rotation: 90,
                    direction: 'clockwise'
                }],
                layout: {
                    width: 140,
                    height: 140,
                    margin: { l: 0, r: 0, t: 0, b: 0 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    annotations: [
                        {
                            text: '850',
                            x: 0.5,
                            y: 0.55,
                            font: { 
                                size: 20, 
                                color: '#1f2937', 
                                family: 'Arial, sans-serif',
                                weight: 'bold'
                            },
                            showarrow: false
                        },
                        {
                            text: '점',
                            x: 0.5,
                            y: 0.4,
                            font: { 
                                size: 12, 
                                color: '#6b7280', 
                                family: 'Arial, sans-serif'
                            },
                            showarrow: false
                        }
                    ]
                },
                config: {
                    displayModeBar: false,
                    staticPlot: false
                }
            };
            
            const chartContainer = document.getElementById('credit_score_chart_container');
            if (chartContainer) {
                try {
                    Plotly.newPlot('credit_score_chart_container', defaultCreditChart.data, defaultCreditChart.layout, {
                        responsive: true,
                        displayModeBar: false
                    });
                    console.log('기본 차트 생성 완료');
                } catch (error) {
                    console.error('차트 생성 오류:', error);
                }
            } else {
                console.error('차트 컨테이너를 찾을 수 없습니다');
            }
        }
        
        waitForPlotly();
    }
    
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
        } else if (customerRrn.value.trim().length < 13) {
            showError(customerRrn, '13자리로 입력해주세요.');
            isValid = false;
        }
        
        if (!customerPhone.value.trim()) {
            showError(customerPhone, '연락처를 입력해주세요.');
            isValid = false;
        } else if (customerPhone.value.trim().length < 11) {
            showError(customerPhone, '11자리로 입력해주세요.');
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
        
        // 서버에 고객 정보 조회 요청
        fetch('/kb_finaIssist/credit_assessment/api/check-customer/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                customer_name: customerName,
                customer_rrn: customerRrn,
                customer_phone: customerPhone,
                customer_email: customerEmail
            })
        })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                // JSON이 아닌 응답(HTML 등)을 받았을 때의 처리
                return response.text().then(text => {
                    throw new Error("서버로부터 유효하지 않은 응답을 받았습니다. 응답 내용:\n" + text.substring(0, 200) + "...");
                });
            }
        })
        .then(data => {
            if (data.success) {
                if (data.customer_found) {
                    // 헤더 변경
                    const customerInfoHeader = document.querySelector('.customer_info_header');
                    const customerDisplayHeader = document.querySelector('.customer_display_header');
                    
                    if (customerInfoHeader && customerDisplayHeader) {
                        const headerTitle = customerDisplayHeader.querySelector('.header_title');
                        if (headerTitle) {
                            headerTitle.textContent = currentCustomerType === 'individual' ? '개인 고객 정보' : '기업 고객 정보';
                        }
                        customerInfoHeader.style.display = 'none';
                        customerDisplayHeader.style.display = 'flex';
                    }

                    // 고객 정보 표시
                    displayCustomerInfo(data.customer);

                    // 전역 변수에 고객 정보 저장
                    currentCustomerData = data.customer;

                    // UI 요소 숨기기/보이기
                    const inputGrid = document.querySelector('.input_grid');
                    const bankerNotes = document.querySelector('.banker_notes');
                    const customerCheckActions = document.querySelector('.customer_check_actions');
                    const customerTypeToggle = document.querySelector('.customer_type_toggle');

                    if (inputGrid) inputGrid.style.display = 'none';
                    if (bankerNotes) bankerNotes.style.display = 'none';
                    if (customerCheckActions) customerCheckActions.style.display = 'none';
                    if (customerTypeToggle) customerTypeToggle.style.display = 'none';

                    const secondRow = document.querySelector('.second_row');
                    const thirdRow = document.querySelector('.third_row');
                    
                    if (customerDisplayContent) customerDisplayContent.style.display = 'block';
                    if (secondRow) secondRow.style.display = 'block';
                    if (thirdRow) thirdRow.style.display = 'block';
                } else {
                    displayCustomerNotFound(data.message || '일치하는 고객 정보가 없습니다.');
                    customerDisplayContent.style.display = 'block';
                }
            } else {
                // 고객 정보 없음 또는 서버 응답 메시지 표시
                displayCustomerNotFound(data.message || '일치하는 고객 정보가 없습니다.');
                customerDisplayContent.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('고객 정보 조회 중 오류 발생:', error);
            // alert 대신 UI에 오류 메시지 표시
            displayCustomerNotFound('고객 정보 조회 중 오류가 발생했습니다. 관리자에게 문의하세요.');
            customerDisplayContent.style.display = 'block';
        })
        .finally(() => {
            // 버튼 상태 복원
            btnCheckCustomer.disabled = false;
            btnCheckCustomer.innerHTML = '<i class="bi bi-search"></i><span>고객 정보 확인</span>';
        });
    }
    
    // 고객 정보 표시
    function displayCustomerInfo(customer) {
        const customerInfoHtml = `
            <div class="customer_info_grid">
                <div class="info_item">
                    <div class="info_label">고객 ID</div>
                    <div class="info_value">${customer.id}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">고객명</div>
                    <div class="info_value">${customer.full_name}</div>
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
                    <div class="info_label">연락처</div>
                    <div class="info_value">${customer.phone}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">이메일</div>
                    <div class="info_value">${customer.email}</div>
                </div>
                <div class="info_item">
                    <div class="info_label">최종 학력</div>
                    <div class="info_value">${customer.education_level}</div>
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
                    <div class="info_label">근속년수</div>
                    <div class="info_value">${customer.years_of_service}년</div>
                </div>
                <div class="info_item">
                    <div class="info_label">주택 상태</div>
                    <div class="info_value">${customer.housing_status}</div>
                </div>
            </div>
        `;
        
        customerDisplayContent.innerHTML = customerInfoHtml;
    }
    
    // 고객 정보 없음 표시
    function displayCustomerNotFound(message) {
        const notFoundHtml = `
            <div class="customer_not_found">
                <i class="bi bi-person-x"></i>
                <p>${message || '가입하지 않은 고객입니다.'}</p>
            </div>
        `;
        
        customerDisplayContent.innerHTML = notFoundHtml;
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
        
        // 실제 ML API 호출
        callMLAssessmentAPI();
    }
    
    // ML API 호출
    function callMLAssessmentAPI() {
        // 전역 변수에 저장된 고객 정보와 화면의 대출 정보를 가져옴
        const customerData = currentCustomerData;
        const loanData = getLoanData();
        
        const requestData = {
            customer_data: customerData,
            loan_data: loanData,
            customer_type: currentCustomerType
        };
        
        fetch('/kb_finaIssist/credit_assessment/api/assess-credit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayMLAssessmentResults(data.assessment_result);
                // 사용법 안내 숨기고 심사 결과 표시
                if (usageGuideContainer) usageGuideContainer.style.display = 'none';
                // 심사 결과 영역 표시
                assessmentResults.style.display = 'flex';
            } else {
                console.error('ML API 오류:', data.message);
                // 오류 시 기본 데이터로 폴백
                const fallbackData = generateMockAssessmentData();
                displayAssessmentResults(fallbackData);
                if (usageGuideContainer) usageGuideContainer.style.display = 'none';
                assessmentResults.style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('API 호출 오류:', error);
            // 오류 시 기본 데이터로 폴백
            const fallbackData = generateMockAssessmentData();
            displayAssessmentResults(fallbackData);
            if (usageGuideContainer) usageGuideContainer.style.display = 'none';
            assessmentResults.style.display = 'flex';
        })
        .finally(() => {
            // 버튼 상태 복원
            btnAssess.disabled = false;
            btnAssess.innerHTML = '<i class="bi bi-clipboard-check"></i><span>여신 심사 요청</span>';
        });
    }
    
    // 대출 데이터 수집
    function getLoanData() {
        const amount = document.getElementById('loan_amount').value.replace(/[^0-9]/g, '');
        const period = document.getElementById('loan_period').value;
        return {
            amount: parseInt(amount) || 0,
            period: parseInt(period) || 12
        };
    }
    
    // ML 결과 표시
    function displayMLAssessmentResults(data) {
        // 기본 정보 업데이트
        updateBasicInfo(data);
        
        // Plotly 차트 렌더링
        renderCreditScoreChart(data.credit_score_chart);
        renderProgressChart(data.progress_chart);
        
        // 재무 지표 업데이트
        updateFinancialIndicators(data.financial_indicators);
        
        // 리스크 매트릭스 업데이트
        updateRiskMatrix(data.risk_matrix);
        
        // AI 추천사항 업데이트
        updateRecommendation(data.recommendation);
    }
    
    // 기본 정보 업데이트
    function updateBasicInfo(data) {
        const creditScoreElement = resultsContent.querySelector('.credit_score');
        const creditRatingElement = resultsContent.querySelector('.credit_rating');
        const approvalStatusElement = resultsContent.querySelector('.approval_status');
        const recommendedLimitElement = resultsContent.querySelector('.summary_value:last-child');
        
        if (creditScoreElement) creditScoreElement.textContent = data.credit_score;
        if (creditRatingElement) creditRatingElement.textContent = data.credit_rating;
        if (approvalStatusElement) {
            approvalStatusElement.textContent = data.approval_status === 'approved' ? '승인 가능' : '불가능';
            approvalStatusElement.className = `summary_value approval_status ${data.approval_status}`;
        }
        if (recommendedLimitElement) {
            recommendedLimitElement.textContent = `${Math.floor(data.recommended_limit / 10000).toLocaleString()}만원`;
        }
    }
    
    // Plotly 신용점수 차트 렌더링
    function renderCreditScoreChart(chartData) {
        const chartContainer = document.getElementById('credit_score_chart_container');
        if (chartContainer && window.Plotly) {
            const chartConfig = JSON.parse(chartData);
            Plotly.newPlot('credit_score_chart_container', chartConfig.data, chartConfig.layout, {
                responsive: true,
                displayModeBar: false
            });
        }
    }
    
    // Plotly 프로그레스 차트 렌더링
    function renderProgressChart(chartData) {
        const chartContainer = document.getElementById('progress_chart_container');
        if (chartContainer && window.Plotly) {
            const chartConfig = JSON.parse(chartData);
            Plotly.newPlot('progress_chart_container', chartConfig.data, chartConfig.layout, {
                responsive: true,
                displayModeBar: false
            });
        }
    }

    // 위험도 분석 레이더 차트 렌더링 (기본값)
    initializeRiskRadar();

    function initializeRiskRadar() {
        const container = document.getElementById('risk_analysis_chart_container');
        if (!container || !window.Plotly) return;

        const categories = ['신용도', '소득안정성', '상환능력', '담보가치', '시장환경'];
        const values = [82, 76, 88, 72, 68];

        const data = [{
            type: 'scatterpolar',
            r: values.concat(values[0]),
            theta: categories.concat(categories[0]),
            fill: 'toself',
            fillcolor: 'rgba(16,185,129,0.25)',
            line: { color: 'rgba(16,185,129,0.8)', width: 2 },
            hoverinfo: 'none'
        }];

        const layout = {
            polar: {
                bgcolor: 'rgba(0,0,0,0)',
                radialaxis: {
                    visible: true,
                    range: [0, 100],
                    gridcolor: 'rgba(0,0,0,0.08)',
                    tickfont: { size: 9, color: '#9CA3AF' }
                },
                angularaxis: {
                    gridcolor: 'rgba(0,0,0,0.08)',
                    tickfont: { size: 10, color: '#6B7280' },
                    layer: 'above traces'
                }
            },
            margin: { l: 40, r: 40, t: 40, b: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            width: 280,
            height: 220
        };

        Plotly.newPlot(container, data, layout, { 
            displayModeBar: false, 
            responsive: true,
            staticPlot: true,
            editable: false,
            selectable: false
        });
    }
    
    // 재무 지표 업데이트
    function updateFinancialIndicators(indicators) {
        const detailItems = resultsContent.querySelectorAll('.detail_item');
        const indicatorKeys = Object.keys(indicators);
        
        indicatorKeys.forEach((key, index) => {
            if (detailItems[index]) {
                const valueElement = detailItems[index].querySelector('.detail_value');
                const progressFill = detailItems[index].querySelector('.progress_fill');
                
                if (valueElement) valueElement.textContent = `${indicators[key]}%`;
                if (progressFill) {
                    progressFill.style.width = `${indicators[key]}%`;
                    // 색상 클래스 업데이트
                    const progressBar = progressFill.parentElement;
                    progressBar.className = 'progress_bar';
                    if (indicators[key] >= 80) {
                        progressBar.classList.add('low_risk');
                    } else if (indicators[key] >= 50) {
                        progressBar.classList.add('medium_risk');
                    } else {
                        progressBar.classList.add('high_risk');
                    }
                }
            }
        });
    }
    
    // 리스크 매트릭스 업데이트
    function updateRiskMatrix(riskMatrix) {
        const riskItems = resultsContent.querySelectorAll('.risk_item');
        riskMatrix.forEach((risk, index) => {
            if (riskItems[index]) {
                riskItems[index].className = `risk_item ${risk.level}`;
                const riskLevel = risk.level === 'low' ? '낮음' : risk.level === 'medium' ? '중간' : '높음';
                riskItems[index].children[0].textContent = riskLevel;
                riskItems[index].children[1].textContent = risk.type;
            }
        });
    }
    
    // AI 추천사항 업데이트
    function updateRecommendation(recommendation) {
        const recommendationText = resultsContent.querySelector('.recommendation_text');
        if (recommendationText) {
            recommendationText.textContent = recommendation;
        }
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
        // HTML의 심사 결과 데이터 업데이트
        const creditScoreElement = resultsContent.querySelector('.credit_score');
        const creditRatingElement = resultsContent.querySelector('.credit_rating');
        const approvalStatusElement = resultsContent.querySelector('.approval_status');
        const recommendedLimitElement = resultsContent.querySelector('.summary_value:last-child');
        
        if (creditScoreElement) creditScoreElement.textContent = data.creditScore;
        if (creditRatingElement) creditRatingElement.textContent = data.creditRating;
        if (approvalStatusElement) {
            approvalStatusElement.textContent = data.approvalStatusText;
            approvalStatusElement.className = `summary_value approval_status ${data.approvalStatus}`;
        }
        if (recommendedLimitElement) recommendedLimitElement.textContent = `${data.recommendedLimit.toLocaleString()}만원`;
        
        // 재무 안정성 지표 업데이트
        const detailItems = resultsContent.querySelectorAll('.detail_item');
        if (detailItems.length >= 4) {
            detailItems[0].querySelector('.detail_value').textContent = `${data.financialIndicators.debtRatio}%`;
            detailItems[1].querySelector('.detail_value').textContent = `${data.financialIndicators.incomeStability}%`;
            detailItems[2].querySelector('.detail_value').textContent = `${data.financialIndicators.repaymentAbility}%`;
            detailItems[3].querySelector('.detail_value').textContent = `${data.financialIndicators.creditHistory}%`;
        }
        
        // 리스크 매트릭스 업데이트
        const riskItems = resultsContent.querySelectorAll('.risk_item');
        data.riskMatrix.forEach((risk, index) => {
            if (riskItems[index]) {
                riskItems[index].className = `risk_item ${risk.class}`;
                const riskLevel = risk.level === 'low' ? '낮음' : risk.level === 'medium' ? '중간' : '높음';
                riskItems[index].children[0].textContent = riskLevel;
                riskItems[index].children[1].textContent = risk.type;
            }
        });
        
        // 종합 위험도 및 추천사항 업데이트
        const riskSummary = resultsContent.querySelector('.risk_matrix').nextElementSibling;
        if (riskSummary) {
            riskSummary.textContent = `종합 위험도: ${data.overallRisk} | ${data.recommendation}`;
        }
        
        // AI 추천사항 업데이트
        const recommendationText = resultsContent.querySelector('.recommendation_text');
        if (recommendationText) {
            recommendationText.textContent = data.approvalStatus === 'approved' 
                ? `고객의 신용도가 양호하여 대출 승인을 권장합니다. 신용점수 ${data.creditScore}점, 신용등급 ${data.creditRating}등급으로 안정적인 상환 능력을 보여줍니다.`
                : `고객의 신용도 검토가 필요합니다. 추가 서류 제출 및 면담을 통해 상환 능력을 재평가하시기 바랍니다.`;
        }
    }
    
    // 폼 초기화
    function resetForm() {
        // 모든 입력 필드 초기화
        inputs.forEach(input => {
            input.value = '';
        });

        // 전역 고객 데이터 초기화
        currentCustomerData = null;
        
        // 입력 폼 다시 보이기
        firstRow.style.display = 'flex';
        
        // 헤더 원래대로 되돌리기
        const customerInfoHeader = document.querySelector('.customer_info_header');
        const customerDisplayHeader = document.querySelector('.customer_display_header');
        
        if (customerInfoHeader) customerInfoHeader.style.display = 'flex';
        if (customerDisplayHeader) customerDisplayHeader.style.display = 'none';
        
        // 숨겨진 요소들 다시 보이기
        const inputGrid = document.querySelector('.input_grid');
        const bankerNotes = document.querySelector('.banker_notes');
        const customerCheckActions = document.querySelector('.customer_check_actions');
        const customerTypeToggle = document.querySelector('.customer_type_toggle');

        if (inputGrid) inputGrid.style.display = 'flex';
        if (bankerNotes) bankerNotes.style.display = 'block';
        if (customerCheckActions) customerCheckActions.style.display = 'block';
        if (customerTypeToggle) customerTypeToggle.style.display = 'block';
        
        // 보여진 요소들 다시 숨기기
        const secondRow = document.querySelector('.second_row');
        const thirdRow = document.querySelector('.third_row');
        
        if (customerDisplayContent) customerDisplayContent.style.display = 'none';
        if (secondRow) secondRow.style.display = 'none';
        if (thirdRow) thirdRow.style.display = 'none';
        
        // 심사 결과 영역 숨기기
        if (usageGuideContainer) usageGuideContainer.style.display = 'flex';
        assessmentResults.style.display = 'none';
        
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-type="individual"]').classList.add('active');
        currentCustomerType = 'individual';
        updateUIForCustomerType('individual');
    }
    
    
    // 숫자 입력 필드 포맷팅 (대출 신청 금액만)
    const loanAmountInput = document.getElementById('loan_amount');
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function() {
            // 숫자와 콤마만 허용
            let value = this.value.replace(/[^0-9,]/g, '');
            
            // 콤마 제거 후 숫자만 추출
            const numericValue = value.replace(/,/g, '');
            
            // 숫자인 경우에만 포맷팅 적용
            if (numericValue && !isNaN(numericValue)) {
                // 천 단위 콤마 추가하고 원 단위 붙이기
                this.value = parseInt(numericValue).toLocaleString() + '원';
            } else if (value === '') {
                this.value = '';
            }
        });
        
        // 숫자가 아닌 문자 입력 방지
        loanAmountInput.addEventListener('keypress', function(e) {
            // 숫자, 백스페이스, 삭제, 탭, 엔터만 허용
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    // 전화번호 자동 포맷팅 및 길이 제한
    const phoneInput = document.getElementById('customer_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            // 11자리 제한
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
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
    
    // 주민번호 자동 포맷팅 및 길이 제한
    const rrnInput = document.getElementById('customer_rrn');
    if (rrnInput) {
        rrnInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            // 13자리 제한
            if (value.length > 13) {
                value = value.substring(0, 13);
            }
            
            if (value.length >= 7) {
                value = value.replace(/(\d{6})(\d{7})/, '$1-$2');
            }
            this.value = value;
        });
    }
});
