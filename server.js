const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Track student performance
let studentPerformance = {
    correctAnswers: 0,
    totalAttempts: 0,
    difficulty: 'beginner'
};

app.post('/generate-problem', async (req, res) => {
    const { difficulty, previousPerformance } = req.body;

    try {
        const fallbackProblem = generateLocalProblem(difficulty);
        res.json(fallbackProblem);
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

function generateLocalProblem(difficulty) {
    let num1, num2;
    switch(difficulty) {
        case 'intermediate':
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * 15) + 5;
            break;
        case 'advanced':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            break;
        default: // beginner
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

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
