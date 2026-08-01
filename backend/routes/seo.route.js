const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

/**
 * Dynamic Sitemap Generator (/sitemap.xml)
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://elkoptan-mobile.com';
        const staticPages = [
            { path: '', priority: '1.0', changefreq: 'daily' },
            { path: '/phones', priority: '0.9', changefreq: 'daily' },
            { path: '/accessories', priority: '0.9', changefreq: 'daily' },
            { path: '/offers', priority: '0.9', changefreq: 'daily' },
            { path: '/maintenance', priority: '0.8', changefreq: 'weekly' },
            { path: '/faq', priority: '0.7', changefreq: 'monthly' },
            { path: '/contact', priority: '0.7', changefreq: 'monthly' },
            { path: '/cash', priority: '0.6', changefreq: 'monthly' }
        ];

        const products = await Product.find({}).select('slug _id updatedAt price imagURL name').lean();

        const today = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        // Static pages
        for (const page of staticPages) {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Product pages
        for (const prod of products) {
            const prodId = prod.slug || prod._id;
            const lastMod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : today;
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/product/${prodId}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            if (prod.imagURL) {
                const imgUrl = prod.imagURL.startsWith('http') ? prod.imagURL : `${baseUrl}/${prod.imagURL.replace(/\\/g, '/')}`;
                xml += `    <image:image>\n`;
                xml += `      <image:loc>${imgUrl}</image:loc>\n`;
                xml += `      <image:title>${prod.name ? prod.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</image:title>\n`;
                xml += `    </image:image>\n`;
            }
            xml += `  </url>\n`;
        }

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (error) {
        res.status(500).send('Error generating sitemap');
    }
});

/**
 * Dynamic Robots.txt (/robots.txt)
 */
router.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Allow: /phones
Allow: /accessories
Allow: /offers
Allow: /maintenance
Allow: /faq
Allow: /contact
Allow: /cash
Allow: /product/

Disallow: /admin/
Disallow: /admin/*
Disallow: /login

Sitemap: https://elkoptan-mobile.com/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.status(200).send(robots);
});

module.exports = router;
