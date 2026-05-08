const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- AI CHATBOT LOGIC (Ported from Netlify function) ---

const NVIDIA_MODEL = 'nvidia/nemotron-3-nano-30b-a3b';
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const DEFAULT_SYSTEM_PROMPT = 'Physics Assistant: Answer only physics questions concisely. Always use LaTeX for math formulas (e.g., $E=mc^2$ or \\[V=IR\\]). Do not respond to non-physics content.';

function sanitizeMessages(messages = []) {
  return messages
    .filter(message => message && typeof message.role === 'string' && typeof message.content === 'string')
    .slice(-10)
    .map(message => ({
      role: message.role === 'model' ? 'assistant' : message.role,
      content: message.content
    }));
}

function buildSystemMessage(systemPrompt) {
  const basePrompt = typeof systemPrompt === 'string' && systemPrompt.trim() ? systemPrompt.trim() : DEFAULT_SYSTEM_PROMPT;
  return {
    role: 'system',
    content: basePrompt
  };
}

function generateSimulatedResponse(messages, context) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg) return "How can I help you with physics today?";
  const query = lastUserMsg.content.toLowerCase();

  const kb = [
    { keywords: ["young", "double slit", "interference", "fringe", "constructive", "destructive"], response: "In Young's Double Slit Experiment, light passes through two narrow, closely spaced slits, creating an interference pattern. Bright fringes are constructive interference, dark fringes are destructive." },
    { keywords: ["single slit", "diffraction", "central maximum"], response: "Single Slit Diffraction creates a pattern with a wide central maximum and dimmer side fringes as light bends around the slit edges." },
    { keywords: ["projectile", "trajectory", "parabola", "angle", "range"], response: "Projectile Motion follows a parabolic path. The horizontal velocity stays constant (ignoring air), while vertical velocity is changed by gravity." },
    { keywords: ["kinetic", "potential", "ke", "pe", "energy conservation"], response: "Total mechanical energy (KE+PE) remains constant. As a projectile goes up, KE turns into PE. On the way down, PE turns back into KE." },
    { keywords: ["electric field", "field lines", "coulomb", "charge"], response: "An electric field exerts force on charges. Lines point away from positive and towards negative charges. Force follows Coulomb's Law (1/r²)." },
    { keywords: ["potential", "equipotential", "voltage"], response: "Electric potential is PE per unit charge. Equipotential surfaces are regions where the voltage is the same everywhere." },
    { keywords: ["formula", "equation"], response: "Key formulas: Range = (v² sin 2θ)/g, Fringe Width = λL/d, E = kQ/r², KE = ½mv²." },
    { keywords: ["hello", "hi", "nova"], response: "Hello! I'm NOVA, your physics AI tutor. Ask me anything about the simulations!" }
  ];

  for (const entry of kb) {
    if (entry.keywords.some(kw => query.includes(kw))) return entry.response;
  }
  return "That's interesting! I specialize in physics like wave optics, projectile motion, and electric fields. Want to learn more about one of those?";
}

app.post('/api/chat', async (req, res) => {
  console.log(`--- SERVER: RECEIVED CHAT REQUEST ---`);
  const { messages: rawMessages, systemPrompt, context } = req.body;
  const messages = sanitizeMessages(rawMessages);

  if (!messages.length) return res.status(400).json({ error: 'A user message is required.' });

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.log('--- SERVER: NVIDIA API KEY MISSING, USING SIMULATED FALLBACK ---');
    return res.json({ reply: generateSimulatedResponse(messages, context || {}), thinking: '' });
  }

  const body = {
    model: NVIDIA_MODEL,
    messages: [buildSystemMessage(systemPrompt), ...messages],
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2048,
    extra_body: {
      reasoning_budget: 1024,
      chat_template_kwargs: { enable_thinking: true }
    }
  };

  try {
    console.log(`--- SERVER: SENDING REQUEST TO NVIDIA ---`);
    const response = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    console.log(`--- SERVER: NVIDIA RESPONSE STATUS: ${response.status} ---`);

    if (!response.ok) {
      const err = await response.json();
      console.error('NVIDIA Error:', err);
      throw new Error('API Error');
    }
    const data = await response.json();
    let reply = '';
    let thinking = '';
    try {
      const choice = data.choices[0].message;
      thinking = choice.reasoning_content || '';
      reply = choice.content || '';
    } catch (e) {
      reply = generateSimulatedResponse(messages, context || {});
    }
    res.json({ reply, thinking });
  } catch (error) {
    res.json({ reply: generateSimulatedResponse(messages, context || {}), thinking: '' });
  }
});

app.post('/api/lesson', async (req, res) => {
  const { prompt: promptText } = req.body;
  if (!promptText) return res.status(400).json({ error: 'Missing lesson prompt.' });

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.log('--- SERVER: NVIDIA API KEY MISSING FOR LESSON ---');
    return res.status(500).json({ error: 'API key missing.' });
  }

  const body = {
    model: NVIDIA_MODEL,
    messages: [
      { role: 'system', content: 'You are an expert physics teacher. Generate exactly 6 JSON lesson slides. Return only valid JSON arrays and objects, no markdown.' },
      { role: 'user', content: promptText }
    ],
    temperature: 0.2,
    max_tokens: 4096
  };

  try {
    console.log(`--- SERVER: GENERATING LESSON VIA NVIDIA ---`);
    const response = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    console.log(`--- SERVER: LESSON API STATUS: ${response.status} ---`);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    const text = data.choices[0].message.content;
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Lesson generation failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`SimuVerse server running at http://localhost:${PORT}`);
});
