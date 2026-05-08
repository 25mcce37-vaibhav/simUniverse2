const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_OUTPUT_TOKENS = 1200;
const FALLBACK_MESSAGE = 'Lesson generation failed. Please try again later.';

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

function getGeminiEndpoint(apiKey) {
  return apiKey.startsWith('AIza')
    ? `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`
    : GEMINI_URL;
}

function parseResponse(data) {
  try {
    return data.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    return '';
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed', fallback: FALLBACK_MESSAGE });

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log('--- LESSON: API KEY MISSING ---');
    return json(500, { error: 'Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.', fallback: FALLBACK_MESSAGE });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, { error: 'Invalid JSON body.', fallback: FALLBACK_MESSAGE });
  }

  const promptText = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
  if (!promptText) {
    return json(400, { error: 'Missing lesson prompt.', fallback: FALLBACK_MESSAGE });
  }

  const contents = [
    {
      role: 'user',
      parts: [{ text: 'SYSTEM INSTRUCTION: You are an expert physics teacher. Generate exactly 6 JSON lesson slides in response to the user prompt. Return only valid JSON arrays and objects, no markdown or code fences.' }]
    },
    {
      role: 'user',
      parts: [{ text: promptText }]
    }
  ];

  try {
    const endpoint = getGeminiEndpoint(apiKey);
    const body = {
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        topP: 0.95,
        topK: 40
      }
    };

    console.log(`--- LESSON: SENDING REQUEST TO GEMINI (${GEMINI_MODEL}) ---`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey.startsWith('AIza') ? {} : { Authorization: `Bearer ${apiKey}` })
      },
      body: JSON.stringify(body)
    });
    console.log(`--- LESSON: GEMINI RESPONSE STATUS: ${response.status} ---`);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Gemini lesson API error', response.status, data);
      return json(response.status, { error: 'Gemini lesson API request failed.', fallback: FALLBACK_MESSAGE });
    }

    return json(200, { text: parseResponse(data) });
  } catch (error) {
    console.error('Lesson function failure', error);
    return json(502, { error: 'Unable to reach Gemini.', fallback: FALLBACK_MESSAGE });
  }
};
