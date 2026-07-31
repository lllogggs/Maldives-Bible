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
  const queries = [`${resort.name} 몰디브 리조트 후기`, resort.name_en ? `${resort.name_en} 몰디브 리조트 후기` : ''];
  return [...new Set(queries.map(query => query.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}

function compact(value) {
  return normalizeText(value).replace(/\s+/g, '');
}

export function relevanceFor(item, resort) {
  const haystack = normalizeText(
    `${item.titleText ?? item.title ?? ''} ${item.descriptionText ?? item.description ?? ''}`
  );
  const compactHaystack = haystack.replace(/\s+/g, '');
  const koreanName = compact(resort.name);
  const genericNameTokens = new Set([
    '몰디브',
    '리조트',
    '호텔',
    '아일랜드',
    '섬',
    '스파',
    '빌라',
    'resort',
    'hotel',
    'island',
    'spa',
    'villa',
    'maldives',
  ]);
  const koreanTokens = normalizeText(resort.name)
    .split(' ')
    .filter(token => token.length >= 2 && !genericNameTokens.has(token));
  const koreanHits = koreanTokens.filter(token => haystack.includes(token)).length;
  const englishTokens = normalizeText(resort.name_en)
    .split(' ')
    .filter(
      token =>
        token.length >= 3 && !['the', 'and', 'resort', 'maldives', 'hotel', 'island', 'spa', 'villa'].includes(token)
    );
  const englishHits = englishTokens.filter(token => haystack.includes(token)).length;
  const hasKoreanName = koreanName.length >= 2 && compactHaystack.includes(koreanName);
  const hasEnoughKoreanTokens = koreanTokens.length > 0 && koreanHits >= Math.min(2, koreanTokens.length);
  const hasEnoughEnglishTokens = englishTokens.length > 0 && englishHits >= Math.min(2, englishTokens.length);
  const compactEnglishName = compact(resort.name_en);
  const hasExactEnglishName = compactEnglishName.length >= 5 && compactHaystack.includes(compactEnglishName);
  const hasMaldivesContext = /몰디브|maldives/.test(haystack);

  return {
    relevant:
      hasExactEnglishName || (hasMaldivesContext && (hasKoreanName || hasEnoughKoreanTokens || hasEnoughEnglishTokens)),
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
      /예약 문의|예약문의|견적 문의|견적문의|상담 문의|상담문의|예약 링크|예약링크|예약 바로가기/.test(text) ||
      /할인 코드|할인코드|쿠폰|특가|프로모션|공동 구매|공동구매|최저가|아고다|agoda|트립닷컴|trip com|부킹닷컴|booking com|익스피디아|expedia|호텔스닷컴|hotels com|여행사/.test(
        title
      ),
  };
}

const FIRSTHAND_SALES_TITLE_PATTERN =
  /할인\s*코드|쿠폰|특가|프로모션|공동\s*구매|최저가|가격\s*비교|예약\s*(?:가능|문의|바로|사이트|하기)|견적\s*문의|상담\s*문의|패키지|아고다|트립\s*닷컴|부킹\s*닷컴|익스피디아|호텔스\s*닷컴|박람회|여행사|인스펙션|출장\s*후기|다른\s*사람들?\s*후기|사용\s*후기|사용자\s*후기|찐\s*사용자/;
const FIRSTHAND_SALES_DESCRIPTION_PATTERN =
  /할인\s*코드|쿠폰\s*(?:받|적용)|최대\s*\d{1,3}\s*%\s*할인|예약\s*(?:가능\s*확인|바로가기|문의)|견적\s*(?:이\s*궁금|문의)|상담\s*문의|문의\s*(?:주세요|바랍니다)|클릭\s*(?:하세요|하기)|제휴\s*링크|파트너스|공동\s*구매|허니문\s*고객|고객님.{0,20}후기|후기.{0,20}고객님|다녀온\s*분들의\s*후기|후기(?:를|들을)?\s*(?:보면|볼\s*때|참고)|실제\s*투숙객|사용자\s*후기|방문한\s*여행자|높은\s*평가를\s*받/;
const FIRSTHAND_PROFESSIONAL_BLOGGER_PATTERN =
  /여행사|허니문\s*리조트|하이\s*몰디브|팜\s*투어|투어민|여행\s*플래너|트래블\s*컨설턴트/;
const FIRSTHAND_PLANNING_TITLE_PATTERN =
  /신혼\s*여행\s*준비|허니문\s*준비|후보\s*\d*곳?|리조트\s*후보|비교\s*후기|리조트\s*비교|고르는\s*(?:법|팁)|선택\s*(?:이유|법|팁)|총정리|완벽\s*가이드|알아보기|\bbest\b|\btop\s*\d+|순위|리스트/;
const FIRSTHAND_INTRO_TITLE_PATTERN =
  /소개합니다|리조트\s*소개|호텔\s*소개|숙소\s*소개|추천\s*리조트|리조트\s*추천|인테리어/;
const FIRSTHAND_EXPLICIT_TITLE_PATTERN =
  /후기|여행기|다녀|숙박|투숙|체크\s*인|체크\s*아웃|룸\s*투어|데이\s*유즈|데이\s*트립|자유\s*여행|내돈내산|\d+\s*일차|day\s*\d+/;
const FIRSTHAND_STRONG_TITLE_PATTERN =
  /솔직\s*후기|리얼\s*후기|내돈내산|투숙\s*후기|숙박\s*후기|다녀온|여행기|\d+\s*일차|day\s*\d+/;
const FIRSTHAND_ACTION_PATTERN =
  /다녀왔|다녀온|다녀오기|묵었|묵고|묵은|머물렀|머물고|머문|숙박했|숙박한|투숙했|투숙한|이용했|이용한|방문했|갔었|갔다|도착했|도착한|도착해서|체크\s*인했|배정받|먹었|먹어본|보냈|보내고|즐겼|느꼈|타고|탔다|걸렸|다녀왔다|돌아왔/;
const FIRSTHAND_PERSONAL_PATTERN =
  /(?:^|\s)(?:나는|저는|제가|저희|우리는|우리가|우리\s*(?:부부|가족)|남편|아내|신랑|신부|아이와|가족과|부부|엄마와|아빠와|친구와|내가|우린)(?:\s|$)/;
const FIRSTHAND_SEQUENCE_PATTERN =
  /첫날|둘째\s*날|셋째\s*날|마지막\s*날|\d+\s*일차|day\s*\d+|\d{4}\s*년\s*\d{1,2}\s*월|\d+\s*박\s*\d+\s*일|여행\s*중|도착\s*후|체크\s*인\s*후/;
const FIRSTHAND_ASSESSMENT_PATTERN =
  /좋았|아쉬웠|만족|불편|친절|맛있|예뻤|아름다웠|괜찮았|최고였|별로였|힘들었|편했|깨끗했|넓었|작았|비쌌|실망|행복했|완벽했/;

/**
 * Conservatively identifies a NAVER search snippet that is likely to describe
 * the author's own resort visit or stay. This is a shortlist signal, not a
 * replacement for checking the source page before publishing it as evidence.
 */
export function classifyFirsthandVisitSnippet(item, resort) {
  const titleText = item?.titleText ?? item?.title ?? '';
  const descriptionText = item?.descriptionText ?? item?.description ?? '';
  const title = normalizeText(titleText);
  const description = normalizeText(descriptionText);
  const combined = `${title} ${description}`;
  const bloggerName = normalizeText(item?.bloggerName ?? item?.bloggername ?? item?.raw?.bloggerName ?? '');
  const relevance = relevanceFor({ titleText, descriptionText }, resort);
  const identityMatch = relevance.hasKoreanName || relevance.hasExactEnglishName;
  const recalculatedFlags = disclosureFlags({ titleText, descriptionText });
  const commercialOrSales = Boolean(
    item?.commercialDisclosure ||
      item?.possibleSalesContent ||
      item?.flags?.commercialDisclosure ||
      item?.flags?.possibleSalesContent ||
      recalculatedFlags.commercialDisclosure ||
      recalculatedFlags.possibleSalesContent ||
      FIRSTHAND_SALES_TITLE_PATTERN.test(title) ||
      FIRSTHAND_SALES_DESCRIPTION_PATTERN.test(description) ||
      FIRSTHAND_PROFESSIONAL_BLOGGER_PATTERN.test(bloggerName)
  );
  const planningOrComparison = FIRSTHAND_PLANNING_TITLE_PATTERN.test(title);
  const editorialIntroduction = FIRSTHAND_INTRO_TITLE_PATTERN.test(title);
  const signals = {
    explicitReviewTitle: FIRSTHAND_EXPLICIT_TITLE_PATTERN.test(title),
    strongReviewTitle: FIRSTHAND_STRONG_TITLE_PATTERN.test(title),
    visitAction: FIRSTHAND_ACTION_PATTERN.test(combined),
    personalVoice: FIRSTHAND_PERSONAL_PATTERN.test(combined),
    tripSequence: FIRSTHAND_SEQUENCE_PATTERN.test(combined),
    experientialAssessment: FIRSTHAND_ASSESSMENT_PATTERN.test(combined),
  };
  const directExperience = Boolean(
    (signals.explicitReviewTitle &&
      signals.visitAction &&
      (signals.personalVoice || signals.tripSequence || signals.experientialAssessment)) ||
      (signals.strongReviewTitle &&
        ((signals.visitAction && (signals.personalVoice || signals.tripSequence || signals.experientialAssessment)) ||
          (signals.personalVoice && signals.tripSequence) ||
          (signals.tripSequence && signals.experientialAssessment))) ||
      (signals.personalVoice && signals.visitAction && (signals.tripSequence || signals.experientialAssessment))
  );
  const introductionAllowed =
    !editorialIntroduction || (signals.strongReviewTitle && signals.visitAction && signals.personalVoice);
  const exclusionReasons = [];
  if (!identityMatch) exclusionReasons.push('resort-identity-mismatch');
  if (commercialOrSales) exclusionReasons.push('commercial-sales-or-republished');
  if (planningOrComparison) exclusionReasons.push('planning-or-comparison');
  if (!introductionAllowed) exclusionReasons.push('editorial-introduction');
  if (!directExperience) exclusionReasons.push('insufficient-firsthand-signals');

  return {
    isLikelyFirsthand: exclusionReasons.length === 0,
    identityMatch,
    directExperience,
    signals,
    exclusionReasons,
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

export function buildCandidatePool(queryRuns, resort) {
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
  const relevant = ordered.filter(candidate => candidate.relevance.relevant);
  const fallback = ordered.filter(candidate => !candidate.relevance.relevant);
  const shortlist = [...relevant, ...fallback].map((candidate, index) => ({
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
    .filter(filename => /^resorts\d*\.json$/.test(filename))
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
  return new Promise(resolve => setTimeout(resolve, ms));
}
