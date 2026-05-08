const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DEFAULT_SYSTEM_PROMPT = 'You are an expert physics tutor. Answer questions clearly about mechanics, thermodynamics, waves, optics, electromagnetism, and modern physics. Use simple language with examples. When relevant, relate answers to simulations.';
const FALLBACK_MESSAGE = "NOVA can't connect to Gemini right now. Please try again in a moment.";
const MAX_HISTORY = 10;
const MAX_OUTPUT_TOKENS = 512;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function sanitizeMessages(messages = []) {
  return messages
    .filter(message => message && typeof message.role === 'string' && typeof message.content === 'string')
    .slice(-MAX_HISTORY)
    .map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));
}

function buildSystemMessage(systemPrompt, context = {}) {
  const basePrompt = typeof systemPrompt === 'string' && systemPrompt.trim()
    ? systemPrompt.trim()
    : DEFAULT_SYSTEM_PROMPT;

  const contextLines = [
    context.topicName ? `Current topic: ${context.topicName}` : '',
    context.subtopicName ? `Current subtopic: ${context.subtopicName}` : '',
    context.view ? `Current app view: ${context.view}` : '',
    context.hint ? context.hint : ''
  ].filter(Boolean).join('\n');

  return {
    role: 'user',
    parts: [{
      text: `SYSTEM INSTRUCTION: ${contextLines ? `${basePrompt}\n\nSimuVerse context:\n${contextLines}` : basePrompt}`
    }]
  };
}

function parseReply(data) {
  try {
    return data.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    return '';
  }
}

function getGeminiEndpoint(apiKey) {
  return apiKey.startsWith('AIza')
    ? `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`
    : GEMINI_URL;
}

// SIMULATED AI KNOWLEDGE BASE
function generateSimulatedResponse(messages, context) {
  const lastUserMsg = messages.reverse().find(m => m.author === 'user');
  if (!lastUserMsg) return "How can I help you with physics today?";

  const query = lastUserMsg.content[0].text.toLowerCase();

  // Knowledge Base Definitions
  const kb = [
    {
      keywords: ["young", "double slit", "interference", "fringe", "constructive", "destructive"],
      response: "In Young's Double Slit Experiment, light passes through two narrow, closely spaced slits, creating an interference pattern of bright and dark fringes on a screen. Bright fringes occur due to constructive interference (waves in phase), while dark fringes are due to destructive interference (waves out of phase). The fringe width depends on the wavelength, slit separation, and distance to the screen."
    },
    {
      keywords: ["single slit", "diffraction", "central maximum", "bending"],
      response: "Single Slit Diffraction happens when a wave passes through a narrow opening and spreads out. This forms a pattern with a wide, bright central maximum and narrower, dimmer secondary maxima on the sides. It demonstrates the wave nature of light bending around obstacles."
    },
    {
      keywords: ["projectile", "trajectory", "parabola", "launch angle", "range", "oblique projection"],
      response: "Projectile Motion is a form of motion where an object moves in a bilaterally symmetrical, parabolic path. The path (trajectory) depends on the initial velocity and launch angle. Gravity acts downwards, affecting only the vertical velocity component. The maximum range is typically achieved at a 45° launch angle."
    },
    {
      keywords: ["kinetic energy", "potential energy", "ke", "pe", "energy conservation"],
      response: "According to the Law of Conservation of Energy, the total mechanical energy (KE + PE) of a projectile remains constant if we ignore air resistance. As it rises, Kinetic Energy (KE) decreases while Potential Energy (PE) increases. At the peak, PE is maximum and vertical KE is zero."
    },
    {
      keywords: ["electric field", "field lines", "coulomb", "charge"],
      response: "An electric field is a region around a charged particle where a force would be exerted on other charged particles. Field lines point away from positive charges and towards negative charges. The strength of the field follows Coulomb's Law, decreasing with the square of the distance."
    },
    {
      keywords: ["potential", "equipotential", "voltage"],
      response: "Electric Potential (or voltage) is the potential energy per unit charge at a point in an electric field. Equipotential surfaces are regions where every point has the same potential. Moving a charge along an equipotential surface requires no work."
    },
    {
      keywords: ["formula", "equation"],
      response: "Here are some key formulas:\n- Projectile Range: R = (v² sin 2θ) / g\n- Double Slit Fringe Width: y = (λL) / d\n- Electric Field: E = kQ / r²\n- Kinetic Energy: KE = ½mv²"
    },
    {
      keywords: ["hello", "hi", "hey", "nova"],
      response: "Hello! I'm NOVA, your physics AI tutor. You can ask me about wave optics, projectile motion, electric fields, or any other physics concept!"
    },
    {
      keywords: ["explain this simulation", "how does this work", "what is this"],
      response: "Based on your current topic (" + (context.topicName || "Physics") + "), this simulation helps you visualize abstract concepts. Try adjusting the parameters like sliders or dragging the charges to see real-time changes in the physical system!"
    }
  ];

  // Search logic
  for (const entry of kb) {
    if (entry.keywords.some(kw => query.includes(kw))) {
      return entry.response;
    }
  }

  // General fallback for unrelated questions
  return "That's an interesting question! However, I specialize in physics topics like wave optics, projectile motion, and electric fields. Let me know if you'd like to explore one of those concepts!";
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed', fallback: FALLBACK_MESSAGE });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, { error: 'Invalid JSON body.', fallback: 'Please try again.' });
  }

  const messages = sanitizeMessages(payload.messages);
  if (!messages.length) {
    return json(400, { error: 'A user message is required.', fallback: 'Please type a physics question first.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('--- NOVA: API KEY MISSING, USING SIMULATED FALLBACK ---');
    const simulatedReply = generateSimulatedResponse(messages, payload.context || {});
    return json(200, { reply: simulatedReply });
  }

  const contents = [buildSystemMessage(payload.systemPrompt, payload.context), ...messages];

  const body = {
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      topP: 0.9,
      topK: 40
    }
  };

  try {
    const endpoint = getGeminiEndpoint(apiKey);
    console.log(`--- NOVA: SENDING REQUEST TO GEMINI (${GEMINI_MODEL}) ---`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey.startsWith('AIza') ? {} : { Authorization: `Bearer ${apiKey}` })
      },
      body: JSON.stringify(body)
    });

    console.log(`--- NOVA: GEMINI RESPONSE STATUS: ${response.status} ---`);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Gemini API error', response.status, data);
      // Fallback to simulated response
      const simulatedReply = generateSimulatedResponse(messages, payload.context || {});
      return json(200, { reply: simulatedReply });
    }

    const reply = parseReply(data);
    return json(200, { reply: reply || 'I could not generate a response. Please try again.' });
  } catch (error) {
    console.error('Chat function failure', error);
    // Fallback to simulated response
    const simulatedReply = generateSimulatedResponse(messages, payload.context || {});
    return json(200, { reply: simulatedReply });
  }
};
