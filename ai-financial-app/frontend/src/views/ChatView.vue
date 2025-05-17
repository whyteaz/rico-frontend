<template>
  <div class="chat-view">
    <h1>Chat with Your Financial Statement</h1>
    <p>Upload your PDF bank statement to get started.</p>

    <div class="upload-section">
      <input type="file" @change="handleFileSelect" accept=".pdf" ref="fileInputRef" />
      <button @click="handleFileUpload" :disabled="!selectedFile">Upload Statement</button>
      <p v-if="uploadMessage">{{ uploadMessage }}</p>
    </div>

    <div class="chat-interface" v-if="uploadMessage.includes('Success')">
      <h2>Ask about your statement:</h2>
      <div class="conversation-area">
        <div v-for="(message, index) in conversation" :key="index" :class="['message', message.sender]">
          <p><strong>{{ message.sender === 'user' ? 'You' : 'AI' }}:</strong> {{ message.text }}</p>
        </div>
      </div>
      <div class="input-area">
        <input type="text" v-model="userMessage" @keyup.enter="sendChatMessage" placeholder="Type your question..." />
        <button @click="sendChatMessage" :disabled="!userMessage.trim()">Send</button>
      </div>
      <p v-if="chatError" class="error-message">{{ chatError }}</p>
    </div>
    <div v-else-if="uploadMessage && !uploadMessage.includes('Success') && !uploadMessage.includes('Uploading')">
        <p class="info-message">Please upload a statement successfully to enable chat.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadPdf, sendMessage } from '../services/api';

const selectedFile = ref(null);
const fileInputRef = ref(null); // To potentially reset the file input
const uploadMessage = ref('');
const userMessage = ref('');
const conversation = ref([]);
const chatError = ref('');

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file;
    uploadMessage.value = ''; // Clear previous messages
  } else {
    selectedFile.value = null;
    if (file) { // if a file was selected but wasn't a PDF
        uploadMessage.value = 'Please select a PDF file.';
    }
    // Optionally reset the file input if a non-PDF is selected
    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
  }
};

const handleFileUpload = async () => {
  if (!selectedFile.value) {
    uploadMessage.value = 'Please select a file first.';
    return;
  }

  const formData = new FormData();
  formData.append('pdfFile', selectedFile.value);
  uploadMessage.value = 'Uploading...';

  try {
    // const response = await fetch(NEW_API_ENDPOINT, { // Old fetch call
    //   method: 'POST',
    //   body: formData,
    // });
    // const result = await response.json();

    const response = await uploadPdf(formData); // Use API service
    const result = response.data; // Axios wraps response in .data

    // Assuming the backend response structure for success is { message: '...', filename: '...' }
    // and for error is { message: '...' } or a generic error.
    // The new API service handles fallback, so primary/local distinction is abstracted.

    uploadMessage.value = `Success: ${result.message} (Filename: ${result.filename})`;
    selectedFile.value = null; // Clear selection after successful upload
    if (fileInputRef.value) {
      fileInputRef.value.value = ''; // Reset file input
    }
  } catch (error) {
    console.error('Upload error:', error);
    if (error.response && error.response.data && error.response.data.message) {
      uploadMessage.value = `Error: ${error.response.data.message}`;
    } else if (error.message) {
      uploadMessage.value = `Error: ${error.message}`;
    } else {
      uploadMessage.value = 'Upload failed. See console for details.';
    }
  }
};

const sendChatMessage = async () => {
  if (!userMessage.value.trim()) {
    chatError.value = 'Please enter a message.';
    return;
  }

  const currentMessage = userMessage.value;
  conversation.value.push({ sender: 'user', text: currentMessage });
  userMessage.value = ''; // Clear input field
  chatError.value = ''; // Clear previous errors

  try {
    // const response = await fetch(NEW_API_ENDPOINT, { // Old fetch call
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ userMessage: currentMessage }),
    // });
    // const result = await response.json();

    const response = await sendMessage({ userMessage: currentMessage }); // Use API service
    const result = response.data; // Axios wraps response in .data

    // Assuming the backend response structure for success is { aiResponse: '...' }
    // and for error is { error: '...' } or a generic error.
    // The new API service handles fallback.

    conversation.value.push({ sender: 'ai', text: result.aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    if (error.response && error.response.data && error.response.data.error) {
      chatError.value = `Error from AI: ${error.response.data.error}`;
    } else if (error.message) {
      chatError.value = `Error: ${error.message}`;
    } else {
      chatError.value = 'Failed to send message. See console for details.';
    }
    // Optionally add the error to conversation display
    // conversation.value.push({ sender: 'system', text: `Network Error: ${error.message}` });
  }
};
</script>

<style scoped>
.chat-view {
  padding: 20px;
  font-family: sans-serif;
}

.upload-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.upload-section input[type="file"] {
  margin-right: 10px;
}

.upload-section button {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-section button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.upload-section p {
  margin-top: 10px;
  font-size: 0.9em;
}

.chat-interface {
  margin-top: 20px;
  border: 1px solid #eee;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
}

.conversation-area {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background-color: #e1f5fe; /* Light blue for user */
  text-align: right;
  margin-left: auto;
  max-width: 70%;
}

.message.ai {
  background-color: #f0f0f0; /* Light grey for AI */
  text-align: left;
  margin-right: auto;
  max-width: 70%;
}

.message p {
  margin: 0;
  word-wrap: break-word;
}

.input-area {
  display: flex;
  margin-top: 10px;
}

.input-area input[type="text"] {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

.input-area button {
  padding: 8px 15px;
  background-color: #28a745; /* Green for send */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  font-size: 0.9em;
  margin-top: 10px;
}
.info-message {
  color: #555;
  font-style: italic;
  margin-top: 10px;
}
</style>