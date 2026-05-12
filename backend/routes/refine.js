// POST /api/refine
// Takes an existing draft + user critique + original form input
// and generates a refined version using a second LLM call.
//
// The refinement prompt is a multi-turn conversation structure:
// "Here is a draft I wrote. The user says it has this problem. Rewrite it fixing that problem."
// This is exactly the multi-turn context management taught in Lecture 15.

const express = require('express');
const router = express.Router();
const { generateWithOllama } = require('../services/ollamaService');
const Draft = require('../models/Draft');
const mongoose = require('mongoose');

// Maximum times a user can refine a single draft
const MAX_REFINEMENTS = 3;

function buildRefinementPrompt(originalDraft, critique, formInput) {
  const { situation, relationship, tone, recipientName } = formInput;

  const toneReminders = {
    formal: 'Maintain formal, professional language throughout.',
    warm: 'Keep the warm, personal tone throughout.',
    brief: 'Keep it concise — 2 to 4 sentences only.',
    heartfelt: 'Keep the emotional depth and vulnerability.'
  };

  return `You are a compassionate writing assistant refining a draft message.

ORIGINAL DRAFT:
"${originalDraft}"

CONTEXT:
- Situation: ${situation?.replace('_', ' ')}
- Relationship: ${relationship}
- Tone requested: ${tone}
${recipientName ? `- Recipient: ${recipientName}` : ''}

USER'S CRITIQUE:
"${critique}"

YOUR TASK:
Rewrite the message to address the critique above. Fix exactly what the user pointed out.
Do not change things they did not mention.
${toneReminders[tone] || ''}

ABSOLUTE RULES:
1. Output ONLY the refined message. No preamble. Start directly with the message.
2. Do not explain what you changed. Just write the improved message.
3. Do not use placeholder text like [name].
4. The message should still sound like a real human wrote it.
5. If the critique is to make it longer, add meaningful content — not filler.
6. If the critique is to make it shorter, cut ruthlessly while keeping the core feeling.

Write the refined message now:`;
}

router.post('/', async (req, res) => {
  const { draftId, currentDraft, critique, formInput } = req.body;

  // Validation
  if (!currentDraft || typeof currentDraft !== 'string' || currentDraft.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'currentDraft is required and must be at least 10 characters' });
  }
  if (!critique || typeof critique !== 'string' || critique.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'critique is required and must be at least 3 characters' });
  }
  if (critique.length > 500) {
    return res.status(400).json({ success: false, message: 'critique must be under 500 characters' });
  }
  if (!formInput || !formInput.situation || !formInput.relationship || !formInput.tone) {
    return res.status(400).json({ success: false, message: 'formInput with situation, relationship, and tone is required' });
  }

  // Check refinement limit
  if (draftId && mongoose.connection.readyState === 1) {
    try {
      const existingDraft = await Draft.findById(draftId);
      if (existingDraft && existingDraft.refinementCount >= MAX_REFINEMENTS) {
        return res.status(429).json({
          success: false,
          error: 'REFINEMENT_LIMIT',
          message: `Maximum ${MAX_REFINEMENTS} refinements per draft. Start a new draft for more changes.`
        });
      }
    } catch (err) {
      console.warn('Could not check refinement count:', err.message);
      // Continue anyway — limit check is best effort
    }
  }

  // Build the refinement prompt
  const prompt = buildRefinementPrompt(
    currentDraft.trim(),
    critique.trim(),
    formInput
  );

  // Generate the refined draft
  const genResult = await generateWithOllama(prompt, {
    temperature: 0.65, // Slightly lower temperature for refinements — we want targeted changes
    maxTokens: formInput.tone === 'brief' ? 150 : 500
  });

  if (!genResult.success) {
    return res.status(503).json({
      success: false,
      error: genResult.error,
      message: genResult.message
    });
  }

  // Clean preambles
  let refined = genResult.text.trim();
  const preambles = [
    /^(here is|here's|sure,?|certainly,?|of course,?|i've revised|the refined|refined version)[^:.\n]*[:.]\s*/i,
    /^\*\*[^*]+\*\*\n+/,
  ];
  for (const p of preambles) refined = refined.replace(p, '').trim();

  // Update MongoDB document
  if (draftId && mongoose.connection.readyState === 1) {
    try {
      await Draft.findByIdAndUpdate(draftId, {
        $set: { refinedDraft: refined, feedbackText: critique },
        $inc: { refinementCount: 1 }
      });
    } catch (err) {
      console.error('Failed to save refinement to MongoDB:', err.message);
      // Continue — user still gets their refined draft
    }
  }

  return res.json({
    success: true,
    refinedDraft: refined,
    critique: critique.trim()
  });
});

module.exports = router;
