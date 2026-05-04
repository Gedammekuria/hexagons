import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authMiddleware, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';
import { logAdminAction } from '../utils/logger.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const db = getDb();
    const result = await db.query('SELECT * FROM admins WHERE email = $1', [email.trim().toLowerCase()]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = bcrypt.compareSync(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (admin.password_expiry && new Date(admin.password_expiry) < new Date()) {
      return res.status(401).json({ message: 'This temporary password has expired (valid for 10 minutes). Please contact your administrator.' });
    }

    const mainAdminEmail = process.env.ADMIN_EMAIL || 'gedu0194@gmail.com';
    const isMainAdmin = admin.email.toLowerCase() === mainAdminEmail.toLowerCase();

    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        version: admin.token_version, 
        role: admin.role || 'admin',
        mustChange: !!admin.must_change_password,
        isSuper: !!admin.is_super
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log the successful login (non-blocking)
    const meta = { 
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, 
      ua: req.headers['user-agent'] 
    };
    logAdminAction(admin.id, admin.email, 'Login', meta).catch(err => console.error('[Log Error]', err.message));

    res.json({
      token,
      admin: { 
        id: admin.id, 
        email: admin.email, 
        mustChangePassword: !!admin.must_change_password,
        isSuper: isMainAdmin,
        role: admin.role || 'admin'
      },
      expiresIn: 28800 // 8 hours in seconds
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/verify — check if token is still valid
router.post('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh data from DB to ensure isSuper and other flags are current
    const db = getDb();
    const result = await db.query('SELECT id, email, role, is_super, must_change_password FROM admins WHERE id = $1', [decoded.id]);
    const admin = result.rows[0];

    if (!admin) return res.status(403).json({ valid: false });

    const mainAdminEmail = process.env.ADMIN_EMAIL || 'gedu0194@gmail.com';
    const isMainAdmin = admin.email.toLowerCase() === mainAdminEmail.toLowerCase();

    res.json({ 
      valid: true, 
      admin: { 
        id: admin.id, 
        email: admin.email,
        role: admin.role || 'admin',
        isSuper: !!admin.is_super,
        mustChangePassword: !!admin.must_change_password
      } 
    });
  } catch (err) {
    res.status(403).json({ valid: false });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    const db = getDb();
    const result = await db.query('SELECT * FROM admins WHERE id = $1', [req.user.id]);
    const admin = result.rows[0];

    if (!admin || !bcrypt.compareSync(currentPassword, admin.password)) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE admins SET password = $1, must_change_password = FALSE, password_expiry = NULL WHERE id = $2', [hashed, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const db = getDb();
    const result = await db.query('SELECT id FROM admins WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rowCount === 0) return res.json({ message: 'If that email exists in our system, a PIN has been sent.' });

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await db.query('UPDATE admins SET reset_pin = $1, reset_expiry = $2 WHERE email = $3', [pin, expiry, email.trim().toLowerCase()]);
    
    await sendPasswordResetEmail(email, pin).catch(err => console.error('[Reset Email Error]', err.message));

    res.json({ message: 'If that email exists in our system, a PIN has been sent.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/verify-pin
router.post('/verify-pin', async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) return res.status(400).json({ message: 'Email and PIN are required.' });

    const db = getDb();
    const result = await db.query('SELECT id FROM admins WHERE email = $1 AND reset_pin = $2 AND reset_expiry > NOW()', [email.trim().toLowerCase(), pin]);
    
    if (result.rowCount === 0) return res.status(401).json({ message: 'Invalid or expired PIN.' });

    res.json({ message: 'PIN verified successfully.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;
    if (!email || !pin || !newPassword) return res.status(400).json({ message: 'Email, PIN, and new password are required.' });

    const db = getDb();
    const result = await db.query('SELECT * FROM admins WHERE email = $1 AND reset_pin = $2 AND reset_expiry > NOW()', [email.trim().toLowerCase(), pin]);
    
    if (result.rowCount === 0) return res.status(401).json({ message: 'Invalid or expired PIN.' });

    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE admins SET password = $1, reset_pin = NULL, reset_expiry = NULL, must_change_password = FALSE, password_expiry = NULL WHERE email = $2', [hashed, email.trim().toLowerCase()]);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/logs
router.get('/logs', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/terminate
router.post('/terminate', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const db = getDb();
    // Increment the token_version for the user to invalidate all their existing tokens
    await db.query('UPDATE admins SET token_version = COALESCE(token_version, 0) + 1 WHERE email = $1', [email.trim().toLowerCase()]);
    
    // Also log this action
    const meta = { 
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, 
      ua: req.headers['user-agent'] 
    };
    await logAdminAction(req.user.id, req.user.email, `Terminated sessions for ${email}`, meta).catch(() => {});

    res.json({ message: 'User sessions terminated successfully.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
