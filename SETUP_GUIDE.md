# Sacred Word - OpenRouter API Key Backend Setup Guide

This guide will help you set up and integrate the OpenRouter API key management backend with your Sacred Word Android app.

## 📁 What Was Created

```
sacred-word/
├── backend/                              # NEW: Backend server folder
│   ├── server.js                        # Main express server
│   ├── package.json                     # Dependencies
│   ├── .env.example                     # Example environment config
│   ├── .gitignore                       # Git ignore rules
│   └── README.md                        # Backend documentation
│
└── android/
    └── app/src/main/java/com/sacredword/app/
        ├── OpenRouterKeyService.java    # NEW: API communication service
        ├── ApiKeyManager.java            # NEW: Manager class with UI callbacks
        └── MainActivity.java             # Existing
```

## 🚀 Quick Start

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Configure Environment

```powershell
# Copy example env file
Copy-Item .env.example .env

# Edit .env and set your values
notepad .env
```

**Important settings in .env:**
- `PORT=3000` - Backend server port
- `ALLOWED_ORIGINS` - Add your app's URL
- For development, you can leave most settings as default

### Step 3: Start the Backend Server

```powershell
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will start at `http://localhost:3000`

### Step 4: Build Android Project

The Android project now has the necessary dependencies added. Build it:

```powershell
# In the android folder
gradlew.bat build

# Or from Android Studio - Build > Build Project
```

---

## 📝 Usage in Your Android App

### Option 1: In MainActivity

```java
package com.sacredword.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private ApiKeyManager apiKeyManager;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize API Key Manager
        apiKeyManager = new ApiKeyManager(this);
        
        // For development, connect to local backend
        apiKeyManager.initializeBackend("http://192.168.1.100:3000");
        // Change 192.168.1.100 to your computer's IP address
        
        // Check backend health
        apiKeyManager.checkBackendHealth();
    }
    
    // Example: Set API key when user provides it
    public void onApiKeyReceived(String apiKey) {
        apiKeyManager.setApiKey(apiKey);
    }
    
    // Example: Check if API key is configured
    public void checkApiConfiguration() {
        apiKeyManager.checkApiStatus();
    }
    
    // Example: Send a message using OpenRouter
    public void sendMessage(String message) {
        apiKeyManager.sendMessage(message, "openrouter/auto");
    }
}
```

### Option 2: In a Fragment or Other Component

```java
public class MyFragment extends Fragment {
    private ApiKeyManager apiKeyManager;
    
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        apiKeyManager = new ApiKeyManager(getContext());
        apiKeyManager.initializeBackend("http://your-backend-url:3000");
        
        // Use the manager
        findViewById(R.id.set_api_key_button).setOnClickListener(v -> {
            String apiKey = ((EditText) findViewById(R.id.api_key_input)).getText().toString();
            apiKeyManager.setApiKey(apiKey);
        });
    }
}
```

### Option 3: Direct Service Usage (More Control)

```java
public class AdvancedExample {
    private OpenRouterKeyService keyService;
    
    public void setup(Context context) {
        keyService = new OpenRouterKeyService(context);
        keyService.initializeWithBackendUrl("http://192.168.1.100:3000");
        keyService.setApiToken("optional-token"); // If using authentication
    }
    
    public void handleApiKeyFromUser(String apiKey) {
        keyService.setOpenRouterApiKey(apiKey, new OpenRouterKeyService.ApiKeyCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                Log.d("ApiKey", "Success: " + response.toString());
                // Handle success
            }
            
            @Override
            public void onError(String error) {
                Log.e("ApiKey", "Error: " + error);
                // Handle error
            }
        });
    }
    
    public void sendMessageThroughBackend(String message) {
        keyService.sendMessageToOpenRouter(message, "openrouter/auto", 
            new OpenRouterKeyService.ApiKeyCallback() {
                @Override
                public void onSuccess(JSONObject response) {
                    try {
                        JSONObject openrouterResponse = response.getJSONObject("response");
                        // Process response from OpenRouter
                        Log.d("OpenRouter", openrouterResponse.toString());
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
                
                @Override
                public void onError(String error) {
                    Log.e("OpenRouter", "Error: " + error);
                }
            });
    }
}
```

---

## 🌐 Network Configuration

### For Development (Local Testing)

If running backend on your PC and testing on Android emulator/device:

1. **Find your PC's IP address:**
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under your network adapter
   # Usually something like 192.168.1.100
   ```

2. **Use that IP in your Android code:**
   ```java
   apiKeyManager.initializeBackend("http://192.168.1.100:3000");
   ```

3. **On Android Emulator:**
   - Emulator treats `10.0.2.2` as the host machine
   - So use: `http://10.0.2.2:3000`

### For Production

1. **Deploy backend to a server** (AWS, Heroku, Digital Ocean, etc.)
2. **Use the server's URL:**
   ```java
   apiKeyManager.initializeBackend("https://api.yourdomain.com");
   ```

---

## 📚 API Endpoints Reference

### Backend Health Check
```java
apiKeyManager.checkBackendHealth();
// Shows toast with status
```

