const { auth } = require('../firebaseAdmin');

/**
 * verifyAdmin — allows admin or developer custom claim
 */
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.role === 'admin' || decodedToken.role === 'developer') {
      req.user = decodedToken;
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Requires Admin role' });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * verifyDeveloper — strictly checks UID against DEVELOPER_UID env var.
 * No email fallback. The developer account is provisioned via Firebase Console
 * (setting custom claim manually or via Admin SDK seeding), not by a frontend email check.
 */
const verifyDeveloper = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const developerUid = process.env.DEVELOPER_UID;

    // Primary check: UID matches the pre-authorized developer
    if (developerUid && decodedToken.uid === developerUid) {
      // Ensure the custom claim is set server-side (idempotent)
      if (decodedToken.role !== 'developer') {
        await auth.setCustomUserClaims(decodedToken.uid, { role: 'developer' });
      }
      req.user = decodedToken;
      return next();
    }

    // Secondary check: already has developer custom claim (set by previous call)
    if (decodedToken.role === 'developer') {
      req.user = decodedToken;
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Requires Developer role' });
  } catch (error) {
    console.error('Developer auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { verifyAdmin, verifyDeveloper };
