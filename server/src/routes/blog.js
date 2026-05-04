import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { logAdminAction } from '../utils/logger.js';

const router = Router();

// GET /api/blog — public listing
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { status = 'published', category, page = 1, limit = 10 } = req.query;
    const isAdmin = req.headers['authorization'];

    let sql = 'SELECT * FROM blog_posts';
    const params = [];
    const conds = [];

    if (!isAdmin) { conds.push("status = 'published'"); }
    else if (status !== 'all') { 
      conds.push(`status = $${params.length + 1}`); 
      params.push(status); 
    }

    if (category) { 
      conds.push(`category = $${params.length + 1}`); 
      params.push(category); 
    }
    
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const countRes = await db.query(`SELECT COUNT(*) FROM (${sql}) as total_count`, params);
    const total = parseInt(countRes.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await db.query(sql, params);
    const posts = result.rows.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') }));
    
    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/blog/:slug — public single post
router.get('/:slug', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM blog_posts WHERE slug = $1', [req.params.slug]);
    const post = result.rows[0];
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ ...post, tags: JSON.parse(post.tags || '[]') });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/blog — create post (admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, body, image, category, tags, status, author } = req.body;
    if (!title || !slug) return res.status(400).json({ message: 'Title and slug are required.' });
    const db = getDb();
    const result = await db.query(`
      INSERT INTO blog_posts (title, slug, excerpt, body, image, category, tags, status, author, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING id
    `, [title, slug, excerpt || '', body || '', image || '', category || 'General', JSON.stringify(tags || []), status || 'draft', author || 'Hexagon Team', req.user.email]);
    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Created blog post: ${title}`, meta).catch(() => {});
    
    res.status(201).json({ id: result.rows[0].id, message: 'Post created.' });
  } catch (e) {
    if (e.message.includes('unique constraint') || e.message.includes('duplicate key')) return res.status(409).json({ message: 'Slug already exists.' });
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/blog/:id — update post (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, body, image, category, tags, status, author } = req.body;
    const db = getDb();
    const result = await db.query(`
      UPDATE blog_posts SET title=$1, slug=$2, excerpt=$3, body=$4, image=$5, category=$6, tags=$7, status=$8, author=$9, updated_by=$10, updated_at=CURRENT_TIMESTAMP
      WHERE id=$11
    `, [title, slug, excerpt || '', body || '', image || '', category || 'General', JSON.stringify(tags || []), status || 'draft', author || 'Hexagon Team', req.user.email, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Post not found.' });

    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Updated blog post (ID: ${req.params.id}): ${title}`, meta).catch(() => {});

    res.json({ message: 'Post updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/blog/:id — delete post (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Post not found.' });
    
    const meta = { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, ua: req.headers['user-agent'] };
    logAdminAction(req.user.id, req.user.email, `Deleted blog post (ID: ${req.params.id})`, meta).catch(() => {});

    res.json({ message: 'Post deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
