

async function sendMessage() {
  const text = document.getElementById("user-input").value;
  const imageInput = document.getElementById("image-input");
  let base64Image = null;

  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = async function () {
      base64Image = reader.result.split(',')[1];
      await sendToAPI(text, base64Image);
    };
    reader.readAsDataURL(file);
  } else {
    await sendToAPI(text);
  }
}

async function sendToAPI(text, image = null) {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, image }),
  });
  const data = await res.json();
  document.getElementById("chat-box").innerHTML += `<div><strong>Você:</strong> ${text}</div>`;
  document.getElementById("chat-box").innerHTML += `<div><strong>Bot:</strong> ${data.reply}</div>`;
}
