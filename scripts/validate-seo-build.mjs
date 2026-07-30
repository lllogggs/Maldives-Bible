import { access, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const distDir = join(projectRoot, 'dist');
const siteOrigin = 'https://www.maldivesbible.com';
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const corePages = [
  {
    path: '/',
    file: 'dist/index.html',
    title: '몰디브 바이블 | 171개 리조트 비교·여행 준비 가이드',
    description:
      '171개 몰디브 리조트를 예산·이동·객실·수중환경 기준으로 비교하고, 처음 준비하는 방법부터 여행사 견적 확인과 항공 일정 가이드까지 한곳에서 확인하세요.',
    heading: '몰디브 여행, 기준부터 비교까지 한곳에서',
    image: '/og-image.jpg',
    imageAlt: '몰디브 라군과 리조트 전경',
    imageWidth: 1200,
    imageHeight: 630,
    topics: ['171개', '시작하기', '리조트 비교', '여행사 견적 비교', '항공 가이드'],
  },
  {
    path: '/start/',
    file: 'dist/start/index.html',
    title: '몰디브 여행 시작하기 | 처음 준비하는 순서',
    description:
      '몰디브 여행을 처음 준비하는 분을 위해 예산, 일정, 이동수단, 객실 타입, 식사 플랜과 스노클링 기준을 순서대로 정리했습니다.',
    heading: '몰디브 여행 시작하기',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 여행 준비를 위한 리조트와 바다 전경',
    imageWidth: 1200,
    imageHeight: 630,
    topics: ['예산', '일정', '이동수단', '비치빌라', '워터빌라', '식사 플랜', '수중환경', '라군'],
  },
  {
    path: '/maldives-resort-comparison/',
    file: 'dist/maldives-resort-comparison/index.html',
    title: '몰디브 리조트 비교 | 171개 리조트 한눈에 보기',
    description:
      '171개 몰디브 리조트를 예산, 말레 공항 이동수단, 객실 유형, 개인풀, 수중환경과 여행 취향 기준으로 비교해 보세요.',
    heading: '몰디브 리조트 비교',
    image: '/brand/resort-comparison-preview.jpg',
    imageAlt: '171개 몰디브 리조트 비교 화면',
    imageWidth: 1216,
    imageHeight: 632,
    topics: ['171개', '예산', '이동수단', '이동시간', '객실', '개인풀', '수중환경', '필터'],
  },
  {
    path: '/quote-comparison/',
    file: 'dist/quote-comparison/index.html',
    title: '몰디브 여행사 견적 비교 | 요청 전 확인할 기준',
    description:
      '몰디브 전문 여행사의 홈페이지와 상담 채널을 확인하고, 같은 일정·객실·식사 조건으로 견적을 비교하는 방법을 안내합니다.',
    heading: '몰디브 여행사 견적 비교',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 여행 견적 비교 안내',
    imageWidth: 1200,
    imageHeight: 630,
    topics: ['같은 일정', '견적', '등록된', '홈페이지', '카카오', '예시'],
  },
  {
    path: '/flight-guide/',
    file: 'dist/flight-guide/index.html',
    title: '몰디브 항공 일정 가이드 | 말레 도착·경유 비교',
    description:
      '인천에서 말레까지의 주요 경유 방식과 도착 시간, 수상비행기 운항 시간과 리조트 이동 가능 여부를 함께 확인하세요.',
    heading: '몰디브 항공 일정 가이드',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 말레행 항공 일정 안내',
    imageWidth: 1200,
    imageHeight: 630,
    topics: ['말레 도착', '새벽', '오후', '야간', '보트', '수상비행기', '싱가포르', '중동', '동남아', '귀국편'],
  },
];

const primaryLinks = [
  { path: '/start/', label: '시작하기' },
  { path: '/maldives-resort-comparison/', label: '리조트 비교' },
  { path: '/quote-comparison/', label: '견적 비교' },
  { path: '/flight-guide/', label: '항공 가이드' },
];
const forbiddenPhrases = [
  '실시간 견적',
  '실시간 최저가',
  '항공권 최저가 비교',
  '항공권 자동 예약',
  '여행사 최저가 자동 검색',
  '공식 인증',
  '네이버 공식',
  '모든 OTA 비교',
];
const requiredFiles = [
  ...corePages.map((page) => page.file),
  'dist/sitemap.xml',
  'dist/robots.txt',
  'dist/favicon.ico',
  'dist/favicon-16x16.png',
  'dist/favicon-32x32.png',
  'dist/android-chrome-192x192.png',
  'dist/android-chrome-512x512.png',
  'dist/apple-touch-icon.png',
  'dist/site.webmanifest',
  'dist/api/resort-editor-reviews.json',
];

const failures = [];
const shownPath = (path) => relative(projectRoot, path).replaceAll('\\', '/');
const report = (file, message, details = []) => {
  const detailText = details.length ? `\n${details.join('\n')}` : '';
  failures.push(`${file}:\n${message}${detailText}`);
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const decodeHtml = (value = '') => value
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? '') : undefined;
};
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
const metaValues = (html, key, value) => tags(html, 'meta')
  .filter((tag) => attribute(tag, key)?.toLowerCase() === value.toLowerCase())
  .map((tag) => attribute(tag, 'content') ?? '');
