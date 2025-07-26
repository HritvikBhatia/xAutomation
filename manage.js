import pkg from "pg";
import "dotenv/config";

const { Client } = pkg;

(async () => {
  const [, , command, ...args] = process.argv;

  const db = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await db.connect();

  if (command === "add") {
    if (!args.length) {
      console.error('❌ Usage: node manage.js add "tweet1" "tweet2" ...');
      process.exit(1);
    }
    for (const tweetText of args) {
      const formatted = tweetText.replace(/\\n/g, "\n");
      await db.query("INSERT INTO posts (content) VALUES ($1)", [formatted]);
      console.log(`✅ Added tweet:\n${formatted}\n`);
    }
  } else if (command === "list") {
    const { rows } = await db.query(
      "SELECT id, content FROM posts ORDER BY id"
    );
    if (!rows.length) {
      console.log("🚀 No posts found.");
    } else {
      console.log("📋 Current posts:");
      rows.forEach((row) => {
        console.log(`#${row.id}: ${row.content}`);
      });
    }
  } else if (command === "delete") {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) {
      console.error("❌ Usage: node manage.js delete <id>");
      process.exit(1);
    }
    const res = await db.query("DELETE FROM posts WHERE id = $1 RETURNING *", [
      id,
    ]);
    if (res.rowCount === 0) {
      console.log(`⚠️ No post found with ID ${id}.`);
    } else {
      console.log(`🗑 Deleted post #${id}: "${res.rows[0].content}"`);
    }
  } else if (command === "status") {
    const stateRes = await db.query(
      "SELECT current_index FROM tweet_state WHERE id = 1"
    );
    const currentIndex = stateRes.rows[0]?.current_index ?? 0;

    const postsRes = await db.query("SELECT COUNT(*) FROM posts");
    const totalPosts = parseInt(postsRes.rows[0].count, 10);
    const remaining = totalPosts - currentIndex;

    console.log(`📊 Tweet status:`);
    console.log(`➡️ Next tweet index: ${currentIndex}`);
    console.log(`✅ Total posts: ${totalPosts}`);
    console.log(
      `📝 Posts left in this cycle: ${remaining < 0 ? 0 : remaining}`
    );
  } else {
    console.log(`
Usage:
  node manage.js add "tweet1" "tweet2" ...
  node manage.js list
  node manage.js delete <id>
  node manage.js status
    `);
  }

  await db.end();
})();
