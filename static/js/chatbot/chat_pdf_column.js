/**
 * Chat PDF Column JavaScript
 * PDF 참조 컬럼의 상호작용 기능을 담당
 */

class ChatPDFColumn {
    constructor() {
        this.currentPDFs = [];
        this.activePDFId = null;
        this.references = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
    }

    bindEvents() {
        // PDF 업로드 섹션 클릭
        const pdfUploadSection = document.querySelector('.pdf_upload_section');
        if (pdfUploadSection) {
            pdfUploadSection.addEventListener('click', () => {
                this.openPDFUpload();
            });
        }

        // PDF 검색 섹션 클릭
        const pdfSearchSection = document.querySelector('.pdf_search_section');
        if (pdfSearchSection) {
            pdfSearchSection.addEventListener('click', () => {
                this.openPDFSearch();
            });
        }

        // 현재 PDF 닫기 버튼들
        const pdfCloseBtns = document.querySelectorAll('.pdf_actions .action_icon');
        pdfCloseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pdfItem = e.target.closest('.current_pdf_item');
                const pdfId = pdfItem.dataset.pdfId;
                this.closePDF(pdfId);
            });
        });

        // PDF 항목 클릭 (활성화)
        const pdfItems = document.querySelectorAll('.current_pdf_item');
        pdfItems.forEach(item => {
            item.addEventListener('click', () => {
                const pdfId = item.dataset.pdfId;
                this.setActivePDF(pdfId);
            });
        });

        // 참조 항목 클릭
        const referenceItems = document.querySelectorAll('.reference_item');
        referenceItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectReference(item);
            });
        });

        // 참조 항목 액션 버튼
        const referenceActions = document.querySelectorAll('.reference_actions .action_icon');
        referenceActions.forEach(action => {
            action.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewReferencePage(action.closest('.reference_item'));
            });
        });

        // PDF 뷰어 열기
        const pdfViewerSection = document.querySelector('.pdf_viewer_section');
        if (pdfViewerSection) {
            pdfViewerSection.addEventListener('click', () => {
                this.openPDFViewer();
            });
        }

        // 문서 관리
        const pdfManagementSection = document.querySelector('.pdf_management_section');
        if (pdfManagementSection) {
            pdfManagementSection.addEventListener('click', () => {
                this.openPDFManagement();
            });
        }

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'u':
                        e.preventDefault();
                        this.openPDFUpload();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.openPDFSearch();
                        break;
                }
            }
        });
    }

    loadSampleData() {
        // 샘플 데이터 로드 (실제 구현에서는 API 호출)
        this.currentPDFs = [
            {
                id: 'pdf_001',
                name: 'KB국민은행 대출상품 가이드.pdf',
                pages: 24,
                active: true
            },
            {
                id: 'pdf_002',
                name: 'KB국민은행 신용카드 상품안내.pdf',
                pages: 18,
                active: false
            }
        ];

        this.activePDFId = 'pdf_001';

        this.references = [
            {
                id: 'ref_001',
                pdfId: 'pdf_001',
                page: 3,
                title: '대출 상품 개요',
                source: '대출상품 가이드.pdf',
                preview: '주택담보대출, 전세자금대출, 신용대출 등 다양한 상품을 제공합니다...',
                timestamp: new Date(Date.now() - 0 * 60 * 1000), // 방금 전
                active: true
            },
            {
                id: 'ref_002',
                pdfId: 'pdf_001',
                page: 7,
                title: '대출 조건 및 금리',
                source: '대출상품 가이드.pdf',
                preview: '주택담보대출의 경우 연 3.5%~4.2%의 금리를 적용하며...',
                timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2분 전
                active: false
            },
            {
                id: 'ref_003',
                pdfId: 'pdf_002',
                page: 5,
                title: '신용카드 혜택 및 할인',
                source: '신용카드 상품안내.pdf',
                preview: 'KB국민은행 신용카드의 다양한 혜택과 할인 서비스를 제공합니다...',
                timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3분 전
                active: false
            },
            {
                id: 'ref_004',
                pdfId: 'pdf_001',
                page: 12,
                title: '신청 절차 및 서류',
                source: '대출상품 가이드.pdf',
                preview: '대출 신청 시 필요한 서류와 절차에 대해 안내드립니다...',
                timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5분 전
                active: false
            },
            {
                id: 'ref_005',
                pdfId: 'pdf_002',
                page: 11,
                title: '카드 발급 조건',
                source: '신용카드 상품안내.pdf',
                preview: '신용카드 발급을 위한 기본 조건과 심사 기준을 안내합니다...',
                timestamp: new Date(Date.now() - 7 * 60 * 1000), // 7분 전
                active: false
            }
        ];

        this.updateUI();
    }

    updateUI() {
        this.updateCurrentPDFs();
        this.updateReferences();
    }

    updateCurrentPDFs() {
        const currentPDFsList = document.querySelector('.current_pdfs_list');
        const pdfCount = document.querySelector('.pdf_count');
        
        if (!currentPDFsList) return;

        // PDF 개수 업데이트
        if (pdfCount) {
            pdfCount.textContent = `${this.currentPDFs.length}개`;
        }

        // 기존 PDF 항목들 제거
        currentPDFsList.innerHTML = '';

        // 새로운 PDF 항목들 추가
        this.currentPDFs.forEach(pdf => {
            const pdfItem = this.createPDFItem(pdf);
            currentPDFsList.appendChild(pdfItem);
        });
    }

    createPDFItem(pdf) {
        const item = document.createElement('div');
        item.className = `current_pdf_item ${pdf.active ? 'active' : ''}`;
        item.dataset.pdfId = pdf.id;

        item.innerHTML = `
            <div class="pdf_thumbnail">
                <i class="bi bi-file-earmark-pdf"></i>
            </div>
            <div class="pdf_info">
                <div class="pdf_name">${pdf.name}</div>
                <div class="pdf_pages">총 ${pdf.pages}페이지</div>
            </div>
            <div class="pdf_actions">
                <div class="action_icon" title="문서 닫기">
                    <i class="bi bi-x"></i>
                </div>
            </div>
        `;

        // 이벤트 바인딩
        item.addEventListener('click', () => {
            this.setActivePDF(pdf.id);
        });

        const closeBtn = item.querySelector('.pdf_actions .action_icon');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closePDF(pdf.id);
        });

        return item;
    }

    updateReferences() {
        const referenceList = document.querySelector('.pdf_reference_list');
        if (!referenceList) return;

        // 기존 참조 항목 제거
        const existingItems = referenceList.querySelectorAll('.reference_item');
        existingItems.forEach(item => item.remove());

        // 새로운 참조 항목 추가
        this.references.forEach(reference => {
            const referenceItem = this.createReferenceItem(reference);
            referenceList.appendChild(referenceItem);
        });
    }

    createReferenceItem(reference) {
        const item = document.createElement('div');
        item.className = `reference_item ${reference.active ? 'active' : ''}`;
        item.dataset.referenceId = reference.id;

        const timeAgo = this.getTimeAgo(reference.timestamp);

        item.innerHTML = `
            <div class="page_thumbnail">
                <div class="page_number">${reference.page}</div>
            </div>
            <div class="reference_content">
                <div class="reference_title">${reference.title}</div>
                <div class="reference_source">${reference.source}</div>
                <div class="reference_preview">${reference.preview}</div>
                <div class="reference_time">${timeAgo}</div>
            </div>
            <div class="reference_actions">
                <div class="action_icon" title="페이지 보기">
                    <i class="bi bi-eye"></i>
                </div>
            </div>
        `;

        // 이벤트 바인딩
        item.addEventListener('click', () => {
            this.selectReference(item);
        });

        const actionBtn = item.querySelector('.reference_actions .action_icon');
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewReferencePage(item);
        });

        return item;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    }

    // 이벤트 핸들러들
    openPDFUpload() {
        // PDF 업로드 모달 또는 파일 선택 다이얼로그 열기
        console.log('PDF 업로드 열기');
        
        // 실제 구현에서는 파일 업로드 다이얼로그를 열거나 모달을 표시
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadPDF(file);
            }
        };
        input.click();
    }

    openPDFSearch() {
        // PDF 검색 기능 열기
        console.log('PDF 검색 열기');
        
        // 실제 구현에서는 검색 모달이나 인라인 검색을 표시
        const searchTerm = prompt('검색할 내용을 입력하세요:');
        if (searchTerm) {
            this.searchInPDF(searchTerm);
        }
    }

    setActivePDF(pdfId) {
        // 활성 PDF 설정
        console.log('활성 PDF 설정:', pdfId);
        
        this.activePDFId = pdfId;
        
        // 모든 PDF의 active 상태 업데이트
        this.currentPDFs.forEach(pdf => {
            pdf.active = pdf.id === pdfId;
        });
        
        // UI 업데이트
        this.updateCurrentPDFs();
    }

    closePDF(pdfId) {
        // 특정 PDF 닫기
        console.log('PDF 닫기:', pdfId);
        
        // PDF 목록에서 제거
        this.currentPDFs = this.currentPDFs.filter(pdf => pdf.id !== pdfId);
        
        // 해당 PDF의 참조 항목들도 제거
        this.references = this.references.filter(ref => ref.pdfId !== pdfId);
        
        // 활성 PDF가 닫힌 경우 다른 PDF를 활성화
        if (this.activePDFId === pdfId) {
            if (this.currentPDFs.length > 0) {
                this.activePDFId = this.currentPDFs[0].id;
                this.currentPDFs[0].active = true;
            } else {
                this.activePDFId = null;
            }
        }
        
        // UI 업데이트
        this.updateUI();
    }

    closeAllPDFs() {
        // 모든 PDF 닫기
        console.log('모든 PDF 닫기');
        
        this.currentPDFs = [];
        this.activePDFId = null;
        this.references = [];
        
        // UI 업데이트
        this.updateUI();
    }

    selectReference(item) {
        // 참조 항목 선택
        const referenceId = item.dataset.referenceId;
        console.log('참조 항목 선택:', referenceId);
        
        // 모든 참조 항목에서 active 클래스 제거
        document.querySelectorAll('.reference_item').forEach(ref => {
            ref.classList.remove('active');
        });
        
        // 선택된 항목에 active 클래스 추가
        item.classList.add('active');
        
        // 참조 데이터 업데이트
        this.references.forEach(ref => {
            ref.active = ref.id === referenceId;
        });
    }

    viewReferencePage(item) {
        // 참조 페이지 보기
        const referenceId = item.dataset.referenceId;
        const reference = this.references.find(ref => ref.id === referenceId);
        
        if (reference) {
            console.log('페이지 보기:', reference.page);
            
            // 실제 구현에서는 PDF 뷰어에서 해당 페이지를 표시
            this.openPDFViewer(reference.page);
        }
    }

    openPDFViewer(pageNumber = null) {
        // PDF 뷰어 열기
        console.log('PDF 뷰어 열기', pageNumber ? `페이지 ${pageNumber}` : '');
        
        // 실제 구현에서는 PDF 뷰어 모달이나 새 창을 열고
        // 지정된 페이지로 이동
        if (pageNumber) {
            // 특정 페이지로 이동
            console.log(`페이지 ${pageNumber}로 이동`);
        }
    }

    openPDFManagement() {
        // 문서 관리 열기
        console.log('문서 관리 열기');
        
        // 실제 구현에서는 문서 관리 모달이나 페이지를 열기
    }

    // API 관련 메서드들
    uploadPDF(file) {
        console.log('PDF 업로드:', file.name);
        
        // 실제 구현에서는 파일을 서버에 업로드하고
        // PDF 정보를 받아와서 UI를 업데이트
        const formData = new FormData();
        formData.append('pdf', file);
        
        // fetch('/api/upload-pdf', {
        //     method: 'POST',
        //     body: formData
        // })
        // .then(response => response.json())
        // .then(data => {
        //     this.currentPDF = data.pdf;
        //     this.updateUI();
        // });
    }

    searchInPDF(searchTerm) {
        console.log('PDF 검색:', searchTerm);
        
        // 실제 구현에서는 서버에 검색 요청을 보내고
        // 결과를 받아와서 UI에 표시
        // fetch(`/api/search-pdf?q=${encodeURIComponent(searchTerm)}`)
        // .then(response => response.json())
        // .then(data => {
        //     this.references = data.references;
        //     this.updateReferences();
        // });
    }

    // 외부에서 호출할 수 있는 메서드들
    addPDF(pdf) {
        // 새 PDF 추가
        this.currentPDFs.push(pdf);
        if (!this.activePDFId) {
            this.activePDFId = pdf.id;
            pdf.active = true;
        }
        this.updateCurrentPDFs();
    }

    addReference(reference) {
        this.references.unshift(reference);
        this.updateReferences();
    }

    removeReference(referenceId) {
        this.references = this.references.filter(ref => ref.id !== referenceId);
        this.updateReferences();
    }

    getActivePDF() {
        return this.currentPDFs.find(pdf => pdf.id === this.activePDFId);
    }

    getPDFById(pdfId) {
        return this.currentPDFs.find(pdf => pdf.id === pdfId);
    }

    getReferencesByPDF(pdfId) {
        return this.references.filter(ref => ref.pdfId === pdfId);
    }
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.chatPDFColumn = new ChatPDFColumn();
});

// 전역에서 접근 가능하도록 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatPDFColumn;
}
