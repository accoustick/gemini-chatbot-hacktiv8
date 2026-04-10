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
  const thinkingMessageElement = appendMessage('bot', 'Thinking...');

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

    // Check if result exists
    if (!data.result) {
      thinkingMessageElement.textContent = 'Sorry, no response received.';
      // Remove user message from history so the conversation remains balanced
      conversationHistory.pop();
      return;
    }

    // Add bot response to conversation history
    conversationHistory.push({ role: 'model', text: data.result });

    // Replace thinking message with actual response
    thinkingMessageElement.textContent = data.result;
  } catch (error) {
    console.error('Error:', error);
    // Replace thinking message with error message
    thinkingMessageElement.textContent = 'Failed to get response from server.';
    // Remove user message from history so the conversation remains balanced
    conversationHistory.pop();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}