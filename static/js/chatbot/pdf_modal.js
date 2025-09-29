/**
 * PDF 모달 관련 JavaScript 기능
 */

// PDF 모달 열기 함수 (전역 함수로 노출)
window.openPdfPopup = function(filePath, pdfTitle) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('pdfModalTitle');
    const modalViewer = document.getElementById('pdfModalViewer');
    const modalLoading = document.getElementById('pdfModalLoading');
    const modalError = document.getElementById('pdfModalError');
    
    if (!modal || !modalTitle || !modalViewer || !modalLoading || !modalError) {
        console.error('PDF 모달 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 모달 제목 설정
    modalTitle.textContent = pdfTitle || 'PDF 문서';
    
    // 모달 표시
    modal.style.display = 'flex';
    
    // 로딩 상태 표시
    modalLoading.style.display = 'block';
    modalError.style.display = 'none';
    modalViewer.style.display = 'none';
    
    // PDF URL 처리 (Blob URL인지 일반 파일 경로인지 확인)
    let pdfUrl;
    
    if (filePath.startsWith('blob:')) {
        // Blob URL인 경우 직접 사용
        pdfUrl = filePath;
    } else {
        // 일반 파일 경로인 경우 서버 URL로 변환
        const encodedPath = encodeURIComponent(filePath);
        pdfUrl = `/kb_bank/chatbot/pdf/${encodedPath}`;
    }
    
    // iframe에 PDF 로드
    modalViewer.src = pdfUrl;
    
    // iframe 로드 이벤트 처리
    modalViewer.onload = function() {
        modalLoading.style.display = 'none';
        modalViewer.style.display = 'block';
    };
    
    // iframe 에러 이벤트 처리
    modalViewer.onerror = function() {
        modalLoading.style.display = 'none';
        modalError.style.display = 'block';
    };
    
    // Blob URL인 경우 추가 처리
    if (filePath.startsWith('blob:')) {
        // Blob URL의 경우 iframe이 로드되기까지 약간의 시간이 필요할 수 있음
        setTimeout(() => {
            if (modalViewer.contentDocument && modalViewer.contentDocument.readyState === 'complete') {
                modalLoading.style.display = 'none';
                modalViewer.style.display = 'block';
            }
        }, 500);
    }
    
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// PDF 다운로드 함수 (다운로드 경로 설정)
function downloadPdf(filePath, fileName) {
    console.log(`다운로드 시도: ${fileName}, 경로: ${filePath}`);
    
    if (filePath.startsWith('blob:')) {
        // Blob URL인 경우 fetch를 사용하여 데이터 가져오기
        fetch(filePath)
            .then(response => response.blob())
            .then(blob => {
                // 새로운 Blob URL 생성
                const newBlobUrl = URL.createObjectURL(blob);
                
                // 다운로드 링크 생성
                const downloadLink = document.createElement('a');
                downloadLink.href = newBlobUrl;
                downloadLink.download = fileName || 'document.pdf';
                
                // 다운로드 실행
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // 메모리 정리
                setTimeout(() => {
                    URL.revokeObjectURL(newBlobUrl);
                }, 1000);
                
                console.log(`PDF 다운로드 완료: ${fileName}`);
                console.log(`다운로드 경로: C:\\Users\\Playdata2\\Downloads (브라우저 기본 다운로드 폴더)`);
            })
            .catch(error => {
                console.error('다운로드 중 오류 발생:', error);
                alert('다운로드 중 오류가 발생했습니다.');
            });
    } else {
        // 일반 파일 경로인 경우
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        downloadLink.download = fileName || 'document.pdf';
        
        // 다운로드 실행
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log(`PDF 다운로드 완료: ${fileName}`);
        console.log(`다운로드 경로: C:\\Users\\Playdata2\\Downloads (브라우저 기본 다운로드 폴더)`);
    }
}

// PDF 모달 닫기 함수
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    const modalViewer = document.getElementById('pdfModalViewer');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (modalViewer) {
        modalViewer.src = '';
        modalViewer.style.display = 'none';
    }
    
    // body 스크롤 복원
    document.body.style.overflow = '';
    
    // 전체화면 모드 해제
    const modalContent = document.querySelector('.pdf-modal-content');
    const expandIcon = document.querySelector('#pdfModalExpand i');
    
    if (modalContent) {
        modalContent.classList.remove('fullscreen');
    }
    
    if (modal) {
        modal.classList.remove('fullscreen');
    }
    
    if (expandIcon) {
        expandIcon.className = 'bi bi-arrows-angle-expand';
    }
}

// PDF 모달 전체화면 기능
function initPdfModalFullscreen() {
    const expandBtn = document.getElementById('pdfModalExpand');
    const modalContent = document.querySelector('.pdf-modal-content');
    const modal = document.getElementById('pdfModal');
    const expandIcon = expandBtn?.querySelector('i');
    
    if (!expandBtn || !modalContent || !expandIcon || !modal) return;
    
    let isFullscreen = false;
    
    expandBtn.addEventListener('click', function() {
        isFullscreen = !isFullscreen;
        
        if (isFullscreen) {
            // 전체화면 모드
            modal.classList.add('fullscreen');
            modalContent.classList.add('fullscreen');
            expandIcon.className = 'bi bi-arrows-angle-contract';
            document.body.style.overflow = 'hidden';
        } else {
            // 일반 모드
            modal.classList.remove('fullscreen');
            modalContent.classList.remove('fullscreen');
            expandIcon.className = 'bi bi-arrows-angle-expand';
            document.body.style.overflow = '';
        }
    });
    
    // ESC 키로 전체화면 해제
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) {
            isFullscreen = false;
            modal.classList.remove('fullscreen');
            modalContent.classList.remove('fullscreen');
            expandIcon.className = 'bi bi-arrows-angle-expand';
            document.body.style.overflow = '';
        }
    });
}

// PDF 모달 초기화
function initPdfModal() {
    initPdfModalFullscreen();
    
    const closeBtn = document.getElementById('pdfModalClose');
    const modal = document.getElementById('pdfModal');
    const overlay = document.querySelector('.pdf-modal-overlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closePdfModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closePdfModal);
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display !== 'none') {
            closePdfModal();
        }
    });
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initPdfModal();
});

// 전역 함수로 내보내기 (다른 스크립트에서 사용할 수 있도록)
window.openPdfPopup = openPdfPopup;
window.closePdfModal = closePdfModal;
window.initPdfModal = initPdfModal;
window.downloadPdf = downloadPdf;
