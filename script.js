document.addEventListener("DOMContentLoaded", () => {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let timer = 3 * 60 * 60; // 3 hours in seconds
    let examEnded = false;

    const questionContainer = document.getElementById("question-container");
    const subjectTitle = document.getElementById("subject-title");
    const navButtons = document.getElementById("nav-buttons");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const endExamBtn = document.getElementById("end-exam-btn");
    const timeDisplay = document.getElementById("time");
    const scoreModal = document.getElementById("score-modal");
    const totalScoreDisplay = document.getElementById("total-score");

    // Fetch questions from JSON
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            questions = data;
            renderNavigationButtons();
            loadQuestion(currentQuestionIndex);
            startTimer();
        });

    // Render Navigation Buttons
    function renderNavigationButtons() {
        questions.forEach((_, index) => {
            let btn = document.createElement("button");
            btn.classList.add("nav-btn");
            btn.innerText = index + 1;
            btn.addEventListener("click", () => {
                saveAnswer();
                loadQuestion(index);
            });
            navButtons.appendChild(btn);
        });
        updateNavButtons();
    }

    // Load a Question
    function loadQuestion(index) {
        if (examEnded) return;

        currentQuestionIndex = index;
        let q = questions[index];

        subjectTitle.innerText = q.subject;
        questionContainer.innerHTML = `
            <p><strong>Q${index + 1}:</strong> ${q.question}</p>
            ${q.image ? `<img src="${q.image}" alt="Question Image" class="question-image">` : ""}
            <div class="options">
                ${q.type === "MCQ"
                    ? q.options.map((opt, i) => `<div class="option" data-value="${i}">${opt}</div>`).join("")
                    : `<input type="number" id="integer-answer" placeholder="Enter answer">`
                }
            </div>
        `;

        if (userAnswers[index] !== undefined) {
            if (q.type === "MCQ") {
                document.querySelectorAll(".option").forEach(opt => {
                    if (parseInt(opt.dataset.value) === userAnswers[index]) {
                        opt.classList.add("selected");
                    }
                    opt.addEventListener("click", selectOption);
                });
            } else {
                document.getElementById("integer-answer").value = userAnswers[index];
            }
        } else {
            document.querySelectorAll(".option").forEach(opt => opt.addEventListener("click", selectOption));
        }

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === questions.length - 1;
        updateNavButtons();
    }

    // Select MCQ Option
    function selectOption(event) {
        document.querySelectorAll(".option").forEach(opt => opt.classList.remove("selected"));
        event.target.classList.add("selected");
        userAnswers[currentQuestionIndex] = parseInt(event.target.dataset.value);
        updateNavButtons();
    }

    // Save Answer Before Switching
    function saveAnswer() {
        let q = questions[currentQuestionIndex];
        if (q.type === "Integer") {
            let answer = document.getElementById("integer-answer").value;
            if (answer) userAnswers[currentQuestionIndex] = parseInt(answer);
        }
    }

    // Update Navigation Buttons (Highlight Answered Questions)
    function updateNavButtons() {
        document.querySelectorAll(".nav-btn").forEach((btn, index) => {
            btn.classList.toggle("active", index === currentQuestionIndex);
            btn.style.background = userAnswers[index] !== undefined ? "#00c3ff" : "#333";
        });
    }

    // Timer Countdown
    function startTimer() {
        const interval = setInterval(() => {
            if (examEnded) {
                clearInterval(interval);
                return;
            }
            let hours = Math.floor(timer / 3600);
            let minutes = Math.floor((timer % 3600) / 60);
            let seconds = timer % 60;

            timeDisplay.innerText = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            if (timer === 0) {
                clearInterval(interval);
                endExam();
            }
            timer--;
        }, 1000);
    }

    // End Exam and Calculate Score
    endExamBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to submit the exam?")) {
            endExam();
        }
    });

    function endExam() {
        examEnded = true;
        let score = 0;

        questions.forEach((q, index) => {
            if (userAnswers[index] !== undefined) {
                if (q.type === "MCQ" && q.correct === userAnswers[index]) {
                    score += 4;
                } else if (q.type === "Integer" && parseInt(q.correct) === userAnswers[index]) {
                    score += 4;
                } else {
                    score -= 1;
                }
            }
        });

        totalScoreDisplay.innerText = `${score} / ${questions.length * 4}`;
        scoreModal.style.display = "block";
    }
});
