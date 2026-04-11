const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Store conversation history for API requests
let conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to chat box
  appendMessage('user', userMessage);
  
  // Add user message to conversation history
  conversationHistory.push({ role: 'user', text: userMessage });
  
  // Clear input field
  input.value = '';

  // Show thinking message
  const thinkingMessageElement = appendMessage('bot', 'mengetik...');

  try {
    // Send request to backend API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Hapus animasi "thinking" sebelum menambahkan konten baru
    thinkingMessageElement.classList.remove('thinking');
    thinkingMessageElement.innerHTML = '';

    // Check if result exists
    if (!data.result) {
      thinkingMessageElement.textContent = 'Maaf, guru bot bingung nih, ulangi pesan kamu ya..';
      // Remove user message from history so the conversation remains balanced
      conversationHistory.pop();
      return;
    }

    // Add bot response to conversation history
    conversationHistory.push({ role: 'model', text: data.result });

    // Ganti pesan "thinking" dengan respons aktual, yang dirender sebagai HTML
    // PERINGATAN: Di aplikasi produksi, selalu bersihkan (sanitize) HTML ini
    // untuk mencegah serangan XSS. Contoh menggunakan library seperti DOMPurify:
    // thinkingMessageElement.innerHTML = DOMPurify.sanitize(data.result);
      let formatted = (data.result).replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");

    thinkingMessageElement.innerHTML = formatted;

  } catch (error) {
    console.error('Error:', error);
    // Replace thinking message with error message
    thinkingMessageElement.classList.remove('thinking');
    thinkingMessageElement.innerHTML = '';
    thinkingMessageElement.textContent = 'Hai, saat ini sedang banyak yang bertanya ke Guru Bot, Ketik ulang pesan kamu ya..';
    // Remove user message from history so the conversation remains balanced
    conversationHistory.pop();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'bot' && text === 'mengetik...') {
    msg.classList.add('thinking');
    msg.innerHTML = '<span></span><span></span><span></span>';
  } else {
    // Pesan dari pengguna selalu dianggap sebagai teks biasa untuk keamanan.
    // Respons HTML dari bot ditangani secara terpisah melalui innerHTML.
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}