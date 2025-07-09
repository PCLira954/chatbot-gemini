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

async function sendToGemini(parts) {
  // Decide qual modelo usar baseado no input
  const model = parts.some(part => part.inlineData) ? "gemini-pro-vision" : "gemini-pro";
  
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
    throw new Error(`Erro na API: ${response.status}`);
  }

  return await response.json();
}

sendBtn.addEventListener('click', async () => {
  const userText = textInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!userText && !imageFile) {
    alert("Digite uma mensagem ou envie uma imagem.");
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

    const data = await sendToGemini(parts);
    console.log("Resposta da API:", data);

    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                     "Não foi possível obter uma resposta.";
    addMessage(botReply, "bot");
    statusMsg.innerText = "";
  } catch (err) {
    console.error("Erro:", err);
    addMessage(`Erro: ${err.message}`, "error");
    statusMsg.innerText = "";
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(new Error("Falha ao ler a imagem"));
    reader.readAsDataURL(file);
  });
}
