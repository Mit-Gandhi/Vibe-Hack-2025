const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const blogRoutes = require('./routes/blog.routes');
const commentRoutes = require('./routes/comment.routes');

const app = express();

// Simple logging middleware
app.use((req, res, next) => {
  console.log('Express app processing:', { 
    method: req.method, 
    url: req.url,
    origin: req.headers.origin
  });
  next();
});

// CORS is handled at the Vercel function level for serverless deployment
// For local development, we still need CORS middleware
if (process.env.NODE_ENV !== 'production') {
  const corsOptions = {
    origin: [
      'https://vibe-hack-2025-optx.vercel.app',
      'https://vibe-hack-2025-two.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
    maxAge: 86400
  };
  
  app.use(cors(corsOptions));
}

// Security middleware (minimal for debugging)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check (support both /health and /api/health for Vercel)
const healthHandler = (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    origin: req.headers.origin,
    method: req.method,
    url: req.url,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasCorsOrigins: !!process.env.CORS_ORIGINS
    }
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test OPTIONS endpoint for debugging preflight
app.options('/api/auth/login', (req, res) => {
  console.log('OPTIONS request for /api/auth/login from origin:', req.headers.origin);
  res.status(200).end();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);

// Error handler (last)
app.use(errorHandler);

module.exports = app;