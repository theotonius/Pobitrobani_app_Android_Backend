# Sacred Word Backend - Quick Reference Card

## 🚀 Quick Commands

### Start Backend
```powershell
cd sacred-word\backend
npm start
```

### Install Dependencies (First Time)
```powershell
cd sacred-word\backend
npm install
```

### Build Android Project
```powershell
cd sacred-word\android
gradlew.bat build
```

### Clean Android Build
```powershell
cd sacred-word\android
gradlew.bat clean
gradlew.bat build
```

---

## 🌐 Important URLs

### Local Development
- **Web UI**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Android Emulator
- **Backend**: http://10.0.2.2:3000

### Physical Android Device
- **Backend**: http://YOUR_PC_IP:3000
- **Find IP**: Open terminal → `ipconfig` → Look for IPv4 Address

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main backend server |
| `backend/.env` | Configuration (create from .env.example) |
| `backend/api_keys.json` | Stored API keys (auto-created) |
| `android/app/build.gradle` | Android build config |
| `android/app/src/main/.../OpenRouterKeyService.java` | Android service |
| `android/app/src/main/.../ApiKeyManager.java` | Android manager |

---

## 🔧 Environment Setup

### Create .env File
```powershell
cd backend
Copy-Item .env.example .env
```

### Edit .env (Optional - Defaults Work)
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://10.0.2.2:3000,capacitor://localhost
```

---

## 💻 Android Code Template

### In MainActivity
```java
import com.sacredword.app.ApiKeyManager;

public class MainActivity extends BridgeActivity {
    private ApiKeyManager apiKeyManager;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize
        apiKeyManager = new ApiKeyManager(this);
        
        // Set backend URL
        // For emulator: 10.0.2.2:3000
        // For device: Your PC's IP:3000
        apiKeyManager.initializeBackend("http://10.0.2.2:3000");
    }
    
    // Set API key
    public void setKey(String key) {
        apiKeyManager.setApiKey(key);
    }
    
    // Check status
    public void checkStatus() {
        apiKeyManager.checkApiStatus();
    }
    
    // Send message
    public void send(String msg) {
        apiKeyManager.sendMessage(msg, "openrouter/auto");
    }
}
```

---

## 🌐 JavaScript Code Template

```javascript
import { OpenRouterBackendService } from './OpenRouterBackendService';

const service = new OpenRouterBackendService('http://localhost:3000');

// Set API key
await service.setOpenRouterApiKey('sk-your-key');

// Check status
const status = await service.checkApiKeyStatus();
console.log(status.isConfigured); // true or false

// Send message
const result = await service.sendMessageToOpenRouter('Hello!');
console.log(result.response);
```

---

## 🐛 Quick Debugging

### Check Backend Logs
Look at the terminal where you ran `npm start` for error messages.

### Check Android Logs
```
Android Studio > View > Tool Windows > Logcat
Search for "OpenRouter" or "ApiKey"
```

### Test Backend with PowerShell
```powershell
# Health check
Invoke-WebRequest http://localhost:3000/health

# Set key
$body = @{ apiKey="test"; deviceId="dev1" } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3000/api/keys/openrouter `
  -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

# Check status  
Invoke-WebRequest "http://localhost:3000/api/keys/status?deviceId=dev1"
```

---

## 📋 Common Issues

| Issue | Fix |
|-------|-----|
| `EADDRINUSE` (port in use) | Kill process: `taskkill /PID <PID> /F` |
| Can't connect from Android | Use `10.0.2.2:3000` (emulator) or `192.168.X.X:3000` (device) |
| CORS error | Update `.env` `ALLOWED_ORIGINS` |
| Build fails | Run `gradlew.bat clean` then `gradlew.bat build` |
| Java symbol not found | Check file location: `com/sacredword/app/` |

See **TROUBLESHOOTING.md** for detailed solutions.

---

## 🔐 Security Reminders

- ✅ Add `.env` to `.gitignore` (never commit secrets)
- ✅ Use HTTPS in production (not HTTP)
- ✅ Implement authentication (JWT/OAuth2)
- ✅ Encrypt stored API keys (use database, not JSON)
- ✅ Never log API keys or secrets

---

## 📚 Documentation Files

- **QUICK_START.md** - Get running in 5 minutes
- **SETUP_GUIDE.md** - Detailed integration guide
- **TROUBLESHOOTING.md** - Problem solving
- **INTEGRATION_SUMMARY.md** - What was created
- **backend/README.md** - Full API reference
- **backend/.env.example** - Configuration template

---

## ✅ Verification Commands

```powershell
# 1. Check Node.js installed
node --version

# 2. Check npm installed  
npm --version

# 3. Check Java installed
java -version

# 4. Check Gradle installed
cd android
gradlew.bat --version

# 5. Check backend dependencies
cd backend
npm list

# 6. Check Android SDK
echo $env:ANDROID_HOME
```

---

## 🎯 Typical Workflow

1. **Start Backend**
   ```powershell
   cd sacred-word/backend
   npm start
   ```

2. **Test in Browser** (Optional)
   - Open http://localhost:3000
   - Save an API key
   - Check status

3. **Build Android**
   ```powershell
   cd sacred-word/android
   gradlew.bat build
   ```

4. **Run App**
   - Open in Android Studio or emulator
   - Set backend URL in code
   - Save API key from app
   - Send test message

5. **Deploy**
   - Deploy backend to cloud server
   - Update Android backend URL
   - Set up HTTPS
   - Implement authentication

---

## 🚀 Production Deployment

### Backend to Cloud
```powershell
# Build
npm run build (if you add build script)

# Deploy to Heroku/AWS/etc
# Set environment variables
# Update HTTPS URL
```

### Android Update
```java
// Change from:
apiKeyManager.initializeBackend("http://10.0.2.2:3000");

// To:
apiKeyManager.initializeBackend("https://api.yourdomain.com");
```

---

## 💡 Pro Tips

1. **Use different ports for multiple tests**
   - Port 3000: Main backend
   - Port 3001: Testing/staging
   - Controlled via `.env` `PORT=xxxx`

2. **Use Device ID to track users**
   ```java
   apiKeyManager.getKeyService().getDeviceId() // Get current ID
   ```

3. **Cache responses**
   ```javascript
   service.getApiKeyStatus() // Check before every request
   ```

4. **Error handling**
   ```javascript
   const result = await service.setOpenRouterApiKey(key);
   if (!result.success) {
       console.error(result.error);
       showUserMessage(result.error);
   }
   ```

---

## 📞 Support Matrix

| Question | Answer |
|----------|--------|
| Where do I start? | Read QUICK_START.md |
| How do I integrate? | Read SETUP_GUIDE.md |
| Something's broken? | Read TROUBLESHOOTING.md |
| What's available? | Read backend/README.md |
| How do I use it? | See ApiKeyManager examples |
| Can't find file? | Check INTEGRATION_SUMMARY.md |

---

## 🎉 Quick Launch Checklist

- [ ] Backend runs: `npm start` ✓
- [ ] Android builds: `gradlew.bat build` ✓
- [ ] Can access http://localhost:3000 ✓
- [ ] Can set API key ✓
- [ ] Android can connect to backend ✓
- [ ] Can send message successfully ✓

**Ready to go!** 🚀

---

*Last Updated: May 10, 2026*
*For full documentation, see the .md files in the project root*

