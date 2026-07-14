#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { readJsonIfExists, writeJsonAtomic } from './lib.mjs';

const options = parseArgs(process.argv.slice(2));
const curated = await readJsonIfExists(options.input);
if (!curated || !Array.isArray(curated.items)) {
  throw new Error(`기본 큐레이션 파일을 찾지 못했습니다: ${options.input}`);
}

const partNames = (await fs.readdir(options.partsDir))
  .filter((name) => name.toLowerCase().endsWith('.json'))
  .sort();
if (partNames.length === 0) throw new Error(`병합할 JSON 파일이 없습니다: ${options.partsDir}`);

const parts = [];
for (const name of partNames) {
  const payload = JSON.parse(await fs.readFile(path.join(options.partsDir, name), 'utf8'));
  const items = Array.isArray(payload) ? payload : payload?.items;
  if (!Array.isArray(items)) throw new Error(`${name}: 최상위 값은 배열 또는 { items: [] }여야 합니다.`);
  parts.push(...items.map((item) => ({ ...item, __part: name })));
}

const baseById = new Map(curated.items.map((item) => [item.resortId, item]));
const partById = new Map();
const errors = [];

for (const item of parts) {
  const prefix = `${item.__part} resortId=${item?.resortId ?? '?'}`;
  if (!Number.isInteger(item?.resortId) || !baseById.has(item.resortId)) {
    errors.push(`${prefix}: 기본 큐레이션에 없는 id입니다.`);
    continue;
  }
  if (partById.has(item.resortId)) {
    errors.push(`${prefix}: 다른 part와 id가 중복됩니다.`);
    continue;
  }
  partById.set(item.resortId, item);
}

for (const base of curated.items) {
  const item = partById.get(base.resortId);
  const prefix = `resortId=${base.resortId}`;
  if (!item) {
    errors.push(`${prefix}: part 결과가 없습니다.`);
    continue;
  }
  if (!['sufficient', 'limited', 'insufficient'].includes(item.evidenceStatus)) {
    errors.push(`${prefix}: evidenceStatus는 sufficient, limited 또는 insufficient여야 합니다.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.reviewedAt ?? '')) {
    errors.push(`${prefix}: reviewedAt은 YYYY-MM-DD여야 합니다.`);
  }

  const sourceUrls = new Set((base.sources ?? []).map((source) => source.url));
  const minimumSources = item.evidenceStatus === 'sufficient' ? 2 : 1;
  const pros = validateClaims(item.pros, 'pros', prefix, sourceUrls, errors, minimumSources);
  const cons = validateClaims(item.cons, 'cons', prefix, sourceUrls, errors, minimumSources);
  if (item.evidenceStatus === 'sufficient' && pros.length + cons.length === 0) {
    errors.push(`${prefix}: sufficient에는 근거 문장이 하나 이상 필요합니다.`);
  }
  if (item.evidenceStatus === 'limited' && pros.length + cons.length === 0) {
    errors.push(`${prefix}: limited에는 근거 문장이 하나 이상 필요합니다.`);
  }
  if (item.evidenceStatus === 'limited' && item.limitedEvidenceType !== 'firsthand-personal') {
    errors.push(`${prefix}: limited에는 limitedEvidenceType=firsthand-personal 확인이 필요합니다.`);
  }
  const citedUrls = new Set([...pros, ...cons].flatMap((claim) => claim.sourceUrls ?? []));
  const firsthandSourceUrls = new Set(Array.isArray(item.firsthandSourceUrls) ? item.firsthandSourceUrls : []);
  if (item.evidenceStatus === 'limited') {
    if (citedUrls.size !== firsthandSourceUrls.size || [...citedUrls].some((url) => !firsthandSourceUrls.has(url))) {
      errors.push(`${prefix}: firsthandSourceUrls는 limited claim의 모든 인용 URL과 정확히 일치해야 합니다.`);
    }
  } else if (firsthandSourceUrls.size > 0) {
    errors.push(`${prefix}: limited가 아닌 항목에는 firsthandSourceUrls를 둘 수 없습니다.`);
  }
  if (item.evidenceStatus === 'insufficient' && pros.length + cons.length > 0) {
    errors.push(`${prefix}: insufficient에는 장단점 문장을 둘 수 없습니다.`);
  }
}

if (errors.length > 0) {
  console.error(`part 병합 검증 실패 (${errors.length}건)`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exit(1);
}

const mergedItems = curated.items.map((base) => {
  const part = partById.get(base.resortId);
  const { __part, resortId, resortName, ...review } = part;
  const firsthandSourceUrls = new Set(review.evidenceStatus === 'limited' ? review.firsthandSourceUrls : []);
  const verifiedEvidenceUrls = new Set(
    review.evidenceStatus === 'insufficient'
      ? []
      : [...(review.pros ?? []), ...(review.cons ?? [])].flatMap((claim) => claim.sourceUrls ?? [])
  );
  return {
    ...base,
    evidenceStatus: review.evidenceStatus,
    limitedEvidenceType: review.evidenceStatus === 'limited' ? review.limitedEvidenceType : '',
    firsthandSourceUrls: [...verifiedEvidenceUrls],
    reviewedAt: review.reviewedAt,
    pros: review.pros,
    cons: review.cons,
    curatorNote: String(review.curatorNote ?? '').replace(/\s+/g, ' ').trim(),
    sources: (base.sources ?? []).map((source) => ({
      ...source,
      ...(verifiedEvidenceUrls.has(source.url) ? { sourceKind: 'firsthand-personal' } : {}),
    })),
  };
});

await writeJsonAtomic(options.output, {
  ...curated,
  mergedAt: new Date().toISOString(),
  items: mergedItems,
});
console.log(`큐레이션 part 병합 완료: ${partNames.length}개 파일, ${mergedItems.length}개 리조트`);
console.log(`출력: ${options.output}`);

function validateClaims(value, field, prefix, sourceUrls, errors, minimumSources) {
  if (!Array.isArray(value) || value.length > 3) {
    errors.push(`${prefix}: ${field}는 0~3개 배열이어야 합니다.`);
    return [];
  }
  for (const [index, claim] of value.entries()) {
    const claimPrefix = `${prefix} ${field}[${index}]`;
    const text = String(claim?.text ?? '').replace(/\s+/g, ' ').trim();
    if (text.length < 8 || text.length > 80) errors.push(`${claimPrefix}: text는 8~80자여야 합니다.`);
    const refs = [...new Set(Array.isArray(claim?.sourceUrls) ? claim.sourceUrls : [])];
    if (refs.length < minimumSources) errors.push(`${claimPrefix}: sourceUrls가 ${minimumSources}개 이상 필요합니다.`);
    for (const url of refs) {
      if (!sourceUrls.has(url)) errors.push(`${claimPrefix}: 기본 후보에 없는 URL입니다: ${url}`);
    }
  }
  return value;
}

function parseArgs(args) {
  const parsed = {
    input: path.resolve('data', 'resort-review-insights.curated.json'),
    output: path.resolve('data', 'resort-review-insights.curated.json'),
    partsDir: path.resolve('.research', 'naver-blog-reviews', 'parts'),
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
    else if (argument === '--parts-dir') parsed.partsDir = path.resolve(next());
    else throw new Error(`알 수 없는 옵션: ${argument}`);
  }
  return parsed;
}
