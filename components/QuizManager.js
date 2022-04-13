import sampleSize from "lodash/sampleSize";
import shuffle from "lodash/shuffle";

import { Timer } from "./Timer";
import confetti from "canvas-confetti";
import questionData from "../quiz/data/questions.json";

const QUESTION_TIME = 20000;

export class QuizManager {
  constructor(numQuestions, elements) {
    // Interface

    this.startButton = elements.startButton;
    this.restartButton = elements.restartButton;
    this.questionContainer = elements.questionContainer;
    this.answersContainer = elements.answersContainer;
    this.answerPanelContainer = elements.answerPanelContainer;
    this.startCountdownContainer = elements.startCountdownContainer;
    this.timerContainer = elements.timerContainer;
    this.elements = [
      elements.startButton,
      elements.restartButton,
      elements.questionContainer,
      elements.answersContainer,
      elements.answerPanelContainer,
      elements.startCountdownContainer,
      elements.timerContainer
    ];

    // Questions
    this.numQuestions = numQuestions;
    this.questions = sampleSize(questionData, this.numQuestions);
    this.questionIndex = 0;

    // Timers
    this.countdown = QUESTION_TIME;
    this.timeRemaining = QUESTION_TIME;
    this.timer = new Timer();

    // Score
    this.score = 0;

    // State
    this.Starting = Symbol("Starting");
    this.Countdown = Symbol("Countdown");
    this.Asking = Symbol("Asking");
    this.Answered = Symbol("Answered");
    this.Over = Symbol("Over");

    this.state = this.Starting;
  }

  startCountdown() {
    this.state = this.Countdown;
    let startCountdown = new Timer();
    startCountdown.start();

    let startTimer = setInterval(() => {
      this.startCountdownContainer.innerHTML = Math.abs(
        Math.ceil(startCountdown.getTime() / 1000 - 4)
      );
      if (startCountdown.getTime() >= 3000) {
        this.showQuestion();
        clearInterval(startTimer);
      }
    }, 10);
    this.handleInterface();
  }

  showQuestion() {
    this.state = this.Asking;

    if (!this.timer.isRunning) {
      this.timer.start();
    }

    const question = this.questions[this.questionIndex];
    this.questionContainer.innerHTML = `${question.question}`;

    let questionCountdown = setInterval(() => {
      this.timerContainer.innerHTML = `<p>${Math.round(
        this.timeRemaining / 1000
      )}</p>`;
      this.timeRemaining = this.countdown - this.timer.getTime();
      if (this.state == this.Answered) {
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
    const answers = shuffle(
      this.questions[this.questionIndex].answers
    );

    this.answersContainer.innerHTML = "";

    // C'est ici qu'on créé les boutons de réponse. On utilise une boucle for pour créer autant de boutons qu'il y a de réponses.
    answers.forEach((answer) => {
      let answerElement = document.createElement("div");
      answerElement.classList.add("button");
      answerElement.innerHTML = answer.text;
      // On ajoute l'élément créé comme enfant du "answers container".
      this.answersContainer.appendChild(answerElement);

      answerElement.addEventListener("click", () => {
        if (this.state !== this.Answered) {
          this.state = this.Answered;
          this.validateAnswer(answerElement.innerHTML, answerElement);
        }
      });
    });
    this.handleInterface();
  }

  validateAnswer(answer, el) {
    this.timer.stop();
    this.timer.reset();
    if (
      this.questions[this.questionIndex].answers.find(
        (a) => a.text === answer
      ).correct
    ) {
      // C'est ici qu'on calcule le score en fonction du temps restant.
      this.score = this.score + 1 * this.timeRemaining;
      el.classList.add("correct");
      confetti({
        particleCount: 500,
        startVelocity: 50,
        spread: 360,
        colors: ["#02F58F", "#ffffff"]
      });
    } else {
      el.classList.add("wrong");
    }

    // C'est ici qu'on détermine le petit delay avant de passer à la question suivante. 1000 = 1 seconde.
    this.showAnswerPanel();
  }

  showAnswerPanel() {
    setTimeout(this.handleInterface.bind(this), 1000);
    // this.handleInterface();
    let titleElement = this.answerPanelContainer.querySelector(
      "#answer-panel h1"
    );
    let textElement =
      this.answerPanelContainer.querySelector("#answer-panel p");

    let button = this.answerPanelContainer.querySelector(
      "#answer-panel .button"
    );

    titleElement.innerHTML =
      this.questions[this.questionIndex].panel.title;
    textElement.innerHTML =
      this.questions[this.questionIndex].panel.body;
      console.log(this.questionIndex + "/" + this.numQuestions);

    if (this.questionIndex === this.numQuestions - 1) {
      button.innerHTML = "Voir les résultats";
    } else {
      button.innerHTML = "Prochaine question";

    }

    this.answerPanelContainer
      .querySelector("#answer-panel .button")
      .addEventListener(
        "click",
        () => {
          this.nextQuestion();
        },
        {
          once: true
        }
      );
  }

  nextQuestion() {
    if (this.state === this.Asking) {
      this.timer.reset();
      this.timer.start();
    }
    this.questionIndex++;
    console.log(this.questionIndex);

    if (this.questionIndex >= this.questions.length) {
      this.endQuiz();
    } else {
      this.showQuestion();
    }
  }

  endQuiz() {
    this.state = this.Over;

    this.answersContainer.innerHTML = "";
    this.questionContainer.innerHTML = `${this.endMessage()}, vous avez fait ${
      this.score
    } points`;

    let confettiEnd = Date.now() + 1 * 1000;
    let confettiColors = ["#02F58F", "#ffffff"];

    const launchConfetti = () => {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: confettiColors
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: confettiColors
      });
      if (confettiEnd > Date.now()) {
        requestAnimationFrame(launchConfetti);
      }
    };

    launchConfetti();
    this.handleInterface();
  }

  endMessage() {
    let message;
    if (this.score < 1000) {
      message = "Monstre nul";
    } else if (this.score > 2000 && this.score < 5000) {
      message = "Joli joli";
    } else if (this.score > 5000) {
      message = "'croyable";
    }
    return message;
  }

  handleInterface() {
    console.log(this.state);

    const startingElements = [
      this.startButton,
      this.questionContainer
    ];

    const countdownElements = [this.startCountdownContainer];

    const askingElements = [
      this.questionContainer,
      this.answersContainer,
      this.timerContainer
    ];

    const answeredElements = [
      this.questionContainer,
      this.answersContainer,
      this.timerContainer,
      this.answerPanelContainer
    ];

    const overElements = [this.questionContainer, this.restartButton];

    switch (this.state) {
      case this.Starting:
        toggleStateElement(this.elements, startingElements);
        break;

      case this.Countdown:
        toggleStateElement(this.elements, countdownElements);
        break;

      case this.Asking:
        toggleStateElement(this.elements, askingElements);
        break;

      case this.Answered:
        toggleStateElement(this.elements, answeredElements);
        break;

      case this.Over:
        toggleStateElement(this.elements, overElements);
        break;
    }

    function toggleStateElement(elements, stateElements) {
      elements.forEach((el) => {
        if (stateElements.includes(el)) {
          el.classList.remove("hidden");
          el.classList.add("visible");
        } else {
          el.classList.remove("visible");
          el.classList.add("hidden");
        }
      });
    }
  }
}
