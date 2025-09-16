// KB국민은행 직원 업무시스템 - Chat History Column Component

class ChatHistoryColumn {
    constructor() {
        this.currentChatId = null;
        this.chatHistory = [
            {
                id: 1,
                title: "주택담보대출 조건 문의",
                time: "2시간 전",
                timestamp: Date.now() - 2 * 60 * 60 * 1000
            },
            {
                id: 2,
                title: "정기예금 금리와 조건 질문",
                time: "1일 전",
                timestamp: Date.now() - 24 * 60 * 60 * 1000
            },
            {
                id: 3,
                title: "신용카드 발급 절차 문의",
                time: "2일 전",
                timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
            },
            {
                id: 4,
                title: "보험 상품 비교 문의",
                time: "3일 전",
                timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
            },
            {
                id: 5,
                title: "온라인 계좌 개설 방법",
                time: "1주 전",
                timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
            },
            {
                id: 6,
                title: "펀드 투자 상담",
                time: "2주 전",
                timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000
            }
        ];
        
        this.init();
    }
    
    init() {
        console.log('Chat History Column - Initializing');
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }
    
    setupEventListeners() {
        const newChatSection = document.querySelector('.new_chat_section');
        const chatSearchSection = document.querySelector('.chat_search_section');
        const historyItems = document.querySelectorAll('.history_item');
        const functionIcons = document.querySelectorAll('.function_icon');
        const storageSection = document.querySelector('.chat_storage_section');
        const settingSection = document.querySelector('.chat_setting_section');
        
        console.log('Chat History Column - Setting up event listeners');
        console.log('New Chat Section found:', newChatSection);
        console.log('Chat Search Section found:', chatSearchSection);
        console.log('History Items found:', historyItems.length);
        
        // 새 채팅 섹션 클릭
        if (newChatSection) {
            newChatSection.addEventListener('click', (e) => {
                console.log('New chat section clicked');
                e.stopPropagation();
                this.createNewChat();
            });
        }
        
        // 채팅 검색 섹션 클릭
        if (chatSearchSection) {
            chatSearchSection.addEventListener('click', (e) => {
                console.log('Chat search section clicked');
                e.stopPropagation();
                this.openSearch();
            });
        }
        
        // 히스토리 아이템 클릭
        historyItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                // function_icon 클릭이 아닌 경우에만 채팅 선택
                if (!e.target.closest('.function_icon')) {
                    console.log('History item clicked:', index);
                    e.stopPropagation();
                    this.selectChat(index);
                }
            });
        });
        
        // Function Icon 클릭 (세로 점 3개)
        functionIcons.forEach((icon, index) => {
            icon.addEventListener('click', (e) => {
                console.log('Function icon clicked:', index);
                e.stopPropagation();
                this.showContextMenu(e, index);
            });
        });
        
        // 저장소 섹션 클릭
        if (storageSection) {
            storageSection.addEventListener('click', (e) => {
                console.log('Storage section clicked');
                e.stopPropagation();
                this.openStorage();
            });
        }
        
        // 설정 섹션 클릭
        if (settingSection) {
            settingSection.addEventListener('click', (e) => {
                console.log('Setting section clicked');
                e.stopPropagation();
                this.openSettings();
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + N: 새 채팅
            if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                console.log('Keyboard shortcut: New chat');
                this.createNewChat();
            }
            
            // Ctrl + K: 채팅 검색
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                console.log('Keyboard shortcut: Chat search');
                this.openSearch();
            }
        });
    }
    
    createNewChat() {
        console.log('Creating new chat');
        
        // 새 채팅 데이터 생성
        const newChat = {
            id: Date.now(),
            title: "새 채팅",
            time: "방금 전",
            timestamp: Date.now()
        };
        
        // 히스토리 맨 위에 추가
        this.chatHistory.unshift(newChat);
        
        // UI 업데이트
        this.renderHistoryList();
        this.selectChat(0);
        
        // 메인 챗봇 영역에 새 채팅 알림
        this.notifyMainChatbot('new_chat', newChat);
    }
    
    selectChat(index) {
        console.log('Selecting chat:', index);
        
        // 모든 히스토리 아이템에서 active 클래스 제거
        const historyItems = document.querySelectorAll('.history_item');
        historyItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 선택된 아이템에 active 클래스 추가
        if (historyItems[index]) {
            historyItems[index].classList.add('active');
            this.currentChatId = this.chatHistory[index].id;
            
            // 메인 챗봇 영역에 채팅 로드 알림
            this.notifyMainChatbot('load_chat', this.chatHistory[index]);
        }
    }
    
    showContextMenu(event, index) {
        console.log('Showing context menu for item:', index);
        
        // 컨텍스트 메뉴 표시 (실제 구현 시 드롭다운 메뉴 생성)
        const menuItems = [
            { label: '이름 변경', action: () => this.renameChat(index) },
            { label: '삭제', action: () => this.deleteChat(index) },
            { label: '내보내기', action: () => this.exportChat(index) }
        ];
        
        // 임시로 알림으로 표시 (실제로는 드롭다운 메뉴 구현)
        alert(`컨텍스트 메뉴: ${this.chatHistory[index]?.title || 'Unknown'}`);
    }
    
    renameChat(index) {
        const newName = prompt('새 이름을 입력하세요:', this.chatHistory[index].title);
        if (newName && newName.trim()) {
            this.chatHistory[index].title = newName.trim();
            this.renderHistoryList();
        }
    }
    
    deleteChat(index) {
        if (confirm('이 채팅을 삭제하시겠습니까?')) {
            this.chatHistory.splice(index, 1);
            this.renderHistoryList();
        }
    }
    
    exportChat(index) {
        console.log('Exporting chat:', index);
        // 채팅 내보내기 기능 구현
    }
    
    openSearch() {
        console.log('Opening chat search');
        // 채팅 검색 모달 또는 기능 구현
    }
    
    openStorage() {
        console.log('Opening chat storage');
        // 채팅 저장소 페이지로 이동
    }
    
    openSettings() {
        console.log('Opening chat settings');
        // 채팅 설정 페이지로 이동
    }
    
    renderHistoryList() {
        const historyList = document.querySelector('.chat_history_list');
        if (!historyList) return;
        
        // 기존 히스토리 아이템 제거
        historyList.innerHTML = '';
        
        // 새로운 히스토리 아이템 생성
        this.chatHistory.forEach((chat, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history_item';
            if (index === 0 && this.currentChatId === null) {
                historyItem.classList.add('active');
            }
            
            historyItem.innerHTML = `
                <div class="history_content">
                    <div class="history_title">${chat.title}</div>
                    <div class="history_time">${chat.time}</div>
                </div>
                <div class="function_icon">
                    <i class="bi bi-three-dots-vertical"></i>
                </div>
            `;
            
            // 클릭 이벤트 추가
            historyItem.addEventListener('click', (e) => {
                if (!e.target.closest('.function_icon')) {
                    e.stopPropagation();
                    this.selectChat(index);
                }
            });
            
            // Function icon 클릭 이벤트 추가
            const functionIcon = historyItem.querySelector('.function_icon');
            functionIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showContextMenu(e, index);
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    notifyMainChatbot(action, data) {
        console.log('Notifying main chatbot:', action, data);
        
        // 커스텀 이벤트 발생
        const event = new CustomEvent('chatHistoryAction', {
            detail: { action, data }
        });
        document.dispatchEvent(event);
    }
    
    // 외부에서 호출할 수 있는 메서드들
    addChatMessage(chatId, message) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
            chat.title = message.length > 20 ? message.substring(0, 20) + '...' : message;
            chat.time = '방금 전';
            chat.timestamp = Date.now();
            
            // UI 업데이트
            this.renderHistoryList();
        }
    }
    
    updateChatTitle(chatId, newTitle) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
            chat.title = newTitle;
            
            // UI 업데이트
            this.renderHistoryList();
        }
    }
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Chat History Column');
    window.chatHistoryColumn = new ChatHistoryColumn();
});