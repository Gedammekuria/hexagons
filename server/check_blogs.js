import { getDb } from './src/db.js';
import 'dotenv/config';

async function check() {
  const db = getDb();
  const res = await db.query('SELECT id, title, updated_by, updated_at FROM blog_posts LIMIT 5');
  console.log('Recent Blog Posts:');
  console.table(res.rows);
  process.exit(0);
}

check();
