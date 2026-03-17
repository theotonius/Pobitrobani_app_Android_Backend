import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('AI Proxy Error: OPENROUTER_API_KEY is missing from environment variables.');
    return response.status(500).json({ error: 'OPENROUTER_API_KEY is not set on the server. Please add it to your environment variables.' });
  }

  console.log(`AI Proxy: Sending request to OpenRouter for model: ${request.body.model}`);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.referer || 'https://sacred-word.app',
        'X-Title': 'Sacred Word'
      },
      body: JSON.stringify(request.body)
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error(`OpenRouter Error (${res.status}):`, responseText);
      try {
        const errorData = JSON.parse(responseText);
        return response.status(res.status).json(errorData);
      } catch (e) {
        return response.status(res.status).send(responseText);
      }
    }

    try {
      const data = JSON.parse(responseText);
      response.json(data);
    } catch (e) {
      console.error('Failed to parse OpenRouter response as JSON:', responseText);
      response.status(500).json({ error: 'Invalid JSON response from OpenRouter.' });
    }
  } catch (error: any) {
    console.error('Server AI Proxy Exception:', error);
    response.status(500).json({ error: `Failed to connect to OpenRouter: ${error.message}` });
  }
}