### Set API Key
```java
apiKeyManager.setApiKey("your-openrouter-api-key");
// Server stores the key and returns success/error
```

### Check API Key Status
```java
apiKeyManager.checkApiStatus();
// Returns if API key is configured and when it was last used
```

### Send Message (Using Stored Key)
```java
apiKeyManager.sendMessage("What is the meaning of life?", "openrouter/auto");
// Sends message to OpenRouter through backend
// Backend retrieves stored API key automatically
```

### Delete API Key
```java
apiKeyManager.deleteApiKey();
// Removes the stored API key from backend
```

---

## 🔐 Security Best Practices

### For Development (⚠️ Not for Production)
```java
apiKeyManager.initializeBackend("http://192.168.1.100:3000");
// No authentication needed locally
```

### For Production

1. **Use HTTPS only:**
```java
apiKeyManager.initializeBackend("https://yourdomain.com");
```

2. **Set API Token:**
```java
apiKeyManager.getKeyService().setApiToken("your-jwt-token");
```

3. **Implement proper backend authentication:**
   - Add JWT/OAuth2
   - Validate tokens server-side
   - Use environment variables for secrets

4. **Store sensitive data securely:**
   - Use Android Keystore for storing tokens
   - Never hardcode URLs or keys
   - Use BuildConfig to load from gradle properties

---

## 🔧 Troubleshooting

### "Can't connect to backend"
1. Check if backend is running: `npm start`
2. Verify IP address is correct
3. Check firewall isn't blocking port 3000
4. On emulator, use `10.0.2.2:3000` instead of `localhost:3000`

### "API Key not saved"
1. Check backend logs for errors
2. Ensure network connection is available
3. Verify API key format is valid (should be > 10 characters)

### "CORS error"
1. Update `ALLOWED_ORIGINS` in backend `.env`
2. Restart backend server
3. Ensure your app's origin matches exactly

### Gradle build errors
1. Clean build: `gradlew.bat clean`
2. Rebuild: `gradlew.bat build`
3. Sync in Android Studio: File > Sync Now

---

## 📦 Dependencies Added

The following were added to `android/app/build.gradle`:
```gradle
implementation 'com.squareup.okhttp3:okhttp:4.11.0'
```

This provides HTTP client functionality for the Android service.

---

## 💡 Example: Complete UI Integration

Here's a minimal example UI for setting the API key:

```xml
<!-- In your layout file (e.g., activity_main.xml) -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">
    
    <EditText
        android:id="@+id/api_key_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Paste your OpenRouter API Key"
        android:inputType="text"
        android:layout_margin="8dp" />
    
    <Button
        android:id="@+id/save_api_key_btn"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Save API Key"
        android:layout_margin="8dp" />
    
    <Button
        android:id="@+id/check_status_btn"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Check Status"
        android:layout_margin="8dp" />
    
    <EditText
        android:id="@+id/message_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Enter message for OpenRouter"
        android:layout_margin="8dp" />
    
    <Button
        android:id="@+id/send_message_btn"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Send Message"
        android:layout_margin="8dp" />
</LinearLayout>
```

```java
// In your Activity
private ApiKeyManager apiKeyManager;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    
    apiKeyManager = new ApiKeyManager(this);
    apiKeyManager.initializeBackend("http://10.0.2.2:3000"); // For emulator
    
    findViewById(R.id.save_api_key_btn).setOnClickListener(v -> {
        String apiKey = ((EditText) findViewById(R.id.api_key_input))
            .getText().toString();
        apiKeyManager.setApiKey(apiKey);
    });
    
    findViewById(R.id.check_status_btn).setOnClickListener(v -> {
        apiKeyManager.checkApiStatus();
    });
    
    findViewById(R.id.send_message_btn).setOnClickListener(v -> {
        String message = ((EditText) findViewById(R.id.message_input))
            .getText().toString();
        apiKeyManager.sendMessage(message, "openrouter/auto");
    });
}
```

---

## 📖 Next Steps

1. ✅ Backend server created and documented
2. ✅ Android service classes created
3. ✅ Dependencies added to build.gradle
4. ⏭️ Create UI in your app to accept API key from user
5. ⏭️ Implement logic to display/use OpenRouter responses
6. ⏭️ Test with your OpenRouter API key
7. ⏭️ Deploy backend to production server
8. ⏭️ Update Android app to point to production backend

---

## 📞 Support

For issues or questions:
1. Check backend logs: `npm start`
2. Check Android Logcat in Android Studio
3. Review the API endpoint documentation in `backend/README.md`
4. Test endpoints using Postman or curl

---

## 📋 Checklist Before Going Live

- [ ] Backend deployed to production server
- [ ] HTTPS certificate installed
- [ ] Android app points to production backend URL
- [ ] Environment variables secured (.env not in git)
- [ ] API key storage encrypted (database, not JSON)
- [ ] Authentication tokens implemented
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Network timeout values reasonable (10-30s)
- [ ] Logged in Logcat/console safely (no API keys logged)

---

Created: May 10, 2026

