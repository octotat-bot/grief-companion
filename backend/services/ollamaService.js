// This service calls the Ollama local AI server.
// Ollama runs at http://localhost:11434 on the user's computer.
// We send a prompt and get back a generated text response.

const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2:3b'; // Change to 'phi3:mini' if llama3.2 is too slow

async function generateWithOllama(prompt, options = {}) {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: prompt,
      stream: false, // We want the full response at once, not streamed
      options: {
        temperature: options.temperature || 0.7, // 0 = very predictable, 1 = very creative
        top_p: 0.9,
        max_tokens: options.maxTokens || 500,
        stop: ['###', '---'] // Stop generating at these tokens
      }
    }, {
      timeout: 60000 // 60 second timeout — local models can be slow
    });

    return {
      success: true,
      text: response.data.response.trim(),
      model: MODEL
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'OLLAMA_NOT_RUNNING',
        message: 'Ollama is not running. Please start it with: ollama serve'
      };
    }
    let message = error.message;
    if (error.response && error.response.status === 404) {
      message = `Model '${MODEL}' not found. Please open a new terminal and run: ollama pull ${MODEL}`;
    } else if (error.response && error.response.data && error.response.data.error) {
      message = error.response.data.error;
    }
    
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: message
    };
  }
}

module.exports = { generateWithOllama };
