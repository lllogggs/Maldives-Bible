import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../..', import.meta.url));
const compileScript = path.join(rootDir, 'scripts', 'naver-reviews', 'compile.mjs');

test('compiles compact summary and separate detail with independent-source mentions', async (context) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'maldives-reviews-'));
  context.after(() => fs.rm(tempDir, { recursive: true, force: true }));
  const input = path.join(tempDir, 'curated.json');
  const output = path.join(tempDir, 'summary.json');
  const detailsDir = path.join(tempDir, 'details');
  const sources = [
    source('https://blog.naver.com/a/1', '블로그 A', 1),
    source('https://blog.naver.com/b/2', '블로그 B', 2),
    source('https://blog.naver.com/c/3', '블로그 C', 3),
  ];
  const curated = {
    schemaVersion: 1,
    basis: 'naver-blog-search-snippets',
    items: [{
      resortId: 1,
      basis: 'naver-blog-search-snippets',
      evidenceStatus: 'sufficient',
      reviewedAt: '2026-07-13',
      pros: [{ text: '라군이 잔잔해 물놀이하기 편하다는 의견이 반복됩니다.', sourceUrls: sources.slice(0, 2).map(({ url }) => url) }],
      cons: [],
      sources,
    }],
  };
  await fs.writeFile(input, JSON.stringify(curated), 'utf8');

  const success = runCompile(input, output, detailsDir);
  assert.equal(success.status, 0, success.stderr || success.stdout);
  const summary = JSON.parse(await fs.readFile(output, 'utf8'));
  const detail = JSON.parse(await fs.readFile(path.join(detailsDir, '1.json'), 'utf8'));
  assert.equal(summary.items[0].reviewSummary.pros[0].mentions, 2);
  assert.equal(summary.items[0].reviewSummary.sourceCount, 3);
  assert.equal('searchedCount' in summary.items[0].reviewSummary, false);
  assert.equal(summary.items[0].reviewSummary.evidenceStatus, 'sufficient');
  assert.equal('sources' in summary.items[0].reviewSummary, false);
  assert.equal(detail.reviewSummary.sources.length, 3);
  assert.equal(detail.reviewSummary.sources[0].blogName, '블로그 A');
  assert.equal(detail.reviewSummary.sources[0].publishedAt, '2026-07-01');

  curated.items[0].sources[1].url = 'https://blog.naver.com/a/2';
  curated.items[0].pros[0].sourceUrls[1] = 'https://blog.naver.com/a/2';
  await fs.writeFile(input, JSON.stringify(curated), 'utf8');
  const failure = runCompile(input, output, detailsDir);
  assert.notEqual(failure.status, 0);
  assert.match(`${failure.stdout}\n${failure.stderr}`, /독립 출처가 2개 이상/);
});

test('keeps the internal insufficient state while publishing only verified actual-review links', async (context) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'maldives-reviews-insufficient-'));
  context.after(() => fs.rm(tempDir, { recursive: true, force: true }));
  const input = path.join(tempDir, 'curated.json');
  const output = path.join(tempDir, 'summary.json');
  const detailsDir = path.join(tempDir, 'details');
  const curated = {
    schemaVersion: 1,
    basis: 'naver-blog-search-snippets',
    items: [{
      resortId: 1,
      basis: 'naver-blog-search-snippets',
      evidenceStatus: 'insufficient',
      reviewedAt: '2026-07-14',
      curatorNote: '서로 다른 후기에서 반복된 장단점을 확인하지 못했어요.',
      pros: [],
      cons: [],
      sources: [source('https://blog.naver.com/a/1', '블로그 A', 1)],
    }],
  };
  await fs.writeFile(input, JSON.stringify(curated), 'utf8');

  const success = runCompile(input, output, detailsDir);
  assert.equal(success.status, 0, success.stderr || success.stdout);
  const summary = JSON.parse(await fs.readFile(output, 'utf8'));
  const detail = JSON.parse(await fs.readFile(path.join(detailsDir, '1.json'), 'utf8'));
  assert.equal(summary.items[0].reviewSummary.evidenceStatus, 'insufficient');
  assert.equal('searchedCount' in summary.items[0].reviewSummary, false);
  assert.equal(summary.items[0].reviewSummary.sourceCount, 1);
  assert.equal(detail.reviewSummary.sources.length, 1);
  assert.equal('evidenceNote' in summary.items[0].reviewSummary, false);
  assert.equal('evidenceNote' in detail.reviewSummary, false);
});

test('labels one clear firsthand source as limited evidence', async (context) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'maldives-reviews-limited-'));
  context.after(() => fs.rm(tempDir, { recursive: true, force: true }));
  const input = path.join(tempDir, 'curated.json');
  const output = path.join(tempDir, 'summary.json');
  const detailsDir = path.join(tempDir, 'details');
  const onlySource = source('https://blog.naver.com/guest/1', '실제 투숙자', 1);
  const curated = {
    schemaVersion: 1,
    basis: 'naver-blog-search-snippets',
    items: [{
      resortId: 1,
      basis: 'naver-blog-search-snippets',
      evidenceStatus: 'limited',
      limitedEvidenceType: 'firsthand-personal',
      firsthandSourceUrls: [onlySource.url],
      reviewedAt: '2026-07-14',
      pros: [{ text: '직접 투숙 후기에서 직원 응대가 친절했다고 평가함', sourceUrls: [onlySource.url] }],
      cons: [],
      sources: [onlySource],
    }],
  };
  await fs.writeFile(input, JSON.stringify(curated), 'utf8');

  const success = runCompile(input, output, detailsDir);
  assert.equal(success.status, 0, success.stderr || success.stdout);
  const summary = JSON.parse(await fs.readFile(output, 'utf8'));
  const detail = JSON.parse(await fs.readFile(path.join(detailsDir, '1.json'), 'utf8'));
  assert.equal(summary.items[0].reviewSummary.evidenceStatus, 'limited');
  assert.equal(summary.items[0].reviewSummary.pros[0].mentions, 1);
  assert.equal(summary.items[0].reviewSummary.sourceCount, 1);
  assert.equal(detail.reviewSummary.sources.length, 1);

  delete curated.items[0].sources[0].sourceKind;
  await fs.writeFile(input, JSON.stringify(curated), 'utf8');
  const failure = runCompile(input, output, detailsDir);
  assert.notEqual(failure.status, 0);
  assert.match(`${failure.stdout}\n${failure.stderr}`, /sourceKind=firsthand-personal/);
});

function source(url, bloggerName, rawRank) {
  return {
    url,
    title: `${bloggerName} 리조트 후기`,
    bloggerName,
    postDate: '20260701',
    rawRank,
    query: '테스트 리조트 몰디브 후기',
    selection: 'relevant',
    commercialDisclosure: false,
    possibleSalesContent: false,
    sourceKind: 'firsthand-personal',
  };
}

function runCompile(input, output, detailsDir) {
  return spawnSync(process.execPath, [
    compileScript,
    '--input', input,
    '--output', output,
    '--details-dir', detailsDir,
    '--allow-partial',
  ], {
    cwd: rootDir,
    encoding: 'utf8',
  });
}
