import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

const posts = JSON.parse(fs.readFileSync('./posts.json', 'utf-8'));

if (!posts.length) {
  console.log("🚀 posts.json is empty. Nothing to post.");
  throw new Error("❌ No tweets left to post.");
}

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

for (const tweet of posts) {
  try {
    console.log(`📢 Trying to post: "${tweet}"`);
    const response = await client.v2.tweet(tweet);
    console.log("✅ Tweet posted with ID:", response.data.id);
    process.exit(0); // success, stop
  } catch (err) {
    if (err?.data?.detail?.includes("duplicate")) {
      console.log(`⚠️ Duplicate tweet, skipping: "${tweet}"`);
    } else {
      console.error("❌ Posting failed:", err);
      throw err; // unexpected error, stop workflow
    }
  }
}

console.log("🚀 Tried all tweets, nothing new left to post.");
throw new Error("❌ All tweets are duplicates or failed.");
