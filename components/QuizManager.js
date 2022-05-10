import sampleSize from "lodash/sampleSize";
import shuffle from "lodash/shuffle";

import { Timer } from "./Timer";
import confetti from "canvas-confetti";
import questionData from "../quiz/data/questions.json";

const QUESTION_TIME = 10000;

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
    this.timerPate = elements.timerPate;

    // On met chacun des éléments dans un tableau histoire de pouvoir faire une comparaison
    // dans la fonction handleInterface(). Il y a probablement une façon plus élégante de faire ça.
    this.elements = [
      elements.startButton,
      elements.restartButton,
      elements.questionContainer,
      elements.answersContainer,
      elements.answerPanelContainer,
      elements.startCountdownContainer,
      elements.timerContainer,
      elements.timerPate
    ];

    // Questions
    this.numQuestions = numQuestions;
    this.questions = sampleSize(questionData, this.numQuestions);
    this.questionIndex = 0;

    // Question Timer
    this.countdown = QUESTION_TIME;
    this.timeRemaining = QUESTION_TIME;
    this.timer = new Timer();
    this.timerContainer.innerHTML = "";
    this.timerText = document.createElement("p");
    this.timerContainer.appendChild(this.timerText);

    // Score
    this.score = 0;

    // State
    // Documentation Symbol:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
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


      // C'est ici qu'on règle le temps de countdown de départ. 3000 = 3 secondes.
      if (startCountdown.getTime() >= 3750) {
        this.showQuestion();
        clearInterval(startTimer);
      }
      if(this.startCountdownContainer.innerHTML.indexOf("0") !== -1) {
      this.startCountdownContainer.innerHTML = "Pâté!"
      };
    }, 10);

    this.handleInterface();
  }

  showQuestion() {
    this.state = this.Asking;

    this.timer.reset();
    this.timer.start();

    const question = this.questions[this.questionIndex];
    this.questionContainer.innerHTML = `${question.question}`;

    let questionCountdown = setInterval(() => {
      // Cette petite formule affiche le temps restant pour la question en secondes.

      this.timerText.innerHTML = `${Math.round(
        this.timeRemaining / 1000
      )}`;

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

    // À chaque nouvelle question on reset la couleur des box-shadows
    // (variable css --shadow-color). Si on ne fauit pas ça, la couleur reste
    // rouge si la réponse est fausse et qu'on passeà la question suivante.
    document
      .querySelector(":root")
      .style.setProperty("--shadow-color", " 155deg 100% 28%");

    this.showAnswers();
  }

  showAnswers() {
    const answers = shuffle(
      this.questions[this.questionIndex].answers
    );

    this.answersContainer.innerHTML = "";

    // C'est ici qu'on créé les boutons de réponse.
    // On utilise une boucle pour créer autant de boutons qu'il y a de réponses.
    // Les éléments sont créés directement dans le js.
    answers.forEach((answer) => {
      let answerElement = document.createElement("div");
      answerElement.classList.add("button");
      answerElement.innerHTML = answer.text;

      // On ajoute l'élément créé comme enfant du "answers container" qui se trouve,
      // lui, dans le HTML.
      this.answersContainer.appendChild(answerElement);

      answerElement.addEventListener("click", () => {
        if (this.state !== this.Answered) {
          this.validateAnswer(answerElement.innerHTML, answerElement);
        }
      });
    });
    this.handleInterface();
  }

  showAnswerSequence(answer, index) {
    console.log(answer + "/" + index);

    let scale = 1.2 + 0.2 * index;

    let element = document.createElement("div");
    element.classList.add("answer-archive");

    element.style.transform = `scale(${scale})`;

    if (answer === 1) {
      element.style.border = "1px solid var(--vert)";
    } else {
      element.style.border = "1px solid var(--rose)";
    }
    this.timerContainer.appendChild(element);
  }

  validateAnswer(answer, el) {
    this.state = this.Answered;

    this.timer.stop();
    this.timer.reset();

    if (
      this.questions[this.questionIndex].answers.find(
        (a) => a.text === answer
      ).correct
    ) {
      // C'est ici qu'on calcule le score en fonction du temps restant.
      this.score = this.score + 1 * this.timeRemaining;

      // Si la réponse est juste, on ajoute la classe .correct au bouton de réponse.
      el.classList.add("correct");

      this.showAnswerSequence(1, this.questionIndex);

      // On balance des confettis si la réponse est juste.
      // Voici la documentation de la librairie canvas-confetti: https://github.com/catdad/canvas-confetti
      confetti({
        particleCount: 500,
        startVelocity: 50,
        spread: 360,
        colors: ["#009355", "#ffffff"]
      });
    } else {
      this.showAnswerSequence(0, this.questionIndex);

      document
        .querySelector(":root")
        .style.setProperty("--shadow-color", " 0deg 51% 42%");

      // Si la réponse est fausse, on ajoute la classe .wrong au bouton de réponse.
      el.classList.add("wrong");
    }

    this.showAnswerPanel();
  }

  showAnswerPanel() {
    // C'est ici qu'est défini le petit retard entre la validation de la question
    // et l'affichage du panel donnant plus d'informations.
    setTimeout(this.handleInterface.bind(this), 1000);

    // Il faut que l'élément correspondant à answerPanelContainer aie un <h1>, un <p>
    // et un élément avec la classe .button pour que ceci fonctionne. On pourrait
    // rendre ceci plus cohérent avec le reste de la logique de l'app.
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

    // C'est ici qu'on détermine le texte du bouton du panel
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
    // C'est ici que se trouve la logique qui permet de passer à la question
    // suivante, ou mettre fin à la partie.
    this.questionIndex++;

    if (this.questionIndex >= this.questions.length) {
      this.endQuiz();
    } else {
      this.showQuestion();
    }
  }

  endQuiz() {
    this.state = this.Over;

    this.answerSequence = [];

    // On reset la couleur des box-shadows (variable css --shadow-color).
    // Si on ne fait pas ça, la couleur reste rouge si la réponse est fausse et
    // qu'on est passé à l'écran de résultats.
    document
      .querySelector(":root")
      .style.setProperty("--shadow-color", " 155deg 100% 28%");

    this.answersContainer.innerHTML = "";
    this.timerContainer.querySelector("p").innerHTML = "";
    // C'est ici qu'on affiche le texte de l'écran de fin de partie. Le score est
    // calculé dans validateAnswer() et le mot de "félicitations" (ou pas) est
    // défini selon le score final dans la fonction endMessage()
    this.questionContainer.innerHTML = `${this.endMessage()}, vous avez fait ${
      this.score
    } points`;

    let confettiEnd = Date.now() + 1 * 1000;
    let confettiColors = ["#02F58F", "#ffffff"];

    // On balance des confettis quoi qu'il se passe à la fin de la partie.
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
    // À recalibrer selon le ton et les scores possibles dans le jeu.
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
    // C'est ici que se trouve la logique qui permet de changer l'interface
    // en fonction de l'état de l'application.
    // Les éléments nécessaires à chaque phase sont mis dans leur propre tableau.
    // On compare ensuite l'ensemble des éléments au tableau correspondant à chaque phase.
    // Les éléments présents dans les deux reçoivent la classe .visible, les autres la classe .hidden.
    // Il y a probablement un façon plus élégante de faire ça.

    const startingElements = [
      this.startButton,
      this.questionContainer
    ];

    const countdownElements = [this.startCountdownContainer];

    const askingElements = [
      this.questionContainer,
      this.answersContainer,
      this.timerContainer,
      this.timerPate
    ];

    const answeredElements = [
      this.questionContainer,
      this.answersContainer,
      this.timerContainer,
      this.timerPate,
      this.answerPanelContainer
    ];

    const overElements = [
      this.questionContainer,
      this.restartButton,
      this.timerContainer,
      this.timerPate
    ];

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
