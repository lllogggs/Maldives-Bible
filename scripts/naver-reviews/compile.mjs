#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {
  CURATED_SCHEMA_VERSION,
  loadResorts,
  readJsonIfExists,
  writeJsonAtomic,
} from './lib.mjs';

const UI_BASIS = 'naver-blog-search-snippets';
const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

const resorts = await loadResorts();
const resortIds = new Set(resorts.map(({ id }) => id));
const curated = await readJsonIfExists(options.input);
if (!curated) throw new Error(`큐레이션 파일이 없습니다: ${options.input}`);

const { errors, compiledItems, detailItems } = validateAndCompile(curated, resortIds, options.allowPartial);
if (errors.length > 0) {
  console.error(`큐레이션 검증 실패 (${errors.length}건)`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`- 그 외 ${errors.length - 100}건`);
  process.exit(1);
}

if (options.check) {
  console.log(`큐레이션 검증 통과: ${compiledItems.length}개 리조트`);
  process.exit(0);
}

await writeJsonAtomic(options.output, {
  schemaVersion: CURATED_SCHEMA_VERSION,
  generatedAt: new Date().toISOString(),
  items: compiledItems,
});
for (const detail of detailItems) {
  await writeJsonAtomic(path.join(options.detailsDir, `${detail.resortId}.json`), detail);
}
console.log(`후기 요약 컴파일 완료: ${options.output} (${compiledItems.length}개)`);
console.log(`출처 상세 파일: ${options.detailsDir} (${detailItems.length}개)`);

