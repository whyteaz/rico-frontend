process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1); // Mandatory exit after uncaught exception
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION!');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  // Optionally, you might want to exit here as well, depending on the severity
  // process.exit(1);
});
require('dotenv').config(); // Load environment variables
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AlibabaBailian = require('@alicloud/bailian20230601');
const OpenApi = require('@alicloud/openapi-client');
// const OSS = require('ali-oss'); // Removed ali-oss
const OpenAI = require('openai'); // Added for OpenAI compatible API
const qwenExternalApiService = require('./services/qwenExternalApiService');

// Initialize Alibaba Cloud Bailian Client (for Qwen-Turbo, Qwen-VL-Max via Bailian if needed elsewhere)
let bailianClient;
try {
  const aliConfig = new OpenApi.Config({
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  });
  aliConfig.endpoint = 'bailian.aliyuncs.com';
  bailianClient = new AlibabaBailian.default(aliConfig);
  console.log('Alibaba Cloud Bailian SDK initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Alibaba Cloud Bailian SDK:', error);
}

// Alibaba Cloud OSS Client removed

// Initialize OpenAI Client for DashScope
// Required ENV vars for DashScope:
// DASHSCOPE_API_KEY
let openaiClient;
try {
  // Set OPENAI_API_KEY to DashScope key to satisfy SDK's default check,
  // while apiKey in constructor ensures the correct key is used for DashScope.
  if (process.env.DASHSCOPE_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.DASHSCOPE_API_KEY;
  }
  openaiClient = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY, // Explicitly use DASHSCOPE_API_KEY
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  });
  console.log('OpenAI SDK for DashScope initialized successfully.');
} catch (error) {
  console.error('Failed to initialize OpenAI SDK for DashScope:', error);
}


let latestExtractedPdfText = ""; // Variable to store extracted PDF text for chat context

const app = express();
const port = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for PDF file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Store files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Keep original filename + timestamp to avoid overwrites (optional, but good practice)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept PDF files
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false); // Reject other file types
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB (optional)
});

// Multer configuration for the new /api/v2/chat endpoint
// This will use the same disk storage but allow multiple files and any type by default
const uploadChatV2 = multer({
 storage: storage, // Reuse the same storage configuration
 limits: { fileSize: 10 * 1024 * 1024 * 5 } // Limit file size to 50MB for potentially multiple files (optional)
});

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the AI Financial App Backend!');
});

