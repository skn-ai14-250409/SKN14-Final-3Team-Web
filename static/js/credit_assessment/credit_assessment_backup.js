// /**
//  * 여신심사 보고서 생성 및 저장 관련 JavaScript
//  */

// // 전역 변수
// window.isGeneratingReport = false;

// // createAndSaveReport 함수 (전역 함수로 노출)
// window.createAndSaveReport = async function() {
//     try {
//         // 중복 실행 방지
//         if (window.isGeneratingReport) {
//             console.log('이미 보고서 생성 중입니다.');
//             return;
//         }
        
//         window.isGeneratingReport = true;
//         console.log('=== createAndSaveReport 함수 시작 ===');
        
//         // third_column 요소 찾기
//         const thirdColumn = document.querySelector('.third_column');
//         if (!thirdColumn) {
//             console.error('third_column 요소를 찾을 수 없습니다.');
//             alert('심사 결과가 없습니다. 먼저 여신 심사를 진행해주세요.');
//             window.isGeneratingReport = false;
//             return;
//         }
        
//         // 고객명 가져오기
//         const customerNameInput = document.querySelector('input[name="customer_name"]');
//         const customerName = customerNameInput ? customerNameInput.value : '고객';
        
//         // third_column의 HTML 내용을 직접 가져오기
//         const thirdColumnHTML = thirdColumn.innerHTML;
//         console.log('third_column HTML:', thirdColumnHTML);
//         console.log('third_column HTML 길이:', thirdColumnHTML.length);
        
//         // HTML 내용이 비어있는지 확인
//         if (!thirdColumnHTML || thirdColumnHTML.trim().length === 0) {
//             console.error('third_column HTML이 비어있습니다!');
//             alert('심사 결과가 없습니다. 먼저 여신 심사를 진행해주세요.');
//             window.isGeneratingReport = false;
//             return;
//         }
        
//         // 새로운 PDF 생성 방식 사용
//         await downloadPdfReport(customerName, thirdColumnHTML);
        
//         // PDF 생성 완료
//         window.isGeneratingReport = false;
//         console.log('=== createAndSaveReport 함수 완료 ===');
        
//     } catch (error) {
//         console.error('PDF 생성 중 오류:', error);
//         alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
//         window.isGeneratingReport = false;
//     }
// }
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <meta charset="UTF-8">
//                 <title>${customerName}_여신심사보고서</title>
//                 <style>
//                     @page {
//                         margin: 15mm;
//                         size: A4;
//                     }
                    
//                     /* 기본 스타일 */
//                     * {
//                         margin: 0;
//                         padding: 0;
//                         box-sizing: border-box;
//                     }
                    
//                     body {
//                         font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
//                         margin: 0;
//                         padding: 20px;
//                         background: white;
//                         color: #333;
//                         line-height: 1.6;
//                     }
                    
//                     /* PDF 헤더 */
//                     .pdf-header {
//                         text-align: center;
//                         margin-bottom: 30px;
//                         padding-bottom: 20px;
//                         border-bottom: 2px solid #1e3a8a;
//                     }
                    
//                     .pdf-title {
//                         font-size: 24px;
//                         font-weight: bold;
//                         color: #1e3a8a;
//                         margin-bottom: 10px;
//                     }
                    
//                     .pdf-subtitle {
//                         font-size: 16px;
//                         color: #666;
//                         margin-bottom: 5px;
//                     }
                    
//                     /* 기존 third_column CSS 그대로 복사 */
//                     .third_column {
//                         grid-column: 3;
//                         min-height: 0;
//                         padding: 1.25rem;
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.625rem;
//                         overflow-y: auto;
//                         overflow-x: hidden;
//                         width: 100%;
//                     }
                    
//                     .third_column .assessment_results {
//                         display: flex;
//                         flex-direction: column;
//                         width: 100%;
//                         gap: 0.625rem;
//                         padding: 0 2.5rem;
//                     }
                    
//                     .third_column .assessment_results .results_header {
//                         display: flex;
//                         gap: 0.5rem;
//                         height: 1.875rem;
//                         font-size: 0.875rem;
//                         font-weight: 600;
//                         margin-bottom: 0.625rem;
//                     }
                    
