<template>
  <div class="chat-view-container">
    <div class="chat-header">
      <h1 class="header-title">Rico @ Finance-AI Trained</h1>
      <p class="header-tagline">Talked to understand your wallet, not just your words.</p>
    </div>

    <div class="chat-messages-area" ref="chatMessagesAreaRef">
      <div v-for="message in messages" :key="message.id" :class="['message', message.sender === 'user' ? 'user-message' : 'rico-message']">
        <div class="message-content">
          <p>{{ message.text }}</p>
        </div>
        <span class="message-timestamp">{{ message.timestamp || 'just now' }}</span>
      </div>
      <!-- Suggestion buttons can be shown conditionally, e.g., only if last message is from AI and has suggestions -->
      <div class="suggestion-buttons" v-if="messages.length === 1 && messages[0].sender === 'ai'">
        <button class="suggestion-btn" @click="handleSuggestionClick">Let's go 👉</button>
        <button class="suggestion-btn" @click="handleSuggestionClick">What can you do? 🤔</button>
        <button class="suggestion-btn" @click="handleSuggestionClick">Show can buying demo</button>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="pdf-upload-area">
        <label for="pdf-upload-input" class="pdf-upload-label">Upload PDF Statement:</label>
        <input
          type="file"
          id="pdf-upload-input"
          ref="fileInputRef"
          @change="handleFileUpload"
          accept=".pdf"
          class="pdf-upload-input"
        />
      </div>
      <div class="input-wrapper">
        <span class="input-icon">✏️</span> <!-- Placeholder pencil icon -->
        <input
          type="text"
          placeholder="Ask Rico anything about your finances..."
          class="text-input"
          v-model="chatInputValue"
          @keyup.enter="handleSendMessage"
        />
        <button class="send-button" @click="handleSendMessage">
          <span>Send</span>
          <span class="send-icon">➢</span> <!-- Paper plane icon placeholder -->
        </button>
      </div>
      <p class="pro-tip">Pro tip: Upload your bank statement PDF above, then ask questions!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { sendChatMessageV2 } from '../services/api';

const chatInputValue = ref('');
const chatMessagesAreaRef = ref(null);
const fileInputRef = ref(null); // To reference the file input
const sessionId = ref('');
const pdfProcessingStatus = ref(''); // '', 'processing', 'success', 'error'
const lastUploadedFileName = ref('');

onMounted(() => {
  sessionId.value = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
});

const messages = ref([
  { 
    id: Date.now(), 
    text: 'Hey there, I\'m Rico, your finance buddy! Ready to make money stuff way less hectic and a lot more manageable?', 
    sender: 'ai', // 'ai' or 'rico'
    timestamp: 'less than a minute ago' 
  }
]);

const scrollToBottom = () => {
  nextTick(() => {
    const area = chatMessagesAreaRef.value;
    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  });
};

