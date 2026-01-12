import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from './config/passport';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import interestsRoutes from './routes/interests.routes';
import coursesRoutes from './routes/courses.routes';
import expensesRoutes from './routes/expenses.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  // Allow common local dev origins (Vite 5173, React 3000/3001) and configured frontend URL
  origin: [
    config.frontendUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001',
    'http://localhost:3000',
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/me', userRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/expenses', expensesRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server (bind to all interfaces to avoid localhost issues)
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
  console.log(`📚 API: http://localhost:${config.port}/api`);
  console.log(`💚 Health: http://localhost:${config.port}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;


