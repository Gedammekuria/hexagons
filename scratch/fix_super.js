import { getDb, initDb } from '../server/src/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

async function fix() {
  await initDb();
  const db = getDb();
  await db.query('UPDATE admins SET is_super = TRUE WHERE email = $1', ['gedam@hexagon.com']);
  console.log('Fixed gedam@hexagon.com to Super Admin');
  process.exit(0);
}

fix();
