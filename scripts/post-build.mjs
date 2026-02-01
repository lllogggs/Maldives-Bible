import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const source = resolve(distDir, 'index.html');
const target = resolve(distDir, '404.html');
const resortsDataPath = resolve(distDir, 'api', 'resorts.json');
const sitemapPath = resolve(distDir, 'sitemap.xml');

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildResortDescription = (resort) => {
  const parts = [
    resort.name_en || resort.name,
    resort.transportation ? `${resort.transportation} 이동` : null,
    resort.price ? `4박 2인 기준 $${resort.price.toLocaleString?.() ?? resort.price}` : null,
  ].filter(Boolean);

  return `${parts.join(' · ')} 리조트 정보를 확인하세요.`;
};

const buildResortSchema = (resort, canonicalUrl) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: resort.name_en || resort.name,
    url: canonicalUrl,
    image: Array.isArray(resort.imageUrls) ? resort.imageUrls.slice(0, 3) : undefined,
    address: resort.location ? { '@type': 'PostalAddress', addressLocality: resort.location } : undefined,
    aggregateRating: resort.rating
      ? { '@type': 'AggregateRating', ratingValue: resort.rating, ratingCount: 1 }
      : undefined,
  };

  return JSON.stringify(schema);
};

const injectMeta = ({ html, title, description, url, schemaJson }) => {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
    .replace(/<script type="application\/ld\+json">\s*\{[\s\S]*?\}\s*<\/script>/, match => `${match}\n<script type="application/ld+json">${schemaJson}</script>`);
};

const updateSitemap = async (resortSlugs) => {
  try {
    const sitemap = await readFile(sitemapPath, 'utf-8');
    const urlEntries = resortSlugs
      .map((slug) =>
        `  <url>\n    <loc>https://www.maldivesbible.com/resorts/${slug}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      )
      .join('\n');

    const updated = sitemap.replace(/<\/urlset>/, `${urlEntries}\n</urlset>`);
    await writeFile(sitemapPath, updated, 'utf-8');
  } catch (error) {
    console.error('Failed to update sitemap with resort URLs', error);
  }
};

try {
  await copyFile(source, target);
  console.log('Copied dist/index.html to dist/404.html for SPA fallback.');

  const [template, resortJson] = await Promise.all([
    readFile(source, 'utf-8'),
    readFile(resortsDataPath, 'utf-8'),
  ]);

  const resorts = JSON.parse(resortJson);
  const slugs = [];

  for (const resort of resorts) {
    const name = resort.name_en || resort.name;
    if (!name) {
      continue;
    }
    const slug = slugify(name);
    if (!slug) {
      continue;
    }
    slugs.push(slug);

    const title = `${name} | 몰디브 바이블`;
    const description = buildResortDescription(resort);
    const url = `https://www.maldivesbible.com/resorts/${slug}/`;
    const schemaJson = buildResortSchema(resort, url);

    const html = injectMeta({ html: template, title, description, url, schemaJson });
    const targetPath = resolve(distDir, 'resorts', slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
  }

  await updateSitemap(slugs);
  console.log(`Generated ${slugs.length} resort pages and updated sitemap.`);
} catch (error) {
  console.error('Post-build step failed', error);
  process.exitCode = 1;
}
