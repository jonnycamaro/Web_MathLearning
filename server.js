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
    difficulty: 'anfänger'
};

app.post('/generate-problem', async (req, res) => {
    const { difficulty, previousPerformance } = req.body;

    try {
        const problem = generateLocalProblem(difficulty || 'anfänger');
        res.json(problem);
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

function generateLocalProblem(difficulty) {
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

    // For now, we'll stick with addition only since that's what the visualization supports
    const operator = '+';

    return {
        num1: num1,
        num2: num2,
        operator: operator
    };
}

// Serve index.html for the root route
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
