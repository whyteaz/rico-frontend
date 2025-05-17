<template>
  <div class="chat-layout-container">
    <!-- Main Chat Area -->
    <div class="chat-view-container">
      <div class="chat-header">
        <img src="../assets/rico.jpeg" alt="Rico Avatar" class="rico-avatar-header" />
        <div class="header-info">
          <h1 class="header-title">Rico</h1>
          <span class="header-tag">Finance-AI Trained</span>
        </div>
        <p class="header-tagline">Trained to understand your wallet, not just your words.</p>
      </div>

      <div class="chat-messages-area" ref="chatMessagesAreaRef">
        <div v-for="message in messages" :key="message.id" :class="['message', message.sender === 'user' ? 'user-message' : 'rico-message']">
          <img v-if="message.sender === 'ai'" src="../assets/rico.jpeg" alt="Rico Avatar" class="rico-avatar-message" />
          <div class="message-content-wrapper">
            <div class="message-content" v-if="message.sender === 'ai'" v-html="markdownToHtml(message.text)"></div>
            <div class="message-content" v-else><p>{{ message.text }}</p></div>
            <span class="message-timestamp">{{ message.timestamp || 'just now' }}</span>
          </div>
        </div>
        <!-- Suggestion buttons -->
        <div class="suggestion-buttons-container" v-if="messages.length > 0 && messages[messages.length - 1].sender === 'ai' && messages[messages.length -1].text.includes('?')">
           <!-- Example, real condition might be more complex based on API response -->
          <button class="suggestion-btn" @click="handleSuggestionClick('Explain this further')">Explain this further</button>
          <button class="suggestion-btn" @click="handleSuggestionClick('What are my options?')">What are my options?</button>
          <button class="suggestion-btn" @click="handleSuggestionClick('How does this affect my budget?')">How does this affect my budget?</button>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-wrapper">
          <label for="pdf-upload-input" class="attachment-btn">
            <span>📎</span>
            <input
              type="file"
              id="pdf-upload-input"
              ref="fileInputRef"
              @change="handleFileUpload"
              accept=".pdf"
              style="display: none;"
            />
          </label>
          <input
            type="text"
            placeholder="Ask Rico anything about your finances..."
            class="text-input"
            v-model="chatInputValue"
            @keyup.enter="handleSendMessage"
          />
          <button class="send-button" @click="handleSendMessage">
            <span>Send</span>
            <span class="send-icon">➤</span>
          </button>
        </div>
        <p class="pro-tip">Pro tip: Drag and drop your bank statement PDF or CSV directly onto Rico!</p>
      </div>
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

// Basic Markdown to HTML converter
const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  let html = markdown;
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
  // Italics: *text* or _text_
  html = html.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
  // Unordered lists: - item or * item
  html = html.replace(/^- (.*$)/gm, '<ul>\n  <li>$1</li>\n</ul>');
  html = html.replace(/^\* (.*$)/gm, '<ul>\n  <li>$1</li>\n</ul>');
  // Consolidate multiple <ul> tags from adjacent list items
  html = html.replace(/<\/ul>\s*<ul>/gm, '');
  // Paragraphs (simple handling for now)
  // html = html.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  // For now, let's just replace newlines with <br> for simplicity within message bubbles
  html = html.replace(/\n/g, '<br>');
  return html;
};


onMounted(() => {
  sessionId.value = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
});

