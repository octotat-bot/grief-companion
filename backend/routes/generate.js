// This is the main API endpoint.
// POST /api/generate
// Receives user input, runs the full pipeline, returns the draft.

const express = require('express');
const router = express.Router();
const { generateWithOllama } = require('../services/ollamaService');
const { retrieveSimilarExamples } = require('../services/ragService');
const { buildPrompt } = require('../services/promptBuilder');

// Input validation helper
function validateInput(body) {
  const errors = [];
  
  if (!body.situation || !['condolence', 'apology', 'difficult_news', 'reconnection', 'eulogy'].includes(body.situation)) {
    errors.push('situation must be one of: condolence, apology, difficult_news, reconnection, eulogy');
  }
  
  if (!body.relationship || !['colleague', 'friend', 'close_friend', 'family', 'acquaintance', 'partner'].includes(body.relationship)) {
    errors.push('relationship must be one of: colleague, friend, close_friend, family, acquaintance, partner');
  }
  
  if (!body.tone || !['formal', 'warm', 'brief', 'heartfelt'].includes(body.tone)) {
    errors.push('tone must be one of: formal, warm, brief, heartfelt');
  }
  
  if (!body.context || body.context.trim().length < 10) {
    errors.push('context must be at least 10 characters — describe the situation');
  }
  
  if (body.context && body.context.length > 1000) {
    errors.push('context must be under 1000 characters');
  }

  return errors;
}

router.post('/', async (req, res) => {
  // Step 1: Validate input
  const errors = validateInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const { situation, relationship, tone, context, recipientName, senderName, additionalNotes } = req.body;

  // Step 2: Retrieve similar examples from RAG
  const ragQuery = `${situation} message for ${relationship} - ${context}`;
  const ragResult = await retrieveSimilarExamples(ragQuery, situation);

  // Step 3: Build the full prompt
  const prompt = buildPrompt(
    { situation, relationship, tone, context, recipientName, senderName, additionalNotes },
    ragResult.examples
  );

  // Step 4: Generate with Ollama
  const generationResult = await generateWithOllama(prompt, {
    temperature: tone === 'heartfelt' ? 0.8 : 0.65,
    maxTokens: tone === 'brief' ? 150 : 450
  });

  if (!generationResult.success) {
    return res.status(503).json({
      success: false,
      error: generationResult.error,
      message: generationResult.message
    });
  }

  // Step 5: Post-process the output
  // Remove any accidental preamble the LLM might have added
  let cleanedText = generationResult.text;
  const preamblePatterns = [
    /^(here is|here's|sure,|certainly,|of course,|i've written|below is)[^:]*:/i,
    /^(dear writing task|writing task|task):/i,
    /^\*\*[^*]+\*\*\n/  // Remove bold headers like **Message:**
  ];
  preamblePatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '').trim();
  });

  // Step 6: Return the result
  return res.json({
    success: true,
    draft: cleanedText,
    retrievedExamples: ragResult.examples,
    ragDegraded: ragResult.degraded || false,
    model: generationResult.model,
    metadata: {
      situation,
      relationship,
      tone,
      context,
      recipientName,
      senderName,
      generatedAt: new Date().toISOString()
    }
  });
});

module.exports = router;
