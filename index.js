import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

const postsPath = './posts.json';
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

// Find the next unposted tweet
const nextPost = posts.find(p => !p.tweetedAt);

if (!nextPost) {
  console.log("✅ No unposted tweets left.");
  process.exit(0);
}

console.log(`📢 Posting: "${nextPost.text}"`);

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

try {
  const response = await client.v2.tweet(nextPost.text);
  console.log("✅ Tweet posted with ID:", response.data.id);

  // Mark this post as tweeted
  nextPost.tweetedAt = new Date().toISOString();
  nextPost.tweetId = response.data.id;
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

} catch (err) {
  console.error("❌ Error posting tweet:", err);
}