//                     .third_column .assessment_results .section_title {
//                         font-size: 0.75rem;
//                         font-weight: 600;
//                         color: #333;
//                         margin-bottom: 0.5rem;
//                         padding-bottom: 0.25rem;
//                         border-bottom: 1px solid #e2e1e0;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary {
//                         display: grid;
//                         grid-template-columns: 1fr 1fr 1fr 1fr;
//                         gap: 0.75rem;
//                         margin-bottom: 1rem;
//                         padding: 1.25rem 2.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card {
//                         background: white;
//                         border: 1px solid #e2e1e0;
//                         border-radius: 0.5rem;
//                         padding: 0.75rem;
//                         text-align: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card .summary_label {
//                         font-size: 0.6875rem;
//                         color: #666;
//                         margin-bottom: 0.25rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card .summary_value {
//                         font-size: 0.875rem;
//                         font-weight: 600;
//                         color: #333;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card .summary_value.credit_score {
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card .summary_value.credit_rating {
//                         color: #3b82f6;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card .summary_value.approval_status.approved {
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_summary .summary_card .summary_value.approval_status.rejected {
//                         color: #ef4444;
//                     }
                    
//                     .third_column .assessment_results .assessment_details {
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.625rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section {
//                         margin-bottom: 1rem;
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.625rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_grid {
//                         display: grid;
//                         grid-template-columns: 1fr 2fr;
//                         padding: 1.25rem 2.5rem;
//                         gap: 1.25rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_grid .credit_score_graph_container {
//                         display: block;
//                         flex-direction: column;
//                         justify-content: center;
//                         align-items: center;
//                         gap: 0.5rem;
//                         width: 17.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_graph_container #credit_score_chart_container {
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                         padding-bottom: 1.5625rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_graph {
//                         display: grid;
//                         grid-template-rows: 1fr auto;
//                         gap: 1.25rem;
//                         position: relative;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_graph #credit_score_chart_container {
//                         width: 8.75rem;
//                         height: 8.75rem;
//                         position: relative;
//                         border-radius: 50%;
//                         box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
//                         background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
//                         backdrop-filter: blur(10px);
//                         transition: all 0.3s ease;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .donut {
//                         width: 120px;
//                         height: 120px;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .donut-bg {
//                         fill: none;
//                         stroke: #f8f8f8;
//                         stroke-width: 2.5;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .donut-ring {
//                         fill: none;
//                         stroke: #10b981;
//                         stroke-width: 2.5;
//                         transform: rotate(-90deg);
//                         transform-origin: 50% 50%;
//                         transition: stroke-dasharray 0.4s ease;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .donut-label {
//                         font-size: 8px;
//                         font-weight: 700;
//                         fill: #333;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_detail {
//                         font-size: 0.75rem;
//                         font-weight: 600;
//                         color: #333;
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_discription_container {
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_discription {
//                         color: #333;
//                         font-size: 0.6875rem;
//                         line-height: 1.6;
//                         width: 80%;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_discription .description_main {
//                         font-size: 0.75rem;
//                         font-weight: 600;
//                         color: #333;
//                         margin-bottom: 0.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_discription .description_main strong {
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .credit_score_discription .description_sub {
//                         font-size: 0.625rem;
//                         color: #666;
//                         line-height: 1.4;
//                     }
                    
//                     /* 위험도 분석 스타일 (실제 CSS 복사) */
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_grid {
//                         display: grid;
//                         grid-template-columns: 1fr 2fr;
//                         gap: 0.75rem;
//                         padding: 0.625rem 2.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_grid .risk_analysis_graph_container {
//                         display: flex;
//                         justify-content: center;
//                         align-items: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_graph {
//                         display: grid;
//                         grid-template-rows: 1fr auto;
//                         gap: 1.25rem;
//                         position: relative;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_graph #risk_analysis_chart_container {
//                         width: 100%;
//                         height: 12.5rem;
//                         overflow: visible;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_detail {
//                         font-size: 0.75rem;
//                         font-weight: 600;
//                         color: #333;
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription_container {
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription {
//                         color: #333;
//                         font-size: 0.6875rem;
//                         line-height: 1.6;
//                         width: 80%;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription .description_main {
//                         font-size: 0.75rem;
//                         font-weight: 600;
//                         color: #333;
//                         margin-bottom: 0.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription .description_main strong {
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription .description_detail {
//                         font-size: 0.6875rem;
//                         color: #333;
//                         margin-bottom: 0.625rem;
//                         line-height: 1.5;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription .description_benefit {
//                         font-size: 0.625rem;
//                         color: #065e42;
//                         font-weight: 400;
//                         background: rgba(16, 185, 129, 0.1);
//                         padding: 0.5rem 0.75rem;
//                         border-radius: 0.375rem;
//                         margin-bottom: 0.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription .description_benefit strong {
//                         color: #065e42;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .risk_analysis_discription .description_note {
//                         font-size: 0.5625rem;
//                         color: #666;
//                         border-top: 1px solid rgba(102, 102, 102, 0.2);
//                         padding-top: 0.375rem;
//                     }
                    
//                     /* 재무 안정성 지표 스타일 (실제 CSS 복사) */
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid {
//                         display: grid;
//                         grid-template-columns: 1fr 1fr 1fr;
//                         gap: 0.5rem;
//                         padding: 1.25rem 2.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item {
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.25rem;
//                         padding: 0.5rem;
//                         background: #f8f8f8;
//                         border-radius: 0.25rem;
//                         font-size: 0.6875rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item .detail_header {
//                         display: flex;
//                         justify-content: space-between;
//                         align-items: center;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item .detail_label {
//                         color: #666;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item .detail_value {
//                         color: #333;
//                         font-weight: 600;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item .progress_bar {
//                         width: 100%;
//                         height: 0.25rem;
//                         background: rgba(102, 102, 102, 0.2);
//                         border-radius: 0.125rem;
//                         overflow: hidden;
//                         position: relative;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item .progress_bar .progress_fill {
//                         height: 100%;
//                         background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
//                         border-radius: 0.125rem;
//                         transition: width 0.3s ease;
//                         position: relative;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .detail_grid .detail_item .progress_bar .progress_fill::after {
//                         content: "";
//                         position: absolute;
//                         top: 0;
//                         left: 0;
//                         right: 0;
//                         bottom: 0;
//                         background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
//                         border-radius: 0.125rem;
//                     }
                    
//                     /* AI 분석 보고서 스타일 */
//                     .third_column .assessment_results .assessment_details .detail_section .ai_analysis_content {
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.625rem;
//                         padding: 0 2.5rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .analysis_summary {
//                         display: flex;
//                         align-items: center;
//                         gap: 0.75rem;
//                         padding: 1rem;
//                         background: white;
//                         border: 1px solid #e2e1e0;
//                         border-radius: 0.5rem;
//                         margin-bottom: 1rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .summary_icon {
//                         font-size: 1.25rem;
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .summary_text {
//                         flex: 1;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .summary_title {
//                         font-size: 0.875rem;
//                         font-weight: bold;
//                         color: #333;
//                         margin-bottom: 0.25rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .summary_description {
//                         font-size: 0.75rem;
//                         color: #666;
//                         line-height: 1.4;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .analysis_details {
//                         display: grid;
//                         grid-template-columns: 1fr 1fr;
//                         gap: 0.75rem;
//                         margin-bottom: 1rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .analysis_item {
//                         background: white;
//                         border: 1px solid #e2e1e0;
//                         border-radius: 0.5rem;
//                         padding: 0.75rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .analysis_item_title {
//                         font-size: 0.6875rem;
//                         font-weight: 600;
//                         color: #333;
//                         margin-bottom: 0.25rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .analysis_item_content {
//                         font-size: 0.625rem;
//                         color: #666;
//                         line-height: 1.3;
//                     }
                    
//                     /* 추천 사항 및 주의사항 스타일 */
//                     .third_column .assessment_results .assessment_details .detail_section .analysis_recommendations {
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.75rem;
//                         margin-top: 1rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_section {
//                         background: white;
//                         border: 1px solid #e2e1e0;
//                         border-radius: 0.5rem;
//                         padding: 0.75rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .section_header {
//                         display: flex;
//                         align-items: center;
//                         gap: 0.5rem;
//                         font-size: 0.75rem;
//                         font-weight: bold;
//                         color: #333;
//                         margin-bottom: 0.5rem;
//                         padding-bottom: 0.25rem;
//                         border-bottom: 1px solid #e2e1e0;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .section_header i {
//                         font-size: 0.875rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .section_header i.bi-star-fill {
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .section_header i.bi-exclamation-triangle-fill {
//                         color: #f59e0b;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_list {
//                         display: flex;
//                         flex-direction: column;
//                         gap: 0.375rem;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_item {
//                         display: flex;
//                         align-items: flex-start;
//                         gap: 0.5rem;
//                         padding: 0.375rem 0;
//                         font-size: 0.625rem;
//                         color: #333;
//                         line-height: 1.3;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_item i {
//                         font-size: 0.75rem;
//                         margin-top: 0.125rem;
//                         flex-shrink: 0;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_item i.bi-check-circle {
//                         color: #10b981;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_item.warning i.bi-exclamation-circle {
//                         color: #f59e0b;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_item span {
//                         flex: 1;
//                     }
                    
//                     /* 주의사항 섹션 특별 스타일 */
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_section:has(.section_header i.bi-exclamation-triangle-fill) {
//                         background: #fef3c7;
//                         border-color: #fde68a;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_section:has(.section_header i.bi-exclamation-triangle-fill) .section_header {
//                         color: #92400e;
//                     }
                    
//                     .third_column .assessment_results .assessment_details .detail_section .recommendation_section:has(.section_header i.bi-exclamation-triangle-fill) .section_header i {
//                         color: #f59e0b;
//                     }
                    
//                     /* Plotly 차트 모드바 숨기기 */
//                     .modebar {
//                         display: none !important;
//                     }
                    
//                     /* PDF 푸터 */
//                     .pdf-footer {
//                         margin-top: 40px;
//                         padding-top: 20px;
//                         border-top: 1px solid #e0e0e0;
//                         text-align: center;
//                         font-size: 12px;
//                         color: #666;
//                     }
                    
//                     @media print {
//                         body {
//                             margin: 0;
//                             padding: 15px;
//                         }
//                     }
//                 </style>
//                     </head>
//                     <body>
//                 <div class="pdf-header">
//                     <div class="pdf-title">KB국민은행 여신심사 보고서</div>
//                     <div class="pdf-subtitle">${customerName} 고객 신용평가 결과</div>
//                     <div class="pdf-subtitle">생성일: ${dateString}</div>
//                         </div>
                        
//                 <div class="third_column">
//                             ${thirdColumnHTML}
//                         </div>
                        
//                 <div class="pdf-footer">
//                             <p>본 보고서는 KB국민은행 여신심사 시스템에 의해 자동 생성되었습니다.</p>
//                             <p>문의사항이 있으시면 담당자에게 연락바랍니다.</p>
//                         </div>
//             </body>
//             </html>
//         `;
        
//         // 실제 PDF 생성
//         const fileName = `${customerName}_여신심사보고서.pdf`;
        
//         // HTML 파일 생성 (안정적인 방법)
//         const generateHTML = async () => {
//             try {
//                 console.log('HTML 보고서 생성 시작...');
                
//                 // Blob URL로 HTML 파일 생성
//                 const htmlBlob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
//                 const htmlUrl = URL.createObjectURL(htmlBlob);
                
//                 console.log('HTML 보고서 생성 완료:', htmlUrl);
//                 return htmlUrl;
                
//             } catch (error) {
//                 console.error('HTML 보고서 생성 오류:', error);
//                 throw error;
//             }
//         };
        
//         // HTML 생성 실행
//         const htmlUrl = await generateHTML();
        
//         // 자동 다운로드 트리거
//         setTimeout(() => {
//             const downloadLink = document.createElement('a');
//             downloadLink.href = htmlUrl;
//             downloadLink.download = fileName.replace('.pdf', '.html');
//             downloadLink.click();
            
//             console.log('HTML 보고서 다운로드 완료:', fileName);
//             console.log('다운로드 경로: C:\\Users\\Playdata2\\Downloads');
            
//             // 성공 메시지
//             alert(`${fileName.replace('.pdf', '.html')} 파일이 다운로드되었습니다.\n\nPDF로 저장하려면:\n1. 다운로드된 HTML 파일을 브라우저에서 열기\n2. Ctrl+P (인쇄) 누르기\n3. "PDF로 저장" 선택\n4. 파일명을 ${fileName}으로 변경`);
            
//             // 보고서 목록에 추가
//             if (typeof window.reportsColumn !== 'undefined') {
//                 const reportData = {
//                     name: customerName,
//                     date: dateString,
//                     filePath: htmlUrl,
//                     url: htmlUrl
//                 };
//                 window.reportsColumn.addReport(reportData);
//                 console.log('보고서 목록에 추가됨:', reportData);
//             }
            
//             window.isGeneratingReport = false;
//                                     }, 1000);
        
//     } catch (error) {
//         console.error('보고서 생성 오류:', error);
//         alert('보고서 생성 중 오류가 발생했습니다: ' + error.message);
//         window.isGeneratingReport = false;
//     }
// };

// console.log('=== createAndSaveReport 함수 정의 완료 (전역) ===');

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('=== credit_assessment.js DOMContentLoaded ===');
//     });