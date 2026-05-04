import { getDb } from './src/db.js';
import 'dotenv/config';

async function checkColumns() {
  const db = getDb();
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inquiries'
    `);
    console.log('Columns in inquiries table:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error checking columns:', err);
    process.exit(1);
  }
}

checkColumns();
