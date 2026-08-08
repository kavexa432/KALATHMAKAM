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
        throw new Error(`Idempotency Block: Results for event "${eventData.eventName || eventId}" are already published.`);
      }

      // 2. Pre-publish Validation
      const validHouses = ['NOVA', 'VEGA', 'ORION', 'ASTRA', 'NONE', 'N/A'];
      const seenPositions = new Set();
      const seenStudents = new Set();

      for (const resItem of results) {
        if (!resItem.studentName || !resItem.studentName.trim()) {
          throw new Error(`Validation Error: Student name is required for position ${resItem.position}.`);
        }

        const normalizedHouse = (resItem.house || 'NONE').toUpperCase().trim();
        if (!validHouses.includes(normalizedHouse)) {
          throw new Error(`Validation Error: Invalid house "${resItem.house}" for ${resItem.studentName}. Valid houses: NOVA, VEGA, ORION, ASTRA, NONE.`);
        }

        const studentKey = resItem.studentName.toLowerCase().trim();
        if (seenStudents.has(studentKey)) {
          throw new Error(`Validation Error: Duplicate student name "${resItem.studentName}" detected in placements.`);
        }
        seenStudents.add(studentKey);

        const posNum = Number(resItem.position);
        if ([1, 2, 3].includes(posNum)) {
          if (seenPositions.has(posNum)) {
            throw new Error(`Validation Error: Duplicate position ${posNum} detected.`);
          }
          seenPositions.add(posNum);
        }
      }

      // 3. Fetch Point Configuration (if it exists)
      const settingsRef = db.collection('settings').doc('pointsConfig');
      const settingsDoc = await transaction.get(settingsRef);
      const pointsMap = settingsDoc.exists ? settingsDoc.data() : DEFAULT_POINTS_MAP;

      // 4. Fetch Draft details if provided for audit logging
      let draftData = null;
      if (req.body.draftId) {
        const draftRef = db.collection('resultDrafts').doc(req.body.draftId);
        const draftDoc = await transaction.get(draftRef);
        if (draftDoc.exists) {
          draftData = draftDoc.data();
          transaction.delete(draftRef);
        }
      }

      // 5. Prepare enriched results with points
      const enrichedResults = results.map(result => {
        const posNum = Number(result.position);
        const points = pointsMap[posNum] || (posNum === 1 ? 10 : posNum === 2 ? 8 : posNum === 3 ? 6 : 0);
        return {
          position: posNum || result.position,
          studentName: result.studentName.trim(),
          studentClass: (result.studentClass || '').trim(),
          house: (result.house || 'NONE').toUpperCase().trim(),
          points
        };
      });

      // 6. Update Event Status
      transaction.update(eventRef, {
        status: 'Completed',
        resultsPublished: true,
        winnerUploaded: true,
        housePointsUpdated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Create Result Document
      const resultRef = db.collection('results').doc(eventId);
      transaction.set(resultRef, {
        eventId,
        competitionName: eventData.eventName || eventData.title || eventData.competitionName || 'Unknown Competition',
        category: eventData.category || 'Unknown Category',
        results: enrichedResults,
        published: true,
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 8. Update House Points
      const housePointsToAdd = {};
      enrichedResults.forEach(r => {
        if (r.house && r.house !== 'NONE' && r.house !== 'N/A') {
          housePointsToAdd[r.house] = (housePointsToAdd[r.house] || 0) + r.points;
        }
      });

      for (const [houseId, points] of Object.entries(housePointsToAdd)) {
        if (points > 0) {
          const houseRef = db.collection('houses').doc(houseId);
          transaction.set(houseRef, {
            points: admin.firestore.FieldValue.increment(points)
          }, { merge: true });
        }
      }

      // 9. Create Activity Audit Log
      const logRef = db.collection('auditLogs').doc();
      transaction.set(logRef, {
        type: 'RESULTS_PUBLISHED',
        action: 'RESULT_PUBLISHED',
        eventId,
        competitionName: eventData.eventName || eventData.title || eventData.competitionName || 'Unknown Competition',
        category: eventData.category || 'General',
        user: req.user?.email || 'Admin',
        userRole: 'admin',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: `Results published for ${eventData.eventName || eventData.title || 'Competition'}.`,
        editedFields: draftData ? draftData.editedFields || [] : []
      });

      // 10. Create Live Feed Announcement
      const topWinner = enrichedResults.find(w => w.position === 1);
      const feedRef = db.collection('liveFeed').doc();
      
      const feedContent = topWinner
        ? `🏆 ${eventData.eventName || 'Competition'} (${eventData.category || 'General'}) Results Published! 1st: ${topWinner.studentName} (${topWinner.house} House +${topWinner.points} pts)`
        : `🏆 ${eventData.eventName || 'Competition'} Results Published!`;

      transaction.set(feedRef, {
        festivalId: '2k26',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: 'Result',
        priority: 'Important',
        content: feedContent,
        houseId: topWinner ? topWinner.house : null,
        points: topWinner ? topWinner.points : 0,
        read: false
      });
    });

    res.json({ success: true, message: 'Results published successfully.' });
  } catch (error) {
    console.error('Publish Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to publish results.' });
  }
});

module.exports = router;
