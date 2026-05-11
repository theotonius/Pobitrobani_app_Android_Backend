import { WebPlugin } from '@capacitor/core';

import type { OpenRouterPlugin } from './definitions';

export class OpenRouterWeb extends WebPlugin implements OpenRouterPlugin {
  async healthCheck(): Promise<{ success: boolean; message?: string }> {
    // For web, we'll make a direct API call to the backend
    try {
      const response = await fetch('/health');
      if (response.ok) {
        return { success: true, message: 'Backend is healthy' };
      } else {
        return { success: false, message: 'Backend returned error' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }

  async setApiKey(options: { apiKey: string }): Promise<{ success: boolean; message?: string }> {
    // For web, we'll make a direct API call
    try {
      const response = await fetch('/api/keys/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: options.apiKey })
      });
      const result = await response.json();
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }

  async checkApiStatus(): Promise<{ isConfigured: boolean }> {
    // For web, we'll make a direct API call
    try {
      const response = await fetch('/api/keys/status');
      const result = await response.json();
      return { isConfigured: result.isConfigured };
    } catch (error) {
      return { isConfigured: false };
    }
  }

  async sendMessage(options: { message: string; model?: string }): Promise<{ success: boolean; response?: any }> {
    // For web, we'll make a direct API call
    try {
      const response = await fetch('/api/openrouter/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: options.message,
          model: options.model || 'openrouter/auto'
        })
      });
      const result = await response.json();
      return { success: result.success, response: result.response };
    } catch (error) {
      return { success: false };
    }
  }
}
