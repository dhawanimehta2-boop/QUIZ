let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}

// Fetch Questions on Quiz Page
if (window.location.pathname.includes('/quiz/')) {
    fetch(`/api/questions/${SUBJECT}`)
        .then(res => res.json())
        .then(data => {
            currentQuestions = data;
            loadQuestion();
        });
}

function loadQuestion() {
    if (currentIndex >= currentQuestions.length) {
        finishQuiz();
        return;
    }

    resetState();
    const q = currentQuestions[currentIndex];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('subject-title').innerText = SUBJECT.toUpperCase();
    document.getElementById('question-count').innerText = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
    
    const container = document.getElementById('options-container');
    q.options.forEach(opt => {
        const div = document.createElement('div');
        div.classList.add('option');
        div.innerText = opt;
        div.onclick = () => selectOption(div, q.answer);
        container.appendChild(div);
    });

    startTimer();
}

function startTimer() {
    timeLeft = 15;
    document.getElementById('timer').innerText = `00:${timeLeft}`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            autoAdvance();
        }
    }, 1000);
}

function selectOption(element, correct) {
    clearInterval(timer);
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.style.pointerEvents = 'none');

    if (element.innerText === correct) {
        element.classList.add('correct');
        score++;
    } else {
        element.classList.add('wrong');
        // Highlight correct one
        options.forEach(opt => {
            if (opt.innerText === correct) opt.classList.add('correct');
        });
    }
    document.getElementById('next-btn').classList.remove('hidden');
}

function resetState() {
    clearInterval(timer);
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('options-container').innerHTML = '';
    const progress = ((currentIndex) / currentQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function autoAdvance() {
    currentIndex++;
    loadQuestion();
}

document.getElementById('next-btn')?.addEventListener('click', () => {
    currentIndex++;
    loadQuestion();
});

async function finishQuiz() {
    localStorage.setItem('lastScore', `${score}/${currentQuestions.length}`);
    await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score })
    });
    window.location.href = '/result.html'; // In Flask, redirect to a result route or simple page
    // For this simple version, we'll redirect to a static results look
    window.location.href = "/";
    alert(`Quiz Finished! Your Score: ${score}`);
}
