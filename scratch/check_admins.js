import { getDb, initDb } from '../server/src/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

async function check() {
  await initDb();
  const db = getDb();
  const res = await db.query('SELECT email, role, is_super FROM admins');
  console.log('Admins in DB:', JSON.stringify(res.rows, null, 2));
  process.exit(0);
}

check();
