import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

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
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, category, description, image, tags, link, show_link, featured } = req.body;
    if (!title || !category) return res.status(400).json({ message: 'Title and category are required.' });
    
    const db = getDb();
    const result = await db.query(`
      INSERT INTO projects (title, category, description, image, tags, link, show_link, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [title, category, description || '', image || '', JSON.stringify(tags || []), link || '', show_link ? 1 : 0, featured ? 1 : 0]);
    
    res.status(201).json({ id: result.rows[0].id, message: 'Project created.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/projects/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, category, description, image, tags, link, show_link, featured } = req.body;
    const db = getDb();
    const result = await db.query(`
      UPDATE projects SET title=$1, category=$2, description=$3, image=$4, tags=$5, link=$6, show_link=$7, featured=$8
      WHERE id=$9
    `, [title, category, description || '', image || '', JSON.stringify(tags || []), link || '', show_link ? 1 : 0, featured ? 1 : 0, req.params.id]);
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Project not found.' });
    res.json({ message: 'Project updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/projects/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
