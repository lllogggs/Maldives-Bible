import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCandidatePool,
  buildSearchQueries,
  canonicalizeBlogUrl,
  disclosureFlags,
  loadResorts,
  normalizeApiItem,
  plainText,
  relevanceFor,
} from './lib.mjs';

test('loads all 171 unique resorts from nine files', async () => {
  const resorts = await loadResorts();
  assert.equal(resorts.length, 171);
  assert.equal(new Set(resorts.map(({ id }) => id)).size, 171);
});

test('builds deterministic Korean and English review queries', () => {
  const queries = buildSearchQueries({ name: '테스트 리조트', name_en: 'Test Resort' });
  assert.deepEqual(queries, [
    '테스트 리조트 몰디브 리조트 후기',
    'Test Resort 몰디브 리조트 후기',
  ]);
});

test('normalizes NAVER URLs and API markup', () => {
  assert.equal(
    canonicalizeBlogUrl('https://m.blog.naver.com/PostView.naver?blogId=tester&logNo=123&utm_source=x'),
    'https://blog.naver.com/tester/123',
  );
  assert.equal(plainText('<b>몰디브</b>&nbsp;후기'), '몰디브 후기');
});

test('flags sales posts without rejecting a personal review that merely mentions comparison shopping', () => {
  assert.equal(disclosureFlags({
    titleText: '몰디브 아고다 할인코드 특가',
    descriptionText: '예약 바로가기',
  }).possibleSalesContent, true);
  assert.equal(disclosureFlags({
    titleText: '코쿤 몰디브 실제 투숙 후기',
    descriptionText: '여러 여행사를 비교한 뒤 직접 다녀왔어요',
  }).possibleSalesContent, false);
});

test('rejects generic resort-name matches without Maldives context', () => {
  const resort = { name: 'SO/ 몰디브', name_en: 'SO/ Maldives' };
  const unrelated = relevanceFor({
    titleText: 'SO 리조트 나트랑 객실 후기',
    descriptionText: '베트남 휴양 여행 기록',
  }, resort);
  const relevant = relevanceFor({
    titleText: 'SO 몰디브 리조트 후기',
    descriptionText: '몰디브 객실과 라군 여행 기록',
  }, resort);

  assert.equal(unrelated.relevant, false);
  assert.equal(relevant.relevant, true);
});

test('accepts an exact distinctive English resort name even when the snippet omits Maldives', () => {
  const result = relevanceFor({
    titleText: 'Coco Palm Dhuni Kolhu 객실 후기',
    descriptionText: '신혼여행 숙소의 객실과 식사 기록',
  }, { name: '코코 팜 두니 콜루', name_en: 'Coco Palm Dhuni Kolhu' });

  assert.equal(result.hasExactEnglishName, true);
  assert.equal(result.relevant, true);
});

test('deduplicates repeated URLs while preserving query ranks', () => {
  const resort = { id: 999, name: '테스트 리조트', name_en: 'Test Resort' };
  const fetchedAt = '2026-07-13T00:00:00.000Z';
  const first = normalizeApiItem({
    title: '<b>테스트 리조트</b> 몰디브 후기',
    link: 'https://blog.naver.com/tester/123',
    description: '테스트 리조트 객실과 라군 후기',
    bloggername: '여행자',
    bloggerlink: 'https://blog.naver.com/tester',
    postdate: '20260701',
  }, 1, '첫 쿼리', 0, fetchedAt);
  const duplicate = normalizeApiItem({
    title: '테스트 리조트 재방문',
    link: 'https://m.blog.naver.com/PostView.naver?blogId=tester&logNo=123',
    description: '몰디브 후기',
    bloggername: '여행자',
    bloggerlink: 'https://blog.naver.com/tester',
    postdate: '20260701',
  }, 2, '둘째 쿼리', 1, fetchedAt);
  const pool = buildCandidatePool([
    { items: [first] },
    { items: [duplicate] },
  ], resort, 10);

  assert.equal(pool.allUniqueCount, 1);
  assert.equal(pool.shortlist.length, 1);
  assert.equal(pool.shortlist[0].occurrences.length, 2);
  assert.deepEqual(pool.shortlist[0].occurrences.map(({ rawRank }) => rawRank), [1, 2]);
});
