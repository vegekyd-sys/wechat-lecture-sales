const express = require('express');
const path = require('path');
const fs = require('fs');
const { chat } = require('./chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Load skill file as system prompt
const skillPath = path.join(__dirname, '..', 'skills', 'customer-service.md');
const systemPrompt = fs.readFileSync(skillPath, 'utf-8');

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    const reply = await chat(systemPrompt, messages);
    res.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
