import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws; // required for Node.js environments

// Use Neon Pool for Neon DBs (to bypass port 5432 blocks by using WebSockets over port 443)
// Otherwise use standard pg Pool for local DB
const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = isNeon
  ? new NeonPool({ connectionString: process.env.DATABASE_URL })
  : new pg.Pool({
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
      CREATE TABLE IF NOT EXISTS services (
        id          SERIAL PRIMARY KEY,
        slug        TEXT UNIQUE NOT NULL,
        title       TEXT NOT NULL,
        tagline     TEXT,
        description TEXT,
        icon_name   TEXT,
        color       TEXT,
        image       TEXT,
        features    TEXT DEFAULT '[]', -- JSON string
        sort_order  INTEGER DEFAULT 0,
        active      INTEGER DEFAULT 1,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Services if empty
    const serviceCountRes = await client.query("SELECT COUNT(*) FROM services");
    if (parseInt(serviceCountRes.rows[0].count) === 0) {
      const defaultServices = [
        {
          slug: 'it-support',
          title: "IT Support and Consulting",
          icon_name: 'ShieldCheck',
          color: "var(--primary)",
          image: "/images/it-support.png",
          tagline: "Strategic Technical Partnership",
          description: "Our IT Support and Consulting services provide the technical backbone your business needs to excel. We don't just fix problems — we prevent them through proactive management and expert strategic guidance. With over 15 years of industry experience, our team of certified specialists becomes your trusted technology partner from day one. We offer a comprehensive suite of solutions including 24/7 help desk support, infrastructure management, and high-level strategic consulting. Whether you are a small startup looking to scale or an established enterprise seeking to optimize your operations, we provide the expertise to transform your technology from a cost center into a powerful competitive advantage.",
          features: JSON.stringify([
            { title: "Continuous Help Desk Support", desc: "Our dedicated help desk provides 24/7 assistance.", icon: 'Headset', highlights: ['24/7 Remote Assistance', 'On-site Priority Response', 'Multi-tiered Support Desk'] },
            { title: "Technical Support", desc: "Proactive management of hardware and software.", icon: 'Wrench', highlights: ['Hardware Asset Management', 'Server Health Monitoring', 'Automated Security Patching'] },
            { title: "Consulting", desc: "Strategic technology roadmaps for growth.", icon: 'Briefcase', highlights: ['Digital Transformation Roadmap', 'Cloud Readiness Assessment', 'Cybersecurity Posture Evaluation'] }
          ])
        },
        {
          slug: 'networking',
          title: "Networking and Infrastructure",
          icon_name: 'Network',
          color: "var(--secondary)",
          image: "/images/networking.png",
          tagline: "High-Performance Connectivity",
          description: "A robust and secure network is the lifeblood of any modern digital organization. Our Networking and Infrastructure services are designed to provide the high-performance connectivity that your business depends on every day. We don't just pull cables; we design and implement future-proof network environments that ensure seamless communication, lightning-fast data transfer, and enterprise-grade security across your entire premises.",
          features: JSON.stringify([
            { title: "LAN/WAN Networking Design and Installation", desc: "Professional implementation of secure network infrastructures.", icon: 'Network', highlights: ['Future-proof Architecture', 'High-Performance Splicing', 'Secure Data Routing'] },
            { title: "Networking Devices Configuration", desc: "Expert configuration of enterprise-grade networking devices.", icon: 'Settings', highlights: ['Router/Switch Optimization', 'VLAN Configuration', 'Firewall Security Rules'] },
            { title: "Wi-Fi Installation", desc: "Strategic deployment of high-speed wireless access points.", icon: 'Wifi', highlights: ['High-capacity Access Points', 'Seamless Roaming', 'Guest Network Isolation'] },
            { title: "Fiber Optics Installation", desc: "Professional installation and termination of fiber optic cabling.", icon: 'Zap', highlights: ['Industrial Grade Splicing', 'OTDR Testing & Certification', 'High-bandwidth Backbone'] },
            { title: "PBAX Telephone System Installation", desc: "Advanced PBAX systems for reliable business communication.", icon: 'Phone', highlights: ['IP-PBX & Analog Solutions', 'Call Routing Setup', 'Intercom Integration'] },
            { title: "Networked Dish Installation", desc: "Professional distribution of satellite TV signals via your network.", icon: 'Tv', highlights: ['Satellite Distribution', 'IPTV Integration', 'Multi-room Setup'] }
          ])
        },
        {
          slug: 'security',
          title: "Security and Surveillance",
          icon_name: 'Lock',
          color: "var(--accent)",
          image: "/images/security.png",
          tagline: "Advanced Protection Systems",
          description: "Protecting your people, property, and proprietary data is our highest responsibility. In an increasingly complex world, a simple lock and key are no longer enough. Our Security and Surveillance services provide a comprehensive, multi-layered defense system that combines state-of-the-art hardware with intelligent digital monitoring for total peace of mind.",
          features: JSON.stringify([
            { title: "CCTV Surveillance Installation", desc: "HD IP and analog CCTV surveillance systems with remote monitoring.", icon: 'Camera', highlights: ['Remote Mobile Monitoring', 'Intelligent Motion Detection', 'Night-vision HD Coverage'] },
            { title: "Fire Alarm & Detection Systems", desc: "Integrated fire detection and suppression systems.", icon: 'Flame', highlights: ['Photoelectric Smoke Sensors', 'Rate-of-Rise Heat Detection', 'Compliance Inspections'] },
            { title: "Biometric Attendance & Access Control", desc: "State-of-the-art attendance and entry control.", icon: 'Fingerprint', highlights: ['RFID & Fingerprint Readers', 'HR Platform Integration', 'Real-time Attendance Logs'] },
            { title: "Electric Fence & Perimeter Security", desc: "Secure your entire perimeter with high-voltage electric fencing.", icon: 'Zap', highlights: ['High-voltage Energizers', 'Alarm Monitoring Integration', 'Durable Weather-resistance'] },
            { title: "Electronic Door Lock Systems", desc: "Intelligent, audit-trailed access control for your entry points.", icon: 'Lock', highlights: ['Smart Mobile Access', 'PIN-code Keypads', 'Remote Lockdown Capability'] }
          ])
        },
        {
          slug: 'cybersecurity',
          title: "Cybersecurity & Antivirus",
          icon_name: 'ShieldCheck',
          color: "#006d5d",
          image: "/images/cybersecurity.png",
          tagline: "Industry-Leading Digital Protection",
          description: "In an era of relentless digital threats, your organization's data is your most valuable and most vulnerable asset. Our Cybersecurity & Antivirus services provide the enterprise-grade protection you need to safeguard your operations from sophisticated global threats. As authorized suppliers of Kaspersky, we offer world-class cybersecurity solutions.",
          features: JSON.stringify([
            { title: "Endpoint Security Solutions", desc: "Full-scale protection for all business devices.", icon: 'ShieldCheck', highlights: ['Behavioral Analysis', 'Ransomware Protection', 'Zero-day Exploit Blocking'] },
            { title: "Server & Data Protection", desc: "Specialized scanning for high-load environments.", icon: 'Lock', highlights: ['Real-time Scanning', 'Virtualization Shielding', 'Zero-Downtime Patching'] },
            { title: "Centralized Security Management", desc: "Take complete control of your security posture.", icon: 'Settings', highlights: ['Cloud-based Console', 'Global Threat Intelligence', 'License Compliance Tracking'] },
            { title: "Security Audits & Licensing", desc: "Handle complexities of security licensing and conduct audits.", icon: 'CheckCircle2', highlights: ['Vulnerability Assessment', 'Compliance Audits', 'Authorized Licensing'] }
          ])
        },
        {
          slug: 'marketing-graphics',
          title: "Digital Marketing and Graphics",
          icon_name: 'Palette',
          color: "var(--secondary)",
          image: "/images/digital-marketing.png",
          tagline: "Creative & Strategic Brand Growth",
          description: "In today's visually-driven digital landscape, your brand's identity and online presence are the primary touchpoints for your customers. Our Digital Marketing and Graphics services are designed to ensure those touchpoints are both memorable and highly effective. We combine creative artistry with data-driven strategy to build lasting connections with your audience.",
          features: JSON.stringify([
            { title: "Logo Design", desc: "Distinctive, memorable logos that capture your brand.", icon: 'Palette', highlights: ['Industry-specific Research', 'Vector Brand Identity', 'Style Guide Development'] },
            { title: "Brochures & Flyers", desc: "Professional print and digital marketing materials.", icon: 'Printer', highlights: ['High-impact Visuals', 'Professional Copywriting', 'Print-ready Formats'] },
            { title: "Business Cards Design", desc: "Professionally designed business cards reflecting brand values.", icon: 'PenTool', highlights: ['Premium Typography', 'Custom Layouts', 'Print Management'] },
            { title: "Social Media Marketing", desc: "Strategic management of your social media presence.", icon: 'Share2', highlights: ['Content Strategy', 'Community Engagement', 'Campaign Management'] },
            { title: "Digital Marketing", desc: "PPC, email marketing, and content strategy.", icon: 'Megaphone', highlights: ['PPC Management', 'Email Campaigns', 'Sales Funnels'] },
            { title: "Search Engine Optimization (SEO)", desc: "Improve visibility and drive organic traffic.", icon: 'Search', highlights: ['Technical SEO Audits', 'Keyword Research', 'Backlink Strategy'] }
          ])
        },
        {
          slug: 'digital-services',
          title: "Software and Web Development",
          icon_name: 'Rocket',
          color: "var(--secondary)",
          image: "/images/digital-services.png",
          tagline: "Bespoke Digital Transformation",
          description: "In a world defined by digital acceleration, your software is more than just a tool — it's the engine of your business growth. Our Software and Web Development services are dedicated to transforming your most ambitious business visions into high-performance, scalable digital products.",
          features: JSON.stringify([
            { title: "Website Development", desc: "Responsive, high-performance web platforms.", icon: 'Monitor', highlights: ['Mobile-first Design', 'SEO Optimization', 'E-commerce Integration'] },
            { title: "Mobile App Development", desc: "iOS and Android with seamless user experiences.", icon: 'Smartphone', highlights: ['iOS & Android Platforms', 'Native performance', 'Intuitive UX/UI Design'] },
            { title: "Custom Software Development", desc: "Bespoke software solutions for unique challenges.", icon: 'Code', highlights: ['Agile Development Process', 'Scalable Architecture', 'Full Source Code Ownership'] },
            { title: "ERP System Development", desc: "ERP systems that integrate and manage core business processes.", icon: 'LayoutDashboard', highlights: ['Unified Platform', 'Inventory Management', 'Financial Reporting'] }
          ])
        },
        {
          slug: 'web-hosting',
          title: "Web Hosting and Domains",
          icon_name: 'Globe',
          color: "var(--primary)",
          image: "/images/networking.png",
          tagline: "Secure & Scalable Infrastructure",
          description: "Your website and digital applications deserve a reliable, fast, and secure home that you can depend on 24/7. Our Web Hosting and Domains services provide the enterprise-grade infrastructure needed to keep your digital presence performant, protected, and always accessible.",
          features: JSON.stringify([
            { title: "High-Performance Web Hosting", desc: "SSD-powered cloud infrastructure with 99.9% uptime.", icon: 'Server', highlights: ['SSD Cloud Storage', '99.9% Uptime Guarantee', 'Automatic Scaling'] },
            { title: "Managed Security & SSL Certificates", desc: "Automated backups and free SSL certificates.", icon: 'Lock', highlights: ['Free SSL/TLS certificates', 'Daily Off-site Backups', 'DDoS Mitigation'] },
            { title: "Domain & Email Hosting", desc: "Domain registration and professional email hosting.", icon: 'Globe', highlights: ['Domain Management', 'Professional Email', 'Spam Filtering'] },
            { title: "Local Technical Support & Migration", desc: "Zero-downtime transfers and personalized assistance.", icon: 'Database', highlights: ['Zero-Downtime Transfers', 'DNS Management', 'Personalized Assistance'] }
          ])
        }
      ];
      for (const s of defaultServices) {
        await client.query(
          "INSERT INTO services (slug, title, tagline, description, icon_name, color, image, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (slug) DO NOTHING",
          [s.slug, s.title, s.tagline, s.description, s.icon_name, s.color, s.image, s.features]
        );
      }
    }

    // Seed default Admin if empty
    const adminCheck = await client.query("SELECT COUNT(*) FROM admins");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      const email = process.env.ADMIN_EMAIL || 'gedu0194@gmail.com';
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