// API route for PDF upload
app.post('/api/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  try { // Outer try block for enhanced error logging
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file type was not PDF.' });
    }

    console.log('File received by Multer:', {
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });

    if (!openaiClient) {
      console.error('Required OpenAI Client (DashScope) not initialized.');
      return res.status(500).json({ message: `AI Service initialization error: OpenAI Client (DashScope) missing.`, filename: req.file.originalname });
    }

    const localFilePath = req.file.path;
    const originalFileName = req.file.originalname;

    try { // Inner try for existing AI processing logic
      // Step 1: Read the PDF file content
      const pdfBuffer = fs.readFileSync(localFilePath);
      const pdfBase64String = pdfBuffer.toString('base64');
      console.log(`PDF file ${originalFileName} read and encoded to base64.`);

      // Step 2: Call Qwen-VL-Max via DashScope OpenAI-compatible API
      const modelToUse = "qwen-vl-max"; // As per task requirement
      const userPromptText = "Extract all text and structured data from this PDF document.";

      console.log(`Sending request to DashScope ${modelToUse} with base64 PDF data.`);
      const chatCompletion = await openaiClient.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: userPromptText },
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64String
                }
              }
            ]
          }
        ],
        // You might need to adjust parameters like max_tokens depending on expected output size
        // max_tokens: 4096, // Example
      });

      console.log('DashScope AI Full Response:', JSON.stringify(chatCompletion, null, 2));

      let extractedText = "No text extracted or error in AI response structure.";
      
      if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message) {
        const messageContent = chatCompletion.choices[0].message.content;
        if (typeof messageContent === 'string') {
          extractedText = messageContent;
        } else if (Array.isArray(messageContent)) {
          const textPart = messageContent.find(part => part.type === 'text');
          extractedText = textPart ? textPart.text : "No textual content found in AI response parts.";
        } else {
           extractedText = JSON.stringify(messageContent); // Fallback
        }
        
        latestExtractedPdfText = extractedText; // Store for chat context
        console.log('Extracted Text (first 500 chars):', extractedText.substring(0, 500));
        console.log('Stored latestExtractedPdfText (first 100 chars):', latestExtractedPdfText.substring(0,100));
        
        res.json({
          message: 'File processed successfully by AI',
          extractedTextSnippet: extractedText.substring(0, 100) + (extractedText.length > 100 ? '...' : ''),
          filename: originalFileName,
        });
      } else {
        console.error('Unexpected AI response structure from DashScope:', chatCompletion);
        // Let the outer catch handle sending the 500 response
        throw new Error('AI processing failed: Unexpected response structure.');
      }

    } catch (aiError) {
      console.error('DashScope AI Processing Error (inner catch):', aiError);
      // Re-throw to be caught by the outer catch block for consistent logging and response
      throw aiError;
    } finally {
      // Delete the temporary file from local 'uploads/' directory
      if (localFilePath && fs.existsSync(localFilePath)) { // Check if file exists before unlinking
        fs.unlink(localFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting temporary file:', localFilePath, unlinkErr);
          } else {
            console.log('Temporary file deleted successfully:', localFilePath);
          }
        });
      }
    }
  } catch (error) { // Outer catch block for enhanced error logging
    console.error('--- ERROR IN /api/upload-pdf ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error Message:', error.message);
    console.error('Error Name:', error.name);
    console.error('Error Stack:', error.stack);
    // If the error object has a response property (e.g., from Axios or OpenAI SDK)
    if (error.response && error.response.data) {
        console.error('API Error Response Status:', error.response.status);
        console.error('API Error Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.cause) { // For errors that might have a 'cause'
        console.error('Error Cause:', error.cause);
    }
    
    // Ensure a 500 response is sent if one hasn't been already
    if (!res.headersSent) {
        res.status(500).json({
            message: 'Internal server error during PDF upload. See server logs for details.',
            errorDetails: error.message // Provide a brief error message to client
        });
    }
  }
}, (error, req, res, next) => { // Multer error handler
  if (error instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    return res.status(400).json({ message: error.message });
  } else if (error) {
    // An unknown error occurred when uploading.
    return res.status(400).json({ message: error.message });
  }
  // If no error, pass to next middleware or route handler
  next();
});

