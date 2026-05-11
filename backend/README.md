# Sacred Word Backend Server

A Node.js/Express backend server for managing the OpenRouter API key for the Sacred Word Android app.

## Features

- ✅ Secure API key management
- ✅ Per-device API key storage
- ✅ CORS support for Capacitor apps
- ✅ OpenRouter API proxy endpoint
- ✅ Health check endpoint
- ✅ Persistent storage (JSON file)
- ✅ Token-based validation

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your settings:
```env
PORT=3000
NODE_ENV=development
API_KEY_SECRET=your-secret-key
OPENROUTER_API_KEY=  # Optional - can be set by client
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000,capacitor://localhost
```

## Running the Server

### Development (with hot reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### 1. Set OpenRouter API Key
```
POST /api/keys/openrouter
Content-Type: application/json

{
  "apiKey": "your-openrouter-api-key",
  "deviceId": "optional-device-identifier"
}

Response:
{
  "success": true,
  "message": "OpenRouter API key saved successfully",
  "deviceId": "optional-device-identifier"
}
```

### 2. Get OpenRouter API Key
```
GET /api/keys/openrouter?deviceId=optional-device-identifier

Response:
{
  "success": true,
  "apiKey": "your-openrouter-api-key",
  "uploadedAt": "2024-01-01T12:00:00Z",
  "lastUsed": "2024-01-01T12:30:00Z"
}
```

### 3. Delete OpenRouter API Key
```
DELETE /api/keys/openrouter?deviceId=optional-device-identifier

Response:
{
  "success": true,
  "message": "OpenRouter API key deleted successfully",
  "deviceId": "optional-device-identifier"
}
```

### 4. Check API Key Status
```
GET /api/keys/status?deviceId=optional-device-identifier

Response:
{
  "success": true,
  "isConfigured": true,
  "deviceId": "optional-device-identifier",
  "lastUsed": "2024-01-01T12:30:00Z"
}
```

### 5. List All Stored Keys (Admin)
```
GET /api/keys/list

Response:
{
  "success": true,
  "keys": [
    {
      "deviceId": "device-1",
      "uploadedAt": "2024-01-01T12:00:00Z",
      "lastUsed": "2024-01-01T12:30:00Z",
      "keyLength": 42
    }
  ],
  "count": 1
}
```

### 6. Proxy Request to OpenRouter
```
POST /api/openrouter/proxy
Content-Type: application/json

{
  "message": "What is the meaning of life?",
  "model": "openrouter/auto",
  "deviceId": "optional-device-identifier"
}

Response:
{
  "success": true,
  "response": {
    "id": "...",
    "choices": [...],
    ...
  }
}
```

### 7. Health Check
```
GET /health

Response:
{
  "status": "ok",
  "message": "Sacred Word Backend is running",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Android Integration

To integrate this backend with your Capacitor Android app, use the HTTP client (native or JavaScript):

### Example using JavaScript (Capacitor):

```javascript
// Set API key
async function setOpenRouterKey(apiKey) {
  try {
    const response = await fetch('http://your-backend-url:3000/api/keys/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': 'your-api-token' // Optional
      },
      body: JSON.stringify({
        apiKey: apiKey,
        deviceId: 'android-device-1'
      })
    });
    
    const data = await response.json();
    console.log('API Key saved:', data);
    return data;
  } catch (error) {
    console.error('Error saving API key:', error);
  }
}

// Get API key
async function getOpenRouterKey() {
  try {
    const response = await fetch(
      'http://your-backend-url:3000/api/keys/openrouter?deviceId=android-device-1',
      {
        method: 'GET',
        headers: {
          'X-API-Token': 'your-api-token' // Optional
        }
      }
    );
    
    const data = await response.json();
    console.log('API Key retrieved:', data);
    return data;
  } catch (error) {
    console.error('Error retrieving API key:', error);
  }
}

// Check status
async function checkApiKeyStatus() {
  try {
    const response = await fetch(
      'http://your-backend-url:3000/api/keys/status?deviceId=android-device-1'
    );
    
    const data = await response.json();
    console.log('Status:', data);
    return data;
  } catch (error) {
    console.error('Error checking status:', error);
  }
}

// Send message using stored API key
async function sendMessage(message) {
  try {
    const response = await fetch('http://your-backend-url:3000/api/openrouter/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': 'your-api-token'
      },
      body: JSON.stringify({
        message: message,
        deviceId: 'android-device-1',
        model: 'openrouter/auto'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

## Storage

API keys are stored in a JSON file (`api_keys.json`) in the backend directory. This is suitable for development. For production, consider using:
- PostgreSQL/MySQL database
- MongoDB
- AWS RDS
- Firebase Realtime Database
- Redis

## Security Considerations

1. **Environment Variables**: Store sensitive data in `.env` file (never commit to git)
2. **HTTPS**: Use HTTPS in production
3. **Authentication**: Implement proper authentication (JWT, OAuth2, etc.)
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Validation**: All inputs are validated
6. **CORS**: Configured to only allow trusted origins

## Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] API key encryption
- [ ] User accounts and authentication
- [ ] Usage analytics
- [ ] Webhook support
- [ ] API versioning

## Troubleshooting

### CORS Errors
Update `ALLOWED_ORIGINS` in `.env` to include your app's URL.

### 404 Errors
Ensure the endpoint path is correct. Check available endpoints with:
```bash
curl http://localhost:3000/health
```

### Connection Refused
Ensure the server is running and accessible at the configured port.

## License

MIT

