#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import {
  API_ENDPOINT,
  RAW_SCHEMA_VERSION,
  REVIEW_BASIS,
  buildCandidatePool,
  buildSearchQueries,
  cacheIsFresh,
  loadResorts,
  normalizeApiItem,
  readJsonIfExists,
  sleep,
  writeJsonAtomic,
} from './lib.mjs';

dotenv.config({ path: path.resolve('.env.local'), quiet: true });
dotenv.config({ path: path.resolve('.env'), quiet: true });

const DEFAULT_CACHE_DIR = path.resolve('.research', 'naver-blog-reviews', 'raw');
const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const allResorts = await loadResorts();
const selectedResorts = selectResorts(allResorts, options);
if (selectedResorts.length === 0) throw new Error('수집 대상 리조트가 없습니다. --ids/--limit 값을 확인하세요.');

if (options.dryRun) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        totalResorts: allResorts.length,
        selectedResorts: selectedResorts.length,
        endpoint: API_ENDPOINT,
        sort: 'sim',
        display: options.display,
        minimumRelevantCandidates: options.target,
        cacheDir: options.cacheDir,
        examples: selectedResorts.slice(0, 5).map(resort => ({
          id: resort.id,
          name: resort.name,
          queries: buildSearchQueries(resort),
        })),
      },
      null,
      2
    )
  );
  process.exit(0);
}

const clientId = process.env.NAVER_API_HUB_CLIENT_ID?.trim();
const clientSecret = process.env.NAVER_API_HUB_CLIENT_SECRET?.trim();
if (!clientId || !clientSecret) {
  console.error(
    [
      'NAVER API HUB 인증 정보가 없습니다.',
      '.env.local에 NAVER_API_HUB_CLIENT_ID와 NAVER_API_HUB_CLIENT_SECRET을 설정하세요.',
      '비밀키는 VITE_ 접두사를 붙이거나 클라이언트 코드에 넣으면 안 됩니다.',
      '설정 전에는 `npm run reviews:collect -- --dry-run`으로 대상과 쿼리를 점검할 수 있습니다.',
    ].join('\n')
  );
  process.exit(2);
}

await fs.mkdir(options.cacheDir, { recursive: true });
const manifestPath = path.join(options.cacheDir, 'manifest.json');
const manifest = {
  schemaVersion: RAW_SCHEMA_VERSION,
  basis: REVIEW_BASIS,
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalResorts: allResorts.length,
  selectedResortIds: selectedResorts.map(({ id }) => id),
  config: publicConfig(options),
  completed: [],
  skippedFresh: [],
  failed: [],
};
await writeJsonAtomic(manifestPath, manifest);

for (let index = 0; index < selectedResorts.length; index += 1) {
  const resort = selectedResorts[index];
  const cachePath = path.join(options.cacheDir, `${String(resort.id).padStart(3, '0')}.json`);
  let cached = null;
  try {
    cached = await readJsonIfExists(cachePath);
  } catch (error) {
    console.warn(`[${resort.id}] 손상된 캐시를 무시합니다: ${error.message}`);
  }

  if (!options.force && cacheIsFresh(cached, resort, options.maxAgeDays, configKey(options))) {
    manifest.skippedFresh.push(resort.id);
    console.log(`[${index + 1}/${selectedResorts.length}] ${resort.name}: 최신 캐시 사용`);
    await updateManifest(manifestPath, manifest);
    continue;
  }

  console.log(`[${index + 1}/${selectedResorts.length}] ${resort.name}: 수집 시작`);
  try {
    const result = await collectResort({
      resort,
      cached: options.force ? null : cached,
      cachePath,
      clientId,
      clientSecret,
      options,
    });
    manifest.completed.push({
      resortId: resort.id,
      candidates: result.candidatePool.shortlist.length,
    });
    console.log(`  완료: 검색 ${result.queryRuns.length}회, 후보 ${result.candidatePool.shortlist.length}개`);
  } catch (error) {
    const failure = {
      resortId: resort.id,
      name: resort.name,
      message: error.message,
    };
    manifest.failed.push(failure);
    console.error(`  실패: ${error.message}`);
    if (options.failFast) {
      await updateManifest(manifestPath, manifest);
      throw error;
    }
  }
  await updateManifest(manifestPath, manifest);
}

manifest.finishedAt = new Date().toISOString();
await updateManifest(manifestPath, manifest);
console.log(
  `수집 종료: 완료 ${manifest.completed.length}, 최신 캐시 ${manifest.skippedFresh.length}, 실패 ${manifest.failed.length}`
);
if (manifest.failed.length > 0) process.exitCode = 1;

