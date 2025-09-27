const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const mikrotikRoutes = require('./routes/mikrotik');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Allowed origins (add more if needed)
const allowedOrigins = [
  'http://localhost:5173',
  'https://celadon-alfajores-0412e2.netlify.app',
  'https://celadon-alfajores-0412e2.netlify.app/',
  'http://localhost:5000',
  'http://localhost:8088',
  process.env.FRONTEND_URL // optional from .env
].filter(Boolean); // Remove undefined values

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true,
    credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/mikrotik', mikrotikRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MikroTik Backend API running on port ${PORT}`);
  console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
});
