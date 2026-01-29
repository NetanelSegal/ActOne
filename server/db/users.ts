import pg from "pg";
import { getPool } from "./index.js";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function createUser(email: string, passwordHash: string): Promise<UserRow> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, password_hash, created_at",
    [email.toLowerCase(), passwordHash]
  );
  return res.rows[0];
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    "SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  return res.rows[0] ?? null;
}

export async function findById(id: number): Promise<Omit<UserRow, "password_hash"> | null> {
  const pool = getPool();
  const res = await pool.query<Omit<UserRow, "password_hash">>(
    "SELECT id, email, created_at FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0] ?? null;
}
