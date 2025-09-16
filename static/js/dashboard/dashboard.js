// KB국민은행 직원 업무시스템 - 대시보드 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // KB 업무 지원 챗봇 클릭 이벤트
    const chatbotContainer = document.querySelector('.chatbot_container');
    if (chatbotContainer) {
        chatbotContainer.addEventListener('click', function() {
            window.location.href = '/kb_finaIssist/chatbot/';
        });
    }

    // KB 대시보드 클릭 이벤트
    const creditAssessmentContainer = document.querySelector('.credit_assessment_container');
    if (creditAssessmentContainer) {
        creditAssessmentContainer.addEventListener('click', function() {
            window.location.href = '/kb_finaIssist/credit_assessment/';
        });
    }
});

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        window.location.href = '/kb_finaIssist/logout/';
    }
}
