import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sandbox = await mkdtemp(join(tmpdir(), 'maldives-post-build-'));

const run = (command, args, options) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
      } else {
        reject(new Error(`post-build exited with ${code}\n${stdout}\n${stderr}`));
      }
    });
  });

const template = `<!doctype html>
<html lang="ko">
  <head>
    <title>Template</title>
    <meta name="description" content="Template" />
    <meta property="og:title" content="Template" />
    <meta property="og:description" content="Template" />
    <meta property="og:url" content="https://example.com/" />
    <meta property="og:image:alt" content="Template" />
    <meta name="twitter:title" content="Template" />
    <meta name="twitter:description" content="Template" />
    <meta name="twitter:image:alt" content="Template" />
    <link rel="canonical" href="https://example.com/" />
    <link rel="alternate" href="https://example.com/" hreflang="ko-KR" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>
  </head>
  <body><div id="root"></div></body>
</html>`;

const reviewSummary = {
  basis: 'naver-blog-search-snippets',
  reviewedAt: '2026-07-13T03:00:00.000Z',
  sourceCount: 10,
  evidenceStatus: 'sufficient',
  pros: [
    '라군과 객실 전망이 좋다는 언급이 많음 <script>alert("x")</script>',
    { text: '직원 응대가 친절하다는 후기가 반복됨' },
    '정적 상세 페이지에서는 노출하지 않을 세 번째 장점',
  ],
  cons: [
    '성수기에는 레스토랑 예약이 어렵다는 의견이 있음',
    { label: '공항 이동 비용이 부담스럽다는 언급이 있음' },
  ],
};

const reviewSource = {
  title: '직접 확인한 후기 출처',
  url: 'https://blog.naver.com/example/123',
  blogName: '여행 블로그',
  publishedAt: '2026-07-01',
};

const reviewSources = Array.from({ length: 10 }, (_, index) => ({
  ...reviewSource,
  title: `직접 확인한 후기 출처 ${index + 1}`,
  url: `https://blog.naver.com/example/${index + 1}`,
}));

const baseResort = {
  id: 1,
  name: '후기 리조트',
  name_en: 'Review Resort',
  location: 'North Male Atoll </script><script>alert(1)</script>',
  transportation: '스피드보트',
  travelTime: 25,
  travelCost: 200,
  price: 5000,
  rating: 4,
  snorkelingQuality: 4,
  restaurants: 5,
  bars: 2,
  hasWaterVilla: true,
  hasPrivatePool: true,
  honeymoonPerks: true,
};

const noReviewResort = {
  ...baseResort,
  id: 2,
  name: '후기 없는 리조트',
  name_en: 'No Review Resort',
};

const insufficientReviewResort = {
  ...baseResort,
  id: 3,
  name: '근거 부족 리조트',
  name_en: 'Insufficient Review Resort',
};

const insufficientReviewSummary = {
  basis: 'naver-blog-search-snippets',
  reviewedAt: '2026-07-13',
  sourceCount: 0,
  evidenceStatus: 'insufficient',
  pros: [],
  cons: [],
};

try {
  const postBuildTarget = join(sandbox, 'scripts', 'post-build.mjs');
  const templateTarget = join(sandbox, 'dist', 'index.html');
  const dataTarget = join(sandbox, 'dist', 'api', 'resorts.json');
  const reviewInsightsTarget = join(sandbox, 'dist', 'api', 'resort-review-insights.json');
  const reviewDetailTarget = join(sandbox, 'dist', 'api', 'resort-reviews', '1.json');
  const noReviewDetailTarget = join(sandbox, 'dist', 'api', 'resort-reviews', '2.json');
  const insufficientReviewDetailTarget = join(sandbox, 'dist', 'api', 'resort-reviews', '3.json');
  await Promise.all([
    mkdir(dirname(postBuildTarget), { recursive: true }),
    mkdir(dirname(dataTarget), { recursive: true }),
    mkdir(dirname(reviewDetailTarget), { recursive: true }),
  ]);
  await Promise.all([
    copyFile(join(projectRoot, 'scripts', 'post-build.mjs'), postBuildTarget),
    writeFile(templateTarget, template, 'utf8'),
    writeFile(dataTarget, JSON.stringify([baseResort, noReviewResort, insufficientReviewResort]), 'utf8'),
    writeFile(
      reviewInsightsTarget,
      JSON.stringify({
        items: [
          { resortId: baseResort.id, reviewSummary },
          { resortId: noReviewResort.id, reviewSummary: insufficientReviewSummary },
          { resortId: insufficientReviewResort.id, reviewSummary: insufficientReviewSummary },
        ],
      }),
      'utf8'
    ),
    writeFile(
      reviewDetailTarget,
      JSON.stringify({ resortId: 1, reviewSummary: { ...reviewSummary, sources: reviewSources } }),
      'utf8'
    ),
    writeFile(
      noReviewDetailTarget,
      JSON.stringify({ resortId: 2, reviewSummary: { ...insufficientReviewSummary, sources: [] } }),
      'utf8'
    ),
    writeFile(
      insufficientReviewDetailTarget,
      JSON.stringify({ resortId: 3, reviewSummary: { ...insufficientReviewSummary, sources: [] } }),
      'utf8'
    ),
  ]);

  await run(process.execPath, [postBuildTarget], {
    cwd: sandbox,
    env: { ...process.env, EXPECTED_RESORT_COUNT: '3' },
  });

  const reviewHtml = await readFile(
    join(sandbox, 'dist', 'resorts', 'review-resort', 'index.html'),
    'utf8'
  );
  const noReviewHtml = await readFile(
    join(sandbox, 'dist', 'resorts', 'no-review-resort', 'index.html'),
    'utf8'
  );
  const insufficientReviewHtml = await readFile(
    join(sandbox, 'dist', 'resorts', 'insufficient-review-resort', 'index.html'),
    'utf8'
  );

  assert.match(reviewHtml, /실제 후기 한눈에/);
  assert.match(reviewHtml, /실제 후기 10개 참고 · 2026-07-13 업데이트/);
  assert.match(reviewHtml, /참고한 실제 후기 10개/);
  assert.doesNotMatch(reviewHtml, /10건 검토|4건 근거|근거:/);
  assert.match(reviewHtml, /https:\/\/blog\.naver\.com\/example\/1/);
  assert.match(reviewHtml, /https:\/\/blog\.naver\.com\/example\/10/);
  assert.match(reviewHtml, /직원 응대가 친절하다는 후기가 반복됨/);
  assert.match(reviewHtml, /공항 이동 비용이 부담스럽다는 언급이 있음/);
  assert.match(reviewHtml, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(reviewHtml, /<script>alert\("x"\)<\/script>/);
  assert.doesNotMatch(reviewHtml, /정적 상세 페이지에서는 노출하지 않을 세 번째 장점/);
  assert.doesNotMatch(reviewHtml, /"@type"\s*:\s*"(?:Review|AggregateRating)"/);
  assert.doesNotMatch(reviewHtml, /<\/script><script>alert\(1\)<\/script>/);
  assert.match(reviewHtml, /\\u003c\/script>\\u003cscript>alert\(1\)\\u003c\/script>/);
  assert.doesNotMatch(noReviewHtml, /seo-resort-reviews|후기 요약/);
  assert.doesNotMatch(insufficientReviewHtml, /seo-resort-reviews|반복해서 확인된 후기 근거가 부족해요/);

  console.log('Validated optional review summary rendering, escaping, omission, and schema safety.');
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
