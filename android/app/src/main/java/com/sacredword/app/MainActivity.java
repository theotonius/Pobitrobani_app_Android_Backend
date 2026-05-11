package com.sacredword.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private OpenRouterKeyService keyService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize the backend service
        keyService = new OpenRouterKeyService(this);
        
        // Perform a health check on startup to verify connection with Vercel
        checkBackendHealth();
    }

    private void checkBackendHealth() {
        keyService.healthCheck(new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                Log.d(TAG, "✅ Backend Connection Successful: " + response.toString());
            }

            @Override
            public void onError(String error) {
                Log.e(TAG, "❌ Backend Connection Failed: " + error);
            }
        });
    }
}
