let countSpan = document.querySelector(".count span");
let countSelect = document.querySelector(".count select");
let bullets = document.querySelector(".bullets");
let BulletsContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let submitdiv = document.querySelector(".submit");
let theResultsContainer = document.querySelector(".results");
let countdownDiv = document.querySelector(".countdown");
let generalButton = document.getElementById("general");
let webButton = document.getElementById("web");
let historyButton = document.getElementById("history");
let sportsButton = document.getElementById("sports");
let categorySpan = document.querySelector(".category span");
let categorysDiv = document.querySelector(".categorys");
let correctedAnswersDiv = document.querySelector(".corrected-answers");
let yourWrongAnswers = document.querySelector(".corrected-answers h1");
let allButtons = document.querySelectorAll(".categorys button");

let currentIndex = 0;
let rightAnswers = 0;
let wrongAnswers = 0;
let theChosenAnswer;
let countdownInterval;
let qObject;
let wrongIndices = []; // Array to store indices of incorrectly answered questions

function getQuestions(url) {
  let myRequest = new XMLHttpRequest();

  myRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      qObject = JSON.parse(this.responseText);

      // Shuffle the array of questions
      shuffleArray(qObject);

      let qCount = +countSelect.value;
      qObject = qObject.slice(0, qCount); // Select the first qCount questions

      createBullets(qCount);

      addData(qObject[currentIndex], qCount);

      countdown(120, qCount);

      submitButton.onclick = () => {
        if (qObject[currentIndex]) {
          let rightAnswer = qObject[currentIndex]["correct_answer"];

          checkAnswer(rightAnswer, qCount);

          if (theChosenAnswer !== undefined) {
            quizArea.innerHTML = "";
            answersArea.innerHTML = "";
            currentIndex++;

            if (currentIndex < qCount) {
              addData(qObject[currentIndex], qCount);

              handelBullets();

              clearInterval(countdownInterval);
              countdown(120, qCount);
            } else {
              // Handle end of quiz
              showResults(qCount);
              if (currentIndex < qObject.length) {
                theCorrectAnswer(
                  qObject[currentIndex]["question"],
                  rightAnswer
                );
              }
              clearInterval(countdownInterval);
            }

            theChosenAnswer = undefined; // Reset the chosen answer
          } else {
            choseAnswer.innerHTML = "Please Select an Answer";
            if (!submitdiv.contains(choseAnswer)) {
              submitdiv.append(choseAnswer);
            }
          }
        } else {
          console.error("No question found at index:", currentIndex);
        }
      };
    }
  };

  myRequest.open("GET", url, true);
  myRequest.send();
}

// Event listeners for buttons
allButtons.forEach((button) => {
  button.onclick = function () {
    getQuestions(this.dataset.file);
    categorySpan.innerHTML = this.innerHTML;

    categorysDiv.remove();
    countSelect.remove();

    quizArea.style.display = "block";
    answersArea.style.display = "block";
    submitdiv.style.display = "block";
    bullets.style.display = "flex";
  };
});
function createBullets(num) {
  BulletsContainer.innerHTML = ""; // Clear existing bullets before creating new ones
  countSpan.innerHTML = countSelect.value;
  for (let i = 0; i < num; i++) {
    let theBullet = document.createElement("span");
    if (i === 0) {
      theBullet.classList.add("on");
    }
    BulletsContainer.append(theBullet);
  }
}

function addData(obj, count) {
  let theQuestion = document.createElement("h2");

  let questionText = document.createTextNode(obj.question);

  quizArea.append(theQuestion);
  theQuestion.append(questionText);

  for (let i = 1; i <= 4; i++) {
    let mainDiv = document.createElement("div");
    mainDiv.classList.add("answer");

    let radioInput = document.createElement("input");
    radioInput.setAttribute("type", "radio");
    radioInput.setAttribute("name", "answer");
    radioInput.setAttribute("id", `answer_${i}`);
    radioInput.setAttribute("data-answer", `${obj[`answer_${i}`]}`);

    let label = document.createElement("label");
    label.setAttribute("for", radioInput.getAttribute("id"));
    label.textContent = radioInput.getAttribute("data-answer");

    answersArea.append(mainDiv);
    mainDiv.append(radioInput);
    mainDiv.append(label);
  }

  let answers = document.getElementsByName("answer");

  for (let i = 0; i < answers.length; i++) {
    answers[i].addEventListener("change", function () {
      for (let j = 0; j < answers.length; j++) {
        answers[j].classList.remove("checked");
      }
      if (this.checked) {
        this.classList.add("checked");
        theChosenAnswer = this.dataset.answer; // Set the chosen answer
      }
    });
  }
}

