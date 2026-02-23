module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_API_KEY not configured' });
  }

  // Return the API key for the browser to connect to Gemini Live WebSocket.
  // In production, replace this with ephemeral token generation for better security.
  res.json({ apiKey });
};
