const express = require('express');
const { db, admin, auth } = require('../firebaseAdmin');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Calculate house points based on competition type and position.
 *  group / team  → 1st=20, 2nd=15, 3rd=10
 *  individual    → 1st=10, 2nd=7,  3rd=5
 */
function calcPoints(position, competitionType) {
  const pos = Number(position);
  if (competitionType === 'group' || competitionType === 'team') {
    if (pos === 1) return 20;
    if (pos === 2) return 15;
    if (pos === 3) return 10;
  } else {
    // individual (default)
    if (pos === 1) return 10;
    if (pos === 2) return 7;
    if (pos === 3) return 5;
  }
  return 0;
}

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
      const seenStudentClassComposite = new Set();

      for (const resItem of results) {
        if (!resItem.studentName || !resItem.studentName.trim()) {
          throw new Error(`Validation Error: Student name is required for position ${resItem.position}.`);
        }

        const normalizedHouse = (resItem.house || 'NONE').toUpperCase().trim();
        if (!validHouses.includes(normalizedHouse)) {
          throw new Error(`Validation Error: Invalid house "${resItem.house}" for ${resItem.studentName}. Valid houses: NOVA, VEGA, ORION, ASTRA, NONE.`);
        }

        // Composite student key: name + class to avoid false positives for same-named students in different classes
        const studentCompositeKey = `${resItem.studentName.toLowerCase().trim()}|${(resItem.studentClass || '').toLowerCase().trim()}`;
        if (seenStudentClassComposite.has(studentCompositeKey)) {
          throw new Error(`Validation Error: Duplicate student entry "${resItem.studentName} (${resItem.studentClass || 'Class'})" detected.`);
        }
        seenStudentClassComposite.add(studentCompositeKey);

        const posNum = Number(resItem.position);
        if ([1, 2, 3].includes(posNum)) {
          if (seenPositions.has(posNum)) {
            throw new Error(`Validation Error: Duplicate position ${posNum} detected.`);
          }
          seenPositions.add(posNum);
        }
      }

      // 3. Get competition type from event (determines 20/15/10 vs 10/7/5 points)
      const competitionType = eventData.competitionType || 'individual';

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

      // 5. Prepare enriched results with points based on competition type
      const enrichedResults = results.map(result => {
        const posNum = Number(result.position);
        const points = calcPoints(posNum, competitionType);
        return {
          position: posNum || result.position,
          studentName: result.studentName.trim(),
          studentClass: (result.studentClass || '').trim(),
          house: (result.house || 'NONE').toUpperCase().trim(),
          points
        };
      });

      // 6. Update Event Flags (Dynamic status engine calculates status = Completed when resultsPublished === true)
      transaction.update(eventRef, {
        resultsPublished: true,
        winnerUploaded: true,
        housePointsUpdated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Create Result Document with explicit published metadata
      const resultRef = db.collection('results').doc(eventId);
      const publishedBy = req.user?.email || 'admin';
      const publishedAt = admin.firestore.FieldValue.serverTimestamp();
      const sourceDraftId = req.body.draftId || null;

      transaction.set(resultRef, {
        eventId,
        competitionName: eventData.eventName || eventData.title || eventData.competitionName || 'Unknown Competition',
        category: eventData.category || 'Unknown Category',
        competitionType,
        houseWise: eventData.houseWise || false,
        results: enrichedResults,
        published: true,
        publishedBy,
        publishedAt,
        sourceDraftId
      });

      // 8. Transaction-Safe House Points Ledger & House Totals Update
      const housePointsToAdd = {};
      
      for (const r of enrichedResults) {
        if (r.house && r.house !== 'NONE' && r.house !== 'N/A' && r.points > 0) {
          housePointsToAdd[r.house] = (housePointsToAdd[r.house] || 0) + r.points;

          // Record individual transaction in housePointTransactions ledger
          const txnRef = db.collection('housePointTransactions').doc();
          transaction.set(txnRef, {
            id: txnRef.id,
            house: r.house,
            eventId,
            resultId: eventId,
            position: r.position,
            points: r.points,
            studentName: r.studentName,
            studentClass: r.studentClass,
            publishedBy,
            createdAt: publishedAt
          });
        }
      }

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
        user: publishedBy,
        userRole: 'admin',
        timestamp: publishedAt,
        sourceDraftId,
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
