import { getPool } from "./pg";
import { Coupon } from "@/types";

// Persistent (Postgres) replacement for the `coupons` slice of the old
// JSON-file database (Vercel's filesystem is read-only — creates, deletes and
// usage-count bumps were silently lost).

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
    CREATE TABLE IF NOT EXISTS coupons (
      seq BIGSERIAL,
      id TEXT PRIMARY KEY,
      code TEXT,
      data JSONB NOT NULL
    )
  `);
}

async function seedFromJsonIfEmpty() {
  const pool = getPool();
  const { rows } = await pool.query("SELECT count(*)::int AS count FROM coupons");
  if (rows[0]?.count > 0) return;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const raw = await fs.readFile(path.join(process.cwd(), "data", "db.json"), "utf-8");
    const json = JSON.parse(raw);
    const legacy: Coupon[] = json.coupons || [];

    for (const coupon of legacy) {
      await pool.query(
        `INSERT INTO coupons (id, code, data)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [coupon.id, coupon.code || null, JSON.stringify(coupon)]
      );
    }
  } catch {
    // No legacy data file — nothing to seed.
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM coupons ORDER BY seq ASC");
  return rows.map((r: { data: Coupon }) => r.data);
}

export async function insertCoupon(coupon: Coupon): Promise<Coupon> {
  await init();
  const pool = getPool();
  await pool.query(
    `INSERT INTO coupons (id, code, data) VALUES ($1, $2, $3)`,
    [coupon.id, coupon.code || null, JSON.stringify(coupon)]
  );
  return coupon;
}

export async function updateCouponInDb(id: string, coupon: Coupon): Promise<Coupon> {
  await init();
  const pool = getPool();
  await pool.query(
    `UPDATE coupons SET code = $1, data = $2 WHERE id = $3`,
    [coupon.code || null, JSON.stringify(coupon), id]
  );
  return coupon;
}

export async function deleteCouponFromDb(id: string): Promise<boolean> {
  await init();
  const pool = getPool();
  const { rowCount } = await pool.query("DELETE FROM coupons WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
