const express = require('express');
const router = express.Router();

// Minimal in-memory store for the current session's form state.
// In a real app, this should be tied to a specific user/session in DB.
let currentFormState = null;

// GET /api/session
router.get('/', (req, res) => {
  res.json({ success: true, formState: currentFormState });
});

// PUT /api/session
router.put('/', (req, res) => {
  currentFormState = req.body.formState;
  res.json({ success: true });
});

module.exports = router;