const linkValues = (html, rel) => tags(html, 'link')
  .filter((tag) => (attribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/).includes(rel.toLowerCase()))
  .map((tag) => attribute(tag, 'href') ?? '');
const elementContents = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi'))]
  .map((match) => match[1]);
const textContent = (html = '') => decodeHtml(html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ')
  .trim();
const jsonLdNodes = (html = '') => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => attribute(`<script ${match[1]}>`, 'type')?.toLowerCase() === 'application/ld+json')
  .flatMap((match) => {
    try {
      const value = JSON.parse(match[2]);
      return Array.isArray(value?.['@graph']) ? value['@graph'] : [value];
    } catch {
      return [];
    }
  });
const first = (values) => values[0];
const absolute = (value, base = `${siteOrigin}/`) => {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
};
const htmlPathForUrl = (url) => {
  const pathname = decodeURIComponent(new URL(url).pathname);
  if (pathname === '/') return join(distDir, 'index.html');
  return join(distDir, ...pathname.split('/').filter(Boolean), 'index.html');
};

for (const file of requiredFiles) {
  try {
    await access(join(projectRoot, file));
  } catch {
    report(file, '필수 빌드 파일이 없습니다.');
  }
}

const readText = async (file) => {
  try {
    return await readFile(join(projectRoot, file), 'utf8');
  } catch {
    return null;
  }
};