const handleSuggestionClick = (event) => {
  const buttonText = event.target.textContent;
  chatInputValue.value = buttonText;
  // Optionally, send the suggestion as a message immediately
  // handleSendMessage();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.log('No file selected');
    return;
  }
  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file.');
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    return;
  }

  lastUploadedFileName.value = file.name;
  pdfProcessingStatus.value = 'processing';
  const processingMessage = {
    id: Date.now(),
    text: `Processing ${file.name}...`,
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  messages.value.push(processingMessage);
  scrollToBottom();

  const formData = new FormData();
  formData.append('files', file); // Key is 'files' as per api.js comment
  formData.append('session_id', sessionId.value);
  // Optionally, send an empty message or a system message if the API requires a 'message' field
  // formData.append('message', '');

  try {
    const response = await sendChatMessageV2(formData);
    
    // Remove "processing" message
    messages.value.pop();

    if (response && response.data) {
      // Assuming the response for a file upload might be a confirmation or initial analysis
      let responseText = response.data.reply || response.data.message || `Successfully uploaded ${lastUploadedFileName.value}. You can now ask questions about it.`;
      
      const successMessage = {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      messages.value.push(successMessage);
      pdfProcessingStatus.value = 'success';
    } else {
      throw new Error('Invalid response from server after file upload.');
    }
  } catch (error) {
    console.error('Error uploading or processing PDF via sendChatMessageV2:', error);
    if (messages.value.length > 0 && messages.value[messages.value.length - 1].text.startsWith('Processing')) {
      messages.value.pop(); // Remove "processing" message if still there
    }
    const errorMessageText = error.response?.data?.error || error.response?.data?.message || error.message || `Could not process ${lastUploadedFileName.value}.`;
    const pdfError = {
      id: Date.now(),
      text: errorMessageText,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.value.push(pdfError);
    pdfProcessingStatus.value = 'error';
  } finally {
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    scrollToBottom();
  }
};

const handleSendMessage = async () => {
  const text = chatInputValue.value.trim();
  if (!text) return;

  const userMessage = {
    id: Date.now(),
    text: text,
    sender: 'user',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  messages.value.push(userMessage);
  chatInputValue.value = '';
  scrollToBottom();

  const formData = new FormData();
  formData.append('message', text); // Key is 'message'
  formData.append('session_id', sessionId.value);
  // If a file was just uploaded and the API requires file context to be re-sent or referenced,
  // that logic would go here. For now, assuming session_id handles context.

  try {
    const response = await sendChatMessageV2(formData);
    
    let aiReplyText = "Sorry, I couldn't get a response.";
    if (response && response.data) {
        aiReplyText = response.data.reply || response.data.message || aiReplyText;
    }

    const aiMessage = {
      id: Date.now() + 1,
      text: aiReplyText,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.value.push(aiMessage);
    scrollToBottom();

  } catch (error) {
    console.error('Error sending message via sendChatMessageV2:', error);
    let specificDisplayError = 'Oops! Something went wrong. Please try again.';
    if (error.response && error.response.data) {
      specificDisplayError = error.response.data.error || error.response.data.message || specificDisplayError;
    } else if (error.message) {
      specificDisplayError = error.message;
    }
    const errorMessage = {
      id: Date.now() + 1,
      text: specificDisplayError,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.value.push(errorMessage);
    scrollToBottom();
  }
};

// Initial scroll to bottom
nextTick(() => {
  scrollToBottom();
});

</script>

<style scoped>
.chat-view-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Or a fixed height as per design */
  max-width: 800px; /* Or as per design */
  margin: auto;
  background-color: #f0f2f5; /* Light grey background, adjust as per screenshot */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.chat-header {
  padding: 20px;
  text-align: center;
  background-color: #ffffff; /* White background for header */
  border-bottom: 1px solid #e0e0e0; /* Light border */
}

.header-title {
  font-size: 1.8em;
  color: #1c1e21; /* Dark grey/black */
  margin-bottom: 5px;
  font-weight: 600;
}

.header-tagline {
  font-size: 0.9em;
  color: #606770; /* Medium grey */
}

.chat-messages-area {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Align messages to the top */
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  max-width: 70%; /* Max width for message bubbles */
}

.rico-message {
  align-self: flex-start; /* Rico's messages on the left */
}

.rico-message .message-content {
  background-color: #ffffff; /* White background for Rico's messages */
  color: #1c1e21; /* Dark text */
  padding: 12px 18px;
  border-radius: 18px 18px 18px 0; /* Rounded corners, flat on bottom left */
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.user-message {
  align-self: flex-end; /* User's messages on the right */
}

.user-message .message-content {
  background-color: #1877f2; /* Facebook blue for user messages */
  color: white;
  padding: 12px 18px;
  border-radius: 18px 18px 0 18px; /* Rounded corners, flat on bottom right */
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.user-message .message-timestamp {
  align-self: flex-end; /* Timestamp on the right for user messages */
  padding-right: 10px; /* Align with message bubble */
}


.message-timestamp {
  font-size: 0.75em;
  color: #8a8d91; /* Lighter grey for timestamp */
  margin-top: 5px;
  padding-left: 10px; /* Align with message bubble */
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
  gap: 10px; /* Spacing between buttons */
  margin-top: 10px; /* Space above suggestion buttons */
  align-self: flex-start; /* Align with Rico's message */
  padding-left: 10px; /* Indent slightly */
}

.suggestion-btn {
  background-color: #e7f3ff; /* Light blue background */
  color: #1877f2; /* Facebook blue for text */
  border: 1px solid #cfe2f3; /* Slightly darker blue border */
  padding: 8px 15px;
  border-radius: 20px; /* Pill-shaped buttons */
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.suggestion-btn:hover {
  background-color: #dcebff;
  border-color: #b9d7f1;
}

.chat-input-area {
  padding: 15px 20px;
  background-color: #ffffff; /* White background for input area */
  border-top: 1px solid #e0e0e0; /* Light border */
  display: flex;
  flex-direction: column; /* Stack upload area and input wrapper */
  gap: 10px; /* Space between upload and input areas */
}

.pdf-upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pdf-upload-label {
  font-size: 0.9em;
  color: #333;
}

.pdf-upload-input {
  font-size: 0.9em;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1; /* Allow input to take available space */
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f0f2f5; /* Light grey background for the input field itself */
  border-radius: 25px; /* Rounded wrapper */
  padding: 5px 10px;
}

.input-icon {
  font-size: 1.2em;
  color: #606770; /* Icon color */
  margin-right: 8px;
  margin-left: 5px;
}

.text-input {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 10px;
  font-size: 1em;
  background-color: transparent; /* Make input transparent to show wrapper's bg */
  color: #1c1e21;
}

.text-input::placeholder {
  color: #8a8d91; /* Placeholder text color */
}

.send-button {
  background-color: #1877f2; /* Facebook blue */
  color: white;
  border: none;
  border-radius: 20px; /* Rounded button */
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9em;
  font-weight: 600;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #166fe5; /* Slightly darker blue on hover */
}

.send-icon {
  margin-left: 8px;
  font-size: 1.2em; /* Make icon slightly larger */
}

.pro-tip {
  font-size: 0.8em;
  color: #606770; /* Medium grey */
  text-align: center;
  margin-top: 10px;
}
</style>