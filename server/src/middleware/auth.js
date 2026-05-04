import jwt from 'jsonwebtoken';

import { getDb } from '../db.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token version matches the current DB version
    const db = getDb();
    const result = await db.query('SELECT token_version FROM admins WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'User no longer exists.' });
    }

    const currentVersion = result.rows[0].token_version || 0;
    const tokenVersion = decoded.version || 0;

    if (currentVersion !== tokenVersion) {
      return res.status(403).json({ message: 'Session has been terminated.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req, res, next) {
  const allowedRoles = ['admin', 'superadmin'];
  if (req.user && (allowedRoles.includes(req.user.role) || req.user.isSuper)) {
    next();
  } else {
    return res.status(403).json({ message: 'Permission denied: Administrator role required.' });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user && req.user.isSuper) {
    next();
  } else {
    return res.status(403).json({ message: 'Permission denied: Main Administrator access required.' });
  }
}
