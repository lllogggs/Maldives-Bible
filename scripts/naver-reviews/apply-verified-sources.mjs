#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {
  canonicalizeBlogUrl,
  disclosureFlags,
  isNaverBlogUrl,
  loadResorts,
  readJsonIfExists,
  relevanceFor,
  writeJsonAtomic,
} from './lib.mjs';

const options = parseArgs(process.argv.slice(2));
const curated = await readJsonIfExists(options.curated);
if (!curated || !Array.isArray(curated.items)) {
  throw new Error(`큐레이션 파일을 읽을 수 없습니다: ${options.curated}`);
}

const resorts = await loadResorts();
const resortById = new Map(resorts.map(resort => [resort.id, resort]));
const verifiedByResort = new Map();

for (const filename of options.verifiedFiles) {
  const manifest = await readJsonIfExists(filename);
  if (!manifest || !Array.isArray(manifest.items)) {
    throw new Error(`검수 결과 파일을 읽을 수 없습니다: ${filename}`);
  }
  for (const entry of manifest.items) {
    if (!Number.isInteger(entry?.resortId) || !Array.isArray(entry?.urls)) {
      throw new Error(`잘못된 검수 결과 항목: ${filename}`);
    }
    const urls = verifiedByResort.get(entry.resortId) ?? new Set();
    for (const value of entry.urls) {
      const url = canonicalizeBlogUrl(value);
      if (!isNaverBlogUrl(url)) throw new Error(`NAVER 블로그 URL이 아닙니다: ${value}`);
      urls.add(url);
    }
    verifiedByResort.set(entry.resortId, urls);
  }
}

const errors = [];
let totalSources = 0;
let newlyVerifiedSources = 0;
const counts = [];

const items = [];
for (const item of curated.items) {
  const resort = resortById.get(item.resortId);
  if (!resort) {
    errors.push(`resortId=${item.resortId}: 리조트 정보가 없습니다.`);
    items.push(item);
    continue;
  }

  const rawPath = path.join(options.rawDir, `${String(item.resortId).padStart(3, '0')}.json`);
  const raw = await readJsonIfExists(rawPath);
  if (!raw || !Array.isArray(raw.queryRuns)) {
    errors.push(`resortId=${item.resortId}: 원시 검색 캐시가 없습니다.`);
    items.push(item);
    continue;
  }

  const rawByUrl = new Map();
  for (const run of raw.queryRuns) {
    for (const rawItem of Array.isArray(run.items) ? run.items : []) {
      const url = canonicalizeBlogUrl(rawItem.canonicalUrl ?? rawItem.raw?.link);
      if (!url || rawByUrl.has(url)) continue;
      rawByUrl.set(url, {
        ...rawItem,
        query: rawItem.query || run.query,
        queryIndex: Number.isInteger(rawItem.queryIndex) ? rawItem.queryIndex : run.queryIndex,
        rawRank: Number.isInteger(rawItem.rawRank) ? rawItem.rawRank : 999,
      });
    }
  }

  const existingByUrl = new Map(
    (Array.isArray(item.sources) ? item.sources : [])
      .map(source => [canonicalizeBlogUrl(source?.url), source])
      .filter(([url]) => Boolean(url))
  );
  const claimUrls = new Set(
    [
      ...(Array.isArray(item.pros) ? item.pros : []),
      ...(Array.isArray(item.cons) ? item.cons : []),
      ...(Array.isArray(item.neutral) ? item.neutral : []),
    ]
      .flatMap(claim => (Array.isArray(claim?.sourceUrls) ? claim.sourceUrls : []))
      .map(canonicalizeBlogUrl)
      .filter(Boolean)
  );
  const previouslyVerifiedUrls = new Set(
    [...existingByUrl.entries()].filter(([, source]) => source?.sourceKind === 'firsthand-personal').map(([url]) => url)
  );
  const newlyReviewedUrls = verifiedByResort.get(item.resortId) ?? new Set();
  const requestedUrls = new Set([...claimUrls, ...previouslyVerifiedUrls, ...newlyReviewedUrls]);

  const verifiedSources = [];
  for (const url of requestedUrls) {
    const rawItem = rawByUrl.get(url);
    const existing = existingByUrl.get(url);
    if (!rawItem && !existing) {
      errors.push(`resortId=${item.resortId}: 검수 URL을 원시 검색 결과에서 찾지 못했습니다: ${url}`);
      continue;
    }

    const manuallyVerified = previouslyVerifiedUrls.has(url) || newlyReviewedUrls.has(url);
    const source = rawItem
      ? sourceFromRaw(rawItem, resort, manuallyVerified)
      : {
          ...existing,
          url,
          sourceKind: 'firsthand-personal',
        };
    if (source.selection !== 'relevant') {
      errors.push(`resortId=${item.resortId}: 다른 리조트 가능성이 있는 글은 공개할 수 없습니다: ${url}`);
      continue;
    }
    if (source.commercialDisclosure || source.possibleSalesContent) {
      errors.push(`resortId=${item.resortId}: 광고·판매 가능성이 있는 글은 공개할 수 없습니다: ${url}`);
      continue;
    }

    verifiedSources.push({
      source,
      priority: claimUrls.has(url) ? 0 : previouslyVerifiedUrls.has(url) ? 1 : 2,
      order: Number(rawItem?.queryIndex ?? 99) * 1000 + Number(rawItem?.rawRank ?? existing?.rawRank ?? 999),
    });
  }

  verifiedSources.sort(
    (a, b) => a.priority - b.priority || a.order - b.order || a.source.url.localeCompare(b.source.url)
  );
  const sources = verifiedSources.map(({ source }) => source);
  newlyVerifiedSources += sources.filter(source => !previouslyVerifiedUrls.has(source.url)).length;
  for (const claimUrl of claimUrls) {
    if (!sources.some(source => source.url === claimUrl)) {
      errors.push(
        `resortId=${item.resortId}: 요약 문장에 사용한 실제 후기가 검증된 후기 목록에서 누락됐습니다: ${claimUrl}`
      );
    }
  }

  totalSources += sources.length;
  counts.push(sources.length);
  items.push({ ...item, sources });
}

