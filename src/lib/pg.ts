import { Pool } from "pg";

// Shared Postgres connection pool (Neon). Serverless functions on Vercel have a
// read-only filesystem, so any data that needs to survive a request (e.g. orders)
// must live in a real database instead of the JSON file used elsewhere in this app.
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Cannot connect to the database.");
    }
    // Managed Postgres (Neon, Supabase) requires SSL. If the connection string
    // has no sslmode, force it here so a missing query param doesn't kill
    // every query with a connection error.
    const needsSsl = !/sslmode=(disable|allow|prefer)/.test(process.env.DATABASE_URL);
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
      // Serverless: many short-lived functions share the database — keep the
      // pool small and don't hold idle connections.
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}
