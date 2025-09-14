// KB국민은행 직원 업무시스템 - 대시보드 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 카드 클릭 이벤트
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const cardTitle = this.querySelector('h3').textContent;
            
            // 카드별 동작 정의
            switch(cardTitle) {
                case '업무 현황':
                    showAlert('업무 현황 페이지로 이동합니다.');
                    break;
                case '고객 상담':
                    showAlert('고객 상담 페이지로 이동합니다.');
                    break;
                case '문서 관리':
                    showAlert('문서 관리 페이지로 이동합니다.');
                    break;
                default:
                    showAlert(`${cardTitle} 기능을 준비 중입니다.`);
            }
        });
    });
    
    // 환영 메시지 애니메이션
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.opacity = '0';
        welcomeMessage.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            welcomeMessage.style.transition = 'all 0.6s ease';
            welcomeMessage.style.opacity = '1';
            welcomeMessage.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // 카드 애니메이션
    const dashboardCards = document.querySelectorAll('.card');
    dashboardCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
});

// 알림 메시지 표시 함수
function showAlert(message) {
    // 간단한 알림 (나중에 모달이나 토스트로 교체 가능)
    alert(message);
}

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        window.location.href = '/kb_finaIssist/logout/';
    }
}
