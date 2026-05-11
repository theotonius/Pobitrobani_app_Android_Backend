import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.status(200).json({
    status: 'ok',
    message: 'Sacred Word Backend is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}
