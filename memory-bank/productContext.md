# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-05-18 01:07:35 - Log of updates made will be appended as footnotes to the end of this file.

*

## Project Goal

* To develop an AI-powered financial web application tailored for users with low financial literacy within a 10-hour hackathon timeframe.

## Key Features

* Basic Vue.js Page Structure (Chat, Dashboard, Settings)
* PDF Bank Statement Upload
* Backend PDF Processing (Node.js & Alibaba Cloud Qwen-VL-Max-Latest)
* Chat Interaction (Alibaba Cloud Qwen-Turbo-Latest)
* Dashboard Display (Data from AI, simple chart)
* Simplified/Mock User Authentication
* Deployment to Vercel

## Overall Architecture

* **Frontend:** Vue.js (App.vue, ChatView.vue, DashboardView.vue, SettingsView.vue, components for PDF upload and chart)
* **Backend:** Node.js with Express.js (API endpoints: /api/dashboard-data; Service modules for PDF processing). Chat and PDF upload functionalities will be handled by an external Qwen API.
* **Alibaba Cloud Services:** Qwen-VL-Max-Latest (OCR/data extraction via external API), Qwen-Turbo-Latest (NLP, chat, JSON generation via external API)
2025-05-18 01:08:19 - Initial project context populated from PLAN.md.
[2025-05-18 01:18:26] - Updated architecture to reflect Qwen external API integration for chat and file upload.