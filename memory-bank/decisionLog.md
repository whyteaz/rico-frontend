# Decision Log

This file records architectural and implementation decisions using a list format.
2025-05-18 01:08:04 - Log of updates made.

*

## Decision

* [2025-05-18 01:18:58] - Switch from local backend chat/upload endpoints to an external Qwen API.

## Rationale

* The user has directed this change, superseding previous efforts to debug local endpoints.
* The Qwen API is expected to provide robust file upload and chat functionalities.

## Implementation Details

* Modify frontend ([`ChatView.vue`](ai-financial-app/frontend/src/views/ChatView.vue:0) and [`api.js`](ai-financial-app/frontend/src/services/api.js:0)) to call Qwen API endpoints.
* Refer to [`docs/qwen_external_chat_integration_summary.md`](docs/qwen_external_chat_integration_summary.md) for API details.
* Deprecate local backend calls for `/api/upload-pdf` and `/api/chat`.