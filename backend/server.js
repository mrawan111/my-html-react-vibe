const express = require('express');
const cors = require('cors');
// require('dotenv').config(); // Railway sets env vars automatically

const app = express();

// ✅ Railway uses PORT environment variable, default to 8080
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting MikroTik Backend API...');

// ✅ Use cors package for better CORS handling
app.use(cors({
  origin: true, // Allow all origins for Railway
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  try {
    // For now, return a mock response to test CORS
    console.log('Connect request received:', req.body);

    res.json({
      success: false,
      message: 'Connection test: Router unreachable from cloud backend. Run backend locally for local router access.'
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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(200).end();
});

// ✅ Server startup
app.listen(PORT, () => {
  console.log(`🚀 MikroTik Backend API running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: https://my-html-react-vibe-production.up.railway.app/health`);
});

module.exports = app;
