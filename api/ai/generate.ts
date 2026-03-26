import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FallbackConfig {
  name: string;
  model: string;
  apiUrl: string;
  apiKey: string;
  headers: Record<string, string>;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) {
    console.error('AI Proxy Error: No API key found. Set OPENROUTER_API_KEY.');
    return response.status(500).json({ error: 'No API key configured. Please add OPENROUTER_API_KEY in Vercel environment variables.' });
  }

  async function makeRequest(apiUrl: string, apiKey: string, headers: Record<string, string>, body: any) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const responseText = await res.text();
    return { status: res.status, text: responseText };
  }

  function parseAndReturnResponse(res: any, providerName: string) {
    if (!res.text) {
      return { error: true, status: 500, message: `Empty response from ${providerName}` };
    }

    if (res.status >= 400) {
      try {
        const errorData = JSON.parse(res.text);
        return { error: true, status: res.status, data: errorData };
      } catch (e) {
        return { error: true, status: res.status, text: res.text };
      }
    }

    try {
      const data = JSON.parse(res.text);
      return { error: false, data };
    } catch (e) {
      return { error: true, status: 500, message: `Invalid JSON from ${providerName}`, text: res.text };
    }
  }

  const baseHeaders = {
    'Content-Type': 'application/json',
    'HTTP-Referer': request.headers.referer || 'https://sacred-word.app',
    'X-Title': 'Sacred Word'
  };

  const fallbackChain: FallbackConfig[] = [];

  if (openrouterKey) {
    fallbackChain.push({
      name: 'DeepSeek Chat',
      model: 'deepseek-chat',
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: openrouterKey,
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        ...baseHeaders
      }
    });

    fallbackChain.push({
      name: 'Claude Haiku 4.5',
      model: 'anthropic/claude-haiku-4-5',
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: openrouterKey,
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        ...baseHeaders
      }
    });
  }

  if (openrouterKey) {
    console.log(`AI Proxy: Trying OpenRouter for model: ${request.body.model}`);

    const openrouterRes = await makeRequest(
      'https://openrouter.ai/api/v1/chat/completions',
      openrouterKey,
      {
        'Authorization': `Bearer ${openrouterKey}`,
        ...baseHeaders
      },
      { ...request.body, max_tokens: 7000 }
    );

    const primaryResult = parseAndReturnResponse(openrouterRes, 'OpenRouter');

    if (!primaryResult.error) {
      return response.json(primaryResult.data);
    }

    if (openrouterRes.status !== 429) {
      console.error(`OpenRouter Error (${openrouterRes.status}):`, openrouterRes.text);
      if (primaryResult.data) {
        return response.status(primaryResult.status!).json(primaryResult.data);
      }
      return response.status(primaryResult.status!).send(primaryResult.text || primaryResult.message);
    }

    console.log('OpenRouter quota exceeded or error. Trying fallback chain...');
  }

  for (let i = 0; i < fallbackChain.length; i++) {
    const fallback = fallbackChain[i];
    console.log(`AI Proxy: Trying Fallback ${i + 1}/${fallbackChain.length} - ${fallback.name} (${fallback.model})`);

    const body = {
      ...request.body,
      model: fallback.model,
      max_tokens: 7000
    };

    const fallbackRes = await makeRequest(
      fallback.apiUrl,
      fallback.apiKey,
      fallback.headers,
      body
    );

    const result = parseAndReturnResponse(fallbackRes, fallback.name);

    if (!result.error) {
      console.log(`AI Proxy: ${fallback.name} succeeded!`);
      return response.json(result.data);
    }

    console.error(`${fallback.name} Error (${fallbackRes.status}):`, fallbackRes.text);

    if (i < fallbackChain.length - 1) {
      console.log(`Trying next fallback...`);
    }
  }

  console.error('AI Proxy: All fallback models exhausted');
  return response.status(503).json({ error: 'All AI services failed. Please try again later.' });
}
