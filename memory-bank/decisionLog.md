# Decision Log

This file records architectural and implementation decisions using a list format.
2025-05-17 14:24:10 - Log of updates made.

*

## Decision

*

## Rationale 

*

## Implementation Details

*
---
## Decision
*   [2025-05-17 19:41:00] - Migrated frontend to use a new unified chat API endpoint (`http://47.236.92.42:8000/chat`) for both PDF uploads and text messages.

## Rationale
*   Task requirement to consolidate chat functionalities (text and PDF upload) into a single new API endpoint.
*   This simplifies the backend API structure and aligns with the provided new API details.

## Implementation Details
*   Modified [`ai-financial-app/frontend/src/views/ChatView.vue`](ai-financial-app/frontend/src/views/ChatView.vue:0):
    *   Defined a constant `NEW_API_ENDPOINT` with the value `http://47.236.92.42:8000/chat`.
    *   Updated the `handleFileUpload` function's `fetch` call to use `NEW_API_ENDPOINT` for PDF uploads (via `FormData`).
    *   Updated the `sendChatMessage` function's `fetch` call to use `NEW_API_ENDPOINT` for text messages (via JSON payload).
*   No existing API service module was found, so the endpoint URL was defined directly in the component for this task.
---
## Decision
*   [2025-05-17 19:13:48] - Refactored Alibaba Bailian SDK calls to pass plain objects for request parameters.

## Rationale
*   The backend was throwing a `TypeError: AlibabaBailian.UploadFileRequest is not a constructor` (and likely would for `CompletionsRequest` too).
*   This indicates that the request objects (e.g., `UploadFileRequest`) are not meant to be instantiated with `new` directly from the main `AlibabaBailian` SDK object.
*   A common SDK pattern is to expect plain JavaScript objects conforming to the required structure for request parameters, especially if Context7 could not find specific documentation for model classes.

## Implementation Details
*   Modified [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1) in the `/api/upload`, `/api/chat`, and `/api/dashboard-data` routes.
*   Changed from `new AlibabaBailian.UploadFileRequest({...})` to `const uploadFileParams = {...};` and passed `uploadFileParams` to `bailianClient.uploadFile()`.
*   Similarly, changed `new AlibabaBailian.CompletionsRequest({...})` to `const completionsParams = {...};` and passed `completionsParams` to `bailianClient.completions()` in all relevant locations.
*   Added more specific console logs for the parameters being sent.
---
## Decision
*   [2025-05-17 19:16:14] - Removed keep-alive interval logging from backend server.

## Rationale
*   The keep-alive interval was added as a temporary debugging step to diagnose silent server exits.
*   The server is now confirmed to be running, so this verbose logging is no longer necessary and can be removed to clean up console output.
*   Other verbose logging around `app.listen()` was also part of this specific debugging step and has been kept for now, but the interval was the most noisy.

## Implementation Details
*   Removed the `setInterval` block that logged "Backend keep-alive ping" from [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1).
---
## Decision
*   [2025-05-17 17:37:37] - Added verbose logging and keep-alive interval to backend server for diagnosing silent exit.

## Rationale
*   The backend server continues to quit silently even with global error handlers.
*   More detailed logging around the `app.listen()` call is needed to pinpoint the exact stage of failure.
*   A `setInterval` log will confirm if the process is truly exiting or becoming unresponsive.
*   Added a `server.on('error', ...)` handler to catch specific errors during `app.listen()` (e.g. EADDRINUSE).

## Implementation Details
*   Modified [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1) to:
    *   Log "Attempting to start server..." before `app.listen()`.
    *   Log "Server startup sequence fully completed." as the last step in the `app.listen()` callback.
    *   Attach an error handler to the `server` object returned by `app.listen()` to log specific listen errors.
    *   Add `setInterval` to log a "Backend keep-alive ping" every 5 seconds.
---
## Decision
*   [2025-05-17 15:26:50] - Added global error handlers to backend server.

## Rationale
*   The backend server was quitting silently after startup, indicating a possible unhandled exception or promise rejection.
*   Global handlers for `uncaughtException` and `unhandledRejection` will log detailed error information to the console, helping to diagnose the cause of the premature termination.

