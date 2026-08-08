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
    const { eventName, category } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!eventName || !category) {
      return res.status(400).json({ error: 'eventName and category are required.' });
    }

    // Call Gemini Service
    const extractedData = await extractResultsFromImage(file, eventName, category);

    // Save to resultDrafts
    const draftId = `draft-${Date.now()}`;
    const draftData = {
      id: draftId,
      eventName,
      category,
      results: extractedData,
      status: 'Pending Review',
      createdBy: req.user.email,
      createdAt: new Date().toISOString()
    };
    
    // Using admin db
    const { db } = require('../firebaseAdmin');
    await db.collection('resultDrafts').doc(draftId).set(draftData);

    res.json({ draftId, ...draftData });
  } catch (error) {
    console.error('OCR Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process OCR.' });
  }
});

module.exports = router;
