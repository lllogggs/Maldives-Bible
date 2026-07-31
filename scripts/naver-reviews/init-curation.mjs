#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  buildCandidatePool,
  CURATED_SCHEMA_VERSION,
  disclosureFlags,
  loadResorts,
  readJsonIfExists,
  relevanceFor,
  writeJsonAtomic,
} from './lib.mjs';

const UI_BASIS = 'naver-blog-search-snippets';
const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

const resorts = await loadResorts();
const existing = await readJsonIfExists(options.output);
const existingById = new Map((existing?.items ?? []).map(item => [item.resortId, item]));
const items = [];
const missing = [];

for (const resort of resorts) {
  const cachePath = path.join(options.cacheDir, `${String(resort.id).padStart(3, '0')}.json`);
  const cache = await readJsonIfExists(cachePath);
  if (!cache || cache.status !== 'complete') {
    missing.push(resort.id);
    continue;
  }

  const previous = existingById.get(resort.id);
  const previousSourceByUrl = new Map((previous?.sources ?? []).map(source => [source.url, source]));
  // Rebuild from every cached query result so an old shortlist limit cannot cap review verification.
  const candidatePool = buildCandidatePool(cache.queryRuns, resort);
  const sources = candidatePool.shortlist.map(candidate => {
    const relevance = relevanceFor(candidate, resort);
    const flags = disclosureFlags(candidate);
    return {
      url: candidate.canonicalUrl,
      title: candidate.title,
      bloggerName: candidate.bloggerName,
      independenceUnknown: !candidate.bloggerName,
      postDate: candidate.postDate,
      rawRank: candidate.occurrences[0]?.rawRank,
      query: candidate.occurrences[0]?.query,
      selection: relevance.relevant ? 'relevant' : 'fallback-needs-manual-review',
      commercialDisclosure: flags.commercialDisclosure,
      possibleSalesContent: flags.possibleSalesContent,
      ...(previousSourceByUrl.get(candidate.canonicalUrl)?.sourceKind === 'firsthand-personal'
        ? { sourceKind: 'firsthand-personal' }
        : {}),
    };
  });
  items.push({
    resortId: resort.id,
    resortName: resort.name,
    basis: UI_BASIS,
    evidenceStatus: previous?.evidenceStatus ?? 'pending',
    limitedEvidenceType: previous?.limitedEvidenceType ?? '',
    firsthandSourceUrls: previous?.firsthandSourceUrls ?? [],
    reviewedAt: previous?.reviewedAt ?? '',
    pros: previous?.pros ?? [],
    cons: previous?.cons ?? [],
    neutral: previous?.neutral ?? [],
    sources,
    curatorNote: previous?.curatorNote ?? '',
  });
}

if (missing.length > 0 && !options.allowPartial) {
  throw new Error(
    `완료 캐시가 없는 리조트 ${missing.length}개: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? ' ...' : ''}\n먼저 수집을 마치거나 표본 작업에는 --allow-partial을 사용하세요.`
  );
}
if (items.length === 0) throw new Error(`완료된 수집 캐시가 없습니다: ${options.cacheDir}`);

await writeJsonAtomic(options.output, {
  schemaVersion: CURATED_SCHEMA_VERSION,
  basis: UI_BASIS,
  generatedFrom: 'NAVER API HUB 블로그 검색 제목/요약문 메타데이터 (원문 미수집)',
  instructions: {
    claimShape: '{ "text": "직접 작성한 요약", "sourceUrls": ["서로 다른 출처 URL 2개 이상"] }',
    requirements: [
      '긍정, 부정, 중립 정보는 각각 0~3개이며, 근거가 있는 문장을 합계 1개 이상 작성합니다. 근거가 없으면 억지로 채우지 않습니다.',
      '독립 출처 2개 이상에서 반복되면 sufficient, 개인의 실제 경험이 명확한 출처 1개만 있으면 limited, 근거가 없으면 insufficient로 둡니다.',
      '각 문장은 서로 다른 출처 2개 이상에서 반복 확인된 내용만 요약합니다.',
      '검색 요약문을 그대로 복사하지 말고 짧게 재서술합니다.',
      '후기·의견·언급·내용이 있습니다·확인할 수 있어요 같은 제3자식 표현 없이 사실과 경험을 직접 서술합니다.',
      '광고·협찬 가능성과 리조트명 불일치 후보를 수동 검토합니다.',
      '같은 블로거의 여러 글은 하나의 독립 출처로 계산합니다. 작성자 식별이 없으면 independenceUnknown을 확인합니다.',
      'reviewedAt은 YYYY-MM-DD 형식으로 기록합니다.',
    ],
  },
  items,
});

console.log(`큐레이션 파일 생성: ${options.output}`);
console.log(`포함 ${items.length}개, 캐시 없음 ${missing.length}개`);

function parseArgs(args) {
  const parsed = {
    cacheDir: path.resolve('.research', 'naver-blog-reviews', 'raw'),
    output: path.resolve('data', 'resort-review-insights.curated.json'),
    allowPartial: false,
    help: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const next = () => {
      const value = args[++index];
      if (value == null || value.startsWith('--')) throw new Error(`${argument} 값이 필요합니다.`);
      return value;
    };
    if (argument === '--cache-dir') parsed.cacheDir = path.resolve(next());
    else if (argument === '--output') parsed.output = path.resolve(next());
    else if (argument === '--allow-partial') parsed.allowPartial = true;
    else if (argument === '--help' || argument === '-h') parsed.help = true;
    else throw new Error(`알 수 없는 옵션: ${argument}`);
  }
  return parsed;
}

function printHelp() {
  console.log(`수집 후보에서 사람이 검수할 큐레이션 파일을 만듭니다.

Usage:
  npm run reviews:init -- [--allow-partial] [--cache-dir PATH] [--output PATH]

기존 output이 있으면 pros/cons/reviewedAt을 보존하고 검색 후보만 갱신합니다.
빈 장단점을 자동으로 채우지 않으므로 가짜 후기가 생성되지 않습니다.`);
}
