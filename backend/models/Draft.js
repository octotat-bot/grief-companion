const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  formInput: {
    situation: { type: String },
    relationship: { type: String },
    tone: { type: String },
    context: { type: String },
    recipientName: { type: String },
    senderName: { type: String },
    additionalNotes: { type: String }
  },
  draft: { type: String },
  retrievedExamples: { type: Array, default: [] },
  ragDegraded: { type: Boolean, default: false },
  model: { type: String },
  isSaved: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  userNote: { type: String, default: '' },
  classifierUsed: { type: Boolean, default: false },
  classifierConfidence: { type: Number, default: null },
  feedbackScore: { type: Number, default: null },
  feedbackText: { type: String, default: '' },
  refinedDraft: { type: String, default: null },
  refinementCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

draftSchema.index({ 'formInput.situation': 1, createdAt: -1 });
draftSchema.index({ 'formInput.tone': 1 });
draftSchema.index({ ragDegraded: 1 });

module.exports = mongoose.model('Draft', draftSchema);