let choseAnswer = document.createElement("div");
choseAnswer.classList.add("chose-answer");

function checkAnswer(rightAnswer, count) {
  let answers = document.getElementsByName("answer");

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].checked) {
      theChosenAnswer = answers[i].dataset.answer;
    }
  }

  if (theChosenAnswer !== undefined) {
    choseAnswer.innerHTML = "";
    if (submitdiv.contains(choseAnswer)) {
      submitdiv.removeChild(choseAnswer);
    }
  }

  if (theChosenAnswer === undefined) {
    choseAnswer.innerHTML = "Please Select an Answer";
    if (!submitdiv.contains(choseAnswer)) {
      submitdiv.append(choseAnswer);
    }
  }

  if (rightAnswer === theChosenAnswer) {
    rightAnswers++;
  } else if (rightAnswer !== theChosenAnswer && theChosenAnswer !== undefined) {
    wrongIndices.push(currentIndex); // Store the index of the wrong answer
    wrongAnswers++; // Increment wrongAnswers when the answer is wrong
  }
}

function handelBullets() {
  let bulletsSpans = document.querySelectorAll(".bullets .spans span");
  let arrayOfSpans = Array.from(bulletsSpans);
  arrayOfSpans.forEach((span, index) => {
    if (currentIndex == index) {
      span.classList.add("on");
    }
  });
}

function showResults(count) {
  if (currentIndex == count) {
    let theResults;
    console.log("End of quiz");
    quizArea.remove();
    answersArea.remove();
    submitButton.remove();
    bullets.remove();

    if (rightAnswers > count / 2 && rightAnswers < count) {
      theResults = `<span class="good">Good</span>, ${rightAnswers} / ${count}`;
    } else if (rightAnswers === count) {
      theResults = `<span class="perfect">Perfect</span>, All Answers are Correct`;
    } else {
      theResults = `<span class="bad">Bad</span>, ${rightAnswers} / ${count}`;
    }

    theResultsContainer.innerHTML = theResults;
    theResultsContainer.style.cssText =
      "padding: 10px; background: white; margin-top: 10px; text-align: center;";

    for (let i = 0; i < qObject.length; i++) {
      if (wrongIndices.includes(i)) {
        theCorrectAnswer(qObject[i]["question"], qObject[i]["correct_answer"]);
      }
    }
  }
}

function countdown(duration, count) {
  clearInterval(countdownInterval);
  if (currentIndex < count) {
    let minutes, seconds;

    countdownInterval = setInterval(function () {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);

      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      countdownDiv.innerHTML = `${minutes}:${seconds}`;

      if (--duration < 0) {
        clearInterval(countdownInterval);

        // Check if an answer has been chosen
        if (theChosenAnswer === undefined) {
          // If no answer chosen, mark the question as wrong
          let rightAnswer = qObject[currentIndex]["correct_answer"];
          checkAnswer(rightAnswer, count);

          // Remove the "Please Select an Answer" message
          choseAnswer.innerHTML = "";
          if (submitdiv.contains(choseAnswer)) {
            submitdiv.removeChild(choseAnswer);
          }

          // Proceed to the next question
          currentIndex++;
          quizArea.innerHTML = "";
          answersArea.innerHTML = "";

          if (currentIndex < count) {
            addData(qObject[currentIndex], count);
            handelBullets();
            clearInterval(countdownInterval);
            countdown(120, count);
          } else {
            showResults(count);
          }
        }
      }
    }, 1000);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    [array[i], array[random]] = [array[random], array[i]];
  }
}

function theCorrectAnswer(question, rightAnswer) {
  let correctedDiv = document.createElement("div");
  let correctedQuestion = document.createElement("h2");
  let correctedAnswer = document.createElement("h3");

  correctedDiv.classList.add("corrected-div");
  correctedQuestion.classList.add("corrected-q");
  correctedAnswer.classList.add("corrected-a");

  correctedQuestion.innerHTML = question;
  correctedAnswer.innerHTML = `the Correct Answer is: ${rightAnswer}`;

  correctedAnswersDiv.append(correctedDiv);
  correctedDiv.append(correctedQuestion);
  correctedDiv.append(correctedAnswer);

  yourWrongAnswers.style.display = "block";
}
