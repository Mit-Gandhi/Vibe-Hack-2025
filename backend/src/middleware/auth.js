const { verifyToken } = require('../utils/jwt');

// Protect routes by verifying Bearer token
module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      console.warn('Auth middleware: missing/invalid Authorization header', { authHeader });
      return res.status(401).json({ success: false, message: 'Unauthorized: missing or invalid Authorization header' });
    }
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, name, email, role }
    next();
  } catch (err) {
    console.warn('Auth middleware: token verification failed', err?.message || err);
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid or expired token' });
  }
}