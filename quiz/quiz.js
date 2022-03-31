import { sampleSize } from "lodash";

import "../css/reset.css";
import "../css/global.css";
import "../css/quiz.css";

let quiz;

let startButton = document.getElementById("start-quiz");

startButton.addEventListener("click", () => {
  //   On détermine la quantité de questions à afficher dans ces parenthèses.
  quiz = new QuizManager(5);
  handleButtons();
});

const handleButtons = () => {
  console.log(quiz.isRunning);
  if (quiz.isRunning === true) {
    startButton.style.display = "none";
  }
};

class QuizManager {
  constructor(numQuestions) {
    this.numQuestions = numQuestions;
    this.questions = this.init();
    this.questionIndex = 0;
    this.score = 0;
    this.timer = null;
    this.isRunning = true;
    this.questionAnswered = false;
  }

  init() {
    this.getQuestions().then((questions) => {
      this.questions = questions;
      this.showQuestion();
    });
  }

  async getQuestions() {
    return fetch("./data/questions.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const questions = sampleSize(data, this.numQuestions);
        return questions;
      });
  }

  nextQuestion() {
    this.questionIndex++;
    if (this.questionIndex >= this.questions.length) {
      this.endQuiz();
    } else {
      this.showQuestion();
    }
  }

  showQuestion() {
      this.questionAnswered = false;
    const question = this.questions[this.questionIndex];
    const questionContainer = document.querySelector(
      "#question-container h1"
    );
    questionContainer.innerHTML = question.question;
    this.showAnswers();
  }

  showAnswers() {
    const answers = this.questions[this.questionIndex].answers;
    const answerContainer = document.querySelector(
      "#answers-container"
    );
    answerContainer.innerHTML = "";
    answers.forEach((answer) => {
      let answerElement = document.createElement("div");
      answerElement.innerHTML = answer.text;
      answerElement.classList.add("button");
      answerElement.addEventListener("click", () => {
        if (!this.questionAnswered) {
          this.validateAnswer(answerElement.innerHTML, answerElement);
          this.questionAnswered = true;
        }
      });
      answerContainer.appendChild(answerElement);
    });
  }

  validateAnswer(answer, el) {
    if (
      this.questions[this.questionIndex].answers.find(
        (a) => a.text === answer
      ).correct
    ) {
      this.score++;
      el.classList.add("correct");
    } else {
      el.classList.add("wrong");
    }
    setTimeout(this.nextQuestion.bind(this), 1000);
  }

  endQuiz() {
    this.isRunning = false;
    const answerContainer = document.querySelector(
      "#answers-container"
    );
    const questionContainer = document.querySelector(
      "#question-container h1"
    );
    answerContainer.innerHTML = "";
    questionContainer.innerHTML = "Game Over";
  }
}
