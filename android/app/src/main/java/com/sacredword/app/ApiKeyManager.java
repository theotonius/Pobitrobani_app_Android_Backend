/**
 * Utility class for managing API Key operations
 * This can be used from MainActivity or other components
 */
package com.sacredword.app;

import android.content.Context;
import android.widget.Toast;
import org.json.JSONObject;

public class ApiKeyManager {
    private OpenRouterKeyService keyService;
    private Context context;
    
    public ApiKeyManager(Context context) {
        this.context = context;
        this.keyService = new OpenRouterKeyService(context);
    }
    
    /**
     * Initialize with custom backend URL
     */
    public void initializeBackend(String backendUrl) {
        keyService.initializeWithBackendUrl(backendUrl);
    }
    
    /**
     * Set the OpenRouter API key with UI feedback
     */
    public void setApiKey(String apiKey) {
        keyService.setOpenRouterApiKey(apiKey, new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    boolean success = response.optBoolean("success", false);
                    if (success) {
                        showToast("API Key saved successfully!");
                    } else {
                        showToast("Failed to save API Key");
                    }
                } catch (Exception e) {
                    showToast("Error: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                showToast("Error: " + error);
            }
        });
    }
    
    /**
     * Check if API key is configured
     */
    public void checkApiStatus() {
        keyService.checkApiKeyStatus(new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    boolean isConfigured = response.optBoolean("isConfigured", false);
                    if (isConfigured) {
                        showToast("API Key is configured!");
                    } else {
                        showToast("API Key not configured. Please set it.");
                    }
                } catch (Exception e) {
                    showToast("Error: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                showToast("Error checking status: " + error);
            }
        });
    }
    
    /**
     * Delete the API key
     */
    public void deleteApiKey() {
        keyService.deleteOpenRouterApiKey(new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    boolean success = response.optBoolean("success", false);
                    if (success) {
                        showToast("API Key deleted successfully!");
                    } else {
                        showToast("Failed to delete API Key");
                    }
                } catch (Exception e) {
                    showToast("Error: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                showToast("Error: " + error);
            }
        });
    }
    
    /**
     * Send a message to OpenRouter through the backend
     */
    public void sendMessage(String message, String model) {
        keyService.sendMessageToOpenRouter(message, model, new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    boolean success = response.optBoolean("success", false);
                    if (success) {
                        JSONObject responseData = response.optJSONObject("response");
                        if (responseData != null) {
                            showToast("Got response from OpenRouter!");
                        }
                    } else {
                        showToast("Failed to get response");
                    }
                } catch (Exception e) {
                    showToast("Error: " + e.getMessage());
                }
            }
            
            @Override
            public void onError(String error) {
                showToast("Error sending message: " + error);
            }
        });
    }
    
    /**
     * Check backend health
     */
    public void checkBackendHealth() {
        if (keyService == null) {
            showToast("Error: Backend service not initialized");
            return;
        }

        keyService.healthCheck(new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                String status = response.optString("status", "unknown");
                showToast("Backend status: " + status);
            }
            
            @Override
            public void onError(String error) {
                showToast("Backend unavailable: " + error);
            }
        });
    }
    
    /**
     * Get the backend URL
     */
    public String getBackendUrl() {
        return keyService.getBackendUrl();
    }
    
    /**
     * Get the device ID
     */
    public String getDeviceId() {
        return keyService.getDeviceId();
    }
    
    /**
     * Show toast message on main thread
     */
    private void showToast(final String message) {
        if (context == null) return;
        ((android.app.Activity) context).runOnUiThread(() -> 
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        );
    }
    
    /**
     * Get the OpenRouterKeyService instance directly
     */
    public OpenRouterKeyService getKeyService() {
        return keyService;
    }
}

