require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const KEYS_FILE = process.env.VERCEL
  ? path.join('/tmp', 'api_keys.json')
  : path.join(__dirname, 'api_keys.json');

// CORS - সব ডিভাইসকে এক্সেস দেওয়া হচ্ছে
app.use(cors());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the backend directory
app.use(express.static(__dirname));

// --- Persistent storage helpers ---

function loadKeys() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading keys file:', e.message);
  }
  return {};
}

function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
}

// --- Routes ---

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sacred Word Backend is running' });
});

// AI Generation Endpoint (Frontend calls this)
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { model, messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: OPENROUTER_API_KEY missing' });
    }

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model || 'google/gemini-2.0-flash-exp:free',
      messages: messages,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://sacredword.app',
        'X-Title': 'Sacred Word App'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('AI Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to connect with AI service' });
  }
});

// Set OpenRouter API key
app.post('/api/keys/openrouter', (req, res) => {
  const { apiKey, deviceId } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }
  const id = deviceId || 'default';
  const keys = loadKeys();
  keys[id] = { apiKey, uploadedAt: new Date().toISOString(), lastUsed: new Date().toISOString() };
  saveKeys(keys);
  res.json({ success: true, message: 'OpenRouter API key saved successfully', deviceId: id });
});

// Get OpenRouter API key
app.get('/api/keys/openrouter', (req, res) => {
  const deviceId = req.query.deviceId || 'default';
  const keys = loadKeys();
  const entry = keys[deviceId];
  if (!entry) {
    return res.status(404).json({ success: false, error: 'No API key found for this device' });
  }
  entry.lastUsed = new Date().toISOString();
  saveKeys(keys);
  res.json({ success: true, apiKey: entry.apiKey, uploadedAt: entry.uploadedAt, lastUsed: entry.lastUsed });
});

// Delete OpenRouter API key
app.delete('/api/keys/openrouter', (req, res) => {
  const deviceId = req.query.deviceId || 'default';
  const keys = loadKeys();
  if (!keys[deviceId]) {
    return res.status(404).json({ success: false, error: 'No API key found for this device' });
  }
  delete keys[deviceId];
  saveKeys(keys);
  res.json({ success: true, message: 'OpenRouter API key deleted successfully', deviceId });
});

// Check API key status
app.get('/api/keys/status', (req, res) => {
  const deviceId = req.query.deviceId || 'default';
  const keys = loadKeys();
  const entry = keys[deviceId];
  res.json({
    success: true,
    isConfigured: !!entry,
    deviceId,
    lastUsed: entry ? entry.lastUsed : null
  });
});

// List all stored keys (admin)
app.get('/api/keys/list', (req, res) => {
  const keys = loadKeys();
  const list = Object.entries(keys).map(([deviceId, entry]) => ({
    deviceId,
    uploadedAt: entry.uploadedAt,
    lastUsed: entry.lastUsed,
    keyLength: entry.apiKey ? entry.apiKey.length : 0
  }));
  res.json({ success: true, keys: list, count: list.length });
});

// Proxy request to OpenRouter using stored API key
app.post('/api/openrouter/proxy', async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, error: 'Invalid request body' });
    }
    const { message, model, deviceId } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const id = deviceId || 'default';
    const keys = loadKeys();
    const entry = keys[id];
    if (!entry || !entry.apiKey) {
      return res.status(400).json({ success: false, error: 'No API key configured. Please set your API key first.' });
    }
    entry.lastUsed = new Date().toISOString();
    saveKeys(keys);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model || 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'user', content: message }],
      max_tokens: 5000
    }, {
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${entry.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sacredword.app',
        'X-Title': 'Sacred Word App'
      }
    });

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error('OpenRouter Proxy Error:', error.message);
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const detail = data?.error?.message || data?.error || JSON.stringify(data);
      res.status(status).json({ success: false, error: `OpenRouter error (${status}): ${detail}` });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({ success: false, error: 'AI service timeout after 30s' });
    } else {
      res.status(502).json({ success: false, error: `Connection failed: ${error.message}` });
    }
  }
});

// 404 catch-all — return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// Vercel এর জন্য export করা হচ্ছে
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
