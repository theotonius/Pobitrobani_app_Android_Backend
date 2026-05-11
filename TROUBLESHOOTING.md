# Troubleshooting Guide - Sacred Word Backend Setup

## 🔴 Common Issues and Solutions

### Issue 1: "Connection Refused" - Backend Server Not Running

**Error Message:**
```
Connection refused
or
Failed to connect to localhost:3000
```

**Solution:**
1. Make sure you're in the backend folder:
```powershell
cd sacred-word\backend
```

2. Check if dependencies are installed:
```powershell
npm install
```

3. Start the server:
```powershell
npm start
```

4. You should see:
```
🚀 Sacred Word Backend Server
📡 Running on http://localhost:3000
```

5. **Verify it's running** with a new terminal:
```powershell
# Using PowerShell
Invoke-WebRequest http://localhost:3000/health

# Should return
# Status 200 OK with health check response
```

---

### Issue 2: "Port 3000 Already in Use"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process is using port 3000

**Solution A - Kill the existing process:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with the number from above)
taskkill /PID <PID> /F

# Restart server
npm start
```

**Solution B - Use a different port:**
```powershell
# Edit .env file
# Change PORT=3000 to PORT=3001

# Or set port temporarily
$env:PORT=3001
npm start
```

---

### Issue 3: Android App Can't Connect to Backend

**Error Message:**
```
Network error: Unable to reach backend
or
Failed to connect to localhost:3000
```

**Cause:** Backend URL is incorrect for Android environment

**Solution:**

#### For Android Emulator:
Replace `localhost` with `10.0.2.2`:
```java
// WRONG:
apiKeyManager.initializeBackend("http://localhost:3000");

// CORRECT:
apiKeyManager.initializeBackend("http://10.0.2.2:3000");
```

#### For Physical Android Device (on same WiFi):
```powershell
# Step 1: Find your PC's IPv4 address
ipconfig

# Look for: IPv4 Address under your network adapter
# Example: 192.168.1.100
```

```java
// Use your PC's IP instead of localhost
apiKeyManager.initializeBackend("http://192.168.1.100:3000");
```

#### For Remote Server:
```java
// Use your server's domain or IP
apiKeyManager.initializeBackend("https://api.yourdomain.com");
```

---

### Issue 4: "CORS Error" - Origin Not Allowed

**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
or
No 'Access-Control-Allow-Origin' header is present
```

**Cause:** Backend doesn't recognize the request origin

**Solution:**

1. Edit `backend/.env`:
```env
# Add your app URL to ALLOWED_ORIGINS
ALLOWED_ORIGINS=http://localhost:3000,http://10.0.2.2:3000,http://192.168.1.100:3000,capacitor://localhost,ionic://localhost
```

2. Restart the backend:
```powershell
npm start
```

3. If still not working, check the request origin in browser console:
```javascript
fetch('http://localhost:3000/health').catch(e => console.log(e));
```

---

### Issue 5: API Key Not Saving

**Error Message:**
```
Failed to save API key
or
Invalid API key format
```

**Solutions:**

1. **Check API Key Format:**
   - OpenRouter keys usually start with `sk-`
   - Keys must be longer than 10 characters
   - Copy the key correctly (no spaces)

2. **Check Backend Logs:**
   ```
   Your backend terminal should show:
   - POST request received
   - Any error messages
   ```

3. **Test with curl:**
   ```powershell
   $body = @{
       apiKey = "your-actual-key"
       deviceId = "test-device"
   } | ConvertTo-Json

   Invoke-WebRequest -Uri http://localhost:3000/api/keys/openrouter `
     -Method POST `
     -ContentType "application/json" `
     -Body $body
   ```

---

### Issue 6: "Gradle Build Failure" in Android

**Error Message:**
```
Could not find com.squareup.okhttp3:okhttp:4.11.0
or
Failed to resolve dependency
```

**Solution:**

1. **Ensure you edited the right file:**
   - Should be: `android/app/build.gradle`
   - NOT: `android/build.gradle`

2. **Check your internet connection** - Gradle needs to download dependencies

3. **Clean and rebuild:**
```powershell
cd android
gradlew.bat clean
gradlew.bat build
```

4. **If still failing, check Maven Central availability:**
```powershell
# Try using different repository
# Edit android/build.gradle and ensure you have:
repositories {
    google()
    mavenCentral()
}
```

---

### Issue 7: "Cannot Find Symbol" - Java Compilation Error

**Error:**
```
Cannot find symbol
  symbol: class OpenRouterKeyService
```

**Cause:** Java files not in correct location

**Solution:**

1. Verify file location:
```
C:\Users\ProjectAdmin\Desktop\sacred-word\android\app\src\main\java\com\sacredword\app\OpenRouterKeyService.java
```

2. Verify package declaration in OpenRouterKeyService.java:
```java
package com.sacredword.app;  // ✓ Correct
```

3. If files are in wrong location, move them to:
```
android/app/src/main/java/com/sacredword/app/
```

---

### Issue 8: Backend Works Locally but Not on Device

**Cause:** Firewall blocking port 3000

**Solution:**

1. **Allow port in Windows Firewall:**
   - Windows Defender Firewall > Advanced Settings
   - Inbound Rules > New Rule
   - Port 3000, TCP
   - Allow connection

2. **Or disable firewall temporarily for testing:**
```powershell
# WARNING: Only for testing!
netsh advfirewall set allprofiles state off

