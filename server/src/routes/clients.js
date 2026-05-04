import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/clients — public
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM clients ORDER BY id ASC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/clients — create (admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, logo, url, show_on_page } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const db = getDb();
    const result = await db.query(
      'INSERT INTO clients (name, logo, url, show_on_page, updated_by, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id',
      [name, logo || '', url || '', show_on_page !== false ? 1 : 0, req.user.email]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Client added.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/clients/:id — update (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, logo, url, show_on_page } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const db = getDb();
    const result = await db.query(
      'UPDATE clients SET name=$1, logo=$2, url=$3, show_on_page=$4, updated_by=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6',
      [name, logo || '', url || '', show_on_page !== false ? 1 : 0, req.user.email, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Client not found.' });
    res.json({ message: 'Client updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/clients/:id — delete (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Client not found.' });
    res.json({ message: 'Client deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
