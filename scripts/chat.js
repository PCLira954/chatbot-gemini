const API_KEY = "AIzaSyBFpHI3wTBRwGV650Jo72gMX_MzdGDguOQ";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const textInput = document.getElementById('text-input');
const imageInput = document.getElementById('image-input');
const statusMsg = document.getElementById('status-msg');

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function callGeminiAPI(parts) {
  // Define o modelo com base no input (texto ou imagem)
  const model = parts.some(part => part.inlineData) 
    ? "gemini-pro-vision" 
    : "gemini-1.5-pro-latest"; // ou "gemini-1.5-flash-latest"

  const url = `${BASE_URL}${model}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{
      parts: parts
    }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

sendBtn.addEventListener('click', async () => {
  const userText = textInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!userText && !imageFile) {
    alert("Por favor, digite uma mensagem ou envie uma imagem.");
    return;
  }

  addMessage(userText || "[Imagem enviada]", "user");
  textInput.value = "";
  imageInput.value = "";
  statusMsg.innerText = "Processando...";

  try {
    const parts = [];

    if (userText) {
      parts.push({ text: userText });
    }

    if (imageFile) {
      const base64 = await toBase64(imageFile);
      parts.push({
        inlineData: {
          mimeType: imageFile.type,
          data: base64
        }
      });
    }

    const data = await callGeminiAPI(parts);
    console.log("Resposta da API:", data);

    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "Não foi possível gerar uma resposta.";
    addMessage(botReply, "bot");
    statusMsg.innerText = "";
  } catch (err) {
    console.error("Erro:", err);
    addMessage(`Erro ao chamar a API: ${err.message}`, "error");
    statusMsg.innerText = "";
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(new Error("Falha ao ler a imagem"));
    reader.readAsDataURL(file);
  });
}
