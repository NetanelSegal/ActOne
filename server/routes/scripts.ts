import { Router, Request, Response } from 'express';
import * as scriptDb from '../db/scripts.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createScriptBodySchema,
  updateScriptBodySchema,
} from '../../shared/schemas/api.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.session as Express.Session).userId!;
    const scripts = await scriptDb.listScriptsByUser(userId);
    res.json(
      scripts.map((s) => ({
        id: s.id,
        user_id: s.user_id,
        title: s.title,
        content: s.content,
        created_at: s.created_at,
      })),
    );
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.session as Express.Session).userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid script id' });
      return;
    }
    const script = await scriptDb.getScriptById(id, userId);
    if (!script) {
      res.status(404).json({ error: 'Script not found' });
      return;
    }
    res.json({
      id: script.id,
      user_id: script.user_id,
      title: script.title,
      content: script.content,
      created_at: script.created_at,
    });
  }),
);

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.session as Express.Session).userId!;
    const parsed = createScriptBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }
    const { title, content } = parsed.data;
    const script = await scriptDb.createScript(userId, title, content);
    res
      .status(201)
      .json({
        id: script.id,
        user_id: script.user_id,
        title: script.title,
        content: script.content,
        created_at: script.created_at,
      });
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.session as Express.Session).userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid script id' });
      return;
    }
    const parsed = updateScriptBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }
    const script = await scriptDb.updateScript(id, userId, parsed.data);
    if (!script) {
      res.status(404).json({ error: 'Script not found' });
      return;
    }
    res.json({
      id: script.id,
      user_id: script.user_id,
      title: script.title,
      content: script.content,
      created_at: script.created_at,
    });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.session as Express.Session).userId!;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid script id' });
      return;
    }
    const deleted = await scriptDb.deleteScript(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Script not found' });
      return;
    }
    res.status(204).send();
  }),
);

export default router;
