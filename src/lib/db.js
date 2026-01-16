import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/feedback_db";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
});

let ensureTablePromise;

async function ensureTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        feedback TEXT,
        user_agent TEXT,
        language TEXT,
        referer TEXT,
        page_url TEXT,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  return ensureTablePromise;
}

export async function saveReview({
  rating,
  feedback,
  userAgent,
  language,
  referer,
  pageUrl,
  ipAddress,
}) {
  await ensureTable();

  const values = [
    rating,
    feedback || null,
    userAgent || null,
    language || null,
    referer || null,
    pageUrl || null,
    ipAddress || null,
  ];

  await pool.query(
    `
      INSERT INTO reviews
        (rating, feedback, user_agent, language, referer, page_url, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    values,
  );
}
