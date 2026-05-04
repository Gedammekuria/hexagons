import { getDb } from './src/db.js';
import 'dotenv/config';

async function check() {
  const db = getDb();
  const res = await db.query('SELECT email, role, is_super FROM admins');
  console.log('Admins in DB:');
  console.table(res.rows);
  process.exit(0);
}

check();
