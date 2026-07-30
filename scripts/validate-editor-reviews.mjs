import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const apiDir = resolve(projectRoot, 'public', 'api');
const editorReviewPath = resolve(apiDir, 'resort-editor-reviews.json');
const reviewInsightsPath = resolve(apiDir, 'resort-review-insights.json');
const minimumReviewCount = 35;
const prohibitedPatterns = [
  /(?:제가|저는|에디터가)\s*(?:직접\s*)?(?:다녀|머물|투숙|방문)/,
  /직접\s*(?:가\s*보니|머물러\s*보니|투숙해\s*보니)/,
  /(?:수집|검수|근거|분석\s*결과|확인했(?:습니다|어요)|작성\s*중|준비\s*중)/,
  /(?:AI|인공지능)(?:가|이|로|으로|에게)?\s*(?:작성|생성|요약)/i,
  /(?:무조건|단연\s*최고|완벽한\s*선택)/,
  /<[^>]+>|```|#{1,6}\s/,
];

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const resortFiles = (await readdir(apiDir))
  .filter((name) => /^resorts(?:\d+)?\.json$/.test(name))
  .sort((a, b) => {
    const indexOf = (name) => Number(name.match(/^resorts(\d+)?\.json$/)?.[1] ?? 1);
    return indexOf(a) - indexOf(b);
  });
const resorts = (await Promise.all(resortFiles.map((name) => readJson(resolve(apiDir, name))))).flat();
const resortById = new Map(resorts.map((resort) => [resort.id, resort]));
const reviewInsights = await readJson(reviewInsightsPath);
const sourceCountById = new Map(
  (reviewInsights.items ?? []).map((item) => [item.resortId, item.reviewSummary?.sourceCount ?? 0])
);
const payload = await readJson(editorReviewPath);
const errors = [];
const seenIds = new Set();
const seenTitles = new Set();

if (payload.schemaVersion !== 1) errors.push('schemaVersion은 1이어야 합니다.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.publishedAt ?? '')) {
  errors.push('publishedAt은 YYYY-MM-DD 형식이어야 합니다.');
}
if (!Array.isArray(payload.items)) errors.push('items가 배열이어야 합니다.');

for (const [index, item] of (Array.isArray(payload.items) ? payload.items : []).entries()) {
  const prefix = `items[${index}] resortId=${item?.resortId ?? '?'}`;
  const resort = resortById.get(item?.resortId);
  if (!resort) {
    errors.push(`${prefix}: 존재하지 않는 리조트입니다.`);
    continue;
  }
  if (seenIds.has(item.resortId)) errors.push(`${prefix}: resortId가 중복됐습니다.`);
  seenIds.add(item.resortId);
  if ((sourceCountById.get(item.resortId) ?? 0) < 10) {
    errors.push(`${prefix}: 실제 후기 원문이 10개 미만입니다.`);
  }

  const review = item.editorReview;
  if (!review || typeof review !== 'object' || Array.isArray(review)) {
    errors.push(`${prefix}: editorReview 객체가 필요합니다.`);
    continue;
  }

  const title = String(review.title ?? '').trim();
  const dek = String(review.dek ?? '').trim();
  const paragraphs = Array.isArray(review.paragraphs)
    ? review.paragraphs.map((paragraph) => String(paragraph ?? '').trim())
    : [];
  const verdict = String(review.verdict ?? '').trim();
  const publishedAt = String(review.publishedAt ?? '').trim();
  const allText = [title, dek, ...paragraphs, verdict].join(' ');
  const bodyLength = [dek, ...paragraphs, verdict].join('').length;

  if (title.length < 12 || title.length > 75) errors.push(`${prefix}: title은 12~75자여야 합니다.`);
  if (!title.includes(resort.name)) errors.push(`${prefix}: title에 정확한 한글 리조트명이 필요합니다: ${resort.name}`);
  if (seenTitles.has(title.toLocaleLowerCase('ko-KR'))) errors.push(`${prefix}: title이 중복됐습니다.`);
  seenTitles.add(title.toLocaleLowerCase('ko-KR'));
  if (dek.length < 35 || dek.length > 190) errors.push(`${prefix}: dek는 35~190자여야 합니다.`);
  if (paragraphs.length !== 3) errors.push(`${prefix}: paragraphs는 정확히 3개여야 합니다.`);
  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (paragraph.length < 75 || paragraph.length > 300) {
      errors.push(`${prefix}: paragraphs[${paragraphIndex}]는 75~300자여야 합니다.`);
    }
  });
  if (!paragraphs[0]?.includes(resort.name)) {
    errors.push(`${prefix}: 첫 문단에 정확한 한글 리조트명이 필요합니다: ${resort.name}`);
  }
  if (verdict.length < 35 || verdict.length > 180) errors.push(`${prefix}: verdict는 35~180자여야 합니다.`);
  if (bodyLength < 430 || bodyLength > 950) errors.push(`${prefix}: 전체 본문은 430~950자여야 합니다: ${bodyLength}`);
  if (publishedAt !== payload.publishedAt) errors.push(`${prefix}: publishedAt이 최상위 날짜와 일치해야 합니다.`);
  prohibitedPatterns.forEach((pattern) => {
    if (pattern.test(allText)) errors.push(`${prefix}: 금지된 문체 또는 임시 표현이 있습니다: ${pattern}`);
  });
}

if ((payload.items?.length ?? 0) < minimumReviewCount) {
  errors.push(`에디터 리뷰는 최소 ${minimumReviewCount}개여야 합니다: ${payload.items?.length ?? 0}`);
}

if (errors.length > 0) {
  console.error(`[Editor review validation failed]\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${payload.items.length} magazine-style editor reviews with verified source coverage.`);
}
