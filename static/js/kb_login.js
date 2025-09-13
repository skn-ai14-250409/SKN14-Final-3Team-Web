// KB국민은행 직원 업무시스템 로그인 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 탭 전환 기능
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭에서 active 클래스 제거
            tabs.forEach(t => t.classList.remove('active'));
            // 클릭된 탭에 active 클래스 추가
            this.classList.add('active');
        });
    });

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
    
    // 여러 번 초기화 (브라우저 자동완성 방지)
    setTimeout(() => {
        if (!localStorage.getItem('savedEmployeeId')) {
            clearAllInputs();
        }
    }, 100);
    
    setTimeout(() => {
        if (!localStorage.getItem('savedEmployeeId')) {
            clearAllInputs();
        }
    }, 200);
    
    setTimeout(() => {
        if (!localStorage.getItem('savedEmployeeId')) {
            clearAllInputs();
        }
    }, 500);
    
    setTimeout(() => {
        if (!localStorage.getItem('savedEmployeeId')) {
            clearAllInputs();
        }
    }, 1000);
    
    // 추가로 여러 번 초기화
    setTimeout(() => clearAllInputs(), 200);
    setTimeout(() => clearAllInputs(), 500);

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

    // 폼 제출 시 로딩 상태만 표시 (Django가 유효성 검사 처리)
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function(e) {
        // 로딩 상태 표시
        showLoading();
    });

    // 입력 필드 포커스 효과
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // 엔터키로 로그인
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.click();
            }
        }
    });
});

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
    const passwordInput = document.getElementById('admin_password');
    const toggleIcon = document.getElementById('adminPasswordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'bi bi-eye'; // 비밀번호가 보일 때는 눈 아이콘
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bi bi-eye-slash'; // 비밀번호가 숨겨질 때는 눈에 슬래시 아이콘
    }
}


// 로딩 상태 표시
function showLoading() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>로그인 중...</span>';
    }
}

// 로딩 상태 해제
function hideLoading() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '로그인';
    }
}

// 페이지 로드 애니메이션
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// 보안 수칙 토글
function toggleSecurityRules() {
    const securityList = document.querySelector('.security-list');
    if (securityList) {
        securityList.style.display = securityList.style.display === 'none' ? 'block' : 'none';
    }
}
