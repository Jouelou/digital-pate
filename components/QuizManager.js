import { sampleSize } from "lodash";
import { Timer } from "./Timer";
import questionData from "../quiz/data/questions.json";

const QUESTION_TIME = 2000;

export class QuizManager {
  constructor(numQuestions, elements) {
    this.startButton = elements.startButton;
    this.restartButton = elements.restartButton;
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

    if (!this.timer.isRunning) {
      this.timer.start();
    }

    const question = this.questions[this.questionIndex];
    this.questionContainer.innerHTML = `${question.question}`;

    let questionCountdown = setInterval(() => {
      console.log(this.timeRemaining);
      this.scoreContainer.innerHTML = `${this.timeRemaining}`;
      this.timeRemaining = this.countdown - this.timer.getTime();
      if(this.questionAnswered) {
        clearInterval(questionCountdown);
      }
      if (this.timeRemaining <= 0) {
        this.timer.stop();
        this.nextQuestion();
        clearInterval(questionCountdown);
      }
    }, 10);

    this.showAnswers();
  }

  showAnswers() {
    const answers = this.questions[this.questionIndex].answers;

    this.answersContainer.innerHTML = "";

    // C'est ici qu'on créé les boutons de réponse. On utilise une boucle for pour créer autant de boutons qu'il y a de réponses.
    answers.forEach((answer) => {
      let answerElement = document.createElement("div");
      answerElement.classList.add("button");
      answerElement.innerHTML = answer.text;
      // On ajoute l'élément créé comme enfant du "answers container".
      this.answersContainer.appendChild(answerElement);

      answerElement.addEventListener("click", () => {
        if (!this.questionAnswered) {
          this.validateAnswer(answerElement.innerHTML, answerElement);
          this.questionAnswered = true;
        }
      });
    });
  }

  validateAnswer(answer, el) {
    this.timer.stop();

    if (
      this.questions[this.questionIndex].answers.find(
        (a) => a.text === answer
      ).correct
    ) {
      // C'est ici qu'on calcule le score en fonction du temps restant.
      this.score = this.score + 1 * this.timeRemaining;
      el.classList.add("correct");
    } else {
      el.classList.add("wrong");
    }

    // C'est ici qu'on détermine le petit delay avant de passer à la question suivante. 1000 = 1 seconde.
    setTimeout(this.nextQuestion.bind(this), 1000);
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

  handleInterface() {
    if (this.isRunning === true) {
      this.startButton.style.display = "none";
      this.scoreContainer.style.display = "block";
      this.restartButton.style.display = "none";
    } else {
      this.scoreContainer.style.display = "none";
      this.restartButton.style.display = "flex";

    }
  }

  endQuiz() {
    this.isRunning = false;
    this.answersContainer.innerHTML = "";
    this.questionContainer.innerHTML = `Bravo, vous avez fait ${this.score} points`;
    this.handleInterface();
  }
}