app.post('/api/chat', async (req, res) => {
  const { userMessage } = req.body;

  // --- BEGIN DEBUG LOGGING ---
  console.log('--- /api/chat HIT ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Server-side latestExtractedPdfText (first 100 chars):', latestExtractedPdfText ? latestExtractedPdfText.substring(0, 100) + (latestExtractedPdfText.length > 100 ? "..." : "") : "NOT SET OR EMPTY");
  console.log('Server-side latestExtractedPdfText LENGTH:', latestExtractedPdfText ? latestExtractedPdfText.length : 0);
  // --- END DEBUG LOGGING ---

  if (!userMessage) {
    console.log('/api/chat: Validation fail - userMessage is required.');
    return res.status(400).json({ error: "userMessage is required." });
  }

  // Enhanced check for latestExtractedPdfText: not just existence, but also non-empty string.
  if (!latestExtractedPdfText || typeof latestExtractedPdfText !== 'string' || latestExtractedPdfText.trim() === "") {
    console.log('/api/chat: Validation fail - latestExtractedPdfText is empty, not a string, or whitespace only.');
    console.log('/api/chat: Current latestExtractedPdfText value:', latestExtractedPdfText);
    return res.status(400).json({ error: "Please upload and successfully process a bank statement first. The document context is missing or empty." });
  }

  if (!bailianClient) {
    console.error('/api/chat: AI Service not initialized.');
    return res.status(500).json({ error: 'AI Service not initialized.' });
  }

  try {
    const prompt = `Based on the following financial data: \n\n${latestExtractedPdfText}\n\nAnswer the user's question: ${userMessage}`;
    // Log a snippet of the prompt to avoid overly long logs if latestExtractedPdfText is huge
    console.log('/api/chat: Constructed Prompt (User Question):', userMessage);
    console.log('/api/chat: Constructed Prompt (Context Snippet):', latestExtractedPdfText.substring(0, 200) + (latestExtractedPdfText.length > 200 ? "..." : ""));


    // Pass a plain object instead of trying to construct
    const completionsParams_Chat = {
      modelId: "qwen-turbo", // Model for chat
      // agentKey: process.env.ALIBABA_CLOUD_BAILIAN_AGENT_KEY, // If using an agent/app
      messages: [
        {
          role: "user", // For qwen-turbo, a simple user role with the full prompt is often sufficient
          content: prompt
        }
        // Alternatively, you could structure it with a system message for context and then user message:
        // {
        //   role: "system",
        //   content: `You are a helpful financial assistant. Analyze the following financial data provided by the user: \n\n${latestExtractedPdfText}`
        // },
        // {
        //   role: "user",
        //   content: userMessage
        // }
      ],
      parameters: {
        resultFormat: "text" // Request plain text output
      }
      // topP: 0.8, // Example: Control sampling (optional)
      // enableSearch: false, // Example: Disable web search (optional)
    };

    console.log('Sending request to Qwen-Turbo for chat with params:', completionsParams_Chat);
    const completionsResponse = await bailianClient.completions(completionsParams_Chat);

    // Log the full response from the AI model to the backend console
    console.log('/api/chat: Alibaba Cloud Qwen-Turbo Full Response:', JSON.stringify(completionsResponse.body, null, 2));

    if (completionsResponse.body && completionsResponse.body.success === false) {
      console.error('/api/chat: Bailian API call indicated failure:', completionsResponse.body);
      const errorMessage = completionsResponse.body.message || 'Unknown API error during chat';
      return res.status(500).json({
        error: 'AI chat processing failed.',
        details: errorMessage,
        code: completionsResponse.body.code
      });
    } else if (completionsResponse.body && completionsResponse.body.choices && completionsResponse.body.choices.length > 0 && completionsResponse.body.choices[0].message) {
      const aiMessage = completionsResponse.body.choices[0].message;
      let aiResponseText = "Could not extract AI response.";

      // Extract the AI's textual answer
      if (typeof aiMessage.content === 'string') {
        aiResponseText = aiMessage.content;
      } else if (Array.isArray(aiMessage.content) && aiMessage.content.length > 0 && aiMessage.content[0].type === 'text' && typeof aiMessage.content[0].text === 'string') {
        // This handles cases where content might be an array like [{type: "text", text: "..."}]
        aiResponseText = aiMessage.content[0].text;
      } else {
         // Fallback if the structure is unexpected, though resultFormat: "text" should give a string.
        aiResponseText = JSON.stringify(aiMessage.content);
        console.warn('/api/chat: AI response content was not a direct string, fallback to stringify:', aiResponseText);
      }
      
      console.log('/api/chat: AI Response Text (first 200 chars):', aiResponseText.substring(0, 200) + (aiResponseText.length > 200 ? "..." : ""));
      // Return a JSON response to the frontend with the AI's answer
      return res.json({ aiResponse: aiResponseText });
    } else {
      console.error('/api/chat: Unexpected AI response structure from Qwen-Turbo:', completionsResponse.body);
      return res.status(500).json({ error: 'AI chat processing failed: Unexpected response structure.' });
    }

  } catch (aiChatError) {
    console.error('/api/chat: Alibaba Cloud AI Chat Error:', aiChatError);
    let errorMessage = 'Unknown AI chat processing error';
    let errorDetails = null;
    if (aiChatError.data && aiChatError.data.Message) { // Specific to Aliyun SDK errors
        errorMessage = aiChatError.data.Message;
        errorDetails = aiChatError.data;
    } else if (aiChatError.message) { // Generic error message
        errorMessage = aiChatError.message;
    }
    return res.status(500).json({
      error: 'AI chat processing encountered an exception.',
      details: errorMessage,
      exceptionDetails: errorDetails // Provide more details if available from the SDK error
    });
  }
});

