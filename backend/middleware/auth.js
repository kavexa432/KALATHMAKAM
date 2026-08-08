const { auth } = require('../firebaseAdmin');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user has admin or developer role
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

const verifyDeveloper = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user has developer role OR is the designated developer email
    if (decodedToken.role === 'developer' || decodedToken.email === 'vaishnavil4433@gmail.com') {
      req.user = decodedToken;
      
      // If it's the designated developer email but they don't have the claim yet, set it
      if (decodedToken.role !== 'developer' && decodedToken.email === 'vaishnavil4433@gmail.com') {
        await auth.setCustomUserClaims(decodedToken.uid, { role: 'developer' });
      }
      
      return next();
    }
    
    return res.status(403).json({ error: 'Forbidden: Requires Developer role' });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { verifyAdmin, verifyDeveloper };
