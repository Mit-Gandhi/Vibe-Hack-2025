const { verifyToken } = require('../utils/jwt');

// If Authorization header is present and valid, attach req.user; otherwise continue silently
module.exports = function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (scheme === 'Bearer' && token) {
      const decoded = verifyToken(token);
      req.user = decoded; // { userId, name, email, role }
    }
  } catch (_) {}
  finally { next(); }
}