app.get('/api/dashboard-data', async (req, res) => {
  if (!latestExtractedPdfText) {
    console.log('/api/dashboard-data: latestExtractedPdfText is empty.');
    return res.status(400).json({ error: "Please upload and process a bank statement first." });
  }

  if (!bailianClient) {
    console.error('/api/dashboard-data: AI Service not initialized.');
    return res.status(500).json({ error: 'AI Service not initialized.' });
  }

  const desiredJsonStructure = {
    totalIncome: 0,
    totalExpenses: 0,
    currency: "USD"
  };

  const prompt = `Analyze the following financial data: \n\n${latestExtractedPdfText}\n\nIdentify the total income, total expenses, and the currency (e.g., USD, EUR, JPY). If the currency cannot be clearly identified, default to "USD". Respond ONLY with a valid JSON object in the following format: ${JSON.stringify(desiredJsonStructure)}. Do not include any other text, explanation, or markdown formatting outside of this JSON object. For example, if you find an income of 1000 and expenses of 500 in USD, respond with: {"totalIncome": 1000, "totalExpenses": 500, "currency": "USD"}`;

  console.log('/api/dashboard-data: Constructed Prompt for JSON generation (Context Snippet):', latestExtractedPdfText.substring(0, 200) + (latestExtractedPdfText.length > 200 ? "..." : ""));
  console.log('/api/dashboard-data: Full prompt for AI:', prompt);


  try {
    // Pass a plain object instead of trying to construct
    const completionsParams_Dashboard = {
      modelId: "qwen-turbo", // Model for chat and JSON generation
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      parameters: {
        resultFormat: "text" // Expecting a string that is JSON
      }
    };

    console.log('Sending request to Qwen-Turbo for dashboard data JSON generation with params:', completionsParams_Dashboard);
    const completionsResponse = await bailianClient.completions(completionsParams_Dashboard);

    console.log('/api/dashboard-data: Alibaba Cloud Qwen-Turbo Full Raw Response:', JSON.stringify(completionsResponse.body, null, 2));

    let aiRawOutput = "";

    if (completionsResponse.body && completionsResponse.body.success === false) {
      console.error('/api/dashboard-data: Bailian API call indicated failure:', completionsResponse.body);
      const errorMessage = completionsResponse.body.message || 'Unknown API error during dashboard data generation';
      return res.status(500).json({
        error: 'AI processing failed to generate dashboard data.',
        details: errorMessage,
        code: completionsResponse.body.code
      });
    } else if (completionsResponse.body && completionsResponse.body.choices && completionsResponse.body.choices.length > 0 && completionsResponse.body.choices[0].message) {
      const aiMessage = completionsResponse.body.choices[0].message;
      if (typeof aiMessage.content === 'string') {
        aiRawOutput = aiMessage.content;
      } else if (Array.isArray(aiMessage.content) && aiMessage.content.length > 0 && aiMessage.content[0].type === 'text' && typeof aiMessage.content[0].text === 'string') {
        aiRawOutput = aiMessage.content[0].text;
      } else {
        aiRawOutput = JSON.stringify(aiMessage.content); // Fallback
        console.warn('/api/dashboard-data: AI response content was not a direct string, fallback to stringify:', aiRawOutput);
      }
      
      console.log('/api/dashboard-data: Raw AI Output String (potential JSON):', aiRawOutput);

      try {
        // Attempt to parse the AI's response as JSON
        // Sometimes the AI might wrap the JSON in markdown ```json ... ```
        const cleanedJsonString = aiRawOutput.replace(/^```json\s*|```$/g, '').trim();
        const parsedJson = JSON.parse(cleanedJsonString);
        console.log('/api/dashboard-data: Successfully parsed JSON from AI:', parsedJson);
        return res.json(parsedJson);
      } catch (parseError) {
        console.error('/api/dashboard-data: Failed to parse JSON from AI response.', {
          error: parseError.message,
          rawResponse: aiRawOutput
        });
        return res.status(500).json({
          error: "Failed to parse dashboard data from AI. AI did not return valid JSON.",
          aiRawResponse: aiRawOutput,
          parseError: parseError.message
        });
      }
    } else {
      console.error('/api/dashboard-data: Unexpected AI response structure from Qwen-Turbo:', completionsResponse.body);
      return res.status(500).json({ error: 'AI processing failed: Unexpected response structure for dashboard data.' });
    }

  } catch (aiError) {
    console.error('/api/dashboard-data: Alibaba Cloud AI Error:', aiError);
    let errorMessage = 'Unknown AI error during dashboard data generation';
    let errorDetails = null;
    if (aiError.data && aiError.data.Message) {
      errorMessage = aiError.data.Message;
      errorDetails = aiError.data;
    } else if (aiError.message) {
      errorMessage = aiError.message;
    }
    return res.status(500).json({
      error: 'AI processing for dashboard data encountered an exception.',
      details: errorMessage,
      exceptionDetails: errorDetails
    });
  }
});

