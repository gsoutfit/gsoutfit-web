import { getPool } from "./pg";
import { User } from "@/types";

// Persistent (Postgres) replacement for the `users` slice of the old JSON-file
// database. On Vercel's read-only filesystem, every user mutation (register,
// verify email, change password, admin edits) silently failed — accounts
// appeared to be created, then vanished on the next cold start, which looked
// like "login doesn't work". Users are stored as full JSONB documents (`data`)
// plus lookup columns.

let initPromise: Promise<void> | null = null;

function init(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await ensureTable();
      await seedFromJsonIfEmpty();
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

async function ensureTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      username TEXT,
      role TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

/**
 * One-time migration safety net: seed the existing accounts from data/db.json
 * so current logins keep working after the move to Postgres.
 */
async function seedFromJsonIfEmpty() {
  const pool = getPool();
  const { rows } = await pool.query("SELECT count(*)::int AS count FROM users");
  if (rows[0]?.count > 0) return;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const raw = await fs.readFile(path.join(process.cwd(), "data", "db.json"), "utf-8");
    const json = JSON.parse(raw);
    const legacyUsers: User[] = json.users || [];

    for (const user of legacyUsers) {
      await pool.query(
        `INSERT INTO users (id, email, username, role, data, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.email || null,
          user.username || null,
          user.role || null,
          JSON.stringify(user),
          user.createdAt || new Date().toISOString(),
        ]
      );
    }
  } catch {
    // No legacy data file, or it had no users — nothing to seed.
  }
}

export async function getAllUsers(): Promise<User[]> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM users ORDER BY created_at ASC");
  return rows.map((r: { data: User }) => r.data);
}

export async function getUserById(id: string): Promise<User | null> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM users WHERE id = $1 LIMIT 1", [id]);
  if (rows.length === 0) return null;
  return rows[0].data;
}

export async function insertUser(user: User): Promise<User> {
  await init();
  const pool = getPool();
  await pool.query(
    `INSERT INTO users (id, email, username, role, data, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      user.id,
      user.email || null,
      user.username || null,
      user.role || null,
      JSON.stringify(user),
      user.createdAt || new Date().toISOString(),
    ]
  );
  return user;
}

export async function updateUserInDb(id: string, user: User): Promise<User> {
  await init();
  const pool = getPool();
  await pool.query(
    `UPDATE users
     SET email = $1, username = $2, role = $3, data = $4
     WHERE id = $5`,
    [user.email || null, user.username || null, user.role || null, JSON.stringify(user), id]
  );
  return user;
}
