let currentProblem = null;
let score = 0;
let difficulty = 'anfänger'; // anfänger, fortgeschritten, experte
let performanceHistory = [];
let animationInterval = null;

// DOM elements
const problemElement = document.getElementById('problem');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const difficultyElement = document.getElementById('difficulty');

// Canvas setup
const canvas = document.getElementById('dotsCanvas');
const ctx = canvas.getContext('2d');

// Dot configuration
const DOT_RADIUS = 10;
const DOT_SPACING = 30;
const ROW_HEIGHT = 60;
const DOT_COLORS = {
    group1: '#4287f5', // Blue for numbers 1-5
    group2: '#f54242', // Red for numbers 6-10
    group3: '#42f54b', // Green for numbers 11-15
    group4: '#f5d742'  // Yellow for numbers 16-20
};

// Animation state
let animationState = {
    dots: [],
    isAnimating: false,
    currentNum1: 0,
    currentNum2: 0
};

function drawDot(x, y, position, isEmpty = false, isSecondNumber = false) {
    let color;
    // Use blue for first number, red for second number
    if (!isSecondNumber) {
        color = '#0066cc'; // blue for first number
    } else {
        color = '#cc0000'; // red for second number
    }

    ctx.beginPath();
    ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
    
    if (isEmpty) {
        ctx.strokeStyle = '#ccc';  // Keep empty circles gray
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function drawSeparatorLine(x, y1, y2) {
    ctx.beginPath();
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
}

class AnimatedDot {
    constructor(startX, startY, endX, endY, position, isSecondNumber, duration = 1500) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.currentX = startX;
        this.currentY = startY;
        this.position = position;
        this.startTime = null;
        this.duration = duration;
        this.isSecondNumber = isSecondNumber;
    }

    update(currentTime) {
        if (!this.startTime) this.startTime = currentTime;
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Easing function for smooth movement
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        this.currentX = this.startX + (this.endX - this.startX) * easeProgress;
        this.currentY = this.startY + (this.endY - this.startY) * easeProgress;
        
        return progress < 1;
    }

    draw() {
        drawDot(this.currentX, this.currentY, this.position, false, this.isSecondNumber);
    }
}

function drawStaticVisualization(num1, num2) {
    const y1 = ROW_HEIGHT;
    const y2 = ROW_HEIGHT * 2;
    const startX = (canvas.width - (10 * DOT_SPACING)) / 2 + DOT_RADIUS;

    // Draw first row
    let dotsInTopRow = Math.min(num1, 10); // Maximum 10 dots in top row
    for (let i = 0; i < dotsInTopRow; i++) {
        const x = startX + (i * DOT_SPACING);
        drawDot(x, y1, i + 1, false, false); // First number dots are blue
    }
    // Draw empty dots to complete first row
    for (let i = dotsInTopRow; i < 10; i++) {
        const x = startX + (i * DOT_SPACING);
        drawDot(x, y1, i + 1, true);
    }
    
    // For bottom row, calculate remaining dots from first number and all of second number
    const remainingFirstNumber = Math.max(0, num1 - 10); // Any dots from first number that didn't fit in top row
    let visibleDots = remainingFirstNumber + num2;
    if (animationState.isAnimating) {
        const animatingDotsCount = animationState.dots ? animationState.dots.length : 0;
        visibleDots = visibleDots - animatingDotsCount;
    }
    
    // Draw remaining first number dots in blue
    let i = 0;
    for (; i < remainingFirstNumber; i++) {
        const x = startX + (i * DOT_SPACING);
        drawDot(x, y2, i + 1, false, false); // Still part of first number, so blue
    }
    
    // Draw second number dots in red
    for (; i < visibleDots; i++) {
        const x = startX + (i * DOT_SPACING);
        drawDot(x, y2, i + 1, false, true); // Second number dots are red
    }
    
    // Draw empty dots to complete second row
    for (; i < 10; i++) {
        const x = startX + (i * DOT_SPACING);
        drawDot(x, y2, i + 1, true);
    }

    // Draw separator lines between dots 5 and 6
    const lineX = startX + (5 * DOT_SPACING) - (DOT_SPACING / 2);
    drawSeparatorLine(lineX, y1 - DOT_RADIUS, y1 + DOT_RADIUS);
    drawSeparatorLine(lineX, y2 - DOT_RADIUS, y2 + DOT_RADIUS);
}

function startAnimation(num1, num2) {
    const y1 = ROW_HEIGHT;
    const y2 = ROW_HEIGHT * 2;
    const startX = (canvas.width - (10 * DOT_SPACING)) / 2 + DOT_RADIUS;
    
    // Calculate how many dots to move
    const dotsToMove = Math.min(num2, 10 - num1);
    
    // Create animated dots
    animationState.dots = [];
    for (let i = 0; i < dotsToMove; i++) {
        const fromX = startX + i * DOT_SPACING;
        const toX = startX + (num1 + i) * DOT_SPACING;
        // These are second number dots, so they should be red
        animationState.dots.push(new AnimatedDot(fromX, y2, toX, y1, i + 1, true));
    }
    
    animationState.currentNum1 = num1;
    animationState.currentNum2 = num2;
    animationState.isAnimating = true;
    
    // Start animation loop
    requestAnimationFrame(animateFrame);
}

function animateFrame(currentTime) {
    if (!animationState.isAnimating) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw static dots
    drawStaticVisualization(animationState.currentNum1, animationState.currentNum2);

    // Update and draw animated dots
    let stillAnimating = false;
    animationState.dots.forEach(dot => {
        if (dot.update(currentTime)) {
            stillAnimating = true;
        }
        dot.draw();
    });

    if (stillAnimating) {
        requestAnimationFrame(animateFrame);
    } else {
        animationState.isAnimating = false;
    }
}

function updateVisualProblem(problem) {
    const parts = problem.split(' ');
    const num1 = parseInt(parts[0]);
    const num2 = parseInt(parts[2]);
    const operator = parts[1];
    
    // Clear canvas and draw initial state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStaticVisualization(num1, num2);

    // Start animation after a longer delay (3 seconds)
    setTimeout(() => {
        startAnimation(num1, num2);
    }, 3000);

    // Create speech text in question format
    let speechText = `Was ist ${num1} ${operator === '+' ? 'plus' : 'minus'} ${num2}?`;
    speakProblem(speechText);
}

// Track performance for AI
const performanceData = {
    correctAnswers: 0,
    totalAttempts: 0,
    recentResults: [],
    averageResponseTime: 0,
    startTime: null
};

async function generateProblem() {
    try {
        const response = await fetch('http://localhost:3000/generate-problem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficulty,
                previousPerformance: performanceData
            }),
        });

        if (!response.ok) {
            throw new Error('Netzwerk-Antwort war nicht ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler:', error);
        // Fallback to local generation if API fails
        return generateLocalProblem();
    }
}

