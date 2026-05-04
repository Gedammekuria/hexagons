import { Router } from 'express';
import { getDb } from '../db.js';
import bcrypt from 'bcryptjs';
import { authMiddleware, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { sendTemporaryPasswordEmail } from '../utils/mailer.js';
import crypto from 'crypto';

const router = Router();
const genPass = () => crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. A1B2C3D4
const getExpiry = () => new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

// GET /api/team — public
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query("SELECT * FROM team_members WHERE active = 1 AND status = 'official' ORDER BY sort_order ASC, id ASC");
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/team/all — admin
router.get('/all', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT t.*, CASE WHEN a.id IS NOT NULL THEN true ELSE false END as is_admin, a.role as admin_role
      FROM team_members t 
      LEFT JOIN admins a ON LOWER(t.email) = LOWER(a.email) AND t.email != '' 
      ORDER BY t.sort_order ASC, t.id ASC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/team — create (admin)
router.post('/', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { name, role, bio, image, email, linkedin, sort_order, active, status, grant_admin, admin_role } = req.body;
    if (!name || !role) return res.status(400).json({ message: 'Name and role are required.' });
    if (grant_admin && !email) return res.status(400).json({ message: 'An email is required to grant admin access.' });
    
    const db = getDb();
    const result = await db.query(`
      INSERT INTO team_members (name, role, bio, image, email, linkedin, sort_order, active, status, updated_by, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING id
    `, [name, role, bio || '', image || '', email || '', linkedin || '', sort_order || 0, active !== false ? 1 : 0, status || 'official', req.user.email]);
    
    if (email && grant_admin) {
      const tempPass = genPass();
      const hashed = bcrypt.hashSync(tempPass, 10);
      const finalRole = admin_role === 'viewer' ? 'viewer' : 'admin';
      
      await db.query(`
        INSERT INTO admins (email, password, role, must_change_password, password_expiry) 
        VALUES ($1, $2, $3, TRUE, $4) 
        ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, must_change_password = TRUE, password_expiry = EXCLUDED.password_expiry
      `, [email.trim().toLowerCase(), hashed, finalRole, getExpiry()]);
      
      await sendTemporaryPasswordEmail(email.trim().toLowerCase(), name, tempPass).catch(err => console.error('[Email Error]', err.message));
    }
    
    res.status(201).json({ id: result.rows[0].id, message: 'Team member created and credentials sent.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/team/:id — update (admin)
router.put('/:id', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { name, role, bio, image, email, linkedin, sort_order, active, status, grant_admin, admin_role, reset_password } = req.body;
    if (grant_admin && !email) return res.status(400).json({ message: 'An email is required to grant admin access.' });

    const db = getDb();
    const oldRes = await db.query('SELECT email FROM team_members WHERE id = $1', [req.params.id]);
    const oldEmail = oldRes.rows[0]?.email;
    
    await db.query(`
      UPDATE team_members SET name=$1, role=$2, bio=$3, image=$4, email=$5, linkedin=$6, sort_order=$7, active=$8, status=$9, updated_by=$10, updated_at=CURRENT_TIMESTAMP
      WHERE id=$11
    `, [name, role, bio || '', image || '', email || '', linkedin || '', sort_order || 0, active !== false ? 1 : 0, status || 'official', req.user.email, req.params.id]);
    
    if (oldEmail && oldEmail !== email && oldEmail.trim() !== '') {
      await db.query(`DELETE FROM admins WHERE email = $1`, [oldEmail.trim().toLowerCase()]);
    }
    
    if (email) {
      if (grant_admin) {
        const finalRole = admin_role === 'viewer' ? 'viewer' : 'admin';
        
        // If it's a new admin grant OR a manual reset request
        if (reset_password || !oldEmail) {
          const tempPass = genPass();
          const hashed = bcrypt.hashSync(tempPass, 10);
          
          await db.query(`
            INSERT INTO admins (email, password, role, must_change_password, password_expiry) 
            VALUES ($1, $2, $3, TRUE, $4) 
            ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, must_change_password = TRUE, password_expiry = EXCLUDED.password_expiry
          `, [email.trim().toLowerCase(), hashed, finalRole, getExpiry()]);
          
          await sendTemporaryPasswordEmail(email.trim().toLowerCase(), name, tempPass).catch(err => console.error('[Email Error]', err.message));
        } else {
          // Just update role for existing admin
          await db.query(`UPDATE admins SET role = $1 WHERE email = $2`, [finalRole, email.trim().toLowerCase()]);
        }
      } else {
        await db.query(`DELETE FROM admins WHERE email = $1`, [email.trim().toLowerCase()]);
      }
    }
    
    res.json({ message: 'Member updated.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/team/:id — delete (admin)
router.delete('/:id', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDb();
    const oldRes = await db.query('SELECT email FROM team_members WHERE id = $1', [req.params.id]);
    const result = await db.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Member not found.' });
    
    if (oldRes.rows.length > 0 && oldRes.rows[0].email) {
      // Don't auto-delete admin if they delete team member? 
      // Actually yes, if it's the same system, it's safer to leave admins or delete them?
      // Let's not delete admins automatically on team member deletion to prevent lockout.
    }
    
    res.json({ message: 'Member deleted.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
