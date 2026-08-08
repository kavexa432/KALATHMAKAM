const express = require('express');
const { db, admin, auth } = require('../firebaseAdmin');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_POINTS_MAP = {
  1: 10,
  2: 8,
  3: 6
};

// POST /api/publish
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { eventId, results } = req.body;

    if (!eventId || !results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'eventId and results array are required.' });
    }

    await db.runTransaction(async (transaction) => {
      // 1. Fetch Event Document
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists) {
        throw new Error(`Event ${eventId} does not exist.`);
      }

      const eventData = eventDoc.data();
      if (eventData.resultsPublished) {
        throw new Error(`Results for event ${eventId} are already published.`);
      }

      // 2. Fetch Point Configuration (if it exists)
      const settingsRef = db.collection('settings').doc('pointsConfig');
      const settingsDoc = await transaction.get(settingsRef);
      const pointsMap = settingsDoc.exists ? settingsDoc.data() : DEFAULT_POINTS_MAP;

      // 3. Prepare the enriched results with points
      const enrichedResults = results.map(result => {
        const points = pointsMap[result.position] || 0;
        return {
          ...result,
          points
        };
      });

      // 4. Update Event Status
      transaction.update(eventRef, {
        status: 'completed',
        resultsPublished: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 5. Create Result Document
      const resultRef = db.collection('results').doc(eventId);
      transaction.set(resultRef, {
        eventId,
        competitionName: eventData.title || eventData.competitionName || 'Unknown Competition',
        category: eventData.category || 'Unknown Category',
        results: enrichedResults,
        published: true,
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 6. Update House Points
      // Group points by house
      const housePointsToAdd = {};
      enrichedResults.forEach(r => {
        if (r.house) {
          housePointsToAdd[r.house] = (housePointsToAdd[r.house] || 0) + r.points;
        }
      });

      for (const [houseId, points] of Object.entries(housePointsToAdd)) {
        if (points > 0) {
          const houseRef = db.collection('houses').doc(houseId);
          // We use increment inside the transaction
          transaction.set(houseRef, {
            points: admin.firestore.FieldValue.increment(points)
          }, { merge: true });
        }
      }

      // 7. Create Activity Log
      const logRef = db.collection('auditLogs').doc();
      transaction.set(logRef, {
        type: 'RESULTS_PUBLISHED',
        eventId,
        competitionName: eventData.title || eventData.competitionName || eventData.eventName || 'Unknown Competition',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: `Results published for ${eventData.title || eventData.competitionName || eventData.eventName}`
      });

      // 8. Create Live Feed Announcement
      const topWinner = enrichedResults.find(w => w.position === 1);
      const feedRef = db.collection('liveFeed').doc();
      
      const feedContent = topWinner
        ? `🏆 ${eventData.eventName || 'Competition'} (${eventData.category || 'General'}) Results Published! 1st: ${topWinner.studentName} (${topWinner.house} House +${topWinner.points} pts)`
        : `🏆 ${eventData.eventName || 'Competition'} Results Published!`;

      transaction.set(feedRef, {
        festivalId: '2k26',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Note: preferably store a real timestamp
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: 'Result',
        priority: 'Important',
        content: feedContent,
        houseId: topWinner ? topWinner.house : null,
        points: topWinner ? topWinner.points : 0,
        read: false
      });
      // 9. Delete Draft if provided
      if (req.body.draftId) {
        const draftRef = db.collection('resultDrafts').doc(req.body.draftId);
        transaction.delete(draftRef);
      }
    });

    res.json({ success: true, message: 'Results published successfully.' });
  } catch (error) {
    console.error('Publish Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to publish results.' });
  }
});

module.exports = router;
