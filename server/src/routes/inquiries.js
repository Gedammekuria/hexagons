import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendInquiryNotification, sendClientConfirmation } from '../utils/mailer.js';

const router = Router();

// POST /api/inquiries — public, submit a new inquiry from the contact form
router.post('/', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      company, location, service, subServices, message
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !service) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const db = getDb();
    const subServicesJson = Array.isArray(subServices) ? JSON.stringify(subServices) : JSON.stringify([]);

    const result = await db.query(`
      INSERT INTO inquiries 
        (first_name, last_name, email, phone, company, location, service, sub_services, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      firstName.trim(), lastName.trim(), email.trim().toLowerCase(),
      phone.trim(), company?.trim() || null, location?.trim() || null,
      service.trim(), subServicesJson, message?.trim() || null
    ]);

    const inquiry = result.rows[0];

    // Send emails asynchronously
    Promise.all([
      sendInquiryNotification(inquiry),
      sendClientConfirmation(inquiry),
    ]).catch(err => console.error('[Email Error]', err.message));

    res.status(201).json({
      message: 'Your inquiry has been received. We will get back to you shortly.',
      id: inquiry.id,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/inquiries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { status, search, date, page = 1, limit = 20 } = req.query;

    let sql = "SELECT * FROM inquiries WHERE status != 'deleted'";
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (date) {
      conditions.push(`DATE(created_at) = $${params.length + 1}`);
      params.push(date);
    }

    if (search) {
      const pIndex = params.length;
      conditions.push(`(
        first_name ILIKE $${pIndex + 1} OR last_name ILIKE $${pIndex + 1} OR 
        email ILIKE $${pIndex + 1} OR phone ILIKE $${pIndex + 1} OR 
        service ILIKE $${pIndex + 1} OR company ILIKE $${pIndex + 1}
      )`);
      params.push(`%${search}%`);
    }

    if (conditions.length) sql += ' AND ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const countSql = `SELECT COUNT(*) FROM (${sql}) as total_count`;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await db.query(sql, params);
    const inquiries = result.rows.map(row => ({
      ...row,
      sub_services: row.sub_services ? JSON.parse(row.sub_services) : [],
    }));

    res.json({
      inquiries,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/inquiries/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const totalRes    = await db.query("SELECT COUNT(*) FROM inquiries WHERE status != 'deleted'");
    const newRes      = await db.query("SELECT COUNT(*) FROM inquiries WHERE status = 'new'");
    const acceptedRes = await db.query("SELECT COUNT(*) FROM inquiries WHERE status = 'accepted'");
    const progressRes = await db.query("SELECT COUNT(*) FROM inquiries WHERE status = 'in progress'");
    const finishedRes = await db.query("SELECT COUNT(*) FROM inquiries WHERE status = 'finished'");
    const workingRes  = await db.query("SELECT COUNT(*) FROM inquiries WHERE status = 'working'");
    const deletedRes  = await db.query("SELECT COUNT(*) FROM inquiries WHERE status = 'deleted'");

    const byService = (await db.query(`
      SELECT service, COUNT(*) as count 
      FROM inquiries WHERE status != 'deleted' GROUP BY service ORDER BY count DESC LIMIT 5
    `)).rows;

    const last7 = (await db.query(`
      SELECT DATE(created_at) as day, COUNT(*) as count
      FROM inquiries
      WHERE created_at >= NOW() - INTERVAL '6 days' AND status != 'deleted'
      GROUP BY day ORDER BY day ASC
    `)).rows;

    res.json({ 
      total: parseInt(totalRes.rows[0].count), 
      new: parseInt(newRes.rows[0].count),
      accepted: parseInt(acceptedRes.rows[0].count), 
      progress: parseInt(progressRes.rows[0].count), 
      finished: parseInt(finishedRes.rows[0].count), 
      working: parseInt(workingRes.rows[0].count), 
      deleted: parseInt(deletedRes.rows[0].count),
      byService, last7 
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/inquiries/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
    const inquiry = result.rows[0];

    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });

    res.json({ ...inquiry, sub_services: inquiry.sub_services ? JSON.parse(inquiry.sub_services) : [] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /api/inquiries/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'accepted', 'in progress', 'finished', 'working', 'archived', 'deleted'];
    if (!allowed.includes(status)) return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });

    const db = getDb();
    let query = 'UPDATE inquiries SET status = $1';
    const params = [status, req.params.id];
    
    if (status === 'finished') {
      query += ', finished_at = NOW()';
    } else {
      query += ', finished_at = NULL';
    }
    
    query += ' WHERE id = $2';
    
    const result = await db.query(query, params);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Inquiry not found.' });
    res.json({ message: 'Status updated.', status });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/inquiries/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query("UPDATE inquiries SET status = 'deleted' WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Inquiry not found.' });
    res.json({ message: 'Inquiry moved to trash.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
