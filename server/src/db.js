import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Use individual env vars or a single connection string
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'hexagon',
      port: process.env.PGPORT || 5432,
    });

export const getDb = () => pool;

export async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id           SERIAL PRIMARY KEY,
        email        TEXT    UNIQUE NOT NULL,
        password     TEXT    NOT NULL,
        reset_pin    TEXT,
        reset_expiry TIMESTAMP,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure columns exist if table was already there
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_pin TEXT;
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_expiry TIMESTAMP;

      CREATE TABLE IF NOT EXISTS inquiries (
        id            SERIAL PRIMARY KEY,
        first_name    TEXT NOT NULL,
        last_name     TEXT NOT NULL,
        email         TEXT NOT NULL,
        phone         TEXT NOT NULL,
        company       TEXT,
        location      TEXT,
        service       TEXT NOT NULL,
        sub_services  TEXT,
        message       TEXT,
        status        TEXT DEFAULT 'new',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at   TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS content (
        id         SERIAL PRIMARY KEY,
        page       TEXT NOT NULL,
        section    TEXT NOT NULL,
        data       TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(page, section)
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        slug       TEXT UNIQUE NOT NULL,
        excerpt    TEXT,
        body       TEXT,
        image      TEXT,
        category   TEXT DEFAULT 'General',
        tags       TEXT DEFAULT '[]',
        status     TEXT DEFAULT 'draft',
        author     TEXT DEFAULT 'Hexagon Team',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        role       TEXT NOT NULL,
        bio        TEXT,
        image      TEXT,
        email      TEXT,
        linkedin   TEXT,
        sort_order INTEGER DEFAULT 0,
        active     INTEGER DEFAULT 1,
        status     TEXT DEFAULT 'official',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id          SERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        category    TEXT NOT NULL,
        description TEXT,
        image       TEXT,
        tags        TEXT DEFAULT '[]',
        link        TEXT,
        show_link   INTEGER DEFAULT 1,
        featured    INTEGER DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS brands (
        id           SERIAL PRIMARY KEY,
        name         TEXT NOT NULL,
        logo         TEXT NOT NULL,
        show_on_page INTEGER DEFAULT 1,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clients (
        id           SERIAL PRIMARY KEY,
        name         TEXT NOT NULL,
        logo         TEXT,
        url          TEXT,
        show_on_page INTEGER DEFAULT 1,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default Admin if empty
    const adminCheck = await client.query("SELECT COUNT(*) FROM admins");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      const email = process.env.ADMIN_EMAIL || 'admin@hexagonview.com';
      const password = process.env.ADMIN_PASSWORD || 'Admin@Hexagon2024';
      const hashed = bcrypt.hashSync(password, 10);
      await client.query("INSERT INTO admins (email, password) VALUES ($1, $2)", [email, hashed]);
      console.log('✅ Default admin account created:', email);
    }

    // Seed default site settings if empty
    const countRes = await client.query("SELECT COUNT(*) FROM site_settings");
    if (parseInt(countRes.rows[0].count) === 0) {
      const defaults = {
        company_name:    'Hexagon Computer Systems',
        company_tagline: "Ethiopia's Premier IT Solutions Provider",
        phone:           '+251-944161572',
        email:           'info@hexagonview.com',
        address:         '22 Mazoriya, MAF Building, 4th FL, #402, Addis Ababa, Ethiopia',
        po_box:          'P.O. Box: 15,444, Addis Ababa, Ethiopia',
        facebook:        '',
        twitter:         '',
        linkedin:        '',
        instagram:       '',
        telegram:        '',
        whatsapp:        '+251944161572',
        working_hours:   'Mon – Fri: 8:00 AM – 6:00 PM',
        founded_year:    '2009',
        experience_years:'15+',
        software_projects:'250+',
        network_projects: '180+',
        employees:        '50+',
      };
      for (const [k, v] of Object.entries(defaults)) {
        await client.query("INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [k, v]);
      }
    }

    // Seed Brands if empty
    const brandCount = await client.query("SELECT COUNT(*) FROM brands");
    if (parseInt(brandCount.rows[0].count) === 0) {
      const defaultBrands = [
        { name: "Cisco", logo: "/images/logos/cisco.svg" },
        { name: "Dell", logo: "/images/logos/dell.svg" },
        { name: "HP", logo: "/images/logos/hp.svg" },
        { name: "Kaspersky", logo: "/images/logos/kaspersky.svg" },
        { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
        { name: "Hikvision", logo: "/images/logos/hikvision.svg" },
        { name: "Dahua", logo: "/images/logos/dahua.svg" },
        { name: "EZVIZ", logo: "/images/logos/ezviz.png" },
      ];
      for (const b of defaultBrands) {
        await client.query("INSERT INTO brands (name, logo) VALUES ($1, $2)", [b.name, b.logo]);
      }
    }

    // Seed Clients if empty
    const clientCount = await client.query("SELECT COUNT(*) FROM clients");
    if (parseInt(clientCount.rows[0].count) === 0) {
      const defaultClients = [
        { name: "Spanish Cooperation", url: "https://www.cooperacionespanola.es/", logo: "/images/clients/aecid.png" },
        { name: "Yuluchelyano Trading PLC", url: "https://yuluchelyano.com/", logo: "/images/clients/yuluchelyano.png" },
        { name: "OCP Ethiopia", url: "https://www.ocpafrica.com/", logo: "/images/clients/ocp.svg" },
        { name: "Amibara", url: "#", logo: "/images/clients/amibara.png" },
        { name: "DebreDamo Hotel", url: "#", logo: "/images/clients/debredamo.png" },
        { name: "Emirates", url: "https://www.emirates.com/", logo: "/images/clients/emirates.svg" },
      ];
      for (const c of defaultClients) {
        await client.query("INSERT INTO clients (name, url, logo) VALUES ($1, $2, $3)", [c.name, c.url, c.logo]);
      }
    }

    // Seed Team Members if empty
    const teamCount = await client.query("SELECT COUNT(*) FROM team_members");
    if (parseInt(teamCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO team_members (name, role, bio, image, active) 
        VALUES ($1, $2, $3, $4, $5)`, 
        [
          "Ephrem Abreha", 
          "Founder", 
          "Ephrem is the visionary behind Hexagon Computer Systems, with over 15 years of industry leadership.", 
          "/images/ephrem abreha.jpg",
          1
        ]
      );
    }
  } finally {
    client.release();
  }
}