export function validateAndCompile(curated, resortIds, allowPartial = false) {
  const errors = [];
  const compiledItems = [];
  const detailItems = [];
  if (curated.schemaVersion !== CURATED_SCHEMA_VERSION) errors.push(`schemaVersion은 ${CURATED_SCHEMA_VERSION}이어야 합니다.`);
  if (curated.basis !== UI_BASIS) errors.push(`최상위 basis는 ${UI_BASIS}이어야 합니다.`);
  if (!Array.isArray(curated.items)) return { errors: [...errors, 'items가 배열이 아닙니다.'], compiledItems, detailItems };

  const seenIds = new Set();
  for (const item of curated.items) {
    const prefix = `resortId=${item?.resortId ?? '?'}`;
    if (!Number.isInteger(item?.resortId) || !resortIds.has(item.resortId)) {
      errors.push(`${prefix}: 존재하지 않는 리조트 id입니다.`);
      continue;
    }
    if (seenIds.has(item.resortId)) {
      errors.push(`${prefix}: 중복 항목입니다.`);
      continue;
    }
    seenIds.add(item.resortId);
    if (item.basis !== UI_BASIS) errors.push(`${prefix}: basis는 ${UI_BASIS}이어야 합니다.`);
    const evidenceStatus = item.evidenceStatus;
    if (!['sufficient', 'limited', 'insufficient'].includes(evidenceStatus)) {
      errors.push(`${prefix}: evidenceStatus는 sufficient, limited 또는 insufficient여야 합니다.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.reviewedAt ?? '') || !Number.isFinite(Date.parse(item.reviewedAt))) {
      errors.push(`${prefix}: reviewedAt은 유효한 YYYY-MM-DD 날짜여야 합니다.`);
    }

    const sources = Array.isArray(item.sources) ? item.sources : [];
    if (sources.length > 10) errors.push(`${prefix}: sources는 최대 10개여야 합니다.`);
    if (evidenceStatus === 'sufficient' && sources.length < 2) {
      errors.push(`${prefix}: sufficient 요약은 sources가 2개 이상이어야 합니다.`);
    }
    if (evidenceStatus === 'limited' && sources.length < 1) {
      errors.push(`${prefix}: limited 요약은 sources가 1개 이상이어야 합니다.`);
    }
    if (evidenceStatus === 'limited' && item.limitedEvidenceType !== 'firsthand-personal') {
      errors.push(`${prefix}: limited 요약은 limitedEvidenceType=firsthand-personal 확인이 필요합니다.`);
    }
    const sourceUrls = new Set();
    const sourceByUrl = new Map();
    for (const [sourceIndex, source] of sources.entries()) {
      const sourcePrefix = `${prefix} sources[${sourceIndex}]`;
      if (!validHttpUrl(source?.url)) errors.push(`${sourcePrefix}: 유효한 http(s) URL이 필요합니다.`);
      else if (sourceUrls.has(source.url)) errors.push(`${sourcePrefix}: 중복 URL입니다.`);
      else {
        sourceUrls.add(source.url);
        sourceByUrl.set(source.url, source);
      }
      if (!String(source?.title ?? '').trim()) errors.push(`${sourcePrefix}: title이 비었습니다.`);
      if (!String(source?.bloggerName ?? '').trim() && source?.independenceUnknown !== true) {
        errors.push(`${sourcePrefix}: bloggerName이 없으면 independenceUnknown=true로 명시해야 합니다.`);
      }
      if (!/^\d{8}$/.test(String(source?.postDate ?? ''))) errors.push(`${sourcePrefix}: postDate는 YYYYMMDD 형식이어야 합니다.`);
      if (!Number.isInteger(source?.rawRank) || source.rawRank < 1) errors.push(`${sourcePrefix}: rawRank가 올바르지 않습니다.`);
      if (!String(source?.query ?? '').trim()) errors.push(`${sourcePrefix}: query가 비었습니다.`);
      if (!['relevant', 'fallback-needs-manual-review'].includes(source?.selection)) {
        errors.push(`${sourcePrefix}: selection 값이 필요합니다.`);
      }
      if (typeof source?.commercialDisclosure !== 'boolean') {
        errors.push(`${sourcePrefix}: commercialDisclosure는 boolean이어야 합니다.`);
      }
      if (typeof source?.possibleSalesContent !== 'boolean') {
        errors.push(`${sourcePrefix}: possibleSalesContent는 boolean이어야 합니다.`);
      }
    }

    const minimumSources = evidenceStatus === 'sufficient' ? 2 : 1;
    const pros = validateClaims(item.pros, 'pros', prefix, sourceByUrl, errors, minimumSources);
    const cons = validateClaims(item.cons, 'cons', prefix, sourceByUrl, errors, minimumSources);
    if (evidenceStatus === 'sufficient' && pros.length + cons.length === 0) {
      errors.push(`${prefix}: sufficient 요약은 pros와 cons를 합쳐 근거가 있는 문장이 1개 이상 필요합니다.`);
    }
    if (evidenceStatus === 'limited' && pros.length + cons.length === 0) {
      errors.push(`${prefix}: limited 요약은 pros와 cons를 합쳐 근거가 있는 문장이 1개 이상 필요합니다.`);
    }
    if (evidenceStatus === 'insufficient' && pros.length + cons.length > 0) {
      errors.push(`${prefix}: insufficient 요약에는 장단점 문장을 넣을 수 없습니다.`);
    }

    const referencedSourceUrls = new Set(
      [...(Array.isArray(item.pros) ? item.pros : []), ...(Array.isArray(item.cons) ? item.cons : [])]
        .flatMap((claim) => Array.isArray(claim?.sourceUrls) ? claim.sourceUrls : [])
        .filter((url) => sourceByUrl.has(url))
    );
    const evidenceSources = sources.filter((source) => referencedSourceUrls.has(source.url));
    for (const source of evidenceSources) {
      if (source.selection !== 'relevant') {
        errors.push(`${prefix}: 장단점 근거는 관련 후보(selection=relevant)여야 합니다: ${source.url}`);
      }
      if (source.commercialDisclosure === true || source.possibleSalesContent === true) {
        errors.push(`${prefix}: 광고·판매 가능성이 표시된 후보는 장단점 근거로 발행할 수 없습니다: ${source.url}`);
      }
      if (source.sourceKind !== 'firsthand-personal') {
        errors.push(`${prefix}: 공개 장단점의 모든 인용 출처에는 sourceKind=firsthand-personal 확인이 필요합니다: ${source.url}`);
      }
    }
    const reviewSummary = {
      pros,
      cons,
      sourceCount: evidenceSources.length,
      searchedCount: sources.length,
      reviewedAt: item.reviewedAt,
      basis: UI_BASIS,
      evidenceStatus,
    };
    compiledItems.push({
      resortId: item.resortId,
      reviewSummary,
    });
    detailItems.push({
      schemaVersion: CURATED_SCHEMA_VERSION,
      resortId: item.resortId,
      reviewSummary: {
        ...reviewSummary,
        sources: evidenceSources.map((source) => ({
          title: String(source.title).trim(),
          url: source.url,
          blogName: String(source.bloggerName ?? '').trim(),
          publishedAt: formatPublishedAt(source.postDate),
          independenceUnknown: !String(source.bloggerName ?? '').trim(),
        })),
      },
    });
  }

  if (!allowPartial && seenIds.size !== resortIds.size) {
    const missing = [...resortIds].filter((id) => !seenIds.has(id));
    errors.push(`전체 리조트가 필요합니다. 누락 ${missing.length}개: ${missing.slice(0, 30).join(', ')}${missing.length > 30 ? ' ...' : ''}`);
  }
  return { errors, compiledItems, detailItems };
}

function validateClaims(value, field, prefix, sourceByUrl, errors, minimumSources) {
  if (!Array.isArray(value) || value.length > 3) {
    errors.push(`${prefix}: ${field}는 0~3개여야 합니다.`);
    return [];
  }

  const seenTexts = new Set();
  return value.map((claim, index) => {
    const claimPrefix = `${prefix} ${field}[${index}]`;
    const text = String(claim?.text ?? '').replace(/\s+/g, ' ').trim();
    if (text.length < 8 || text.length > 80) errors.push(`${claimPrefix}: text는 8~80자여야 합니다.`);
    if (/todo|tbd|placeholder|작성\s*(필요|예정)|예시\s*(문구|텍스트)/i.test(text)) errors.push(`${claimPrefix}: 임시 문구를 사용할 수 없습니다.`);
    const normalized = text.toLocaleLowerCase('ko-KR');
    if (seenTexts.has(normalized)) errors.push(`${claimPrefix}: 같은 문장이 중복됐습니다.`);
    seenTexts.add(normalized);

    const refs = [...new Set(Array.isArray(claim?.sourceUrls) ? claim.sourceUrls : [])];
    if (refs.length < minimumSources) errors.push(`${claimPrefix}: 서로 다른 sourceUrls가 ${minimumSources}개 이상 필요합니다.`);
    const independentSources = new Set();
    for (const url of refs) {
      const source = sourceByUrl.get(url);
      if (!source) {
        errors.push(`${claimPrefix}: sources에 없는 URL을 참조합니다: ${url}`);
        continue;
      }
      const bloggerId = naverBlogId(source.url);
      if (!bloggerId) {
        errors.push(`${claimPrefix}: 네이버 블로그 작성자 ID를 URL에서 확인할 수 없습니다: ${url}`);
        continue;
      }
      independentSources.add(`blogger:${bloggerId}`);
    }
    if (independentSources.size < minimumSources) errors.push(`${claimPrefix}: 독립 출처가 ${minimumSources}개 이상 필요합니다.`);
    return { text, mentions: independentSources.size };
  });
}

function naverBlogId(value) {
  try {
    const url = new URL(value);
    if (!['blog.naver.com', 'm.blog.naver.com'].includes(url.hostname.toLowerCase())) return '';
    const [blogId] = url.pathname.split('/').filter(Boolean);
    return decodeURIComponent(blogId ?? '').trim().toLocaleLowerCase('ko-KR');
  } catch {
    return '';
  }
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatPublishedAt(value) {
  const text = String(value ?? '');
  return /^\d{8}$/.test(text)
    ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
    : text;
}

function parseArgs(args) {
  const parsed = {
    input: path.resolve('data', 'resort-review-insights.curated.json'),
    output: path.resolve('public', 'api', 'resort-review-insights.json'),
    detailsDir: path.resolve('public', 'api', 'resort-reviews'),
    allowPartial: false,
    check: false,
    help: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const next = () => {
      const value = args[++index];
      if (value == null || value.startsWith('--')) throw new Error(`${argument} 값이 필요합니다.`);
      return value;
    };
    if (argument === '--input') parsed.input = path.resolve(next());
    else if (argument === '--output') parsed.output = path.resolve(next());
    else if (argument === '--details-dir') parsed.detailsDir = path.resolve(next());
    else if (argument === '--allow-partial') parsed.allowPartial = true;
    else if (argument === '--check') parsed.check = true;
    else if (argument === '--help' || argument === '-h') parsed.help = true;
    else throw new Error(`알 수 없는 옵션: ${argument}`);
  }
  return parsed;
}

function printHelp() {
  console.log(`검수된 후기 장단점을 검증하고 UI용 reviewSummary 데이터로 컴파일합니다.

Usage:
  npm run reviews:validate
  npm run reviews:compile

Options:
  --input PATH       큐레이션 JSON 경로
  --output PATH      UI용 JSON 경로
  --details-dir PATH 리조트별 출처 상세 JSON 디렉터리
  --allow-partial    표본 리조트만 허용
  --check            파일을 쓰지 않고 검증만 수행
  --help             도움말`);
}
