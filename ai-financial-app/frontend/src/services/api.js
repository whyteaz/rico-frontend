import axios from 'axios';

/**
 * @file API service module for handling requests to the backend.
 * Implements a fallback mechanism to a local backend if the primary API fails.
 */

const LOCAL_BACKEND_BASE_URL = 'http://localhost:3000';
const PRIMARY_API_BASE_URL = ''; // Relative path for primary API

// Create an axios instance
const apiClient = axios.create({
  baseURL: PRIMARY_API_BASE_URL,
});

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a network error or a server error that warrants a retry
    const shouldRetry =
      !error.response || // Network error
      [500, 502, 503, 504].includes(error.response.status); // Server errors

    // Avoid retry loops and ensure it's not already a fallback attempt
    if (shouldRetry && !originalRequest._isRetry && originalRequest.baseURL !== LOCAL_BACKEND_BASE_URL) {
      originalRequest._isRetry = true; // Mark it as a retry
      originalRequest.baseURL = LOCAL_BACKEND_BASE_URL; // Switch to fallback URL

      // Log the fallback attempt
      console.warn(
        `Primary API call failed for ${originalRequest.url}. Retrying with local backend: ${LOCAL_BACKEND_BASE_URL}${originalRequest.url}`
      );
      return apiClient(originalRequest); // Retry the request with the new baseURL
    }

    // If not a retryable error or already retried, reject the promise
    return Promise.reject(error);
  }
);

/**
 * Fetches dashboard data.
 * @returns {Promise<Object>} The API response.
 */
export const getDashboardData = () => {
  return apiClient.get('/api/dashboard-data');
};

export default apiClient;

/**
 * Sends a chat message with V2 of the API, supporting FormData.
 * @param {FormData} formData - The form data containing message, session_id, and optionally files.
 * @returns {Promise<Object>} The API response.
 */
export const sendChatMessageV2 = (formData) => {
  return apiClient.post('/api/v2/chat', formData);
  // Axios will automatically set Content-Type to multipart/form-data for FormData
};