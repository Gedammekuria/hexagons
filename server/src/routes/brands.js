import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/brands — public
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM brands ORDER BY id ASC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/brands — create (admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, logo, show_on_page } = req.body;
    if (!name || !logo) return res.status(400).json({ message: 'Name and logo are required.' });
    const db = getDb();
    const result = await db.query(
      'INSERT INTO brands (name, logo, show_on_page, updated_by, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id',
      [name, logo, show_on_page !== false ? 1 : 0, req.user.email]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Brand added.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/brands/:id — update (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, logo, show_on_page } = req.body;
    if (!name || !logo) return res.status(400).json({ message: 'Name and logo are required.' });
    const db = getDb();
    const result = await db.query(
      'UPDATE brands SET name=$1, logo=$2, show_on_page=$3, updated_by=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5',
      [name, logo, show_on_page !== false ? 1 : 0, req.user.email, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Brand not found.' });
    res.json({ message: 'Brand updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/brands/:id — delete (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM brands WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Brand not found.' });
    res.json({ message: 'Brand deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
