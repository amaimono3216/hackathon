const monthYear = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const pointsDisplay = document.getElementById("points");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let studyRecords = {}; // 各日付の勉強データ
let totalPoints = 0; // 獲得ポイント

function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    monthYear.textContent = `${year}年 ${month + 1}月`;
    daysContainer.innerHTML = "";
    
    for (let i = 1; i <= lastDate; i++) {
        let className = "date";
        let studyTimeText = "";
        let key = `${year}-${month}-${i}`;
        
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            className += " today";
        }
        if (studyRecords[key]) {
            let hours = studyRecords[key].hours;
            className += ` study${Math.min(hours, 12)}`;
            studyTimeText = `<div class='study-time'>${hours}時間</div>`;
        }
        daysContainer.innerHTML += `<div class="${className}" onclick="editDay(${year}, ${month}, ${i})">${i}${studyTimeText}</div>`;
    }
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
}

function editDay(year, month, day) {
    let key = `${year}-${month}-${day}`;
    let previousPoints = studyRecords[key]?.points || 0;
    
    let hours = prompt("勉強時間を入力 (最大12時間)", studyRecords[key]?.hours || "");
    if (hours !== null && hours !== "") {
        let parsedHours = Math.min(parseInt(hours), 12);
        let newPoints = parsedHours * 2;
        
        // ポイントの増減を反映
        totalPoints = totalPoints - previousPoints + newPoints;

        studyRecords[key] = { hours: parsedHours, points: newPoints };
        pointsDisplay.textContent = totalPoints; // ポイント更新
    }

    renderCalendar(currentYear, currentMonth);
}

renderCalendar(currentYear, currentMonth);
