import { QuizManager } from "../components/QuizManager";

import "../css/reset.css";
import "../css/global.css";
import "../css/quiz.css";

let quiz;

let elements = {
  // L'élément contenant le bouton "Start"
  startButton: document.querySelector("#start-button"),
  restartButton: document.querySelector("#restart-button"),

  // L'élément dans lequel est affiché la question
  questionContainer: document.querySelector("#question-container h1"),

  // L'élément dans lequel est affiché le score
  scoreContainer: document.querySelector("#score-container"),

  // L'élément parent des boutons de réponse
  answersContainer: document.querySelector("#answers-container")
};

const instaciateQuiz = () => {
  let quiz = new QuizManager(3, elements);
  quiz.init();
}


elements.startButton.addEventListener("click", instaciateQuiz);
elements.restartButton.addEventListener("click", instaciateQuiz);
