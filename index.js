import { TwitterApi } from 'twitter-api-v2';
import pkg from 'pg';
import 'dotenv/config';

const { Client } = pkg;

(async () => {
  // Connect to Neon DB
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await db.connect();
  console.log("✅ Connected to database.");

  // Load posts from DB
  const { rows: posts } = await db.query('SELECT id, content FROM posts ORDER BY id');
  if (!posts.length) {
    console.log("🚀 posts table is empty. Nothing to post.");
    console.log("🛑 Exiting gracefully.");
    process.exit(0); // stops workflow successfully
  }

  // Ensure state row exists
  await db.query(`
    INSERT INTO tweet_state (id, current_index)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING;
  `);

  // Get current index
  const stateRes = await db.query('SELECT current_index FROM tweet_state WHERE id = 1');
  let index = stateRes.rows[0]?.current_index ?? 0;

  // If we've finished all posts, stop cleanly
  if (index >= posts.length) {
    console.log("✅ All tweets have been posted. No more tweets left.");
    console.log("🛑 Exiting gracefully.");
    process.exit(0); // ends workflow with success
  }

  const tweetText = posts[index].content;
  console.log(`📢 Posting #${index + 1}: "${tweetText}"`);

  // Create Twitter client
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const response = await twitterClient.v2.tweet(tweetText);
    console.log("✅ Tweet posted with ID:", response.data.id);

    // Increment index in DB
    await db.query('UPDATE tweet_state SET current_index = $1 WHERE id = 1', [index + 1]);
    console.log(`📝 Updated DB to current_index = ${index + 1}`);
  } catch (err) {
    console.error("❌ Error posting tweet:", err);
    throw err; // ensures workflow still fails on real errors
  } finally {
    await db.end();
    console.log("🔌 Disconnected from database.");
  }
})();
