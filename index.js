import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import pkg from 'pg';
import 'dotenv/config';

const { Client } = pkg;

// Load posts from local JSON file
const posts = JSON.parse(fs.readFileSync('./posts.json', 'utf-8'));

if (!posts.length) {
  console.log("🚀 posts.json is empty. Nothing to post.");
  throw new Error("❌ posts.json is empty.");
}

// Connect to Neon DB
const db = new Client({
  connectionString: process.env.DATABASE_URL,
});
await db.connect();

// Ensure state row exists
await db.query(`
  INSERT INTO tweet_state (id, current_index)
  VALUES (1, 0)
  ON CONFLICT (id) DO NOTHING;
`);

// Get current index
let { rows } = await db.query('SELECT current_index FROM tweet_state WHERE id = 1');
let index = rows[0]?.current_index ?? 0;

// If we've finished all posts, reset to 0
if (index >= posts.length) {
  console.log("🔄 All tweets posted, resetting to start.");
  index = 0;
  await db.query('UPDATE tweet_state SET current_index = 0 WHERE id = 1');
}

const tweetText = posts[index];
console.log(`📢 Posting #${index + 1}: "${tweetText}"`);

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
  throw err; // ensures GitHub sends notification on failure
}

await db.end();
