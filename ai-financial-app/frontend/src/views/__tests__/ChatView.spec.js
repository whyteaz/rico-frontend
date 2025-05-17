import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ChatView from '../ChatView.vue';

// Mock the global fetch function
global.fetch = vi.fn();

const NEW_API_ENDPOINT = 'http://47.236.92.42:8000/chat';

describe('ChatView.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Reset mocks before each test
    global.fetch.mockClear();
    conversation.value = []; // Assuming conversation is exposed or can be reset
    chatError.value = ''; // Assuming chatError is exposed or can be reset
    uploadMessage.value = ''; // Assuming uploadMessage is exposed or can be reset

    wrapper = mount(ChatView);
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  describe('File Upload', () => {
    it('should call the new API endpoint for PDF upload', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'File processed successfully', filename: 'test.pdf' }),
      });

      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = wrapper.find('input[type="file"]');
      // Simulate file selection - this is tricky with JSDOM, often requires direct manipulation or a more complex setup
      // For this example, we'll assume selectedFile can be set directly for testing if exposed,
      // or trigger the change event manually if possible.
      // This part might need adjustment based on how `handleFileSelect` is implemented
      // and how `selectedFile` is managed.
      
      // A more robust way would be to mock the file input's files property
      // or directly set selectedFile.value if it's exposed for testing.
      // For now, let's assume we can trigger the upload handler.
      
      // Simulate selecting a file
      await wrapper.vm.handleFileSelect({ target: { files: [file] } }); // Assuming handleFileSelect is a method
      
      // Trigger file upload
      await wrapper.find('.upload-section button').trigger('click');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        NEW_API_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData), // Check that FormData is used
        })
      );
      // Check if FormData contains the file - this is harder to assert directly with Jest/Vitest mocks
      // but we can check the URL and method.

      // Wait for state updates if necessary
      await wrapper.vm.$nextTick(); 
      expect(wrapper.vm.uploadMessage).toContain('Success: File processed successfully');
    });

    it('should handle PDF upload error from the new API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Upload failed from new API' }),
      });
      
      const file = new File(['dummy content'], 'error.pdf', { type: 'application/pdf' });
      await wrapper.vm.handleFileSelect({ target: { files: [file] } });
      await wrapper.find('.upload-section button').trigger('click');

      expect(global.fetch).toHaveBeenCalledWith(NEW_API_ENDPOINT, expect.anything());
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.uploadMessage).toContain('Error: Upload failed from new API');
    });
  });

  describe('Chat Messages', () => {
    it('should send chat message to the new API endpoint', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ aiResponse: 'Hello from new AI' }),
      });

      // Simulate successful upload to enable chat
      wrapper.vm.uploadMessage = 'Success: File uploaded'; 
      await wrapper.vm.$nextTick(); // Ensure chat interface is visible

      await wrapper.find('.input-area input[type="text"]').setValue('Test message');
      await wrapper.find('.input-area button').trigger('click');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        NEW_API_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage: 'Test message' }),
        })
      );
      
      await wrapper.vm.$nextTick();
      const conversation = wrapper.vm.conversation;
      expect(conversation.length).toBeGreaterThan(0);
      expect(conversation[conversation.length - 1].text).toBe('Hello from new AI');
      expect(conversation[conversation.length - 1].sender).toBe('ai');
    });

    it('should handle chat message error from the new API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'AI chat error from new API' }),
      });

      wrapper.vm.uploadMessage = 'Success: File uploaded';
      await wrapper.vm.$nextTick();

      await wrapper.find('.input-area input[type="text"]').setValue('Error test');
      await wrapper.find('.input-area button').trigger('click');

      expect(global.fetch).toHaveBeenCalledWith(NEW_API_ENDPOINT, expect.anything());
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.chatError).toContain('Error from AI: AI chat error from new API');
    });
  });

  // Helper to access refs if not directly exposed by wrapper.vm
  // This is a simplified assumption for the example.
  // In a real scenario, you might need to access refs via wrapper.vm.$refs or ensure they are testable.
  const conversation = { value: [] }; // Mocked refs for simplicity
  const chatError = { value: '' };
  const uploadMessage = { value: ''};

  // If ChatView uses defineExpose for these refs, they would be on wrapper.vm
  // Otherwise, this mock setup is a placeholder.
  // For a real test, ensure these refs are accessible or their effects are observable through the DOM.
});