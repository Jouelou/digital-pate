import { sampleSize } from "lodash";
import { Timer } from "./Timer";
import questionData from "../quiz/data/questions.json";

const QUESTION_TIME = 3000;

export class QuizManager {
  constructor(numQuestions, elements) {
    this.startButton = elements.startButton;
    this.questionContainer = elements.questionContainer;
    this.scoreContainer = elements.scoreContainer;
    this.answersContainer = elements.answersContainer;

    this.numQuestions = numQuestions;
    this.questions = sampleSize(questionData, this.numQuestions);
    this.questionIndex = 0;
    this.countdown = QUESTION_TIME;
    this.timeRemaining = QUESTION_TIME;
    this.timer = new Timer();

    this.score = 0;

    this.isRunning = true;
    this.questionAnswered = false;
  }

  init() {
    this.handleInterface();
    this.showQuestion();
  }

  // In case we use API

  // init() {
  //   this.getQuestions().then((questions) => {
  //     this.questions = questions;
  //     this.handleInterface();
  //     this.showQuestion();
  //   });
  // }

  // async getQuestions() {
  //   return fetch("../quiz/data/questions.json")
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then((data) => {
  //       const questions = sampleSize(data, this.numQuestions);
  //       return questions;
  //     });
  // }

  showQuestion() {
    this.questionAnswered = false;
    const question = this.questions[this.questionIndex];
    this.questionContainer.innerHTML = `${question.question}`;
    this.showAnswers();
    if (this.questionIndex === 0) {
      this.score = 0;
      this.timer.start();
    }
    let timerInterval = setInterval(() => {
      this.scoreContainer.innerHTML = `${this.timeRemaining}`;
      this.timeRemaining = this.countdown - this.timer.getTime();
      if (this.timeRemaining <= 0) {
        this.timer.stop();
        this.nextQuestion();
        clearInterval(timerInterval);
      } else {
      }
    }, 10);
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

  nextQuestion() {
    if (this.isRunning === true) {
      this.timer.reset();
      this.timer.start();
    }
    this.questionIndex++;
    if (this.questionIndex >= this.questions.length) {
      this.endQuiz();
    } else {
      this.showQuestion();
    }
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
    this.answersContainer.innerHTML = "";
    this.timer.stop();
    this.timer.reset();
    this.questionContainer.innerHTML = `Bravo, vous avez fait ${this.score} points`;
    this.handleInterface();
  }
}
