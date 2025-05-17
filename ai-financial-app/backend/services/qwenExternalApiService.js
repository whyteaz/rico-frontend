const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const QWEN_CHAT_API_URL = 'http://47.236.92.42:8000/chat/';

/**
 * Forwards a chat request to the Qwen Chat Service API.
 *
 * @param {string} message - The user's message.
 * @param {string} sessionId - The session ID for the chat.
 * @param {Array<object>} files - An array of file objects (from multer, req.files).
 * @returns {Promise<object>} The response from the Qwen Chat Service API.
 * @throws {Error} If the request to the Qwen Chat Service API fails.
 */
async function forwardChatRequest(message, sessionId, files) {
  const formData = new FormData();

  // Always append message; send an empty string if no message is provided.
  formData.append('message', message || '');
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', fs.createReadStream(file.path), file.originalname);
    });
  }

  try {
    console.log(`Forwarding chat request to Qwen API. Session ID: ${sessionId}, Message: ${message ? message.substring(0, 50) + '...' : 'N/A'}, Files: ${files ? files.length : 0}`);
    const response = await axios.post(QWEN_CHAT_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      // It's good practice to set a timeout for external API calls
      // timeout: 30000, // 30 seconds
    });
    console.log('Successfully received response from Qwen API.');
    if (response.data && typeof response.data.response === 'string') {
      return { reply: response.data.response };
    } else {
      console.error('Qwen API response is malformed. Expected "response.data.response" to be a string. Received:', response.data);
      throw new Error('Qwen API response is malformed: "response" field is missing or not a string.');
    }
  } catch (error) {
    console.error('Error forwarding chat request to Qwen API:', error.message);
    if (error.response) {
      console.error('Qwen API Error Response Data:', error.response.data);
      console.error('Qwen API Error Response Status:', error.response.status);
      console.error('Qwen API Error Response Headers:', error.response.headers);
      // Re-throw a more specific error or handle it as per application requirements
      throw new Error(`Qwen API request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('Qwen API No Response Received:', error.request);
      throw new Error('No response received from Qwen API.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error setting up Qwen API request: ${error.message}`);
    }
  }
}

module.exports = {
  forwardChatRequest,
};