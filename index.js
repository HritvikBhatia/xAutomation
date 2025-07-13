import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

const postsPath = './posts.json';
const postedPath = './posted.json';

// Load posts queue
let posts = [];
if (fs.existsSync(postsPath)) {
  posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
}

if (!posts.length) {
  console.log("✅ No posts left in posts.json. Exiting.");
  process.exit(0);
}

// Take the first post
const post = posts.shift();

// Save updated posts
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

// Ensure posted.json exists
let posted = [];
if (fs.existsSync(postedPath)) {
  posted = JSON.parse(fs.readFileSync(postedPath, 'utf-8'));
}

// Post to Twitter
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

console.log(`📢 Posting: "${post.text}"`);

try {
  const response = await client.v2.tweet(post.text);
  console.log("✅ Tweet posted with ID:", response.data.id);

  // Add to posted.json with metadata
  posted.push({
    text: post.text,
    tweetedAt: new Date().toISOString(),
    tweetId: response.data.id
  });
  fs.writeFileSync(postedPath, JSON.stringify(posted, null, 2));

} catch (err) {
  console.error("❌ Error posting tweet:", err);
  // If failed, optionally push back into posts.json
  posts.unshift(post);
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
}
