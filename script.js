let currentTopic = "docker";
let currentIndex = 0;

const questionElement = document.getElementById("question");
const resultElement = document.getElementById("result");

document
  .getElementById("topicSelect")
  .addEventListener("change", (e) => {
    currentTopic = e.target.value;
    currentIndex = 0;
    loadQuestion();
  });

function loadQuestion() {
  questionElement.innerText =
    questions[currentTopic][currentIndex].question;

  resultElement.innerText = "";
  document.getElementById("answerInput").value = "";
}

function checkAnswer() {
  const userAnswer =
    document.getElementById("answerInput")
      .value
      .trim();

  const correctAnswer =
    questions[currentTopic][currentIndex].answer;

  if (userAnswer === correctAnswer) {
    resultElement.innerHTML = "✅ Correct";
  } else {
    resultElement.innerHTML =
      `❌ Wrong. Correct Answer: ${correctAnswer}`;
  }
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex >= questions[currentTopic].length) {
    currentIndex = 0;
  }

  loadQuestion();
}

loadQuestion();