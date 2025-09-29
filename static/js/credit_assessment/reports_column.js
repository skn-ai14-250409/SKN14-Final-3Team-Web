document.addEventListener('DOMContentLoaded', function () {
    class ReportsColumn {
        constructor() {
            this.listContainer = document.getElementById('unified_reports_list');
            this.countElement = document.getElementById('report_count');
            this.noReportsMessage = document.getElementById('no_reports_message');
            this.reports = [];
            this.init();
        }

        init() {
            this.updateUI();
            this.bindEvents();
        }

        bindEvents() {
            // DOM이 완전히 로드될 때까지 기다린 후 이벤트 바인딩
            setTimeout(() => {
                const btnTriggerSaveReport = document.querySelector('.report_upload_section');
                console.log('보고서 생성 버튼 요소:', btnTriggerSaveReport);
                
                if(btnTriggerSaveReport) {
                    // 기존 이벤트 리스너 제거 (중복 방지)
                    btnTriggerSaveReport.removeEventListener('click', this.handleReportClick);
                    
                    // 새로운 이벤트 핸들러 정의
                    this.handleReportClick = (e) => {
                        console.log('보고서 생성 버튼 클릭됨');
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // createAndSaveReport 함수가 정의되었는지 확인
                        if (typeof window.createAndSaveReport === 'function') {
                            console.log('createAndSaveReport 함수 호출 시도');
                            window.createAndSaveReport();
                        } else {
                            console.error('createAndSaveReport 함수가 정의되지 않았습니다.');
                            alert('보고서 생성 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
                        }
                    };
                    
                    btnTriggerSaveReport.addEventListener('click', this.handleReportClick);
                    console.log('보고서 생성 버튼 이벤트 리스너 추가됨');
                } else {
                    console.error('보고서 생성 버튼 요소를 찾을 수 없습니다.');
                    // 1초 후 다시 시도
                    setTimeout(() => this.bindEvents(), 1000);
                }
            }, 100);
        }

        addReport(report) {
            console.log('ReportsColumn.addReport 호출됨:', report);
            console.log('현재 보고서 개수:', this.reports.length);
            this.reports.unshift(report); // Add new report to the top of the list
            console.log('보고서 추가 후 개수:', this.reports.length);
            this.updateUI();
            console.log('UI 업데이트 완료');
        }

        removeReport(index) {
            const report = this.reports[index];
            if (report && report.url) {
                URL.revokeObjectURL(report.url); // Prevent memory leaks
            }
            this.reports.splice(index, 1);
            this.updateUI();
        }

        updateUI() {
            console.log('ReportsColumn.updateUI 호출됨');
            console.log('listContainer:', this.listContainer);
            console.log('reports.length:', this.reports.length);
            
            if (!this.listContainer) {
                console.error('listContainer를 찾을 수 없습니다.');
                return;
            }
            
            // 기존 보고서 아이템들만 제거 (no_reports_message는 유지)
            const existingReportItems = this.listContainer.querySelectorAll('.report_item');
            existingReportItems.forEach(item => item.remove());

            if (this.reports.length === 0) {
                console.log('보고서가 없어서 no_reports_message 표시');
                this.showNoReportsMessage();
            } else {
                console.log('보고서 목록 렌더링 시작');
                this.hideNoReportsMessage();
                this.reports.forEach((report, index) => {
                    console.log(`보고서 ${index} 렌더링:`, report);
                    const reportItem = this.createReportElement(report, index);
                    this.listContainer.appendChild(reportItem);
                });
                console.log('보고서 목록 렌더링 완료');
            }
            this.updateCount();
        }

        showNoReportsMessage() {
            // 기존 no_reports_message가 있으면 표시
            if (this.noReportsMessage) {
                this.noReportsMessage.style.display = 'block';
                this.noReportsMessage.style.minHeight = '100%';
                return;
            }
            
            // 없으면 새로 생성
            const noReportsDiv = document.createElement('div');
            noReportsDiv.className = 'no_reports_message';
            noReportsDiv.id = 'no_reports_message';
            noReportsDiv.style.minHeight = '100%';
            noReportsDiv.innerHTML = `
                <div class="empty_message">
                    <i class="bi bi-file-earmark-text"></i>
                    <p>저장된 보고서가 없습니다</p>
                    <p>여신심사를 완료하고 보고서를 생성해보세요</p>
                </div>
            `;
            
            this.listContainer.appendChild(noReportsDiv);
            this.noReportsMessage = noReportsDiv;
        }

        hideNoReportsMessage() {
            if (this.noReportsMessage) {
                this.noReportsMessage.style.display = 'none';
                this.noReportsMessage.style.minHeight = 'auto';
            }
        }

        createReportElement(report, index) {
            const item = document.createElement('div');
            item.className = 'report_item';
            item.innerHTML = `
                <div class="report_content">
                    <div class="report_header">
                        <div class="report_thumbnail"></div>
                        <div class="report_name">${report.name}.pdf</div>
                    </div>
                    <div class="report_meta">
                        <span class="report_type">PDF</span>
                        <span class="report_date">${report.date}</span>
                    </div>
                </div>
                <div class="report_actions">
                    <a href="${report.url}" download="${report.filename}" class="action_icon download_icon" title="다운로드">
                        <i class="bi bi-download"></i>
                    </a>
                    <div class="action_icon delete_icon" title="삭제">
                        <i class="bi bi-trash"></i>
                    </div>
                </div>
            `;
            
            // report_item 클릭 시 PDF 모달 열기
            item.addEventListener('click', (e) => {
                // 다운로드 버튼이나 삭제 버튼 클릭이 아닌 경우에만 PDF 모달 열기
                if (!e.target.closest('.report_actions')) {
                    const fileName = `${report.name}.pdf`;
                    const filePath = report.filePath || report.url; // filePath가 있으면 사용, 없으면 url 사용
                    
                    console.log('PDF 모달 열기 시도:', { filePath, fileName });
                    
                    // PDF 모달 열기
                    if (typeof window.openPdfPopup === 'function') {
                        window.openPdfPopup(filePath, fileName);
                    } else {
                        console.error('openPdfPopup 함수를 찾을 수 없습니다.');
                        // fallback: 새 창에서 PDF 열기
                        window.open(filePath, '_blank');
                    }
                }
            });
            
            // 다운로드 버튼 클릭 이벤트
            item.querySelector('.download_icon').addEventListener('click', (e) => {
                e.stopPropagation();
                const fileName = `${report.name}.pdf`;
                const filePath = report.filePath || report.url;
                
                console.log('PDF 다운로드 시도:', { filePath, fileName });
                
                // PDF 다운로드 실행
                if (typeof window.downloadPdf === 'function') {
                    window.downloadPdf(filePath, fileName);
                } else {
                    // fallback: 기본 다운로드 링크 사용
                    const downloadLink = document.createElement('a');
                    downloadLink.href = filePath;
                    downloadLink.download = fileName;
                    downloadLink.click();
                }
            });
            
            item.querySelector('.delete_icon').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeReport(index);
            });
            return item;
        }

        updateCount() {
            if (this.countElement) {
                this.countElement.textContent = `${this.reports.length}개`;
            }
        }
    }

    // Expose to global scope to be accessible from other JS files
    window.reportsColumn = new ReportsColumn();
});