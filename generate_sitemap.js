import fs from 'fs';
import path from 'path';

// Define your site's base URL
const BASE_URL = 'https://hexagonview.com'; // Change this to your actual production domain

// List of static routes from App.jsx
const routes = [
  '',
  '/services',
  '/projects',
  '/blog',
  '/about',
  '/contact',
  '/clients',
  // Individual service pages
  '/services/it-support',
  '/services/networking',
  '/services/security',
  '/services/cybersecurity',
  '/services/marketing-graphics',
  '/services/digital-services',
  '/services/web-hosting'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
console.log('✅ sitemap.xml generated in /public directory!');
