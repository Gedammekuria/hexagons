import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/content/:page/:section
router.get('/:page/:section', async (req, res) => {
  try {
    const { page, section } = req.params;
    const db = getDb();
    const result = await db.query('SELECT data FROM content WHERE page = $1 AND section = $2', [page, section]);
    const row = result.rows[0];
    res.json({ data: row ? JSON.parse(row.data) : null });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/content/all
router.get('/all', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT page, section, data FROM content');
    const content = {};
    result.rows.forEach(r => {
      if (!content[r.page]) content[r.page] = {};
      content[r.page][r.section] = JSON.parse(r.data);
    });
    res.json(content);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/content
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { page, section, data } = req.body;
    if (!page || !section || !data) return res.status(400).json({ message: 'Page, section and data are required.' });
    
    const db = getDb();
    await db.query(`
      INSERT INTO content (page, section, data, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT(page, section) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at
    `, [page, section, JSON.stringify(data)]);
    
    res.json({ message: 'Content updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
