// KB국민은행 직원 업무시스템 로그인 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 에러 메시지 초기화하지 않음
    // (Django에서 전달한 에러 메시지를 유지)

    // 사번 저장 기능
    const saveIdCheckbox = document.querySelector('input[name="save_id"]');
    const saveAdminIdCheckbox = document.querySelector('input[name="save_admin_id"]');
    const employeeIdInput = document.querySelector('input[name="employee_id"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const adminIdInput = document.querySelector('input[name="admin_id"]');
    const adminPasswordInput = document.querySelector('input[name="admin_password"]');
    
    // 페이지 로드 시 모든 입력 필드 초기화
    function clearAllInputs() {
        if (employeeIdInput) {
            employeeIdInput.value = '';
        }
        if (passwordInput) {
            passwordInput.value = '';
        }
        if (adminIdInput) {
            adminIdInput.value = '';
        }
        if (adminPasswordInput) {
            adminPasswordInput.value = '';
        }
        if (saveIdCheckbox) {
            saveIdCheckbox.checked = false;
        }
        if (saveAdminIdCheckbox) {
            saveAdminIdCheckbox.checked = false;
        }
    }
    
    // 즉시 초기화
    clearAllInputs();
    
    // 공통 ID 저장/불러오기 함수
    function setupIdStorage(inputElement, checkboxElement, storageKey) {
        // 저장된 ID가 있으면 불러오기
        if (localStorage.getItem(storageKey)) {
            if (inputElement) {
                inputElement.value = localStorage.getItem(storageKey);
            }
            if (checkboxElement) {
                checkboxElement.checked = true;
            }
        }
        
        // 체크박스 변경 시
        checkboxElement.addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem(storageKey, inputElement.value);
            } else {
                localStorage.removeItem(storageKey);
            }
        });

        // 입력 시 자동 저장
        inputElement.addEventListener('input', function() {
            if (checkboxElement.checked) {
                localStorage.setItem(storageKey, this.value);
            }
        });
    }

    // 사번, 관리자 ID 저장 설정
    setupIdStorage(employeeIdInput, saveIdCheckbox, 'savedEmployeeId');
    setupIdStorage(adminIdInput, saveAdminIdCheckbox, 'savedAdminId');

    // 공통 입력 필드 에러 제거 함수
    function setupInputErrorClear(inputElement, hideErrorFunction) {
        inputElement.addEventListener('input', function() {
            if (this.value.trim() && this.value.length > 0) {
                clearFieldError(this);
                hideErrorFunction();
            }
        });
    }

    // 직원 로그인 입력 필드 에러 제거 설정
    // login 페이지 처음에 들어갔을때 에러 메시지 숨기기
    setupInputErrorClear(employeeIdInput, hideLoginError);
    setupInputErrorClear(passwordInput, hideLoginError);

    // 공통 로그인 검증 함수
    function validateLoginForm(idInput, passwordInput, errorMessages, errorElementId) {
        const idEmpty = !idInput.value.trim();
        const passwordEmpty = !passwordInput.value.trim();
        let hasError = false;
        
        // 에러 메시지 숨기기
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // 둘 다 비어있는 경우
        if (idEmpty && passwordEmpty) {
            showFieldError(errorMessages.both, idInput, errorElementId);
            idInput.classList.add('error');
            passwordInput.classList.add('error');
            
            setTimeout(() => {
                idInput.classList.remove('error');
                passwordInput.classList.remove('error');
            }, 500);
            
            hasError = true;
        }
        // ID만 비어있는 경우
        else if (idEmpty) {
            showFieldError(errorMessages.id, idInput, errorElementId);
            idInput.classList.add('error');
            
            setTimeout(() => {
                idInput.classList.remove('error');
            }, 500);
            
            clearFieldError(passwordInput);
            hasError = true;
        }
        // 비밀번호만 비어있는 경우
        else if (passwordEmpty) {
            showFieldError(errorMessages.password, passwordInput, errorElementId);
            passwordInput.classList.add('error');
            
            setTimeout(() => {
                passwordInput.classList.remove('error');
            }, 500);
            
            clearFieldError(idInput);
            hasError = true;
        }
        // 둘 다 입력된 경우
        else {
            clearFieldError(idInput);
            clearFieldError(passwordInput);
        }
        
        return hasError;
    }

    // 직원 로그인 폼 제출 이벤트
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const hasError = validateLoginForm(
                employeeIdInput, 
                passwordInput, 
                {
                    both: '사번과 비밀번호를 입력하세요.',
                    id: '사번을 입력하세요.',
                    password: '비밀번호를 입력하세요.'
                },
                'loginError'
            );
            
            if (hasError) {
                e.preventDefault();
                return false;
            }
            
            showLoading();
        });
    }

    // 관리자 로그인 폼 제출 이벤트
    const adminLoginForm = document.querySelector('#admin form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            const hasError = validateLoginForm(
                adminIdInput, 
                adminPasswordInput, 
                {
                    both: '관리자 ID와 비밀번호를 입력하세요.',
                    id: '관리자 ID를 입력하세요.',
                    password: '비밀번호를 입력하세요.'
                },
                'adminLoginError'
            );
            
            if (hasError) {
                e.preventDefault();
                return false;
            }
            
            showLoading();
        });
    }

    // 관리자 로그인 입력 필드 에러 제거 설정
    setupInputErrorClear(adminIdInput, hideAdminLoginError);
    setupInputErrorClear(adminPasswordInput, hideAdminLoginError);

});

