import { copyFile, mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const source = resolve(distDir, 'index.html');
const target = resolve(distDir, '404.html');
const resortsDataPath = resolve(distDir, 'api', 'resorts.json');
const sourceResortsPath = resolve(process.cwd(), 'public', 'api', 'resorts.json');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const siteUrl = 'https://www.maldivesbible.com';

const toUrlPath = (slug) => `/${encodeURI(slug)}/`;
const toAbsoluteUrl = (slug) => `${siteUrl}${toUrlPath(slug)}`;

const nichePages = [
  {
    slug: '몰디브-신혼여행-워터빌라-개인풀',
    title: '몰디브 신혼여행 워터빌라 개인풀 리조트 비교 | 몰디브 바이블',
    description:
      '몰디브 신혼여행에서 워터빌라와 개인풀을 함께 보는 커플을 위해 예산, 이동시간, 수중환경 기준으로 후보 리조트를 비교합니다.',
    eyebrow: '워터빌라 개인풀',
    heading: '몰디브 신혼여행 워터빌라 개인풀 후보',
    intro:
      '사진 감성, 프라이버시, 객실 만족도를 우선하는 커플은 워터빌라와 개인풀 여부를 먼저 확인하는 편이 빠릅니다.',
    filter: (resort) => resort.honeymoonPerks && resort.hasWaterVilla && resort.hasPrivatePool,
    sort: (a, b) => b.rating - a.rating || a.price - b.price,
    keywords: ['몰디브 신혼여행 워터빌라', '몰디브 개인풀 리조트', '몰디브 허니문 리조트 비교'],
    faq: [
      {
        question: '몰디브 신혼여행에서 워터빌라와 개인풀을 꼭 같이 봐야 하나요?',
        answer:
          '사진과 프라이버시를 우선하면 같이 보는 편이 좋습니다. 다만 예산이 커질 수 있어 1박 환산가와 이동비를 함께 비교해야 합니다.',
      },
      {
        question: '워터빌라 개인풀 리조트는 어떤 기준으로 줄이면 좋나요?',
        answer:
          '4박 2인 예산, 말레 공항 이후 이동시간, 수중환경 점수, 허니문 혜택 여부를 먼저 보면 후보를 빠르게 줄일 수 있습니다.',
      },
    ],
  },
  {
    slug: '몰디브-보트-이동-리조트',
    title: '몰디브 보트 이동 리조트 비교 | 신혼여행 이동 피로 줄이기',
    description:
      '장거리 비행 뒤 이동 피로가 걱정되는 커플을 위해 말레 공항에서 보트로 이동하는 몰디브 허니문 리조트를 비교합니다.',
    eyebrow: '보트 이동 리조트',
    heading: '몰디브 보트 이동 리조트 후보',
    intro:
      '신혼여행 첫날 컨디션이 걱정된다면 보트 이동 리조트부터 보는 것이 현실적입니다. 이동시간과 이동비, 허니문 혜택을 함께 봅니다.',
    filter: (resort) => resort.transportation === '보트' && resort.honeymoonPerks,
    sort: (a, b) => a.travelTime - b.travelTime || a.price - b.price,
    keywords: ['몰디브 보트 이동 리조트', '몰디브 스피드보트 리조트', '몰디브 신혼여행 이동수단'],
    faq: [
      {
        question: '몰디브 보트 이동 리조트는 어떤 커플에게 맞나요?',
        answer:
          '밤 비행이나 장거리 비행 후 바로 쉬고 싶은 커플, 수상비행기 대기 시간이 부담스러운 커플에게 특히 맞습니다.',
      },
      {
        question: '보트 이동이면 무조건 저렴한가요?',
        answer:
          '이동비는 줄어드는 경우가 많지만 객실 등급과 식사 플랜에 따라 총액은 달라집니다. 4박 총액과 1박 환산가를 같이 봐야 합니다.',
      },
    ],
  },
  {
    slug: '몰디브-수상비행기-리조트',
    title: '몰디브 수상비행기 리조트 비교 | 라군·수중환경 중심 후보',
    description:
      '몰디브 수상비행기 이동 리조트를 라군, 수중환경, 이동시간, 예산 기준으로 비교해 신혼여행 후보를 좁힙니다.',
    eyebrow: '수상비행기 리조트',
    heading: '몰디브 수상비행기 리조트 비교',
    intro:
      '수상비행기 이동은 몰디브다운 풍경을 기대하는 커플에게 매력적입니다. 대신 운항 시간과 대기 피로를 감안해 후보를 비교해야 합니다.',
    filter: (resort) => resort.transportation === '수상비행기' && resort.honeymoonPerks,
    sort: (a, b) => b.snorkelingQuality - a.snorkelingQuality || a.travelTime - b.travelTime,
    keywords: ['몰디브 수상비행기 리조트', '몰디브 라군 리조트', '몰디브 수중환경 좋은 리조트'],
    faq: [
      {
        question: '수상비행기 리조트는 왜 따로 비교해야 하나요?',
        answer:
          '말레 공항 도착 시간과 수상비행기 운항 시간에 따라 첫날 일정이 달라질 수 있어 이동시간과 예산을 함께 보는 것이 좋습니다.',
      },
      {
        question: '수상비행기 리조트는 수중환경이 항상 좋은가요?',
        answer:
          '그렇지 않습니다. 라군이 예쁜 곳과 스노클링이 좋은 곳은 다를 수 있어 수중환경 점수를 별도로 비교해야 합니다.',
      },
    ],
  },
  {
    slug: '몰디브-스노클링-좋은-리조트',
    title: '몰디브 스노클링 좋은 리조트 비교 | 하우스리프·수중환경 기준',
    description:
      '몰디브에서 스노클링과 하우스리프를 중요하게 보는 커플을 위해 수중환경 점수, 이동수단, 예산 기준으로 리조트를 비교합니다.',
    eyebrow: '스노클링 좋은 리조트',
    heading: '몰디브 스노클링 좋은 리조트 후보',
    intro:
      '라군 색감보다 물속 경험이 중요한 커플이라면 수중환경 점수와 이동수단을 먼저 보는 편이 좋습니다.',
    filter: (resort) => resort.snorkelingQuality >= 4.7 && resort.honeymoonPerks,
    sort: (a, b) => b.snorkelingQuality - a.snorkelingQuality || b.rating - a.rating,
    keywords: ['몰디브 스노클링 리조트', '몰디브 하우스리프 리조트', '몰디브 수중환경 리조트'],
    faq: [
      {
        question: '몰디브 스노클링 리조트는 어떤 데이터를 봐야 하나요?',
        answer:
          '수중환경 점수, 리조트 위치, 이동수단, 객실 타입을 같이 보는 것이 좋습니다. 라군이 예뻐도 하우스리프 접근성이 다를 수 있습니다.',
      },
      {
        question: '허니문에서도 스노클링 기준이 중요한가요?',
        answer:
          '물놀이 시간이 길거나 액티비티를 중요하게 보는 커플이라면 객실 감성만큼 중요한 기준입니다.',
      },
    ],
  },
  {
    slug: '몰디브-올인클루시브-신혼여행',
    title: '몰디브 올인클루시브 신혼여행 리조트 비교 | 예산·다이닝 기준',
    description:
      '몰디브 신혼여행 예산을 잡기 쉽게 4박 2인 기준 가격, 레스토랑 수, 허니문 혜택을 중심으로 올인클루시브 후보를 비교합니다.',
    eyebrow: '올인클루시브 신혼여행',
    heading: '몰디브 올인클루시브 신혼여행 후보',
    intro:
      '견적이 불안한 커플은 숙박 총액만 보지 말고 1박 환산가, 다이닝 선택지, 이동비를 함께 비교해야 합니다.',
    filter: (resort) => resort.honeymoonPerks && resort.restaurants >= 4,
    sort: (a, b) => a.price - b.price || b.restaurants - a.restaurants,
    keywords: ['몰디브 올인클루시브 신혼여행', '몰디브 허니문 예산', '몰디브 리조트 4박 가격'],
    faq: [
      {
        question: '몰디브 올인클루시브는 어떤 커플에게 맞나요?',
        answer:
          '현지에서 식사와 음료 비용을 계속 계산하고 싶지 않은 커플에게 맞습니다. 포함 범위는 리조트마다 달라 상세 조건 확인이 필요합니다.',
      },
      {
        question: '올인클루시브 리조트는 가격만 보면 되나요?',
        answer:
          '가격 외에도 레스토랑 수, 바 수, 이동비, 허니문 혜택, 객실 타입을 같이 봐야 실제 만족도가 올라갑니다.',
      },
    ],
  },
];

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
  const displayName = resort.name || resort.name_en;
  const englishName = resort.name_en && resort.name_en !== displayName ? `(${resort.name_en})` : null;
  const parts = [
    [displayName, englishName].filter(Boolean).join(' '),
    resort.transportation ? `${resort.transportation} 이동` : null,
    resort.price ? `4박 2인 기준 $${resort.price.toLocaleString?.() ?? resort.price}` : null,
  ].filter(Boolean);

  return `${parts.join(' · ')} 리조트 정보를 한국어로 확인하세요.`;
};

