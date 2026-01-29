import pg from "pg";

const { DATABASE_URL } = process.env;
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      max: 10,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  if (!DATABASE_URL) {
    console.warn("DATABASE_URL not set; DB features disabled.");
    return;
  }
  const p = getPool();
  try {
    await p.query("SELECT 1");
  } catch (err) {
    console.warn("Database not available:", (err as Error).message);
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
