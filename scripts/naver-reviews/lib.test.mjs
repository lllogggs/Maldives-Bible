import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCandidatePool,
  buildSearchQueries,
  canonicalizeBlogUrl,
  classifyFirsthandVisitSnippet,
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
  const queries = buildSearchQueries({
    name: '테스트 리조트',
    name_en: 'Test Resort',
  });
  assert.deepEqual(queries, ['테스트 리조트 몰디브 리조트 후기', 'Test Resort 몰디브 리조트 후기']);
});

test('normalizes NAVER URLs and API markup', () => {
  assert.equal(
    canonicalizeBlogUrl('https://m.blog.naver.com/PostView.naver?blogId=tester&logNo=123&utm_source=x'),
    'https://blog.naver.com/tester/123'
  );
  assert.equal(plainText('<b>몰디브</b>&nbsp;후기'), '몰디브 후기');
});

test('flags sales posts without rejecting a personal review that merely mentions comparison shopping', () => {
  assert.equal(
    disclosureFlags({
      titleText: '몰디브 아고다 할인코드 특가',
      descriptionText: '예약 바로가기',
    }).possibleSalesContent,
    true
  );
  assert.equal(
    disclosureFlags({
      titleText: '코쿤 몰디브 실제 투숙 후기',
      descriptionText: '여러 여행사를 비교한 뒤 직접 다녀왔어요',
    }).possibleSalesContent,
    false
  );
});

test('conservatively accepts snippets with resort identity and direct stay details', () => {
  const samples = [
    {
      resort: {
        name: '오젠 리저브 볼리푸시',
        name_en: 'OZEN RESERVE BOLIFUSHI',
      },
      title: '몰디브 - 오젠 리저브 볼리푸시 이용 후기 3편',
      description: '직접 이용했던 곳을 정리하며 4박 5일간의 여행기를 마칩니다. 정말 만족했어요.',
    },
    {
      resort: { name: '두짓타니 몰디브', name_en: 'Dusit Thani Maldives' },
      title: '두짓타니 몰디브 리조트 후기 - 룸타입 편',
      description: '우리는 5박 6일을 두짓타니 몰디브에서 보냈고 그중 2박은 비치 빌라에 묵었어요.',
    },
    {
      resort: { name: '아야다 몰디브', name_en: 'Ayada Maldives' },
      title: '몰디브 신혼여행 3일차, 아야다 몰디브 하프보드 후기',
      description: '조식을 먹어본 뒤 음식이 맛있어서 만족했어요.',
    },
    {
      resort: {
        name: '푸라베리 아일랜드 리조트 & 스파',
        name_en: 'Furaveri Maldives',
      },
      title: '신혼여행 몰디브 DAY 3, 푸라베리 아일랜드 리조트 & 스파',
      description: '워터빌라로 옮겨 3박을 보냈고 바다 풍경이 정말 좋았어요.',
    },
    {
      resort: {
        name: '릴리 비치 리조트 & 스파',
        name_en: 'Lily Beach Resort & Spa',
      },
      title: '몰디브 릴리 비치 리조트 & 스파 수중환경 후기',
      description: '저희 부부는 5박 6일 일정으로 다녀왔고 워터빌라에서 숙박했어요.',
    },
    {
      resort: {
        name: '인터컨티넨탈 몰디브 마무나가우',
        name_en: 'InterContinental Maldives Maamunagau',
      },
      title: '신혼여행 1일차 인터컨티넨탈 몰디브 마무나가우 후기',
      description: '2024년 10월에 다녀온 신혼여행으로 리조트에서 5박을 보냈어요.',
    },
    {
      resort: { name: '바루 바이 애트모스피어', name_en: 'VARU by Atmosphere' },
      title: '바루 바이 애트모스피어 워터빌라 실제 후기',
      description: '저는 워터빌라에 묵었고 직원들이 친절해서 만족했어요.',
    },
    {
      resort: { name: '로빈슨 클럽 누누', name_en: 'Robinson Club Noonu' },
      title: '로빈슨 클럽 누누 워터풀빌라 후기',
      description: '제가 직접 다녀온 곳으로 4박 5일 동안 머물렀고 식사가 맛있었어요.',
    },
    {
      resort: {
        name: '아다란 프레스티지 바두',
        name_en: 'Adaaran Prestige Vadoo',
      },
      title: '아다란 프레스티지 바두 신혼여행 후기',
      description: '우리는 선셋 워터빌라에 묵었고 바다가 정말 좋았어요.',
    },
    {
      resort: { name: '디갈리 몰디브', name_en: 'Dhigali Maldives' },
      title: '디갈리 몰디브 리조트 신혼여행 솔직 후기',
      description: '저희는 비치 방갈로에서 묵었고 총 4박을 보내며 객실에 만족했어요.',
    },
  ];

  for (const sample of samples) {
    const result = classifyFirsthandVisitSnippet(sample, sample.resort);
    assert.equal(result.isLikelyFirsthand, true, sample.title);
    assert.equal(result.identityMatch, true, sample.title);
    assert.equal(result.directExperience, true, sample.title);
  }
});