## Implementation Details
*   Added `process.on('uncaughtException', ...)` and `process.on('unhandledRejection', ...)` at the beginning of [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1).
*   These handlers will log the error/reason and stack trace, then exit the process (for `uncaughtException`) or log the issue (for `unhandledRejection`).
---
## Decision
*   [2025-05-17 15:18:06] - Configured Vite development server proxy for API requests.

## Rationale
*   The frontend (Vite dev server) and backend (Node.js server) run on different ports during development.
*   Without a proxy, frontend requests to `/api/...` would fail with a 404 error as the Vite server doesn't handle these routes directly.
*   This proxy forwards requests made to `/api` on the Vite development server to the backend server (assumed to be `http://localhost:3000`).

## Implementation Details
*   Modified [`ai-financial-app/frontend/vite.config.js`](ai-financial-app/frontend/vite.config.js:1).
*   Added a `server.proxy` configuration:
    ```javascript
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Backend server address
          changeOrigin: true, // Recommended for virtual hosted sites
        },
      },
    }
    ```
*   This ensures that any request from the frontend to a path starting with `/api` will be transparently proxied to the backend server at `http://localhost:3000/api/...`.
---
## Decision
*   [2025-05-17 15:14:00] - Created `ai-financial-app/vercel.json` to configure Vercel deployment.

## Rationale
*   Required for Vercel to understand how to build the frontend (Vite) and route requests to the backend Node.js serverless functions.
*   Fulfills Part 1 of "Phase 5: Refinement, Testing & Vercel Deploy" as per project plan ([`PLAN.md`](PLAN.md:0)).

