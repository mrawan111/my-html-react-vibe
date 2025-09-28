const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const mikrotikRoutes = require('./routes/mikrotik');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://celadon-alfajores-0412e2.netlify.app',
  'http://localhost:5000',
  'http://localhost:8088',
  'https://my-html-react-vibe.lovable.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🔄 Allowed CORS origins:', allowedOrigins);

// ✅ MANUAL CORS HANDLING - More reliable than cors package
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`📨 Incoming ${req.method} request from origin:`, origin);
  
  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ Origin allowed:', origin);
  } else if (!origin) {
    // Allow requests without origin (like mobile apps, curl)
    console.log('ℹ️  Request without origin - allowing');
  } else {
    console.log('❌ Origin not allowed:', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🛬 Handling OPTIONS preflight request');
    console.log('Request Headers:', req.headers);
    console.log('Response Headers:', {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers')
    });
    return res.status(200).end();
  }
  
  next();
});

// ✅ Security middleware with CORS-friendly configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: { 
    success: false, 
    error: 'Too many requests from this IP, please try again later.' 
  },
  headers: true,
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

app.options('/api/test-cors', (req, res) => {
  res.status(200).end();
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MikroTik Backend API',
    version: '1.0.0'
  });
});

app.options('/health', (req, res) => {
  res.status(200).end();
});

// ✅ MikroTik routes
app.use('/api/mikrotik', mikrotikRoutes);

// ✅ Special OPTIONS handler for all mikrotik routes
app.options('/api/mikrotik/*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// ✅ Global OPTIONS handler as fallback
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('🌍 Global OPTIONS handler for:', req.originalUrl);
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// ✅ Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Headers:', {
    origin: req.headers.origin,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
  });
  next();
});

// ✅ Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error.message);
  console.error('Stack:', error.stack);
  
  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  
  // Ensure CORS headers for 404 responses
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// ✅ Server startup
app.listen(PORT, () => {
  console.log(`🚀 MikroTik Backend API running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 CORS test: http://localhost:${PORT}/api/test-cors`);
});

// ✅ Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});

module.exports = app;