const formatUsd = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

const resortCard = (resort) => {
  const slug = slugify(resort.name_en || resort.name);
  const badges = [
    resort.transportation,
    resort.hasWaterVilla ? '워터빌라' : null,
    resort.hasPrivatePool ? '개인풀' : null,
    resort.honeymoonPerks ? '허니문 혜택' : null,
  ].filter(Boolean);

  return `
    <article style="border:1px solid #dbe7e4;border-radius:12px;padding:18px;background:#fff;">
      <h2 style="margin:0 0 6px;font-size:20px;color:#0f172a;">${escapeHtml(resort.name)}</h2>
      <p style="margin:0 0 12px;color:#64748b;">${escapeHtml(resort.name_en || '')}</p>
      <p style="margin:0 0 10px;color:#334155;">${escapeHtml(resort.location || '')} · ${escapeHtml(resort.transportation || '')} ${resort.travelTime || 0}분 · 4박 2인 ${formatUsd(resort.price)}</p>
      <p style="margin:0 0 14px;color:#334155;">수중환경 ${resort.snorkelingQuality || '-'} / 5 · 다이닝 ${resort.restaurants || 0}곳 · 이동비 2인 왕복 ${formatUsd((resort.travelCost || 0) * 2)}</p>
      <p style="margin:0 0 14px;">${badges
        .map((badge) => `<span style="display:inline-block;margin:0 6px 6px 0;border-radius:999px;background:#ecfeff;color:#0f766e;padding:4px 9px;font-size:13px;font-weight:700;">${escapeHtml(badge)}</span>`)
        .join('')}</p>
      <a href="${siteUrl}/resorts/${slug}/" style="color:#0f766e;font-weight:700;text-decoration:none;">${escapeHtml(resort.name)} 상세 보기</a>
    </article>`;
};