async function collectResort({ resort, cached, cachePath, clientId, clientSecret, options }) {
  const queries = buildSearchQueries(resort);
  const reusableRuns =
    cached?.status === 'partial' &&
    cached?.schemaVersion === RAW_SCHEMA_VERSION &&
    cached?.resort?.id === resort.id &&
    cached?.collection?.configKey === configKey(options)
      ? (cached.queryRuns ?? [])
      : [];
  const queryRuns = [...reusableRuns].filter(run => queries.includes(run.query));

  for (let queryIndex = 0; queryIndex < queries.length; queryIndex += 1) {
    const query = queries[queryIndex];
    if (!queryRuns.some(run => run.query === query)) {
      const response = await requestBlogSearch(query, clientId, clientSecret, options);
      const fetchedAt = new Date().toISOString();
      queryRuns.push({
        query,
        queryIndex,
        fetchedAt,
        lastBuildDate: String(response.lastBuildDate ?? ''),
        total: Number(response.total ?? 0),
        start: Number(response.start ?? 1),
        display: Number(response.display ?? response.items?.length ?? 0),
        items: (response.items ?? []).map((item, itemIndex) =>
          normalizeApiItem(
            normalizeResponseKeys(item),
            Number(response.start ?? 1) + itemIndex,
            query,
            queryIndex,
            fetchedAt
          )
        ),
      });
      queryRuns.sort((a, b) => a.queryIndex - b.queryIndex);

      const partialPool = buildCandidatePool(queryRuns, resort);
      await writeJsonAtomic(
        cachePath,
        buildCacheRecord({
          status: 'partial',
          resort,
          queryRuns,
          candidatePool: partialPool,
          options,
        })
      );
      if (options.delayMs > 0) await sleep(options.delayMs);
    }

    const pool = buildCandidatePool(queryRuns, resort);
    // Do not let unrelated fallback rows suppress the English-name fallback query.
    // Fallbacks stay available for manual review, but only relevant rows satisfy the target.
    if (pool.relevantCount >= options.target) break;
  }

  const candidatePool = buildCandidatePool(queryRuns, resort);
  const record = buildCacheRecord({
    status: 'complete',
    resort,
    queryRuns,
    candidatePool,
    options,
  });
  await writeJsonAtomic(cachePath, record);
  return record;
}

function buildCacheRecord({ status, resort, queryRuns, candidatePool, options }) {
  return {
    schemaVersion: RAW_SCHEMA_VERSION,
    basis: REVIEW_BASIS,
    status,
    collectedAt: new Date().toISOString(),
    resort: { id: resort.id, name: resort.name, name_en: resort.name_en },
    collection: {
      endpoint: API_ENDPOINT,
      sort: 'sim',
      display: options.display,
      minimumRelevantCandidates: options.target,
      configKey: configKey(options),
      fullTextFetched: false,
      note: 'NAVER API HUB 검색 응답의 제목·요약문·출처 메타데이터만 저장합니다. 블로그 원문은 수집하지 않습니다.',
    },
    queryRuns,
    candidatePool,
  };
}

