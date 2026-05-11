/**
 * OpenRouter API Key Service for Capacitor Web App
 * This TypeScript file can be used in your Capacitor app's web code
 * (Angular, React, Vue, or vanilla JS)
 *
 * Usage:
 * import { OpenRouterBackendService } from './services/OpenRouterBackendService';
 * const service = new OpenRouterBackendService('http://your-backend-url:3000');
 */

export interface ApiResponse {
  success: boolean;
  error?: string;
  details?: string;
  [key: string]: any;
}

export interface ApiKeyResponse extends ApiResponse {
  apiKey?: string;
  uploadedAt?: string;
  lastUsed?: string;
}

export interface StatusResponse extends ApiResponse {
  isConfigured?: boolean;
  deviceId?: string;
  lastUsed?: string;
}

export class OpenRouterBackendService {
  private backendUrl: string;
  private deviceId: string = '';
  private apiToken: string = '';
  private timeout: number = 10000; // 10 seconds

  constructor(backendUrl: string) {
    this.backendUrl = this.normalizeUrl(backendUrl);
    this.loadDeviceId();
  }

  /**
   * Normalize backend URL (remove trailing slash)
   */
  private normalizeUrl(url: string): string {
    return url.replace(/\/$/, '');
  }

  /**
   * Load or generate device ID
   */
  private loadDeviceId(): void {
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
  private generateDeviceId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set API token for authenticated requests
   */
  setApiToken(token: string): void {
    this.apiToken = token;
  }

  /**
   * Set custom timeout
   */
  setTimeout(ms: number): void {
    this.timeout = ms;
  }

  /**
   * Make HTTP request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Add default headers
      const headers: HeadersInit = {
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
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Health check - verify backend is running
   */
  async healthCheck(): Promise<ApiResponse> {
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
  async setOpenRouterApiKey(apiKey: string): Promise<ApiResponse> {
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
  async getOpenRouterApiKey(): Promise<ApiKeyResponse> {
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
  async deleteOpenRouterApiKey(): Promise<ApiResponse> {
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
  async checkApiKeyStatus(): Promise<StatusResponse> {
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
  async sendMessageToOpenRouter(
    message: string,
    model: string = 'openrouter/auto'
  ): Promise<ApiResponse> {
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
  async getStoredKeysList(): Promise<ApiResponse> {
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
  private async handleResponse(response: Response): Promise<ApiResponse> {
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        details: data.details,
      };
    }

    return data;
  }

  /**
   * Handle error response
   */
  private handleError(error: any): ApiResponse {
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
  getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * Get the current backend URL
   */
  getBackendUrl(): string {
    return this.backendUrl;
  }
}

// Export singleton instance (optional)
let serviceInstance: OpenRouterBackendService | null = null;

export function initializeService(backendUrl: string): OpenRouterBackendService {
  serviceInstance = new OpenRouterBackendService(backendUrl);
  return serviceInstance;
}

export function getServiceInstance(): OpenRouterBackendService {
  if (!serviceInstance) {
    throw new Error('Service not initialized. Call initializeService() first.');
  }
  return serviceInstance;
}

