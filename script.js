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

loadQuestion();
updateScoreBoard();