const buildResortPageContent = (resort) => {
  const name = resort.name || resort.name_en;
  const badges = [
    resort.transportation ? `${resort.transportation} 이동` : null,
    resort.hasWaterVilla ? '워터빌라 보유' : null,
    resort.hasPrivatePool ? '개인풀 보유' : null,
    resort.honeymoonPerks ? '허니문 혜택' : null,
  ].filter(Boolean);

  return `
    <main style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
      <article style="max-width:920px;margin:0 auto;border:1px solid #dbe7e4;border-radius:14px;background:#fff;padding:26px;">
        <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">몰디브 리조트 상세</p>
        <h1 style="margin:0;font-size:38px;line-height:1.18;">${escapeHtml(name)}</h1>
        <p style="margin:8px 0 18px;color:#64748b;font-size:17px;">${escapeHtml(resort.name_en || '')}</p>
        <p style="margin:0 0 12px;color:#334155;line-height:1.7;">
          ${escapeHtml(resort.location || '')} · ${escapeHtml(resort.transportation || '')} ${resort.travelTime || 0}분 · 4박 2인 ${formatUsd(resort.price)}
        </p>
        <p style="margin:0 0 18px;color:#334155;line-height:1.7;">
          수중환경 ${resort.snorkelingQuality || '-'} / 5 · 레스토랑 ${resort.restaurants || 0}곳 · 바 ${resort.bars || 0}곳 · 이동비 2인 왕복 ${formatUsd((resort.travelCost || 0) * 2)}
        </p>
        <p style="margin:0 0 20px;">${badges
          .map((badge) => `<span style="display:inline-block;margin:0 6px 6px 0;border-radius:999px;background:#ecfeff;color:#0f766e;padding:4px 9px;font-size:13px;font-weight:700;">${escapeHtml(badge)}</span>`)
          .join('')}</p>
        <a href="${siteUrl}/" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 전체 비교로 돌아가기</a>
      </article>
    </main>`;
};

