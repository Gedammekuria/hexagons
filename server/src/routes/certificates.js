import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { logAdminAction } from '../utils/logger.js';

const router = Router();

// GET /api/certificates — public
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const isAdmin = req.headers['authorization'];
    
    let sql = 'SELECT * FROM certificates';
    if (!isAdmin) {
      sql += ' WHERE active = 1';
    }
    sql += ' ORDER BY id DESC';
    
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/certificates — create (admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, image, description, sort_order, active } = req.body;
    if (!title || !image) return res.status(400).json({ message: 'Title and image are required.' });
    
    const db = getDb();
    const result = await db.query(`
      INSERT INTO certificates (title, image, description, sort_order, active, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id
    `, [title, image, description || '', sort_order || 0, active !== false ? 1 : 0, req.user.email]);
    
    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Added certificate: ${title}`, meta).catch(() => {});
    
    res.status(201).json({ id: result.rows[0].id, message: 'Certificate added.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/certificates/:id — update (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, image, description, sort_order, active } = req.body;
    if (!title || !image) return res.status(400).json({ message: 'Title and image are required.' });
    
    const db = getDb();
    const result = await db.query(`
      UPDATE certificates SET title=$1, image=$2, description=$3, sort_order=$4, active=$5, updated_by=$6, updated_at=CURRENT_TIMESTAMP
      WHERE id=$7
    `, [title, image, description || '', sort_order || 0, active !== false ? 1 : 0, req.user.email, req.params.id]);
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Certificate not found.' });

    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Updated certificate (ID: ${req.params.id}): ${title}`, meta).catch(() => {});

    res.json({ message: 'Certificate updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/certificates/:id — delete (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM certificates WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Certificate not found.' });
    
    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Deleted certificate (ID: ${req.params.id})`, meta).catch(() => {});

    res.json({ message: 'Certificate deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
