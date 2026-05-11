/**
 * Example: Using OpenRouter Backend Service with vanilla JavaScript
 * This is the simplest approach that works in any web project
 */

// Include the service file
// <script src="./OpenRouterBackendService.js"></script>

class ApiKeyManagerUI {
  constructor(backendUrl) {
    this.service = new OpenRouterBackendService(backendUrl);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Backend health check
    document
      .getElementById('checkHealthBtn')
      ?.addEventListener('click', () => this.checkBackendHealth());

    // Set API key
    document
      .getElementById('setApiKeyBtn')
      ?.addEventListener('click', () => this.setApiKey());

    // Check status
    document
      .getElementById('checkStatusBtn')
      ?.addEventListener('click', () => this.checkApiStatus());

    // Delete API key
    document
      .getElementById('deleteKeyBtn')
      ?.addEventListener('click', () => this.deleteApiKey());

    // Send message
    document
      .getElementById('sendMessageBtn')
      ?.addEventListener('click', () => this.sendMessage());
  }

  async checkBackendHealth() {
    this.setLoading(true);
    this.clearError();

    try {
      const result = await this.service.healthCheck();
      const statusDiv = document.getElementById('backendStatus');
      if (statusDiv) {
        statusDiv.className = `status ${result.success ? 'success' : 'error'}`;
        statusDiv.textContent = result.success
          ? '✓ Backend is healthy'
          : '✗ Backend error: ' + result.error;
        statusDiv.style.display = 'block';
      }
    } catch (err) {
      this.setError('Failed to check backend health: ' + err);
    } finally {
      this.setLoading(false);
    }
  }

  async setApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput?.value || '';

    if (!apiKey) {
      this.setError('Please enter an API key');
      return;
    }

    this.setLoading(true);
    this.clearError();

    try {
      const result = await this.service.setOpenRouterApiKey(apiKey);

      if (result.success) {
        this.showResponse(result);
        apiKeyInput.value = '';
        alert('✓ API Key saved successfully');
        this.checkApiStatus();
      } else {
        this.setError(result.error || 'Failed to save API key');
      }
    } catch (err) {
      this.setError('Error: ' + err);
    } finally {
      this.setLoading(false);
    }
  }

  async checkApiStatus() {
    this.setLoading(true);
    this.clearError();

    try {
      const result = await this.service.checkApiKeyStatus();
      const statusDiv = document.getElementById('keyStatus');
      if (statusDiv) {
        statusDiv.className = `status ${result.isConfigured ? 'success' : 'info'}`;
        statusDiv.textContent = result.isConfigured
          ? `✓ API Key is configured (Last used: ${result.lastUsed || 'Never'})`
          : '⚠ API Key not configured';
        statusDiv.style.display = 'block';
      }

      if (!result.success) {
        this.setError(result.error || 'Failed to check status');
      }
    } catch (err) {
      this.setError('Error: ' + err);
    } finally {
      this.setLoading(false);
    }
  }

  async deleteApiKey() {
    if (!confirm('Are you sure you want to delete the API key?')) {
      return;
    }

    this.setLoading(true);
    this.clearError();

    try {
      const result = await this.service.deleteOpenRouterApiKey();

      if (result.success) {
        this.showResponse(result);
        alert('✓ API Key deleted successfully');
        this.checkApiStatus();
      } else {
        this.setError(result.error || 'Failed to delete API key');
      }
    } catch (err) {
      this.setError('Error: ' + err);
    } finally {
      this.setLoading(false);
    }
  }

  async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput?.value || '';

    if (!message) {
      this.setError('Please enter a message');
      return;
    }

    this.setLoading(true);
    this.clearError();

    try {
      const result = await this.service.sendMessageToOpenRouter(message);

      if (result.success) {
        this.showResponse(result.response);
      } else {
        this.setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      this.setError('Error: ' + err);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
      loadingDiv.style.display = loading ? 'block' : 'none';
    }
  }

  setError(error) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
      errorDiv.textContent = error;
      errorDiv.style.display = 'block';
    }
  }

  clearError() {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }

  showResponse(data) {
    const responseDiv = document.getElementById('response');
    if (responseDiv) {
      responseDiv.textContent = JSON.stringify(data, null, 2);
      responseDiv.style.display = 'block';
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Change this URL to match your backend
  window.apiKeyManager = new ApiKeyManagerUI('http://localhost:3000');
});

