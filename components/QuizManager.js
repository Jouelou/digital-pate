import { sampleSize } from "lodash";
import { Timer } from "./Timer";

const QUESTION_TIME = 10000;

export class QuizManager {
  constructor(numQuestions, elements) {
    this.startButton = elements.startButton;
    this.questionContainer = elements.questionContainer;
    this.scoreContainer = elements.scoreContainer;
    this.answersContainer = elements.answersContainer;

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
      this.handleInterface();
      this.showQuestion();
    });
  }

  async getQuestions() {
    return fetch("../quiz/data/questions.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const questions = sampleSize(data, this.numQuestions);
        return questions;
      });
  }

  nextQuestion() {
    if(this.isRunning === true) {
      this.timer.reset();
    }
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
    this.questionContainer.innerHTML = `${question.question}`;
    this.timer = new Timer();
    this.showAnswers();
    this.timer.start();
    let refreshTimer = setInterval(() => {
      if (this.isRunning === true) {
        this.timeRemaining = this.countdown - this.timer.getTime();
        this.scoreContainer.innerHTML = `${this.timeRemaining}`;
      } else {
        this.nextQuestion();
        clearInterval(refreshTimer);
      }
    }, 100);
  }

  showAnswers() {
    const answers = this.questions[this.questionIndex].answers;
    this.answersContainer.innerHTML = "";
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
      this.answersContainer.appendChild(answerElement);
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
    if (this.isRunning === true) {
      this.startButton.style.display = "none";
      this.scoreContainer.style.display = "block";
    } else {
      this.scoreContainer.style.display = "none";
      this.startButton.style.display = "flex";
      this.startButton.innerHTML = "Recommencer";
    }
  }

  endQuiz() {
    this.isRunning = false;
    this.timer = null;
    this.answersContainer.innerHTML = "";
    this.questionContainer.innerHTML = `Bravo, vous avez fait ${this.score} points`;
    this.handleInterface();
  }
}
