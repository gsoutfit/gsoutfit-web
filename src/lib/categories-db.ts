import { getPool } from "./pg";
import { Category } from "@/types";

// Persistent (Postgres) replacement for the `categories` slice of the old
// JSON-file database (Vercel's filesystem is read-only — writes were silently
// lost). `seq` preserves insertion order so the seed catalog keeps its layout.

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
    CREATE TABLE IF NOT EXISTS categories (
      seq BIGSERIAL,
      id TEXT PRIMARY KEY,
      slug TEXT,
      name TEXT,
      type TEXT,
      data JSONB NOT NULL
    )
  `);
}

async function seedFromJsonIfEmpty() {
  const pool = getPool();
  const { rows } = await pool.query("SELECT count(*)::int AS count FROM categories");
  if (rows[0]?.count > 0) return;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const raw = await fs.readFile(path.join(process.cwd(), "data", "db.json"), "utf-8");
    const json = JSON.parse(raw);
    const legacy: Category[] = json.categories || [];

    for (const cat of legacy) {
      await pool.query(
        `INSERT INTO categories (id, slug, name, type, data)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.slug || null, cat.name || null, cat.type || null, JSON.stringify(cat)]
      );
    }
  } catch {
    // No legacy data file — nothing to seed.
  }
}

export async function getAllCategories(): Promise<Category[]> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM categories ORDER BY seq ASC");
  return rows.map((r: { data: Category }) => r.data);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM categories WHERE id = $1 LIMIT 1", [id]);
  if (rows.length === 0) return null;
  return rows[0].data;
}

export async function insertCategory(cat: Category): Promise<Category> {
  await init();
  const pool = getPool();
  await pool.query(
    `INSERT INTO categories (id, slug, name, type, data)
     VALUES ($1, $2, $3, $4, $5)`,
    [cat.id, cat.slug || null, cat.name || null, cat.type || null, JSON.stringify(cat)]
  );
  return cat;
}

export async function updateCategoryInDb(id: string, cat: Category): Promise<Category> {
  await init();
  const pool = getPool();
  await pool.query(
    `UPDATE categories SET slug = $1, name = $2, type = $3, data = $4 WHERE id = $5`,
    [cat.slug || null, cat.name || null, cat.type || null, JSON.stringify(cat), id]
  );
  return cat;
}

export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  await init();
  const pool = getPool();
  const { rowCount } = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
