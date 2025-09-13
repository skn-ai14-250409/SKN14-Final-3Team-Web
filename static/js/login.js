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
    
    // 저장된 사번이 있으면 불러오기
    if (localStorage.getItem('savedEmployeeId')) {
        if (employeeIdInput) {
            employeeIdInput.value = localStorage.getItem('savedEmployeeId');
        }
        if (saveIdCheckbox) {
            saveIdCheckbox.checked = true;
        }
    }
    
    // 저장된 관리자 ID가 있으면 불러오기
    if (localStorage.getItem('savedAdminId')) {
        if (adminIdInput) {
            adminIdInput.value = localStorage.getItem('savedAdminId');
        }
        if (saveAdminIdCheckbox) {
            saveAdminIdCheckbox.checked = true;
        }
    }
    

    // 사번 저장 체크박스 변경 시
    saveIdCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('savedEmployeeId', employeeIdInput.value);
        } else {
            localStorage.removeItem('savedEmployeeId');
        }
    });

    // 사번 입력 시 자동 저장
    employeeIdInput.addEventListener('input', function() {
        if (saveIdCheckbox.checked) {
            localStorage.setItem('savedEmployeeId', this.value);
        }
    });

    // 관리자 ID 저장 체크박스 변경 시
    saveAdminIdCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('savedAdminId', adminIdInput.value);
        } else {
            localStorage.removeItem('savedAdminId');
        }
    });

    // 관리자 ID 입력 시 자동 저장
    adminIdInput.addEventListener('input', function() {
        if (saveAdminIdCheckbox.checked) {
            localStorage.setItem('savedAdminId', this.value);
        }
    });

    // 입력 필드에 입력할 때 에러 스타일과 메시지 제거
    employeeIdInput.addEventListener('input', function() {
        console.log('사번 입력:', this.value); // 디버깅용
        if (this.value.trim() && this.value.length > 0) {
            console.log('사번 에러 제거'); // 디버깅용
            clearFieldError(this);
            // 에러 메시지도 숨기기
            hideLoginError();
        }
    });
    
    // 추가 이벤트 리스너 (keyup, change)
    employeeIdInput.addEventListener('keyup', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearFieldError(this);
            hideLoginError();
        }
    });
    
    employeeIdInput.addEventListener('change', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearFieldError(this);
            hideLoginError();
        }
    });
    
    passwordInput.addEventListener('input', function() {
        // 실제 텍스트 입력이 있을 때만 에러 제거
        if (this.value.trim() && this.value.length > 0) {
            clearFieldError(this);
            // 에러 메시지도 숨기기
            hideLoginError();
        }
    });
    
    // 추가 이벤트 리스너 (keyup, change)
    passwordInput.addEventListener('keyup', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearFieldError(this);
            hideLoginError();
        }
    });
    
    passwordInput.addEventListener('change', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearFieldError(this);
            hideLoginError();
        }
    });

    // 폼 제출 시 클라이언트 사이드 검증
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function(e) {
        // 에러 메시지 숨기기
        hideLoginError();
        
        // 입력 필드 검증 (이미 위에서 선언된 변수 사용)
        
        let hasError = false;
        const employeeIdEmpty = !employeeIdInput.value.trim();
        const passwordEmpty = !passwordInput.value.trim();
        
        // 둘 다 비어있는 경우
        if (employeeIdEmpty && passwordEmpty) {
            showFieldError('사번과 비밀번호를 입력하세요.', employeeIdInput);
            // 두 필드 모두 에러 스타일 적용
            employeeIdInput.classList.add('error');
            passwordInput.classList.add('error');
            
            setTimeout(() => {
                employeeIdInput.classList.remove('error');
                passwordInput.classList.remove('error');
            }, 500);
            
            hasError = true;
        }
        // 사번만 비어있는 경우
        else if (employeeIdEmpty) {
            showFieldError('사번을 입력하세요.', employeeIdInput);
            employeeIdInput.classList.add('error');
            
            setTimeout(() => {
                employeeIdInput.classList.remove('error');
            }, 400);
            
            clearFieldError(passwordInput);
            hasError = true;
        }
        // 비밀번호만 비어있는 경우
        else if (passwordEmpty) {
            showFieldError('비밀번호를 입력하세요.', passwordInput);
            passwordInput.classList.add('error');
            
            setTimeout(() => {
                passwordInput.classList.remove('error');
            }, 400);
            
            clearFieldError(employeeIdInput);
            hasError = true;
        }
        // 둘 다 입력된 경우
        else {
            clearFieldError(employeeIdInput);
            clearFieldError(passwordInput);
        }
        
        // 빈 필드가 있으면 폼 제출 중단 (클라이언트 사이드 검증)
        if (hasError) {
            e.preventDefault();
            return false;
        }
        
        // 모든 필드가 입력되었으면 서버로 전송 (서버에서 실제 로그인 검증)
        showLoading();
    });

    // 관리자 로그인 폼 제출 이벤트
    const adminLoginForm = document.querySelector('#admin form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            // 에러 메시지 숨기기
            hideAdminLoginError();
            
            // 입력 필드 검증
            let hasError = false;
            const adminIdEmpty = !adminIdInput.value.trim();
            const adminPasswordEmpty = !adminPasswordInput.value.trim();
            
            // 둘 다 비어있는 경우
            if (adminIdEmpty && adminPasswordEmpty) {
                showAdminFieldError('관리자 ID와 비밀번호를 입력하세요.', adminIdInput);
                // 두 필드 모두 에러 스타일 적용
                adminIdInput.classList.add('error');
                adminPasswordInput.classList.add('error');
                
                setTimeout(() => {
                    adminIdInput.classList.remove('error');
                    adminPasswordInput.classList.remove('error');
                }, 500);
                
                hasError = true;
            }
            // 관리자 ID만 비어있는 경우
            else if (adminIdEmpty) {
                showAdminFieldError('관리자 ID를 입력하세요.', adminIdInput);
                adminIdInput.classList.add('error');
                
                setTimeout(() => {
                    adminIdInput.classList.remove('error');
                }, 400);
                
                clearAdminFieldError(adminPasswordInput);
                hasError = true;
            }
            // 비밀번호만 비어있는 경우
            else if (adminPasswordEmpty) {
                showAdminFieldError('비밀번호를 입력하세요.', adminPasswordInput);
                adminPasswordInput.classList.add('error');
                
                setTimeout(() => {
                    adminPasswordInput.classList.remove('error');
                }, 400);
                
                clearAdminFieldError(adminIdInput);
                hasError = true;
            }
            // 둘 다 입력된 경우
            else {
                clearAdminFieldError(adminIdInput);
                clearAdminFieldError(adminPasswordInput);
            }
            
            // 빈 필드가 있으면 폼 제출 중단 (클라이언트 사이드 검증)
            if (hasError) {
                e.preventDefault();
                return false;
            }
            
            // 모든 필드가 입력되었으면 서버로 전송 (서버에서 실제 로그인 검증)
            showLoading();
        });
    }

    // 관리자 입력 필드에 입력할 때 에러 스타일과 메시지 제거
    adminIdInput.addEventListener('input', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearAdminFieldError(this);
            hideAdminLoginError();
        }
    });
    
    adminIdInput.addEventListener('keyup', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearAdminFieldError(this);
            hideAdminLoginError();
        }
    });
    
    adminIdInput.addEventListener('change', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearAdminFieldError(this);
            hideAdminLoginError();
        }
    });
    
    adminPasswordInput.addEventListener('input', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearAdminFieldError(this);
            hideAdminLoginError();
        }
    });
    
    adminPasswordInput.addEventListener('keyup', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearAdminFieldError(this);
            hideAdminLoginError();
        }
    });
    
    adminPasswordInput.addEventListener('change', function() {
        if (this.value.trim() && this.value.length > 0) {
            clearAdminFieldError(this);
            hideAdminLoginError();
        }
    });
    
    // 관리자 필드 에러 표시 함수
    function showAdminFieldError(message, inputElement) {
        showAdminLoginError(message);
        inputElement.classList.add('error');
        
        // 애니메이션 후 에러 클래스 제거
        setTimeout(() => {
            inputElement.classList.remove('error');
        }, 400);
    }

    // 관리자 필드 에러 제거 함수
    function clearAdminFieldError(inputElement) {
        inputElement.classList.remove('error');
    }

});

// 전역 함수들 (HTML 템플릿에서 호출 가능)
// 에러 메시지 표시 함수
function showLoginError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'inline-block';
    }
}

// 에러 메시지 숨기기 함수
function hideLoginError() {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// 관리자 로그인 에러 메시지 표시 함수
function showAdminLoginError(message) {
    const errorElement = document.getElementById('adminLoginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'inline-block';
    }
}

// 관리자 로그인 에러 메시지 숨기기 함수
function hideAdminLoginError() {
    const errorElement = document.getElementById('adminLoginError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
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

// 로그인 에러 메시지 표시 함수
function showLoginError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'inline-block';
    }
}

// 로그인 에러 메시지 숨기기 함수
function hideLoginError() {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// 필드 에러 표시 함수
function showFieldError(message, inputElement) {
    // 에러 메시지를 "사번 저장" 옆에 표시
    const errorElement = document.getElementById('loginError');
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

