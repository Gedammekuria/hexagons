import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of result.rows) settings[row.key] = row.value;
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(settings);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    for (const [k, v] of Object.entries(req.body)) {
      if (v !== undefined && v !== null) {
        await db.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
        `, [k, String(v)]);
      }
    }
    const result = await db.query('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of result.rows) settings[row.key] = row.value;
    res.json({ message: 'Settings updated.', settings });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
