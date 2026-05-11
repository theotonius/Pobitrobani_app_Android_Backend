require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - সব ডিভাইসকে এক্সেস দেওয়া হচ্ছে
app.use(cors());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the backend directory
app.use(express.static(__dirname));

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

// Vercel এর জন্য export করা হচ্ছে
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