## Implementation Details
*   Created [`ai-financial-app/vercel.json`](ai-financial-app/vercel.json:0) with the following structure:
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "frontend/package.json",
          "use": "@vercel/static-build",
          "config": { "distDir": "dist" }
        },
        {
          "src": "backend/server.js",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        { "src": "/api/(.*)", "dest": "backend/server.js" },
        { "src": "/(.*)", "dest": "frontend/dist/index.html" }
      ]
    }
    ```
*   This configuration specifies:
    *   Frontend build using `@vercel/static-build` targeting `frontend/package.json` and outputting to `frontend/dist`.
    *   Backend Node.js function using `@vercel/node` targeting `backend/server.js`.
    *   API routes (`/api/*`) rewritten to `backend/server.js`.
    *   All other routes rewritten to `frontend/dist/index.html` for client-side routing.
---
## Decision
*   [2025-05-17 15:14:00] - Modified [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1) for Vercel compatibility.

## Rationale
*   Vercel requires the main server file to export the Express `app` instance for serverless deployment.
*   Ensures the backend listens on the port provided by Vercel's environment.
*   Fulfills Part 1 of "Phase 5: Refinement, Testing & Vercel Deploy".

## Implementation Details
*   Checked that `app.listen(process.env.PORT || 3000)` was already present in [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:27).
*   Added `module.exports = app;` at the end of [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:426) to export the Express application instance.
---
## Decision
*   [2025-05-17 14:35:31] - Use Alibaba Cloud's `Qwen-VL-Max-Latest` model for PDF extraction.

## Rationale
*   User decision based on project requirements for the AI Financial App hackathon. This model is specified for handling PDF content extraction.

## Implementation Details
*   The backend will need to integrate the appropriate Alibaba Cloud SDK or API to interact with `Qwen-VL-Max-Latest`.
*   API keys (`ALIBABA_CLOUD_ACCESS_KEY_ID`, `ALIBABA_CLOUD_ACCESS_KEY_SECRET`) will be managed via the `.env` file in the backend.
---
## Decision
*   [2025-05-17 14:39:19] - Updated `PLAN.md` to specify `Qwen-VL-Max-Latest` for PDF extraction.

## Rationale
*   User request to reflect a more specific model choice for PDF processing, changing from generic "Alibaba Cloud Document Intelligence / Intelligent Document Processing" to `Qwen-VL-Max-Latest`.

## Implementation Details
*   `PLAN.md` was updated in sections: "Architecture Overview", "Technology Choices", "High-Level 10-Hour Timeline", and "Next Steps After Plan Approval".
*   This ensures the project plan accurately reflects the chosen technology for PDF data extraction.
---
## Decision
*   [2025-05-17 14:53:00] - Implemented Alibaba Cloud `Qwen-VL-Max-Latest` integration for PDF extraction.

## Rationale
*   Fulfills Part 2 of the "Core AI & PDF Logic" phase as per project plan and user request. Enables the backend to process uploaded PDF files and extract their textual content using the specified AI model.

## Implementation Details
*   Installed the `@alicloud/bailian20230601` Node.js SDK in the backend project.
*   Updated [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1):
    *   Initialized the Bailian SDK client using API keys from [`.env`](ai-financial-app/backend/.env:0).
    *   Modified the `/api/upload` endpoint to be asynchronous.
    *   The endpoint now uses `bailianClient.uploadFile()` to upload the PDF (received via `multer`) to Bailian's temporary storage, obtaining a `fileId`.
    *   It then calls `bailianClient.completions()` with the `modelId: "qwen-vl-max"`, the `fileId`, and a prompt to extract text.
    *   The full AI response and the extracted text (or a snippet) are logged to the console.
    *   The JSON response to the frontend is updated to include processing status and a snippet of the extracted text (e.g., `{"message": "File processed successfully", "extractedTextSnippet": "...", "filename": "..."}`).
    *   Basic error handling for the AI API calls has been added.
    *   The temporary PDF file in the local `uploads/` directory is deleted after processing.
---
## Decision
*   [2025-05-17 15:02:15] - Implemented Alibaba Cloud `Qwen-Turbo-Latest` integration for chat functionality, using extracted PDF text as context.

## Rationale
*   Fulfills Part 3 of the "Core AI &amp; PDF Logic" phase as per project plan ([`PLAN.md`](PLAN.md:0)) and user request. Enables context-aware chat with the AI based on an uploaded financial statement.
*   The decision to store extracted PDF text in a backend global variable (`latestExtractedPdfText` in [`server.js`](ai-financial-app/backend/server.js:1)) was made for hackathon simplicity, avoiding database setup.

## Implementation Details
*   Backend ([`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:1)):
    *   Declared `let latestExtractedPdfText = "";` globally.
    *   Modified the `/api/upload` endpoint: After successful text extraction by `Qwen-VL-Max-Latest`, the full `extractedText` is stored in `latestExtractedPdfText`.
    *   Implemented the `/api/chat` (POST) endpoint:
        *   Accepts `{"userMessage": "..."}` in the request body.
        *   Checks if `latestExtractedPdfText` is populated; returns an error if not.
        *   Constructs a prompt for `Qwen-Turbo-Latest` combining `latestExtractedPdfText` (context) and `userMessage`.
        *   Calls `bailianClient.completions()` with `modelId: "qwen-turbo"`.
        *   Logs the full AI response.
        *   Extracts the textual answer from the AI response.
        *   Returns `{"aiResponse": "..."}` to the frontend.
        *   Includes error handling for missing `userMessage`, empty context, AI service initialization, and AI API call failures.
*   Frontend ([`ai-financial-app/frontend/src/views/ChatView.vue`](ai-financial-app/frontend/src/views/ChatView.vue:0)):
    *   Added `userMessage` (ref) for the chat input.
    *   Added `conversation` (ref array) to store chat history (user and AI messages).
    *   Added `chatError` (ref) to display errors.
    *   Implemented `sendChatMessage` async function:
        *   Appends user's message to `conversation`.
        *   Makes a POST request to `/api/chat` with `userMessage`.
        *   Appends AI's response (or error) to `conversation`.
    *   Added an input field and "Send" button, enabling chat only after successful PDF upload.
    *   Added a `div.conversation-area` to display messages.
    *   Added basic styling for chat elements.
---
## Decision
*   [2025-05-17 15:08:51] - Implemented `GET /api/dashboard-data` endpoint in [`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:316) to generate structured JSON for dashboard using `Qwen-Turbo-Latest`.

## Rationale
*   Fulfills Part 1 of "Phase 4: Dashboard &amp; Data Visualization" as per project plan ([`PLAN.md`](PLAN.md:91)).
*   Enables the frontend to fetch summarized financial data (total income, total expenses, currency) derived by the AI from the `latestExtractedPdfText`.
*   The JSON structure is defined as `{"totalIncome": 0, "totalExpenses": 0, "currency": "USD"}`.

## Implementation Details
*   Backend ([`ai-financial-app/backend/server.js`](ai-financial-app/backend/server.js:316)):
    *   Modified the existing `/api/dashboard-data` (GET) endpoint.
    *   Checks if `latestExtractedPdfText` is available; returns an error if not.
    *   Constructs a specific prompt for `Qwen-Turbo-Latest` instructing it to analyze `latestExtractedPdfText` and return data strictly in the defined JSON format.
    *   Calls `bailianClient.completions()` with `modelId: "qwen-turbo"`.
    *   Logs the raw AI response.
    *   Attempts to `JSON.parse()` the AI's response string. Includes logic to clean potential markdown ```json ... ``` wrappers.
    *   If parsing is successful, returns the parsed JSON object.
    *   If parsing fails or the AI call fails, returns an appropriate error JSON.
    *   Includes error handling for empty context, AI service initialization, AI API call failures, and JSON parsing errors.
---
## Decision
*   [2025-05-17 15:11:12] - Implemented frontend dashboard display and charting using `vue-chartjs`.

## Rationale
*   Fulfills Part 2 of "Phase 4: Dashboard &amp; Data Visualization" as per project plan ([`PLAN.md`](PLAN.md:0)).
*   Provides a visual representation of income vs. expenses and displays key financial metrics fetched from the backend.
*   `vue-chartjs` was chosen as suggested in [`PLAN.md`](PLAN.md:0) for its simplicity and integration with Vue.js.

## Implementation Details
*   Frontend ([`ai-financial-app/frontend/src/views/DashboardView.vue`](ai-financial-app/frontend/src/views/DashboardView.vue:0)):
    *   Installed `chart.js` and `vue-chartjs` as dependencies.
    *   On component mount (`onMounted`), an asynchronous function `fetchDashboardData` is called.
    *   `fetchDashboardData` makes a GET request to `/api/dashboard-data`.
    *   The fetched `totalIncome`, `totalExpenses`, and `currency` are stored in reactive variables and displayed.
    *   A `<Bar>` chart component from `vue-chartjs` is used.
    *   Chart.js elements (`Title`, `Tooltip`, `Legend`, `BarElement`, `CategoryScale`, `LinearScale`) are imported and registered.
    *   `chartData` is a reactive object configured with labels `['Income', 'Expenses']` and a dataset containing the fetched income and expense values. Background colors are set to green for income and red for expenses.
    *   `chartOptions` are set for responsiveness.
    *   Loading and error states are handled, displaying appropriate messages to the user.
    *   Basic styling is applied for readability.
---
## Decision
*   [2025-05-17 19:55:39] - Implemented an API fallback mechanism in the Vue.js frontend.

## Rationale
*   To improve resilience by automatically retrying API calls to a local backend (`http://localhost:3000`) if the primary API endpoints fail.
*   This addresses potential network issues or primary server downtime, ensuring a better user experience during development and testing.
*   Centralizes API call logic and error handling, making the codebase cleaner and easier to maintain.

## Implementation Details
*   Installed `axios` as an HTTP client in the frontend ([`ai-financial-app/frontend/package.json`](ai-financial-app/frontend/package.json:0)).
*   Created a new API service module: [`ai-financial-app/frontend/src/services/api.js`](ai-financial-app/frontend/src/services/api.js:0).
    *   Defined `LOCAL_BACKEND_BASE_URL` as `http://localhost:3000`.
    *   Configured an `axios` instance with a response interceptor.
    *   The interceptor checks for network errors or specific HTTP status codes (500, 502, 503, 504).
    *   If a retry is warranted and it's not already a fallback attempt, the `baseURL` is switched to `LOCAL_BACKEND_BASE_URL`, and the request is retried once.
    *   Exported functions (`uploadPdf`, `sendMessage`, `getDashboardData`) for specific API endpoints (`/api/upload-pdf`, `/api/chat`, `/api/dashboard-data`).
*   Refactored Vue components to use the new API service:
    *   [`ai-financial-app/frontend/src/views/ChatView.vue`](ai-financial-app/frontend/src/views/ChatView.vue:0): Updated `handleFileUpload` and `sendChatMessage` methods to use `uploadPdf` and `sendMessage` from the API service.
    *   [`ai-financial-app/frontend/src/views/DashboardView.vue`](ai-financial-app/frontend/src/views/DashboardView.vue:0): Updated `fetchDashboardData` method to use `getDashboardData` from the API service.
*   Error handling in components was updated to work with `axios` error structure.