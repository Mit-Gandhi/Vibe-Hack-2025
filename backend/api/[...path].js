// Vercel serverless function wrapper for Express app
// - Ensures MongoDB connects once per lambda instance
// - Restores '/api' prefix that Vercel strips from req.url so Express routes match

require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

let isDbConnected = false;

async function ensureDb() {
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }
}

module.exports = async (req, res) => {
  // Handle CORS at the Vercel function level FIRST - before any try/catch
  const origin = req.headers.origin;
  
  // Define allowed origins
  const allowedOrigins = [
    'https://vibe-hack-2025-optx.vercel.app',
    'https://vibe-hack-2025-two.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ];
  
  // Set CORS headers immediately - ALWAYS
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests immediately - BEFORE any other processing
  if (req.method === 'OPTIONS') {
    console.log('Vercel function handling OPTIONS preflight for:', req.url, 'from origin:', origin);
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    await ensureDb();

    // Fix double slashes in URL
    if (req.url.includes('//')) {
      req.url = req.url.replace(/\/+/g, '/');
    }

    // Vercel maps function to '/api/*' and passes the part after '/api' as req.url.
    // Our Express app defines routes starting with '/api/...'. Re-add prefix if missing.
    if (!req.url.startsWith('/api')) {
      req.url = `/api${req.url}`;
    }

    console.log('Vercel function processing:', { method: req.method, url: req.url, origin });

    return app(req, res); // Express app acts as request handler
  } catch (err) {
    console.error('Serverless handler error:', err);
    
    // Ensure CORS headers are set even for errors
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');
    
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
  }
};