const https = require('https');
const fs = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || 'moonshot/moonshot-v1-8k';

function loadSystemPrompt() {
  const candidates = [
    path.join(__dirname, '..', 'skills', 'customer-service.md'),
    path.join(process.cwd(), 'skills', 'customer-service.md'),
    path.join(__dirname, 'skills', 'customer-service.md'),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, 'utf-8');
    } catch {}
  }
  throw new Error(`Skill file not found. Tried: ${candidates.join(', ')}. __dirname=${__dirname}, cwd=${process.cwd()}`);
}

let systemPrompt;

function buildMessages(messages) {
  return [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
  ];
}

module.exports = function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
    }

    // Lazy-load system prompt
    if (!systemPrompt) {
      systemPrompt = loadSystemPrompt();
    }

    const { messages, lang } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    // Inject language hint into the last user message
    const langHint = { zh: '[lang:zh]', ja: '[lang:ja]', en: '[lang:en]' }[lang] || '';
    const taggedMessages = langHint ? messages.map((m, i) =>
      i === messages.length - 1 && m.role === 'user'
        ? { ...m, content: `${langHint} ${m.content}` }
        : m
    ) : messages;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      messages: buildMessages(taggedMessages),
    });

    const apiReq = https.request({
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

    apiReq.on('error', (err) => {
      res.write(`data: [ERROR] ${err.message}\n\n`);
      res.end();
    });

    apiReq.write(body);
    apiReq.end();
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