const pageResults = [];
for (const page of corePages) {
  const html = await readText(page.file);
  if (!html) continue;
  const canonical = `${siteOrigin}${page.path}`;
  const title = textContent(first(elementContents(html, 'title')));
  const descriptions = metaValues(html, 'name', 'description');
  const canonicals = linkValues(html, 'canonical');
  const h1Values = elementContents(html, 'h1').map(textContent);
  const mainHtml = first(elementContents(html, 'main')) ?? '';
  const mainText = textContent(mainHtml);
  const rootTag = tags(html, 'div').find((tag) => attribute(tag, 'id') === 'root');
  const moduleScripts = tags(html, 'script').filter(
    (tag) => attribute(tag, 'type')?.toLowerCase() === 'module' && Boolean(attribute(tag, 'src')),
  );

  if (title !== page.title) report(page.file, '<title>이 예상과 다릅니다.', [`예상: ${page.title}`, `실제: ${title || '(없음)'}`]);
  if (descriptions.length !== 1 || descriptions[0] !== page.description) {
    report(page.file, 'meta description이 없거나 중복되었거나 예상과 다릅니다.', [`예상: ${page.description}`, `실제: ${descriptions.join(' | ') || '(없음)'}`]);
  }
  if (canonicals.length !== 1 || canonicals[0] !== canonical) {
    report(page.file, 'canonical이 자기 자신의 clean URL과 일치하지 않습니다.', [`예상: ${canonical}`, `실제: ${canonicals.join(' | ') || '(없음)'}`]);
  }
  try {
    const parsed = new URL(first(canonicals));
    if (parsed.protocol !== 'https:' || parsed.search || parsed.hash) {
      report(page.file, 'canonical은 query string과 hash가 없는 절대 HTTPS URL이어야 합니다.', [`canonical: ${first(canonicals)}`]);
    }
  } catch {
    report(page.file, 'canonical URL을 파싱할 수 없습니다.', [`canonical: ${first(canonicals) ?? '(없음)'}`]);
  }
  if (h1Values.length !== 1 || h1Values[0] !== page.heading) {
    report(page.file, '페이지에 정확히 하나의 고유한 H1이 필요합니다.', [`예상: ${page.heading}`, `실제: ${h1Values.join(' | ') || '(없음)'}`]);
  }
  if (!rootTag || attribute(rootTag, 'data-static-page') === 'true' || moduleScripts.length === 0) {
    report(page.file, '핵심 페이지는 정적 본문을 제공하면서 React SPA도 마운트할 수 있어야 합니다.', [
      `#root: ${rootTag ?? '(없음)'}`,
      `module script 개수: ${moduleScripts.length}`,
    ]);
  }

  const requiredMeta = [
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', '몰디브 바이블'],
    ['property', 'og:locale', 'ko_KR'],
    ['property', 'og:title', page.title],
    ['property', 'og:description', page.description],
    ['property', 'og:url', canonical],
    ['property', 'og:image', `${siteOrigin}${page.image}`],
    ['property', 'og:image:secure_url', `${siteOrigin}${page.image}`],
    ['property', 'og:image:type', 'image/jpeg'],
    ['property', 'og:image:width', String(page.imageWidth)],
    ['property', 'og:image:height', String(page.imageHeight)],
    ['property', 'og:image:alt', page.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', page.title],
    ['name', 'twitter:description', page.description],
    ['name', 'twitter:image', `${siteOrigin}${page.image}`],
    ['name', 'twitter:image:alt', page.imageAlt],
  ];
  for (const [key, name, expected] of requiredMeta) {
    const values = metaValues(html, key, name);
    if (values.length !== 1 || values[0] !== expected) {
      report(page.file, `${name} 메타 값이 없거나 중복되었거나 예상과 다릅니다.`, [`예상: ${expected}`, `실제: ${values.join(' | ') || '(없음)'}`]);
    }
  }
  const robots = metaValues(html, 'name', 'robots');
  if (robots.length !== 1 || !robots[0].includes('index') || !robots[0].includes('follow') || !robots[0].includes('max-image-preview:large')) {
    report(page.file, 'robots meta에 index, follow, max-image-preview:large가 모두 필요합니다.', [`실제: ${robots.join(' | ') || '(없음)'}`]);
  }
  const googlebot = metaValues(html, 'name', 'googlebot');
  if (googlebot.length > 1 || (googlebot.length === 1 && (!googlebot[0].includes('index') || !googlebot[0].includes('follow')))) {
    report(page.file, 'googlebot meta가 중복되었거나 robots 정책과 충돌합니다.', [`실제: ${googlebot.join(' | ')}`]);
  }

  const navMatch = html.match(/<nav\b[^>]*aria-label=["']몰디브 바이블 주요 메뉴["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (!navMatch) {
    report(page.file, 'aria-label="몰디브 바이블 주요 메뉴"인 공통 nav가 없습니다.');
  } else {
    const anchors = [...navMatch[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
      tag: `<a ${match[1]}>`,
      text: textContent(match[2]),
    }));
    for (const item of primaryLinks) {
      const anchor = anchors.find(({ tag }) => absolute(attribute(tag, 'href'), canonical) === `${siteOrigin}${item.path}`);
      if (!anchor) {
        report(page.file, `공통 nav에 ${item.path} 실제 <a href>가 없습니다.`);
      } else if (anchor.text !== item.label) {
        report(page.file, `공통 nav의 ${item.path} 앵커 텍스트가 명확하지 않습니다.`, [`예상: ${item.label}`, `실제: ${anchor.text}`]);
      }
      if (page.path === item.path && anchor && attribute(anchor.tag, 'aria-current') !== 'page') {
        report(page.file, '현재 페이지 메뉴 링크에 aria-current="page"가 없습니다.', [`href: ${item.path}`]);
      }
    }
  }

  const imageUrl = `${siteOrigin}${page.image}`;
  const representativeImages = tags(mainHtml, 'img').filter((tag) => absolute(attribute(tag, 'src'), canonical) === imageUrl);
  if (representativeImages.length !== 1) {
    report(page.file, 'OG 대표 이미지와 같은 URL의 본문 <img>가 정확히 하나 필요합니다.', [`이미지: ${imageUrl}`, `개수: ${representativeImages.length}`]);
  } else {
    const image = representativeImages[0];
    if (attribute(image, 'alt') !== page.imageAlt) report(page.file, '대표 이미지 alt가 비었거나 페이지 정의와 다릅니다.', [`예상: ${page.imageAlt}`, `실제: ${attribute(image, 'alt') ?? '(없음)'}`]);
    if (attribute(image, 'width') !== String(page.imageWidth) || attribute(image, 'height') !== String(page.imageHeight)) {
      report(page.file, '대표 이미지 width/height가 실제 크기 정의와 다릅니다.', [`예상: ${page.imageWidth}x${page.imageHeight}`, `실제: ${attribute(image, 'width')}x${attribute(image, 'height')}`]);
    }
    if (attribute(image, 'loading')?.toLowerCase() === 'lazy') report(page.file, '첫 대표 이미지에 loading="lazy"를 사용하면 안 됩니다.');
  }

  if (mainText.length < (page.path === '/' ? 350 : 700)) {
    report(page.file, '정적 본문이 지나치게 짧습니다.', [`본문 길이: ${mainText.length}자`]);
  }
  if (/<div\s+id=["']root["']\s*>\s*<\/div>/i.test(html)) report(page.file, '빈 #root만 있는 페이지는 허용되지 않습니다.');
  for (const topic of page.topics) {
    if (!mainText.includes(topic)) report(page.file, `본문에 페이지 핵심 주제 "${topic}"가 없습니다.`);
  }
  for (const phrase of forbiddenPhrases) {
    if ([title, descriptions[0], h1Values[0], mainText].filter(Boolean).some((value) => value.includes(phrase))) {
      report(page.file, `금지 표현 "${phrase}"이 title, description, H1 또는 주요 본문에 있습니다.`);
    }
  }

  const jsonLdMatches = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attribute(`<script ${match[1]}>`, 'type')?.toLowerCase() === 'application/ld+json');
  const jsonLd = [];
  for (const match of jsonLdMatches) {
    try {
      jsonLd.push(JSON.parse(match[2]));
    } catch (error) {
      report(page.file, 'JSON-LD를 파싱할 수 없습니다.', [error.message]);
    }
  }
  if (jsonLd.length === 0) report(page.file, 'application/ld+json 구조화 데이터가 없습니다.');
  const schemaNodes = jsonLd.flatMap((item) => item?.['@graph'] ?? [item]).filter(Boolean);
  const webPage = schemaNodes.find((node) => {
    const types = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
    return types.includes('WebPage');
  });
  if (!webPage || webPage.url !== canonical) {
    report(page.file, 'JSON-LD WebPage.url이 canonical과 일치하지 않습니다.', [`canonical: ${canonical}`, `WebPage.url: ${webPage?.url ?? '(없음)'}`]);
  } else {
    const primary = webPage.primaryImageOfPage;
    if (!primary || primary.url !== imageUrl || Number(primary.width) !== page.imageWidth || Number(primary.height) !== page.imageHeight) {
      report(page.file, 'WebPage.primaryImageOfPage가 OG 이미지 URL·크기와 일치하지 않습니다.', [`예상: ${imageUrl} (${page.imageWidth}x${page.imageHeight})`, `실제: ${JSON.stringify(primary)}`]);
    }
  }
  if (page.path === '/') {
    const organization = schemaNodes.find((node) => node?.['@type'] === 'Organization');
    const website = schemaNodes.find((node) => node?.['@type'] === 'WebSite');
    for (const [type, node] of [['Organization', organization], ['WebSite', website]]) {
      if (!node || node.name !== '몰디브 바이블' || !Array.isArray(node.alternateName) || !node.alternateName.includes('Maldives Bible') || !node.alternateName.includes('몰디브바이블')) {
        report(page.file, `${type} 사이트명·alternateName 구조화 데이터가 예상과 다릅니다.`);
      }
    }
  } else {
    const breadcrumb = schemaNodes.find((node) => node?.['@type'] === 'BreadcrumbList');
    const lastItem = breadcrumb?.itemListElement?.at(-1);
    if (!breadcrumb || lastItem?.item !== canonical) {
      report(page.file, 'BreadcrumbList가 없거나 마지막 item이 canonical과 일치하지 않습니다.', [`canonical: ${canonical}`, `breadcrumb item: ${lastItem?.item ?? '(없음)'}`]);
    }
  }
  pageResults.push({ page, html, canonical, title, description: descriptions[0], h1: h1Values[0] });
}

for (const field of ['title', 'description', 'canonical', 'h1']) {
  const values = pageResults.map((result) => result[field]);
  if (values.length === corePages.length && new Set(values).size !== values.length) {
    report('dist/', `핵심 페이지별 ${field} 값이 고유하지 않습니다.`, values);
  }
}

const clientSeoSource = await readText('seoPages.ts');
if (!clientSeoSource) {
  report('seoPages.ts', '클라이언트 SEO 정의 파일을 읽을 수 없습니다.');
} else {
  for (const page of corePages) {
    for (const expected of [page.path, page.title, page.description, page.heading, page.image, page.imageAlt]) {
      if (!clientSeoSource.includes(expected)) {
        report('seoPages.ts', '클라이언트 SEO 정의와 빌드 결과의 핵심 값이 일치하지 않습니다.', [
          `페이지: ${page.path}`,
          `누락 값: ${expected}`,
        ]);
      }
    }
  }
}

const navBarSource = await readText('components/NavBar.tsx');
if (!navBarSource || !/<a\b/.test(navBarSource) || /<button\b/.test(navBarSource)) {
  report('components/NavBar.tsx', '주요 메뉴는 button이 아닌 실제 <a href> 링크로 구성되어야 합니다.');
}

const checkedImages = new Set();
for (const page of corePages) {
  if (checkedImages.has(page.image)) continue;
  checkedImages.add(page.image);
  const file = join(distDir, ...page.image.split('/').filter(Boolean));
  try {
    const buffer = await readFile(file);
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if (!isJpeg) report(shownPath(file), '.jpg 확장자와 실제 JPEG MIME 시그니처가 일치하지 않습니다.');
  } catch {
    report(shownPath(file), '대표 이미지 파일이 없습니다.');
  }
}

const sitemapFile = 'dist/sitemap.xml';
const sitemap = await readText(sitemapFile);
const sitemapUrls = sitemap ? [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decodeHtml(match[1].trim())) : [];
if (sitemap) {
  if (new Set(sitemapUrls).size !== sitemapUrls.length) report(sitemapFile, 'sitemap <loc>에 중복 URL이 있습니다.');
  if (sitemapUrls.length < 188) report(sitemapFile, `sitemap URL이 기존 검증 기준보다 적습니다: ${sitemapUrls.length}`);
  if (sitemap.includes('?view=')) report(sitemapFile, 'sitemap에 ?view= query URL이 있습니다.');
  if (sitemapUrls.some((url) => url.includes('#'))) report(sitemapFile, 'sitemap <loc>에 hash URL이 있습니다.');
  for (const page of corePages) {
    const expected = `${siteOrigin}${page.path}`;
    if (!sitemapUrls.includes(expected)) report(sitemapFile, `핵심 clean URL이 sitemap에 없습니다.`, [expected]);
  }
  for (const url of sitemapUrls) {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== siteOrigin || parsed.protocol !== 'https:' || parsed.search || parsed.hash) report(sitemapFile, 'sitemap에 canonical로 쓸 수 없는 URL이 있습니다.', [url]);
      await access(htmlPathForUrl(url));
    } catch (error) {
      report(sitemapFile, 'sitemap URL에 대응하는 정적 HTML 파일이 없거나 URL이 잘못됐습니다.', [url, error.message]);
    }
  }
  const lastmods = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((match) => match[1]);
  if (lastmods.length !== sitemapUrls.length) report(sitemapFile, '모든 sitemap URL에 명시적 lastmod가 필요합니다.', [`URL: ${sitemapUrls.length}, lastmod: ${lastmods.length}`]);
  for (const value of lastmods) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value > today) report(sitemapFile, '잘못된 형식이거나 미래인 lastmod가 있습니다.', [value]);
  }
}

