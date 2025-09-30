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
// };

// console.log('=== createAndSaveReport 함수 정의 완료 (전역) ===');
