const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Track student performance
let studentPerformance = {
    correctAnswers: 0,
    totalAttempts: 0,
    difficulty: 'beginner'
};

app.post('/generate-problem', async (req, res) => {
    const { difficulty, previousPerformance } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Du bist ein Mathelehrer, der Aufgaben für ein 8-jähriges Kind erstellt. Generiere einfache Plus- oder Minusaufgaben. Gib NUR ein JSON-Objekt mit genau diesem Format zurück: {\"problem\": \"X + Y\", \"answer\": Z}, wobei X und Y Zahlen sind und Z das numerische Ergebnis ist."
                },
                {
                    role: "user",
                    content: `Generiere eine ${difficulty} Matheaufgabe (Addition oder Subtraktion bis 20).`
                }
            ],
            temperature: 0.7,
        });

        try {
            const responseContent = completion.choices[0].message.content;
            console.log('OpenAI Antwort:', responseContent);
            const parsedResponse = JSON.parse(responseContent);
            
            // Validate the response format
            if (!parsedResponse.problem || !('answer' in parsedResponse)) {
                throw new Error('Ungültiges Antwortformat');
            }
            
            // Convert answer to number if it's a string
            parsedResponse.answer = Number(parsedResponse.answer);
            
            res.json(parsedResponse);
        } catch (parseError) {
            console.error('Fehler beim Parsen der OpenAI-Antwort:', parseError);
            // Fallback to local generation
            const fallbackProblem = generateLocalProblem(difficulty);
            res.json(fallbackProblem);
        }
    } catch (error) {
        console.error('OpenAI API Fehler:', error);
        // Fallback to local generation
        const fallbackProblem = generateLocalProblem(difficulty);
        res.json(fallbackProblem);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
