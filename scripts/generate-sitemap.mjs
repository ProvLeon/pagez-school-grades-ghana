#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');

// Define all routes of your application
const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/login',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/signup',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/forgot-password',
    priority: '0.7',
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/terms',
    priority: '0.5',
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/privacy',
    priority: '0.5',
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0],
  },
];

// Generate sitemap XML
const generateSitemap = () => {
  const baseUrl = process.env.SITE_URL || 'https://eresultsgh.com';

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const xmlNamespace = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  const urlEntries = routes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('');

  const sitemap = `${xmlHeader}\n${xmlNamespace}${urlEntries}\n</urlset>`;
  return sitemap;
};

// Write sitemap to public directory
const writeSitemap = () => {
  try {
    // Ensure dist exists
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }

    const sitemapPath = path.join(distPath, 'sitemap.xml');
    const sitemap = generateSitemap();

    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`✓ Sitemap generated at ${sitemapPath}`);
  } catch (error) {
    console.error('✗ Error generating sitemap:', error.message);
    process.exit(1);
  }
};

writeSitemap();
