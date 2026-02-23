const https = require('https');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || 'moonshot/moonshot-v1-8k';

function buildMessages(systemPrompt, messages) {
  return [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
  ];
}

async function chat(systemPrompt, messages) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 1024,
    messages: buildMessages(systemPrompt, messages),
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(new Error(`API error ${res.statusCode}: ${parsed.error?.message || data}`));
            return;
          }
          resolve(parsed.choices?.[0]?.message?.content || '');
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

function chatStream(systemPrompt, messages, res) {
  if (!OPENROUTER_API_KEY) {
    res.write('data: [ERROR] OPENROUTER_API_KEY not set\n\n');
    res.end();
    return;
  }

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 1024,
    stream: true,
    messages: buildMessages(systemPrompt, messages),
  });

  const req = https.request({
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
  }, (apiRes) => {
    apiRes.on('data', chunk => {
      res.write(chunk);
    });
    apiRes.on('end', () => {
      res.end();
    });
  });

  req.on('error', (err) => {
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  });

  req.write(body);
  req.end();
}

module.exports = { chat, chatStream };
