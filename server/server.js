import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimiter from './middleware/rateLimiter.js';
import { connectToDatabase } from './config/database.js';
import { ensureDeviceId } from './middleware/authSimulation.js';
import errorHandler from './middleware/errorHandler.js';
import aiRoutes from './routes/ai.routes.js';
import postRoutes from './routes/posts.routes.js';
import commentRoutes from './routes/comments.routes.js';
import uploadRoutes from './routes/uploads.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimiter);

// Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simulate authentication (no-login policy)
app.use(ensureDeviceId);

// Static files (uploads)
const publicDir = path.join(__dirname, 'public');
app.use('/public', express.static(publicDir));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api', aiRoutes);
app.use('/api', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes); // comments under /api/posts/:id/comments

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectToDatabase();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