test('rejects sales, reposts, planning posts, professional inspections, and resort mismatches', () => {
  const samples = [
    {
      resort: {
        name: '아다란 프레스티지 바두',
        name_en: 'Adaaran Prestige Vadoo',
      },
      title: '아다란 프레스티지 바두 리조트 여행 후기',
      description: '하이 몰디브 고객님의 소중한 후기입니다. 제가 추천받은 리조트를 소개합니다.',
      bloggerName: '하이몰디브',
    },
    {
      resort: {
        name: '아난타라 키하바 빌라',
        name_en: 'Anantara Kihavah Villas',
      },
      title: '신혼여행 준비 2편 아난타라 키하바 빌라 후보 20곳 비교 후기',
      description: '후기를 볼 때마다 예쁘다고 느꼈던 후보를 정리합니다.',
    },
    {
      resort: {
        name: '애트모스피어 카니푸시 몰디브',
        name_en: 'Atmosphere Kanifushi Maldives',
      },
      title: '애트모스피어 카니푸시 몰디브 올인클루시브 안내',
      description: '허니문 고객들에게 추천하며 다녀온 분들의 후기를 보면 식사 만족도가 높습니다.',
      bloggerName: '허니문리조트 여행사',
    },
    {
      resort: { name: '바다 몰디브', name_en: 'Baros Maldives' },
      title: '두짓타니 몰디브 럭셔리 리조트 올인클루시브 후기',
      description: '신혼여행으로 두짓타니에 다녀왔고 넓은 바다 풍경이 아름다웠어요.',
    },
    {
      resort: {
        name: '콘스탄스 할라벨리 리조트',
        name_en: 'Constance Halaveli',
      },
      title: '콘스탄스 할라벨리 리조트 인스펙션 출장 후기',
      description: '몰디브 전문 여행사에서 직접 다녀온 리조트를 소개합니다.',
      bloggerName: '하이몰디브 여행사',
    },
    {
      resort: { name: '다와 이후루', name_en: 'Dhawa Ihuru' },
      title: '다와 이후루 조식 수영장 예약 후기',
      description: '다와 이후루를 방문한 여행자들은 높은 평가를 남깁니다. 예약 팁을 소개합니다.',
    },
    {
      resort: { name: '엠부두 빌리지', name_en: 'Embudu Village' },
      title: '엠부두 빌리지 찐 사용자 후기 챙겨 보기',
      description: '실제 투숙객 후기를 번역해 소개합니다. 우리는 4박을 예약했습니다.',
    },
    {
      resort: { name: '쿠라마티 몰디브', name_en: 'Kuramathi Maldives' },
      title: '쿠라마티 몰디브 다른사람들 후기 보기',
      description: '다른 사용자가 워터빌라에서 묵었다는 후기를 정리했습니다.',
    },
    {
      resort: {
        name: '알릴라 코타이파루 몰디브',
        name_en: 'Alila Kothaifaru Maldives',
      },
      title: '알릴라 코타이파루 몰디브 아고다 할인코드 특가',
      description: '최대 40% 할인 예약 바로가기',
    },
    {
      resort: { name: '선 시암 이루 벨리', name_en: 'Sun Siyam Iru Veli' },
      title: '선 시암 이루 푸시 리조트 신혼여행 1일차 후기',
      description: '선 시암 이루 푸시에 도착해서 워터빌라에서 묵었어요.',
    },
  ];

  for (const sample of samples) {
    const result = classifyFirsthandVisitSnippet(sample, sample.resort);
    assert.equal(result.isLikelyFirsthand, false, sample.title);
    assert.ok(result.exclusionReasons.length > 0, sample.title);
  }
});

