// This is a new Express route: POST /api/generate/stream
// It does everything generate.js does BUT instead of waiting for the full response,
// it streams each token chunk from Ollama to the browser using Server-Sent Events (SSE).

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { retrieveSimilarExamples } = require('../services/ragService');
const { buildPrompt } = require('../services/promptBuilder');
const Draft = require('../models/Draft');
const mongoose = require('mongoose');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

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

    const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: prompt,
      stream: true,
      options: {
        temperature: tone === 'heartfelt' ? 0.8 : tone === 'brief' ? 0.6 : 0.7,
        num_predict: tone === 'brief' ? 120 : 480,
        stop: ['###', '---', '\n\n\n']
      }
    }, {
      responseType: 'stream',
      timeout: 120000
    });

    let fullText = '';
    let buffer = '';

    ollamaResponse.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);

          if (parsed.response) {
            fullText += parsed.response;
            send({ type: 'token', token: parsed.response });
          }

          if (parsed.done) {
            const cleanedText = cleanLLMOutput(fullText);

            if (mongoose.connection.readyState === 1) {
              Draft.create({
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
              }).then(doc => {
                send({ type: 'saved', draftId: doc._id.toString() });
                send({ type: 'done', draft: cleanedText, retrievedExamples: ragResult.examples, ragDegraded: ragResult.degraded || false });
                res.end();
              }).catch(err => {
                console.error('DB save error:', err.message);
                send({ type: 'done', draft: cleanedText, retrievedExamples: ragResult.examples, ragDegraded: ragResult.degraded || false });
                res.end();
              });
            } else {
              send({ type: 'done', draft: cleanedText, retrievedExamples: ragResult.examples, ragDegraded: ragResult.degraded || false });
              res.end();
            }
          }
        } catch (parseErr) {
          console.warn('Stream parse error:', parseErr.message);
        }
      }
    });

    ollamaResponse.data.on('error', (err) => {
      send({ type: 'error', error: 'STREAM_ERROR', message: err.message });
      res.end();
    });

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      send({ type: 'error', error: 'OLLAMA_NOT_RUNNING', message: 'Ollama is not running. Run: ollama serve' });
    } else if (err.response?.status === 404) {
      send({ type: 'error', error: 'MODEL_NOT_FOUND', message: `Run: ollama pull ${MODEL}` });
    } else {
      send({ type: 'error', error: 'STREAM_FAILED', message: err.message });
    }
    res.end();
  }
});

module.exports = router;
