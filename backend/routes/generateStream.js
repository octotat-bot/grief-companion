// This route streams each token chunk from Gemini to the browser using Server-Sent Events (SSE).

const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { retrieveSimilarExamples } = require('../services/ragService');
const { buildPrompt } = require('../services/promptBuilder');
const Draft = require('../models/Draft');
const mongoose = require('mongoose');

const ai = new GoogleGenAI({});
const MODEL = 'gemini-1.5-flash';

function validateInput(body) {
  const errors = [];
  const validSituations = ['condolence', 'apology', 'difficult_news', 'reconnection', 'eulogy'];
  const validRelationships = ['colleague', 'friend', 'close_friend', 'family', 'acquaintance', 'partner'];
  const validTones = ['formal', 'warm', 'brief', 'heartfelt'];
  if (!body.situation || !validSituations.includes(body.situation)) errors.push('invalid situation');
  if (!body.relationship || !validRelationships.includes(body.relationship)) errors.push('invalid relationship');
  if (!body.tone || !validTones.includes(body.tone)) errors.push('invalid tone');
  if (!body.context || body.context.trim().length < 10) errors.push('context too short');
  if (body.context && body.context.length > 1000) errors.push('context too long');
  return errors;
}

function cleanLLMOutput(text) {
  const preambles = [
    /^(here is|here's|sure,?|certainly,?|of course,?|i('ve| have) written|below is|i'd be happy to)[^:.\n]*[:.]\s*/i,
    /^\*\*[^*]+\*\*\n+/,
    /^---+\n/,
    /^#+ .+\n+/,
  ];
  let cleaned = text.trim();
  for (const pattern of preambles) cleaned = cleaned.replace(pattern, '').trim();
  return cleaned;
}

router.post('/', async (req, res) => {
  const errors = validateInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const { situation, relationship, tone, context, recipientName, senderName, additionalNotes, classifierUsed, classifierConfidence } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (eventData) => {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  };

  try {
    send({ type: 'status', message: 'Finding similar examples...' });
    const ragQuery = `${situation} ${relationship} ${tone} ${context.slice(0, 200)}`;
    const ragResult = await retrieveSimilarExamples(ragQuery, situation, 3);

    send({ type: 'status', message: 'Building prompt...' });
    const prompt = buildPrompt(
      { situation, relationship, tone, context, recipientName, senderName, additionalNotes },
      ragResult.examples
    );

    send({ type: 'status', message: 'Generating your draft...' });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: tone === 'heartfelt' ? 0.8 : tone === 'brief' ? 0.6 : 0.7,
        maxOutputTokens: tone === 'brief' ? 150 : 500,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      }
    });

    let fullText = '';

    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        send({ type: 'token', token: chunk.text });
      }
    }

    const cleanedText = cleanLLMOutput(fullText);

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Draft.create({
          formInput: {
            situation, relationship, tone, context,
            recipientName: recipientName || '',
            senderName: senderName || '',
            additionalNotes: additionalNotes || ''
          },
          draft: cleanedText,
          retrievedExamples: ragResult.examples,
          ragDegraded: ragResult.degraded || false,
          model: MODEL,
          isSaved: false,
          classifierUsed: classifierUsed || false,
          classifierConfidence: classifierConfidence || null
        });
        send({ type: 'saved', draftId: doc._id.toString() });
      } catch (err) {
        console.error('DB save error:', err.message);
      }
    }

    send({ type: 'done', draft: cleanedText, retrievedExamples: ragResult.examples, ragDegraded: ragResult.degraded || false });
    res.end();

  } catch (err) {
    console.error('Stream error:', err);
    send({ type: 'error', error: 'STREAM_FAILED', message: err.message });
    res.end();
  }
});

module.exports = router;
