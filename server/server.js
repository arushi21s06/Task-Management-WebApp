const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));

// Enable CORS — allow localhost in dev, any Vercel origin in production
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, Vercel same-domain)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ─── Serverless DB Connection Middleware ─────────────────────────────────────
// MUST run before every route so that mongoose.connect() is always awaited.
// connectDB() returns immediately from cache on warm Vercel invocations.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable. Please try again.' });
  }
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many attempts, please try again after 15 minutes',
  },
});

// Mount routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handler (must be after routes)
app.use(errorHandler);

// Start server if not running in a serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}

// Export the app for Vercel serverless function
module.exports = app;
