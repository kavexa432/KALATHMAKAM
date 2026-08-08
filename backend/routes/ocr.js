const express = require('express');
const multer = require('multer');
const { extractResultsFromImage } = require('../services/gemini');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage, limiting size to 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max size
  fileFilter: (req, file, cb) => {
    // Accept images and pdfs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// POST /api/ocr
router.post('/', verifyAdmin, upload.single('resultSheet'), async (req, res) => {
  try {
    const file = req.file;
    const { eventId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required.' });
    }

    const { db, bucket } = require('../firebaseAdmin');

    // Fetch trusted event details directly from Firestore
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: `Event ${eventId} not found.` });
    }

    const eventData = eventDoc.data();
    const eventName = eventData.eventName || eventData.title || eventData.name || 'Competition';
    const category = eventData.category || 'General';

    // Call Gemini Service with trusted event context
    const extractedData = await extractResultsFromImage(file, eventName, category);

    // Save uploaded file to Firebase Storage (private bucket path)
    const draftId = `draft-${Date.now()}`;
    const storagePath = `resultSheets/2026/${eventId}/${draftId}.jpg`;
    let tempSignedUrl = '';

    try {
      if (bucket) {
        const fileUpload = bucket.file(storagePath);
        await fileUpload.save(file.buffer, {
          contentType: file.mimetype,
          metadata: {
            metadata: {
              eventId,
              uploadedBy: req.user?.email || 'admin'
            }
          }
        });
        // Short-lived signed URL (2 hours) for active admin review session
        const [url] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
        });
        tempSignedUrl = url;
      }
    } catch (storageErr) {
      console.warn('Storage upload notice:', storageErr.message);
    }

    const draftData = {
      id: draftId,
      eventId,
      eventName,
      category,
      date: eventData.date || new Date().toISOString().split('T')[0],
      sourceImagePath: storagePath,
      ocrStatus: 'review',
      version: 1,
      results: extractedData.results || [],
      warnings: extractedData.warnings || [],
      status: 'Pending Review',
      createdBy: req.user?.email || 'admin',
      createdAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin',
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('resultDrafts').doc(draftId).set(draftData);

    res.json({ draftId, ...draftData, sourceImageUrl: tempSignedUrl || undefined });
  } catch (error) {
    console.error('OCR Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process OCR.' });
  }
});

module.exports = router;
