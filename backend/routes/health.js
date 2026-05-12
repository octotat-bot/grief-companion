// Health check endpoint — tells the frontend which services are running

const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const status = {
    backend: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'ok' : 'down',
    ollama: 'unknown',
    rag: 'unknown',
    timestamp: new Date().toISOString()
  };

  // Check Ollama
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 3000 });
    status.ollama = 'ok';
  } catch {
    status.ollama = 'down';
  }

  // Check RAG service
  try {
    await axios.get('http://localhost:5001/health', { timeout: 3000 });
    status.rag = 'ok';
  } catch {
    status.rag = 'down';
  }

  const allOk = status.ollama === 'ok'; // RAG is optional — app still works without it
  res.status(allOk ? 200 : 206).json(status);
});

module.exports = router;
