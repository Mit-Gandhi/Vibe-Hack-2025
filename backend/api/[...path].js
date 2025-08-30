// Vercel serverless function wrapper for Express app
// - Ensures MongoDB connects once per lambda instance
// - Restores '/api' prefix that Vercel strips from req.url so Express routes match

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
    await ensureDb();

    // Vercel maps function to '/api/*' and passes the part after '/api' as req.url.
    // Our Express app defines routes starting with '/api/...'. Re-add prefix if missing.
    if (!req.url.startsWith('/api')) {
      req.url = `/api${req.url}`;
    }

    return app(req, res); // Express app acts as request handler
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
  }
};