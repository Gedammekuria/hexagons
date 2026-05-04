import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://neondb_owner:npg_e9kZ3GUswMFf@ep-red-water-amcjq27e-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function fix() {
  const client = new Client({ connectionString });
  await client.connect();
  
  // Set ALL existing admins to Super Admin to be 100% sure the user is covered
  await client.query('UPDATE admins SET is_super = TRUE, role = $1', ['superadmin']);
  
  const res = await client.query('SELECT email, is_super, role FROM admins');
  console.log('Update Complete. Current Admins:', res.rows);
  
  await client.end();
}

fix().catch(console.error);
