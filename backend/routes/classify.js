// POST /api/classify
// Proxies classification requests to the Python RAG service.
// This keeps the frontend from calling Python directly.

const express = require('express');
const router = express.Router();
const axios = require('axios');

const RAG_URL = process.env.RAG_URL || 'http://localhost:5001';

router.post('/', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'text must be at least 5 characters' });
  }

  try {
    const response = await axios.post(`${RAG_URL}/classify`, { text: text.trim() }, { timeout: 10000 });
    return res.json({ success: true, ...response.data });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.json({ success: false, available: false, message: 'RAG service not running' });
    }
    return res.json({ success: false, available: false, message: err.message });
  }
});

module.exports = router;
