// Centralized error handler
module.exports = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  
  // Ensure CORS headers are set even for errors
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://vibe-hack-2025-optx.vercel.app',
    'https://vibe-hack-2025-two.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ];
  
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
};