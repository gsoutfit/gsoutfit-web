import { getPool } from "./pg";
import { StoreSettings } from "@/types";

// Persistent (Postgres) replacement for the `settings` slice of the old
// JSON-file database. On Vercel every settings save (theme, store info, SMTP,
// security gate) silently failed. Single-row table: the whole settings object
// lives in one JSONB document.

let initPromise: Promise<void> | null = null;

function init(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_settings (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

/** Returns the stored settings, or null when nothing has been saved yet. */
export async function getSettingsRow(): Promise<StoreSettings | null> {
  await init();
  const pool = getPool();
  const { rows } = await pool.query("SELECT data FROM store_settings WHERE id = 'store'");
  if (rows.length === 0) return null;
  return rows[0].data;
}

export async function saveSettingsRow(settings: StoreSettings): Promise<void> {
  await init();
  const pool = getPool();
  await pool.query(
    `INSERT INTO store_settings (id, data, updated_at)
     VALUES ('store', $1, now())
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = now()`,
    [JSON.stringify(settings)]
  );
}
