const API_KEY = AIzaSyBFpHI3wTBRwGV650Jo72gMX_MzdGDguOQ

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

    const body = {
      contents: [
        {
          parts: parts
        }
      ]
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log("Resposta da API:", data);

    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível responder.";
    addMessage(botReply, "bot");
    statusMsg.innerText = "";
  } catch (err) {
    console.error("Erro ao chamar a API:", err);
    statusMsg.innerText = "Erro ao chamar a API.";
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
