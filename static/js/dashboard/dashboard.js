// KB국민은행 직원 업무시스템 - 대시보드 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // team_channel_column 클릭 이벤트 (사이드바 확장/축소)
    const teamChannelColumn = document.querySelector('.team_channel_column');
    const channelNames = document.querySelectorAll('.channel_name');
    const memberNames = document.querySelectorAll('.member_name');
    const memberDepts = document.querySelectorAll('.member_dept');
    
    // KB 업무 지원 챗봇 클릭 이벤트
    const chatbotContainer = document.querySelector('.chatbot_container');
    chatbotContainer.addEventListener('click', function() {
        window.location.href = '/kb_finaIssist/chatbot/';
    });

    // KB 대시보드 클릭 이벤트
    const creditAssessmentContainer = document.querySelector('.credit_assessment_container');
    creditAssessmentContainer.addEventListener('click', function() {
        window.location.href = '/kb_finaIssist/credit_assessment/';
    });

    // 초기 상태: 줄어든 상태로 시작 (CSS에서 처리)

    if (teamChannelColumn) {
        teamChannelColumn.addEventListener('click', function() {
            // 현재 확장 상태 확인
            const isExpanded = teamChannelColumn.classList.contains('expanded');
            
            if (isExpanded) {
                // 축소: CSS에서 자동으로 텍스트 숨김
                teamChannelColumn.classList.remove('expanded');
            } else {
                // 확장: CSS에서 자동으로 텍스트 표시
                teamChannelColumn.classList.add('expanded');
            }
        });
    }
});

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        window.location.href = '/kb_finaIssist/logout/';
    }
}
