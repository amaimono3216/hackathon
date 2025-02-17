const monthYear = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const pointsDisplay = document.getElementById("points");
const examDateInput = document.getElementById("exam-date");
const daysLeftDisplay = document.getElementById("days-left");

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let studyRecords = {}; // 各日付の勉強データ
let totalPoints = 0; // 獲得ポイント
let examDate = localStorage.getItem("examDate") ? new Date(localStorage.getItem("examDate")) : null;

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

        // 設定した試験日を赤くする
        if (examYear === year && examMonth === month && examDay === i) {
            className += " exam-day";
        }

        daysContainer.innerHTML += `<div class="${className}" onclick="editDay(${year}, ${month}, ${i})">${i}${studyTimeText}</div>`;
    }
}

// 前の月へ移動
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
}

// 次の月へ移動
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
}

// 日付を編集する関数（勉強時間の登録）
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
        pointsDisplay.textContent = totalPoints;
    }

    renderCalendar(currentYear, currentMonth);
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
    renderCalendar(currentYear, currentMonth); // カレンダーを更新
}

// カウントダウンを更新する関数
function updateCountdown() {
    if (!examDate || isNaN(examDate)) {
        daysLeftDisplay.textContent = "-";
        return;
    }

    const today = new Date();
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    daysLeftDisplay.textContent = diffDays > 0 ? diffDays : "試験日が過ぎました";
}

// ページ読み込み時にカレンダーとカウントダウンを更新
window.onload = function() {
    renderCalendar(currentYear, currentMonth);
    updateCountdown();
};

// 目標勉強時間を設定する関数
function setGoalStudyTime() {
    let goal = prompt("目標勉強時間を入力してください（時間単位）");
    if (goal && !isNaN(goal)) {
        localStorage.setItem("goalStudyTime", goal);
        updateStudyProgress();
    }
}

// 勉強進捗を更新する関数
function updateStudyProgress() {
    let totalStudyTime = Object.values(studyRecords).reduce((sum, record) => sum + record.hours, 0);
    let goalStudyTime = localStorage.getItem("goalStudyTime") ? parseInt(localStorage.getItem("goalStudyTime")) : 0;
    let percentage = goalStudyTime ? Math.round((totalStudyTime / goalStudyTime) * 100) : 0;

    // HTMLに表示する部分を追加
    let progressElement = document.createElement("p");
    progressElement.textContent = `合計勉強時間: ${totalStudyTime}時間 / 目標: ${goalStudyTime}時間（${percentage}% 達成）`;
    progressElement.id = "study-progress";
    progressElement.className = "study-progress";

    // 既存の要素を削除して新しい要素を追加
    let existingElement = document.getElementById("study-progress");
    if (existingElement) {
        existingElement.remove();
    }
    document.querySelector(".calendar").appendChild(progressElement);
}

// 試験日設定ボタンの下に目標時間設定ボタンを追加する
function addGoalStudyTimeButton() {
    let button = document.createElement("button");
    button.textContent = "目標勉強時間を設定";
    button.onclick = setGoalStudyTime;
    document.querySelector(".exam-container").appendChild(button);
}

// ページ読み込み時にボタンを追加
window.onload = function() {
    renderCalendar(currentYear, currentMonth);
    updateCountdown();
    addGoalStudyTimeButton();
    updateStudyProgress();
};
