import pkg from 'pg';
import 'dotenv/config';

const { Client } = pkg;

(async () => {
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await db.connect();
  console.log("✅ Connected to database.");

  // Clear posts table
  await db.query('TRUNCATE TABLE posts RESTART IDENTITY');
  console.log("🗑 Cleared posts table.");

  // Reset tweet_state index
  await db.query(`
    INSERT INTO tweet_state (id, current_index)
    VALUES (1, 0)
    ON CONFLICT (id) DO UPDATE SET current_index = 0;
  `);
  console.log("🔄 Reset tweet_state to 0.");

  await db.end();
  console.log("🚀 Reset complete, disconnected.");
})();
