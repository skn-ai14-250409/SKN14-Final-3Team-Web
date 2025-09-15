// KB국민은행 직원 업무시스템 - 캘린더 JavaScript

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    
    // AJAX로 캘린더 업데이트 (임시로 비활성화)
    // fetch(`/kb_finaIssist/calendar/ajax/?year=${currentYear}&month=${currentMonth}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         updateCalendar(data);
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    
    // 임시로 페이지 새로고침으로 월 변경
    window.location.href = `?year=${currentYear}&month=${currentMonth}`;
}

function updateCalendar(data) {
    const calendarDays = document.getElementById('calendar-days');
    const monthTitle = document.querySelector('.calendar-month');
    
    if (monthTitle) {
        monthTitle.textContent = `${currentYear}년 ${currentMonth}월`;
    }
    
    if (calendarDays) {
        let html = '';
        data.calendar.forEach(week => {
            week.forEach(day => {
                if (day === 0) {
                    html += '<div class="calendar-day empty"></div>';
                } else {
                    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    html += `<div class="calendar-day" data-date="${dateStr}">
                        <span class="day-number">${day}</span>
                    </div>`;
                }
            });
        });
        
        calendarDays.innerHTML = html;
    }
}

// 날짜 클릭 이벤트
document.addEventListener('click', function(e) {
    if (e.target.closest('.calendar-day') && !e.target.closest('.calendar-day').classList.contains('empty')) {
        const date = e.target.closest('.calendar-day').dataset.date;
        const title = prompt('새 일정을 입력하세요:');
        if (title) {
            // 여기서 서버에 이벤트 저장 로직 추가
            console.log('새 이벤트:', title, date);
            alert(`일정이 추가되었습니다: ${title} (${date})`);
        }
    }
});

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar JavaScript loaded');
});
