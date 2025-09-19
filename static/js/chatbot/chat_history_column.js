// KB국민은행 직원 업무시스템 - Chat History Column Component

class ChatHistoryColumn {
    constructor() {
        this.currentChatId = null;
        this.chatHistory = []; // 빈 배열로 시작
        
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
        
        // 메뉴 외부 클릭 시 메뉴 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.function_icon')) {
                this.closeAllMenus();
            }
        });
        
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
        
        // 새 채팅 ID 반환
        return newChat.id;
    }
    
    selectChat(index) {
        console.log('Selecting chat:', index);
        
        // 히스토리가 비어있으면 선택할 수 없음
        if (this.chatHistory.length === 0) {
            console.log('No chat history available');
            return;
        }
        
        // 모든 히스토리 아이템에서 active 클래스 제거
        const historyItems = document.querySelectorAll('.history_item');
        historyItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 선택된 아이템에 active 클래스 추가
        if (historyItems[index] && this.chatHistory[index]) {
            historyItems[index].classList.add('active');
            this.currentChatId = this.chatHistory[index].id;
            
            // 메인 챗봇 영역에 채팅 로드 알림
            this.notifyMainChatbot('load_chat', this.chatHistory[index]);
        }
    }
    
    showContextMenu(event, index) {
        console.log('Showing context menu for item:', index);
        
        // 다른 메뉴들 닫기
        this.closeAllMenus();
        
        // 현재 메뉴 표시
        const functionIcon = event.currentTarget;
        const contextMenu = functionIcon.querySelector('.context_menu');
        
        if (contextMenu) {
            contextMenu.classList.add('show');
            
            // 메뉴 아이템 클릭 이벤트 추가
            const menuItems = contextMenu.querySelectorAll('.menu_item');
            menuItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = item.getAttribute('data-action');
                    this.handleMenuAction(action, index);
                    this.closeAllMenus();
                });
            });
        }
    }
    
    closeAllMenus() {
        const allMenus = document.querySelectorAll('.context_menu');
        allMenus.forEach(menu => {
            menu.classList.remove('show');
        });
    }
    
    handleMenuAction(action, index) {
        console.log('Menu action:', action, 'for item:', index);
        
        switch (action) {
            case 'save':
                this.saveChat(index);
                break;
            case 'delete':
                this.deleteChat(index);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    saveChat(index) {
        const chat = this.chatHistory[index];
        if (chat) {
            console.log('Saving chat:', chat.title);
            // 실제 저장 로직 구현
            alert(`"${chat.title}" 채팅이 저장되었습니다.`);
        }
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
        
        // 히스토리가 비어있으면 빈 상태 메시지 표시
        if (this.chatHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty_history">
                    <div class="empty_message">
                        <i class="bi bi-chat-dots"></i>
                        <p>아직 대화 기록이 없습니다.</p>
                        <p>새 채팅을 시작해보세요!</p>
                    </div>
                </div>
            `;
            return;
        }
        
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
                    <div class="context_menu">
                        <div class="menu_item" data-action="save">
                            <i class="bi bi-bookmark"></i>
                            <span>저장</span>
                        </div>
                        <div class="menu_item" data-action="delete">
                            <i class="bi bi-trash"></i>
                            <span>삭제</span>
                        </div>
                    </div>
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
    
    // 채팅 제목 업데이트 함수
    updateChatTitle(chatId, title) {
        console.log('updateChatTitle called:', { chatId, title });
        console.log('Current chat history:', this.chatHistory);
        
        // 해당 채팅 ID를 가진 채팅 찾기 (타입 변환 고려)
        const chatIndex = this.chatHistory.findIndex(chat => 
            chat.id === chatId || 
            chat.id === parseInt(chatId) || 
            chat.id === String(chatId)
        );
        console.log('Found chat index:', chatIndex);
        
        if (chatIndex !== -1) {
            const currentTitle = this.chatHistory[chatIndex].title;
            console.log('Current title:', currentTitle);
            
            // 제목 업데이트 (조건 완화)
            if (title && title.trim()) {
                this.chatHistory[chatIndex].title = title.trim();
                this.renderHistoryList();
                console.log('Chat title updated successfully from', currentTitle, 'to', title.trim());
            } else {
                console.log('Title not updated - no valid title provided:', title);
            }
        } else {
            console.log('Chat not found for ID:', chatId);
        }
    }
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Chat History Column');
    window.chatHistoryColumn = new ChatHistoryColumn();
});