import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

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

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email },
      expiresIn: 28800 // 8 hours in seconds
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/verify — check if token is still valid
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, admin: { id: decoded.id, email: decoded.email } });
  } catch {
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
    await db.query('UPDATE admins SET password = $1 WHERE id = $2', [hashed, req.user.id]);

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

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;
    if (!email || !pin || !newPassword) return res.status(400).json({ message: 'Email, PIN, and new password are required.' });

    const db = getDb();
    const result = await db.query('SELECT * FROM admins WHERE email = $1 AND reset_pin = $2 AND reset_expiry > NOW()', [email.trim().toLowerCase(), pin]);
    
    if (result.rowCount === 0) return res.status(401).json({ message: 'Invalid or expired PIN.' });

    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE admins SET password = $1, reset_pin = NULL, reset_expiry = NULL WHERE email = $2', [hashed, email.trim().toLowerCase()]);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