async function requestBlogSearch(query, clientId, clientSecret, options) {
  const url = new URL(API_ENDPOINT);
  url.searchParams.set('query', query);
  url.searchParams.set('display', String(options.display));
  url.searchParams.set('start', '1');
  url.searchParams.set('sort', 'sim');
  url.searchParams.set('format', 'json');

  let lastError;
  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const response = await fetch(url, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': clientId,
          'X-NCP-APIGW-API-KEY': clientSecret,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      const body = await response.text();
      let data;
      try {
        data = body ? JSON.parse(body) : {};
      } catch {
        data = null;
      }

      if (response.ok) {
        if (!data || !Array.isArray(data.items)) throw new Error('API 성공 응답에 items 배열이 없습니다.');
        return data;
      }

      const message = errorMessage(response.status, data, body);
      if (!isRetryableStatus(response.status) || attempt === options.retries) throw new Error(message);
      const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
      const backoff = retryAfter ?? Math.min(30_000, 750 * 2 ** attempt + Math.floor(Math.random() * 250));
      console.warn(`  API ${response.status}; ${backoff}ms 후 재시도 (${attempt + 1}/${options.retries})`);
      await sleep(backoff);
      lastError = new Error(message);
    } catch (error) {
      if (error.message?.startsWith('NAVER API HUB 오류')) throw error;
      lastError =
        error.name === 'AbortError' ? new Error(`API 요청 시간 초과(${options.timeoutMs}ms): ${query}`) : error;
      if (attempt === options.retries) throw lastError;
      const backoff = Math.min(30_000, 750 * 2 ** attempt + Math.floor(Math.random() * 250));
      console.warn(`  네트워크 오류; ${backoff}ms 후 재시도 (${attempt + 1}/${options.retries}): ${lastError.message}`);
      await sleep(backoff);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError ?? new Error('알 수 없는 API 요청 오류');
}

function normalizeResponseKeys(item) {
  return {
    title: item.title,
    link: item.link,
    description: item.description,
    bloggername: item.bloggername ?? item.bloggerName,
    bloggerlink: item.bloggerlink ?? item.bloggerLink,
    postdate: item.postdate ?? item.postDate,
  };
}

function errorMessage(status, data, body) {
  const detail = data?.error?.message ?? data?.errorMessage ?? data?.message ?? body.slice(0, 300) ?? '응답 본문 없음';
  const hint =
    status === 401 || status === 403
      ? ' API 키와 NAVER API HUB 블로그 검색 권한을 확인하세요.'
      : status === 429
        ? ' 호출 한도 또는 애플리케이션의 블로그 검색 API 선택 여부를 확인하세요.'
        : '';
  return `NAVER API HUB 오류 ${status}: ${detail}${hint}`;
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function parseRetryAfter(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value) * 1000;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : null;
}

function parseArgs(args) {
  const parsed = {
    cacheDir: DEFAULT_CACHE_DIR,
    display: 30,
    target: 30,
    delayMs: 250,
    timeoutMs: 15_000,
    retries: 4,
    maxAgeDays: 30,
    force: false,
    dryRun: false,
    failFast: false,
    help: false,
    ids: null,
    limit: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const next = () => {
      const value = args[++index];
      if (value == null || value.startsWith('--')) throw new Error(`${argument} 값이 필요합니다.`);
      return value;
    };
    if (argument === '--cache-dir') parsed.cacheDir = path.resolve(next());
    else if (argument === '--display') parsed.display = integerOption(argument, next(), 10, 100);
    else if (argument === '--target') parsed.target = integerOption(argument, next(), 1, 100);
    else if (argument === '--delay-ms') parsed.delayMs = integerOption(argument, next(), 0, 60_000);
    else if (argument === '--timeout-ms') parsed.timeoutMs = integerOption(argument, next(), 1_000, 120_000);
    else if (argument === '--retries') parsed.retries = integerOption(argument, next(), 0, 10);
    else if (argument === '--max-age-days') parsed.maxAgeDays = integerOption(argument, next(), 0, 3650);
    else if (argument === '--ids') parsed.ids = parseIds(next());
    else if (argument === '--limit') parsed.limit = integerOption(argument, next(), 1, 171);
    else if (argument === '--force') parsed.force = true;
    else if (argument === '--dry-run') parsed.dryRun = true;
    else if (argument === '--fail-fast') parsed.failFast = true;
    else if (argument === '--help' || argument === '-h') parsed.help = true;
    else throw new Error(`알 수 없는 옵션: ${argument}`);
  }
  return parsed;
}

function parseIds(value) {
  const ids = value.split(',').flatMap(part => {
    const range = part.trim().match(/^(\d+)-(\d+)$/);
    if (!range) return [Number(part.trim())];
    const from = Number(range[1]);
    const to = Number(range[2]);
    if (from > to) throw new Error(`잘못된 id 범위: ${part}`);
    return Array.from({ length: to - from + 1 }, (_, index) => from + index);
  });
  if (ids.some(id => !Number.isInteger(id) || id < 1)) throw new Error(`잘못된 --ids 값: ${value}`);
  return new Set(ids);
}

function integerOption(name, value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${name}는 ${minimum}~${maximum} 정수여야 합니다.`);
  }
  return number;
}

function selectResorts(resorts, options) {
  let selected = options.ids ? resorts.filter(({ id }) => options.ids.has(id)) : resorts;
  if (options.ids) {
    const found = new Set(selected.map(({ id }) => id));
    const missing = [...options.ids].filter(id => !found.has(id));
    if (missing.length) throw new Error(`존재하지 않는 리조트 id: ${missing.join(', ')}`);
  }
  if (options.limit) selected = selected.slice(0, options.limit);
  return selected;
}

function configKey(options) {
  return `v3|sort=sim|display=${options.display}|minimum-relevant=${options.target}|uncapped-shortlist|queries=ko-then-en|require-maldives-context`;
}

function publicConfig(options) {
  return {
    endpoint: API_ENDPOINT,
    sort: 'sim',
    display: options.display,
    minimumRelevantCandidates: options.target,
    maxAgeDays: options.maxAgeDays,
    configKey: configKey(options),
  };
}

async function updateManifest(filename, manifest) {
  manifest.updatedAt = new Date().toISOString();
  await writeJsonAtomic(filename, manifest);
}

function printHelp() {
  console.log(`NAVER API HUB 블로그 검색 후보 수집기

Usage:
  npm run reviews:collect -- [options]

Options:
  --dry-run             API 호출 없이 171개 데이터와 검색어 확인
  --ids 1,2,10-15      일부 리조트만 선택
  --limit N             선택 목록 앞에서 N개만 수집
  --display N           검색당 원시 결과 수 (10~100, 기본 30)
  --target N            두 번째 검색어 실행 전 필요한 최소 관련 후보 수 (1~100, 기본 30)
  --delay-ms N          API 호출 사이 대기 (기본 250)
  --timeout-ms N        요청 제한 시간 (기본 15000)
  --retries N           재시도 횟수 (기본 4)
  --max-age-days N      이 기간 내 완료 캐시는 재사용 (기본 30)
  --cache-dir PATH      원시 후보 저장 위치
  --force               캐시를 무시하고 다시 수집
  --fail-fast           첫 실패에서 종료
  --help                도움말

환경 변수(서버 전용):
  NAVER_API_HUB_CLIENT_ID
  NAVER_API_HUB_CLIENT_SECRET
`);
}
