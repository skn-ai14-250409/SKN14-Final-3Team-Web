document.addEventListener('DOMContentLoaded', async function() {
    const chatInput = document.querySelector('.chat_input');
    const userMessagesContainer = document.getElementById('user_messages_container');
    const welcomeMessageContainer = document.getElementById('welcome_message_container');
    const showQuestionsButton = document.querySelector('.show_questions_button');
    const suggestedQuestionsButtonContainer = document.querySelector('.suggested_questions_button_container');
    const suggestedQuestionsCardsContainer = document.querySelector('.suggested_questions_cards_container');
    const suggestedQuestionsContainer = document.querySelector('.suggested_questions_container');
    const closeQuestionsButton = document.querySelector('.close_questions_button');
    const inputContainer = document.querySelector('.input_container');

    // 현재 채팅 ID (멀티턴/히스토리 로딩용)
    let currentChatId = null;

    // --- 초기 부팅: 환영메시지, 입력 포커스, FAQ 버튼 상태 ---
    showWelcomeMessage();
    focusInput();
    if (suggestedQuestionsButtonContainer) suggestedQuestionsButtonContainer.style.display = 'none';

    // --- 히스토리 컬럼 연동: 전체 로드 후 새 채팅 생성(또는 fallback) ---
    await createOrEnsureChat();

    // ====== 유틸 ======
    function focusInput() {
        if (!chatInput) return;
        chatInput.focus();
        const len = chatInput.value.length;
        chatInput.setSelectionRange(len, len);
    }
    function getCurrentTime() {
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes();
        const ampm = h >= 12 ? '오후' : '오전';
        const hh = h % 12 || 12;
        const mm = m.toString().padStart(2, '0');
        return `${ampm} ${hh}:${mm}`;
    }
    function formatDbTime(isoString) {
        if (!isoString) return getCurrentTime();
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return getCurrentTime();
            const h = d.getHours(), m = d.getMinutes();
            const ampm = h >= 12 ? '오후' : '오전';
            const hh = h % 12 || 12;
            const mm = m.toString().padStart(2, '0');
            return `${ampm} ${hh}:${mm}`;
        } catch {
            return getCurrentTime();
        }
    }

    // ====== 환영 메시지 ======
    function showWelcomeMessage() {
        const el = document.createElement('div');
        el.className = 'bot_message';
        el.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble">
                    안녕하세요! KB 업무 지원 챗봇입니다. 궁금한 업무나 규정에 대해 언제든 문의해 주세요.
                </div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>`;
        welcomeMessageContainer.appendChild(el);
    }

    // ====== FAQ 보이기/숨기기 ======
    function hideSuggestedQuestions() {
        if (suggestedQuestionsContainer) suggestedQuestionsContainer.style.display = 'none';
        if (suggestedQuestionsCardsContainer) suggestedQuestionsCardsContainer.style.display = 'none';
        if (suggestedQuestionsButtonContainer) suggestedQuestionsButtonContainer.style.display = 'flex';
    }
    function showSuggestedQuestions() {
        if (suggestedQuestionsButtonContainer) suggestedQuestionsButtonContainer.style.display = 'none';
        if (suggestedQuestionsCardsContainer) suggestedQuestionsCardsContainer.style.display = 'block';
    }
    function closeSuggestedQuestions() {
        if (suggestedQuestionsCardsContainer) suggestedQuestionsCardsContainer.style.display = 'none';
        if (suggestedQuestionsButtonContainer) suggestedQuestionsButtonContainer.style.display = 'flex';
    }

    // ====== 메시지 렌더링 ======
    function addAIResponse(message) {
        let formatted = message
            .replace(/\r\n/g, '<br>')
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '<br>')
            .replace(/\\n/g, '<br>');

        const id = `ai_message_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const el = document.createElement('div');
        el.className = 'bot_message';
        el.id = id;
        el.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble">${formatted}</div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>`;
        userMessagesContainer.appendChild(el);

        const area = document.querySelector('.chat_messages_area');
        if (area) area.scrollTop = area.scrollHeight;

        return id; // ← PDF 참조 클릭 시 스크롤 이동 위해 반환
    }
    function renderUserMessage(message, timestamp) {
        const el = document.createElement('div');
        el.className = 'user_message';
        el.innerHTML = `
            <div class="message_content">
                <div class="message_bubble">${message}</div>
                <div class="message_time">${formatDbTime(timestamp)}</div>
            </div>
            <div class="message_avatar"><i class="bi bi-person-fill"></i></div>`;
        userMessagesContainer.appendChild(el);
    }
    function renderBotMessage(message, timestamp) {
        const el = document.createElement('div');
        el.className = 'bot_message';
        el.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble">${(message || '').replace(/\n/g, '<br>')}</div>
                <div class="message_time">${formatDbTime(timestamp)}</div>
            </div>`;
        userMessagesContainer.appendChild(el);

        const area = document.querySelector('.chat_messages_area');
        if (area) area.scrollTop = area.scrollHeight;
    }

    // ====== 로딩 버블 ======
    function addAILoadingMessage() {
        const el = document.createElement('div');
        el.className = 'bot_message loading_message';
        el.id = 'ai_loading_message';
        el.innerHTML = `
            <div class="message_avatar">
                <img src="/static/images/KB_SymbolMark.png" alt="KB 챗봇" class="avatar_image">
            </div>
            <div class="message_content">
                <div class="message_bubble loading_bubble">
                    <div class="loading_dots"><span></span><span></span><span></span></div>
                    <span class="loading_text">Fin AIssist가 답변을 생성하고 있습니다.</span>
                </div>
            </div>`;
        userMessagesContainer.appendChild(el);
        const area = document.querySelector('.chat_messages_area');
        if (area) area.scrollTop = area.scrollHeight;
    }
    function removeAILoadingMessage() {
        const el = document.getElementById('ai_loading_message');
        if (el) el.remove();
    }

    // ====== PDF 참조 업데이트 (messageId로 AI 메시지와 연결 지원) ======
    function updatePDFReference(sources, productName, category = '', messageId = null) {
        if (!sources || sources.length === 0) return;

        let filteredSources = sources;
        if (productName && productName.trim()) {
            const productKeywords = productName.toLowerCase().replace('kb', '').trim();
            filteredSources = sources.filter(src => {
                const fileName = src.file_name || '';
                const keywords = src.keywords || [];
                return fileName.toLowerCase().includes(productKeywords) ||
                       keywords.some(k => k.toLowerCase().includes(productKeywords));
            });
            if (filteredSources.length === 0) filteredSources = sources;
        } else {
            const q = getCurrentQuestion();
            if (q) {
                const qKeywords = extractKeywordsFromQuestion(q);
                if (category) {
                    const cWords = getCategoryKeywords(category);
                    const catFiltered = sources.filter(src => {
                        const fileName = (src.file_name || '').toLowerCase();
                        const filePath = (src.file_path || '').toLowerCase();
                        const documentCategory = (src.document_category || '').toLowerCase();
                        const mainCategory = (src.main_category || '').toLowerCase();
                        const subCategory = (src.sub_category || '').toLowerCase();
                        return cWords.some(w =>
                            fileName.includes(w) || filePath.includes(w) ||
                            documentCategory.includes(w) || mainCategory.includes(w) || subCategory.includes(w)
                        );
                    });
                    if (catFiltered.length > 0) filteredSources = catFiltered;
                }
                if (qKeywords.length > 0) {
                    const kwFiltered = filteredSources.filter(src => {
                        const fileName = (src.file_name || '').toLowerCase();
                        const keywords = (src.keywords || []).map(k => k.toLowerCase());
                        return qKeywords.some(w => fileName.includes(w.toLowerCase()) || keywords.includes(w.toLowerCase()));
                    });
                    if (kwFiltered.length > 0) filteredSources = kwFiltered;
                }
                if (filteredSources.length === 0) filteredSources = sources;
            }
        }

        // 상위 source 하나 고르기(상품명/응답키워드/일반점수 순)
        let topSource = null;
        const pickByScore = (keywords) => {
            const scored = filteredSources.map(src => {
                const fileNameLower = (src.file_name || src.filename || src.source || src.relative_path || '').toLowerCase();
                let score = 0;
                keywords.forEach(k => { if (fileNameLower.includes(k.toLowerCase())) score += 15; });
                return { src, score };
            }).sort((a,b)=>b.score-a.score);
            return (scored[0] && scored[0].score > 0) ? scored[0].src : null;
        };

        if (productName && productName.trim()) {
            const clean = productName.replace(/[-→]/g, '').trim();
            const pks = clean.toLowerCase().split(/[\s,]+/).filter(x=>x.length>1);
            const perfect = filteredSources.map(src => {
                const fn = (src.file_name || src.filename || src.source || src.relative_path || '').toLowerCase();
                let score = 0;
                pks.forEach(k => { if (fn.includes(k)) score += 15; if (k.length>2 && fn.includes(k.slice(0,3))) score += 5; });
                ['대출','예금','카드','펀드','보험','상품'].forEach(k => { if (fn.includes(k)) score += 3; });
                return { src, score };
            }).sort((a,b)=>b.score-a.score);
            if (perfect[0] && perfect[0].score>0) topSource = perfect[0].src;
        }
        if (!topSource) {
            const currentResp = getCurrentAIResponse();
            if (currentResp) {
                const rks = extractKeywordsFromResponse(currentResp);
                if (rks.length) topSource = pickByScore(rks);
            }
        }
        if (!topSource) {
            const general = ['대출','예금','카드','펀드','보험','상품','개인','기업','kb'];
            const scored = filteredSources.map(src => {
                const fn = (src.file_name || src.filename || src.source || src.relative_path || '').toLowerCase();
                let score = 0;
                general.forEach(k => { if (fn.includes(k)) score += (k==='kb'?2:5); });
                return { src, score };
            }).sort((a,b)=>b.score-a.score);
            topSource = (scored[0] && scored[0].score>0) ? scored[0].src : filteredSources[0];
        }

        let pdfFileName = 'PDF 문서', pageNumber = '', content = '';
        if (typeof topSource === 'string') {
            const parts = topSource.split(' - ');
            if (parts.length >= 2) { pdfFileName = parts[0]; pageNumber = parts[1]; content = parts.slice(2).join(' - '); }
            else { pdfFileName = topSource; }
        } else {
            pdfFileName = topSource.file_name || topSource.filename || topSource.source || topSource.relative_path || 'PDF 문서';
            pageNumber = topSource.page_number || topSource.page || '';
            content = topSource.text || topSource.page_content || topSource.content || topSource.snippet || '';
            if (!content || !content.trim()) {
                const fn = pdfFileName.toLowerCase();
                content =
                    fn.includes('대출')||fn.includes('loan') ? '대출 상품 관련 정보가 검색되었습니다.' :
                    fn.includes('예금')||fn.includes('deposit') ? '예금 상품 관련 정보가 검색되었습니다.' :
                    fn.includes('신용')||fn.includes('credit') ? '신용 상품 관련 정보가 검색되었습니다.' :
                    fn.includes('규정')||fn.includes('rule') ? '관련 규정 정보가 검색되었습니다.' :
                    fn.includes('법률')||fn.includes('law') ? '관련 법률 정보가 검색되었습니다.' :
                    '관련 문서에서 검색된 내용입니다.';
            }
        }

        // current_pdfs_list에 추가
        const currentPdfsList = document.querySelector('.current_pdfs_list');
        if (currentPdfsList) {
            const item = document.createElement('div');
            item.className = 'current_pdf_item';
            item.setAttribute('data-pdf-id', `pdf_${Date.now()}`);
            item.innerHTML = `
                <div class="pdf_thumbnail"><i class="bi bi-file-earmark-pdf"></i></div>
                <div class="pdf_info">
                    <div class="pdf_name">${pdfFileName}</div>
                    <div class="pdf_pages">${pageNumber ? `페이지 ${pageNumber}` : '페이지 정보 없음'}</div>
                </div>
                <div class="pdf_actions"><div class="action_icon"><i class="bi bi-x"></i></div></div>`;
            currentPdfsList.insertBefore(item, currentPdfsList.firstChild);
            updatePdfCount();
        }

        // pdf_reference_list에 추가(메시지 연결)
        const pdfReferenceList = document.querySelector('.pdf_reference_list');
        if (pdfReferenceList) {
            pdfReferenceList.querySelectorAll('.reference_item.active').forEach(el => el.classList.remove('active'));
            const ref = document.createElement('div');
            ref.className = 'reference_item active';
            if (messageId) ref.setAttribute('data-message-id', messageId);
            ref.innerHTML = `
                <div class="reference_content">
                    <div class="reference_content_header">
                        <span class="reference_source">
                            <span class="title_line_container"><div class="title_line"></div></span>
                            <span class="pdf_file_name">${pdfFileName}</span>
                            <span class="pdf_page_number">${pageNumber ? `p. ${pageNumber}` : 'p. ?'}</span>
                        </span>
                    </div>
                    <div class="reference_content_body">
                        <div class="reference_preview">${content ? (content.length>100?content.substring(0,100)+'...':content) : '관련 문서에서 검색된 내용입니다.'}</div>
                        <div class="reference_time">방금 전</div>
                    </div>
                </div>`;
            if (messageId) {
                ref.style.cursor = 'pointer';
                ref.addEventListener('click', () => scrollToMessage(messageId));
            }
            pdfReferenceList.insertBefore(ref, pdfReferenceList.firstChild);
        }
    }

    function scrollToMessage(messageId) {
        const target = document.getElementById(messageId);
        const area = document.querySelector('.chat_messages_area');
        if (!target || !area) return;
        const mRect = target.getBoundingClientRect();
        const aRect = area.getBoundingClientRect();
        const top = area.scrollTop + (mRect.top - aRect.top) - (aRect.height/2) + (mRect.height/2);
        area.scrollTo({ top, behavior: 'smooth' });
        const bubble = target.querySelector('.message_bubble');
        if (bubble) {
            bubble.style.transition = 'background-color 0.2s';
            bubble.style.backgroundColor = '#e3f2fd';
            setTimeout(()=>{ bubble.style.backgroundColor=''; }, 2000);
        }
    }
    window.scrollToMessage = scrollToMessage;

    function getCurrentQuestion() {
        const nodes = document.querySelectorAll('.user_message .message_bubble');
        if (!nodes.length) return null;
        return nodes[nodes.length - 1].textContent.trim();
    }
    function extractKeywordsFromQuestion(q) {
        const out = [];
        const s = q.toLowerCase();
        const map = {
            '수수료':['수수료','fee','charge'],
            '금리':['금리','interest','rate'],
            '대출':['대출','loan','credit'],
            '예금':['예금','deposit','saving'],
            '신용':['신용','credit'],
            '담보':['담보','collateral','mortgage'],
            '상환':['상환','repayment','payment'],
            '한도':['한도','limit','ceiling'],
            '조건':['조건','condition','requirement'],
            '절차':['절차','procedure','process'],
            '서류':['서류','document','paper'],
            '신청':['신청','application','apply'],
            '여신내규':['여신내규','여신','내규','규정','정책','규칙','기준'],
            '규정':['규정','regulation','rule','policy'],
            '정책':['정책','policy','guideline'],
            '법률':['법률','law','legal','법'],
            '업무규정':['업무규정','업무','규정','procedure']
        };
        for (const [k, vars] of Object.entries(map)) if (vars.some(v=>s.includes(v))) out.push(k);
        ['수수료','금리','대출','예금','신용','담보','상환','한도','조건','절차','서류','신청','여신내규','여신','내규','규정','정책','법률','업무규정']
            .forEach(k => { if (s.includes(k) && !out.includes(k)) out.push(k); });
        return out;
    }
    function getCategoryKeywords(category) {
        const dict = {
            'company_products':['상품','product','대출','예금','카드','펀드','보험'],
            'company_rules':['규정','정책','규칙','기준','가이드','매뉴얼','업무규정'],
            'industry_policies_and_regulations':['법률','규정','정책','법','규칙','기준','여신','내규','업무규정','compliance','regulation'],
            'general_faq':['faq','자주묻는','질문','답변','가이드']
        };
        return dict[category] || [];
    }
    function getCurrentAIResponse() {
        const aiMsgs = document.querySelectorAll('.ai_message'); // 혹시 별도 클래스가 있으면 사용
        if (aiMsgs.length) return aiMsgs[aiMsgs.length-1].textContent || aiMsgs[aiMsgs.length-1].innerText || '';
        // 없으면 최근 bot_message의 텍스트를 사용 (백업)
        const botMsgs = document.querySelectorAll('.bot_message .message_bubble');
        return botMsgs.length ? (botMsgs[botMsgs.length-1].textContent || '') : '';
    }
    function extractKeywordsFromResponse(resp) {
        const out = [];
        const patterns = [
            /kb\s*([가-힣]+(?:대출|예금|카드|펀드|보험))/gi,
            /([가-힣]+(?:대출|예금|카드|펀드|보험))/gi,
            /([가-힣]+(?:우대|특례|전용))/gi,
            /([가-힣]+(?:성장|미래|유망))/gi
        ];
        patterns.forEach(p => {
            const matches = resp.match(p);
            if (matches) matches.forEach(m => {
                const clean = m.replace(/kb\s*/gi,'').trim();
                if (clean.length > 2) out.push(clean);
            });
        });
        ['미래성장기업','유망분야','성장기업','우대대출','동반성장','상생대출','수출기업','B2B동반성장']
            .forEach(k => { if (resp.toLowerCase().includes(k.toLowerCase())) out.push(k); });
        return [...new Set(out)];
    }

    async function checkAIServerConnection() {
        try {
            const res = await fetch('/kb_finaIssist/chatbot/api/chat/health/', { method: 'GET' });
            const data = await res.json();
            return data.connected;
        } catch { return false; }
    }

    async function sendMessageToAI(message) {
        try {
            const res = await fetch('/kb_finaIssist/chatbot/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({ message, chat_id: currentChatId })
            });
            if (!res.ok) throw new Error('AI 서버 응답 오류');
            return await res.json();
        } catch (e) {
            console.error('AI 통신 오류:', e);
            return { success:false, response:'AI 추론 서버가 연결 되어 있지 않습니다.', sources:[], category:'error' };
        }
    }

    async function addUserMessage(message) {
        const el = document.createElement('div');
        el.className = 'user_message';
        el.innerHTML = `
            <div class="message_content">
                <div class="message_bubble">${message}</div>
                <div class="message_time">${getCurrentTime()}</div>
            </div>
            <div class="message_avatar"><i class="bi bi-person-fill"></i></div>`;
        userMessagesContainer.appendChild(el);

        hideSuggestedQuestions();
        const area = document.querySelector('.chat_messages_area');
        if (area) area.scrollTop = area.scrollHeight;

        setTimeout(async () => {
            addAILoadingMessage();

            const wasTemp = String(currentChatId || '').startsWith('temp_');
            const aiResult = await sendMessageToAI(message);

            removeAILoadingMessage();

            if (aiResult.success) {
                // 1) 화면에 AI 응답 표시(그리고 messageId 받기)
                const aiMessageId = addAIResponse(aiResult.response);

                // 2) 임시 채팅이면 DB에 영구 저장 후 아이디 교체
                if (wasTemp && window.chatHistoryColumn?.createChatInDB) {
                    const title = (aiResult.initial_topic_summary && aiResult.initial_topic_summary.trim())
                        ? aiResult.initial_topic_summary.trim()
                        : message.substring(0, 30);
                    const newChat = await window.chatHistoryColumn.createChatInDB(title, [
                        { role:'user', content: message },
                        { role:'assistant', content: aiResult.response }
                    ]);
                    if (newChat && window.chatHistoryColumn?.replaceTempWithPermanent) {
                        const tempId = currentChatId;
                        window.chatHistoryColumn.replaceTempWithPermanent(tempId, newChat);
                        currentChatId = newChat.id;
                    }
                } else {
                    // 3) 첫 질문이면 LLM 요약으로 채팅 제목 업데이트
                    try {
                        const currentChat = window.chatHistoryColumn?.chatHistory?.find(ch =>
                            ch.id === currentChatId ||
                            ch.id === parseInt(currentChatId) ||
                            ch.id === String(currentChatId)
                        );
                        if (currentChat && currentChat.title === '새 채팅') {
                            const title = (aiResult.initial_topic_summary && aiResult.initial_topic_summary.trim())
                                ? aiResult.initial_topic_summary.trim()
                                : null;
                            if (title) updateChatTitle(currentChatId, title);
                        }
                    } catch {}
                }

                // 4) PDF 참조 렌더 (AI 메시지와 연결)
                if (aiResult.sources && aiResult.sources.length) {
                    updatePDFReference(aiResult.sources, aiResult.product_name, aiResult.category, aiMessageId);
                }
            } else {
                addAIResponse(aiResult.response);
            }

            setTimeout(() => focusInput(), 100);
        }, 300);
    }

    function updatePdfCount() {
        const list = document.querySelector('.current_pdfs_list');
        const cntEl = document.querySelector('.pdf_count');
        if (!list || !cntEl) return;
        cntEl.textContent = `${list.querySelectorAll('.current_pdf_item').length}개`;
    }

    function updateChatTitle(chatId, title) {
        if (window.chatHistoryColumn?.updateChatTitle) {
            window.chatHistoryColumn.updateChatTitle(chatId, title);
        }
    }

    // ====== 이벤트 바인딩 ======
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                addUserMessage(this.value.trim());
                this.value = '';
            }
        });
    }
    (suggestedQuestionsContainer ? suggestedQuestionsContainer.querySelectorAll('.suggested_question_card') : [])
        .forEach(card => card.addEventListener('click', function() {
            const questionTitle = this.querySelector('.question_title').textContent;
            addUserMessage(questionTitle);
        }));
    (suggestedQuestionsCardsContainer ? suggestedQuestionsCardsContainer.querySelectorAll('.suggested_question_card') : [])
        .forEach(card => card.addEventListener('click', function() {
            const questionTitle = this.querySelector('.question_title').textContent;
            addUserMessage(questionTitle);
            closeSuggestedQuestions();
        }));
    if (showQuestionsButton) showQuestionsButton.addEventListener('click', showSuggestedQuestions);
    if (closeQuestionsButton) closeQuestionsButton.addEventListener('click', closeSuggestedQuestions);

    const voiceButton = document.querySelector('.voice_button');
    if (voiceButton) voiceButton.addEventListener('click', () => console.log('음성 입력 기능은 향후 구현 예정입니다.'));
    const voiceWaveButton = document.querySelector('.voice_wave_button');
    if (voiceWaveButton) voiceWaveButton.addEventListener('click', () => console.log('음성 파형 기능은 향후 구현 예정입니다.'));
    const attachButton = document.querySelector('.attach_button');
    if (attachButton) attachButton.addEventListener('click', () => console.log('파일 첨부 기능은 향후 구현 예정입니다.'));

    document.addEventListener('chatHistoryAction', function(event) {
        const { action, data } = event.detail || {};
        if (action === 'new_chat') {
            startNewChat(true); // 새 채팅 + 히스토리 열 생성
        } else if (action === 'load_chat') {
            loadChat(data);
        }
    });

    // ====== 새 채팅 / 채팅 로드 ======
    function startNewChat(createHistoryRow = false) {
        userMessagesContainer.innerHTML = '';
        welcomeMessageContainer.innerHTML = '';
        showWelcomeMessage();

        if (suggestedQuestionsContainer) suggestedQuestionsContainer.style.display = 'flex';
        if (suggestedQuestionsButtonContainer) suggestedQuestionsButtonContainer.style.display = 'none';
        const currentPdfsList = document.querySelector('.current_pdfs_list');
        const pdfReferenceList = document.querySelector('.pdf_reference_list');
        if (currentPdfsList) currentPdfsList.innerHTML = '';
        if (pdfReferenceList) pdfReferenceList.innerHTML = '';
        updatePdfCount();
        if (suggestedQuestionsCardsContainer) suggestedQuestionsCardsContainer.style.display = 'none';

        const area = document.querySelector('.chat_messages_area');
        if (area) area.scrollTop = 0;

        if (createHistoryRow) {
            // 히스토리 새 항목 생성 + currentChatId 갱신
            if (window.chatHistoryColumn?.createNewChat) {
                const newId = window.chatHistoryColumn.createNewChat();
                currentChatId = newId || `temp_${Date.now()}`;
            } else {
                currentChatId = `temp_${Date.now()}`;
            }
        }
        setTimeout(()=>focusInput(), 100);
    }

    async function loadChat(chatData) {
        if (!chatData) return;
        currentChatId = chatData.id;

        // UI 초기화
        startNewChat(false);
        welcomeMessageContainer.innerHTML = '';
        hideSuggestedQuestions();
        addAILoadingMessage();

        try {
            const res = await fetch(`/kb_finaIssist/chatbot/api/chats/${chatData.id}/messages/`);
            if (!res.ok) throw new Error(`Failed to load messages: ${res.statusText}`);
            const messages = await res.json();
            removeAILoadingMessage();

            if (!messages.length) {
                showWelcomeMessage();
            } else {
                messages.forEach(msg => {
                    if (msg.role === 'USER') renderUserMessage(msg.content, msg.created_at);
                    else if (msg.role === 'AI') renderBotMessage(msg.content, msg.created_at);
                });
            }
            const area = document.querySelector('.chat_messages_area');
            if (area) area.scrollTop = area.scrollHeight;
        } catch (e) {
            console.error('Error loading chat history:', e);
            removeAILoadingMessage();
            addAIResponse('대화 내용을 불러오는 데 실패했습니다.');
        }
    }

    // ====== 초기 채팅 생성(히스토리 연동 포함) ======
    async function createOrEnsureChat() {
        try {
            if (window.chatHistoryColumn?.loadHistory) {
                await window.chatHistoryColumn.loadHistory();
            }
            // createNewChat이 id를 반환하면 currentChatId로 설정
            if (window.chatHistoryColumn?.createNewChat) {
                const newId = await window.chatHistoryColumn.createNewChat();
                currentChatId = newId || `temp_${Date.now()}`;
            } else {
                // 히스토리 컬럼 없으면 임시 채팅
                currentChatId = `temp_${Date.now()}`;
                startNewChat();
            }
        } catch (e) {
            console.warn('Chat history init failed, fallback to temp chat.', e);
            currentChatId = `temp_${Date.now()}`;
            startNewChat();
        }
    }

});
