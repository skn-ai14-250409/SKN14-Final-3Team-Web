document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.querySelector('.chat_input');
    const userMessagesContainer = document.getElementById('user_messages_container');
    const suggestedQuestionsContainer = document.querySelector('.suggested_questions_container');
    
    // 현재 시간을 포맷팅하는 함수
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${ampm} ${displayHours}:${displayMinutes}`;
    }
    
    // 사용자 메시지를 추가하는 함수
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'user_message';
        messageElement.innerHTML = `
            <div class="message_content">
                <div class="message_bubble">${message}</div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>
            <div class="message_avatar">
                <i class="bi bi-person-fill"></i>
            </div>
        `;
        
        // 사용자 메시지를 컨테이너에 추가
        userMessagesContainer.appendChild(messageElement);
        
        // 자주 묻는 질문 섹션을 숨김
        if (suggestedQuestionsContainer) {
            suggestedQuestionsContainer.style.display = 'none';
        }
        
        // 스크롤을 맨 아래로
        const chatMessagesArea = document.querySelector('.chat_messages_area');
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }
    
    // Enter 키로 메시지 전송
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            addUserMessage(this.value.trim());
            this.value = '';
        }
    });
    
    // 자주 묻는 질문 클릭 이벤트
    const suggestedQuestionCards = document.querySelectorAll('.suggested_question_card');
    suggestedQuestionCards.forEach(card => {
        card.addEventListener('click', function() {
            const questionTitle = this.querySelector('.question_title').textContent;
            addUserMessage(questionTitle);
        });
    });
    
    // 음성 버튼 클릭 이벤트 (향후 구현)
    const voiceButton = document.querySelector('.voice_button');
    if (voiceButton) {
        voiceButton.addEventListener('click', function() {
            console.log('음성 입력 기능은 향후 구현 예정입니다.');
        });
    }
    
    // 음성 파형 버튼 클릭 이벤트 (향후 구현)
    const voiceWaveButton = document.querySelector('.voice_wave_button');
    if (voiceWaveButton) {
        voiceWaveButton.addEventListener('click', function() {
            console.log('음성 파형 기능은 향후 구현 예정입니다.');
        });
    }
    
    // 첨부 버튼 클릭 이벤트 (향후 구현)
    const attachButton = document.querySelector('.attach_button');
    if (attachButton) {
        attachButton.addEventListener('click', function() {
            console.log('파일 첨부 기능은 향후 구현 예정입니다.');
        });
    }
});
