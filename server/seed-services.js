import { getDb } from './src/db.js';
import 'dotenv/config';

const defaultServices = [
  {
    slug: 'it-support',
    title: "IT Support and Consulting",
    icon_name: 'ShieldCheck',
    color: "#2563eb",
    image: "/images/it-support.png",
    tagline: "Strategic Technical Partnership",
    description: "Our IT Support and Consulting services provide the technical backbone your business needs to excel.",
    features: JSON.stringify([
      { title: "Continuous Help Desk Support", desc: "Our dedicated help desk provides 24/7 assistance.", icon: 'Headset' },
      { title: "Technical Support", desc: "Proactive management of hardware and software.", icon: 'Wrench' },
      { title: "Consulting", desc: "Strategic technology roadmaps for growth.", icon: 'Briefcase' }
    ])
  },
  {
    slug: 'networking',
    title: "Networking and Infrastructure",
    icon_name: 'Network',
    color: "#db2777",
    image: "/images/networking.png",
    tagline: "High-Performance Connectivity",
    description: "A robust network is the lifeblood of your digital organization.",
    features: JSON.stringify([
      { title: "LAN/WAN Networking", desc: "Secure local and wide area network implementation.", icon: 'Network' },
      { title: "Wi-Fi Installation", desc: "High-speed wireless coverage.", icon: 'Wifi' },
      { title: "Fiber Optics", desc: "High-bandwidth cabling solutions.", icon: 'Zap' }
    ])
  },
  {
    slug: 'security',
    title: "Security and Surveillance",
    icon_name: 'Lock',
    color: "#f59e0b",
    image: "/images/security.png",
    tagline: "Advanced Protection Systems",
    description: "Protecting your people, property, and proprietary data is our highest priority.",
    features: JSON.stringify([
      { title: "CCTV Surveillance", desc: "HD IP and analog surveillance systems.", icon: 'Camera' },
      { title: "Fire Alarm Systems", desc: "Integrated life safety detection systems.", icon: 'Flame' },
      { title: "Biometric Access", desc: "State-of-the-art attendance and entry control.", icon: 'Fingerprint' }
    ])
  },
  {
    slug: 'cybersecurity',
    title: "Cybersecurity & Antivirus",
    icon_name: 'ShieldCheck',
    color: "#006d5d",
    image: "/images/cybersecurity.png",
    tagline: "Industry-Leading Digital Protection",
    description: "World-class cybersecurity solutions designed to protect your business from sophisticated threats.",
    features: JSON.stringify([
      { title: "Endpoint Security", desc: "Full-scale protection for all business devices.", icon: 'ShieldCheck' },
      { title: "Server Protection", desc: "Specialized scanning for high-load environments.", icon: 'Lock' },
      { title: "Centralized Management", desc: "Monitor threat detections from a single pane of glass.", icon: 'Settings' }
    ])
  },
  {
    slug: 'marketing-graphics',
    title: "Digital Marketing and Graphics",
    icon_name: 'Palette',
    color: "#8b5cf6",
    image: "/images/digital-marketing.png",
    tagline: "Creative & Strategic Brand Growth",
    description: "Elevate your brand with our comprehensive digital marketing and design services.",
    features: JSON.stringify([
      { title: "Logo Design", desc: "Distinctive, memorable logos that capture your brand.", icon: 'Palette' },
      { title: "Social Media Marketing", desc: "Strategic management of your community presence.", icon: 'Share2' },
      { title: "SEO", desc: "Improve visibility and drive organic traffic.", icon: 'Search' }
    ])
  },
  {
    slug: 'digital-services',
    title: "Software and Web Development",
    icon_name: 'Rocket',
    color: "#10b981",
    image: "/images/digital-services.png",
    tagline: "Bespoke Digital Transformation",
    description: "We transform your business vision into high-performance digital products.",
    features: JSON.stringify([
      { title: "Website Development", desc: "Responsive, high-performance web platforms.", icon: 'Monitor' },
      { title: "Mobile App Development", desc: "Custom iOS and Android applications.", icon: 'Smartphone' },
      { title: "Custom Software", desc: "Bespoke solutions for complex challenges.", icon: 'Code' }
    ])
  },
  {
    slug: 'web-hosting',
    title: "Web Hosting and Domains",
    icon_name: 'Globe',
    color: "#3b82f6",
    image: "/images/networking.png",
    tagline: "Secure & Scalable Infrastructure",
    description: "Reliable, fast, and secure home for your websites and applications.",
    features: JSON.stringify([
      { title: "High-Performance Hosting", desc: "SSD-powered cloud infrastructure with 99.9% uptime.", icon: 'Server' },
      { title: "Managed Security & SSL", desc: "Automated backups and free SSL certificates.", icon: 'Lock' },
      { title: "Domain & Email", desc: "Professional business email and domain management.", icon: 'Globe' }
    ])
  }
];

async function seed() {
  const db = getDb();
  console.log('Seeding all services...');
  for (const s of defaultServices) {
    await db.query(
      "INSERT INTO services (slug, title, tagline, description, icon_name, color, image, features) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (slug) DO NOTHING",
      [s.slug, s.title, s.tagline, s.description, s.icon_name, s.color, s.image, s.features]
    );
  }
  console.log('✅ Done seeding services.');
  process.exit(0);
}

seed();
