require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (replace with database in production)
let apiKeyStorage = {};
const STORAGE_FILE = path.join(__dirname, 'api_keys.json');

// Load stored API keys on startup
function loadStoredKeys() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      apiKeyStorage = JSON.parse(data);
      console.log('Loaded stored API keys');
    }
  } catch (err) {
    console.error('Error loading stored keys:', err);
  }
}

// Save API keys to file
function saveStoredKeys() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(apiKeyStorage, null, 2));
    console.log('Saved API keys');
  } catch (err) {
    console.error('Error saving keys:', err);
  }
}

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8080',
      'capacitor://localhost',
      'ionic://localhost'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Token']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files (for web UI)
app.use(express.static('.'))

// Middleware to validate API requests (basic token validation)
const validateApiToken = (req, res, next) => {
  const token = req.headers['x-api-token'];

  // For development, allow requests without token
  // In production, implement proper authentication
  if (process.env.NODE_ENV === 'production' && !token) {
    return res.status(401).json({ error: 'Missing API token' });
  }

  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sacred Word Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes

/**
 * POST /api/keys/openrouter
 * Set the OpenRouter API key
 * Body: { apiKey: "your-api-key", deviceId?: "device-identifier" }
 */
app.post('/api/keys/openrouter', validateApiToken, (req, res) => {
  try {
    const { apiKey, deviceId } = req.body;

    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({ error: 'API key is required' });
    }

    const key = deviceId || 'default';

    // Validate API key format (basic check)
    if (apiKey.length < 10) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    // Store the API key
    apiKeyStorage[key] = {
      apiKey: apiKey,
      uploadedAt: new Date().toISOString(),
      lastUsed: null
    };

    saveStoredKeys();

    res.json({
      success: true,
      message: 'OpenRouter API key saved successfully',
      deviceId: key
    });
  } catch (error) {
    console.error('Error setting API key:', error);
    res.status(500).json({ error: 'Failed to save API key', details: error.message });
  }
});

/**
 * GET /api/keys/openrouter
 * Get the OpenRouter API key
 * Query: { deviceId?: "device-identifier" }
 */
app.get('/api/keys/openrouter', validateApiToken, (req, res) => {
  try {
    const { deviceId } = req.query;
    const key = deviceId || 'default';

    if (!apiKeyStorage[key]) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const stored = apiKeyStorage[key];

    // Update last used timestamp
    apiKeyStorage[key].lastUsed = new Date().toISOString();
    saveStoredKeys();

    res.json({
      success: true,
      apiKey: stored.apiKey,
      uploadedAt: stored.uploadedAt,
      lastUsed: stored.lastUsed
    });
  } catch (error) {
    console.error('Error retrieving API key:', error);
    res.status(500).json({ error: 'Failed to retrieve API key', details: error.message });
  }
});

/**
 * DELETE /api/keys/openrouter
 * Delete the OpenRouter API key
 * Query: { deviceId?: "device-identifier" }
 */
app.delete('/api/keys/openrouter', validateApiToken, (req, res) => {
  try {
    const { deviceId } = req.query;
    const key = deviceId || 'default';

    if (!apiKeyStorage[key]) {
      return res.status(404).json({ error: 'API key not found' });
    }

    delete apiKeyStorage[key];
    saveStoredKeys();

    res.json({
      success: true,
      message: 'OpenRouter API key deleted successfully',
      deviceId: key
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key', details: error.message });
  }
});

/**
 * GET /api/keys/status
 * Check if API key is configured
 * Query: { deviceId?: "device-identifier" }
 */
app.get('/api/keys/status', validateApiToken, (req, res) => {
  try {
    const { deviceId } = req.query;
    const key = deviceId || 'default';

    const hasKey = !!apiKeyStorage[key];

    res.json({
      success: true,
      isConfigured: hasKey,
      deviceId: key,
      lastUsed: hasKey ? apiKeyStorage[key].lastUsed : null
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Failed to check status', details: error.message });
  }
});

/**
 * POST /api/openrouter/proxy
 * Proxy requests to OpenRouter API
 * Body: { message: string, model?: string }
 */
app.post('/api/openrouter/proxy', validateApiToken, async (req, res) => {
  try {
    const { apiKey, message, model, deviceId } = req.body;

    let apiKeyToUse = apiKey;

    // If no API key provided in request, try to use stored one
    if (!apiKeyToUse) {
      const key = deviceId || 'default';
      if (apiKeyStorage[key]) {
        apiKeyToUse = apiKeyStorage[key].apiKey;
      }
    }

    if (!apiKeyToUse) {
      return res.status(400).json({ error: 'No OpenRouter API key available' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Forward request to OpenRouter API
    const axios = require('axios');
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model || 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKeyToUse}`,
        'HTTP-Referer': 'https://sacredword.app',
        'X-Title': 'Sacred Word App'
      }
    });

    res.json({
      success: true,
      response: response.data
    });
  } catch (error) {
    console.error('Error proxying to OpenRouter:', error.message);
    res.status(500).json({
      error: 'Failed to communicate with OpenRouter',
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/keys/list
 * List all stored device keys (admin endpoint)
 */
app.get('/api/keys/list', validateApiToken, (req, res) => {
  try {
    const keys = Object.keys(apiKeyStorage).map(key => ({
      deviceId: key,
      uploadedAt: apiKeyStorage[key].uploadedAt,
      lastUsed: apiKeyStorage[key].lastUsed,
      keyLength: apiKeyStorage[key].apiKey?.length || 0
    }));

    res.json({
      success: true,
      keys: keys,
      count: keys.length
    });
  } catch (error) {
    console.error('Error listing keys:', error);
    res.status(500).json({ error: 'Failed to list keys', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Load stored keys and start server
loadStoredKeys();

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Sacred Word Backend Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`🔄 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`  POST   /api/keys/openrouter       - Set OpenRouter API key`);
  console.log(`  GET    /api/keys/openrouter       - Get OpenRouter API key`);
  console.log(`  DELETE /api/keys/openrouter       - Delete OpenRouter API key`);
  console.log(`  GET    /api/keys/status           - Check if API key is configured`);
  console.log(`  GET    /api/keys/list             - List all stored keys`);
  console.log(`  POST   /api/openrouter/proxy      - Proxy requests to OpenRouter API`);
  console.log(`  GET    /health                    - Health check`);
  console.log('\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📦 Saving data and shutting down...');
  saveStoredKeys();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

