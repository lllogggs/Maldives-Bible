import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const distDir = join(projectRoot, 'dist');
const siteOrigin = 'https://www.maldivesbible.com';

const sitemap = await readFile(join(distDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap URL은 중복되면 안 됩니다.');
assert.ok(sitemapUrls.length >= 188, `sitemap URL이 예상보다 적습니다: ${sitemapUrls.length}`);

const toHtmlPath = (url) => {
  const pathname = decodeURI(new URL(url).pathname);
  if (pathname === '/') return join(distDir, 'index.html');
  return join(distDir, ...pathname.split('/').filter(Boolean), 'index.html');
};

const pageEntries = await Promise.all(
  sitemapUrls.map(async (url) => ({ url, html: await readFile(toHtmlPath(url), 'utf8') }))
);

const home = pageEntries.find((entry) => entry.url === `${siteOrigin}/`);
assert.ok(home, '홈 URL이 sitemap에 있어야 합니다.');
assert.match(home.html, /<div id="root">[\s\S]*?<h1>/, '홈 원문 HTML에 H1이 있어야 합니다.');
assert.match(home.html, /몰디브 리조트 비교/, '홈 원문 HTML에 핵심 주제가 있어야 합니다.');
assert.doesNotMatch(home.html, /google-site-verification"\s+content=""/, '빈 Google 인증 태그를 배포하면 안 됩니다.');

const inbound = new Map(sitemapUrls.map((url) => [url, new Set()]));
for (const page of pageEntries) {
  assert.match(page.html, /<h1(?:\s|>)/, `${page.url}에 H1이 없습니다.`);
  assert.match(page.html, new RegExp(`<link rel="canonical" href="${page.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${page.url} canonical이 맞지 않습니다.`);

  const jsonLdScripts = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(jsonLdScripts.length > 0, `${page.url}에 JSON-LD가 없습니다.`);
  const jsonLd = jsonLdScripts.map((match) => JSON.parse(match[1]));
  const serialized = JSON.stringify(jsonLd);
  if (page.url !== `${siteOrigin}/`) {
    assert.doesNotMatch(serialized, /"@type":"WebSite"/, `${page.url}에 WebSite 스키마가 중복됩니다.`);
    assert.match(serialized, /"@type":"BreadcrumbList"/, `${page.url}에 BreadcrumbList가 없습니다.`);
  }
  if (new URL(page.url).pathname.startsWith('/resorts/')) {
    assert.match(serialized, /"@type":"Hotel"/, `${page.url}에 Hotel 스키마가 없습니다.`);
    assert.match(serialized, /"@type":"WebPage"/, `${page.url}에 WebPage 스키마가 없습니다.`);
  }

  for (const date of serialized.matchAll(/"date(?:Published|Modified)":"(\d{4}-\d{2}-\d{2})"/g)) {
    assert.ok(date[1] <= '2026-07-27', `${page.url}의 콘텐츠 날짜가 미래입니다.`);
  }

  for (const match of page.html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    try {
      const target = new URL(match[1], page.url);
      if (target.origin !== siteOrigin) continue;
      target.search = '';
      target.hash = '';
      const normalized = target.toString();
      if (normalized !== page.url && inbound.has(normalized)) inbound.get(normalized).add(page.url);
    } catch {
      // 잘못된 외부 링크는 이 내부 링크 그래프 검사 범위에 포함하지 않습니다.
    }
  }
}

for (const [url, sources] of inbound) {
  if (url === `${siteOrigin}/`) continue;
  assert.ok(sources.size > 0, `${url}로 향하는 다른 색인 페이지의 링크가 없습니다.`);
}

const glossary = pageEntries.find((entry) => entry.url.endsWith('/maldives-glossary/'));
assert.ok(glossary, '독립 몰디브 용어집이 sitemap에 있어야 합니다.');
assert.match(glossary.html, /"@type":"DefinedTermSet"/);
assert.equal((glossary.html.match(/"@type":"DefinedTerm"/g) || []).length, 43);

const about = pageEntries.find((entry) => entry.url.endsWith('/about/'));
assert.ok(about, '소개·편집 기준 페이지가 sitemap에 있어야 합니다.');
assert.match(about.html, /"@type":"AboutPage"/);

const directory = pageEntries.find((entry) => entry.url.endsWith('/maldives-resorts/'));
assert.ok(directory, '전체 리조트 목록 페이지가 sitemap에 있어야 합니다.');
assert.equal((directory.html.match(/href="https:\/\/www\.maldivesbible\.com\/resorts\//g) || []).length, 171);

assert.equal((sitemap.match(/<lastmod>/g) || []).length, sitemapUrls.length, '모든 sitemap URL에 명시적 lastmod가 있어야 합니다.');
console.log(`Validated ${sitemapUrls.length} crawlable URLs, schema graphs, canonicals, dates, and inbound links.`);
