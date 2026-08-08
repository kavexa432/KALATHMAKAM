const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebaseAdmin');
const { verifyDeveloper } = require('../middleware/auth');

// Create or update a user as Admin
router.post('/create-admin', verifyDeveloper, async (req, res) => {
  const { email, name, role = 'admin' } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  if (role !== 'admin' && role !== 'developer' && role !== 'user') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // 1. Get user by email or create if they don't exist
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // We can't really create a Google Auth user securely from here easily without them logging in first,
        // but we can create an empty user record. 
        // It's better to just require them to have logged in once.
        // Wait, Firebase Admin CAN create a user, but it won't be linked to Google Auth unless specified.
        // Let's just create the user in Auth so we can set claims. When they login with Google, it will link if email matches.
        userRecord = await auth.createUser({
          email: email,
          displayName: name,
        });
      } else {
        throw error;
      }
    }

    // 2. Set Custom Claim
    await auth.setCustomUserClaims(userRecord.uid, { role: role });

    // 3. Write to users collection in Firestore
    const userDoc = {
      id: userRecord.uid,
      name: name || userRecord.displayName,
      email: email,
      role: role,
      status: 'Active',
      permissions: role === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
      updatedAt: new Date().toISOString()
    };
    
    // Add createdAt only if new
    const docRef = db.collection('users').doc(userRecord.uid);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      userDoc.createdAt = new Date().toISOString();
    }

    await docRef.set(userDoc, { merge: true });

    // 4. Write Audit Log
    const auditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: req.user.name || req.user.email,
      userRole: 'developer',
      action: 'Set User Role',
      entity: 'Users',
      details: `Granted ${role} role to ${email}`
    };
    await db.collection('auditLogs').doc(auditLog.id).set(auditLog);

    res.status(200).json({ 
      success: true, 
      message: `Successfully set role ${role} for ${email}`,
      user: userDoc
    });
    
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
