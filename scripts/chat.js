// Captura da chave de API via prompt de forma correta
const API_KEY = prompt("Cole aqui sua chave da API Gemini:");

// Verificação de segurança básica (evita chamadas com chave inválida)
if (!API_KEY || API_KEY.length < 20) {
  alert("Chave da API inválida. Recarregue a página e insira corretamente.");
  throw new Error("Chave da API inválida.");
}

// Referência aos elementos da página
const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const textInput = document.getElementById('text-input');
const imageInput = document.getElementById('image-input');
const statusMsg = document.getElementById('status-msg');

// Função para adicionar mensagens no chat
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Evento de clique no botão "Enviar"
sendBtn.addEventListener('click', async () => {
  const userText = textInput.value.trim();
  const imageFile = imageInput?.files?.[0];

  // Bloqueia se não tiver texto nem imagem
  if (!userText && !imageFile) {
    alert("Digite uma mensagem ou envie uma imagem.");
    return;
  }

  addMessage(userText || "[Imagem enviada]", "user");
  textInput.value = "";
  if (imageInput) imageInput.value = "";
  statusMsg.innerText = "Processando...";

  try {
    // Cria partes (texto e imagem se existirem)
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

    // Corpo da requisição
    const body = {
      contents: [
        {
          parts: parts
        }
      ]
    };

    // Chamada para o modelo vision (texto + imagem)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log("Resposta da API:", data); // debug no console

    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível responder.";
    addMessage(botReply, "bot");
    statusMsg.innerText = "";
  } catch (err) {
    console.error("Erro ao chamar a API:", err);
    statusMsg.innerText = "Erro ao chamar a API.";
  }
});

// Conversão de imagem para base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