const buildNichePageContent = (page, resorts) => {
  const selected = resorts.filter(page.filter).sort(page.sort).slice(0, 12);
  const listItems = selected
    .map((resort, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: resort.name,
      url: `${siteUrl}/resorts/${slugify(resort.name_en || resort.name)}/`,
    }));
  const itemListSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.heading,
    itemListElement: listItems,
  });
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  return {
    html: `
      <main style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
        <section style="max-width:1120px;margin:0 auto 24px;">
          <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(page.eyebrow)}</p>
          <h1 style="margin:0;font-size:38px;line-height:1.18;">${escapeHtml(page.heading)}</h1>
          <p style="max-width:760px;margin:14px 0 0;color:#475569;font-size:17px;line-height:1.8;">${escapeHtml(page.intro)}</p>
          <p style="margin:14px 0 0;color:#64748b;">${page.keywords.map((keyword) => escapeHtml(keyword)).join(' · ')}</p>
        </section>
        <section style="max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
          ${selected.map(resortCard).join('\n')}
        </section>
        <section style="max-width:1120px;margin:28px auto 0;border-top:1px solid #dbe7e4;padding-top:22px;">
          <h2 style="font-size:24px;margin:0 0 12px;">자주 묻는 질문</h2>
          ${page.faq
            .map(
              (item) => `
                <article style="margin:0 0 14px;">
                  <h3 style="margin:0 0 6px;font-size:18px;">${escapeHtml(item.question)}</h3>
                  <p style="margin:0;color:#475569;line-height:1.7;">${escapeHtml(item.answer)}</p>
                </article>`
            )
            .join('\n')}
          <p style="margin:24px 0 0;"><a href="${siteUrl}/" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 전체 필터로 돌아가기</a></p>
        </section>
      </main>`,
    schemaJson: `${itemListSchema}</script>\n<script type="application/ld+json">${faqSchema}`,
  };
};

const buildResortSchema = (resort, canonicalUrl) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: resort.name || resort.name_en,
    alternateName: resort.name_en && resort.name_en !== resort.name ? resort.name_en : undefined,
    url: canonicalUrl,
    image: Array.isArray(resort.imageUrls) ? resort.imageUrls.slice(0, 3) : undefined,
    address: resort.location ? { '@type': 'PostalAddress', addressLocality: resort.location } : undefined,
    aggregateRating: resort.rating
      ? { '@type': 'AggregateRating', ratingValue: resort.rating, ratingCount: 1 }
      : undefined,
  };

  return JSON.stringify(schema);
};

const replaceMetaContent = (html, attribute, value, content) =>
  html.replace(
    new RegExp(`<meta(?=[^>]*${attribute}="${value}")[^>]*>`, 'i'),
    `<meta ${attribute}="${value}" content="${escapeHtml(content)}" />`
  );

const injectMeta = ({ html, title, description, url, schemaJson }) => {
  let updated = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  updated = replaceMetaContent(updated, 'name', 'description', description);
  updated = replaceMetaContent(updated, 'property', 'og:title', title);
  updated = replaceMetaContent(updated, 'property', 'og:description', description);
  updated = replaceMetaContent(updated, 'property', 'og:url', url);
  updated = replaceMetaContent(updated, 'name', 'twitter:title', title);
  updated = replaceMetaContent(updated, 'name', 'twitter:description', description);
  return updated
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
    .replace(/<link rel="alternate" href=".*?" hreflang="ko(?:-KR)?"\s*\/>/, `<link rel="alternate" href="${escapeHtml(url)}" hreflang="ko-KR" />`)
    .replace(/<script type="application\/ld\+json">\s*\{[\s\S]*?\}\s*<\/script>/, match => `${match}\n<script type="application/ld+json">${schemaJson}</script>`);
};

