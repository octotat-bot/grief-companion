// This route streams each token chunk from Groq to the browser using Server-Sent Events (SSE).

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { retrieveSimilarExamples } = require('../services/ragService');
const { buildPrompt } = require('../services/promptBuilder');
const Draft = require('../models/Draft');
const mongoose = require('mongoose');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.1-8b-instant';

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

  if (!GROQ_API_KEY) {
    send({ type: 'error', error: 'NO_API_KEY', message: 'GROQ_API_KEY is missing' });
    return res.end();
  }

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

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: tone === 'heartfelt' ? 0.8 : tone === 'brief' ? 0.6 : 0.7,
        max_tokens: tone === 'brief' ? 150 : 500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    let fullText = '';
    let buffer = '';

    groqResponse.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep the last incomplete chunk in the buffer

      for (const line of lines) {
        if (!line.trim() || line.trim() === 'data: [DONE]') continue;
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            const token = parsed.choices[0]?.delta?.content || '';
            if (token) {
              fullText += token;
              send({ type: 'token', token: token });
            }
          } catch (parseErr) {
            console.warn('Stream parse error:', parseErr.message);
          }
        }
      }
    });

    groqResponse.data.on('end', async () => {
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
    });

    groqResponse.data.on('error', (err) => {
      send({ type: 'error', error: 'STREAM_ERROR', message: err.message });
      res.end();
    });

  } catch (err) {
    console.error('Stream error:', err);
    send({ type: 'error', error: 'STREAM_FAILED', message: err.message });
    res.end();
  }
});

module.exports = router;