test('rejects generic resort-name matches without Maldives context', () => {
  const resort = { name: 'SO/ 몰디브', name_en: 'SO/ Maldives' };
  const unrelated = relevanceFor(
    {
      titleText: 'SO 리조트 나트랑 객실 후기',
      descriptionText: '베트남 휴양 여행 기록',
    },
    resort
  );
  const relevant = relevanceFor(
    {
      titleText: 'SO 몰디브 리조트 후기',
      descriptionText: '몰디브 객실과 라군 여행 기록',
    },
    resort
  );

  assert.equal(unrelated.relevant, false);
  assert.equal(relevant.relevant, true);
});

test('accepts an exact distinctive English resort name even when the snippet omits Maldives', () => {
  const result = relevanceFor(
    {
      titleText: 'Coco Palm Dhuni Kolhu 객실 후기',
      descriptionText: '신혼여행 숙소의 객실과 식사 기록',
    },
    { name: '코코 팜 두니 콜루', name_en: 'Coco Palm Dhuni Kolhu' }
  );

  assert.equal(result.hasExactEnglishName, true);
  assert.equal(result.relevant, true);
});

test('deduplicates repeated URLs while preserving query ranks', () => {
  const resort = { id: 999, name: '테스트 리조트', name_en: 'Test Resort' };
  const fetchedAt = '2026-07-13T00:00:00.000Z';
  const first = normalizeApiItem(
    {
      title: '<b>테스트 리조트</b> 몰디브 후기',
      link: 'https://blog.naver.com/tester/123',
      description: '테스트 리조트 객실과 라군 후기',
      bloggername: '여행자',
      bloggerlink: 'https://blog.naver.com/tester',
      postdate: '20260701',
    },
    1,
    '첫 쿼리',
    0,
    fetchedAt
  );
  const duplicate = normalizeApiItem(
    {
      title: '테스트 리조트 재방문',
      link: 'https://m.blog.naver.com/PostView.naver?blogId=tester&logNo=123',
      description: '몰디브 후기',
      bloggername: '여행자',
      bloggerlink: 'https://blog.naver.com/tester',
      postdate: '20260701',
    },
    2,
    '둘째 쿼리',
    1,
    fetchedAt
  );
  const pool = buildCandidatePool([{ items: [first] }, { items: [duplicate] }], resort);

  assert.equal(pool.allUniqueCount, 1);
  assert.equal(pool.shortlist.length, 1);
  assert.equal(pool.shortlist[0].occurrences.length, 2);
  assert.deepEqual(
    pool.shortlist[0].occurrences.map(({ rawRank }) => rawRank),
    [1, 2]
  );
});

test('keeps every unique candidate instead of capping the verification queue', () => {
  const resort = { id: 999, name: '테스트 리조트', name_en: 'Test Resort' };
  const fetchedAt = '2026-07-13T00:00:00.000Z';
  const items = Array.from({ length: 15 }, (_, index) =>
    normalizeApiItem(
      {
        title: `<b>테스트 리조트</b> 몰디브 ${index + 1}일차`,
        link: `https://blog.naver.com/traveler-${index + 1}/${index + 1}`,
        description: '직접 머문 객실과 식사 기록',
        bloggername: `여행자 ${index + 1}`,
        bloggerlink: `https://blog.naver.com/traveler-${index + 1}`,
        postdate: '20260701',
      },
      index + 1,
      '테스트 쿼리',
      0,
      fetchedAt
    )
  );

  const pool = buildCandidatePool([{ items }], resort);

  assert.equal(pool.allUniqueCount, 15);
  assert.equal(pool.shortlist.length, 15);
  assert.equal(pool.shortlist.at(-1)?.candidateRank, 15);
});
