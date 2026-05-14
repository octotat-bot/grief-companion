// POST /api/generate/ab
// Fires two parallel generation requests:
// One with the user's chosen tone, one with an alternate tone.
// Uses Promise.all so both run concurrently — total time = max(time_a, time_b), not sum.

const express = require('express');
const router = express.Router();
const { generateWithGemini } = require('../services/geminiService');
const { retrieveSimilarExamples } = require('../services/ragService');
const { buildPrompt } = require('../services/promptBuilder');
const Draft = require('../models/Draft');
const { getConnectionStatus } = require('../config/db'); // fixed import path

const ALTERNATE_TONE = {
  formal: 'warm',
  warm: 'formal',
  brief: 'heartfelt',
  heartfelt: 'brief'
};

function validateInput(body) {
  const errors = [];
  const validSituations = ['condolence', 'apology', 'difficult_news', 'reconnection', 'eulogy'];
  const validRelationships = ['colleague', 'friend', 'close_friend', 'family', 'acquaintance', 'partner'];
  const validTones = ['formal', 'warm', 'brief', 'heartfelt'];
  if (!body.situation || !validSituations.includes(body.situation)) errors.push('invalid situation');
  if (!body.relationship || !validRelationships.includes(body.relationship)) errors.push('invalid relationship');
  if (!body.tone || !validTones.includes(body.tone)) errors.push('invalid tone');
  if (!body.context || body.context.trim().length < 10) errors.push('context too short');
  return errors;
}

function cleanLLMOutput(text) {
  const preambles = [
    /^(here is|here's|sure,?|certainly,?|of course,?|i('ve| have) written|below is)[^:.\n]*[:.]\s*/i,
    /^\*\*[^*]+\*\*\n+/,
    /^---+\n/,
    /^#+ .+\n+/,
  ];
  let cleaned = text.trim();
  for (const p of preambles) cleaned = cleaned.replace(p, '').trim();
  return cleaned;
}

router.post('/', async (req, res) => {
  const errors = validateInput(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });

  const { situation, relationship, tone, context, recipientName, senderName, additionalNotes } = req.body;
  const alternateTone = ALTERNATE_TONE[tone] || 'warm';

  try {
    const ragQuery = `${situation} ${relationship} ${context.slice(0, 200)}`;
    const ragResult = await retrieveSimilarExamples(ragQuery, situation, 3);

    const promptA = buildPrompt(
      { situation, relationship, tone, context, recipientName, senderName, additionalNotes },
      ragResult.examples
    );
    const promptB = buildPrompt(
      { situation, relationship, tone: alternateTone, context, recipientName, senderName, additionalNotes },
      ragResult.examples
    );

    const [resultA, resultB] = await Promise.all([
      generateWithGemini(promptA, {
        temperature: tone === 'heartfelt' ? 0.8 : tone === 'brief' ? 0.6 : 0.7,
        maxTokens: tone === 'brief' ? 120 : 480
      }),
      generateWithGemini(promptB, {
        temperature: alternateTone === 'heartfelt' ? 0.8 : alternateTone === 'brief' ? 0.6 : 0.7,
        maxTokens: alternateTone === 'brief' ? 120 : 480
      })
    ]);

    if (!resultA.success && !resultB.success) {
      return res.status(503).json({
        success: false,
        error: resultA.error,
        message: resultA.message
      });
    }

    const draftA = resultA.success ? cleanLLMOutput(resultA.text) : null;
    const draftB = resultB.success ? cleanLLMOutput(resultB.text) : null;

    let draftIdA = null, draftIdB = null;
    
    return res.json({
      success: true,
      variantA: {
        draft: draftA,
        tone: tone,
        draftId: draftIdA,
        failed: !resultA.success
      },
      variantB: {
        draft: draftB,
        tone: alternateTone,
        draftId: draftIdB,
        failed: !resultB.success
      },
      retrievedExamples: ragResult.examples,
      ragDegraded: ragResult.degraded || false,
      metadata: { situation, relationship, generatedAt: new Date().toISOString() }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'GENERATION_FAILED', message: err.message });
  }
});

module.exports = router;
