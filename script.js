const monthYear = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const pointsDisplay = document.getElementById("points");
const levelDisplay = document.getElementById("level");
const examDateInput = document.getElementById("exam-date");
const daysLeftDisplay = document.getElementById("days-left");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let studyRecords = {};
let totalPoints = 0;
let currentLevel = 1;
let examDate = localStorage.getItem("examDate") ? new Date(localStorage.getItem("examDate")) : null;
let goalStudyTime = localStorage.getItem("goalStudyTime") ? parseInt(localStorage.getItem("goalStudyTime")) : 0;

// カレンダーを描画する関数
function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    monthYear.textContent = `${year}年 ${month + 1}月`;
    daysContainer.innerHTML = "";

    const examYear = examDate ? examDate.getFullYear() : null;
    const examMonth = examDate ? examDate.getMonth() : null;
    const examDay = examDate ? examDate.getDate() : null;

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
        if (examYear === year && examMonth === month && examDay === i) {
            className += " exam-day";
        }

        daysContainer.innerHTML += `<div class="${className}" onclick="editDay(${year}, ${month}, ${i})">${i}${studyTimeText}</div>`;
    }
}

// 日付を編集する関数（勉強時間の登録）
function editDay(year, month, day) {
    let key = `${year}-${month}-${day}`;
    let previousPoints = studyRecords[key]?.points || 0;
    
    let hours = prompt("勉強時間を入力 (最大12時間)", studyRecords[key]?.hours || "");
    if (hours !== null && hours !== "") {
        let parsedHours = Math.min(parseInt(hours), 12);
        let newPoints = parsedHours * 2;
        
        totalPoints = totalPoints - previousPoints + newPoints;
        studyRecords[key] = { hours: parsedHours, points: newPoints };

        pointsDisplay.textContent = totalPoints;

        updateStudyProgress();
        checkLevelUp();
    }

    renderCalendar(currentYear, currentMonth);
}


// 前の月を表示
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
}

// 次の月を表示
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
}



// レベルアップ判定
function checkLevelUp() {
    let newLevel = Math.floor(totalPoints / 100) + 1;
    if (newLevel > currentLevel) {
        alert(`レベルアップ！ 新しいレベル: ${newLevel}`);
        currentLevel = newLevel;
        levelDisplay.textContent = currentLevel;
    }
}

// 試験日を設定する関数
function setExamDate() {
    examDate = new Date(examDateInput.value);
    if (isNaN(examDate)) {
        alert("正しい日付を入力してください");
        return;
    }

    localStorage.setItem("examDate", examDate.toISOString());
    updateCountdown();
    renderCalendar(currentYear, currentMonth);
}

// カウントダウンを更新する関数
function updateCountdown() {
    if (!examDate || isNaN(examDate)) {
        daysLeftDisplay.textContent = "試験日まで - ";
        return;
    }

    const today = new Date();
    const examDayStart = new Date(examDate);
    examDayStart.setHours(0, 0, 0, 0); // 時間をリセットして日付だけ比較

    const diffTime = examDayStart - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        daysLeftDisplay.textContent = "試験日当日です";
    } else if (diffDays > 0) {
        daysLeftDisplay.textContent = `試験まであと ${diffDays}日 `;
    } else {
        daysLeftDisplay.textContent = "試験日が過ぎました";
    }
}

// ページ読み込み時の初期化
window.onload = function() {
    updateCountdown(); // 初期値を適用するために実行
    renderCalendar(currentYear, currentMonth);
    updateStudyProgress();
};

// 目標勉強時間を設定
function setGoalStudyTime() {
    let goal = prompt("目標勉強時間を入力してください（時間単位）");
    if (goal && !isNaN(goal)) {
        localStorage.setItem("goalStudyTime", goal);
        goalStudyTime = parseInt(goal);
        updateStudyProgress();
    }
}

// 勉強進捗を更新
function updateStudyProgress() {
    let totalStudyTime = Object.values(studyRecords).reduce((sum, record) => sum + record.hours, 0);
    let percentage = goalStudyTime ? Math.round((totalStudyTime / goalStudyTime) * 100) : 0;

    let progressElement = document.getElementById("study-progress");
    if (!progressElement) {
        progressElement = document.createElement("p");
        progressElement.id = "study-progress";
        document.querySelector(".calendar").appendChild(progressElement);
    }
    progressElement.textContent = `合計勉強時間: ${totalStudyTime}時間 / 目標: ${goalStudyTime}時間（${percentage}% 達成）`;
}

// ページ読み込み時の初期化
window.onload = function() {
    renderCalendar(currentYear, currentMonth);
    updateCountdown();
    updateStudyProgress();
};
