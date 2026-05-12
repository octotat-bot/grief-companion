// POST /api/feedback
// Saves a user's thumbs up/down rating to the Draft document.
// Simple endpoint — score is 1 (positive) or -1 (negative).
// This data accumulates over time and can be used to:
//   - Identify which corpus examples produce good output
//   - Build a fine-tuning dataset for the LLM
//   - Track prompt engineering quality over time
// Explain this in interviews: "I built in feedback collection for future model improvement."

const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
  const { draftId, score, feedbackText } = req.body;

  if (!draftId) {
    return res.status(400).json({ success: false, message: 'draftId is required' });
  }
  if (score !== 1 && score !== -1) {
    return res.status(400).json({ success: false, message: 'score must be 1 (positive) or -1 (negative)' });
  }

  if (mongoose.connection.readyState !== 1) {
    // If DB is down, silently accept but don't crash — feedback is nice-to-have
    return res.json({ success: true, saved: false, message: 'Feedback received but not persisted (DB unavailable)' });
  }

  try {
    const draft = await Draft.findByIdAndUpdate(
      draftId,
      {
        feedbackScore: score,
        feedbackText: feedbackText?.trim() || ''
      },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    return res.json({ success: true, saved: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
