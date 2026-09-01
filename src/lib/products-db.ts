import { getPool } from "./pg";
import { Product } from "@/types";

// Persistent (Postgres) replacement for the `products` slice of the old JSON-file
// database. Vercel's serverless functions run on a read-only filesystem, so
// writes to the JSON file (create/update/delete product, stock changes, view
// tracking) silently failed in production — the admin panel reported success
// but nothing was saved. Products are stored as full JSONB documents (`data`)
// plus a few columns used for lookup and ordering.

let initPromise: Promise<void> | null = null;

function init(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await ensureTable();
      await seedFromJsonIfEmpty();
    })().catch((err) => {
      // Allow retry on next request if the first init raced a cold start.
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

async function ensureTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT,
      category TEXT,
      name TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

/**
 * One-time migration safety net: if the products table is empty (fresh
 * database) seed it with the catalog that used to live in data/db.json, so
 * the live store doesn't lose its products after this migration.
 */
async function seedFromJsonIfEmpty() {
  const pool = getPool();
  const { rows } = await pool.query("SELECT count(*)::int AS count FROM products");
  if (rows[0]?.count > 0) return;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const raw = await fs.readFile(path.join(process.cwd(), "data", "db.json"), "utf-8");
    const json = JSON.parse(raw);
    const legacyProducts: Product[] = json.products || [];

    for (const product of legacyProducts) {
      await pool.query(
        `INSERT INTO products (id, slug, category, name, data, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.slug || null,
          product.category || null,
          product.name || null,
          JSON.stringify(product),
          product.createdAt || new Date().toISOString(),
        ]
      );
    }
  } catch {
    // No legacy data file, or it had no products — nothing to seed.
  }
}

function rowToProduct(row: { data: Product }): Product {
  return row.data;
}

export async function getAllProducts(): Promise<Product[]> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM products ORDER BY created_at DESC");
  return rows.map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT data FROM products WHERE id = $1 OR slug = $1 LIMIT 1",
    [id]
  );
  if (rows.length === 0) return null;
  return rowToProduct(rows[0]);
}

export async function insertProduct(product: Product): Promise<Product> {
  await init();
  const pool = getPool();
  await pool.query(
    `INSERT INTO products (id, slug, category, name, data, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      product.id,
      product.slug || null,
      product.category || null,
      product.name || null,
      JSON.stringify(product),
      product.createdAt || new Date().toISOString(),
    ]
  );
  return product;
}

export async function updateProductInDb(id: string, product: Product): Promise<Product> {
  await init();
  const pool = getPool();
  await pool.query(
    `UPDATE products
     SET slug = $1, category = $2, name = $3, data = $4
     WHERE id = $5`,
    [
      product.slug || null,
      product.category || null,
      product.name || null,
      JSON.stringify(product),
      id,
    ]
  );
  return product;
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  await init();
  const pool = getPool();
  const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
