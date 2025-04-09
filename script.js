let isRunning = false;
let isFocus = true;
let timer;
let timeLeft = 25 * 60;
let sessionCount = 0;
let sessionStartTime = null;

const timerLabel = document.getElementById("timer-label");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const modeBtn = document.getElementById("mode-btn");
const sessionText = document.getElementById("session-count");
const quote = document.getElementById("quote");
const focusTimeInput = document.getElementById("focus-time");
const breakTimeInput = document.getElementById("break-time");
const historyBody = document.getElementById("history-body");
const exportBtn = document.getElementById("export-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// Quotes theo trạng thái
const quotesByState = {
  focus_start: [
    "You got this! 💪",
    "Time to focus and crush your goals! 🎯",
    "Let's make every minute count! ⏱️",
    "Your future self will thank you for this! 🌟",
    "Small steps, big progress! 🚀"
  ],
  break_start: [
    "Time for a well-deserved break! 🌿",
    "Stretch it out and recharge! 🔋",
    "Take a deep breath and relax! 😌",
    "Your brain needs a little rest! 🧠",
    "Short breaks lead to better focus! 🌈"
  ],
  complete_session: [
    "One session down, many more to go! 🎉",
    "You're building momentum! Keep it up! 🔥",
    "Every session brings you closer to your goals! 🎯",
    "Consistency is your superpower! 💫",
    "You're doing great! Keep the momentum! 🌟"
  ],
  tired: [
    "One step at a time, you've got this! 🐢",
    "Even small progress is still progress! 🌱",
    "Rest when you need to, but don't give up! 💪",
    "Your future self will thank you for pushing through! 🌅",
    "Remember why you started! 🎯"
  ]
};

function getRandomQuote(category) {
  const quotes = quotesByState[category];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function updateTimeDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getFocusTime() {
  return parseInt(focusTimeInput.value) || 25;
}

function getBreakTime() {
  return parseInt(breakTimeInput.value) || 5;
}

function updateQuote(category) {
  quote.textContent = getRandomQuote(category);
}

// Hàm lưu lịch sử Pomodoro
function savePomodoroSession() {
  if (!sessionStartTime) return;
  
  const endTime = new Date();
  const duration = Math.floor((endTime - sessionStartTime) / 1000 / 60); // Thời gian tính bằng phút
  
  // Lấy ngày hiện tại dưới dạng YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Lấy lịch sử hiện tại từ localStorage
  let history = JSON.parse(localStorage.getItem('pomodoroHistory')) || {};
  
  // Nếu chưa có dữ liệu cho ngày hôm nay, tạo mới
  if (!history[today]) {
    history[today] = {
      sessions: 1,
      totalMinutes: duration
    };
  } else {
    // Cập nhật dữ liệu cho ngày hôm nay
    history[today].sessions += 1;
    history[today].totalMinutes += duration;
  }
  
  // Lưu lại vào localStorage
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
  
  // Cập nhật hiển thị lịch sử
  displayHistory();
  
  // Reset sessionStartTime
  sessionStartTime = null;
}

// Hàm hiển thị lịch sử Pomodoro
function displayHistory() {
  // Xóa nội dung hiện tại
  historyBody.innerHTML = '';
  
  // Lấy lịch sử từ localStorage
  const history = JSON.parse(localStorage.getItem('pomodoroHistory')) || {};
  
  // Sắp xếp các ngày theo thứ tự giảm dần (mới nhất lên đầu)
  const sortedDates = Object.keys(history).sort().reverse();
  
  // Hiển thị tối đa 10 ngày gần nhất
  const recentDates = sortedDates.slice(0, 10);
  
  if (recentDates.length === 0) {
    // Nếu không có lịch sử, hiển thị thông báo
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3" style="text-align: center;">Chưa có dữ liệu</td>';
    historyBody.appendChild(row);
    return;
  }
  
  // Thêm từng dòng vào bảng
  recentDates.forEach(date => {
    const row = document.createElement('tr');
    const data = history[date];
    
    // Định dạng ngày từ YYYY-MM-DD thành DD/MM/YYYY
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${data.sessions}</td>
      <td>${data.totalMinutes} phút</td>
    `;
    
    historyBody.appendChild(row);
  });
}

// Hàm xuất lịch sử ra file CSV
function exportToCSV() {
  const history = JSON.parse(localStorage.getItem('pomodoroHistory')) || {};
  const sortedDates = Object.keys(history).sort().reverse();
  
  if (sortedDates.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }
  
  // Tạo nội dung CSV
  let csvContent = 'Ngày,Số phiên,Tổng thời gian (phút)\n';
  
  sortedDates.forEach(date => {
    const data = history[date];
    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    csvContent += `${formattedDate},${data.sessions},${data.totalMinutes}\n`;
  });
  
  // Tạo blob và link tải xuống
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pomodoro-history-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Hàm xóa lịch sử
function clearHistory() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
    localStorage.removeItem('pomodoroHistory');
    displayHistory();
    alert('Đã xóa lịch sử thành công!');
  }
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  startBtn.textContent = "⏸ Pause";
  
  // Lưu thời điểm bắt đầu session
  if (isFocus && !sessionStartTime) {
    sessionStartTime = new Date();
  }
  
  // Hiển thị quote khi bắt đầu focus
  if (isFocus) {
    updateQuote("focus_start");
  }
  
  timer = setInterval(() => {
    timeLeft--;
    updateTimeDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      isFocus = !isFocus;
      timeLeft = isFocus ? getFocusTime() * 60 : getBreakTime() * 60;
      timerLabel.textContent = isFocus ? "Focus Time" : "Break Time";
      
      if (isFocus) {
        sessionCount++;
        sessionText.textContent = sessionCount;
        // Hiển thị quote khi hoàn thành một phiên
        updateQuote("complete_session");
        
        // Lưu lịch sử khi hoàn thành một phiên focus
        savePomodoroSession();
      } else {
        // Hiển thị quote khi bắt đầu nghỉ
        updateQuote("break_start");
      }
      
      startBtn.textContent = "▶ Start";

      setTimeout(startTimer, 2000); // Auto start next round
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = isFocus ? getFocusTime() * 60 : getBreakTime() * 60;
  updateTimeDisplay();
  startBtn.textContent = "▶ Start";
  
  // Hiển thị quote phù hợp khi reset
  if (isFocus) {
    updateQuote("focus_start");
  } else {
    updateQuote("break_start");
  }
  
  // Reset sessionStartTime nếu đang trong phiên focus
  if (isFocus) {
    sessionStartTime = null;
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

startBtn.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    startBtn.textContent = "▶ Start";
  } else {
    timeLeft = isFocus ? getFocusTime() * 60 : getBreakTime() * 60;
    updateTimeDisplay();
    startTimer();
  }
});

resetBtn.addEventListener("click", resetTimer);
modeBtn.addEventListener("click", toggleDarkMode);
exportBtn.addEventListener("click", exportToCSV);
clearHistoryBtn.addEventListener("click", clearHistory);

// Initialize
updateTimeDisplay();
updateQuote("focus_start");
displayHistory(); 