import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function testConnection() {
  const url = process.env.DATABASE_URL;
  console.log('Testing connection to:', url ? 'URL provided' : 'No URL found');
  
  if (!url) {
    console.error('Error: DATABASE_URL is missing in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting...');
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log('✅ Connection Successful!');
    console.log('Time on server:', res.rows[0].now);
    console.log('Database name:', res.rows[0].db);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('\nTables found in database:', tables.rows.map(t => t.table_name).join(', ') || 'None');
    
  } catch (err) {
    console.error('❌ Connection Failed!');
    console.error('Error details:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
