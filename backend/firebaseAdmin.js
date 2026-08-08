const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');

const { getStorage } = require('firebase-admin/storage');

dotenv.config();

let app;

if (getApps().length === 0) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    };
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'kalathmakam-5783c.firebasestorage.app'
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);
const bucket = getStorage(app).bucket();

// Fake the old 'admin' object structure for existing code that uses admin.firestore.FieldValue
const admin = {
  firestore: {
    FieldValue
  },
  auth: () => auth
};

module.exports = { admin, db, auth, bucket };
