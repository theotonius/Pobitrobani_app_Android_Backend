# Quick Start Guide - Sacred Word Backend

## 5-Minute Setup

### 1️⃣ Install Backend
```powershell
cd sacred-word\backend
npm install
```

### 2️⃣ Configure
```powershell
Copy-Item .env.example .env
# Edit .env if needed (mostly good as-is for development)
```

### 3️⃣ Start Server
```powershell
npm start
# Server runs at http://localhost:3000
```

### 4️⃣ Test It
Open a new terminal and test with:
```powershell
# Health check
Invoke-WebRequest http://localhost:3000/health

# Set API key (replace with your actual key)
$body = @{
    apiKey = "sk-test-1234567890"
    deviceId = "test-device"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/keys/openrouter `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Check status
Invoke-WebRequest "http://localhost:3000/api/keys/status?deviceId=test-device"
```

---

## 📱 Android Integration

### Option A: Using ApiKeyManager (Recommended)
```java
public class MainActivity extends BridgeActivity {
    private ApiKeyManager apiKeyManager;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize
        apiKeyManager = new ApiKeyManager(this);
        apiKeyManager.initializeBackend("http://10.0.2.2:3000"); // For emulator
        
        // Use it
        apiKeyManager.setApiKey(userProvidedKey);
        apiKeyManager.checkApiStatus();
        apiKeyManager.sendMessage("Hello, OpenRouter!");
    }
}
```

### Option B: Using OpenRouterKeyService (More Control)
```java
OpenRouterKeyService keyService = new OpenRouterKeyService(context);
keyService.initializeWithBackendUrl("http://10.0.2.2:3000");

keyService.setOpenRouterApiKey("your-api-key", new OpenRouterKeyService.ApiKeyCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        Log.d("Success", response.toString());
    }
    
    @Override
    public void onError(String error) {
        Log.e("Error", error);
    }
});
```

---

## 🌐 Web/Capacitor Integration

### If using JavaScript/TypeScript:
```javascript
import { OpenRouterBackendService } from './OpenRouterBackendService';

const service = new OpenRouterBackendService('http://localhost:3000');

// Set API key
await service.setOpenRouterApiKey('your-openrouter-key');

// Send message
const response = await service.sendMessageToOpenRouter('Hello!');
console.log(response);
```

### For Vue.js:
See `backend/ApiKeyManager.vue.example` for a complete component.

### For React:
See `backend/ApiKeyManager.react.example` for a complete component.

### For Vanilla JavaScript:
See `backend/api-key-manager.vanilla.js` for standalone usage.

---

## 🔑 Important: Backend URL for Different Environments

### Local Development (Computer Testing)
- **Backend URL**: `http://192.168.X.X:3000` (your PC's IP)
- Find your IP: `ipconfig` in terminal

### Android Emulator
- **Backend URL**: `http://10.0.2.2:3000` (special emulator alias)

### Physical Android Device (Same WiFi)
- **Backend URL**: `http://192.168.X.X:3000` (your PC's IP on same network)

### Production
- **Backend URL**: `https://your-backend-domain.com`
- Deploy backend to cloud (AWS, Heroku, etc.)

---

## 📦 Project Structure

```
sacred-word/
├── backend/
│   ├── server.js                    # Main server (Express.js)
│   ├── package.json                 # Dependencies
│   ├── .env                         # Configuration (create from .env.example)
│   ├── .env.example                 # Example config
│   ├── api_keys.json                # Stored API keys (auto-created)
│   │
│   ├── README.md                    # Full backend documentation
│   ├── OpenRouterBackendService.ts  # TypeScript service (for web)
│   │
│   └── Examples:
│       ├── ApiKeyManager.vue.example          # Vue.js component
│       ├── ApiKeyManager.react.example        # React component
│       └── api-key-manager.vanilla.js         # Vanilla JavaScript
│
├── android/
│   ├── app/src/main/java/com/sacredword/app/
│   │   ├── MainActivity.java                 # Main activity
│   │   ├── OpenRouterKeyService.java         # Android service
│   │   └── ApiKeyManager.java                # Android manager
│   │
│   └── app/build.gradle              # Updated with OkHttp dependency
│
└── SETUP_GUIDE.md                    # Detailed setup guide (this file)
```

---

## 🚀 Next Steps

1. ✅ Backend is running on `http://localhost:3000`
2. ⏭️ **Integrate with Android**:
   - Use `ApiKeyManager` in your MainActivity
   - Set backend URL: `http://10.0.2.2:3000` (emulator) or `http://192.168.X.X:3000` (device)
   - Accept API key from user
   - Call `apiKeyManager.setApiKey(userKey)`

3. ⏭️ **Integrate with Web (if using Capacitor's web view)**:
   - Import `OpenRouterBackendService`
   - Create UI form for API key input
   - Handle responses from backend

4. ⏭️ **Test Everything**:
   - Save API key
   - Check status
   - Send a test message

5. ⏭️ **Go to Production**:
   - Deploy backend to cloud server
   - Update app to use production URL
   - Set up HTTPS
   - Implement proper authentication

---

## 🐛 Troubleshooting

### "Connection refused"
- Is backend running? Run `npm start` in backend folder
- Check port 3000 isn't blocked by firewall

### Android can't reach backend
- Using emulator? Use `10.0.2.2:3000` instead of `localhost:3000`
- Using physical device? Use your PC's IP: `ipconfig` → IPv4 Address
- Same WiFi? Device and PC must be on same network

### "CORS error"
1. Check backend is accepting requests from your origin
2. Update `.env` `ALLOWED_ORIGINS` if needed
3. Restart backend

### API key not saving
- Check backend console for errors
- Ensure key is valid (usually starts with `sk-`)
- Try setting again

---

## 📞 Need Help?

1. Check **backend/README.md** for detailed API documentation
2. Check **SETUP_GUIDE.md** for comprehensive integration guide  
3. Look at example files in `backend/` folder
4. Check backend logs: Run backend in terminal to see errors
5. Check Android Logcat for errors from app

---

## 🔒 Security Reminders

⚠️ **Development Only:**
```
- No authentication needed
- .env file with secrets (add to .gitignore)
- Local testing only
```

✅ **Before Production:**
1. Deploy backend to HTTPS server
2. Add authentication (JWT, OAuth2)
3. Encrypt API keys in database (not JSON file)
4. Implement rate limiting
5. Add input validation (already in place)
6. Remove debug logging
7. Set proper environment variables

---

## 📋 Quick Checklist

- [ ] Backend installed (`npm install`)
- [ ] .env file created (from .env.example)
- [ ] Backend running (`npm start`)
- [ ] Backend health check passes
- [ ] Android build includes OkHttp dependency
- [ ] Android code has ApiKeyManager/OpenRouterKeyService
- [ ] Backend URL configured in Android app
- [ ] Can save and retrieve API key
- [ ] Can send test message through backend

---

**You're all set! 🎉**

The system is ready to:
1. Accept OpenRouter API key from users
2. Store it securely in the backend
3. Manage API key lifecycle (set, get, delete)
4. Proxy requests to OpenRouter API
5. Work across Android and web platforms

Start by setting an API key from your Android app and test sending a message!

