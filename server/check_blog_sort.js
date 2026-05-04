import { getDb } from './src/db.js';
import 'dotenv/config';

async function checkBlogSort() {
  const db = getDb();
  try {
    const res = await db.query('SELECT id, title, created_at, updated_at FROM blog_posts ORDER BY created_at DESC LIMIT 5');
    console.log('Recent blogs:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkBlogSort();
