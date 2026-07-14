import { promises as fs } from 'node:fs';
import path from 'node:path';

export const EXPECTED_RESORT_COUNT = 171;
export const RAW_SCHEMA_VERSION = 1;
export const CURATED_SCHEMA_VERSION = 1;
export const REVIEW_BASIS = 'naver-api-hub-blog-search-snippets';
export const API_ENDPOINT = 'https://naverapihub.apigw.ntruss.com/search/v1/blog';

const HTML_ENTITIES = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', ' '],
]);

export function decodeHtml(value = '') {
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith('#')) {
      const hex = entity[1]?.toLowerCase() === 'x';
      const number = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(number) && number >= 0 && number <= 0x10ffff ? String.fromCodePoint(number) : match;
    }

    return HTML_ENTITIES.get(entity.toLowerCase()) ?? match;
  });
}

export function plainText(value = '') {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeText(value = '') {
  return plainText(value)
    .normalize('NFKC')
    .toLocaleLowerCase('ko-KR')
    .replace(/[^0-9a-z가-힣]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalizeBlogUrl(value = '') {
  const decoded = decodeHtml(value).trim();
  if (!decoded) return '';

  try {
    const url = new URL(decoded);
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'm.blog.naver.com' || hostname === 'blog.naver.com') {
      const blogId = url.searchParams.get('blogId');
      const logNo = url.searchParams.get('logNo');
      if (blogId && logNo) {
        return `https://blog.naver.com/${encodeURIComponent(blogId)}/${encodeURIComponent(logNo)}`;
      }

      const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
        return `https://blog.naver.com/${encodeURIComponent(parts[0])}/${parts[1]}`;
      }

      url.hostname = 'blog.naver.com';
      url.protocol = 'https:';
      url.hash = '';
      for (const key of [...url.searchParams.keys()]) {
        if (!['blogId', 'logNo'].includes(key)) url.searchParams.delete(key);
      }
      return url.toString().replace(/\/$/, '');
    }

    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return decoded;
  }
}

export function isNaverBlogUrl(value = '') {
  try {
    const hostname = new URL(decodeHtml(value)).hostname.toLowerCase();
    return hostname === 'blog.naver.com' || hostname === 'm.blog.naver.com';
  } catch {
    return false;
  }
}

export function buildSearchQueries(resort) {
  const queries = [
    `${resort.name} 몰디브 리조트 후기`,
    resort.name_en ? `${resort.name_en} 몰디브 리조트 후기` : '',
  ];
  return [...new Set(queries.map((query) => query.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}

function compact(value) {
  return normalizeText(value).replace(/\s+/g, '');
}

export function relevanceFor(item, resort) {
  const haystack = normalizeText(`${item.titleText ?? item.title ?? ''} ${item.descriptionText ?? item.description ?? ''}`);
  const compactHaystack = haystack.replace(/\s+/g, '');
  const koreanName = compact(resort.name);
  const genericNameTokens = new Set(['몰디브', '리조트', '호텔', '아일랜드', '섬', '스파', '빌라', 'resort', 'hotel', 'island', 'spa', 'villa', 'maldives']);
  const koreanTokens = normalizeText(resort.name)
    .split(' ')
    .filter((token) => token.length >= 2 && !genericNameTokens.has(token));
  const koreanHits = koreanTokens.filter((token) => haystack.includes(token)).length;
  const englishTokens = normalizeText(resort.name_en)
    .split(' ')
    .filter((token) => token.length >= 3 && !['the', 'and', 'resort', 'maldives', 'hotel', 'island', 'spa', 'villa'].includes(token));
  const englishHits = englishTokens.filter((token) => haystack.includes(token)).length;
  const hasKoreanName = koreanName.length >= 2 && compactHaystack.includes(koreanName);
  const hasEnoughKoreanTokens = koreanTokens.length > 0 && koreanHits >= Math.min(2, koreanTokens.length);
  const hasEnoughEnglishTokens = englishTokens.length > 0 && englishHits >= Math.min(2, englishTokens.length);
  const compactEnglishName = compact(resort.name_en);
  const hasExactEnglishName = compactEnglishName.length >= 5 && compactHaystack.includes(compactEnglishName);
  const hasMaldivesContext = /몰디브|maldives/.test(haystack);

  return {
    relevant: hasExactEnglishName || (hasMaldivesContext && (hasKoreanName || hasEnoughKoreanTokens || hasEnoughEnglishTokens)),
    hasKoreanName,
    koreanTokenHits: koreanHits,
    koreanTokenCount: koreanTokens.length,
    englishTokenHits: englishHits,
    englishTokenCount: englishTokens.length,
    hasExactEnglishName,
    hasMaldivesContext,
  };
}

export function disclosureFlags(item) {
  const title = normalizeText(item.titleText ?? item.title ?? '');
  const text = normalizeText(`${item.titleText ?? item.title ?? ''} ${item.descriptionText ?? item.description ?? ''}`);
  return {
    commercialDisclosure: /협찬|광고|원고료|제품 제공|서비스 제공|소정의|파트너스|제휴/.test(text),
    possibleSalesContent:
      /예약 문의|예약문의|견적 문의|견적문의|상담 문의|상담문의|예약 링크|예약링크|예약 바로가기/.test(text)
      || /할인 코드|할인코드|쿠폰|특가|프로모션|공동 구매|공동구매|최저가|아고다|agoda|트립닷컴|trip com|부킹닷컴|booking com|익스피디아|expedia|호텔스닷컴|hotels com|여행사/.test(title),
  };
}

export function normalizeApiItem(item, rawRank, query, queryIndex, fetchedAt) {
  const titleText = plainText(item.title);
  const descriptionText = plainText(item.description);
  const canonicalUrl = canonicalizeBlogUrl(item.link);
  return {
    rawRank,
    query,
    queryIndex,
    fetchedAt,
    raw: {
      title: String(item.title ?? ''),
      link: String(item.link ?? ''),
      description: String(item.description ?? ''),
      bloggerName: String(item.bloggername ?? ''),
      bloggerLink: String(item.bloggerlink ?? ''),
      postDate: String(item.postdate ?? ''),
    },
    titleText,
    descriptionText,
    canonicalUrl,
    bloggerName: plainText(item.bloggername),
    bloggerLink: canonicalizeBlogUrl(item.bloggerlink),
    postDate: String(item.postdate ?? ''),
    isNaverBlog: isNaverBlogUrl(item.link),
  };
}

function occurrenceKey(item) {
  if (item.canonicalUrl) return `url:${item.canonicalUrl.toLowerCase()}`;
  return `fallback:${normalizeText(item.titleText)}|${normalizeText(item.bloggerName)}|${item.postDate}`;
}

export function buildCandidatePool(queryRuns, resort, targetCount = 10) {
  const deduped = new Map();

  for (const run of queryRuns) {
    for (const item of run.items) {
      if (!item.isNaverBlog) continue;
      const key = occurrenceKey(item);
      const existing = deduped.get(key);
      const occurrence = {
        query: item.query,
        queryIndex: item.queryIndex,
        rawRank: item.rawRank,
        fetchedAt: item.fetchedAt,
      };

      if (existing) {
        existing.occurrences.push(occurrence);
        continue;
      }

      const relevance = relevanceFor(item, resort);
      deduped.set(key, {
        canonicalUrl: item.canonicalUrl,
        title: item.titleText,
        description: item.descriptionText,
        bloggerName: item.bloggerName,
        bloggerLink: item.bloggerLink,
        postDate: item.postDate,
        relevance,
        flags: disclosureFlags(item),
        occurrences: [occurrence],
      });
    }
  }

  const ordered = [...deduped.values()].sort((a, b) => {
    const aOccurrence = a.occurrences[0];
    const bOccurrence = b.occurrences[0];
    return aOccurrence.queryIndex - bOccurrence.queryIndex || aOccurrence.rawRank - bOccurrence.rawRank;
  });
  const relevant = ordered.filter((candidate) => candidate.relevance.relevant);
  const fallback = ordered.filter((candidate) => !candidate.relevance.relevant);
  const shortlist = [...relevant, ...fallback].slice(0, targetCount).map((candidate, index) => ({
    candidateRank: index + 1,
    selection: candidate.relevance.relevant ? 'relevant' : 'fallback-needs-manual-review',
    ...candidate,
  }));

  return {
    allUniqueCount: ordered.length,
    relevantCount: relevant.length,
    shortlist,
  };
}

export async function loadResorts({ rootDir = process.cwd(), expectedCount = EXPECTED_RESORT_COUNT } = {}) {
  const apiDir = path.join(rootDir, 'public', 'api');
  const filenames = (await fs.readdir(apiDir))
    .filter((filename) => /^resorts\d*\.json$/.test(filename))
    .sort((a, b) => resortFileIndex(a) - resortFileIndex(b));
  if (filenames.length === 0) throw new Error(`리조트 JSON 파일을 찾지 못했습니다: ${apiDir}`);

  const resorts = [];
  for (const filename of filenames) {
    const body = await fs.readFile(path.join(apiDir, filename), 'utf8');
    const chunk = JSON.parse(body);
    if (!Array.isArray(chunk)) throw new Error(`${filename}의 최상위 값이 배열이 아닙니다.`);
    resorts.push(...chunk);
  }

  const ids = new Set();
  for (const resort of resorts) {
    if (!Number.isInteger(resort.id) || !resort.name || !resort.name_en) {
      throw new Error(`필수 필드(id, name, name_en)가 없는 리조트가 있습니다: ${JSON.stringify(resort)}`);
    }
    if (ids.has(resort.id)) throw new Error(`중복 리조트 id: ${resort.id}`);
    ids.add(resort.id);
  }
  if (expectedCount != null && resorts.length !== expectedCount) {
    throw new Error(`리조트 수가 예상과 다릅니다. expected=${expectedCount}, actual=${resorts.length}`);
  }
  return resorts;
}

function resortFileIndex(filename) {
  const match = filename.match(/^resorts(\d*)\.json$/);
  return match?.[1] ? Number(match[1]) : 1;
}

export async function readJsonIfExists(filename) {
  try {
    return JSON.parse(await fs.readFile(filename, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function writeJsonAtomic(filename, value) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(temporary, filename);
}

export function cacheIsFresh(cache, resort, maxAgeDays, configKey) {
  if (!cache || cache.status !== 'complete' || cache.schemaVersion !== RAW_SCHEMA_VERSION) return false;
  if (cache.resort?.id !== resort.id || cache.collection?.configKey !== configKey) return false;
  const collectedAt = Date.parse(cache.collectedAt);
  if (!Number.isFinite(collectedAt)) return false;
  return Date.now() - collectedAt <= maxAgeDays * 86_400_000;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
