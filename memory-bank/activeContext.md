# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2025-05-17 14:23:57 - Log of updates made.

*

*   [2025-05-17 15:27:03] - Debugging backend server: Added global error handlers to `server.js` to catch silent exit reason.
*   [2025-05-17 17:37:53] - Debugging backend server: Added verbose logging around `app.listen()` and a keep-alive interval log to [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1) to further investigate silent exit.
*   [2025-05-17 17:40:47] - Debugging `POST /api/upload` 500 Internal Server Error. Backend server is running, but an error occurs within the route handler. Awaiting backend logs.
*   [2025-05-17 19:13:48] - Debugging `POST /api/upload` 500 Error: Changed Alibaba Bailian SDK calls in [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1) to use plain objects for request parameters instead of `new SDK.RequestObject()`. Awaiting test results.
*   [2025-05-17 19:16:14] - Removed keep-alive interval logging from [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1) as it's no longer needed for diagnosing server startup.
## Current Focus
*   [2025-05-18 00:15:14] - Debugging Qwen API 422 Error: Modified [`ai-financial-app/backend/services/qwenExternalApiService.js`](ai-financial-app/backend/services/qwenExternalApiService.js:1) to always send the `message` field, even if empty, when a file is uploaded. This is to resolve the "Field required" error from the Qwen API.

*   [2025-05-17 15:14:00] - Current focus is completing Phase 5, Part 1: Prepare for Vercel Deployment. Created `vercel.json` and made backend adjustments.
*   [2025-05-17 15:11:12] - Current focus is completing Phase 4: Dashboard & Data Visualization. Frontend display and charting are implemented. Next is Phase 5: Refinement, Testing & Vercel Deploy.

## Recent Changes
*   [2025-05-17 19:41:00] - Migrated frontend chat functionality to new API endpoint (`http://47.236.92.42:8000/chat`).
    *   Updated API calls in [`ai-financial-app/frontend/src/views/ChatView.vue`](ai-financial-app/frontend/src/views/ChatView.vue:0) for PDF uploads and text messages.
    *   Created initial unit tests in [`ai-financial-app/frontend/src/views/__tests__/ChatView.spec.js`](ai-financial-app/frontend/src/views/__tests__/ChatView.spec.js:0).
*   [2025-05-17 15:18:17] - Debugged PDF upload 404 error: Configured Vite proxy in [`ai-financial-app/frontend/vite.config.js`](ai-financial-app/frontend/vite.config.js:1) to forward `/api` requests to the backend at `http://localhost:3000`.

*   [2025-05-17 15:11:12] - Completed Phase 4, Part 2 (Sub-task): Implemented Frontend Dashboard Display and Charting.
    *   Frontend ([`ai-financial-app/frontend/src/views/DashboardView.vue`](ai-financial-app/frontend/src/views/DashboardView.vue:0)):
        *   Installed `chart.js` and `vue-chartjs`.
        *   Fetched data from `/api/dashboard-data` on component mount.
        *   Displayed `totalIncome`, `totalExpenses`, and `currency`.
        *   Implemented a bar chart using `vue-chartjs` to show income vs. expenses.
        *   Added loading state and error handling for data fetching.
*   [2025-05-17 15:09:10] - Completed Phase 4, Part 1 (Sub-task): Enabled AI to Generate JSON for Dashboard.
    *   Backend ([`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:316)):
        *   Modified `GET /api/dashboard-data` endpoint.
        *   Endpoint now uses `latestExtractedPdfText` and prompts `Qwen-Turbo-Latest` to return financial summary (income, expenses, currency) in a specific JSON format: `{"totalIncome": 0, "totalExpenses": 0, "currency": "USD"}`.
        *   Implemented robust error handling for AI call and `JSON.parse()` of the AI's response, including cleaning potential markdown wrappers.
        *   Logs raw AI response and parsed JSON/error.
*   [2025-05-17 15:02:00] - Completed Phase 2, Part 2 (Sub-task): Integrated Alibaba Cloud `Qwen-Turbo-Latest` for chat functionality.
    *   Backend ([`server.js`](ai-financial-app/backend/server.js:1)):
        *   Added `latestExtractedPdfText` global variable to store PDF text.
        *   Modified `/api/upload` to populate `latestExtractedPdfText`.
        *   Implemented `/api/chat` endpoint:
            *   Accepts `userMessage`.
            *   Uses `latestExtractedPdfText` as context.
            *   Calls `Qwen-Turbo-Latest` via Bailian SDK.
            *   Returns AI response.
            *   Includes error handling for empty context and AI errors.
    *   Frontend ([`ChatView.vue`](ai-financial-app/frontend/src/views/ChatView.vue:0)):
        *   Added chat input field and send button.
        *   Added conversation display area.
        *   Implemented logic to send user messages to `/api/chat` and display AI responses.
        *   Added basic error display for chat.
*   [2025-05-17 14:53:00] - Completed Phase 2, Part 2 (Sub-task): Integrated Alibaba Cloud `Qwen-VL-Max-Latest` for PDF content extraction in [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1).
    *   Installed `@alicloud/bailian20230601` SDK.
    *   Updated `/api/upload` endpoint to call Bailian API, process PDF, log results, and return extracted text snippet.
    *   Added temporary file deletion after processing.
*   [2025-05-17 14:30:00] - Completed Phase 1: Setup & Basic Structure. Created root directory, initialized Node.js backend (Express, Multer) and Vue.js frontend (Vite, Vue Router). Created placeholder views and basic app layout. Set up basic backend server with API stubs.
*   [2025-05-17 14:37:00] - Completed Phase 2, Part 1: PDF Upload and Backend Setup.
    *   Backend: Added `dotenv`, created `.env` and `.env.example`. Configured `multer` in `server.js` for PDF uploads to `/api/upload` endpoint with basic error handling and logging.
    *   Frontend: Added file input and upload button to `ChatView.vue` with logic to send PDF to backend and display success/error messages.

## Open Questions/Issues

*