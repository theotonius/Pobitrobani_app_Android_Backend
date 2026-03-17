import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (!openrouterKey && !deepseekKey) {
    console.error('AI Proxy Error: No API key found. Set OPENROUTER_API_KEY or DEEPSEEK_API_KEY.');
    return response.status(500).json({ error: 'No API key configured. Please add OPENROUTER_API_KEY or DEEPSEEK_API_KEY in Vercel environment variables.' });
  }

  // Helper function to make API request
  async function makeRequest(apiUrl: string, apiKey: string, headers: Record<string, string>) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(request.body)
    });
    const responseText = await res.text();
    return { status: res.status, text: responseText };
  }

  // Try OpenRouter first
  if (openrouterKey) {
    console.log(`AI Proxy: Trying OpenRouter for model: ${request.body.model}`);

    const openrouterRes = await makeRequest(
      'https://openrouter.ai/api/v1/chat/completions',
      openrouterKey,
      {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.referer || 'https://sacred-word.app',
        'X-Title': 'Sacred Word'
      }
    );

    // If success or error other than quota, return response
    if (openrouterRes.status !== 429) {
      if (!openrouterRes.text) {
        return response.status(500).json({ error: 'Empty response from OpenRouter' });
      }

      if (openrouterRes.status >= 400) {
        console.error(`OpenRouter Error (${openrouterRes.status}):`, openrouterRes.text);
        try {
          const errorData = JSON.parse(openrouterRes.text);
          return response.status(openrouterRes.status).json(errorData);
        } catch (e) {
          return response.status(openrouterRes.status).send(openrouterRes.text);
        }
      }

      try {
        const data = JSON.parse(openrouterRes.text);
        return response.json(data);
      } catch (e) {
        console.error('Failed to parse OpenRouter response:', openrouterRes.text);
        return response.status(500).json({ error: 'Invalid JSON from OpenRouter' });
      }
    }

    // If 429 (quota), try DeepSeek fallback
    console.log('OpenRouter quota exceeded. Trying DeepSeek fallback...');
  }

  // Fallback to DeepSeek
  if (deepseekKey) {
    console.log(`AI Proxy: Trying DeepSeek for model: ${request.body.model}`);

    // Convert model name for DeepSeek if needed
    let deepseekModel = request.body.model;
    if (deepseekModel.includes('gemini')) {
      deepseekModel = 'deepseek-chat';
    }
    if (deepseekModel.includes('deepseek')) {
      deepseekModel = 'deepseek-chat';
    }

    const body = {
      ...request.body,
      model: deepseekModel
    };

    const deepseekRes = await makeRequest(
      'https://api.deepseek.com/v1/chat/completions',
      deepseekKey,
      {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json'
      }
    );

    if (!deepseekRes.text) {
      return response.status(500).json({ error: 'Empty response from DeepSeek' });
    }

    if (deepseekRes.status >= 400) {
      console.error(`DeepSeek Error (${deepseekRes.status}):`, deepseekRes.text);
      try {
        const errorData = JSON.parse(deepseekRes.text);
        return response.status(deepseekRes.status).json(errorData);
      } catch (e) {
        return response.status(deepseekRes.status).send(deepseekRes.text);
      }
    }

    try {
      const data = JSON.parse(deepseekRes.text);
      return response.json(data);
    } catch (e) {
      console.error('Failed to parse DeepSeek response:', deepseekRes.text);
      return response.status(500).json({ error: 'Invalid JSON from DeepSeek' });
    }
  }

  // No fallback available
  return response.status(503).json({ error: 'OpenRouter quota exceeded and no DeepSeek API key available' });
}