const messages = ref([
  {
    id: Date.now(),
    text: 'Hey there, I\'m Rico, your finance buddy! Ready to make money stuff way less hectic and a lot more manageable?\n\nTry asking:\n- What can you do?\n- How can you help me with my budget?',
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

const handleSuggestionClick = (suggestionText) => {
  // const buttonText = event.target.textContent; // No longer using event.target
  chatInputValue.value = suggestionText;
  handleSendMessage(); // Send the suggestion as a message immediately
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

  try {
    const response = await sendChatMessageV2(formData);
    messages.value.pop(); // Remove "processing" message

    if (response && response.data) {
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
      messages.value.pop();
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
  formData.append('message', text);
  formData.append('session_id', sessionId.value);

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

nextTick(() => {
  scrollToBottom();
});

</script>

<style scoped>
/* Overall Layout */
.chat-layout-container {
  display: flex;
  height: 100vh;
  background-color: #1A1D21; /* Main Background */
  color: #E2E8F0; /* Light gray/off-white text */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Main Chat View Container */
.chat-view-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  /* Removed max-width and margin:auto to allow full flex growth */
}

.chat-header {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #2D3748; /* Separator */
  background-color: #1A1D21; /* Match main background */
}

.rico-avatar-header {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
  background-color: #4A5568; /* Placeholder bg */
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 1.3em; /* Adjusted size */
  color: #E2E8F0;
  margin: 0;
  font-weight: bold;
}

.header-tag {
  background-color: #14B8A6; /* Teal/Cyan accent */
  color: #0F172A; /* Dark text */
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: 500;
  margin-top: 4px;
  align-self: flex-start;
}

.header-tagline {
  font-size: 0.85em;
  color: #A0AEC0; /* Lighter gray */
  margin-left: auto; /* Pushes to the right */
  padding-right: 20px;
}

.chat-messages-area {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  margin-bottom: 20px;
  max-width: 75%;
}

.rico-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
}

.rico-avatar-message {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
  align-self: flex-start; /* Align with top of message bubble */
   background-color: #4A5568; /* Placeholder bg */
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
}

.message-content {
  padding: 12px 18px;
  border-radius: 18px;
  line-height: 1.6;
}

.message-content p {
  margin: 0 0 5px 0;
}
.message-content p:last-child {
  margin-bottom: 0;
}
.message-content strong { color: #E2E8F0; }
.message-content em { color: #CBD5E0; }
.message-content ul {
  margin: 5px 0 5px 20px;
  padding: 0;
}
.message-content li {
  margin-bottom: 3px;
}


.rico-message .message-content {
  background-color: #2D3748; /* Slightly lighter dark gray */
  color: #E2E8F0;
  border-radius: 0 18px 18px 18px;
}

.user-message .message-content {
  background-color: #14B8A6; /* Teal/Cyan accent for user messages */
  color: #0F172A; /* Dark text for user messages */
  border-radius: 18px 0 18px 18px;
}

.message-timestamp {
  font-size: 0.75em;
  color: #718096; /* Medium-light gray for timestamp */
  margin-top: 6px;
}
.rico-message .message-timestamp {
  align-self: flex-start;
  padding-left: 0; /* No extra padding if avatar is present */
}
.user-message .message-timestamp {
  align-self: flex-end;
}

.suggestion-buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  margin-left: 44px; /* Align with Rico's message content (avatar width + margin) */
  align-self: flex-start;
}

.suggestion-btn {
  background-color: #2D3748; /* Dark gray background */
  color: #E2E8F0; /* Light text */
  border: 1px solid #4A5568; /* Slightly lighter border */
  padding: 8px 18px;
  border-radius: 20px; /* Pill-shaped */
  font-size: 0.85em;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.suggestion-btn:hover {
  background-color: #4A5568;
  border-color: #718096;
}

.chat-input-area {
  padding: 15px 20px;
  background-color: #1A1D21; /* Match main background */
  border-top: 1px solid #2D3748; /* Separator */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #2D3748; /* User Input Area Background */
  border-radius: 25px;
  padding: 8px 10px;
}

.attachment-btn {
  background: none;
  border: none;
  color: #A0AEC0; /* Lighter gray for icon */
  font-size: 1.4em;
  cursor: pointer;
  padding: 5px 10px 5px 5px;
}
.attachment-btn:hover {
  color: #E2E8F0;
}


.text-input {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 10px;
  font-size: 1em;
  background-color: transparent;
  color: #E2E8F0;
}

.text-input::placeholder {
  color: #A0AEC0; /* Lighter gray for placeholder */
}

.send-button {
  background-color: #14B8A6; /* Teal/Cyan accent */
  color: #0F172A; /* Dark text */
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9em;
  font-weight: 600;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #0D9488; /* Darker Teal/Cyan */
}

.send-icon {
  margin-left: 8px;
  font-size: 1.2em;
}

.pro-tip {
  font-size: 0.8em;
  color: #A0AEC0; /* Lighter gray */
  text-align: center;
  margin-top: 5px; /* Reduced margin */
}
</style>