// New API route for Qwen Chat Service integration
app.post('/api/v2/chat', uploadChatV2.array('files', 5), async (req, res) => {
 const { message, session_id } = req.body;
 const files = req.files; // files will be an array of file objects from multer

 // Basic validation
 if (!message && (!files || files.length === 0)) {
   return res.status(400).json({ error: "Either message or files must be provided." });
 }
 // session_id is optional based on Qwen API, but good to pass if available

 try {
   console.log(`Received request for /api/v2/chat. Session ID: ${session_id}, Message: ${message ? message.substring(0,50)+'...' : 'N/A'}, Files: ${files ? files.length : 0}`);
   const serviceResponse = await qwenExternalApiService.forwardChatRequest(message, session_id, files);
   
   // Clean up uploaded files after successful forwarding if they were saved to disk by multer
   if (files && files.length > 0) {
     files.forEach(file => {
       if (file.path && fs.existsSync(file.path)) {
         fs.unlink(file.path, (unlinkErr) => {
           if (unlinkErr) {
             console.error(`Error deleting temporary file ${file.path} for /api/v2/chat:`, unlinkErr);
           } else {
             console.log(`Temporary file ${file.path} deleted successfully for /api/v2/chat.`);
           }
         });
       }
     });
   }
   
   res.json(serviceResponse);
 } catch (error) {
   console.error('Error in /api/v2/chat endpoint:', error.message);
   // Clean up uploaded files in case of error during service call
   if (files && files.length > 0) {
     files.forEach(file => {
       if (file.path && fs.existsSync(file.path)) {
         fs.unlink(file.path, (unlinkErr) => {
           if (unlinkErr) {
             console.error(`Error deleting temporary file ${file.path} after error in /api/v2/chat:`, unlinkErr);
           } else {
             console.log(`Temporary file ${file.path} deleted successfully after error in /api/v2/chat.`);
           }
         });
       }
     });
   }
   
   // Check if the error has a status code (e.g., from Axios error in the service)
   const statusCode = error.response && error.response.status ? error.response.status : 500;
   const errorDetail = error.response && error.response.data ? error.response.data : error.message;
   
   res.status(statusCode).json({
     error: "Failed to process chat request via Qwen service.",
     details: errorDetail
   });
 }
});

console.log(`Attempting to start server on port ${port}...`);

const server = app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
  console.log('Server startup sequence fully completed.');
});

// Gracefully handle Ctrl+C (SIGINT)
process.on('SIGINT', () => {
  console.log('\nSIGINT received (Ctrl+C). Shutting down server...');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

server.on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

module.exports = app;