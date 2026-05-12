const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All history routes protected

// GET /api/history - Get all saved drafts
router.get('/', async (req, res, next) => {
  try {
    const drafts = await Draft.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: drafts });
  } catch (error) {
    next(error);
  }
});

// POST /api/history - Save a new draft
router.post('/', async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const newDraft = await Draft.create(req.body);
    res.status(201).json({ success: true, data: newDraft });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/history/:id - Delete a draft
router.delete('/:id', async (req, res, next) => {
  try {
    await Draft.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Draft deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
