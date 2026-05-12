// This service calls the Python RAG microservice running on port 5001.
// It sends the user's situation and gets back 3 similar example letters.
// These examples are injected into the prompt to guide the LLM.

const axios = require('axios');

const RAG_URL = 'http://localhost:5001';

async function retrieveSimilarExamples(query, situationType, limit = 3) {
  try {
    const response = await axios.post(`${RAG_URL}/search`, {
      query: query,
      situation_type: situationType,
      limit: limit
    }, {
      timeout: 10000
    });

    return {
      success: true,
      examples: response.data.results
    };
  } catch (error) {
    // If RAG service is down, we gracefully degrade — generate without examples
    console.warn('RAG service unavailable, proceeding without examples:', error.message);
    return {
      success: false,
      examples: [],
      degraded: true
    };
  }
}

module.exports = { retrieveSimilarExamples };
