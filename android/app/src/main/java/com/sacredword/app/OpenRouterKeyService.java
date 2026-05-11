package com.sacredword.app;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.NonNull;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.*;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Service class to manage OpenRouter API key communication with the backend server
 * This service handles:
 * - Setting/Getting API keys from the backend
 * - Checking API key status
 * - Proxying requests to OpenRouter through the backend
 */
public class OpenRouterKeyService {
    private static final String TAG = "OpenRouterKeyService";
    private static final String PREFS_NAME = "sacred_word_prefs";
    private static final String BACKEND_URL_KEY = "backend_url";
    private static final String DEVICE_ID_KEY = "device_id";
    private static final String API_TOKEN_KEY = "api_token";
    
    private Context context;
    private SharedPreferences prefs;
    private OkHttpClient httpClient;
    private String backendUrl;
    private String deviceId;
    private String apiToken;
    
    public interface ApiKeyCallback {
        void onSuccess(JSONObject response);
        void onError(String error);
    }
    
    public OpenRouterKeyService(Context context) {
        this.context = context.getApplicationContext();
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        // Initialize HTTP client with timeout
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .build();
        
        // Load settings from SharedPreferences
        this.backendUrl = prefs.getString(BACKEND_URL_KEY, "http://localhost:3000");
        this.deviceId = prefs.getString(DEVICE_ID_KEY, getDeviceId());
        this.apiToken = prefs.getString(API_TOKEN_KEY, "");
    }
    
    /**
     * Initialize the service with backend URL
     */
    public void initializeWithBackendUrl(String url) {
        this.backendUrl = url;
        prefs.edit().putString(BACKEND_URL_KEY, url).apply();
    }
    
    /**
     * Set API token for secured communication
     */
    public void setApiToken(String token) {
        this.apiToken = token;
        prefs.edit().putString(API_TOKEN_KEY, token).apply();
    }
    
    /**
     * Set the OpenRouter API key on the backend
     */
    public void setOpenRouterApiKey(String apiKey, ApiKeyCallback callback) {
        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("apiKey", apiKey);
            requestBody.put("deviceId", deviceId);
        } catch (JSONException e) {
            callback.onError("Failed to create request: " + e.getMessage());
            return;
        }
        
        makeRequest("POST", "/api/keys/openrouter", requestBody, callback);
    }
    
    /**
     * Get the stored OpenRouter API key from the backend
     */
    public void getOpenRouterApiKey(ApiKeyCallback callback) {
        String url = backendUrl + "/api/keys/openrouter?deviceId=" + deviceId;
        makeGetRequest(url, callback);
    }
    
    /**
     * Delete the OpenRouter API key from the backend
     */
    public void deleteOpenRouterApiKey(ApiKeyCallback callback) {
        String url = backendUrl + "/api/keys/openrouter?deviceId=" + deviceId;
        makeDeleteRequest(url, callback);
    }
    
    /**
     * Check if API key is configured on the backend
     */
    public void checkApiKeyStatus(ApiKeyCallback callback) {
        String url = backendUrl + "/api/keys/status?deviceId=" + deviceId;
        makeGetRequest(url, callback);
    }
    
    /**
     * Send a message to OpenRouter through the backend proxy
     */
    public void sendMessageToOpenRouter(String message, String model, ApiKeyCallback callback) {
        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("message", message);
            requestBody.put("model", model != null ? model : "openrouter/auto");
            requestBody.put("deviceId", deviceId);
        } catch (JSONException e) {
            callback.onError("Failed to create request: " + e.getMessage());
            return;
        }
        
        makeRequest("POST", "/api/openrouter/proxy", requestBody, callback);
    }
    
    /**
     * Health check - verify backend is running
     */
    public void healthCheck(ApiKeyCallback callback) {
        String url = backendUrl + "/health";
        makeGetRequest(url, callback);
    }
    
    /**
     * Make a GET request to the backend
     */
    private void makeGetRequest(String url, ApiKeyCallback callback) {
        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .get();
        
        if (!apiToken.isEmpty()) {
            requestBuilder.addHeader("X-API-Token", apiToken);
        }
        
        executeRequest(requestBuilder.build(), callback);
    }
    
    /**
     * Make a DELETE request to the backend
     */
    private void makeDeleteRequest(String url, ApiKeyCallback callback) {
        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .delete();
        
        if (!apiToken.isEmpty()) {
            requestBuilder.addHeader("X-API-Token", apiToken);
        }
        
        executeRequest(requestBuilder.build(), callback);
    }
    
    /**
     * Make a POST request to the backend
     */
    private void makeRequest(String method, String endpoint, JSONObject body, ApiKeyCallback callback) {
        String url = backendUrl + endpoint;
        RequestBody requestBody = RequestBody.create(
                body.toString(),
                MediaType.parse("application/json")
        );
        
        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .header("Content-Type", "application/json");
        
        if (method.equals("POST")) {
            requestBuilder.post(requestBody);
        } else if (method.equals("PUT")) {
            requestBuilder.put(requestBody);
        }
        
        if (!apiToken.isEmpty()) {
            requestBuilder.addHeader("X-API-Token", apiToken);
        }
        
        executeRequest(requestBuilder.build(), callback);
    }
    
    /**
     * Execute the HTTP request asynchronously
     */
    private void executeRequest(Request request, ApiKeyCallback callback) {
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                callback.onError("Network error: " + e.getMessage());
            }
            
            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                try {
                    String responseBody = response.body() != null ? response.body().string() : "";
                    
                    if (!response.isSuccessful()) {
                        callback.onError("HTTP " + response.code() + ": " + responseBody);
                        return;
                    }
                    
                    JSONObject jsonResponse = new JSONObject(responseBody);
                    callback.onSuccess(jsonResponse);
                } catch (JSONException e) {
                    callback.onError("JSON parsing error: " + e.getMessage());
                }
            }
        });
    }
    
    /**
     * Get device ID (uses Android ID)
     */
    private String getDeviceId() {
        return android.provider.Settings.Secure.getString(
                context.getContentResolver(),
                android.provider.Settings.Secure.ANDROID_ID
        );
    }
    
    /**
     * Get current backend URL
     */
    public String getBackendUrl() {
        return backendUrl;
    }
    
    /**
     * Get current device ID
     */
    public String getDeviceId() {
        return deviceId;
    }
}

