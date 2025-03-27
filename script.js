document.addEventListener("DOMContentLoaded", function () {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let timerInterval;
    const totalExamTime = 3 * 60 * 60; // 3 hours in seconds
    let timeLeft = totalExamTime;

    // DOM Elements
    const questionText = document.getElementById("question-text");
    const questionImage = document.getElementById("question-image");
    const optionsContainer = document.querySelector(".options-container");
    const integerInput = document.getElementById("integer-answer");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const questionNavContainer = document.querySelector(".question-nav");
    const timerDisplay = document.getElementById("timer");
    const submitBtn = document.getElementById("submit-btn");

    // Fetch questions from JSON
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            questions = data;
            renderQuestion();
            renderQuestionNav();
            startTimer();
        })
        .catch(error => console.error("Error loading questions:", error));

    // Render Question
    function renderQuestion() {
        let question = questions[currentQuestionIndex];
        questionText.innerText = `${currentQuestionIndex + 1}. ${question.question}`;

        // Show question image if available
        if (question.image) {
            questionImage.src = question.image;
            questionImage.style.display = "block";
        } else {
            questionImage.style.display = "none";
        }

        // Handle MCQ or Integer type
        optionsContainer.innerHTML = "";
        integerInput.style.display = "none";
        if (question.type === "MCQ") {
            question.options.forEach((option, index) => {
                let optionBtn = document.createElement("div");
                optionBtn.classList.add("option");
                optionBtn.innerText = option;
                optionBtn.addEventListener("click", () => selectAnswer(index));
                if (userAnswers[currentQuestionIndex] === index) {
                    optionBtn.classList.add("selected");
                }
                optionsContainer.appendChild(optionBtn);
            });
        } else {
            integerInput.style.display = "block";
            integerInput.value = userAnswers[currentQuestionIndex] || "";
        }

        updateNavHighlight();
    }

    // Select Answer for MCQ
    function selectAnswer(selectedIndex) {
        userAnswers[currentQuestionIndex] = selectedIndex;
        renderQuestion();
    }

    // Save Integer Input Answer
    integerInput.addEventListener("input", function () {
        userAnswers[currentQuestionIndex] = this.value;
    });

    // Navigation Buttons
    prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        }
    });

    // Question Number Navigation
    function renderQuestionNav() {
        questionNavContainer.innerHTML = "";
        questions.forEach((_, index) => {
            let qBtn = document.createElement("button");
            qBtn.classList.add("q-btn");
            qBtn.innerText = index + 1;
            qBtn.addEventListener("click", () => {
                currentQuestionIndex = index;
                renderQuestion();
            });
            questionNavContainer.appendChild(qBtn);
        });
    }

    // Update Active Question Navigation
    function updateNavHighlight() {
        document.querySelectorAll(".q-btn").forEach((btn, index) => {
            btn.classList.toggle("active", index === currentQuestionIndex);
        });
    }

    // Timer Countdown
    function startTimer() {
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitExam();
            } else {
                timeLeft--;
                updateTimerDisplay();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        let hours = Math.floor(timeLeft / 3600);
        let minutes = Math.floor((timeLeft % 3600) / 60);
        let seconds = timeLeft % 60;
        timerDisplay.innerText = `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    // Submit Exam & Calculate Score
    submitBtn.addEventListener("click", submitExam);

    function submitExam() {
        clearInterval(timerInterval);
        let score = 0;

        questions.forEach((q, index) => {
            if (q.type === "MCQ" && userAnswers[index] !== undefined) {
                if (q.answer === q.options[userAnswers[index]]) {
                    score++;
                }
            } else if (q.type === "Integer" && userAnswers[index] !== undefined) {
                if (parseInt(q.answer) === parseInt(userAnswers[index])) {
                    score++;
                }
            }
        });

        alert(`Exam Completed! Your Score: ${score} / ${questions.length}`);
    }
});