const sitemapPageEntries = new Map();
const inbound = new Map(sitemapUrls.map((url) => [url, new Set()]));
for (const url of sitemapUrls) {
  let html;
  try {
    html = await readFile(htmlPathForUrl(url), 'utf8');
  } catch {
    continue;
  }
  sitemapPageEntries.set(url, html);
  if (elementContents(html, 'h1').length === 0) report(shownPath(htmlPathForUrl(url)), 'sitemap에 등록된 페이지에 H1이 없습니다.');
  const canonical = first(linkValues(html, 'canonical'));
  if (canonical !== url) report(shownPath(htmlPathForUrl(url)), 'canonical과 sitemap <loc>가 일치하지 않습니다.', [`canonical: ${canonical ?? '(없음)'}`, `sitemap: ${url}`]);
  const schemas = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attribute(`<script ${match[1]}>`, 'type')?.toLowerCase() === 'application/ld+json');
  if (schemas.length === 0) report(shownPath(htmlPathForUrl(url)), 'sitemap에 등록된 페이지에 JSON-LD가 없습니다.');
  const serialized = schemas.map((match) => match[2]).join(' ');
  if (new URL(url).pathname.startsWith('/resorts/')) {
    if (!serialized.includes('"@type":"Hotel"')) report(shownPath(htmlPathForUrl(url)), '리조트 상세 페이지에 Hotel 구조화 데이터가 없습니다.');
    if (!serialized.includes('"@type":"WebPage"')) report(shownPath(htmlPathForUrl(url)), '리조트 상세 페이지에 WebPage 구조화 데이터가 없습니다.');
  }
  for (const match of serialized.matchAll(/"date(?:Published|Modified)":"(\d{4}-\d{2}-\d{2})"/g)) {
    if (match[1] > today) report(shownPath(htmlPathForUrl(url)), '구조화 데이터의 콘텐츠 날짜가 미래입니다.', [match[1]]);
  }
  for (const anchor of tags(html, 'a')) {
    const href = attribute(anchor, 'href');
    const targetValue = absolute(href, url);
    if (!targetValue) continue;
    const target = new URL(targetValue);
    if (target.origin !== siteOrigin) continue;
    target.search = '';
    target.hash = '';
    const normalized = target.toString();
    if (normalized !== url && inbound.has(normalized)) inbound.get(normalized).add(url);
  }
}
for (const [url, sources] of inbound) {
  if (url !== `${siteOrigin}/` && sources.size === 0) report(sitemapFile, '다른 sitemap 페이지에서 도달할 수 없는 URL이 있습니다.', [url]);
}

