import { getPool } from "./pg";
import { Order, OrderStatus } from "@/types";

// Persistent (Postgres) replacement for the `orders` slice of the old JSON-file
// database. Vercel's serverless functions run on a read-only filesystem, so
// writes to the JSON file (cancel/update status, place order) silently failed
// in production. Orders are stored as full JSONB documents (`data`) plus a
// couple of indexed columns used for filtering.

let seeded = false;

function rowToOrder(row: { data: Order }): Order {
  return row.data;
}

/**
 * One-time migration safety net: if the orders table is empty (fresh database)
 * seed it with the sample orders that used to live in data/db.json, so existing
 * admin users don't see their order list disappear after this migration.
 */
async function seedFromJsonIfEmpty() {
  if (seeded) return;
  seeded = true;

  const pool = getPool();
  const { rows } = await pool.query("SELECT count(*)::int AS count FROM orders");
  if (rows[0]?.count > 0) return;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const raw = await fs.readFile(path.join(process.cwd(), "data", "db.json"), "utf-8");
    const json = JSON.parse(raw);
    const legacyOrders: Order[] = json.orders || [];

    for (const legacy of legacyOrders) {
      const order: Order = {
        ...legacy,
        id: legacy.id || `order-gs-${legacy.orderNumber.replace(/\D/g, "")}`,
      };
      await pool.query(
        `INSERT INTO orders (id, order_number, user_id, status, payment_status, data, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          order.id,
          order.orderNumber,
          order.userId || null,
          order.status,
          order.paymentStatus,
          JSON.stringify(order),
          order.createdAt,
        ]
      );
    }
  } catch {
    // No legacy data file, or it had no orders — nothing to seed.
  }
}

export async function getOrders(userId?: string): Promise<Order[]> {
  await seedFromJsonIfEmpty();
  const pool = getPool();
  const { rows } = userId
    ? await pool.query("SELECT data FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    : await pool.query("SELECT data FROM orders ORDER BY created_at DESC");
  return rows.map(rowToOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  await seedFromJsonIfEmpty();
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT data FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1",
    [id]
  );
  if (rows.length === 0) return null;
  return rowToOrder(rows[0]);
}

export async function insertOrder(order: Order): Promise<Order> {
  await seedFromJsonIfEmpty();
  const pool = getPool();
  await pool.query(
    `INSERT INTO orders (id, order_number, user_id, status, payment_status, data, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      order.id,
      order.orderNumber,
      order.userId || null,
      order.status,
      order.paymentStatus,
      JSON.stringify(order),
      order.createdAt,
    ]
  );
  return order;
}

export async function updateOrderStatusInDb(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
  note?: string
): Promise<Order | null> {
  await seedFromJsonIfEmpty();
  const existing = await getOrderById(id);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    status,
    trackingNumber: trackingNumber || existing.trackingNumber,
    timeline: [
      ...existing.timeline,
      {
        status,
        description: note || `Order status updated to ${status}.`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const pool = getPool();
  await pool.query(
    `UPDATE orders
     SET status = $1, payment_status = $2, data = $3, updated_at = now()
     WHERE id = $4 OR order_number = $4`,
    [updated.status, updated.paymentStatus, JSON.stringify(updated), id]
  );

  return updated;
}
