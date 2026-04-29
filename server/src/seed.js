import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

async function seed() {
  const db = getDb();
  
  const email    = process.env.ADMIN_EMAIL    || 'admin@hexagonview.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@Hexagon2024';

  try {
    const result = await db.query('SELECT id FROM admins WHERE email = $1', [email]);
    const existing = result.rows[0];

    if (existing) {
      console.log(`[Seed] Admin already exists: ${email}`);
    } else {
      const hash = bcrypt.hashSync(password, 12);
      await db.query('INSERT INTO admins (email, password) VALUES ($1, $2)', [email, hash]);
      console.log(`[Seed] Admin created: ${email}`);
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
