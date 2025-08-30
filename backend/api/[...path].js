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
  try {
    // Handle CORS at the Vercel function level first
    const origin = req.headers.origin;
    
    // Set CORS headers immediately
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests immediately at Vercel level
    if (req.method === 'OPTIONS') {
      console.log('Vercel function handling OPTIONS preflight for:', req.url);
      res.statusCode = 204;
      res.end();
      return;
    }

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
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
  }
};