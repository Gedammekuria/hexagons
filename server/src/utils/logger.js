import { getDb } from '../db.js';

/**
 * Log an administrative action to the database.
 */
export async function logAdminAction(adminId, email, action, meta = {}) {
  try {
    const db = getDb();
    const ip = meta.ip || 'Unknown';
    const ua = meta.ua || 'Unknown';
    
    let location = 'Local/Unknown';


    await db.query(`
      INSERT INTO admin_logs (admin_id, email, action, ip_address, user_agent, location)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [adminId, email, action, ip, ua, location]);
    
    console.log(`[Log] ${email} performed ${action} from ${location} (${ip})`);
  } catch (err) {
    console.error('[Logging Error]', err.message);
  }
}
