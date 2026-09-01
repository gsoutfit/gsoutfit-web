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
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}
