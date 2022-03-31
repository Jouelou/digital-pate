import { QuizManager } from "../components/QuizManager";

import "../css/reset.css";
import "../css/global.css";
import "../css/quiz.css";

let elements = {
  // L'élément contenant le bouton "Start" et "Recommencer"
  startButton: document.querySelector("#start-button"),

  // L'élément dans lequel est affiché la question
  questionContainer: document.querySelector("#question-container h1"),

  // L'élément dans lequel est affiché le score
  scoreContainer: document.querySelector("#score"),

  // L'élément parent des boutons de réponse
  answersContainer: document.querySelector("#answers-container"),

}

elements.startButton.addEventListener("click", () => {
  //  On détermine la quantité de questions à afficher dans ces parenthèses.
  //  On passe également l'objet référançant les éléments qui seront utilisés dans le Quiz.
  let quiz = new QuizManager(2, elements);
});