// 전역 함수들 (HTML 템플릿에서 호출 가능)
// 공통 에러 메시지 표시/숨기기 함수
function createErrorHandler(errorElementId) {
    return {
        show: function(message) {
            const errorElement = document.getElementById(errorElementId);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'inline-block';
            }
        },
        hide: function() {
            const errorElement = document.getElementById(errorElementId);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    };
}

// 에러 핸들러 생성
const loginErrorHandler = createErrorHandler('loginError');
const adminLoginErrorHandler = createErrorHandler('adminLoginError');

// 기존 함수명 유지 (HTML 템플릿 호환성)
function showLoginError(message) {
    loginErrorHandler.show(message);
}

function hideLoginError() {
    loginErrorHandler.hide();
}

function showAdminLoginError(message) {
    adminLoginErrorHandler.show(message);
}

function hideAdminLoginError() {
    adminLoginErrorHandler.hide();
}

// 비밀번호 표시/숨김 토글
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'bi bi-eye'; // 비밀번호가 보일 때는 눈 아이콘
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bi bi-eye-slash'; // 비밀번호가 숨겨질 때는 눈에 슬래시 아이콘
    }
}

// 관리자 비밀번호 표시/숨김 토글
function toggleAdminPassword() {
    const adminPasswordInput = document.getElementById('admin_password');
    const toggleIcon = document.getElementById('adminPasswordToggleIcon');
    
    if (adminPasswordInput.type === 'password') {
        adminPasswordInput.type = 'text';
        toggleIcon.className = 'bi bi-eye'; // 비밀번호가 보일 때는 눈 아이콘
    } else {
        adminPasswordInput.type = 'password';
        toggleIcon.className = 'bi bi-eye-slash'; // 비밀번호가 숨겨질 때는 눈에 슬래시 아이콘
    }
}


// 로딩 상태 표시
function showLoading() {
    const loginBtn = document.querySelector('button[type="submit"]');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>로그인 중...</span>';
    }
}

// 필드 에러 표시 함수
function showFieldError(message, inputElement, errorElementId = 'loginError') {
    // 에러 메시지를 해당 요소에 표시
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'inline-block';
    }
    
    // CSS 클래스로 에러 스타일 적용
    inputElement.classList.add('error');
    
    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
        inputElement.classList.remove('error');
    }, 400);
}

// 필드 에러 제거 함수
function clearFieldError(inputElement) {
    inputElement.classList.remove('error');
}

