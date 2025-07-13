import fs from 'fs';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

dotenv.config();

// Load posts to post
const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

// Load already posted history
let posted = [];
if (fs.existsSync('posted.json')) {
  posted = JSON.parse(fs.readFileSync('posted.json', 'utf8'));
}

const nextPost = posts.shift();

if (!nextPost) {
  console.log("✅ No posts left to post.");
  process.exit(0);
}

// Setup Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

(async () => {
  try {
    const tweet = await client.v2.tweet(nextPost.text);
    console.log(`✅ Tweeted: ${nextPost.text}`);

    // Add to posted.json
    posted.push({
      ...nextPost,
      tweetedAt: new Date().toISOString(),
      tweetId: tweet.data.id
    });

    // Save back both files
    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
    fs.writeFileSync('posted.json', JSON.stringify(posted, null, 2));
  } catch (err) {
    console.error("❌ Error posting tweet:", err);
    process.exit(1);
  }
})();
