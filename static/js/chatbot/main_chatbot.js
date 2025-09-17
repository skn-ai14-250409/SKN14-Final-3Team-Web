document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.querySelector('.chat_input');
    const userMessagesContainer = document.getElementById('user_messages_container');
    const showQuestionsButton = document.querySelector('.show_questions_button');
    const suggestedQuestionsButtonContainer = document.querySelector('.suggested_questions_button_container');
    const suggestedQuestionsCardsContainer = document.querySelector('.suggested_questions_cards_container');
    const suggestedQuestionsContainer = document.querySelector('.suggested_questions_container');
    const closeQuestionsButton = document.querySelector('.close_questions_button');
    
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
    
    // 자주 묻는 질문을 숨기는 함수 (대화창 밑에서 input 위로 이동)
    function hideSuggestedQuestions() {
        if (suggestedQuestionsContainer) {
            suggestedQuestionsContainer.style.display = 'none';
        }
        if (suggestedQuestionsButtonContainer) {
            suggestedQuestionsButtonContainer.style.display = 'flex';
        }
    }
    
    // 자주 묻는 질문을 표시하는 함수 (input 위에 표시)
    function showSuggestedQuestions() {
        if (suggestedQuestionsButtonContainer) {
            suggestedQuestionsButtonContainer.style.display = 'none';
        }
        if (suggestedQuestionsCardsContainer) {
            suggestedQuestionsCardsContainer.style.display = 'block';
        }
    }
    
    // 자주 묻는 질문을 닫는 함수
    function closeSuggestedQuestions() {
        if (suggestedQuestionsCardsContainer) {
            suggestedQuestionsCardsContainer.style.display = 'none';
        }
        if (suggestedQuestionsButtonContainer) {
            suggestedQuestionsButtonContainer.style.display = 'flex';
        }
    }
    
    // AI 응답을 추가하는 함수
    function addAIResponse(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'bot_message';
        messageElement.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble">${message}</div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>
        `;
        
        // AI 메시지를 컨테이너에 추가
        userMessagesContainer.appendChild(messageElement);
        
        // 스크롤을 맨 아래로
        const chatMessagesArea = document.querySelector('.chat_messages_area');
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }
    
    // AI 서버 연결 상태를 확인하는 함수
    async function checkAIServerConnection() {
        try {
            // AI 서버 연결 확인을 위한 간단한 요청
            const response = await fetch('/api/chat/health', {
                method: 'GET',
                timeout: 3000
            });
            return response.ok;
        } catch (error) {
            console.log('AI 서버 연결 실패:', error);
            return false;
        }
    }
    
    // 사용자 메시지를 추가하고 AI 응답을 처리하는 함수
    async function addUserMessage(message) {
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
        hideSuggestedQuestions();
        
        // 스크롤을 맨 아래로
        const chatMessagesArea = document.querySelector('.chat_messages_area');
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
        
        // AI 서버 연결 상태 확인 후 응답 처리
        const isServerConnected = await checkAIServerConnection();
        
        if (!isServerConnected) {
            // 서버가 연결되지 않은 경우 에러 메시지 표시
            setTimeout(() => {
                addAIResponse('AI 추론 서버가 연결 되어 있지 않습니다.');
            }, 500);
        } else {
            // 서버가 연결된 경우 실제 AI 응답 처리 (향후 구현)
            setTimeout(() => {
                addAIResponse('AI 응답이 여기에 표시됩니다. (서버 연결됨)');
            }, 1000);
        }
    }
    
    // Enter 키로 메시지 전송
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            addUserMessage(this.value.trim());
            this.value = '';
        }
    });
    
    // 자주 묻는 질문 카드 클릭 이벤트 (대화창 밑의 카드들)
    const suggestedQuestionCards = suggestedQuestionsContainer ? suggestedQuestionsContainer.querySelectorAll('.suggested_question_card') : [];
    suggestedQuestionCards.forEach(card => {
        card.addEventListener('click', function() {
            const questionTitle = this.querySelector('.question_title').textContent;
            addUserMessage(questionTitle);
        });
    });
    
    // 자주 묻는 질문 카드 클릭 이벤트 (input 위의 카드들)
    const suggestedQuestionCardsBottom = suggestedQuestionsCardsContainer ? suggestedQuestionsCardsContainer.querySelectorAll('.suggested_question_card') : [];
    suggestedQuestionCardsBottom.forEach(card => {
        card.addEventListener('click', function() {
            const questionTitle = this.querySelector('.question_title').textContent;
            addUserMessage(questionTitle);
            // 카드 클릭 후 input 위의 카드들을 숨김
            closeSuggestedQuestions();
        });
    });
    
    // "자주 묻는 질문" 버튼 클릭 이벤트
    if (showQuestionsButton) {
        showQuestionsButton.addEventListener('click', function() {
            showSuggestedQuestions();
        });
    }
    
    // X 버튼 클릭 이벤트
    if (closeQuestionsButton) {
        closeQuestionsButton.addEventListener('click', function() {
            closeSuggestedQuestions();
        });
    }
    
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
