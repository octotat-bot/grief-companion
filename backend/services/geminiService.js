const { GoogleGenAI } = require('@google/genai');

// Initialize the client. It automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});
const MODEL = 'gemini-1.5-flash';

async function generateWithGemini(prompt, options = {}) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 500,
        // The user specifically requested safety settings overrides
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ]
      }
    });

    return {
      success: true,
      text: response.text.trim(),
      model: MODEL
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    let message = error.message;
    if (error.status === 401 || error.status === 403) {
      message = 'Invalid Gemini API Key or unauthorized access.';
    }
    
    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: message
    };
  }
}

module.exports = { generateWithGemini };