if (errors.length > 0) {
  console.error(`실제 후기 출처 반영 실패 (${errors.length}건)`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exit(1);
}

await writeJsonAtomic(options.curated, { ...curated, items });
const distribution = counts.reduce((result, count) => {
  const key = String(count);
  result[key] = (result[key] ?? 0) + 1;
  return result;
}, {});
console.log(`실제 후기 출처 반영 완료: ${totalSources}개 (신규 ${newlyVerifiedSources}개)`);
console.log(`리조트별 출처 수: ${JSON.stringify(distribution)}`);

function sourceFromRaw(item, resort, manuallyVerified = false) {
  const url = canonicalizeBlogUrl(item.canonicalUrl ?? item.raw?.link);
  const title = String(item.titleText ?? item.title ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const bloggerName = String(item.bloggerName ?? item.raw?.bloggerName ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const relevance = relevanceFor(item, resort);
  const flags = disclosureFlags(item);
  return {
    url,
    title,
    bloggerName,
    independenceUnknown: !bloggerName,
    postDate: String(item.postDate ?? item.raw?.postDate ?? ''),
    rawRank: Number(item.rawRank ?? 999),
    query: String(item.query ?? '').trim(),
    selection: manuallyVerified || relevance.relevant ? 'relevant' : 'fallback-needs-manual-review',
    commercialDisclosure: manuallyVerified ? false : flags.commercialDisclosure,
    possibleSalesContent: manuallyVerified ? false : flags.possibleSalesContent,
    sourceKind: 'firsthand-personal',
  };
}

function parseArgs(args) {
  const parsed = {
    curated: path.resolve('data', 'resort-review-insights.curated.json'),
    rawDir: path.resolve('.research', 'naver-blog-reviews', 'raw'),
    verifiedFiles: [
      path.resolve('.research', 'naver-blog-reviews', 'verified-a.json'),
      path.resolve('.research', 'naver-blog-reviews', 'verified-b.json'),
    ],
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const next = () => {
      const value = args[++index];
      if (value == null || value.startsWith('--')) throw new Error(`${argument} 값이 필요합니다.`);
      return value;
    };
    if (argument === '--curated') parsed.curated = path.resolve(next());
    else if (argument === '--raw-dir') parsed.rawDir = path.resolve(next());
    else if (argument === '--verified')
      parsed.verifiedFiles = next()
        .split(',')
        .map(value => path.resolve(value.trim()));
    else throw new Error(`알 수 없는 옵션: ${argument}`);
  }
  return parsed;
}
