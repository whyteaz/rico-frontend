<template>
  <div class="chat-view">
    <h1>Chat with Qwen Service</h1>
    <p>Ask questions and optionally attach a PDF document.</p>

    <div class="chat-interface">
      <h2>Conversation:</h2>
      <div class="conversation-area">
        <div v-for="(message, index) in conversation" :key="index" :class="['message', message.sender]">
          <p><strong>{{ message.sender === 'user' ? 'You' : 'AI' }}:</strong> {{ message.text }}</p>
        </div>
      </div>
      <div class="input-area">
        <input type="text" v-model="userMessage" @keyup.enter="handleSendMessage" placeholder="Type your question..." />
        <input type="file" @change="handleFileSelect" accept=".pdf" ref="fileInputRef" class="file-input" />
        <button @click="handleSendMessage" :disabled="!userMessage.trim() && !selectedFile">Send</button>
      </div>
      <p v-if="selectedFile" class="selected-file-info">Selected file: {{ selectedFile.name }}</p>
      <p v-if="chatError" class="error-message">{{ chatError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { sendChatMessageV2 } from '../services/api'; // Updated import

const selectedFile = ref(null);
const fileInputRef = ref(null);
const userMessage = ref('');
const conversation = ref([]);
const chatError = ref('');
const sessionId = ref(null);

onMounted(() => {
  let storedSessionId = localStorage.getItem('chatSessionId');
  if (!storedSessionId) {
    storedSessionId = crypto.randomUUID();
    localStorage.setItem('chatSessionId', storedSessionId);
  }
  sessionId.value = storedSessionId;
});

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file;
    chatError.value = ''; // Clear previous errors
  } else {
    selectedFile.value = null;
    if (file) {
      chatError.value = 'Please select a PDF file.';
    }
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};

const handleSendMessage = async () => {
  if (!userMessage.value.trim() && !selectedFile.value) {
    chatError.value = 'Please enter a message or select a file.';
    return;
  }

  const currentMessageText = userMessage.value.trim();
  if (currentMessageText) {
    conversation.value.push({ sender: 'user', text: currentMessageText });
  }
  if (selectedFile.value) {
    // Optionally, add a message indicating a file is being sent
    conversation.value.push({ sender: 'user', text: `(Sending file: ${selectedFile.value.name})` });
  }
  
  chatError.value = '';

  const formData = new FormData();
  formData.append('message', currentMessageText);
  formData.append('session_id', sessionId.value);

  if (selectedFile.value) {
    formData.append('files', selectedFile.value);
  }

  try {
    const response = await sendChatMessageV2(formData);
    const result = response.data;

    if (result.response) {
      conversation.value.push({ sender: 'ai', text: result.response });
    }
    if (result.traceback) {
      console.log('AI Traceback:', result.traceback);
    }
    if (!result.response && !result.traceback) { // If response is empty but no error from backend
        console.log('Received empty response from AI:', result);
        // conversation.value.push({ sender: 'ai', text: '[AI returned an empty response]' });
    }

    // Clear inputs after successful send
    userMessage.value = '';
    selectedFile.value = null;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }

  } catch (error) {
    console.error('Chat V2 error:', error);
    let errorMessage = 'Failed to send message. See console for details.';
    if (error.response && error.response.data) {
      if (error.response.data.detail && typeof error.response.data.detail === 'string') {
        errorMessage = `Error: ${error.response.data.detail}`;
      } else if (error.response.data.message) {
         errorMessage = `Error: ${error.response.data.message}`;
      } else if (typeof error.response.data === 'string') {
        errorMessage = `Error: ${error.response.data}`;
      }
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    chatError.value = errorMessage;
    // Optionally add the error to conversation display for more visibility
    // conversation.value.push({ sender: 'system', text: errorMessage });
  }
};
</script>

<style scoped>
.chat-view {
  padding: 20px;
  font-family: sans-serif;
  max-width: 800px;
  margin: auto;
}

.chat-interface {
  margin-top: 20px;
  border: 1px solid #eee;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.conversation-area {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.message {
  margin-bottom: 12px;
  padding: 10px 15px;
  border-radius: 18px; /* More rounded bubbles */
  line-height: 1.4;
  max-width: 75%;
  word-wrap: break-word;
}

.message.user {
  background-color: #007bff; /* Primary blue for user */
  color: white;
  text-align: left; /* Align user messages to left for consistency, or right if preferred */
  margin-left: 0; /* Or margin-right: auto; if text-align: left */
  margin-right: auto; /* Pushes to left if text-align: left */
  align-self: flex-start; /* For flex context if parent is flex */
}
.message.user strong {
  color: #e6efff; /* Lighter color for "You:" text */
}

.message.ai {
  background-color: #e9ecef; /* Light grey for AI */
  color: #333;
  text-align: left;
  margin-right: 0; /* Or margin-left: auto; if text-align: right */
  margin-left: auto; /* Pushes to right if text-align: left */
  align-self: flex-start;
}
.message.ai strong {
  color: #555;
}


.input-area {
  display: flex;
  align-items: center; /* Align items vertically */
  margin-top: 10px;
}

.input-area input[type="text"] {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px; /* Rounded input field */
  margin-right: 10px;
  font-size: 1em;
}

.input-area .file-input {
  /* Basic styling for file input, can be hidden and triggered by a custom button if needed */
  margin-right: 10px;
  border: 1px solid #ccc;
  padding: 7px;
  border-radius: 20px;
  font-size: 0.9em;
  max-width: 150px; /* Limit width */
}

.input-area button {
  padding: 10px 20px;
  background-color: #28a745; /* Green for send */
  color: white;
  border: none;
  border-radius: 20px; /* Rounded button */
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

.input-area button:hover {
  background-color: #218838;
}

.input-area button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.selected-file-info {
  font-size: 0.9em;
  color: #555;
  margin-top: 5px;
  margin-left: 5px; /* Align with text input roughly */
}

.error-message {
  color: #dc3545; /* Bootstrap danger red */
  font-size: 0.9em;
  margin-top: 10px;
}
</style>