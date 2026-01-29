import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as userDb from '../db/users.js';
import { signupBodySchema, loginBodySchema } from '../../shared/schemas/api.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = signupBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;
    const existing = await userDb.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userDb.createUser(email, hash);
    (req.session as Express.Session).userId = user.id;
    res
      .status(201)
      .json({ id: user.id, email: user.email, created_at: user.created_at });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;
    const user = await userDb.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    (req.session as Express.Session).userId = user.id;
    res.json({ id: user.id, email: user.email, created_at: user.created_at });
  }),
);

router.post('/logout', (req: Request, res: Response) => {
  req.session?.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.session as Express.Session)?.userId;
    if (userId == null) {
      res.status(401).json({ error: 'Not logged in' });
      return;
    }
    const user = await userDb.findById(userId);
    if (!user) {
      req.session?.destroy(() => {});
      res.status(401).json({ error: 'Session invalid' });
      return;
    }
    res.json({ id: user.id, email: user.email, created_at: user.created_at });
  }),
);

export default router;
