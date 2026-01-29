import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import scriptRoutes from './routes/scripts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const DEV_SESSION_SECRET = 'dev-secret-change-in-production';
const SESSION_SECRET = process.env.SESSION_SECRET ?? DEV_SESSION_SECRET;

if (
  isProd &&
  (SESSION_SECRET === DEV_SESSION_SECRET || SESSION_SECRET.length < 32)
) {
  throw new Error(
    'SESSION_SECRET must be set to a secure value (≥32 chars) in production. Do not use the dev default.',
  );
}

export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: isProd, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);

if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error-handling middleware: catches errors from asyncHandler and sends 500 with context
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    console.error('Unhandled route error:', err);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: isProd ? undefined : message,
      });
  },
);
