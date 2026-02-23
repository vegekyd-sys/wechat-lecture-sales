require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { chatStream } = require('./chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Load skill file as system prompt
const skillPath = path.join(__dirname, '..', 'skills', 'customer-service.md');
const systemPrompt = fs.readFileSync(skillPath, 'utf-8');

// Chat API (streaming)
app.post('/api/chat', (req, res) => {
  const { messages, lang } = req.body;
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

  chatStream(systemPrompt, taggedMessages, res);
});

// Voice token API
app.get('/api/voice-token', (req, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_API_KEY not configured' });
  }
  res.json({ apiKey });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
