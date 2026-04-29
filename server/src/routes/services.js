import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/services - public listing
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const isAdmin = req.headers['authorization'];
    
    let query = 'SELECT * FROM services';
    const conds = [];
    
    if (!isAdmin) {
      conds.push("active = 1");
    }
    
    if (conds.length > 0) {
      query += ' WHERE ' + conds.join(' AND ');
    }
    
    query += ' ORDER BY sort_order ASC, created_at DESC';
    
    const result = await db.query(query);
    const services = result.rows.map(s => ({
      ...s,
      features: JSON.parse(s.features || '[]')
    }));
    
    res.json(services);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/services/:slug - single service
router.get('/:slug', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM services WHERE slug = $1', [req.params.slug]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Service not found' });
    
    const service = result.rows[0];
    service.features = JSON.parse(service.features || '[]');
    
    res.json(service);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Protected routes
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { slug, title, tagline, description, icon_name, color, image, features, sort_order, active } = req.body;
    const db = getDb();
    const result = await db.query(
      `INSERT INTO services (slug, title, tagline, description, icon_name, color, image, features, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [slug, title, tagline, description, icon_name, color, image, JSON.stringify(features || []), sort_order || 0, active !== undefined ? active : 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { slug, title, tagline, description, icon_name, color, image, features, sort_order, active } = req.body;
    const db = getDb();
    const result = await db.query(
      `UPDATE services 
       SET slug = $1, title = $2, tagline = $3, description = $4, icon_name = $5, color = $6, image = $7, features = $8, sort_order = $9, active = $10
       WHERE id = $11 RETURNING *`,
      [slug, title, tagline, description, icon_name, color, image, JSON.stringify(features || []), sort_order || 0, active !== undefined ? active : 1, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Service not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    await db.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
