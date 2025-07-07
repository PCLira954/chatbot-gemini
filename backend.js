
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(require('cors')());

app.post('/api/chat', async (req, res) => {
  const { text, image } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent([
      image ? {
        inlineData: {
          mimeType: "image/jpeg",
          data: image, // base64
        },
      } : null,
      text
    ].filter(Boolean));
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
