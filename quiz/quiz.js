import { QuizManager } from "../components/QuizManager";

import "../css/reset.css";
import "../css/global.css";
import "../css/quiz.css";

let elements = {
  // L'élément contenant le bouton "Start"
  startButton: document.querySelector("#start-button"),
  restartButton: document.querySelector("#restart-button"),

  // L'élément dans lequel est affiché la question
  questionContainer: document.querySelector("#question-container h1"),

  // L'élément dans lequel est affiché le score
  timerContainer: document.querySelector("#timer-container"),
  timerPate: document.querySelector("#timer-pate"),
  startCountdownContainer: document.querySelector("#start-countdown-container"),
  // L'élément parent des boutons de réponse
  answersContainer: document.querySelector("#answers-container"),
  answerPanelContainer: document.querySelector("#answer-panel-container"),
  answerPanel: document.querySelector("#answer-panel"),
};

const instaciateQuiz = () => {
  let quiz = new QuizManager(4, elements);
  quiz.startCountdown();
};

elements.startButton.addEventListener("click", instaciateQuiz);
elements.restartButton.addEventListener("click", instaciateQuiz);
window.addEventListener("load", instaciateQuiz);