const glossary = sitemapPageEntries.get(`${siteOrigin}/maldives-glossary/`);
if (!glossary) report(sitemapFile, '몰디브 용어집 URL이 sitemap에 없습니다.');
else {
  if (!glossary.includes('"@type":"DefinedTermSet"')) report('dist/maldives-glossary/index.html', 'DefinedTermSet 구조화 데이터가 없습니다.');
  const termCount = (glossary.match(/"@type":"DefinedTerm"/g) ?? []).length;
  if (termCount !== 43) report('dist/maldives-glossary/index.html', `DefinedTerm은 43개여야 합니다: ${termCount}`);
}
const about = sitemapPageEntries.get(`${siteOrigin}/about/`);
if (!about) report(sitemapFile, '소개·편집 기준 URL이 sitemap에 없습니다.');
else if (!about.includes('"@type":"AboutPage"')) report('dist/about/index.html', 'AboutPage 구조화 데이터가 없습니다.');
const directory = sitemapPageEntries.get(`${siteOrigin}/maldives-resorts/`);
if (!directory) report(sitemapFile, '전체 리조트 목록 URL이 sitemap에 없습니다.');
else {
  const directoryLinks = tags(directory, 'a').filter((tag) => /^https:\/\/www\.maldivesbible\.com\/resorts\//.test(attribute(tag, 'href') ?? '')).length;
  if (directoryLinks !== 171) report('dist/maldives-resorts/index.html', `리조트 상세 링크는 171개여야 합니다: ${directoryLinks}`);
}

const editorReviewFile = 'dist/api/resort-editor-reviews.json';
const editorReviewText = await readText(editorReviewFile);
if (editorReviewText) {
  try {
    const editorReviews = JSON.parse(editorReviewText);
    if (!Array.isArray(editorReviews.items) || editorReviews.items.length < 35) {
      report(editorReviewFile, `에디터 리뷰는 최소 35개여야 합니다: ${editorReviews.items?.length ?? 0}`);
    } else {
      const resortPages = [...sitemapPageEntries.entries()]
        .filter(([url]) => new URL(url).pathname.startsWith('/resorts/'));
      for (const item of editorReviews.items) {
        const review = item?.editorReview;
        if (!review?.title || !review?.dek || !Array.isArray(review?.paragraphs) || !review?.verdict) {
          report(editorReviewFile, `에디터 리뷰 필드가 비었습니다: resortId=${item?.resortId ?? 'unknown'}`);
          continue;
        }
        const matches = resortPages.filter(([, html]) => textContent(html).includes(review.title));
        if (matches.length !== 1) {
          report(editorReviewFile, `에디터 리뷰가 정확히 한 개의 정적 리조트 페이지에 있어야 합니다: resortId=${item.resortId}`, [`matches: ${matches.length}`]);
          continue;
        }
        const [url, html] = matches[0];
        const file = shownPath(htmlPathForUrl(url));
        const schemaNodes = jsonLdNodes(html);
        const hotelNode = schemaNodes.find((node) => node?.['@type'] === 'Hotel');
        const articleNode = schemaNodes.find((node) => node?.['@type'] === 'Article');
        const resortName = String(hotelNode?.name ?? '').trim();
        if (!resortName) {
          report(file, 'Hotel 구조화 데이터의 정확한 리조트명이 없습니다.');
          continue;
        }
        const expectedTitle = `${resortName} 에디터 리뷰 | 몰디브 바이블`;
        const actualTitle = textContent(first(elementContents(html, 'title')) ?? '');
        if (actualTitle !== expectedTitle) {
          report(file, '에디터 리뷰 페이지 title 형식이 올바르지 않습니다.', [actualTitle, expectedTitle]);
        }
        const metaDescription = first(metaValues(html, 'name', 'description')) ?? '';
        const expectedDescription = `${resortName} 에디터 리뷰. ${review.dek}`;
        if (metaDescription !== expectedDescription) {
          report(file, '정확한 리조트명과 dek가 meta description에 일치하지 않습니다.', [metaDescription, expectedDescription]);
        }
        const h1 = textContent(first(elementContents(html, 'h1')) ?? '');
        if (h1 !== resortName) report(file, 'H1과 Hotel 구조화 데이터의 리조트명이 일치하지 않습니다.', [h1, resortName]);
        if (!review.title.includes(resortName)) report(file, '에디터 리뷰 제목에 정확한 리조트명이 없습니다.', [review.title, resortName]);
        if (!html.includes('class="seo-editor-review"')) report(file, '사용자에게 보이는 에디터 리뷰 article이 없습니다.');
        for (const paragraph of review.paragraphs) {
          if (!textContent(html).includes(paragraph)) report(file, '에디터 리뷰 본문 문단이 정적 HTML에서 누락됐습니다.', [paragraph]);
        }
        if (!textContent(html).includes(review.verdict)) report(file, '에디터 결론이 정적 HTML에서 누락됐습니다.');
        if (!articleNode || articleNode.headline !== review.title) report(file, '에디터 리뷰 Article headline이 사용자 화면과 일치하지 않습니다.');
        if (articleNode?.about?.['@id'] !== hotelNode?.['@id']) report(file, 'Article과 Hotel 구조화 데이터가 같은 리조트를 가리키지 않습니다.');
      }
    }
  } catch (error) {
    report(editorReviewFile, '에디터 리뷰 JSON을 파싱할 수 없습니다.', [error.message]);
  }
}

const robotsFile = 'dist/robots.txt';
const robots = await readText(robotsFile);
if (robots) {
  if (!/^Sitemap:\s*https:\/\/www\.maldivesbible\.com\/sitemap\.xml\s*$/im.test(robots)) report(robotsFile, '절대 URL sitemap 지정이 없습니다.');
  const protectedPaths = ['/start/', '/maldives-resort-comparison/', '/quote-comparison/', '/flight-guide/', '/images/'];
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gim)].map((match) => match[1]);
  for (const path of protectedPaths) {
    if (disallowed.some((rule) => rule === '/' || path.startsWith(rule))) report(robotsFile, `핵심 경로가 robots.txt에서 차단됩니다: ${path}`);
  }
}

const manifestFile = 'dist/site.webmanifest';
const manifestText = await readText(manifestFile);
if (manifestText) {
  try {
    const manifest = JSON.parse(manifestText);
    if (manifest.name !== '몰디브 바이블' || manifest.short_name !== '몰디브 바이블') report(manifestFile, 'name과 short_name이 몰디브 바이블 브랜드와 일치하지 않습니다.');
  } catch (error) {
    report(manifestFile, 'JSON을 파싱할 수 없습니다.', [error.message]);
  }
}

if (failures.length > 0) {
  console.error(`[SEO validation failed]\n${failures.join('\n\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${sitemapUrls.length} crawlable URLs, five unique core pages, metadata, representative images, schema graphs, sitemap, robots, and internal links.`);
}