function generateLocalProblem() {
    let num1, num2;
    
    switch(difficulty) {
        case 'fortgeschritten':
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * 15) + 5;
            break;
        case 'experte':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            break;
        default: // anfänger
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
    }

    const operator = Math.random() < 0.5 ? '+' : '-';
    if (operator === '-' && num1 < num2) {
        [num1, num2] = [num2, num1];
    }

    return {
        problem: `${num1} ${operator} ${num2}`,
        answer: operator === '+' ? num1 + num2 : num1 - num2
    };
}

function updateDifficulty() {
    const recentPerformance = performanceData.recentResults.slice(-5);
    const successRate = recentPerformance.filter(x => x).length / recentPerformance.length;

    if (successRate > 0.8 && performanceData.correctAnswers >= 10) {
        difficulty = 'fortgeschritten';
        difficultyElement.textContent = 'Fortgeschritten';
    }
    if (successRate > 0.8 && performanceData.correctAnswers >= 20) {
        difficulty = 'experte';
        difficultyElement.textContent = 'Experte';
    }
    if (successRate < 0.3 && difficulty !== 'anfänger') {
        difficulty = difficulty === 'experte' ? 'fortgeschritten' : 'anfänger';
        difficultyElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
}

// Speech synthesis setup
const speechSynthesis = window.speechSynthesis;
let germanVoice = null;

// Initialize German voice
function initializeVoice() {
    return new Promise((resolve) => {
        // Wait for voices to be loaded
        speechSynthesis.onvoiceschanged = () => {
            const voices = speechSynthesis.getVoices();
            germanVoice = voices.find(voice => voice.lang.includes('de')) || voices[0];
            resolve();
        };
        // Trigger voice loading
        speechSynthesis.getVoices();
    });
}

// Initialize voice when page loads
document.addEventListener('DOMContentLoaded', initializeVoice);

function speakProblem(problem) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Create utterance with German voice
    const utterance = new SpeechSynthesisUtterance(problem);
    utterance.voice = germanVoice;
    utterance.lang = 'de-DE';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;

    // Speak the problem
    speechSynthesis.speak(utterance);
}

async function newProblem() {
    if (animationInterval) {
        clearInterval(animationInterval);
    }

    currentProblem = await generateProblem();
    problemElement.textContent = currentProblem.problem + ' = ?';
    updateVisualProblem(currentProblem.problem);
    answerInput.value = '';
    feedbackElement.textContent = '';
    answerInput.focus();
    performanceData.startTime = Date.now();
}

async function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        feedbackElement.textContent = 'Bitte gib eine Zahl ein! 🤔';
        feedbackElement.className = 'feedback incorrect';
        return;
    }

    const parts = currentProblem.problem.split(' ');
    const num1 = parseInt(parts[0]);
    const num2 = parseInt(parts[2]);
    const operator = parts[1];
    const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;

    if (userAnswer === correctAnswer) {
        score++;
        scoreElement.textContent = score;
        feedbackElement.textContent = '✨ Super, richtig gemacht! ✨';
        feedbackElement.className = 'feedback correct';
        speakProblem('Super, richtig gemacht!');
        
        // Record performance data
        performanceData.endTime = Date.now();
        performanceData.correct = true;
        performanceHistory.push({ ...performanceData });
        
        setTimeout(() => {
            newProblem();
        }, 1500);
    } else {
        feedbackElement.textContent = 'Versuch es noch einmal! Du schaffst das! 💪';
        feedbackElement.className = 'feedback incorrect';
        speakProblem('Versuch es noch einmal! Du schaffst das!');
        answerInput.value = '';
        answerInput.focus();
        
        // Record performance data
        performanceData.endTime = Date.now();
        performanceData.correct = false;
        performanceHistory.push({ ...performanceData });
    }
}

// Event listeners
submitButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Start the game
newProblem();
