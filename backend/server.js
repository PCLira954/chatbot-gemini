// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '20mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  const { text, image } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const parts = [];
    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image
        }
      });
    }
    if (text) {
      parts.push(text);
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Erro na API Gemini:", error.message);
    res.status(500).json({ error: "Erro ao processar resposta." });
  }
});

app.get('/', (req, res) => {
  res.send('API Gemini está online!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
