// Basic corpus route

const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/search', async (req, res) => {
    // Basic route logic, real logic in generate.js
    res.json({ success: true, message: "Use POST /api/generate for search via RAG" });
});

module.exports = router;
