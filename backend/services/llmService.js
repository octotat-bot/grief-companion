const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.1-8b-instant';

async function generateWithOllama(prompt, options = {}) {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'NO_API_KEY', message: 'GROQ_API_KEY not set in .env' };
  }
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    const text = response.data.choices[0]?.message?.content?.trim();
    if (!text) return { success: false, error: 'EMPTY_RESPONSE', message: 'Empty response from Groq' };
    return { success: true, text, model: MODEL };
  } catch (error) {
    if (error.response?.status === 401) return { success: false, error: 'INVALID_KEY', message: 'Invalid Groq API key' };
    if (error.response?.status === 429) return { success: false, error: 'RATE_LIMIT', message: 'Rate limit hit — wait a moment' };
    return { success: false, error: 'GENERATION_FAILED', message: error.message };
  }
}

async function isOllamaRunning() { return !!GROQ_API_KEY; }

module.exports = { generateWithOllama, isOllamaRunning };
