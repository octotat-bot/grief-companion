// GET /api/analytics
// Runs multiple MongoDB aggregation pipelines in parallel and returns
// all dashboard data in a single response.
//
// MongoDB aggregation pipelines work like a series of transformations:
// collection -> [$match] -> [$group] -> [$sort] -> [$project] -> result array
//
// $match  = filter documents (like SQL WHERE)
// $group  = aggregate by a field (like SQL GROUP BY)
// $sort   = order results
// $project = shape the output fields
// $dateToString = format a Date field as a string for grouping by day/week

const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const mongoose = require('mongoose');

// Helper: return last N days as date range filter
function lastNDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'DB_UNAVAILABLE',
      message: 'MongoDB is not connected.'
    });
  }

  const range = parseInt(req.query.days) || 30; // Default: last 30 days
  const since = lastNDays(range);

  try {
    // Run all aggregation pipelines in parallel for speed
    const [
      totalCount,
      savedCount,
      situationDist,
      toneDist,
      generationsOverTime,
      avgDraftLength,
      ragDegradedCount,
      classifierUsage,
      topRelationships,
      recentDrafts,
      feedbackStats
    ] = await Promise.all([

      // 1. Total generations (all time)
      Draft.countDocuments({ isDeleted: false }),

      // 2. Total saved drafts
      Draft.countDocuments({ isSaved: true, isDeleted: false }),

      // 3. Situation type distribution (last N days)
      // Groups all drafts by their situation field and counts each group
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since } } },
        { $group: { _id: '$formInput.situation', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, situation: '$_id', count: 1 } }
      ]),

      // 4. Tone distribution (last N days)
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since } } },
        { $group: { _id: '$formInput.tone', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, tone: '$_id', count: 1 } }
      ]),

      // 5. Generations per day (last N days) — for the line chart
      // $dateToString converts a Date to "YYYY-MM-DD" string so we can group by day
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            saved: { $sum: { $cond: ['$isSaved', 1, 0] } }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1, saved: 1 } }
      ]),

      // 6. Average draft length in words
      // $strLenCP gives character length; we divide by 5 to approximate word count
      // A more accurate way: split on spaces — but MongoDB doesn't have a split aggregator
      // so character-length / 5 is a good enough estimate for a dashboard
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since }, draft: { $exists: true } } },
        {
          $group: {
            _id: '$formInput.situation',
            avgChars: { $avg: { $strLenCP: '$draft' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { avgChars: -1 } },
        {
          $project: {
            _id: 0,
            situation: '$_id',
            avgWords: { $round: [{ $divide: ['$avgChars', 5] }, 0] },
            count: 1
          }
        }
      ]),

      // 7. RAG degradation rate — what % of generations had no RAG examples
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            degraded: { $sum: { $cond: ['$ragDegraded', 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            degraded: 1,
            rate: {
              $round: [
                { $multiply: [{ $divide: ['$degraded', '$total'] }, 100] },
                1
              ]
            }
          }
        }
      ]),

      // 8. Classifier usage — how many drafts had their situation auto-detected
      // We track this via a field we'll add to the schema below
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since } } },
        {
          $group: {
            _id: '$classifierUsed',
            count: { $sum: 1 }
          }
        },
        { $project: { _id: 0, classifierUsed: '$_id', count: 1 } }
      ]),

      // 9. Top relationship types
      Draft.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: since } } },
        { $group: { _id: '$formInput.relationship', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $project: { _id: 0, relationship: '$_id', count: 1 } }
      ]),

      // 10. 5 most recent drafts for the "recent activity" feed
      Draft.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('formInput.situation formInput.relationship formInput.tone isSaved ragDegraded createdAt draft')
        .lean(),

      // 11. Feedback statistics
      Draft.aggregate([
        { $match: { isDeleted: false, feedbackScore: { $ne: null } } },
        {
          $group: {
            _id: null,
            totalRated: { $sum: 1 },
            positive: { $sum: { $cond: [{ $eq: ['$feedbackScore', 1] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $eq: ['$feedbackScore', -1] }, 1, 0] } },
            avgRefinements: { $avg: '$refinementCount' }
          }
        },
        {
          $project: {
            _id: 0,
            totalRated: 1,
            positive: 1,
            negative: 1,
            positiveRate: {
              $round: [{ $multiply: [{ $divide: ['$positive', '$totalRated'] }, 100] }, 1]
            },
            avgRefinements: { $round: ['$avgRefinements', 1] }
          }
        }
      ])
    ]);

    // Shape the response
    res.json({
      success: true,
      range,
      summary: {
        totalGenerations: totalCount,
        totalSaved: savedCount,
        saveRate: totalCount > 0 ? Math.round((savedCount / totalCount) * 100) : 0,
        ragDegradedRate: ragDegradedCount[0]?.rate || 0
      },
      charts: {
        situationDist,
        toneDist,
        generationsOverTime,
        avgDraftLength,
        topRelationships
      },
      feedback: feedbackStats[0] || { totalRated: 0, positive: 0, negative: 0, positiveRate: 0, avgRefinements: 0 },
      classifierUsage,
      recentDrafts: recentDrafts.map(d => ({
        id: d._id,
        situation: d.formInput?.situation,
        relationship: d.formInput?.relationship,
        tone: d.formInput?.tone,
        isSaved: d.isSaved,
        ragDegraded: d.ragDegraded,
        createdAt: d.createdAt,
        preview: d.draft?.slice(0, 80) + '...'
      }))
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
