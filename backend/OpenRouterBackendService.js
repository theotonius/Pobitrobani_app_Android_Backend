/**
 * OpenRouter API Key Service for Capacitor Web App (Vanilla JavaScript)
 * This is the JavaScript version of OpenRouterBackendService.ts
 *
 * Usage:
 * <script src="OpenRouterBackendService.js"></script>
 * <script>
 *   const service = new OpenRouterBackendService('http://localhost:3000');
 *   service.setOpenRouterApiKey('sk-...').then(result => console.log(result));
 * </script>
 */

class OpenRouterBackendService {
  constructor(backendUrl) {
    this.backendUrl = this.normalizeUrl(backendUrl);
    this.deviceId = '';
    this.apiToken = '';
    this.timeout = 10000; // 10 seconds
    this.loadDeviceId();
  }

  /**
   * Normalize backend URL (remove trailing slash)
   */
  normalizeUrl(url) {
    return url.replace(/\/$/, '');
  }

  /**
   * Load or generate device ID
   */
  loadDeviceId() {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = this.generateDeviceId();
      localStorage.setItem('device_id', id);
    }
    this.deviceId = id;
  }

  /**
   * Generate unique device ID
   */
  generateDeviceId() {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set API token for authenticated requests
   */
  setApiToken(token) {
    this.apiToken = token;
  }

  /**
   * Set custom timeout
   */
  setTimeout(ms) {
    this.timeout = ms;
  }

  /**
   * Make HTTP request with timeout
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Add default headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add API token if set
      if (this.apiToken) {
        headers['X-API-Token'] = this.apiToken;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Health check - verify backend is running
   */
  async healthCheck() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/health`
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Set the OpenRouter API key on the backend
   */
  async setOpenRouterApiKey(apiKey) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/api/keys/openrouter`,
        {
          method: 'POST',
          body: JSON.stringify({
            apiKey,
            deviceId: this.deviceId,
          }),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get the stored OpenRouter API key from the backend
   */
  async getOpenRouterApiKey() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/api/keys/openrouter?deviceId=${this.deviceId}`
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete the OpenRouter API key from the backend
   */
  async deleteOpenRouterApiKey() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/api/keys/openrouter?deviceId=${this.deviceId}`,
        { method: 'DELETE' }
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check if API key is configured on the backend
   */
  async checkApiKeyStatus() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/api/keys/status?deviceId=${this.deviceId}`
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send a message to OpenRouter through the backend proxy
   */
  async sendMessageToOpenRouter(message, model = 'openrouter/auto') {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/api/openrouter/proxy`,
        {
          method: 'POST',
          body: JSON.stringify({
            message,
            model,
            deviceId: this.deviceId,
          }),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get list of all stored keys (admin endpoint)
   */
  async getStoredKeysList() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.backendUrl}/api/keys/list`
      );
      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle successful response
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        details: data.details,
      };
    }

    return { success: true, ...data };
  }

  /**
   * Handle error response
   */
  handleError(error) {
    console.error('Backend service error:', error);

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Network error - Unable to reach backend server',
        details: 'Check if backend is running and URL is correct',
      };
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Request timeout',
        details: 'Backend server is not responding in time',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  /**
   * Get the current device ID
   */
  getDeviceId() {
    return this.deviceId;
  }

  /**
   * Get the current backend URL
   */
  getBackendUrl() {
    return this.backendUrl;
  }
}

// Export for use as module (if supported)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenRouterBackendService;
}
if (typeof window !== 'undefined') {
  window.OpenRouterBackendService = OpenRouterBackendService;
}

