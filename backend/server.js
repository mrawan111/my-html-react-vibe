const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const mikrotikRoutes = require('./routes/mikrotik');

const app = express();

// ✅ Railway uses PORT environment variable, default to 8080
const PORT = process.env.PORT || 3001;

// ✅ Allowed origins - UPDATED for production
const allowedOrigins = [
  'http://localhost:5173',
  'https://celadon-alfajores-0412e2.netlify.app',
  'http://localhost:5000',
  'http://localhost:8088',
  'https://my-html-react-vibe.lovable.app',
  'https://my-html-react-vibe-production.up.railway.app', // Add your Railway URL
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🔄 Allowed CORS origins:', allowedOrigins);

// ✅ Use cors package for better CORS handling
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { 
    success: false, 
    error: 'Too many requests from this IP, please try again later.' 
  }
});
app.use(limiter);

// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Test endpoint for CORS verification
app.get('/api/test-cors', (req, res) => {
  console.log('✅ CORS test endpoint hit successfully!');
  res.json({ 
    success: true,
    message: 'CORS is working correctly! 🎉',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins
  });
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MikroTik Backend API',
    version: '1.0.0',
    port: PORT
  });
});

// ✅ ADD THIS: Direct /connect route for frontend compatibility
app.post('/connect', async (req, res) => {
  // Add CORS headers for Railway deployment
  res.header('Access-Control-Allow-Origin', 'https://my-html-react-vibe.lovable.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  try {
    // Forward to the actual mikrotik connect endpoint
    const { ip, port, username, password, connectionType, timeout } = req.body;

    const MikrotikService = require('./services/mikrotikService');
    const mikrotikService = new MikrotikService({
      ip, port, username, password, connectionType, timeout
    });

    const result = await mikrotikService.testConnection();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Connection failed',
      message: error.message
    });
  }
});

// ✅ ADD OPTIONS handler for /connect
app.options('/connect', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://my-html-react-vibe.lovable.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// ✅ MikroTik routes
app.use('/api/mikrotik', mikrotikRoutes);

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error.message);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// ✅ Server startup
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MikroTik Backend API running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 Health check: https://my-html-react-vibe-production.up.railway.app/health`);
  console.log(`🧪 CORS test: https://my-html-react-vibe-production.up.railway.app/api/test-cors`);
});

module.exports = app;