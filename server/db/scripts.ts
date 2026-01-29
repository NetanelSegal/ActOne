import { getPool } from "./index.js";

export interface ScriptRow {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: Date;
}

export async function createScript(userId: number, title: string, content: string): Promise<ScriptRow> {
  const pool = getPool();
  const res = await pool.query<ScriptRow>(
    "INSERT INTO scripts (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, user_id, title, content, created_at",
    [userId, title, content]
  );
  return res.rows[0];
}

export async function getScriptById(scriptId: number, userId: number): Promise<ScriptRow | null> {
  const pool = getPool();
  const res = await pool.query<ScriptRow>(
    "SELECT id, user_id, title, content, created_at FROM scripts WHERE id = $1 AND user_id = $2",
    [scriptId, userId]
  );
  return res.rows[0] ?? null;
}

export async function listScriptsByUser(userId: number): Promise<ScriptRow[]> {
  const pool = getPool();
  const res = await pool.query<ScriptRow>(
    "SELECT id, user_id, title, content, created_at FROM scripts WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return res.rows;
}

export async function updateScript(
  scriptId: number,
  userId: number,
  updates: { title?: string; content?: string }
): Promise<ScriptRow | null> {
  const pool = getPool();
  if (updates.title !== undefined && updates.content !== undefined) {
    const res = await pool.query<ScriptRow>(
      "UPDATE scripts SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING id, user_id, title, content, created_at",
      [updates.title, updates.content, scriptId, userId]
    );
    return res.rows[0] ?? null;
  }
  if (updates.title !== undefined) {
    const res = await pool.query<ScriptRow>(
      "UPDATE scripts SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING id, user_id, title, content, created_at",
      [updates.title, scriptId, userId]
    );
    return res.rows[0] ?? null;
  }
  if (updates.content !== undefined) {
    const res = await pool.query<ScriptRow>(
      "UPDATE scripts SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING id, user_id, title, content, created_at",
      [updates.content, scriptId, userId]
    );
    return res.rows[0] ?? null;
  }
  return getScriptById(scriptId, userId);
}

export async function deleteScript(scriptId: number, userId: number): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query("DELETE FROM scripts WHERE id = $1 AND user_id = $2", [scriptId, userId]);
  return (res.rowCount ?? 0) > 0;
}
