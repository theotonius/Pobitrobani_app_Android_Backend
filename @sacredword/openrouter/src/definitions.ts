export interface sacredwordPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}

export interface OpenRouterPlugin {
  healthCheck(): Promise<{ success: boolean; message?: string }>;
  setApiKey(options: { apiKey: string }): Promise<{ success: boolean; message?: string }>;
  checkApiStatus(): Promise<{ isConfigured: boolean }>;
  sendMessage(options: { message: string; model?: string }): Promise<{ success: boolean; response?: any }>;
}
