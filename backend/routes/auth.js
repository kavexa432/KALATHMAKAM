const express = require('express');
const router = express.Router();
const { auth, db, admin } = require('../firebaseAdmin');
const { verifyDeveloper } = require('../middleware/auth');

// POST /api/auth/create-admin — Developer grants admin role to a user by email
router.post('/create-admin', verifyDeveloper, async (req, res) => {
  const { email, name, role = 'admin' } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Invalid role. Only admin or user allowed.' });
  }

  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({ email, displayName: name });
      } else {
        throw error;
      }
    }

    // Set custom claim server-side
    await auth.setCustomUserClaims(userRecord.uid, { role });

    const userDoc = {
      id: userRecord.uid,
      name: name || userRecord.displayName,
      email,
      role,
      status: 'Active',
      approved: role === 'admin',
      permissions: role === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
      updatedAt: new Date().toISOString()
    };
    
    const docRef = db.collection('users').doc(userRecord.uid);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) userDoc.createdAt = new Date().toISOString();
    await docRef.set(userDoc, { merge: true });

    await db.collection('auditLogs').doc(`log-${Date.now()}`).set({
      timestamp: new Date().toISOString(),
      user: req.user.email,
      userRole: 'developer',
      action: 'Set User Role',
      entity: 'Users',
      details: `Granted ${role} role to ${email} (uid: ${userRecord.uid})`
    });

    res.status(200).json({ success: true, message: `Role ${role} set for ${email}`, user: userDoc });
  } catch (error) {
    console.error('Error setting role:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// POST /api/auth/grant-role — Developer grants admin/user role by UID (used from User Management UI)
router.post('/grant-role', verifyDeveloper, async (req, res) => {
  const { targetUid, role } = req.body;

  if (!targetUid || !role) {
    return res.status(400).json({ error: 'targetUid and role are required.' });
  }

  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Invalid role. Only admin or user allowed.' });
  }

  // Prevent the developer from accidentally demoting themselves
  if (targetUid === process.env.DEVELOPER_UID) {
    return res.status(403).json({ error: 'Cannot modify the Developer account role.' });
  }

  try {
    const userRecord = await auth.getUser(targetUid);

    await auth.setCustomUserClaims(targetUid, { role });

    await db.collection('users').doc(targetUid).set({
      role,
      approved: role === 'admin',
      permissions: role === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await db.collection('auditLogs').doc(`log-${Date.now()}`).set({
      timestamp: new Date().toISOString(),
      user: req.user.email,
      userRole: 'developer',
      action: role === 'admin' ? 'Granted Admin Role' : 'Revoked Admin Role',
      entity: 'Users',
      details: `Set role=${role} for ${userRecord.email} (uid: ${targetUid})`
    });

    res.json({ success: true, message: `Role set to ${role} for ${userRecord.email}` });
  } catch (error) {
    console.error('Grant role error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
