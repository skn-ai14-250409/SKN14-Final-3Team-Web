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
    const employeeIdInput = document.querySelector('input[name="employee_id"]');
    
    // 페이지 로드 시 저장된 사번 불러오기
    if (localStorage.getItem('savedEmployeeId')) {
        employeeIdInput.value = localStorage.getItem('savedEmployeeId');
        saveIdCheckbox.checked = true;
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

    // 폼 제출 시 유효성 검사
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function(e) {
        const employeeId = employeeIdInput.value.trim();
        const password = document.querySelector('input[name="password"]').value;

        if (!employeeId) {
            e.preventDefault();
            showAlert('사번을 입력해주세요.', 'error');
            employeeIdInput.focus();
            return;
        }

        if (!password) {
            e.preventDefault();
            showAlert('비밀번호를 입력해주세요.', 'error');
            document.querySelector('input[name="password"]').focus();
            return;
        }

        // 사번 형식 검사 (KB + 숫자)
        const employeeIdPattern = /^KB\d{7}$/;
        if (!employeeIdPattern.test(employeeId)) {
            e.preventDefault();
            showAlert('사번 형식이 올바르지 않습니다. (예: KB2024001)', 'error');
            employeeIdInput.focus();
            return;
        }
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
        toggleIcon.className = 'bi bi-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bi bi-eye';
    }
}

// 관리자 비밀번호 표시/숨김 토글
function toggleAdminPassword() {
    const passwordInput = document.getElementById('admin_password');
    const toggleIcon = document.getElementById('adminPasswordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'bi bi-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bi bi-eye';
    }
}

// 알림 메시지 표시 함수
function showAlert(message, type = 'info') {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert-temp');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 새 알림 생성
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-temp`;
    alert.textContent = message;
    
    // 메시지 컨테이너에 추가
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
        messagesContainer.appendChild(alert);
    } else {
        // 메시지 컨테이너가 없으면 폼 앞에 추가
        const form = document.querySelector('.login-form');
        if (form) {
            form.parentNode.insertBefore(alert, form);
        }
    }

    // 3초 후 자동 제거
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
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
