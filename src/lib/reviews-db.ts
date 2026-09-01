import { getPool } from "./pg";
import { Review } from "@/types";

// Persistent (Postgres) replacement for the `reviews` slice of the old
// JSON-file database (Vercel's filesystem is read-only — posted reviews
// vanished on the next cold start). Newest first, matching the old unshift
// behavior.

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
    CREATE TABLE IF NOT EXISTS reviews (
      seq BIGSERIAL,
      id TEXT PRIMARY KEY,
      product_id TEXT,
      data JSONB NOT NULL
    )
  `);
}

async function seedFromJsonIfEmpty() {
  const pool = getPool();
  const { rows } = await pool.query("SELECT count(*)::int AS count FROM reviews");
  if (rows[0]?.count > 0) return;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const raw = await fs.readFile(path.join(process.cwd(), "data", "db.json"), "utf-8");
    const json = JSON.parse(raw);
    const legacy: Review[] = json.reviews || [];

    // db.json stored newest-first; insert reversed so seq ASC = chronological
    // and ORDER BY seq DESC keeps newest-first.
    for (const review of [...legacy].reverse()) {
      await pool.query(
        `INSERT INTO reviews (id, product_id, data)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [review.id, review.productId || null, JSON.stringify(review)]
      );
    }
  } catch {
    // No legacy data file — nothing to seed.
  }
}

export async function getAllReviews(productId?: string): Promise<Review[]> {
  await init();
  const pool = getPool();
  const { rows } = productId
    ? await pool.query("SELECT data FROM reviews WHERE product_id = $1 ORDER BY seq DESC", [productId])
    : await pool.query("SELECT data FROM reviews ORDER BY seq DESC");
  return rows.map((r: { data: Review }) => r.data);
}

export async function insertReview(review: Review): Promise<Review> {
  await init();
  const pool = getPool();
  await pool.query(
    `INSERT INTO reviews (id, product_id, data) VALUES ($1, $2, $3)`,
    [review.id, review.productId || null, JSON.stringify(review)]
  );
  return review;
}