const injectStaticRoot = (html, content) =>
  html.replace(/<div id="root">[\s\S]*?<\/div>\s*<\/body>/, `<div id="root">${content}</div>\n  </body>`);

const updateSitemap = async (resortSlugs, nicheSlugs) => {
  try {
    const staticEntries = [
      `${siteUrl}/`,
      `${siteUrl}/?view=tips`,
      `${siteUrl}/?view=agencies`,
      `${siteUrl}/?view=flights`,
      ...nicheSlugs.map((slug) => toAbsoluteUrl(slug)),
    ];

    const urlEntries = [
      ...staticEntries.map(
        (loc) =>
          `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      ),
      ...resortSlugs.map(
        (slug) =>
          `  <url>\n    <loc>${siteUrl}/resorts/${slug}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      ),
    ].join('\n');

    const sitemap = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urlEntries}\n</urlset>`;
    await writeFile(sitemapPath, sitemap, 'utf-8');
  } catch (error) {
    console.error('Failed to update sitemap with resort URLs', error);
  }
};

const getResortDataFiles = async () => {
  const apiDir = resolve(distDir, 'api');
  const names = await readdir(apiDir).catch(() => readdir(resolve(process.cwd(), 'public', 'api')));
  return names
    .filter((name) => /^resorts(\d+)?\.json$/.test(name))
    .sort((a, b) => {
      const getIndex = (name) => {
        const match = name.match(/^resorts(\d+)?\.json$/);
        return match?.[1] ? Number(match[1]) : 1;
      };
      return getIndex(a) - getIndex(b);
    });
};

const readAllResorts = async () => {
  const files = await getResortDataFiles();
  const apiDir = resolve(distDir, 'api');
  const sourceApiDir = resolve(process.cwd(), 'public', 'api');
  const chunks = await Promise.all(
    files.map((file) =>
      readFile(resolve(apiDir, file), 'utf-8').catch(() => readFile(resolve(sourceApiDir, file), 'utf-8'))
    )
  );
  const seen = new Set();
  return chunks
    .flatMap((chunk) => JSON.parse(chunk))
    .filter((resort) => {
      if (!resort?.id || seen.has(resort.id)) {
        return false;
      }
      seen.add(resort.id);
      return true;
    });
};

try {
  await copyFile(source, target);
  console.log('Copied dist/index.html to dist/404.html for SPA fallback.');

  const [template, resorts] = await Promise.all([
    readFile(source, 'utf-8'),
    readAllResorts().catch(async () => JSON.parse(await readFile(resortsDataPath, 'utf-8').catch(() => readFile(sourceResortsPath, 'utf-8')))),
  ]);

  const slugs = [];
  const usedSlugs = new Set();

  for (const resort of resorts) {
    const name = resort.name_en || resort.name;
    if (!name) {
      continue;
    }
    const slug = slugify(name);
    if (!slug) {
      continue;
    }
    if (usedSlugs.has(slug)) {
      continue;
    }
    usedSlugs.add(slug);
    slugs.push(slug);

    const title = `${resort.name || name} 리조트 정보 | 몰디브 바이블`;
    const description = buildResortDescription(resort);
    const url = `${siteUrl}/resorts/${slug}/`;
    const schemaJson = buildResortSchema(resort, url);

    const html = injectStaticRoot(
      injectMeta({ html: template, title, description, url, schemaJson }),
      buildResortPageContent(resort)
    );
    const targetPath = resolve(distDir, 'resorts', slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
  }

  const nicheSlugs = [];
  for (const page of nichePages) {
    const url = toAbsoluteUrl(page.slug);
    const { html: content, schemaJson } = buildNichePageContent(page, resorts);
    const html = injectStaticRoot(
      injectMeta({ html: template, title: page.title, description: page.description, url, schemaJson }),
      content
    );
    const targetPath = resolve(distDir, page.slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
    nicheSlugs.push(page.slug);
  }

  await updateSitemap(slugs, nicheSlugs);
  console.log(`Generated ${slugs.length} resort pages, ${nicheSlugs.length} niche pages, and updated sitemap.`);
} catch (error) {
  console.error('Post-build step failed', error);
  process.exitCode = 1;
}