# Re-enable when done
netsh advfirewall set allprofiles state on
```

3. **Check if device can reach PC:**
   - Device and PC must be on same WiFi
   - Ping test: `ping 192.168.1.100` (from device's terminal if available)

---

### Issue 9: npm install Fails

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**

```powershell
# Try forcing npm to resolve dependencies
npm install --legacy-peer-deps

# Or use yarn
yarn install

# Or clear npm cache
npm cache clean --force
npm install
```

---

### Issue 10: API Key Lost After Restart

**Cause:** API keys are stored in `api_keys.json` file that gets deleted

**Solution:**

**For Development (Current):**
- API keys are saved to `api_keys.json`
- Keys persist between restarts ✓
- Check if file exists: `backend/api_keys.json`

**For Production:**
- Move to database (PostgreSQL, MongoDB, etc.)
- Never store secrets in plain text files
- Implement encryption

---

## 🔍 Debugging Checklist

### Backend Issues:

- [ ] Backend running? (`npm start` shows "Running on...")
- [ ] Port not in use? (`netstat -ano | findstr :3000`)
- [ ] .env file exists? (`backend/.env` created from `.env.example`)
- [ ] Dependencies installed? (`npm install` completed)
- [ ] Check logs in terminal for errors

### Android Issues:

- [ ] Backend URL correct? (use `10.0.2.2:3000` for emulator)
- [ ] Internet permission enabled? (AndroidManifest.xml)
- [ ] OkHttp dependency added? (build.gradle)
- [ ] Java files in correct folder? (`com/sacredword/app/`)
- [ ] App built successfully? (no gradle errors)
- [ ] Check Android Logcat for errors

### Network Issues:

- [ ] Backend responding? (`curl http://localhost:3000/health`)
- [ ] Firewall allowing port? (Windows Firewall check)
- [ ] Device on same WiFi? (if using device, not emulator)
- [ ] Correct IP address? (`ipconfig` to verify)
- [ ] CORS configured? (ALLOWED_ORIGINS in .env)

---

## 🧪 Testing Commands

### PowerShell Testing:

```powershell
# 1. Check backend is running
Invoke-WebRequest http://localhost:3000/health

# 2. Set API key
$body = @{
    apiKey = "test-key-1234567890"
    deviceId = "test-device"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/keys/openrouter `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# 3. Check status
Invoke-WebRequest "http://localhost:3000/api/keys/status?deviceId=test-device"

# 4. Send message
$msgBody = @{
    message = "Hello, OpenRouter!"
    deviceId = "test-device"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/openrouter/proxy `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $msgBody
```

### Using Browser:

1. Open `http://localhost:3000` in browser
2. A test UI should load
3. Configure backend URL
4. Test API key operations
5. Check responses

---

## 📞 Getting More Help

### Check Logs:

**Backend Logs:**
```
Look at the terminal where you ran: npm start
Errors and info are printed there
```

**Android Logs:**
1. Open Android Studio
2. View > Tool Windows > Logcat
3. Search for "OpenRouter" or "ApiKey"
4. Look for error messages and stack traces

### Manual Testing:

```javascript
// In browser console (F12)
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e));
```

### Reset Everything:

```powershell
# Stop backend
# Press Ctrl+C in backend terminal

# Clean build
cd android
gradlew.bat clean
gradlew.bat build

# Remove stored keys
cd backend
Remove-Item api_keys.json -Force

# Reinstall and start
npm install
npm start
```

---

## ✅ Verification Checklist - Before Assuming It's Broken

1. **Backend Running?**
   - [ ] Terminal shows "Running on http://localhost:3000"
   - [ ] No error messages in terminal

2. **Android Development Environment?**
   - [ ] JDK installed (check: `java -version`)
   - [ ] Android SDK installed
   - [ ] ANDROID_HOME set up
   - [ ] Gradle working (check: `gradlew.bat --version`)

3. **Project Files Created?**
   - [ ] `backend/server.js` exists
   - [ ] `backend/.env` exists (created from .env.example)
   - [ ] `android/app/src/main/java/com/sacredword/app/OpenRouterKeyService.java` exists
   - [ ] `android/app/src/main/java/com/sacredword/app/ApiKeyManager.java` exists

4. **Dependencies Installed?**
   - [ ] `backend/node_modules/` folder exists
   - [ ] `android/build/` shows no errors
   - [ ] OkHttp in build.gradle dependencies

5. **Network Connectivity?**
   - [ ] Your PC and device/emulator on same WiFi (if using device)
   - [ ] Firewall not blocking port 3000
   - [ ] Correct backend URL in Android code

---

## 🚀 Everything Working?

If you've gone through the checklist and everything is working:

1. Set your OpenRouter API Key
2. Check the status shows "configured"
3. Send a test message
4. You should get a response from OpenRouter

**Success! 🎉**

If still stuck, check:
- Backend terminal for errors
- Android Logcat for errors
- This guide for your specific error

