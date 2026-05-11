let currentTopic = "docker";
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let answered = false;

const questionElement = document.getElementById("question");
const resultElement = document.getElementById("result");
const answerInput = document.getElementById("answerInput");
const progressEl = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");

document
  .getElementById("topicSelect")
  .addEventListener("change", (e) => {
    currentTopic = e.target.value;
    currentIndex = 0;
    answered = false;
    loadQuestion();
  });

// Allow submitting with Enter key
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (answered) {
      nextQuestion();
    } else {
      checkAnswer();
    }
  }
});

function loadQuestion() {
  const topicQuestions = questions[currentTopic];
  questionElement.innerText = topicQuestions[currentIndex].question;
  resultElement.innerText = "";
  resultElement.className = "";
  answerInput.value = "";
  answerInput.focus();
  answered = false;
  updateProgress();
}

function checkAnswer() {
  if (answered) return;

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = questions[currentTopic][currentIndex].answer.toLowerCase();

  if (!userAnswer) {
    resultElement.innerHTML = "⚠️ Please type an answer first!";
    resultElement.className = "result-wrong";
    answerInput.classList.add("shake");
    setTimeout(() => answerInput.classList.remove("shake"), 300);
    return;
  }

  answered = true;

  if (userAnswer === correctAnswer) {
    correctCount++;
    resultElement.innerHTML = "✅ Correct! Great job!";
    resultElement.className = "result-correct";
    document.querySelector(".card").classList.add("pop");
    setTimeout(() => document.querySelector(".card").classList.remove("pop"), 300);
  } else {
    wrongCount++;
    resultElement.innerHTML =
      `❌ Wrong! Correct answer: <strong>${questions[currentTopic][currentIndex].answer}</strong>`;
    resultElement.className = "result-wrong";
    answerInput.classList.add("shake");
    setTimeout(() => answerInput.classList.remove("shake"), 300);
  }

  updateScoreBoard();
  updateProgressBar();
}

function nextQuestion() {
  currentIndex++;
  const topicQuestions = questions[currentTopic];

  if (currentIndex >= topicQuestions.length) {
    currentIndex = 0;
  }

  answered = false;
  loadQuestion();
}

function resetScore() {
  correctCount = 0;
  wrongCount = 0;
  updateScoreBoard();
  updateProgressBar();
}

function updateScoreBoard() {
  const total = correctCount + wrongCount;
  const correctPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const wrongPct = total > 0 ? Math.round((wrongCount / total) * 100) : 0;

  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("correctPercent").textContent = `(${correctPct}%)`;
  document.getElementById("wrongPercent").textContent = `(${wrongPct}%)`;
}

function updateProgress() {
  const topicQuestions = questions[currentTopic];
  progressEl.textContent = `Q ${currentIndex + 1} / ${topicQuestions.length}`;
}

function updateProgressBar() {
  const total = correctCount + wrongCount;
  const correctPct = total > 0 ? (correctCount / total) * 100 : 0;
  progressBar.style.width = `${correctPct}%`;
}

// ==========================================
// LEARNING GROWTH DASHBOARD
// ==========================================

let chartType = "bar";
const STORAGE_KEY = "devops_learning_history";

function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveSession() {
  const total = correctCount + wrongCount;
  if (total === 0) {
    alert("Answer at least one question before saving a session!");
    return;
  }

  const history = getHistory();
  const session = {
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    fullDate: new Date().toISOString().split("T")[0],
    correct: correctCount,
    wrong: wrongCount,
    total: total,
    percent: Math.round((correctCount / total) * 100),
    topic: currentTopic
  };

  history.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  // Reset current session scores
  resetScore();
  drawChart();
  updateDashboardStats();
  alert("✅ Session saved to dashboard!");
}

function resetChart() {
  if (!confirm("Are you sure you want to reset all learning history?")) return;
  localStorage.removeItem(STORAGE_KEY);
  drawChart();
  updateDashboardStats();
}

function setChartType(type) {
  chartType = type;
  document.getElementById("barToggle").classList.toggle("active", type === "bar");
  document.getElementById("lineToggle").classList.toggle("active", type === "line");
  drawChart();
}

function drawChart() {
  const canvas = document.getElementById("growthChart");
  const ctx = canvas.getContext("2d");
  const history = getHistory();

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (history.length === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "16px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("No sessions yet. Practice and save sessions to see your growth!", canvas.width / 2, canvas.height / 2);
    return;
  }

  const padding = { top: 30, right: 20, bottom: 50, left: 45 };
  const chartW = canvas.width - padding.left - padding.right;
  const chartH = canvas.height - padding.top - padding.bottom;

  // Show last 15 sessions max
  const data = history.slice(-15);
  const barWidth = Math.min(40, (chartW / data.length) - 10);
  const gap = (chartW - barWidth * data.length) / (data.length + 1);

  // Draw grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(canvas.width - padding.right, y);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "right";
    ctx.fillText(`${100 - i * 25}%`, padding.left - 8, y + 4);
  }

  if (chartType === "bar") {
    // Bar chart
    data.forEach((session, i) => {
      const x = padding.left + gap + i * (barWidth + gap);
      const barH = (session.percent / 100) * chartH;
      const y = padding.top + chartH - barH;

      // Gradient bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barH);
      if (session.percent >= 70) {
        gradient.addColorStop(0, "#2ecc71");
        gradient.addColorStop(1, "#27ae60");
      } else if (session.percent >= 40) {
        gradient.addColorStop(0, "#f39c12");
        gradient.addColorStop(1, "#e67e22");
      } else {
        gradient.addColorStop(0, "#e74c3c");
        gradient.addColorStop(1, "#c0392b");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Percentage on top
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(`${session.percent}%`, x + barWidth / 2, y - 8);

      // Date label
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "10px Segoe UI";
      ctx.fillText(session.date, x + barWidth / 2, canvas.height - padding.bottom + 18);
    });
  } else {
    // Trend line
    const points = data.map((session, i) => {
      const x = padding.left + gap + barWidth / 2 + i * (barWidth + gap);
      const y = padding.top + chartH - (session.percent / 100) * chartH;
      return { x, y, percent: session.percent, date: session.date };
    });

    // Fill area under line
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    areaGradient.addColorStop(0, "rgba(233, 69, 96, 0.3)");
    areaGradient.addColorStop(1, "rgba(233, 69, 96, 0.02)");
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "#e94560";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw dots and labels
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#e94560";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // Percentage label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(`${p.percent}%`, p.x, p.y - 12);

      // Date label
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "10px Segoe UI";
      ctx.fillText(p.date, p.x, canvas.height - padding.bottom + 18);
    });
  }
}

function updateDashboardStats() {
  const history = getHistory();
  const totalSessions = history.length;

  document.getElementById("totalSessions").textContent = totalSessions;

  if (totalSessions === 0) {
    document.getElementById("bestScore").textContent = "0%";
    document.getElementById("avgScore").textContent = "0%";
    document.getElementById("streak").textContent = "0 days";
    return;
  }

  const best = Math.max(...history.map(s => s.percent));
  const avg = Math.round(history.reduce((sum, s) => sum + s.percent, 0) / totalSessions);

  // Calculate streak (consecutive days with sessions)
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDates = [...new Set(history.map(s => s.fullDate))].sort().reverse();
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toISOString().split("T")[0];
    if (uniqueDates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("bestScore").textContent = `${best}%`;
  document.getElementById("avgScore").textContent = `${avg}%`;
  document.getElementById("streak").textContent = `${streak} day${streak !== 1 ? "s" : ""}`;
}

// Initialize
loadQuestion();
updateScoreBoard();
drawChart();
updateDashboardStats();