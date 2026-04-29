import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/team — public
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query("SELECT * FROM team_members WHERE active = 1 AND status = 'official' ORDER BY sort_order ASC, id ASC");
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/team/all — admin
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/team — create (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, role, bio, image, email, linkedin, sort_order, active, status } = req.body;
    if (!name || !role) return res.status(400).json({ message: 'Name and role are required.' });
    const db = getDb();
    const result = await db.query(`
      INSERT INTO team_members (name, role, bio, image, email, linkedin, sort_order, active, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [name, role, bio || '', image || '', email || '', linkedin || '', sort_order || 0, active !== false ? 1 : 0, status || 'official']);
    res.status(201).json({ id: result.rows[0].id, message: 'Team member created.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/team/:id — update (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, role, bio, image, email, linkedin, sort_order, active, status } = req.body;
    const db = getDb();
    const result = await db.query(`
      UPDATE team_members SET name=$1, role=$2, bio=$3, image=$4, email=$5, linkedin=$6, sort_order=$7, active=$8, status=$9
      WHERE id=$10
    `, [name, role, bio || '', image || '', email || '', linkedin || '', sort_order || 0, active !== false ? 1 : 0, status || 'official', req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Member not found.' });
    res.json({ message: 'Member updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/team/:id — delete (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Member not found.' });
    res.json({ message: 'Member deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
