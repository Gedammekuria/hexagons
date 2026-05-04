import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { logAdminAction } from '../utils/logger.js';

const router = Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/projects/categories
router.get('/categories', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT DISTINCT category FROM projects');
    res.json(result.rows.map(row => row.category));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/projects (admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, category, description, image, tags, link, show_link, featured } = req.body;
    if (!title || !category) return res.status(400).json({ message: 'Title and category are required.' });
    
    const db = getDb();
    const result = await db.query(`
      INSERT INTO projects (title, category, description, image, tags, link, show_link, featured, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING id
    `, [title, category, description || '', image || '', JSON.stringify(tags || []), link || '', show_link ? 1 : 0, featured ? 1 : 0, req.user.email]);
    
    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Created project: ${title}`, meta).catch(() => {});
    
    res.status(201).json({ id: result.rows[0].id, message: 'Project created.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/projects/:id (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, category, description, image, tags, link, show_link, featured } = req.body;
    const db = getDb();
    const result = await db.query(`
      UPDATE projects SET title=$1, category=$2, description=$3, image=$4, tags=$5, link=$6, show_link=$7, featured=$8, updated_by=$9, updated_at=CURRENT_TIMESTAMP
      WHERE id=$10
    `, [title, category, description || '', image || '', JSON.stringify(tags || []), link || '', show_link ? 1 : 0, featured ? 1 : 0, req.user.email, req.params.id]);
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Project not found.' });

    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Updated project (ID: ${req.params.id}): ${title}`, meta).catch(() => {});

    res.json({ message: 'Project updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/projects/:id (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Project not found.' });
    
    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Deleted project (ID: ${req.params.id})`, meta).catch(() => {});

    res.json({ message: 'Project deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
