import { sampleSize } from "lodash";

import "../css/reset.css";
import "../css/global.css";
import "../css/quiz.css";

const QUESTION_TIME = 10000;

let quiz;
let startButton = document.getElementById("start-quiz");

startButton.addEventListener("click", () => {
  //   On détermine la quantité de questions à afficher dans ces parenthèses.
  quiz = new QuizManager(2);
  quiz.handleInterface();
});

class QuizManager {
  constructor(numQuestions) {
    this.numQuestions = numQuestions;
    this.questions = this.init();
    this.questionIndex = 0;
    this.countdown = QUESTION_TIME;
    this.timeRemaining = QUESTION_TIME;
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
    this.timer.reset();
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
    const scoreContainer = document.querySelector("#score");
    questionContainer.innerHTML = `${question.question}`;
    this.timer = new Timer();
    this.showAnswers();
    this.timer.start();
    let refreshTimer = setInterval(() => {
      this.timeRemaining = this.countdown - this.timer.getTime();
      scoreContainer.innerHTML = `${this.timeRemaining}`;
      if (this.timeRemaining <= 0) {
        this.nextQuestion();
        clearInterval(refreshTimer);
      }
    }, 100);
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
    this.timer.stop();
    if (
      this.questions[this.questionIndex].answers.find(
        (a) => a.text === answer
      ).correct
    ) {
      this.score = this.score + 1 * this.timeRemaining;
      el.classList.add("correct");
    } else {
      el.classList.add("wrong");
    }
    setTimeout(this.nextQuestion.bind(this), 1000);
  }

  handleInterface() {
    const startButton = document.getElementById("start-quiz");
    const scoreContainer = document.querySelector("#score");
    if (this.isRunning === true) {
      startButton.style.display = "none";
      scoreContainer.style.display = "block";
    } else {
      scoreContainer.style.display = "none";
      startButton.style.display = "flex";
      startButton.innerHTML = "Recommencer";
    }
  }

  endQuiz() {
    this.isRunning = false;
    const answerContainer = document.querySelector(
      "#answers-container"
    );
    const questionContainer = document.querySelector(
      "#question-container h1"
    );
    this.timer = null;
    answerContainer.innerHTML = "";
    questionContainer.innerHTML = `Bravo, vous avez fait ${this.score} points`;
    this.handleInterface();
  }
}

class Timer {
  constructor() {
    this.isRunning = false;
    this.startTime = 0;
    this.overallTime = 0;
  }

  _getTimeElapsedSinceLastStart() {
    if (!this.startTime) {
      return 0;
    }

    return Date.now() - this.startTime;
  }

  start() {
    if (this.isRunning) {
      return console.error("Timer is already running");
    }

    this.isRunning = true;

    this.startTime = Date.now();
  }

  stop() {
    if (!this.isRunning) {
      return console.error("Timer is already stopped");
    }
    this.isRunning = false;
    this.overallTime =
      this.overallTime + this._getTimeElapsedSinceLastStart();
  }

  reset() {
    this.overallTime = 0;
    if (this.isRunning) {
      this.startTime = Date.now();
      return;
    }
    this.startTime = 0;
  }

  getTime() {
    if (!this.startTime) {
      return 0;
    }
    if (this.isRunning) {
      return this.overallTime + this._getTimeElapsedSinceLastStart();
    }
    return this.overallTime;
  }
}
