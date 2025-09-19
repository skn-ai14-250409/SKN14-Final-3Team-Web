document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.querySelector('.chat_input');
    const userMessagesContainer = document.getElementById('user_messages_container');
    const welcomeMessageContainer = document.getElementById('welcome_message_container');
    const showQuestionsButton = document.querySelector('.show_questions_button');
    const suggestedQuestionsButtonContainer = document.querySelector('.suggested_questions_button_container');
    const suggestedQuestionsCardsContainer = document.querySelector('.suggested_questions_cards_container');
    const suggestedQuestionsContainer = document.querySelector('.suggested_questions_container');
    const closeQuestionsButton = document.querySelector('.close_questions_button');
    
    // 현재 채팅 ID (멀티턴을 위해 필요)
    let currentChatId = null;
    
    // 페이지 로드 시 환영 메시지 표시 및 새 채팅 생성
    showWelcomeMessage();
    
    // 초기 로드 시에는 show_questions_button 숨김
    if (suggestedQuestionsButtonContainer) {
        suggestedQuestionsButtonContainer.style.display = 'none';
    }
    
    createNewChatInHistory();
    
    // 채팅 히스토리에 새 채팅을 추가하는 함수
    function createNewChatInHistory() {
        // ChatHistoryColumn 인스턴스에 접근하여 새 채팅 생성
        if (window.chatHistoryColumn && typeof window.chatHistoryColumn.createNewChat === 'function') {
            const newChatId = window.chatHistoryColumn.createNewChat();
            currentChatId = newChatId; // 새 채팅 ID 설정
            console.log('New chat created with ID:', currentChatId);
        } else {
            // ChatHistoryColumn이 아직 초기화되지 않은 경우 잠시 후 재시도
            setTimeout(() => {
                if (window.chatHistoryColumn && typeof window.chatHistoryColumn.createNewChat === 'function') {
                    const newChatId = window.chatHistoryColumn.createNewChat();
                    currentChatId = newChatId; // 새 채팅 ID 설정
                    console.log('New chat created with ID (delayed):', currentChatId);
                }
            }, 100);
        }
    }
    
    // 환영 메시지를 표시하는 함수
    function showWelcomeMessage() {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'bot_message';
        welcomeMessage.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble">
                    안녕하세요! KB 업무 지원 챗봇입니다. 궁금한 업무나 규정에 대해 언제든 문의해 주세요.
                </div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>
        `;
        
        // 환영 메시지를 컨테이너에 추가
        welcomeMessageContainer.appendChild(welcomeMessage);
    }
    
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
        // input 위의 카드들도 숨김
        if (suggestedQuestionsCardsContainer) {
            suggestedQuestionsCardsContainer.style.display = 'none';
        }
        // 질문을 한 후에는 show_questions_button 표시
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
        // 다양한 줄바꿈 문자를 HTML <br> 태그로 변환
        let formattedMessage = message
            .replace(/\n/g, '<br>')           // 일반 줄바꿈
            .replace(/\r\n/g, '<br>')         // Windows 줄바꿈
            .replace(/\r/g, '<br>')           // Mac 줄바꿈
            .replace(/\\n/g, '<br>');         // 이스케이프된 줄바꿈
        
        const messageElement = document.createElement('div');
        messageElement.className = 'bot_message';
        messageElement.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble">${formattedMessage}</div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>
        `;
        
        // AI 메시지를 컨테이너에 추가
        userMessagesContainer.appendChild(messageElement);
        
        // 스크롤을 맨 아래로
        const chatMessagesArea = document.querySelector('.chat_messages_area');
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }
    
    // AI 로딩 메시지를 추가하는 함수
    function addAILoadingMessage() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'bot_message loading_message';
        loadingElement.id = 'ai_loading_message';
        loadingElement.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble loading_bubble">
                    <div class="loading_dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="loading_text">Fin AIssist가 답변을 생성하고 있습니다.</span>
                </div>
            </div>
        `;
        
        // 로딩 메시지를 컨테이너에 추가
        userMessagesContainer.appendChild(loadingElement);
        
        // 스크롤을 맨 아래로
        const chatMessagesArea = document.querySelector('.chat_messages_area');
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }
    
    // AI 로딩 메시지를 제거하는 함수
    function removeAILoadingMessage() {
        const loadingElement = document.getElementById('ai_loading_message');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    // PDF 참조 정보를 업데이트하는 함수
    function updatePDFReference(sources, productName) {
        console.log('updatePDFReference 호출됨:', { sources, productName });
        
        if (!sources || sources.length === 0) {
            console.log('PDF 소스 정보가 없습니다.');
            return;
        }
        
        // product_name이 있으면 관련 PDF만 필터링, 없으면 질문 내용 기반으로 필터링
        let filteredSources = sources;
        if (productName && productName.trim()) {
            // 특정 상품명이 있는 경우
            const productKeywords = productName.toLowerCase().replace('kb', '').trim();
            
            filteredSources = sources.filter(source => {
                const fileName = source.file_name || '';
                const keywords = source.keywords || [];
                return fileName.toLowerCase().includes(productKeywords) || 
                       keywords.some(keyword => keyword.toLowerCase().includes(productKeywords));
            });
            
            // 필터링된 결과가 없으면 원본 사용
            if (filteredSources.length === 0) {
                filteredSources = sources;
            }
        } else {
            // product_name이 없는 경우 - 질문 내용 기반으로 필터링
            // 현재 질문 내용을 가져와서 키워드 추출
            const currentQuestion = getCurrentQuestion();
            if (currentQuestion) {
                const questionKeywords = extractKeywordsFromQuestion(currentQuestion);
                
                filteredSources = sources.filter(source => {
                    const fileName = source.file_name || '';
                    const keywords = source.keywords || [];
                    
                    // 파일명이나 키워드에 질문 키워드가 포함되어 있는지 확인
                    return questionKeywords.some(keyword => 
                        fileName.toLowerCase().includes(keyword.toLowerCase()) ||
                        keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
                    );
                });
                
                // 필터링된 결과가 없으면 원본 사용
                if (filteredSources.length === 0) {
                    filteredSources = sources;
                }
            }
        }
        
        // 가장 높은 점수의 소스 (첫 번째 요소) 추출
        const topSource = filteredSources[0];
        console.log('선택된 topSource:', topSource);
        
        // PDF 파일명 추출 (예: "KB국민은행 대출상품 가이드.pdf")
        let pdfFileName = 'PDF 문서';
        let pageNumber = '';
        let content = '';
        
        if (typeof topSource === 'string') {
            // 문자열 형태의 소스인 경우
            const parts = topSource.split(' - ');
            if (parts.length >= 2) {
                pdfFileName = parts[0];
                pageNumber = parts[1];
                content = parts.slice(2).join(' - ');
            } else {
                pdfFileName = topSource;
            }
        } else if (typeof topSource === 'object') {
            // 객체 형태의 소스인 경우 (AI 서버 메타데이터)
            pdfFileName = topSource.file_name || topSource.filename || topSource.source || topSource.relative_path || 'PDF 문서';
            pageNumber = topSource.page_number || topSource.page || '';
            
            // content 추출을 더 포괄적으로 처리 (text 필드 우선)
            content = topSource.text || topSource.page_content || topSource.content || topSource.snippet || '';
            
            // content가 여전히 비어있다면 기본 메시지 설정
            if (!content || content.trim() === '') {
                // 파일명에서 상품명이나 키워드를 추출하여 기본 내용 생성
                const fileName = pdfFileName.toLowerCase();
                if (fileName.includes('대출') || fileName.includes('loan')) {
                    content = '대출 상품 관련 정보가 검색되었습니다.';
                } else if (fileName.includes('예금') || fileName.includes('deposit')) {
                    content = '예금 상품 관련 정보가 검색되었습니다.';
                } else if (fileName.includes('신용') || fileName.includes('credit')) {
                    content = '신용 상품 관련 정보가 검색되었습니다.';
                } else if (fileName.includes('규정') || fileName.includes('rule')) {
                    content = '관련 규정 정보가 검색되었습니다.';
                } else if (fileName.includes('법률') || fileName.includes('law')) {
                    content = '관련 법률 정보가 검색되었습니다.';
                } else {
                    content = '관련 문서에서 검색된 내용입니다.';
                }
            }
        }
        
        console.log('추출된 정보:', { pdfFileName, pageNumber, content });
        
        // current_pdfs_list에 새로운 PDF 아이템 추가
        const currentPdfsList = document.querySelector('.current_pdfs_list');
        
        if (currentPdfsList) {
            // 새로운 PDF 아이템 생성
            const newPdfItem = document.createElement('div');
            newPdfItem.className = 'current_pdf_item';
            newPdfItem.setAttribute('data-pdf-id', `pdf_${Date.now()}`);
            newPdfItem.innerHTML = `
                <div class="pdf_thumbnail">
                    <i class="bi bi-file-earmark-pdf"></i>
                </div>
                <div class="pdf_info">
                    <div class="pdf_name">${pdfFileName}</div>
                    <div class="pdf_pages">${pageNumber ? `페이지 ${pageNumber}` : '페이지 정보 없음'}</div>
                </div>
                <div class="pdf_actions">
                    <div class="action_icon">
                        <i class="bi bi-x"></i>
                    </div>
                </div>
            `;
            
            // 리스트의 맨 위에 추가
            currentPdfsList.insertBefore(newPdfItem, currentPdfsList.firstChild);
        }
        
        // pdf_reference_list에 새로운 참조 아이템 추가
        const pdfReferenceList = document.querySelector('.pdf_reference_list');
        
        if (pdfReferenceList) {
            // 기존 active 클래스 제거
            const existingActiveReferences = pdfReferenceList.querySelectorAll('.reference_item.active');
            existingActiveReferences.forEach(item => item.classList.remove('active'));
            
            // 새로운 참조 아이템 생성
            const newReferenceItem = document.createElement('div');
            newReferenceItem.className = 'reference_item active';
            newReferenceItem.innerHTML = `
                <div class="reference_content">
                    <div class="reference_content_header">
                        <span class="reference_source">
                            <span class="title_line_container"><div class="title_line"></div></span>
                            <span class="pdf_file_name">${pdfFileName}</span>
                            <span class="pdf_page_number">${pageNumber ? `p. ${pageNumber}` : 'p. ?'}</span>
                        </span>
                    </div>
                    <div class="reference_content_body">
                        <div class="reference_preview">${content ? (content.length > 100 ? content.substring(0, 100) + '...' : content) : '관련 문서에서 검색된 내용입니다.'}</div>
                        <div class="reference_time">방금 전</div>
                    </div>
                </div>
            `;
            
            // 리스트의 맨 위에 추가
            pdfReferenceList.insertBefore(newReferenceItem, pdfReferenceList.firstChild);
        }
        
    }
    
    // 현재 질문 내용을 가져오는 함수
    function getCurrentQuestion() {
        // 최근 사용자 메시지에서 질문 내용 추출
        const userMessages = document.querySelectorAll('.user_message .message_bubble');
        if (userMessages.length > 0) {
            const lastMessage = userMessages[userMessages.length - 1];
            return lastMessage.textContent.trim();
        }
        return null;
    }
    
    // 질문에서 키워드를 추출하는 함수
    function extractKeywordsFromQuestion(question) {
        const keywords = [];
        const lowerQuestion = question.toLowerCase();
        
        // 금융 관련 키워드 매핑
        const keywordMapping = {
            '수수료': ['수수료', 'fee', 'charge'],
            '금리': ['금리', 'interest', 'rate'],
            '대출': ['대출', 'loan', 'credit'],
            '예금': ['예금', 'deposit', 'saving'],
            '신용': ['신용', 'credit'],
            '담보': ['담보', 'collateral', 'mortgage'],
            '상환': ['상환', 'repayment', 'payment'],
            '한도': ['한도', 'limit', 'ceiling'],
            '조건': ['조건', 'condition', 'requirement'],
            '절차': ['절차', 'procedure', 'process'],
            '서류': ['서류', 'document', 'paper'],
            '신청': ['신청', 'application', 'apply']
        };
        
        // 질문에서 키워드 찾기
        for (const [mainKeyword, variations] of Object.entries(keywordMapping)) {
            if (variations.some(variation => lowerQuestion.includes(variation))) {
                keywords.push(mainKeyword);
            }
        }
        
        // 질문에서 직접 추출할 수 있는 키워드들
        const directKeywords = ['수수료', '금리', '대출', '예금', '신용', '담보', '상환', '한도', '조건', '절차', '서류', '신청'];
        directKeywords.forEach(keyword => {
            if (lowerQuestion.includes(keyword) && !keywords.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        
        return keywords;
    }
    
    // AI 서버 연결 상태를 확인하는 함수
    async function checkAIServerConnection() {
        try {
            const response = await fetch('/kb_finaIssist/chatbot/api/chat/health/', {
                method: 'GET',
                timeout: 3000
            });
            const data = await response.json();
            return data.connected;
        } catch (error) {
            console.log('AI 서버 연결 실패:', error);
            return false;
        }
    }
    
    // AI 서버에 메시지를 전송하는 함수
    async function sendMessageToAI(message) {
        try {
            const response = await fetch('/kb_finaIssist/chatbot/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    chat_id: currentChatId
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('AI 서버 응답 오류');
            }
        } catch (error) {
            console.error('AI 통신 오류:', error);
            return {
                success: false,
                response: 'AI 추론 서버가 연결 되어 있지 않습니다.',
                sources: [],
                category: 'error'
            };
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
        
        // AI 서버에 메시지 전송하고 응답 받기
        setTimeout(async () => {
            // 로딩 메시지 표시
            addAILoadingMessage();
            
            const aiResult = await sendMessageToAI(message);
            
            // 로딩 메시지 제거
            removeAILoadingMessage();
            
            if (aiResult.success) {
                addAIResponse(aiResult.response);
                
                // AI 응답 전체 로깅
                console.log('AI Result:', aiResult);
                console.log('Current Chat ID:', currentChatId);
                console.log('Initial Topic Summary:', aiResult.initial_topic_summary);
                
                // 채팅 제목 업데이트 (첫 번째 질문에서만)
                if (currentChatId) {
                    // 현재 채팅의 제목이 "새 채팅"인 경우에만 업데이트
                    const currentChat = window.chatHistoryColumn?.chatHistory?.find(chat => 
                        chat.id === currentChatId || 
                        chat.id === parseInt(currentChatId) || 
                        chat.id === String(currentChatId)
                    );
                    
                    if (currentChat && currentChat.title === '새 채팅') {
                        let titleToUse = '';
                        
                        if (aiResult.initial_topic_summary && aiResult.initial_topic_summary.trim()) {
                            // FastAPI에서 제공된 요약 사용
                            titleToUse = aiResult.initial_topic_summary.trim();
                            console.log('Using FastAPI summary:', titleToUse);
                        } else {
                            // 메시지 기반으로 제목 생성
                            titleToUse = generateTitleFromMessage(message);
                            console.log('Generated title from message:', titleToUse);
                        }
                        
                        if (titleToUse) {
                            updateChatTitle(currentChatId, titleToUse);
                        }
                    } else {
                        console.log('Chat title already set, skipping update');
                    }
                }
                
                if (aiResult.sources && aiResult.sources.length > 0) {
                    
                    // 가장 높은 점수의 PDF 정보 추출 및 HTML 업데이트
                    updatePDFReference(aiResult.sources, aiResult.product_name);
                }
            } else {
                addAIResponse(aiResult.response);
            }
        }, 500);
    }
    
    // 메시지에서 제목 생성 함수
    function generateTitleFromMessage(message) {
        // 메시지 정리
        let title = message.trim();
        
        // 질문어 제거
        const questionWords = ['이뭐야', '이뭔가요', '이뭔지', '에대해서', '에대해', '설명해줘', '알려줘', '궁금해', '궁금합니다', '문의', '질문'];
        questionWords.forEach(word => {
            title = title.replace(new RegExp(word, 'gi'), '');
        });
        
        // 특수문자 제거
        title = title.replace(/[?!.,~]/g, '');
        
        // 길이 제한 (20자)
        if (title.length > 20) {
            title = title.substring(0, 20) + '...';
        }
        
        // 빈 문자열이면 기본 제목
        if (!title.trim()) {
            title = '질문';
        }
        
        return title.trim();
    }
    
    // 채팅 제목 업데이트 함수
    function updateChatTitle(chatId, title) {
        if (window.chatHistoryColumn && typeof window.chatHistoryColumn.updateChatTitle === 'function') {
            window.chatHistoryColumn.updateChatTitle(chatId, title);
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
    
    // 채팅 히스토리 액션 이벤트 리스너
    document.addEventListener('chatHistoryAction', function(event) {
        const { action, data } = event.detail;
        
        if (action === 'new_chat') {
            console.log('새 채팅 시작:', data);
            startNewChat();
        } else if (action === 'load_chat') {
            console.log('채팅 로드:', data);
            loadChat(data);
        }
    });
    
    // 새 채팅을 시작하는 함수
    function startNewChat() {
        // 기존 메시지들 제거
        userMessagesContainer.innerHTML = '';
        welcomeMessageContainer.innerHTML = '';
        
        // 환영 메시지 다시 표시
        showWelcomeMessage();
        
        // 자주 묻는 질문 섹션 다시 표시
        if (suggestedQuestionsContainer) {
            suggestedQuestionsContainer.style.display = 'flex';
        }
        if (suggestedQuestionsButtonContainer) {
            suggestedQuestionsButtonContainer.style.display = 'none';  // 새 채팅에서는 버튼 숨김
        }
        if (suggestedQuestionsCardsContainer) {
            suggestedQuestionsCardsContainer.style.display = 'none';
        }
        
        // 스크롤을 맨 위로
        const chatMessagesArea = document.querySelector('.chat_messages_area');
        chatMessagesArea.scrollTop = 0;
    }
    
    // 기존 채팅을 로드하는 함수 (향후 구현)
    function loadChat(chatData) {
        console.log('채팅 로드 기능은 향후 구현 예정입니다:', chatData);
    }
});

