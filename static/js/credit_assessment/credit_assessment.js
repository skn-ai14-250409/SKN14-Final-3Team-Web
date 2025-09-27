// KB국민은행 직원 업무시스템 - 여신 심사 JavaScript (FINAL)

console.log('=== credit_assessment.js 로드됨 ===');

document.addEventListener('DOMContentLoaded', function () {
    console.log('=== DOMContentLoaded 이벤트 발생 ===');
    // --- 공통 DOM ---
    const btnAssess = document.getElementById('btn_assess');
    const btnReset = document.getElementById('btn_reset');
    const btnCheckCustomer = document.getElementById('btn_check_customer');
    const customerDisplayContent = document.getElementById('customer_display_content');

    const usageGuideContainer = document.getElementById('usage_guide_container');
    const assessmentResults = document.getElementById('assessment_results');
    const resultsContent = document.getElementById('results_content');

    const form = document.querySelector('.credit_assessment_content');
    const inputs = form ? form.querySelectorAll('input, select') : [];

    const loanPurposeSelect = document.getElementById('loan_purpose');
    const loanProductSelect = document.getElementById('loan_product');

    // (선택) 레이아웃 1,2행이 있으면 연결
    const firstRow = document.querySelector('.first_row') || document.getElementById('first_row');
    const secondRow = document.querySelector('.second_row') || document.getElementById('second_row');
    const thirdRow = document.querySelector('.third_row') || document.getElementById('third_row');
    
    console.log('DOM 요소 확인:', {
        firstRow: !!firstRow,
        secondRow: !!secondRow,
        thirdRow: !!thirdRow,
        thirdRowElement: thirdRow
    });
    
    // thirdRow 요소가 없으면 경고
    if (!thirdRow) {
        console.error('thirdRow 요소를 찾을 수 없습니다!');
        console.log('사용 가능한 .third_row 요소들:', document.querySelectorAll('.third_row'));
        console.log('사용 가능한 #third_row 요소들:', document.querySelectorAll('#third_row'));
    }

    // 조회된 고객 정보를 저장할 전역 변수
    let currentCustomerData = null;

    // ---------- 유틸 ----------
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
            }
        }
        }
        return cookieValue;
    }

    function safeJSONParse(maybeJson, fallback = { data: [], layout: {} }) {
        try {
        if (typeof maybeJson === 'string') return JSON.parse(maybeJson);
        if (typeof maybeJson === 'object' && maybeJson !== null) return maybeJson;
        return fallback;
        } catch {
        return fallback;
        }
    }

    function showError(input, message) {
        input.classList.add('error');
        const errorElement = document.getElementById(input.id + '_error');
        if (errorElement) {
        errorElement.textContent = message;
        } else {
        const newError = document.createElement('span');
        newError.id = input.id + '_error';
        newError.className = 'error-message';
        newError.textContent = message;
        input.parentNode.insertBefore(newError, input.nextSibling);
        }
        setTimeout(() => input.classList.remove('error'), 400);
    }

    function clearAllErrors() {
        const allInputs = document.querySelectorAll('.input_grid input, .input_grid select');
        allInputs.forEach((i) => i.classList.remove('error'));
        const msgs = document.querySelectorAll('.error-message');
        msgs.forEach((m) => (m.textContent = ''));
    }

    function showResultsPage() {
        if (usageGuideContainer) usageGuideContainer.style.display = 'none';
        if (assessmentResults) assessmentResults.style.display = 'flex';
    }

    function hideResultsPage() {
        if (assessmentResults) assessmentResults.style.display = 'none';
        if (usageGuideContainer) usageGuideContainer.style.display = 'flex';
    }

    // ---------- 폼 검증 ----------
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
            showError(loanAmount, '대출 신청 금액을 입력해주세요.');
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
        if (!loanPeriod.value.trim()) {
            showError(loanPeriod, '대출 기간을 입력해주세요.');
            isValid = false;
        }
        
        return isValid;
    }

    // ---------- 고객 확인 ----------
    function displayCustomerInfo(customer) {
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

    function displayCustomerNotFound(message) {
        customerDisplayContent.innerHTML = `
        <div class="customer_not_found">
            <i class="bi bi-person-x"></i>
            <p>${message || '가입하지 않은 고객입니다.'}</p>
        </div>`;
    }

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
        if (!isValid) return;

        btnCheckCustomer.disabled = true;
        btnCheckCustomer.innerHTML = '<i class="bi bi-hourglass-split"></i><span>확인 중...</span>';

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
            console.log('고객 정보 확인 성공 - third_row 표시 시작');
            
            // 헤더 스위칭
            const customerInfoHeader = document.querySelector('.customer_info_header');
            const customerDisplayHeader = document.querySelector('.customer_display_header');
            if (customerDisplayHeader) {
                const headerTitle = customerDisplayHeader.querySelector('.header_title');
                if (headerTitle) headerTitle.textContent = '개인 고객 정보';
            }
            if (customerInfoHeader) customerInfoHeader.style.display = 'none';
            if (customerDisplayHeader) customerDisplayHeader.style.display = 'flex';

            displayCustomerInfo(data.customer);
            currentCustomerData = data.customer;

            // 좌측 입력영역 토글
            const inputGrid = document.querySelector('.input_grid');
            const bankerNotes = document.querySelector('.banker_notes');
            const customerCheckActions = document.querySelector('.customer_check_actions');
            if (inputGrid) inputGrid.style.display = 'none';
            if (bankerNotes) bankerNotes.style.display = 'none';
            if (customerCheckActions) customerCheckActions.style.display = 'none';

            if (customerDisplayContent) customerDisplayContent.style.display = 'block';
            if (secondRow) secondRow.style.display = 'flex';
            
            console.log('=== third_row 디버깅 시작 ===');
            console.log('thirdRow 요소 확인:', thirdRow);
            
            if (thirdRow) {
                console.log('thirdRow 요소 발견 - 상세 정보:');
                console.log('- 요소 ID:', thirdRow.id);
                console.log('- 클래스명:', thirdRow.className);
                console.log('- 부모 요소:', thirdRow.parentNode);
                console.log('- 현재 display:', thirdRow.style.display);
                console.log('- 현재 visibility:', thirdRow.style.visibility);
                console.log('- 현재 opacity:', thirdRow.style.opacity);
                console.log('- computed display:', window.getComputedStyle(thirdRow).display);
                console.log('- computed visibility:', window.getComputedStyle(thirdRow).visibility);
                console.log('- computed opacity:', window.getComputedStyle(thirdRow).opacity);
                console.log('- 요소 위치:', thirdRow.getBoundingClientRect());
                
                // 강제로 표시
                thirdRow.style.display = 'flex';
                thirdRow.style.visibility = 'visible';
                thirdRow.style.opacity = '1';
                thirdRow.style.height = 'auto';
                thirdRow.style.overflow = 'visible';
                
                console.log('third_row 표시 설정 완료');
                console.log('설정 후 스타일:', {
                    display: thirdRow.style.display,
                    visibility: thirdRow.style.visibility,
                    opacity: thirdRow.style.opacity,
                    height: thirdRow.style.height,
                    overflow: thirdRow.style.overflow
                });
                
                // 설정 후 computed 스타일 확인
                setTimeout(() => {
                    console.log('설정 후 computed 스타일:', {
                        display: window.getComputedStyle(thirdRow).display,
                        visibility: window.getComputedStyle(thirdRow).visibility,
                        opacity: window.getComputedStyle(thirdRow).opacity,
                        height: window.getComputedStyle(thirdRow).height,
                        overflow: window.getComputedStyle(thirdRow).overflow
                    });
                    console.log('설정 후 요소 위치:', thirdRow.getBoundingClientRect());
                    console.log('요소가 화면에 보이는가?', thirdRow.offsetParent !== null);
                }, 100);
                
                // DOM에 강제로 추가 (혹시 DOM에서 제거되었을 경우)
                if (!thirdRow.parentNode) {
                    console.log('⚠️ thirdRow가 DOM에서 제거됨 - 다시 추가 시도');
                    const secondColumn = document.querySelector('.second_column');
                    if (secondColumn) {
                        secondColumn.appendChild(thirdRow);
                        console.log('thirdRow를 .second_column에 다시 추가함');
                    } else {
                        console.log('❌ .second_column 요소를 찾을 수 없음');
                    }
                } else {
                    console.log('✅ thirdRow가 DOM에 정상적으로 존재함');
                }
                
                // CSS 규칙 확인
                const cssRules = [];
                for (let i = 0; i < document.styleSheets.length; i++) {
                    try {
                        const sheet = document.styleSheets[i];
                        if (sheet.cssRules) {
                            for (let j = 0; j < sheet.cssRules.length; j++) {
                                const rule = sheet.cssRules[j];
                                if (rule.selectorText && rule.selectorText.includes('third_row')) {
                                    cssRules.push({
                                        selector: rule.selectorText,
                                        style: rule.style.cssText
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        console.log('CSS 규칙 접근 오류:', e);
                    }
                }
                console.log('third_row 관련 CSS 규칙:', cssRules);
                
            } else {
                console.log('❌ thirdRow 요소를 찾을 수 없음');
                console.log('사용 가능한 .third_row 요소들:', document.querySelectorAll('.third_row'));
                console.log('사용 가능한 #third_row 요소들:', document.querySelectorAll('#third_row'));
                console.log('전체 DOM에서 third_row 검색:', document.querySelectorAll('[class*="third"]'));
            }
            console.log('=== third_row 디버깅 끝 ===');
            } else {
            console.log('고객 정보 확인 실패:', data.message);
            displayCustomerNotFound(data.message || '일치하는 고객 정보가 없습니다.');
            if (customerDisplayContent) customerDisplayContent.style.display = 'block';
            }
        })
        .catch((error) => {
            console.error('고객 정보 조회 중 오류 발생:', error);
            displayCustomerNotFound('고객 정보 조회 중 오류가 발생했습니다. 관리자에게 문의하세요.');
            if (customerDisplayContent) customerDisplayContent.style.display = 'block';
        })
        .finally(() => {
            btnCheckCustomer.disabled = false;
            btnCheckCustomer.innerHTML = '<i class="bi bi-search"></i><span>고객 정보 확인</span>';
        });
    }

    // ---------- 대출 상품 ----------
    function updateLoanProducts() {
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
            { id: '5', name: 'KB창업자금대출', interest_rate: 4.8, min_amount: 5000000, max_amount: 50000000 },
            { id: '6', name: 'KB운영자금대출', interest_rate: 6.2, min_amount: 3000000, max_amount: 30000000 },
            ],
            education: [
            { id: '7', name: 'KB교육비대출', interest_rate: 4.5, min_amount: 1000000, max_amount: 50000000 },
            { id: '8', name: 'KB유학자금대출', interest_rate: 5.8, min_amount: 5000000, max_amount: 100000000 },
            ],
            medical: [
            { id: '9', name: 'KB의료비대출', interest_rate: 6.5, min_amount: 1000000, max_amount: 30000000 },
            { id: '10', name: 'KB건강보험대출', interest_rate: 5.2, min_amount: 500000, max_amount: 10000000 },
            ],
            living: [
            { id: '11', name: 'KB생활비대출', interest_rate: 7.2, min_amount: 500000, max_amount: 20000000 },
            { id: '12', name: 'KB신용대출', interest_rate: 8.5, min_amount: 1000000, max_amount: 50000000 },
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

    // ---------- ML 심사 ----------
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

    function performAssessment() {
        btnAssess.disabled = true;
        btnAssess.innerHTML = '<i class="bi bi-hourglass-split"></i><span>심사 중...</span>';

        // 심사 요청 시 즉시 결과 화면으로 전환하여 사용자 경험 개선
        showResultsPage();
        callMLAssessmentAPI();
    }

    function callMLAssessmentAPI() {
        const requestData = {
        customer_data: currentCustomerData,
        loan_data: getLoanData(),
        };

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
            if (data.success) {
            // 2) 시각화/텍스트 렌더는 방어적으로 수행
            try {
                const safe = (obj, key, fallback) => (obj && obj[key] != null ? obj[key] : fallback);
                const r = data.assessment_result || {};
                
                // credit_rating 값이 항상 문자열이 되도록 보장
                let creditRating = safe(r, 'credit_rating', '-');
                if (typeof creditRating !== 'string') creditRating = '-';

                displayMLAssessmentResults({
                credit_score: safe(r, 'credit_score', 0),
                credit_rating: creditRating,
                approval_status: safe(r, 'approval_status', 'rejected'),
                recommended_limit: safe(r, 'recommended_limit', 0),
                credit_score_chart: safe(r, 'credit_score_chart', '{"data":[],"layout":{}}'),
                progress_chart: safe(r, 'progress_chart', '{"data":[],"layout":{}}'),
                risk_analysis_chart: safe(r, 'risk_analysis_chart', '{"data":[],"layout":{}}'),
                financial_indicators: safe(r, 'financial_indicators', {}),
                risk_matrix: safe(r, 'risk_matrix', []),
                ai_report: safe(r, 'ai_report', {
                    summary_title: '결과 요약',
                    summary_description: '데이터가 충분하지 않아 기본 설명을 표시합니다.',
                    analysis_details: [],
                    recommendations: [],
                    warnings: [],
                }),
                });
            } catch (e) {
                console.error('결과 렌더링 중 오류:', e);
                const desc = document.getElementById('ai_summary_description');
                if (desc) {
                desc.innerHTML = '시각화 렌더링에 실패했지만 결과 페이지는 표시되었습니다. 로그를 확인해 주세요.';
                }
            }
            } else {
            console.error('ML API 처리 실패:', data.message);
            alert('심사 중 오류가 발생했습니다: ' + data.message);
            hideResultsPage();
            }
        })
        .catch((err) => {
            console.error('API 호출 오류:', err);
            alert('심사 API 호출 중 오류가 발생했습니다.');
            hideResultsPage();
        })
        .finally(() => {
            btnAssess.disabled = false;
            btnAssess.innerHTML = '<i class="bi bi-clipboard-check"></i><span>여신 심사 요청</span>';
        });
    }

    function displayMLAssessmentResults(data) {
        updateBasicInfo(data);
        renderCreditScoreChart(data.credit_score_chart);
        renderProgressChart(data.progress_chart);
        renderRiskAnalysisChart(data.risk_analysis_chart);
        updateFinancialIndicators(data.financial_indicators || {});
        updateRiskMatrix(data.risk_matrix || []);
        updateAiReport(data.ai_report || {}, data.approval_status);
    }

    function updateBasicInfo(data) {
        const creditScoreElement = resultsContent.querySelector('.credit_score');
        const creditRatingElement = resultsContent.querySelector('.credit_rating');
        const approvalStatusElement = resultsContent.querySelector('.approval_status');
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

    function renderRiskAnalysisChart(chartData) {
        const chartContainer = document.getElementById('risk_analysis_chart_container');
        if (chartContainer && window.Plotly) {
        const cfg = safeJSONParse(chartData);
    Plotly.newPlot(chartContainer, cfg, {}, {
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

    function updateFinancialIndicators(indicators) {
        const detailItems = resultsContent.querySelectorAll('.detail_section .detail_item');
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
        const riskItems = resultsContent.querySelectorAll('.risk_item');
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

    function resetForm() {
        inputs.forEach((input) => (input.value = ''));
        currentCustomerData = null;

        if (firstRow) firstRow.style.display = 'flex';

        const customerInfoHeader = document.querySelector('.customer_info_header');
        const customerDisplayHeader = document.querySelector('.customer_display_header');
        if (customerInfoHeader) customerInfoHeader.style.display = 'flex';
        if (customerDisplayHeader) customerDisplayHeader.style.display = 'none';

        const inputGrid = document.querySelector('.input_grid');
        const bankerNotes = document.querySelector('.banker_notes');
        const customerCheckActions = document.querySelector('.customer_check_actions');
        if (inputGrid) inputGrid.style.display = 'flex';
        if (bankerNotes) bankerNotes.style.display = 'block';
        if (customerCheckActions) customerCheckActions.style.display = 'block';

        if (customerDisplayContent) customerDisplayContent.style.display = 'none';
        if (secondRow) secondRow.style.display = 'none';
        if (thirdRow) {
            thirdRow.style.display = 'none';
            console.log('third_row 숨김');
        }

        hideResultsPage();
    }

    // ---------- 입력 포맷 ----------
    const loanAmountInput = document.getElementById('loan_amount');
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function () {
        let value = this.value.replace(/[^0-9,]/g, '');
        const numeric = value.replace(/,/g, '');
        if (numeric && !isNaN(numeric)) this.value = parseInt(numeric, 10).toLocaleString() + '원';
        else if (value === '') this.value = '';
        });
        loanAmountInput.addEventListener('keypress', function (e) {
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) e.preventDefault();
        });
    }

    const phoneInput = document.getElementById('customer_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        if (value.length >= 10) value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        else if (value.length >= 6) value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        else if (value.length >= 3) value = value.replace(/(\d{3})(\d{3})/, '$1-$2');
        this.value = value;
        });
    }

    const rrnInput = document.getElementById('customer_rrn');
    if (rrnInput) {
        rrnInput.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 13) value = value.substring(0, 13);
        if (value.length >= 7) value = value.replace(/(\d{6})(\d{7})/, '$1-$2');
        this.value = value;
        });
    }


    // ---------- 이벤트 바인딩 ----------
    console.log('=== 이벤트 바인딩 시작 ===');
    console.log('btnAssess:', btnAssess);
    console.log('btnReset:', btnReset);
    console.log('btnCheckCustomer:', btnCheckCustomer);
    console.log('loanPurposeSelect:', loanPurposeSelect);
    
    if (btnAssess) {
        btnAssess.addEventListener('click', () => validateForm() && performAssessment());
        console.log('✅ btnAssess 이벤트 리스너 추가됨');
    } else {
        console.log('❌ btnAssess 요소를 찾을 수 없음');
    }
    
    if (btnReset) {
        btnReset.addEventListener('click', resetForm);
        console.log('✅ btnReset 이벤트 리스너 추가됨');
    } else {
        console.log('❌ btnReset 요소를 찾을 수 없음');
    }
    
    if (btnCheckCustomer) {
        btnCheckCustomer.addEventListener('click', checkCustomerInfo);
        console.log('✅ btnCheckCustomer 이벤트 리스너 추가됨');
    } else {
        console.log('❌ btnCheckCustomer 요소를 찾을 수 없음');
    }
    
    if (loanPurposeSelect) {
        loanPurposeSelect.addEventListener('change', updateLoanProducts);
        console.log('✅ loanPurposeSelect 이벤트 리스너 추가됨');
    } else {
        console.log('❌ loanPurposeSelect 요소를 찾을 수 없음');
    }
    
    console.log('=== 이벤트 바인딩 완료 ===');
    });
