const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL = process.env.MODEL || 'claude-sonnet-4-20250514';

// Load skill file as system prompt
const skillPath = path.join(__dirname, '..', 'skills', 'customer-service.md');
const systemPrompt = fs.readFileSync(skillPath, 'utf-8');

function callClaude(apiKey, messages) {
  const apiMessages = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: apiMessages,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(new Error(`API error ${res.statusCode}: ${parsed.error?.message || data}`));
            return;
          }
          const text = parsed.content?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required' });
  }

  try {
    const reply = await callClaude(apiKey, messages);
    res.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
