import cors from 'cors';
import express, { type Express } from 'express';
import 'express-async-errors';
import { env } from './config/env';
import { DIMENSIONS, QUESTION_COUNT } from './data/catalog';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth.routes';
import feedbackRoutes from './routes/feedback.routes';
import scorecardRoutes from './routes/scorecard.routes';
import subjectRoutes from './routes/subject.routes';

const app: Express = express();

app.set('trust proxy', 1);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigin === '*') return callback(null, true);
      const allowed = env.corsOrigin.split(',').map((value) => value.trim());
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use('/api', apiLimiter);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  let database = false;
  try {
    const prisma = (await import('./config/database')).default;
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (error) {
    console.error('[health] database ping failed', error);
  }
  res.json({
    success: true,
    service: 'bossorater-api',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    database,
    catalog: { worlds: DIMENSIONS.length, quests: QUESTION_COUNT },
  });
});

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'bossorater-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/scorecards', scorecardRoutes);

app.use(errorHandler);

export default app;
