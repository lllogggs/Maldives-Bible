import { copyFile, mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { editorialPolicyPage } from '../data/editorial-policy.mjs';
import { maldivesGlossaryCategories } from '../data/maldives-glossary.mjs';

const distDir = resolve(process.cwd(), 'dist');
const source = resolve(distDir, 'index.html');
const target = resolve(distDir, '404.html');
const reviewInsightsDataPath = resolve(distDir, 'api', 'resort-review-insights.json');
const sourceReviewInsightsPath = resolve(process.cwd(), 'public', 'api', 'resort-review-insights.json');
const editorReviewsDataPath = resolve(distDir, 'api', 'resort-editor-reviews.json');
const sourceEditorReviewsPath = resolve(process.cwd(), 'public', 'api', 'resort-editor-reviews.json');
const reviewDetailsDir = resolve(distDir, 'api', 'resort-reviews');
const sourceReviewDetailsDir = resolve(process.cwd(), 'public', 'api', 'resort-reviews');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const siteUrl = 'https://www.maldivesbible.com';
const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;
const siteDates = {
  resortPagesPublished: '2026-07-09',
  guidesPublished: '2026-07-09',
  comparisonPublished: '2026-07-12',
  glossaryPublished: '2026-07-27',
  homeModified: '2026-07-29',
  modified: '2026-07-27',
};
const coreSeoPages = [
  {
    key: 'start',
    slug: 'start',
    path: '/start/',
    navLabel: '시작하기',
    title: '몰디브 여행 시작하기 | 처음 준비하는 순서',
    description:
      '몰디브 여행을 처음 준비하는 분을 위해 예산, 일정, 이동수단, 객실 타입, 식사 플랜과 스노클링 기준을 순서대로 정리했습니다.',
    heading: '몰디브 여행 시작하기',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 여행 준비를 위한 리조트와 바다 전경',
    imageWidth: 1200,
    imageHeight: 630,
    modifiedAt: '2026-07-29',
  },
  {
    key: 'resortComparison',
    slug: 'maldives-resort-comparison',
    path: '/maldives-resort-comparison/',
    navLabel: '리조트 비교',
    title: '몰디브 리조트 비교 | 171개 리조트 한눈에 보기',
    description:
      '171개 몰디브 리조트를 예산, 말레 공항 이동수단, 객실 유형, 개인풀, 수중환경과 여행 취향 기준으로 비교해 보세요.',
    heading: '몰디브 리조트 비교',
    image: '/brand/resort-comparison-preview.jpg',
    imageAlt: '171개 몰디브 리조트 비교 화면',
    imageWidth: 1216,
    imageHeight: 632,
    modifiedAt: '2026-07-29',
  },
  {
    key: 'quoteComparison',
    slug: 'quote-comparison',
    path: '/quote-comparison/',
    navLabel: '견적 비교',
    title: '몰디브 여행사 견적 비교 | 요청 전 확인할 기준',
    description:
      '몰디브 전문 여행사의 홈페이지와 상담 채널을 확인하고, 같은 일정·객실·식사 조건으로 견적을 비교하는 방법을 안내합니다.',
    heading: '몰디브 여행사 견적 비교',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 여행 견적 비교 안내',
    imageWidth: 1200,
    imageHeight: 630,
    modifiedAt: '2026-07-29',
  },
  {
    key: 'flightGuide',
    slug: 'flight-guide',
    path: '/flight-guide/',
    navLabel: '항공 가이드',
    title: '몰디브 항공 일정 가이드 | 말레 도착·경유 비교',
    description:
      '인천에서 말레까지의 주요 경유 방식과 도착 시간, 수상비행기 운항 시간과 리조트 이동 가능 여부를 함께 확인하세요.',
    heading: '몰디브 항공 일정 가이드',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 말레행 항공 일정 안내',
    imageWidth: 1200,
    imageHeight: 630,
    modifiedAt: '2026-07-29',
  },
];
const coreSeoSlugs = new Set(coreSeoPages.map((page) => page.slug));
const primaryNavItems = coreSeoPages.map(({ path, navLabel }) => ({ path, label: navLabel }));
const expectedResortCount = Number(process.env.EXPECTED_RESORT_COUNT ?? 171);
if (!Number.isInteger(expectedResortCount) || expectedResortCount < 1) {
  throw new Error('EXPECTED_RESORT_COUNT는 1 이상의 정수여야 합니다.');
}
const currentYear = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
}).format(new Date());

const toUrlPath = (slug) => `/${encodeURI(slug)}/`;
const toAbsoluteUrl = (slug) => `${siteUrl}${toUrlPath(slug)}`;

const buildMaldivesGlossaryContent = ({ maxWidth = '1120px' } = {}) => `
  <style>
    .maldives-glossary a:focus-visible { outline:2px solid #14b8a6;outline-offset:3px; }
    @media (max-width:480px) {
      .maldives-glossary__links { grid-template-columns:minmax(0,1fr) !important; }
    }
  </style>
  <section class="maldives-glossary" aria-labelledby="maldives-glossary-title" style="max-width:${maxWidth};margin:32px auto 0;border-top:1px solid #dbe7e4;padding-top:22px;">
    <p style="margin:0;color:#0f766e;font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;">Maldives glossary</p>
    <div style="display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:10px 18px;margin-top:5px;">
      <div>
        <h2 id="maldives-glossary-title" style="margin:0;color:#0f172a;font-size:21px;">몰디브 관련 용어</h2>
        <p style="margin:5px 0 0;color:#64748b;font-size:12px;line-height:1.65;">이동·객실·바다·식사·비용에서 자주 만나는 표현을 분야별로 정리했어요.</p>
      </div>
      <a href="${toAbsoluteUrl('maldives-glossary')}" style="color:#0f766e;font-size:13px;font-weight:800;text-underline-offset:3px;">43개 용어 한 번에 보기 →</a>
    </div>
    <div class="maldives-glossary__links" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:14px;">
      ${maldivesGlossaryCategories.map(category => `
        <a href="${toAbsoluteUrl('maldives-glossary')}#${category.id}" style="display:block;border:1px solid #dbe7e4;border-radius:10px;background:#fff;padding:11px 12px;color:#0f172a;text-decoration:none;">
          <strong style="font-size:13px;">${category.title}</strong>
          <span style="display:block;margin-top:4px;color:#64748b;font-size:11px;line-height:1.5;">${category.preview}</span>
        </a>`).join('')}
    </div>
  </section>`;

const buildEditorialFooter = ({ maxWidth = '1120px', modifiedAt = siteDates.modified } = {}) => `
  <footer style="max-width:${maxWidth};margin:28px auto 0;border-top:1px solid #dbe7e4;padding:18px 0 8px;color:#64748b;font-size:12px;line-height:1.7;">
    <p style="margin:0 0 8px;">몰디브 바이블 편집 · 최종 업데이트 ${modifiedAt.replaceAll('-', '.')}</p>
    <nav aria-label="몰디브 바이블 주요 서비스" style="display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:8px;">
      ${primaryNavItems.map((item) => `<a href="${siteUrl}${item.path}" style="color:#0f766e;font-weight:800;text-decoration:none;">${item.label}</a>`).join('')}
    </nav>
    <nav aria-label="사이트 정보" style="display:flex;flex-wrap:wrap;gap:8px 16px;">
      <a href="${toAbsoluteUrl('maldives-resorts')}" style="color:#0f766e;font-weight:800;text-decoration:none;">전체 리조트 목록</a>
      <a href="${toAbsoluteUrl('maldives-glossary')}" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 용어집</a>
      <a href="${toAbsoluteUrl('about')}" style="color:#0f766e;font-weight:800;text-decoration:none;">소개·편집 기준</a>
    </nav>
  </footer>`;

const nichePages = [
  {
    slug: 'maldives-resort-comparison',
    title: `${currentYear} 몰디브 리조트 비교 | 몰디브 바이블`,
    description:
      '몰디브 리조트의 예산, 이동수단과 시간, 객실 유형, 수중환경 데이터를 한눈에 비교하고 여행 취향에 맞는 후보를 찾아보세요.',
    heading: `${currentYear} 몰디브 리조트 비교`,
    comparisonLanding: true,
    ogImageAlt: '몰디브 바이블, 리조트 비교를 더 쉽게',
    faq: [
      {
        question: '몰디브 리조트는 어떤 순서로 비교하는 것이 좋나요?',
        answer:
          '먼저 4박 2인 기준 예산을 정하고 말레 공항 이후 이동수단과 시간을 확인하세요. 그다음 워터빌라와 개인풀 여부, 수중환경, 식사 선택지를 비교하면 후보를 효율적으로 줄일 수 있습니다.',
      },
      {
        question: '표에 표시된 가격은 실제 예약 금액인가요?',
        answer:
          '표의 가격은 리조트 간 차이를 이해하기 위한 4박 2인 비교용 예시입니다. 여행 날짜, 객실과 식사 플랜, 프로모션에 따라 실제 견적은 달라질 수 있습니다.',
      },
      {
        question: '보트와 수상비행기 이동은 무엇이 다른가요?',
        answer:
          '보트는 공항 도착 후 비교적 빠르게 출발할 수 있고, 수상비행기는 먼 환초까지 이동하며 몰디브의 풍경을 볼 수 있습니다. 수상비행기는 운항 시간과 대기 시간을 일정에 함께 고려해야 합니다.',
      },
      {
        question: '수중환경 점수가 높으면 라군도 예쁜가요?',
        answer:
          '수중환경과 라군은 서로 다른 기준입니다. 수중환경은 스노클링과 산호 접근성을 보는 지표이고, 밝고 넓은 라군의 풍경은 별도로 확인하는 것이 좋습니다.',
      },
    ],
  },
  {
    slug: 'maldives-honeymoon-water-villa-private-pool',
    title: '몰디브 신혼여행 워터빌라 개인풀 리조트 비교 | 몰디브 바이블',
    description:
      '몰디브 신혼여행에서 워터빌라와 개인풀을 함께 보는 커플을 위해 예산, 이동시간, 수중환경 기준으로 후보 리조트를 비교합니다.',
    eyebrow: '워터빌라 개인풀',
    heading: '몰디브 신혼여행 워터빌라 개인풀 후보',
    intro:
      '사진 감성, 프라이버시, 객실 만족도를 우선하는 커플은 워터빌라와 개인풀 여부를 먼저 확인하는 편이 빠릅니다.',
    filter: (resort) => resort.honeymoonPerks && resort.hasWaterVilla && resort.hasPrivatePool,
    sort: (a, b) => b.rating - a.rating || a.price - b.price,
    keywords: ['몰디브 신혼여행 워터빌라', '몰디브 개인풀 리조트', '몰디브 허니문 리조트 비교'],
    faq: [
      {
        question: '몰디브 신혼여행에서 워터빌라와 개인풀을 꼭 같이 봐야 하나요?',
        answer:
          '사진과 프라이버시를 우선하면 같이 보는 편이 좋습니다. 다만 예산이 커질 수 있어 1박 환산가와 이동비를 함께 비교해야 합니다.',
      },
      {
        question: '워터빌라 개인풀 리조트는 어떤 기준으로 줄이면 좋나요?',
        answer:
          '4박 2인 예산, 말레 공항 이후 이동시간, 수중환경 점수, 허니문 혜택 여부를 먼저 보면 후보를 빠르게 줄일 수 있습니다.',
      },
    ],
  },
  {
    slug: 'maldives-honeymoon-first-time-guide',
    title: '몰디브 신혼여행 처음 준비 | 리조트 고르기 전에 볼 기준',
    description:
      '몰디브 신혼여행을 처음 알아보는 예비부부를 위해 예산, 일정, 이동수단, 객실타입, 식사플랜, 스노클링 기준을 먼저 정리합니다.',
    eyebrow: '처음 준비',
    heading: '몰디브 신혼여행 처음 준비하는 커플을 위한 기준',
    intro:
      '몰디브는 리조트 수가 많아 처음에는 이름보다 기준을 먼저 잡는 편이 좋습니다. 예산, 일정, 이동수단, 객실타입만 정해도 후보가 크게 줄어듭니다.',
    filter: (resort) => resort.honeymoonPerks,
    sort: (a, b) => a.price - b.price || a.travelTime - b.travelTime,
    keywords: ['몰디브 신혼여행 처음 준비', '몰디브 신혼여행 리조트 고르기', '몰디브 리조트 선택 기준'],
    sections: [
      {
        title: '처음에는 리조트명보다 기준부터 정하세요',
        body:
          '처음 검색할 때는 유명 리조트 이름을 외우기보다 예산, 4박인지 5박인지, 보트 이동이 편한지, 워터빌라가 꼭 필요한지부터 정하는 편이 빠릅니다.',
      },
      {
        title: '초기 탐색에서 먼저 볼 항목',
        body:
          '4박 2인 예산, 말레공항 이후 이동수단, 워터빌라와 비치빌라 차이, 식사플랜 포함 범위, 스노클링 취향을 먼저 확인하면 상담이나 견적 비교가 쉬워집니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 신혼여행은 처음에 무엇부터 알아봐야 하나요?',
        answer:
          '리조트 이름보다 예산, 일정, 이동수단, 객실타입, 식사플랜을 먼저 정하는 것이 좋습니다. 이 다섯 가지가 정해지면 후보 리조트가 빠르게 줄어듭니다.',
      },
      {
        question: '처음 준비할 때 리조트 후보는 몇 개 정도 보면 좋나요?',
        answer:
          '처음에는 넓게 보고, 기준을 정한 뒤 5-10개 정도로 줄이는 편이 좋습니다. 이후에는 2-3개를 골라 객실과 이동비까지 비교하면 됩니다.',
      },
    ],
  },
  {
    slug: 'maldives-resort-selection-guide',
    title: '몰디브 리조트 선택 기준 | 예산·이동·객실·수중환경',
    description:
      '몰디브 리조트 선택이 어려운 커플을 위해 예산, 이동수단, 워터빌라, 개인풀, 라군, 수중환경 기준을 한국어로 정리합니다.',
    eyebrow: '리조트 선택 기준',
    heading: '몰디브 리조트 선택 기준 먼저 잡기',
    intro:
      '몰디브 리조트는 좋아 보이는 곳이 많아 기준 없이 보면 더 헷갈립니다. 예산, 이동, 객실, 바다 취향을 나눠서 보면 선택이 쉬워집니다.',
    filter: (resort) => resort.honeymoonPerks,
    sort: (a, b) => b.rating - a.rating || a.price - b.price,
    keywords: ['몰디브 리조트 선택 기준', '몰디브 리조트 고르는 법', '몰디브 신혼여행 리조트 기준'],
    sections: [
      {
        title: '예산과 이동수단이 먼저입니다',
        body:
          '리조트 등급보다 먼저 총예산과 이동 피로도를 봐야 합니다. 보트, 수상비행기, 국내선 이동에 따라 첫날 컨디션과 이동비가 달라집니다.',
      },
      {
        title: '라군과 수중환경은 다른 기준입니다',
        body:
          '사진처럼 밝은 라군이 예쁜 리조트와 스노클링이 좋은 리조트는 다를 수 있습니다. 물놀이를 중요하게 보면 수중환경 점수를 따로 봐야 합니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 리조트 선택 기준은 무엇이 가장 중요한가요?',
        answer:
          '처음에는 예산, 이동수단, 객실타입, 수중환경, 식사플랜을 보는 것이 좋습니다. 취향에 따라 워터빌라나 개인풀 여부를 추가로 보면 됩니다.',
      },
      {
        question: '유명 리조트부터 보면 안 되나요?',
        answer:
          '유명 리조트도 좋지만 예산과 이동수단이 맞지 않으면 실제 후보가 되기 어렵습니다. 기준을 먼저 정하고 그 안에서 유명 리조트를 비교하는 편이 효율적입니다.',
      },
    ],
  },
  {
    slug: 'maldives-honeymoon-cost-guide',
    title: '몰디브 신혼여행 비용 감잡기 | 4박 2인 예산 기준',
    description:
      '몰디브 신혼여행을 처음 알아보는 커플을 위해 리조트 숙박비, 이동비, 항공권을 나눠 예산 감을 잡는 방법을 정리합니다.',
    eyebrow: '예산 감잡기',
    heading: '몰디브 신혼여행 비용, 처음에는 이렇게 나눠보세요',
    intro:
      '몰디브 예산은 숙박비만 보면 부족합니다. 항공권, 말레공항 이후 이동비, 식사플랜, 객실타입을 나눠야 실제 총액에 가까워집니다.',
    filter: (resort) => resort.honeymoonPerks,
    sort: (a, b) => a.price - b.price || a.travelTime - b.travelTime,
    keywords: ['몰디브 신혼여행 비용', '몰디브 신혼여행 예산', '몰디브 리조트 4박 비용'],
    sections: [
      {
        title: '숙박비와 이동비를 분리해서 보세요',
        body:
          '리조트 가격이 비슷해 보여도 보트, 수상비행기, 국내선 이동비가 다르면 총액이 달라집니다. 4박 2인 숙박비와 2인 왕복 이동비를 함께 봐야 합니다.',
      },
      {
        title: '객실타입과 식사플랜이 예산을 바꿉니다',
        body:
          '워터빌라, 개인풀, 올인클루시브 여부는 만족도와 예산을 동시에 바꿉니다. 처음에는 1박 환산가로 비교하면 후보를 줄이기 쉽습니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 신혼여행 비용은 무엇을 포함해서 봐야 하나요?',
        answer:
          '항공권, 리조트 숙박비, 말레공항 이후 이동비, 식사플랜, 액티비티 비용을 나눠서 보는 것이 좋습니다. 사이트에서는 리조트와 이동비 기준으로 먼저 비교할 수 있습니다.',
      },
      {
        question: '처음 예산을 잡을 때 1박 가격만 보면 되나요?',
        answer:
          '1박 가격만 보면 이동비와 식사 조건이 빠질 수 있습니다. 4박 총액, 1박 환산가, 이동비를 함께 보는 편이 안전합니다.',
      },
    ],
  },
  {
    slug: 'maldives-honeymoon-itinerary-4-nights-6-days-5-nights-7-days',
    title: '몰디브 신혼여행 일정 | 4박 6일·5박 7일 차이',
    description:
      '몰디브 신혼여행을 처음 계획하는 커플을 위해 4박 6일과 5박 7일 일정에서 리조트 선택과 이동 피로도가 어떻게 달라지는지 정리합니다.',
    eyebrow: '일정 감잡기',
    heading: '몰디브 신혼여행 4박 6일과 5박 7일 차이',
    intro:
      '몰디브는 비행과 리조트 이동 시간이 있어 일정이 짧을수록 이동 피로도가 중요해집니다. 처음에는 숙박일수와 도착 시간을 함께 봐야 합니다.',
    filter: (resort) => resort.honeymoonPerks && resort.travelTime <= 60,
    sort: (a, b) => a.travelTime - b.travelTime || a.price - b.price,
    keywords: ['몰디브 신혼여행 4박 6일', '몰디브 신혼여행 5박 7일', '몰디브 신혼여행 일정'],
    sections: [
      {
        title: '4박이면 이동 피로도가 더 중요합니다',
        body:
          '숙박일수가 짧으면 리조트까지 걸리는 시간이 체감 만족도에 더 크게 작용합니다. 말레공항에서 가까운 보트 이동 후보를 먼저 보는 것도 방법입니다.',
      },
      {
        title: '5박이면 객실 조합을 고민할 수 있습니다',
        body:
          '5박 이상이면 비치빌라와 워터빌라를 나눠 묵는 조합도 고민할 수 있습니다. 예산과 사진 로망을 함께 맞추기 좋습니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 신혼여행은 4박 6일도 충분한가요?',
        answer:
          '가능하지만 이동 시간이 긴 리조트는 체감 일정이 짧아질 수 있습니다. 4박이면 이동수단과 도착 시간을 더 중요하게 보는 편이 좋습니다.',
      },
      {
        question: '5박 7일이면 어떤 점이 좋아지나요?',
        answer:
          '휴식 시간이 늘어나고 비치빌라와 워터빌라를 조합하기 쉬워집니다. 예산이 허용되면 리조트 경험을 더 여유 있게 가져갈 수 있습니다.',
      },
    ],
  },
  {
    slug: 'maldives-resort-transfer-guide',
    title: '몰디브 리조트 이동수단 차이 | 보트·수상비행기·국내선',
    description:
      '몰디브 신혼여행 초보자를 위해 말레공항에서 리조트까지 이동하는 보트, 수상비행기, 국내선의 차이와 선택 기준을 정리합니다.',
    eyebrow: '이동수단 입문',
    heading: '몰디브 리조트 이동수단 차이 알아보기',
    intro:
      '몰디브는 공항에 도착한 뒤 리조트까지 다시 이동해야 합니다. 보트, 수상비행기, 국내선은 비용과 피로도, 첫날 일정에 영향을 줍니다.',
    filter: (resort) => resort.honeymoonPerks,
    sort: (a, b) => a.travelTime - b.travelTime || a.price - b.price,
    keywords: ['몰디브 리조트 이동수단', '몰디브 보트 수상비행기 국내선 차이', '몰디브 말레공항 리조트 이동'],
    sections: [
      {
        title: '보트 이동은 첫날 피로가 적은 편입니다',
        body:
          '말레공항 근처 리조트는 보트로 이동하는 경우가 많아 짧은 일정이나 밤도착 일정에서 후보가 되기 쉽습니다.',
      },
      {
        title: '수상비행기와 국내선은 풍경과 거리의 선택입니다',
        body:
          '수상비행기는 몰디브다운 풍경을 기대할 수 있지만 운항 시간과 대기 시간이 변수입니다. 국내선 이동 리조트는 더 먼 아톨 후보를 볼 때 등장합니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 리조트 이동수단은 왜 중요한가요?',
        answer:
          '국제선 도착 후 리조트까지 다시 이동해야 하므로 첫날 컨디션과 총비용에 영향을 줍니다. 일정이 짧을수록 이동수단을 먼저 보는 것이 좋습니다.',
      },
      {
        question: '보트, 수상비행기, 국내선 중 무엇이 제일 좋나요?',
        answer:
          '정답은 없습니다. 빠른 휴식은 보트, 몰디브다운 풍경은 수상비행기, 먼 아톨의 리조트까지 보려면 국내선 후보가 될 수 있습니다.',
      },
    ],
  },
  {
    slug: 'maldives-water-villa-vs-beach-villa',
    title: '몰디브 워터빌라 비치빌라 차이 | 신혼여행 객실 선택',
    description:
      '몰디브 신혼여행에서 워터빌라와 비치빌라 중 고민하는 커플을 위해 사진 감성, 동선, 예산, 프라이버시 차이를 정리합니다.',
    eyebrow: '객실타입 입문',
    heading: '몰디브 워터빌라와 비치빌라 차이',
    intro:
      '처음 몰디브를 알아볼 때 가장 많이 헷갈리는 것이 워터빌라와 비치빌라입니다. 둘은 사진 감성, 동선, 예산, 물놀이 방식이 다릅니다.',
    filter: (resort) => resort.honeymoonPerks && (resort.hasWaterVilla || resort.hasPrivatePool),
    sort: (a, b) => b.rating - a.rating || a.price - b.price,
    keywords: ['몰디브 워터빌라 비치빌라 차이', '몰디브 신혼여행 객실 선택', '몰디브 워터빌라 꼭 가야하나'],
    sections: [
      {
        title: '워터빌라는 로망과 사진 감성이 강합니다',
        body:
          '바다 위 객실이라는 상징성이 커서 신혼여행 사진과 특별한 경험을 중요하게 보면 매력적입니다. 대신 예산이 올라가는 경우가 많습니다.',
      },
      {
        title: '비치빌라는 동선과 안정감이 좋습니다',
        body:
          '해변과 정원 접근이 편하고 생활 동선이 자연스러운 편입니다. 예산을 조절하면서 리조트 등급을 높이고 싶을 때 후보가 될 수 있습니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 신혼여행은 워터빌라가 필수인가요?',
        answer:
          '필수는 아닙니다. 사진 감성과 특별한 경험을 중요하게 보면 워터빌라가 좋고, 예산과 동선을 중시하면 비치빌라도 좋은 선택입니다.',
      },
      {
        question: '워터빌라와 비치빌라를 섞어서 묵어도 되나요?',
        answer:
          '가능합니다. 5박 이상 일정에서는 비치빌라와 워터빌라를 조합해 예산과 경험을 맞추는 커플도 많습니다.',
      },
    ],
  },
  {
    slug: 'maldives-meal-plan-comparison',
    title: '몰디브 하프보드 풀보드 올인클루시브 차이 | 식사플랜 입문',
    description:
      '몰디브 리조트 예약 전 헷갈리는 하프보드, 풀보드, 올인클루시브 식사플랜 차이와 초보자 체크 포인트를 정리합니다.',
    eyebrow: '식사플랜 입문',
    heading: '몰디브 식사플랜 차이 먼저 이해하기',
    intro:
      '몰디브는 리조트 안에서 식사를 해결하는 시간이 많아 식사플랜이 예산과 만족도에 영향을 줍니다. 포함 범위는 리조트마다 다를 수 있습니다.',
    filter: (resort) => resort.honeymoonPerks && resort.restaurants >= 3,
    sort: (a, b) => b.restaurants - a.restaurants || a.price - b.price,
    keywords: ['몰디브 하프보드 풀보드 올인클루시브 차이', '몰디브 식사플랜', '몰디브 올인클루시브 뜻'],
    sections: [
      {
        title: '하프보드와 풀보드는 식사 횟수 중심입니다',
        body:
          '하프보드는 보통 조식과 석식, 풀보드는 조식과 중식과 석식처럼 이해하면 됩니다. 다만 음료 포함 여부는 반드시 확인해야 합니다.',
      },
      {
        title: '올인클루시브는 포함 범위 확인이 핵심입니다',
        body:
          '올인클루시브라도 주류, 미니바, 특정 레스토랑, 액티비티 포함 여부가 리조트마다 다를 수 있습니다. 이름보다 포함 조건을 확인해야 합니다.',
      },
    ],
    faq: [
      {
        question: '몰디브 올인클루시브는 무조건 좋은가요?',
        answer:
          '식사와 음료 비용을 신경 쓰고 싶지 않은 커플에게 편하지만, 포함 범위가 리조트마다 다릅니다. 레스토랑 수와 제외 조건을 함께 봐야 합니다.',
      },
      {
        question: '처음 준비하면 어떤 식사플랜을 봐야 하나요?',
        answer:
          '예산 통제가 중요하면 올인클루시브를, 리조트 밖 이동이 거의 없고 식사 선택지가 충분한지 보고 싶으면 레스토랑 수와 포함 조건을 같이 보면 됩니다.',
      },
    ],
  },
  {
    slug: 'maldives-speedboat-resorts-honeymoon',
    title: '몰디브 보트 이동 리조트 비교 | 신혼여행 이동 피로 줄이기',
    description:
      '장거리 비행 뒤 이동 피로가 걱정되는 커플을 위해 말레 공항에서 보트로 이동하는 몰디브 허니문 리조트를 비교합니다.',
    eyebrow: '보트 이동 리조트',
    heading: '몰디브 보트 이동 리조트 후보',
    intro:
      '신혼여행 첫날 컨디션이 걱정된다면 보트 이동 리조트부터 보는 것이 현실적입니다. 이동시간과 이동비, 허니문 혜택을 함께 봅니다.',
    filter: (resort) => resort.transportation === '보트' && resort.honeymoonPerks,
    sort: (a, b) => a.travelTime - b.travelTime || a.price - b.price,
    keywords: ['몰디브 보트 이동 리조트', '몰디브 스피드보트 리조트', '몰디브 신혼여행 이동수단'],
    faq: [
      {
        question: '몰디브 보트 이동 리조트는 어떤 커플에게 맞나요?',
        answer:
          '밤 비행이나 장거리 비행 후 바로 쉬고 싶은 커플, 수상비행기 대기 시간이 부담스러운 커플에게 특히 맞습니다.',
      },
      {
        question: '보트 이동이면 무조건 저렴한가요?',
        answer:
          '이동비는 줄어드는 경우가 많지만 객실 등급과 식사 플랜에 따라 총액은 달라집니다. 4박 총액과 1박 환산가를 같이 봐야 합니다.',
      },
    ],
  },
  {
    slug: 'maldives-seaplane-resorts-comparison',
    title: '몰디브 수상비행기 리조트 비교 | 라군·수중환경 중심 후보',
    description:
      '몰디브 수상비행기 이동 리조트를 라군, 수중환경, 이동시간, 예산 기준으로 비교해 신혼여행 후보를 좁힙니다.',
    eyebrow: '수상비행기 리조트',
    heading: '몰디브 수상비행기 리조트 비교',
    intro:
      '수상비행기 이동은 몰디브다운 풍경을 기대하는 커플에게 매력적입니다. 대신 운항 시간과 대기 피로를 감안해 후보를 비교해야 합니다.',
    filter: (resort) => resort.transportation === '수상비행기' && resort.honeymoonPerks,
    sort: (a, b) => b.snorkelingQuality - a.snorkelingQuality || a.travelTime - b.travelTime,
    keywords: ['몰디브 수상비행기 리조트', '몰디브 라군 리조트', '몰디브 수중환경 좋은 리조트'],
    faq: [
      {
        question: '수상비행기 리조트는 왜 따로 비교해야 하나요?',
        answer:
          '말레 공항 도착 시간과 수상비행기 운항 시간에 따라 첫날 일정이 달라질 수 있어 이동시간과 예산을 함께 보는 것이 좋습니다.',
      },
      {
        question: '수상비행기 리조트는 수중환경이 항상 좋은가요?',
        answer:
          '그렇지 않습니다. 라군이 예쁜 곳과 스노클링이 좋은 곳은 다를 수 있어 수중환경 점수를 별도로 비교해야 합니다.',
      },
    ],
  },
  {
    slug: 'maldives-snorkeling-house-reef-resorts',
    title: '몰디브 스노클링 좋은 리조트 비교 | 하우스리프·수중환경 기준',
    description:
      '몰디브에서 스노클링과 하우스리프를 중요하게 보는 커플을 위해 수중환경 점수, 이동수단, 예산 기준으로 리조트를 비교합니다.',
    eyebrow: '스노클링 좋은 리조트',
    heading: '몰디브 스노클링 좋은 리조트 후보',
    intro:
      '라군 색감보다 물속 경험이 중요한 커플이라면 수중환경 점수와 이동수단을 먼저 보는 편이 좋습니다.',
    filter: (resort) => resort.snorkelingQuality >= 4.7 && resort.honeymoonPerks,
    sort: (a, b) => b.snorkelingQuality - a.snorkelingQuality || b.rating - a.rating,
    keywords: ['몰디브 스노클링 리조트', '몰디브 하우스리프 리조트', '몰디브 수중환경 리조트'],
    faq: [
      {
        question: '몰디브 스노클링 리조트는 어떤 데이터를 봐야 하나요?',
        answer:
          '수중환경 점수, 리조트 위치, 이동수단, 객실 타입을 같이 보는 것이 좋습니다. 라군이 예뻐도 하우스리프 접근성이 다를 수 있습니다.',
      },
      {
        question: '허니문에서도 스노클링 기준이 중요한가요?',
        answer:
          '물놀이 시간이 길거나 액티비티를 중요하게 보는 커플이라면 객실 감성만큼 중요한 기준입니다.',
      },
    ],
  },
  {
    slug: 'maldives-all-inclusive-honeymoon-resorts',
    title: '몰디브 올인클루시브 신혼여행 리조트 비교 | 예산·다이닝 기준',
    description:
      '몰디브 신혼여행 예산을 잡기 쉽게 4박 2인 기준 가격, 레스토랑 수, 허니문 혜택을 중심으로 올인클루시브 후보를 비교합니다.',
    eyebrow: '올인클루시브 신혼여행',
    heading: '몰디브 올인클루시브 신혼여행 후보',
    intro:
      '견적이 불안한 커플은 숙박 총액만 보지 말고 1박 환산가, 다이닝 선택지, 이동비를 함께 비교해야 합니다.',
    filter: (resort) => resort.honeymoonPerks && resort.restaurants >= 4,
    sort: (a, b) => a.price - b.price || b.restaurants - a.restaurants,
    keywords: ['몰디브 올인클루시브 신혼여행', '몰디브 허니문 예산', '몰디브 리조트 4박 가격'],
    faq: [
      {
        question: '몰디브 올인클루시브는 어떤 커플에게 맞나요?',
        answer:
          '현지에서 식사와 음료 비용을 계속 계산하고 싶지 않은 커플에게 맞습니다. 포함 범위는 리조트마다 달라 상세 조건 확인이 필요합니다.',
      },
      {
        question: '올인클루시브 리조트는 가격만 보면 되나요?',
        answer:
          '가격 외에도 레스토랑 수, 바 수, 이동비, 허니문 혜택, 객실 타입을 같이 봐야 실제 만족도가 올라갑니다.',
      },
    ],
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const serializeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const buildSchemaGraph = (nodes) => serializeJsonLd({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
});

const buildBreadcrumbNode = ({ url, name, parents = [] }) => ({
  '@type': 'BreadcrumbList',
  '@id': `${url}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '몰디브 바이블', item: `${siteUrl}/` },
    ...parents.map((parent, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: parent.name,
      item: parent.url,
    })),
    {
      '@type': 'ListItem',
      position: parents.length + 2,
      name,
      item: url,
    },
  ],
});

const buildWebPageNode = ({
  url,
  name,
  description,
  type = 'WebPage',
  publishedAt,
  modifiedAt,
  mainEntityId,
  breadcrumbId = `${url}#breadcrumb`,
  subjectOfId,
  primaryImage,
}) => ({
  '@type': type,
  '@id': `${url}#webpage`,
  url,
  name,
  description,
  inLanguage: 'ko-KR',
  isPartOf: { '@id': websiteId },
  about: { '@id': organizationId },
  publisher: { '@id': organizationId },
  breadcrumb: { '@id': breadcrumbId },
  primaryImageOfPage: primaryImage
    ? {
        '@type': 'ImageObject',
        url: primaryImage.url,
        width: primaryImage.width,
        height: primaryImage.height,
      }
    : undefined,
  datePublished: publishedAt,
  dateModified: modifiedAt,
  mainEntity: mainEntityId ? { '@id': mainEntityId } : undefined,
  subjectOf: subjectOfId ? { '@id': subjectOfId } : undefined,
});

const buildFaqNode = (url, items) => ({
  '@type': 'FAQPage',
  '@id': `${url}#faq`,
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

const safeHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const toReviewPointText = (point) => {
  const value = typeof point === 'string' ? point : point?.text ?? point?.label ?? '';
  const normalized = String(value).replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return null;
  }
  return normalized.length > 140 ? `${normalized.slice(0, 139).trimEnd()}…` : normalized;
};

const normalizeReviewSummary = (reviewSummary) => {
  if (!reviewSummary || typeof reviewSummary !== 'object' || Array.isArray(reviewSummary)) {
    return null;
  }

  const normalizePoints = (points) =>
    Array.isArray(points) ? points.map(toReviewPointText).filter(Boolean) : [];
  const pros = normalizePoints(reviewSummary.pros);
  const cons = normalizePoints(reviewSummary.cons);
  const evidenceStatus = reviewSummary.evidenceStatus === 'insufficient'
    ? 'insufficient'
    : reviewSummary.evidenceStatus === 'limited'
      ? 'limited'
    : reviewSummary.evidenceStatus === 'sufficient' || pros.length > 0 || cons.length > 0
      ? 'sufficient'
      : null;
  if (!evidenceStatus || (evidenceStatus !== 'insufficient' && pros.length === 0 && cons.length === 0)) {
    return null;
  }

  const numericSourceCount = Number(reviewSummary.sourceCount ?? reviewSummary.sampleSize);
  const sourceCount = Number.isInteger(numericSourceCount) && numericSourceCount > 0
    ? Math.min(numericSourceCount, 9999)
    : null;
  const reviewDateValue = reviewSummary.reviewedAt ?? reviewSummary.searchedAt;
  const reviewedAt = typeof reviewDateValue === 'string'
    ? reviewDateValue.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null
    : null;
  const basis = typeof reviewSummary.basis === 'string'
    ? reviewSummary.basis.trim().slice(0, 80)
    : /naver|네이버/i.test(reviewSummary.source || '')
      ? 'naver-blog-search-snippets'
    : '';
  const sources = (Array.isArray(reviewSummary.sources) ? reviewSummary.sources : [])
    .flatMap((source) => {
      const url = safeHttpUrl(source?.url);
      const title = String(source?.title ?? '').replace(/\s+/g, ' ').trim();
      if (!url || !title) return [];
      return [{
        url,
        title: title.slice(0, 180),
        blogName: String(source?.blogName ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
        publishedAt: String(source?.publishedAt ?? '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
      }];
    })
    .slice(0, 10);

  return { pros, cons, sourceCount, reviewedAt, basis, evidenceStatus, sources };
};

const buildReviewSummaryContent = (reviewSummary, { compact = false } = {}) => {
  const summary = normalizeReviewSummary(reviewSummary);
  if (!summary || summary.evidenceStatus === 'insufficient') {
    return '';
  }

  const limit = compact ? 1 : 2;
  const pros = summary.pros.slice(0, limit);
  const cons = summary.cons.slice(0, limit);
  const reviewDateLabel = summary.reviewedAt ? `${summary.reviewedAt} 후기 기준` : null;

  if (compact) {
    return `
      <div style="margin:0 0 14px;border-top:1px solid #e2e8f0;padding-top:12px;">
        <p style="margin:0 0 7px;color:#64748b;font-size:12px;font-weight:800;">실제 후기 요약</p>
        ${pros.length > 0 ? `<p style="margin:0 0 5px;color:#334155;font-size:14px;line-height:1.55;"><strong style="color:#0f766e;">좋았다는 점</strong> ${escapeHtml(pros[0])}</p>` : ''}
        ${cons.length > 0 ? `<p style="margin:0;color:#334155;font-size:14px;line-height:1.55;"><strong style="color:#9a5b31;">알아둘 점</strong> ${escapeHtml(cons[0])}</p>` : ''}
      </div>`;
  }

  const pointList = (points) => points
    .map((point) => `<li style="margin-top:7px;line-height:1.65;">${escapeHtml(point)}</li>`)
    .join('');
  const sourceLinks = summary.sources
    .map((source) => `<li style="margin-top:7px;"><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" style="color:#0f766e;text-decoration:underline;text-underline-offset:2px;">${escapeHtml(source.title)}</a>${source.blogName || source.publishedAt ? `<span style="color:#64748b;"> · ${escapeHtml([source.blogName, source.publishedAt].filter(Boolean).join(' · '))}</span>` : ''}</li>`)
    .join('');

  return `
    <section class="seo-resort-reviews" aria-labelledby="seo-resort-reviews-title" style="margin:24px 0 22px;border-top:1px solid #dbe7e4;padding-top:22px;">
      <p style="margin:0 0 7px;color:#0f766e;font-size:12px;font-weight:800;letter-spacing:.1em;">REAL REVIEWS</p>
      <h2 id="seo-resort-reviews-title" style="margin:0 0 14px;font-size:23px;color:#0f172a;">실제 후기 한눈에</h2>
      <div class="seo-resort-review-grid" style="display:grid;grid-template-columns:${pros.length > 0 && cons.length > 0 ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)'};gap:12px;">
        ${pros.length > 0 ? `<section style="border-radius:12px;background:#effaf7;padding:15px 16px;"><h3 style="margin:0;color:#0f766e;font-size:16px;">좋았다는 점</h3><ul style="margin:5px 0 0;padding-left:19px;color:#334155;">${pointList(pros)}</ul></section>` : ''}
        ${cons.length > 0 ? `<section style="border-radius:12px;background:#fff8f0;padding:15px 16px;"><h3 style="margin:0;color:#9a5b31;font-size:16px;">알아둘 점</h3><ul style="margin:5px 0 0;padding-left:19px;color:#334155;">${pointList(cons)}</ul></section>` : ''}
      </div>
      ${sourceLinks ? `<details style="margin-top:12px;border-top:1px solid #dbe7e4;padding-top:10px;"><summary style="cursor:pointer;color:#0f766e;font-size:13px;font-weight:700;">실제 후기 원문 ${summary.sources.length}개 보기</summary><ul style="margin:5px 0 0;padding-left:19px;color:#334155;font-size:12px;line-height:1.6;">${sourceLinks}</ul></details>` : ''}
      <p style="margin:11px 0 0;color:#64748b;font-size:12px;line-height:1.6;">${reviewDateLabel ? `${escapeHtml(reviewDateLabel)}. ` : ''}투숙 시기와 객실 유형에 따라 경험은 달라질 수 있습니다.</p>
    </section>`;
};

const normalizeEditorReview = (editorReview) => {
  if (!editorReview || typeof editorReview !== 'object' || Array.isArray(editorReview)) {
    return null;
  }

  const clean = (value, maxLength) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
  const title = clean(editorReview.title, 100);
  const dek = clean(editorReview.dek, 240);
  const paragraphs = Array.isArray(editorReview.paragraphs)
    ? editorReview.paragraphs.map((paragraph) => clean(paragraph, 600)).filter(Boolean)
    : [];
  const verdict = clean(editorReview.verdict, 240);
  const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(editorReview.publishedAt ?? '')
    ? editorReview.publishedAt
    : null;

  if (!title || !dek || paragraphs.length !== 3 || !verdict || !publishedAt) {
    return null;
  }

  return { title, dek, paragraphs, verdict, publishedAt };
};

const buildEditorReviewContent = (editorReview) => {
  const review = normalizeEditorReview(editorReview);
  if (!review) return '';

  return `
    <article class="seo-editor-review" aria-labelledby="seo-editor-review-title" style="margin:24px 0 26px;overflow:hidden;border:1px solid #dbe4e1;border-radius:18px;background:#fffdfa;box-shadow:0 16px 40px rgba(15,23,42,.06);">
      <div aria-hidden="true" style="height:4px;background:linear-gradient(90deg,#0f766e 0%,#2dd4bf 58%,#fcd34d 100%);"></div>
      <header style="padding:28px;background:radial-gradient(circle at top right,rgba(13,148,136,.08),transparent 42%);border-bottom:1px solid rgba(226,232,240,.9);">
        <div style="display:flex;align-items:center;gap:12px;">
          <span aria-hidden="true" style="display:block;width:32px;height:1px;flex:none;background:#0f766e;"></span>
          <p style="margin:0;color:#115e59;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;">MALDIVES BIBLE · EDITOR REVIEW</p>
        </div>
        <h2 id="seo-editor-review-title" style="margin:14px 0 0;max-width:820px;color:#0f172a;font-size:28px;line-height:1.3;letter-spacing:-.03em;">${escapeHtml(review.title)}</h2>
        <p style="margin:14px 0 0;max-width:68ch;color:#475569;font-size:16px;font-weight:600;line-height:1.75;">${escapeHtml(review.dek)}</p>
      </header>
      <div class="seo-editor-review-body" style="display:grid;grid-template-columns:minmax(0,1fr) 240px;align-items:start;gap:32px;padding:28px;">
        <div class="seo-editor-review-copy" style="max-width:68ch;">
          ${review.paragraphs.map((paragraph, index) => `<p style="margin:${index === 0 ? '0' : '18px'} 0 0;color:#334155;font-size:16px;line-height:1.75;">${escapeHtml(paragraph)}</p>`).join('')}
        </div>
        <aside class="seo-editor-review-note" style="border:1px solid rgba(253,230,138,.8);border-radius:12px;background:#fbf7ee;padding:18px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span aria-hidden="true" style="display:block;width:6px;height:6px;border-radius:50%;background:#0f766e;"></span>
            <h3 style="margin:0;color:#115e59;font-size:12px;font-weight:800;letter-spacing:-.01em;">에디터의 결론</h3>
          </div>
          <p style="margin:10px 0 0;color:#0f172a;font-size:15px;font-weight:700;line-height:1.7;">${escapeHtml(review.verdict)}</p>
        </aside>
      </div>
    </article>`;
};

const buildResortDescription = (resort) => {
  const editorReview = normalizeEditorReview(resort.editorReview);
  if (editorReview) return `${resort.name || resort.name_en} 에디터 리뷰. ${editorReview.dek}`;

  const displayName = resort.name || resort.name_en;
  const englishName = resort.name_en && resort.name_en !== displayName ? `(${resort.name_en})` : null;
  const parts = [
    [displayName, englishName].filter(Boolean).join(' '),
    resort.transportation ? `${resort.transportation} 이동` : null,
    resort.price ? `4박 2인 기준 $${resort.price.toLocaleString?.() ?? resort.price}` : null,
  ].filter(Boolean);

  return `${parts.join(' · ')} 리조트 정보를 한국어로 확인하세요.`;
};

const formatUsd = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

const resortCard = (resort) => {
  const slug = slugify(resort.name_en || resort.name);
  const badges = [
    resort.transportation,
    resort.hasWaterVilla ? '워터빌라' : null,
    resort.hasPrivatePool ? '개인풀' : null,
    resort.honeymoonPerks ? '허니문 혜택' : null,
  ].filter(Boolean);
  const reviewSummaryContent = buildReviewSummaryContent(resort.reviewSummary, { compact: true });

  return `
    <article style="border:1px solid #dbe7e4;border-radius:12px;padding:18px;background:#fff;">
      <h2 style="margin:0 0 6px;font-size:20px;color:#0f172a;">${escapeHtml(resort.name)}</h2>
      <p style="margin:0 0 12px;color:#64748b;">${escapeHtml(resort.name_en || '')}</p>
      <p style="margin:0 0 10px;color:#334155;">${escapeHtml(resort.location || '')} · ${escapeHtml(resort.transportation || '')} ${resort.travelTime || 0}분 · 4박 2인 ${formatUsd(resort.price)}</p>
      <p style="margin:0 0 14px;color:#334155;">수중환경 ${resort.snorkelingQuality || '-'} / 5 · 다이닝 ${resort.restaurants || 0}곳 · 이동비 2인 왕복 ${formatUsd((resort.travelCost || 0) * 2)}</p>
      <p style="margin:0 0 14px;">${badges
        .map((badge) => `<span style="display:inline-block;margin:0 6px 6px 0;border-radius:999px;background:#ecfeff;color:#0f766e;padding:4px 9px;font-size:13px;font-weight:700;">${escapeHtml(badge)}</span>`)
        .join('')}</p>
      ${reviewSummaryContent}
      <a href="${siteUrl}/resorts/${slug}/" style="color:#0f766e;font-weight:700;text-decoration:none;">${escapeHtml(resort.name)} 상세 보기</a>
    </article>`;
};

const buildResortPageContent = (resort) => {
  const name = resort.name || resort.name_en;
  const badges = [
    resort.transportation ? `${resort.transportation} 이동` : null,
    resort.hasWaterVilla ? '워터빌라 보유' : null,
    resort.hasPrivatePool ? '개인풀 보유' : null,
    resort.honeymoonPerks ? '허니문 혜택' : null,
  ].filter(Boolean);
  const editorReviewContent = buildEditorReviewContent(resort.editorReview);
  const reviewSummaryContent = buildReviewSummaryContent(resort.reviewSummary);

  return `
    <style>
      @media (max-width:760px) {
        .seo-editor-review-body { grid-template-columns:minmax(0,1fr) !important; }
        .seo-editor-review-note { grid-row:1; }
      }
      @media (max-width:480px) {
        .seo-resort-page { padding:22px 12px !important; }
        .seo-resort-card { padding:18px !important; }
        .seo-resort-card h1 { font-size:clamp(28px,9vw,34px) !important;line-height:1.22 !important;letter-spacing:-.035em;overflow-wrap:anywhere; }
        .seo-resort-review-grid { grid-template-columns:minmax(0,1fr) !important; }
        .seo-editor-review header, .seo-editor-review-body { padding:16px !important; }
        .seo-editor-review h2 { font-size:24px !important; }
      }
    </style>
    <main class="seo-resort-page" style="font-family:'NanumSquareNeo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
      <article class="seo-resort-card" style="max-width:920px;margin:0 auto;border:1px solid #dbe7e4;border-radius:14px;background:#fff;padding:26px;">
        <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">몰디브 리조트 상세</p>
        <h1 style="margin:0;font-size:38px;line-height:1.18;">${escapeHtml(name)}</h1>
        <p style="margin:8px 0 18px;color:#64748b;font-size:17px;">${escapeHtml(resort.name_en || '')}</p>
        <p style="margin:0 0 12px;color:#334155;line-height:1.7;">
          ${escapeHtml(resort.location || '')} · ${escapeHtml(resort.transportation || '')} ${resort.travelTime || 0}분 · 4박 2인 ${formatUsd(resort.price)}
        </p>
        <p style="margin:0 0 18px;color:#334155;line-height:1.7;">
          수중환경 ${resort.snorkelingQuality || '-'} / 5 · 레스토랑 ${resort.restaurants || 0}곳 · 바 ${resort.bars || 0}곳 · 이동비 2인 왕복 ${formatUsd((resort.travelCost || 0) * 2)}
        </p>
        <p style="margin:0 0 20px;">${badges
          .map((badge) => `<span style="display:inline-block;margin:0 6px 6px 0;border-radius:999px;background:#ecfeff;color:#0f766e;padding:4px 9px;font-size:13px;font-weight:700;">${escapeHtml(badge)}</span>`)
          .join('')}</p>
        ${editorReviewContent}
        ${reviewSummaryContent}
        <a href="${toAbsoluteUrl('maldives-resort-comparison')}" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 비교 가이드</a>
        <span aria-hidden="true" style="margin:0 8px;color:#94a3b8;">·</span>
        <a href="${siteUrl}/maldives-resort-comparison/" style="color:#0f766e;font-weight:800;text-decoration:none;">전체 리조트 직접 비교</a>
        ${buildMaldivesGlossaryContent({ maxWidth: '100%' })}
        ${buildEditorialFooter({ maxWidth: '100%' })}
      </article>
    </main>`;
};

const buildNichePageContent = (page, resorts) => {
  const url = toAbsoluteUrl(page.slug);
  const isGuide = Array.isArray(page.sections) && page.sections.length > 0;
  const selected = resorts.filter(page.filter).sort(page.sort).slice(0, 12);
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const listItems = selected
    .map((resort, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: resort.name,
      url: `${siteUrl}/resorts/${slugify(resort.name_en || resort.name)}/`,
    }));
  const itemListNode = {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name: page.heading,
    numberOfItems: listItems.length,
    itemListElement: listItems,
  };
  const articleNode = isGuide
    ? {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: page.heading,
        description: page.description,
        inLanguage: 'ko-KR',
        mainEntityOfPage: { '@id': `${url}#webpage` },
        author: { '@id': organizationId },
        publisher: { '@id': organizationId },
        datePublished: siteDates.guidesPublished,
        dateModified: siteDates.modified,
        keywords: page.keywords,
      }
    : null;
  const mainEntityId = isGuide ? `${url}#article` : `${url}#itemlist`;
  const schemaNodes = [
    buildWebPageNode({
      url,
      name: page.heading,
      description: page.description,
      type: isGuide ? 'WebPage' : 'CollectionPage',
      publishedAt: siteDates.guidesPublished,
      modifiedAt: siteDates.modified,
      mainEntityId,
      subjectOfId: `${url}#faq`,
    }),
    buildBreadcrumbNode({ url, name: page.heading }),
    articleNode,
    itemListNode,
    buildFaqNode(url, page.faq),
  ];

  return {
    html: `
      <style>
        @media (max-width:480px) {
          .seo-niche-page { padding:22px 12px !important; }
          .seo-niche-hero h1 { font-size:clamp(28px,9vw,34px) !important;line-height:1.22 !important;letter-spacing:-.035em;overflow-wrap:anywhere; }
          .seo-niche-sections,.seo-niche-grid { grid-template-columns:minmax(0,1fr) !important; }
          .seo-niche-card { padding:16px !important; }
          .seo-niche-footer-links { display:flex;flex-direction:column;align-items:flex-start;gap:12px; }
          .seo-niche-footer-links span { display:none; }
        }
      </style>
      <main class="seo-niche-page" style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
        <section class="seo-niche-hero" style="max-width:1120px;margin:0 auto 24px;">
          <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(page.eyebrow)}</p>
          <h1 style="margin:0;font-size:38px;line-height:1.18;">${escapeHtml(page.heading)}</h1>
          <p style="max-width:760px;margin:14px 0 0;color:#475569;font-size:17px;line-height:1.8;">${escapeHtml(page.intro)}</p>
        </section>
        ${sections.length > 0
          ? `<section class="seo-niche-sections" style="max-width:1120px;margin:0 auto 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
              ${sections
                .map(
                  (section) => `
                    <article class="seo-niche-card" style="border:1px solid #dbe7e4;border-radius:12px;background:#fff;padding:18px;">
                      <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">${escapeHtml(section.title)}</h2>
                      <p style="margin:0;color:#475569;line-height:1.7;">${escapeHtml(section.body)}</p>
                    </article>`
                )
                .join('\n')}
            </section>`
          : ''}
        <section class="seo-niche-grid" style="max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
          ${selected.map(resortCard).join('\n')}
        </section>
        <section style="max-width:1120px;margin:28px auto 0;border-top:1px solid #dbe7e4;padding-top:22px;">
          <h2 style="font-size:24px;margin:0 0 12px;">자주 묻는 질문</h2>
          ${page.faq
            .map(
              (item) => `
                <article style="margin:0 0 14px;">
                  <h3 style="margin:0 0 6px;font-size:18px;">${escapeHtml(item.question)}</h3>
                  <p style="margin:0;color:#475569;line-height:1.7;">${escapeHtml(item.answer)}</p>
                </article>`
            )
            .join('\n')}
          <p class="seo-niche-footer-links" style="margin:24px 0 0;">
            <a href="${toAbsoluteUrl('maldives-resort-comparison')}" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 비교 가이드</a>
            <span aria-hidden="true" style="margin:0 8px;color:#94a3b8;">·</span>
            <a href="${siteUrl}/maldives-resort-comparison/" style="color:#0f766e;font-weight:800;text-decoration:none;">전체 리조트 직접 비교</a>
          </p>
        </section>
        ${buildMaldivesGlossaryContent()}
        ${buildEditorialFooter()}
      </main>`,
    schemaNodes,
  };
};

const buildComparisonLandingContent = (page, resorts) => {
  const url = toAbsoluteUrl(page.slug);
  const resortUrl = (resort) => `${siteUrl}/resorts/${slugify(resort.name_en || resort.name)}/`;
  const validPrice = (resort) => Number.isFinite(resort.price) && resort.price > 0;
  const validTravelTime = (resort) => Number.isFinite(resort.travelTime) && resort.travelTime > 0;

  const criteria = [
    {
      title: '1. 숙박비와 이동비',
      body:
        '숙박비가 비슷해도 보트, 수상비행기, 국내선 비용에 따라 총액이 달라집니다. 먼저 4박 2인 비교용 가격과 2인 왕복 이동비를 함께 확인하세요.',
      resorts: [...resorts]
        .filter(validPrice)
        .sort((a, b) => a.price - b.price || a.travelCost - b.travelCost)
        .slice(0, 3),
    },
    {
      title: '2. 이동수단과 시간',
      body:
        '짧은 일정이라면 공항 도착 후 이동시간이 만족도에 크게 영향을 줍니다. 보트, 수상비행기, 국내선의 특징과 예상 소요시간을 같이 비교하세요.',
      resorts: [...resorts]
        .filter(validTravelTime)
        .sort((a, b) => a.travelTime - b.travelTime || a.price - b.price)
        .slice(0, 3),
    },
    {
      title: '3. 객실과 개인풀',
      body:
        '워터빌라, 비치빌라, 개인풀은 여행 경험과 예산을 바꾸는 핵심 조건입니다. 꼭 필요한 객실 조건을 먼저 선택하면 비교할 후보가 빠르게 줄어듭니다.',
      resorts: [...resorts]
        .filter((resort) => resort.hasWaterVilla && resort.hasPrivatePool)
        .sort((a, b) => b.rating - a.rating || a.price - b.price)
        .slice(0, 3),
    },
    {
      title: '4. 수중환경과 다이닝',
      body:
        '스노클링을 중요하게 보면 수중환경 점수를, 식사 선택을 중요하게 보면 레스토랑 수를 확인하세요. 사진 한 장보다 실제 활동 취향에 맞춰 보는 편이 정확합니다.',
      resorts: [...resorts]
        .filter((resort) => Number.isFinite(resort.snorkelingQuality))
        .sort((a, b) => b.snorkelingQuality - a.snorkelingQuality || b.restaurants - a.restaurants)
        .slice(0, 3),
    },
  ];

  const representativeResorts = Array.from(
    new Map(criteria.flatMap((criterion) => criterion.resorts).map((resort) => [resort.id, resort])).values()
  );
  const showcaseNames = [
    'Soneva Jani',
    'Cheval Blanc Randheli',
    'Waldorf Astoria Maldives Ithaafushi',
  ];
  const showcaseSlugs = showcaseNames
    .map((name) => resorts.find((resort) => resort.name_en === name))
    .filter(Boolean)
    .map((resort) => slugify(resort.name_en || resort.name));
  const showcaseCompareHref = showcaseSlugs.length === showcaseNames.length
    ? `/maldives-resort-comparison/#/compare/${showcaseSlugs.join(',')}`
    : '/maldives-resort-comparison/';
  const itemListNode = {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name: '몰디브 리조트 비교 대표 후보',
    numberOfItems: representativeResorts.length,
    itemListElement: representativeResorts.map((resort, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: resort.name,
      url: resortUrl(resort),
    })),
  };
  const schemaNodes = [
    buildWebPageNode({
      url,
      name: page.heading,
      description: page.description,
      type: 'CollectionPage',
      publishedAt: siteDates.comparisonPublished,
      modifiedAt: siteDates.modified,
      mainEntityId: `${url}#itemlist`,
      subjectOfId: `${url}#faq`,
    }),
    buildBreadcrumbNode({ url, name: page.heading }),
    itemListNode,
    buildFaqNode(url, page.faq),
  ];

  const criterionCards = criteria
    .map(
      (criterion, index) => `
        <article class="comparison-landing__criterion-card">
          <span class="comparison-landing__criterion-number" aria-hidden="true">0${index + 1}</span>
          <h3>${escapeHtml(criterion.title.replace(/^\d+\.\s*/, ''))}</h3>
          <p>${escapeHtml(criterion.body)}</p>
          <p class="comparison-landing__criterion-examples">
            조건에 맞는 대표 후보: ${criterion.resorts
              .map((resort) => `<a href="${resortUrl(resort)}">${escapeHtml(resort.name)}</a>`)
              .join(' · ')}
          </p>
        </article>`
    )
    .join('\n');

  const comparisonRows = representativeResorts
    .map((resort) => {
      const roomFeatures = [
        resort.hasWaterVilla ? '워터빌라' : null,
        resort.hasBeachVilla ? '비치빌라' : null,
        resort.hasPrivatePool ? '개인풀' : null,
      ].filter(Boolean);
      return `
        <tr>
          <th scope="row" style="padding:14px;text-align:left;border-bottom:1px solid #e2e8f0;min-width:170px;">
            <a href="${resortUrl(resort)}" style="color:#0f766e;font-weight:800;text-decoration:none;">${escapeHtml(resort.name)}</a>
          </th>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">${formatUsd(resort.price)}</td>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">${escapeHtml(resort.transportation || '-')} · ${resort.travelTime || '-'}분</td>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;min-width:170px;">${escapeHtml(roomFeatures.join(' · ') || '—')}</td>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">${resort.snorkelingQuality || '-'} / 5</td>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">${resort.restaurants || 0}곳</td>
        </tr>`;
    })
    .join('\n');

  return {
    html: `
      <style>
        .comparison-landing { min-height:100vh;background:#f8f5ef;color:#102a34;font-family:'NanumSquareNeo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif; }
        .comparison-landing * { box-sizing:border-box; }
        .comparison-landing :is(h1,h2,h3,summary,.comparison-landing__eyebrow,.comparison-landing__header-action,.comparison-landing__hero-primary,.comparison-landing__hero-secondary,.comparison-landing__table-button,.comparison-landing__final a) { word-break:keep-all; }
        .comparison-landing :is(.comparison-landing__lead,.comparison-landing__section-intro,.comparison-landing__criterion-card > p,.comparison-landing__method p,.comparison-landing__method li,.comparison-landing__faq-list p,.comparison-landing__preview-caption,.comparison-landing__final p) { word-break:keep-all;overflow-wrap:break-word;text-wrap:pretty; }
        .comparison-landing a:focus-visible,.comparison-landing summary:focus-visible { outline:3px solid #0f172a;outline-offset:3px; }
        .comparison-landing__container { width:min(1180px,calc(100% - 40px));margin:0 auto; }
        .comparison-landing__sitebar { position:sticky;z-index:60;top:0;border-bottom:1px solid rgba(15,69,74,.1);background:rgba(255,252,246,.94);backdrop-filter:blur(18px); }
        .comparison-landing__sitebar-inner { display:flex;align-items:center;justify-content:space-between;min-height:76px;gap:20px; }
        .comparison-landing__brand { display:inline-flex;align-items:center;flex:1 1 auto;min-width:0;gap:12px;color:#102a34;text-decoration:none; }
        .comparison-landing__brand-mark { display:block;width:48px;height:48px;border:1px solid rgba(15,69,74,.14);border-radius:14px;box-shadow:0 8px 22px rgba(6,46,58,.12); }
        .comparison-landing__brand-copy small { display:block;margin-bottom:3px;color:#0f766e;font-size:10px;font-weight:900;letter-spacing:.17em; }
        .comparison-landing__brand-copy strong { display:block;font-family:'NanumSquareNeoExtraBold','NanumSquareNeo',sans-serif;font-size:17px;letter-spacing:-.02em;white-space:nowrap; }
        .comparison-landing__header-action { display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;gap:8px;min-height:44px;padding:0 17px;border-radius:999px;background:#0b6b66;color:#fff;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 10px 24px rgba(11,107,102,.22);white-space:nowrap; }
        .comparison-landing__header-action:hover { background:#075853;transform:translateY(-1px); }
        .comparison-landing__header-action-short { display:none; }
        .comparison-landing__hero { position:relative;overflow:hidden;background:linear-gradient(128deg,#062e3a 0%,#075159 48%,#0a7771 100%);color:#fff; }
        .comparison-landing__hero::before { content:'';position:absolute;width:620px;height:620px;right:-180px;top:-340px;border:1px solid rgba(192,255,239,.16);border-radius:50%;box-shadow:0 0 0 80px rgba(191,255,239,.04),0 0 0 180px rgba(191,255,239,.035); }
        .comparison-landing__hero::after { content:'';position:absolute;left:-120px;bottom:-250px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(68,226,205,.18),rgba(68,226,205,0) 68%); }
        .comparison-landing__hero-grid { position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.93fr) minmax(500px,1.07fr);align-items:center;gap:56px;min-height:620px;padding:64px 0 72px; }
        .comparison-landing__eyebrow { display:inline-flex;align-items:center;gap:9px;margin:0 0 18px;color:#b9fff1;font-size:12px;font-weight:900;letter-spacing:.13em; }
        .comparison-landing__eyebrow::before { content:'';width:28px;height:1px;background:#f7ad87; }
        .comparison-landing__title { margin:0;font-family:'NanumSquareNeoExtraBold','NanumSquareNeoBold','NanumSquareNeo',sans-serif;font-size:58px;line-height:1.12;letter-spacing:-.052em;text-wrap:balance; }
        .comparison-landing__title span { display:block;white-space:nowrap; }
        .comparison-landing__lead { max-width:620px;margin:22px 0 0;color:#e3f7f4;font-size:18px;line-height:1.85;letter-spacing:-.015em; }
        .comparison-landing__hero-actions { display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:28px; }
        .comparison-landing__hero-primary,.comparison-landing__hero-secondary { display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 22px;border-radius:999px;font-weight:900;text-decoration:none; }
        .comparison-landing__hero-primary { background:#f7ad87;color:#102a34;box-shadow:0 14px 32px rgba(1,30,37,.28); }
        .comparison-landing__hero-primary:hover { background:#ffc09f;transform:translateY(-2px); }
        .comparison-landing__hero-secondary { border:1px solid rgba(255,255,255,.48);background:rgba(255,255,255,.08);color:#fff; }
        .comparison-landing__hero-secondary:hover { border-color:#fff;background:rgba(255,255,255,.16); }
        .comparison-landing__hero a:focus-visible { outline-color:#ffe4d3;box-shadow:0 0 0 6px rgba(4,36,44,.9); }
        .comparison-landing__trust { display:flex;flex-wrap:wrap;gap:10px 18px;margin:26px 0 0;padding:0;list-style:none;color:#cfeeea;font-size:13px;font-weight:800; }
        .comparison-landing__trust li { display:inline-flex;align-items:center;gap:7px; }
        .comparison-landing__trust li::before { content:'✓';display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:rgba(186,255,240,.15);color:#baffef;font-size:12px; }
        .comparison-landing__preview { position:relative;margin:0;border:1px solid rgba(255,255,255,.34);border-radius:22px;background:#fff;box-shadow:0 30px 70px rgba(1,23,30,.4);overflow:hidden;transform:rotate(1deg); }
        .comparison-landing__preview::after { content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(15,23,42,.05);pointer-events:none; }
        .comparison-landing__preview-toolbar { display:flex;align-items:center;gap:12px;min-height:43px;padding:0 14px;border-bottom:1px solid #e6edf0;background:#f7f9fa;color:#64748b;font-size:11px; }
        .comparison-landing__preview-dots { display:flex;gap:5px; }
        .comparison-landing__preview-dots span { width:8px;height:8px;border-radius:50%;background:#cbd5e1; }
        .comparison-landing__preview-dots span:first-child { background:#f29b7b; }
        .comparison-landing__preview-address { flex:1;overflow:hidden;padding:7px 12px;border:1px solid #e2e8f0;border-radius:999px;background:#fff;text-align:center;text-overflow:ellipsis;white-space:nowrap; }
        .comparison-landing__preview-badge { flex:none;color:#0f766e;font-weight:900; }
        .comparison-landing__preview img { display:block;width:100%;height:auto;aspect-ratio:1216/632;object-fit:cover;background:#e8f3f2; }
        .comparison-landing__preview-caption { display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px 18px;color:#334155; }
        .comparison-landing__preview-caption strong { display:block;margin-bottom:3px;color:#102a34;font-size:15px; }
        .comparison-landing__preview-caption span { font-size:12px;line-height:1.5; }
        .comparison-landing__preview-link { display:inline-flex;align-items:center;justify-content:center;flex:none;min-height:40px;padding:0 14px;border-radius:999px;background:#0b6b66;color:#fff;font-size:12px;font-weight:900;text-decoration:none; }
        .comparison-landing__content { padding:76px 0 64px; }
        .comparison-landing__section { margin:0 0 68px; }
        .comparison-landing__section-head { display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px; }
        .comparison-landing__section-kicker { margin:0 0 8px;color:#a34835;font-size:12px;font-weight:900;letter-spacing:.13em; }
        .comparison-landing__section h2 { margin:0;color:#102a34;font-family:'NanumSquareNeoExtraBold','NanumSquareNeo',sans-serif;font-size:32px;line-height:1.32;letter-spacing:-.035em; }
        .comparison-landing__section-intro { max-width:650px;margin:10px 0 0;color:#58686f;line-height:1.7; }
        .comparison-landing__grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px; }
        .comparison-landing__criterion-card { position:relative;overflow:hidden;min-height:250px;padding:30px 30px 26px;border:1px solid #dfe8e5;border-radius:22px;background:#fff;box-shadow:0 12px 35px rgba(17,52,58,.07); }
        .comparison-landing__criterion-card::after { content:'';position:absolute;right:-30px;bottom:-56px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,#d8f4ee 0,rgba(216,244,238,0) 72%); }
        .comparison-landing__criterion-number { display:inline-grid;place-items:center;width:44px;height:44px;margin-bottom:24px;border-radius:14px;background:#e5f6f2;color:#0b6b66;font-size:13px;font-weight:900; }
        .comparison-landing__criterion-card h3 { position:relative;z-index:1;margin:0 0 11px;color:#102a34;font-family:'NanumSquareNeoExtraBold','NanumSquareNeo',sans-serif;font-size:21px;line-height:1.45; }
        .comparison-landing__criterion-card > p { position:relative;z-index:1;margin:0;color:#53646c;line-height:1.78; }
        .comparison-landing__criterion-examples { margin-top:18px !important;padding-top:16px;border-top:1px solid #edf2f1;color:#5d6d74 !important;font-size:13px; }
        .comparison-landing__criterion-examples a { color:#0b6b66;font-weight:900;text-decoration:none;overflow-wrap:anywhere; }
        .comparison-landing__table-button { display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;background:#0b6b66;color:#fff;font-weight:900;text-decoration:none;box-shadow:0 10px 24px rgba(11,107,102,.18); }
        .comparison-landing__table-wrap { overflow-x:auto;border:1px solid #dbe5e3;border-radius:22px;background:#fff;box-shadow:0 16px 42px rgba(17,52,58,.08); }
        .comparison-landing__table-wrap tbody tr:hover { background:#f5fbf9; }
        .comparison-landing__method { display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:34px;padding:34px;border:1px solid #eadfce;border-radius:24px;background:#fffaf2; }
        .comparison-landing__method p,.comparison-landing__method ul { color:#586971;line-height:1.82; }
        .comparison-landing__method-list { display:grid;gap:10px;margin:0;padding:0;list-style:none; }
        .comparison-landing__method-list li { padding:12px 14px;border:1px solid #eadfce;border-radius:13px;background:rgba(255,255,255,.74); }
        .comparison-landing__method-list strong { display:block;margin-bottom:2px;color:#0b6b66;font-size:13px; }
        .comparison-landing__method-list span { color:#586971;font-size:14px;line-height:1.65; }
        .comparison-landing__faq-list { display:grid;gap:12px; }
        .comparison-landing__faq-list details { border:1px solid #dfe8e5;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(17,52,58,.05); }
        .comparison-landing__faq-list summary { position:relative;padding:21px 56px 21px 22px;color:#102a34;font-family:'NanumSquareNeoBold','NanumSquareNeo',sans-serif;font-size:17px;font-weight:900;line-height:1.5;cursor:pointer;list-style:none; }
        .comparison-landing__faq-list summary::-webkit-details-marker { display:none; }
        .comparison-landing__faq-list summary::after { content:'+';position:absolute;right:22px;top:50%;width:26px;height:26px;transform:translateY(-50%);color:#0b6b66;font-size:24px;line-height:24px;text-align:center; }
        .comparison-landing__faq-list details[open] summary::after { content:'–'; }
        .comparison-landing__faq-list p { margin:0;padding:0 22px 22px;color:#5d6d75;line-height:1.78; }
        .comparison-landing__final { position:relative;overflow:hidden;padding:42px;border-radius:28px;background:linear-gradient(122deg,#07323e,#0a6868);color:#fff;text-align:left; }
        .comparison-landing__final::after { content:'';position:absolute;right:-80px;top:-110px;width:310px;height:310px;border:1px solid rgba(255,255,255,.16);border-radius:50%;box-shadow:0 0 0 55px rgba(255,255,255,.04); }
        .comparison-landing__final h2 { position:relative;z-index:1;color:#fff;font-size:30px; }
        .comparison-landing__final p { position:relative;z-index:1;max-width:650px;margin:12px 0 22px;color:#d4efec;line-height:1.72; }
        .comparison-landing__final a { position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 22px;border-radius:999px;background:#f7ad87;color:#102a34;font-weight:900;text-decoration:none; }
        #comparison-preview,#comparison-table-title { scroll-margin-top:84px; }
        .comparison-landing__table-swipe { display:none; }
        @media (prefers-reduced-motion:no-preference) {
          .comparison-landing__header-action,.comparison-landing__hero-primary,.comparison-landing__hero-secondary,.comparison-landing__preview,.comparison-landing__preview-link,.comparison-landing__table-button { transition:background-color .18s ease,border-color .18s ease,transform .18s ease; }
          .comparison-landing__preview:hover { transform:rotate(0) translateY(-3px); }
          html { scroll-behavior:smooth; }
        }
        @media (max-width:980px) {
          .comparison-landing__hero-grid { grid-template-columns:1fr;gap:42px;padding:58px 0 68px; }
          .comparison-landing__hero-copy { max-width:760px; }
          .comparison-landing__preview { max-width:760px;transform:none; }
          .comparison-landing__method { grid-template-columns:1fr;gap:14px; }
        }
        @media (max-width:720px) {
          .comparison-landing__container { width:min(100% - 28px,1180px); }
          .comparison-landing__sitebar-inner { min-height:68px; }
          .comparison-landing__brand { gap:9px; }
          .comparison-landing__brand-mark { width:42px;height:42px;border-radius:12px; }
          .comparison-landing__brand-copy small { font-size:9px; }
          .comparison-landing__brand-copy strong { font-size:15px; }
          .comparison-landing__header-action { min-height:42px;padding:0 13px;font-size:12px; }
          .comparison-landing__hero-grid { gap:36px;min-height:0;padding:46px 0 56px; }
          .comparison-landing__title { font-size:clamp(34px,10.5vw,40px);line-height:1.16; }
          .comparison-landing__lead { margin-top:18px;font-size:16px;line-height:1.78; }
          .comparison-landing__grid { grid-template-columns:1fr; }
          .comparison-landing__hero-actions { align-items:stretch;flex-direction:column; }
          .comparison-landing__hero-primary,
          .comparison-landing__hero-secondary { width:100%; }
          .comparison-landing__trust { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:22px; }
          .comparison-landing__trust li { min-height:60px;flex-direction:column;justify-content:center;gap:4px;padding:7px 3px;border:1px solid rgba(186,255,239,.18);border-radius:13px;background:rgba(255,255,255,.07);font-size:11px;line-height:1.35;text-align:center; }
          .comparison-landing__trust li::before { width:18px;height:18px;font-size:10px; }
          .comparison-landing__preview-toolbar { padding:0 10px; }
          .comparison-landing__preview-address { display:none; }
          .comparison-landing__preview img { width:100%;max-width:100%;aspect-ratio:1216/632;transform:none; }
          .comparison-landing__preview-caption { align-items:flex-start;flex-direction:column;padding:15px; }
          .comparison-landing__preview-link { width:100%; }
          .comparison-landing__content { padding:52px 0 28px; }
          .comparison-landing__section { margin-bottom:52px; }
          .comparison-landing__section-head { align-items:flex-start;flex-direction:column; }
          .comparison-landing__section h2 { font-size:26px; }
          .comparison-landing__criterion-card { min-height:0;padding:24px; }
          .comparison-landing__criterion-number { margin-bottom:18px; }
          .comparison-landing__table-button { width:100%; }
          .comparison-landing__table-swipe { display:block;margin:0 0 10px;color:#58686f;font-size:12px;font-weight:800;text-align:left; }
          .comparison-landing__table-wrap { overflow:visible;border:0;background:transparent;box-shadow:none; }
          .comparison-landing__data-table { display:block;width:100% !important;table-layout:auto;font-size:13px !important; }
          .comparison-landing__data-table thead { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap; }
          .comparison-landing__data-table tbody { display:grid;gap:12px; }
          .comparison-landing__data-table tr { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);overflow:hidden;border:1px solid #dbe5e3;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(17,52,58,.06); }
          .comparison-landing__data-table :is(th,td) { display:block;min-width:0 !important;width:auto !important;padding:11px 12px !important;border:0 !important;white-space:normal !important;overflow-wrap:anywhere;line-height:1.5; }
          .comparison-landing__data-table th:first-child { grid-column:1/-1;padding:14px 12px !important;background:#e9f5f2; }
          .comparison-landing__data-table td { position:relative;padding-top:30px !important; }
          .comparison-landing__data-table td:nth-child(2) { white-space:nowrap !important; }
          .comparison-landing__data-table td:nth-child(4) { grid-column:1/-1;border-top:1px solid #edf2f1 !important;border-bottom:1px solid #edf2f1 !important; }
          .comparison-landing__data-table td::before { position:absolute;left:12px;top:9px;color:#718087;font-size:10px;font-weight:900;letter-spacing:.02em; }
          .comparison-landing__data-table td:nth-child(2)::before { content:'4박 2인'; }
          .comparison-landing__data-table td:nth-child(3)::before { content:'이동'; }
          .comparison-landing__data-table td:nth-child(4)::before { content:'객실 조건'; }
          .comparison-landing__data-table td:nth-child(5)::before { content:'수중환경'; }
          .comparison-landing__data-table td:nth-child(6)::before { content:'레스토랑'; }
          .comparison-landing__method { padding:22px; }
          .comparison-landing__method p,.comparison-landing__method ul { font-size:15px; }
          .comparison-landing__faq-list { gap:8px; }
          .comparison-landing__faq-list details { border-radius:14px; }
          .comparison-landing__faq-list details[open] { border-color:#a9d9d3;box-shadow:0 10px 28px rgba(11,107,102,.1); }
          .comparison-landing__faq-list summary { padding:17px 46px 17px 16px;font-size:15px;line-height:1.55;letter-spacing:-.025em;text-wrap:pretty; }
          .comparison-landing__faq-list summary::after { right:16px; }
          .comparison-landing__faq-list details[open] summary { border-bottom:1px solid #e5efed; }
          .comparison-landing__faq-list p { padding:15px 16px 18px;font-size:14px;line-height:1.75; }
          .comparison-landing__final { padding:30px 24px; }
          .comparison-landing__final h2 { font-family:'NanumSquareNeoExtraBold','NanumSquareNeo',sans-serif;font-size:25px;font-weight:900;line-height:1.4; }
          .comparison-landing__final a { width:100%; }
        }
        @media (max-width:420px) {
          .comparison-landing__container { width:calc(100% - 20px); }
          .comparison-landing__sitebar-inner { gap:8px; }
          .comparison-landing__brand-mark { width:38px;height:38px; }
          .comparison-landing__brand-copy small { display:none; }
          .comparison-landing__brand-copy strong { font-size:14px; }
          .comparison-landing__header-action { min-height:44px;padding:0 11px; }
          .comparison-landing__header-action-full { display:none; }
          .comparison-landing__header-action-short { display:inline; }
        }
        @media (max-width:380px) {
          .comparison-landing__eyebrow { font-size:10px;letter-spacing:.08em; }
          .comparison-landing__criterion-card { padding:21px; }
        }
      </style>
      <main class="comparison-landing">
        <div class="comparison-landing__sitebar">
          <div class="comparison-landing__container comparison-landing__sitebar-inner">
            <a class="comparison-landing__brand" href="/" aria-label="몰디브 바이블 홈으로 이동">
              <img class="comparison-landing__brand-mark" src="/android-chrome-192x192.png" alt="" width="48" height="48" />
              <span class="comparison-landing__brand-copy"><small>MALDIVES BIBLE</small><strong>몰디브 바이블</strong></span>
            </a>
            <a class="comparison-landing__header-action" href="/maldives-resort-comparison/" aria-label="리조트 목록 바로 보기">
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
              <span class="comparison-landing__header-action-full">리조트 바로보기</span><span class="comparison-landing__header-action-short">리조트 보기</span>
            </a>
          </div>
        </div>

        <section class="comparison-landing__hero" aria-labelledby="comparison-hero-title">
          <div class="comparison-landing__container comparison-landing__hero-grid">
            <div class="comparison-landing__hero-copy">
              <p class="comparison-landing__eyebrow">${resorts.length} RESORTS · COMPARE</p>
              <h1 id="comparison-hero-title" class="comparison-landing__title"><span>${escapeHtml(currentYear)} 몰디브</span> <span>리조트 비교</span></h1>
              <p class="comparison-landing__lead">예산·이동·객실·수중환경을 한눈에 비교하세요. 내 조건을 먼저 고르면 맞는 리조트가 더 빨리 보입니다.</p>
              <div class="comparison-landing__hero-actions" role="group" aria-label="리조트 비교 시작">
                <a class="comparison-landing__hero-primary" data-compare-cta="hero" href="/maldives-resort-comparison/">내 조건으로 리조트 비교하기 <span aria-hidden="true" style="margin-left:8px;">→</span></a>
                <a class="comparison-landing__hero-secondary" href="#comparison-preview">실제 비교 화면 보기</a>
              </div>
              <ul class="comparison-landing__trust" aria-label="비교 서비스 특징">
                <li>${resorts.length}개 리조트</li><li>최대 3곳 비교</li><li>광고 순위 없음</li>
              </ul>
            </div>

            <figure id="comparison-preview" class="comparison-landing__preview">
              <div class="comparison-landing__preview-toolbar" aria-hidden="true">
                <span class="comparison-landing__preview-dots"><span></span><span></span><span></span></span>
                <span class="comparison-landing__preview-address">maldivesbible.com · 리조트 비교</span>
                <span class="comparison-landing__preview-badge">COMPARE PREVIEW</span>
              </div>
              <img src="/brand/resort-comparison-preview.jpg" alt="소네바 자니, 슈발 블랑 란델리, 월도프 아스토리아 몰디브 비교 화면" width="1216" height="632" fetchpriority="high" />
              <figcaption class="comparison-landing__preview-caption">
                <span><strong>실제 비교 결과 화면</strong>사진과 가격, 이동, 객실 조건의 차이를 한 번에 확인합니다.</span>
                <a class="comparison-landing__preview-link" data-compare-cta="preview" href="${showcaseCompareHref}">이 조합으로 비교 보기 →</a>
              </figcaption>
            </figure>
          </div>
        </section>

        <div class="comparison-landing__container comparison-landing__content">
          <section class="comparison-landing__section" aria-labelledby="comparison-criteria-title">
            <div class="comparison-landing__section-head"><div><p class="comparison-landing__section-kicker">START WITH FOUR</p><h2 id="comparison-criteria-title">비교할 때 먼저 볼 네 가지 기준</h2><p class="comparison-landing__section-intro">리조트 이름을 외우기 전에 아래 네 가지만 정하면 수많은 후보를 빠르게 줄일 수 있습니다.</p></div></div>
            <div class="comparison-landing__grid">${criterionCards}</div>
          </section>

          <section class="comparison-landing__section" aria-labelledby="comparison-table-title">
            <div class="comparison-landing__section-head">
              <div>
                <p class="comparison-landing__section-kicker">AT A GLANCE</p>
                <h2 id="comparison-table-title">대표 리조트 한눈에 비교</h2>
                <p id="comparison-table-note" class="comparison-landing__section-intro">비교 기준별 대표 후보이며 순위나 실시간 예약가를 의미하지 않습니다.</p>
              </div>
              <a class="comparison-landing__table-button" data-compare-cta="table" href="/maldives-resort-comparison/">전체 ${resorts.length}개 리조트에서 찾기</a>
            </div>
            <p class="comparison-landing__table-swipe" aria-hidden="true">모바일에서는 리조트별 조건을 카드로 정리해 보여드려요</p>
            <div class="comparison-landing__table-wrap">
              <table class="comparison-landing__data-table" aria-describedby="comparison-table-note" style="width:100%;border-collapse:collapse;color:#334155;font-size:15px;">
                <thead style="background:#e9f5f2;color:#102a34;">
                  <tr>
                    <th scope="col" style="padding:14px;text-align:left;white-space:nowrap;">리조트</th>
                    <th scope="col" style="padding:14px;text-align:left;white-space:nowrap;">4박 2인</th>
                    <th scope="col" style="padding:14px;text-align:left;white-space:nowrap;">이동</th>
                    <th scope="col" style="padding:14px;text-align:left;white-space:nowrap;">객실 조건</th>
                    <th scope="col" style="padding:14px;text-align:left;white-space:nowrap;">수중환경</th>
                    <th scope="col" style="padding:14px;text-align:left;white-space:nowrap;">레스토랑</th>
                  </tr>
                </thead>
                <tbody>${comparisonRows}</tbody>
              </table>
            </div>
          </section>

          <section class="comparison-landing__section comparison-landing__method" aria-labelledby="comparison-method-title">
            <div><p class="comparison-landing__section-kicker">HOW WE COMPARE</p><h2 id="comparison-method-title">데이터 기준과 이용 안내</h2></div>
            <div><p style="margin:0 0 16px;">
              공개된 리조트 정보와 자료를 바탕으로 이동, 객실, 다이닝을 같은 기준으로 정리합니다. 수중환경 점수는 후보 비교를 돕는 몰디브 바이블의 자체 지표입니다.
            </p>
            <ul class="comparison-landing__method-list">
              <li><strong>가격</strong><span>4박 2인 비교 예시이며 실시간 예약가가 아닙니다.</span></li>
              <li><strong>이동</strong><span>공항 이후 예상 시간으로 대기와 날씨에 따라 달라집니다.</span></li>
              <li><strong>예약 전 확인</strong><span>객실·식사·세금·이동비가 포함된 여행사 견적을 확인하세요.</span></li>
            </ul></div>
          </section>

          <section class="comparison-landing__section" aria-labelledby="comparison-faq-title">
            <div class="comparison-landing__section-head"><div><p class="comparison-landing__section-kicker">QUICK ANSWERS</p><h2 id="comparison-faq-title">자주 묻는 질문</h2></div></div>
            <div class="comparison-landing__faq-list">${page.faq
              .map(
                (item) => `
                  <details>
                    <summary>${escapeHtml(item.question)}</summary>
                    <p>${escapeHtml(item.answer)}</p>
                  </details>`
              )
              .join('\n')}</div>
          </section>

          <section class="comparison-landing__final">
            <h2>이제 내 조건으로 직접 비교해 보세요</h2>
            <p>예산과 취향으로 후보를 고르고 최대 3개 리조트의 차이를 실제 비교 화면에서 확인할 수 있습니다.</p>
            <a data-compare-cta="footer" href="/maldives-resort-comparison/">내 조건으로 리조트 비교하기 →</a>
          </section>

          ${buildMaldivesGlossaryContent({ maxWidth: '100%' })}
          ${buildEditorialFooter({ maxWidth: '100%' })}

        </div>
      </main>
      <script>
        document.querySelectorAll('[data-compare-cta]').forEach(function (link) {
          link.addEventListener('click', function () {
            if (typeof window.gtag !== 'function') return;
            window.gtag('event', 'resort_compare_start', {
              cta_placement: link.getAttribute('data-compare-cta') || 'unknown'
            });
          });
        });
      </script>`,
    schemaNodes,
  };
};

const buildStaticSiteHeader = (currentPath = '') => `
  <header class="seo-static__header">
    <div class="seo-static__header-inner">
      <a class="seo-static__brand" href="${siteUrl}/">
        <img src="${siteUrl}/android-chrome-192x192.png" width="42" height="42" alt="" />
        <span><small>MALDIVES BIBLE</small><strong>몰디브 바이블</strong></span>
      </a>
      <nav aria-label="몰디브 바이블 주요 메뉴">
        ${primaryNavItems.map((item) => `
          <a href="${siteUrl}${item.path}"${currentPath === item.path ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}
      </nav>
    </div>
  </header>`;

const buildStandaloneStyles = () => `
  <style>
    .seo-static { min-height:100vh;background:#f5f8f7;color:#0f172a;font-family:Inter,'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif; }
    .seo-static * { box-sizing:border-box; }
    .seo-static a:focus-visible { outline:3px solid #14b8a6;outline-offset:3px; }
    .seo-static__header { border-bottom:1px solid #dbe7e4;background:rgba(255,255,255,.96); }
    .seo-static__header-inner { width:min(1120px,calc(100% - 36px));min-height:72px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:22px; }
    .seo-static__brand { display:flex;align-items:center;gap:10px;color:#0f172a;text-decoration:none; }
    .seo-static__brand img { border-radius:12px;box-shadow:0 7px 18px rgba(15,118,110,.13); }
    .seo-static__brand small,.seo-static__brand strong { display:block; }
    .seo-static__brand small { color:#0f766e;font-size:9px;font-weight:900;letter-spacing:.14em; }
    .seo-static__brand strong { margin-top:2px;font-size:16px;letter-spacing:-.02em; }
    .seo-static__header nav { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px; }
    .seo-static__header nav a { display:flex;min-height:44px;align-items:center;justify-content:center;border-bottom:2px solid transparent;padding:0 9px;color:#475569;font-size:13px;font-weight:800;text-align:center;text-decoration:none;white-space:nowrap; }
    .seo-static__header nav a:hover { border-color:#cbd5e1;color:#0f172a; }
    .seo-static__header nav a[aria-current="page"] { border-color:#0f766e;color:#0f172a; }
    .seo-static__content { width:min(1120px,calc(100% - 36px));margin:0 auto;padding:52px 0 36px; }
    .seo-static__eyebrow { margin:0 0 10px;color:#0f766e;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase; }
    .seo-static h1 { margin:0;color:#102a34;font-size:clamp(34px,5vw,54px);line-height:1.14;letter-spacing:-.045em;word-break:keep-all; }
    .seo-static__lead { max-width:760px;margin:18px 0 0;color:#475569;font-size:17px;line-height:1.8;word-break:keep-all; }
    .seo-static__actions { display:flex;flex-wrap:wrap;gap:10px;margin-top:26px; }
    .seo-static__action { display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:999px;background:#0f766e;color:#fff;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 10px 24px rgba(15,118,110,.18); }
    .seo-static__action--secondary { border:1px solid #b9d8d2;background:#fff;color:#0f766e;box-shadow:none; }
    .seo-static__section { margin-top:42px; }
    .seo-static__section h2 { margin:0 0 14px;font-size:25px;letter-spacing:-.03em; }
    .seo-static__grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px; }
    .seo-static__card { display:block;border:1px solid #dbe7e4;border-radius:14px;background:#fff;padding:18px;color:#0f172a;text-decoration:none;box-shadow:0 8px 20px rgba(15,23,42,.035); }
    .seo-static__card strong { display:block;font-size:16px;line-height:1.45;word-break:keep-all; }
    .seo-static__card span { display:block;margin-top:6px;color:#64748b;font-size:13px;line-height:1.65; }
    .seo-static__note { border:1px solid #c6e7e0;border-radius:14px;background:#edfbf8;padding:18px;color:#335e5b;line-height:1.75; }
    .seo-static__figure { margin:28px 0 0;overflow:hidden;border:1px solid #dbe7e4;border-radius:18px;background:#fff;box-shadow:0 16px 36px rgba(15,23,42,.08); }
    .seo-static__figure img { display:block;width:100%;height:auto; }
    .seo-static__figure figcaption { padding:10px 14px;color:#64748b;font-size:12px;line-height:1.6; }
    .seo-static__checklist { margin:0;padding-left:20px;color:#475569;line-height:1.8; }
    .seo-static__checklist li + li { margin-top:5px; }
    .seo-static__agency-links { display:flex;flex-wrap:wrap;gap:8px;margin-top:12px; }
    .seo-static__agency-links a { display:inline-flex;min-height:40px;align-items:center;border:1px solid #cbd5e1;border-radius:9px;padding:0 12px;color:#0f766e;font-size:12px;font-weight:800;text-decoration:none; }
    @media (max-width:760px) {
      .seo-static__header-inner { width:min(100% - 20px,1120px);min-height:64px;display:block;padding:10px 0 0; }
      .seo-static__brand { width:max-content;margin:0 auto 7px; }
      .seo-static__header nav { width:100%; }
      .seo-static__header nav a { min-width:0;padding:0 2px;font-size:12px; }
      .seo-static__content { padding-top:34px; }
      .seo-static__lead { font-size:15px;line-height:1.72; }
      .seo-static__grid { grid-template-columns:minmax(0,1fr); }
      .seo-static__action { width:100%; }
    }
  </style>`;

const travelAgencies = [
  { name: '투어민', website: 'https://www.tourmin.co.kr', kakao: 'https://pf.kakao.com/_LxbYBM' },
  { name: '푸른여행클럽', website: 'https://cafe.naver.com/honeymoonp', kakao: 'https://pf.kakao.com/_UZNxgd' },
  { name: '리얼몰디브', website: 'https://realmaldives.co.kr', kakao: 'https://pf.kakao.com/_NcnxaG' },
  { name: '트레비아', website: 'https://www.trevia.co.kr', kakao: 'https://pf.kakao.com/_xixjNQl' },
  { name: '나래여행사', website: 'http://www.nadree.net/' },
  { name: '하이몰디브', website: 'https://www.himaldives.co.kr/' },
  { name: '여행산책', website: 'https://www.tourw.co.kr/' },
  { name: '잇츠마이트래블', website: 'http://itsmytravel.co.kr/', kakao: 'https://pf.kakao.com/_qgDUxd' },
  { name: '투어플래닛', website: 'http://www.tour-planet.co.kr/', kakao: 'https://pf.kakao.com/_LYSSl' },
  { name: '허니문리조트', website: 'http://www.honeymoonresort.co.kr/', kakao: 'https://pf.kakao.com/_gkKlE' },
  { name: '천생연분닷컴', website: 'https://www.1000syb.com/' },
  { name: '팜투어', website: 'https://www.palmtour.co.kr', kakao: 'https://pf.kakao.com/_Hxmxaxexj' },
];

const buildCoreFigure = (page) => {
  const imageUrl = `${siteUrl}${page.image}`;
  return `
    <figure class="seo-static__figure">
      <img src="${imageUrl}" width="${page.imageWidth}" height="${page.imageHeight}" alt="${escapeHtml(page.imageAlt)}" fetchpriority="high" />
      <figcaption>${escapeHtml(page.imageAlt)}</figcaption>
    </figure>`;
};

const buildStartContent = () => `
  <section class="seo-static__section" aria-labelledby="start-order-title">
    <h2 id="start-order-title">리조트 이름보다 먼저 정할 순서</h2>
    <div class="seo-static__grid">
      <article class="seo-static__card"><h3>1. 예산과 여행 일정</h3><span>항공권·리조트비·이동비를 합친 총예산을 잡고, 4박인지 5박인지를 먼저 정하세요. 말레 도착 시간은 첫날을 리조트에서 보낼 수 있는지를 좌우합니다.</span></article>
      <article class="seo-static__card"><h3>2. 말레 공항 이후 이동</h3><span>보트는 비교적 유연하고, 수상비행기는 주간 운항 시간을, 국내선은 환승과 추가 이동을 확인해야 합니다. 짧은 일정일수록 이동시간을 중요하게 보세요.</span></article>
      <article class="seo-static__card"><h3>3. 객실 타입</h3><span>비치빌라는 모래사장 접근이 편하고, 워터빌라는 바다 위에 머무는 경험이 특징입니다. 개인풀이 반드시 필요한지도 함께 정하세요.</span></article>
    </div>
  </section>
  <section class="seo-static__section" aria-labelledby="start-meal-sea-title">
    <h2 id="start-meal-sea-title">식사 플랜과 바다 취향 확인</h2>
    <div class="seo-static__grid">
      <article class="seo-static__card"><h3>식사 플랜</h3><span>조식, 하프보드, 풀보드, 올인클루시브의 포함 범위를 비교하세요. 음료와 일부 레스토랑이 제외되는지도 견적서에서 확인해야 합니다.</span></article>
      <article class="seo-static__card"><h3>수중환경</h3><span>리조트 주변 산호초와 하우스리프 접근성은 스노클링 만족도와 연결됩니다. 장비 대여와 안전 구역도 함께 보세요.</span></article>
      <article class="seo-static__card"><h3>라군</h3><span>넓고 맑은 라군은 수영과 풍경을 즐기기 좋지만 수중환경과는 다른 기준입니다. 사진 취향과 스노클링 취향을 나눠 판단하세요.</span></article>
    </div>
  </section>
  <section class="seo-static__section seo-static__note" aria-labelledby="start-next-title">
    <h2 id="start-next-title">기준이 잡혔다면 리조트를 비교하세요</h2>
    <p>이동수단, 예산, 객실 타입을 필터에 적용하면 171개 후보를 빠르게 줄일 수 있습니다.</p>
    <div class="seo-static__actions"><a class="seo-static__action" href="${siteUrl}/maldives-resort-comparison/">171개 몰디브 리조트 비교 시작</a></div>
  </section>`;

const buildResortComparisonContent = (resortCount) => `
  <section class="seo-static__section" aria-labelledby="comparison-criteria-title">
    <h2 id="comparison-criteria-title">${resortCount}개 리조트를 같은 기준으로 보는 방법</h2>
    <p class="seo-static__lead">리조트를 하나씩 검색하기보다 예산과 이동수단을 먼저 고르고, 객실·개인풀·수중환경 조건을 추가하면 비교 범위가 명확해집니다.</p>
    <div class="seo-static__grid" style="margin-top:18px;">
      <article class="seo-static__card"><h3>예산과 이동비</h3><span>표시 가격은 예약 시점의 확정 요금이 아닌 비교용 지표나 예시일 수 있습니다. 실제 견적에서 숙박비와 2인 왕복 이동비를 함께 확인하세요.</span></article>
      <article class="seo-static__card"><h3>이동수단과 이동시간</h3><span>보트, 수상비행기, 국내선은 비용뿐 아니라 첫날과 마지막 날의 실제 체류시간에도 영향을 줍니다.</span></article>
      <article class="seo-static__card"><h3>객실 유형과 개인풀</h3><span>비치빌라와 워터빌라, 개인풀 유무를 나눠 보세요. 일정 중 객실을 바꾸는 스플릿 스테이도 비교 후보입니다.</span></article>
      <article class="seo-static__card"><h3>수중환경과 라군</h3><span>스노클링을 중요하게 보면 하우스리프 접근성을, 수영과 풍경을 원하면 라군의 넓이와 수심을 따로 확인하세요.</span></article>
      <article class="seo-static__card"><h3>여행 취향</h3><span>허니문, 가족여행, 다이빙, 다이닝 등 우선순위를 한두 가지로 정하면 유명도보다 나에게 맞는 후보를 찾기 쉽습니다.</span></article>
      <article class="seo-static__card"><h3>비교 트레이</h3><span>필터로 후보를 줄인 다음 관심 리조트를 비교 트레이에 담아 이동·객실·바다 조건을 나란히 확인하세요.</span></article>
    </div>
  </section>
  <section class="seo-static__section seo-static__note" aria-labelledby="comparison-start-title">
    <h2 id="comparison-start-title">내 조건으로 필터를 적용하세요</h2>
    <p>예산, 이동수단, 이동시간, 객실, 개인풀, 수중환경 기준으로 후보를 줄이고 상세 정보를 열어보세요.</p>
    <div class="seo-static__actions"><a class="seo-static__action" href="${siteUrl}/maldives-resort-comparison/">리조트 필터와 비교 화면 열기</a></div>
  </section>`;

const buildQuoteComparisonContent = () => {
  const agencyCards = travelAgencies.map((agency) => `
    <article class="seo-static__card">
      <h3>${escapeHtml(agency.name)}</h3>
      <span>여행사의 공개 홈페이지${agency.kakao ? '와 카카오 상담 채널' : ''}을 확인할 수 있습니다.</span>
      <div class="seo-static__agency-links">
        <a href="${agency.website}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(agency.name)} 홈페이지 새 창에서 열기">홈페이지</a>
        ${agency.kakao ? `<a href="${agency.kakao}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(agency.name)} 카카오톡 채널 새 창에서 열기">카카오 채널</a>` : ''}
      </div>
    </article>`).join('');
  return `
    <section class="seo-static__section" aria-labelledby="quote-check-title">
      <h2 id="quote-check-title">같은 일정과 조건으로 요청하세요</h2>
      <p class="seo-static__lead">여행사별 금액을 비교하려면 여행 날짜, 리조트, 객실 타입, 식사 플랜, 이동수단, 인원을 같게 맞춰야 합니다. 포함·불포함 항목과 취소 조건도 함께 보세요.</p>
      <div class="seo-static__grid" style="margin-top:18px;">
        <article class="seo-static__card"><h3>요청 전 체크 1</h3><span>출발일과 숙박일수, 인원, 항공 일정을 통일하세요. 말레 1박이 필요하면 같은 조건으로 넣어야 합니다.</span></article>
        <article class="seo-static__card"><h3>요청 전 체크 2</h3><span>비치빌라·워터빌라, 개인풀, 식사 플랜을 명확히 적고 스플릿 스테이 조합이면 각 박수를 나눠 적으세요.</span></article>
        <article class="seo-static__card"><h3>요청 전 체크 3</h3><span>세금과 봉사료, 공항–리조트 왕복 이동비, 식사와 음료, 허니문 혜택, 예약금과 잔금 일정이 포함됐는지 확인하세요.</span></article>
      </div>
      <p class="seo-static__note" style="margin-top:18px;">화면의 금액은 비교 방법을 설명하기 위한 예시입니다. 이 페이지는 여행사별 가격을 자동으로 수집하거나 현재가를 조회하는 서비스가 아닙니다. 정확한 금액과 조건은 각 여행사에 문의해 확인하세요.</p>
    </section>
    <section class="seo-static__section" aria-labelledby="agency-list-title">
      <h2 id="agency-list-title">등록된 몰디브 여행사 목록</h2>
      <p>다음은 사이트에 등록된 12곳의 홈페이지와 상담 채널입니다. 두세 곳에 같은 요청서를 보낸 뒤 포함 조건을 나란히 확인하세요.</p>
      <div class="seo-static__grid" style="margin-top:18px;">${agencyCards}</div>
    </section>`;
};

const buildFlightGuideContent = () => `
  <section class="seo-static__section" aria-labelledby="arrival-time-title">
    <h2 id="arrival-time-title">핵심은 말레 도착 시간입니다</h2>
    <div class="seo-static__grid">
      <article class="seo-static__card"><h3>새벽 말레 도착</h3><span>당일 리조트 이동으로 체류시간을 늘리기 좋습니다. 보트 이동이나 수상비행기 첫 편 연결 가능 여부를 리조트에 확인하세요.</span></article>
      <article class="seo-static__card"><h3>오후 말레 도착</h3><span>수상비행기는 일조 전까지 운항하므로 입국 소요시간과 마지막 연결편을 함께 보세요. 연결이 어렵다면 말레 1박을 고려합니다.</span></article>
      <article class="seo-static__card"><h3>야간 말레 도착</h3><span>보트 야간 운항이 확인된 경우가 아니라면 말레나 훌루말레에서 1박 후 다음 날 오전 이동하는 일정이 안정적입니다.</span></article>
    </div>
  </section>
  <section class="seo-static__section" aria-labelledby="route-guide-title">
    <h2 id="route-guide-title">경유 방식과 귀국편 대기시간</h2>
    <div class="seo-static__grid">
      <article class="seo-static__card"><h3>싱가포르 경유</h3><span>스탑오버나 환승 동선을 중요하게 볼 때 검토할 수 있습니다. 환승 대기시간과 귀국편 출발 시간을 확인하세요.</span></article>
      <article class="seo-static__card"><h3>중동 경유</h3><span>밤 출발 선택지나 좌석 컨디션을 중시할 때 비교합니다. 총 이동시간과 말레 도착이 새벽인지 야간인지를 함께 보세요.</span></article>
      <article class="seo-static__card"><h3>동남아 경유</h3><span>환승 터미널, 수하물 연결, 지연 위험을 확인하세요. 귀국편 대기가 길다면 라운지나 공항 휴식 계획도 필요합니다.</span></article>
    </div>
    <p class="seo-static__note" style="margin-top:18px;">이 페이지는 항공 일정과 경유 방식을 계획하는 가이드입니다. 운임 조회나 자동 예약 기능은 제공하지 않으므로 실제 시간표와 연결 가능 여부는 항공사·리조트에 다시 확인하세요.</p>
  </section>
  <section class="seo-static__section seo-static__note" aria-labelledby="flight-next-title">
    <h2 id="flight-next-title">항공 일정에 맞는 리조트 후보를 줄이세요</h2>
    <p>말레 도착 시간에 맞는 이동수단을 고르고, 같은 일정·객실·식사 조건으로 견적을 확인하세요.</p>
    <div class="seo-static__actions">
      <a class="seo-static__action" href="${siteUrl}/maldives-resort-comparison/">항공 일정에 맞는 리조트 비교</a>
      <a class="seo-static__action seo-static__action--secondary" href="${siteUrl}/quote-comparison/">동일 조건 견적 확인하기</a>
    </div>
  </section>`;

const buildCoreSeoPage = (page, resorts) => {
  const url = `${siteUrl}${page.path}`;
  const contentByKey = {
    start: buildStartContent,
    resortComparison: () => buildResortComparisonContent(resorts.length),
    quoteComparison: buildQuoteComparisonContent,
    flightGuide: buildFlightGuideContent,
  };
  const introByKey = {
    start:
      '몰디브는 리조트 이름부터 찾기보다 예산, 일정, 이동수단, 객실 타입과 식사 플랜을 먼저 정하면 후보를 훨씬 빠르게 줄일 수 있습니다.',
    resortComparison:
      `${resorts.length}개 몰디브 리조트의 예산, 말레 공항 이후 이동, 객실, 개인풀, 수중환경을 같은 기준으로 보고 여행 취향에 맞는 후보를 줄여보세요.`,
    quoteComparison:
      '여행사마다 다른 조건으로 요청하면 금액만으로 비교하기 어렵습니다. 같은 일정·객실·식사·이동 조건을 정리한 뒤 여러 여행사의 포함 항목을 확인하세요.',
    flightGuide:
      '인천에서 말레로 가는 항공 일정은 경유지보다 말레 도착 시간과 리조트 연결 가능 여부를 함께 보는 것이 중요합니다.',
  };
  const imageUrl = `${siteUrl}${page.image}`;
  return {
    html: `
      ${buildStandaloneStyles()}
      <div class="seo-static">
        ${buildStaticSiteHeader(page.path)}
        <main class="seo-static__content">
          <p class="seo-static__eyebrow">MALDIVES BIBLE GUIDE</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="seo-static__lead">${escapeHtml(introByKey[page.key])}</p>
          ${buildCoreFigure(page)}
          ${contentByKey[page.key]()}
          ${buildEditorialFooter({ modifiedAt: page.modifiedAt })}
        </main>
      </div>`,
    schemaNodes: [
      buildWebPageNode({
        url,
        name: page.title,
        description: page.description,
        modifiedAt: page.modifiedAt,
        primaryImage: {
          url: imageUrl,
          width: page.imageWidth,
          height: page.imageHeight,
        },
      }),
      buildBreadcrumbNode({ url, name: page.navLabel }),
    ],
  };
};

const buildHomeStaticFallback = () => {
  const guideLinks = nichePages.filter((page) => !coreSeoSlugs.has(page.slug)).map((page) => `
    <a class="seo-home-static__guide" href="${toAbsoluteUrl(page.slug)}">
      <strong>${escapeHtml(page.heading)}</strong>
      <span>${escapeHtml(page.description)}</span>
    </a>`).join('');

  return `
    ${buildStandaloneStyles()}
    <style>
      .seo-home-static__hero { background:linear-gradient(135deg,#062f3b 0%,#08746d 100%);color:#fff; }
      .seo-home-static__hero-inner { width:min(1120px,calc(100% - 36px));margin:0 auto;padding:70px 0 74px; }
      .seo-home-static__hero h1 { color:#fff; }
      .seo-home-static__hero .seo-static__lead { color:#d8f4ef; }
      .seo-home-static__guide { display:block;border-bottom:1px solid #e2e8f0;padding:14px 2px;color:#0f172a;text-decoration:none; }
      .seo-home-static__guide strong { display:block;font-size:15px; }
      .seo-home-static__guide span { display:block;margin-top:4px;color:#64748b;font-size:12px;line-height:1.6; }
      @media (max-width:760px) { .seo-home-static__hero-inner { padding:46px 0 50px; } }
    </style>
    <div class="seo-static seo-home-static">
      ${buildStaticSiteHeader()}
      <main>
        <section class="seo-home-static__hero">
          <div class="seo-home-static__hero-inner">
            <p class="seo-static__eyebrow" style="color:#b9fff1;">MALDIVES RESORT GUIDE</p>
            <h1>몰디브 여행, 기준부터 비교까지 한곳에서</h1>
            <p class="seo-static__lead">171개 몰디브 리조트를 예산·이동·객실·수중환경 기준으로 비교하고, 처음 준비하는 방법부터 여행사 견적 확인과 항공 일정 가이드까지 한곳에서 확인하세요.</p>
            <div class="seo-static__actions">
              <a class="seo-static__action" href="${siteUrl}/start/">몰디브 여행 시작하기</a>
              <a class="seo-static__action seo-static__action--secondary" href="${toAbsoluteUrl('maldives-resort-comparison')}">몰디브 리조트 비교</a>
            </div>
            <figure class="seo-static__figure">
              <img src="${siteUrl}/og-image.jpg" width="1200" height="630" alt="몰디브 라군과 리조트 전경" fetchpriority="high" />
              <figcaption>몰디브 섬과 워터빌라를 한눈에 볼 수 있는 리조트 전경</figcaption>
            </figure>
          </div>
        </section>
        <div class="seo-static__content">
          <section aria-labelledby="home-static-start">
            <p class="seo-static__eyebrow">START HERE</p>
            <h2 id="home-static-start" style="margin:0;font-size:26px;">처음이라면 이 순서로 보세요</h2>
            <div class="seo-static__grid" style="margin-top:16px;">
              <a class="seo-static__card" href="${siteUrl}/start/"><strong>1. 시작하기</strong><span>예산·일정·이동·객실과 식사 기준부터 정리해요.</span></a>
              <a class="seo-static__card" href="${siteUrl}/maldives-resort-comparison/"><strong>2. 몰디브 리조트 비교</strong><span>171개 리조트의 이동, 객실, 수중환경 조건을 비교해요.</span></a>
              <a class="seo-static__card" href="${siteUrl}/quote-comparison/"><strong>3. 몰디브 여행사 견적 비교</strong><span>같은 일정과 조건으로 요청하고 포함 항목을 확인해요.</span></a>
              <a class="seo-static__card" href="${siteUrl}/flight-guide/"><strong>4. 몰디브 항공 가이드</strong><span>말레 도착 시간과 리조트 연결 가능 여부를 맞춰봐요.</span></a>
            </div>
          </section>
          <section class="seo-static__section" aria-labelledby="home-static-guides">
            <h2 id="home-static-guides">몰디브 입문·비교 가이드</h2>
            <div>${guideLinks}</div>
          </section>
          ${buildMaldivesGlossaryContent()}
          ${buildEditorialFooter()}
        </div>
      </main>
    </div>`;
};

const buildGlossaryPage = () => {
  const url = toAbsoluteUrl('maldives-glossary');
  const termNodes = [];
  const categorySections = maldivesGlossaryCategories.map((category) => {
    const terms = category.terms.map((term, index) => {
      const termId = `term-${category.id}-${index + 1}`;
      termNodes.push({
        '@type': 'DefinedTerm',
        '@id': `${url}#${termId}`,
        name: term.name,
        alternateName: term.english,
        description: term.description,
        inDefinedTermSet: { '@id': `${url}#termset` },
      });
      return `
        <div id="${termId}" style="padding:14px 0;border-bottom:1px solid #edf2f2;scroll-margin-top:20px;">
          <dt style="font-size:15px;color:#0f172a;"><strong style="margin-right:8px;color:#0f766e;">${escapeHtml(term.name)}</strong>${escapeHtml(term.english)}</dt>
          <dd style="margin:5px 0 0;color:#475569;font-size:13px;line-height:1.7;">${escapeHtml(term.description)}</dd>
        </div>`;
    }).join('');
    return `
      <section id="${category.id}" class="seo-static__card" style="scroll-margin-top:20px;padding:22px;">
        <p class="seo-static__eyebrow" style="margin-bottom:5px;">${category.terms.length} TERMS</p>
        <h2 style="margin:0;font-size:23px;">${escapeHtml(category.title)}</h2>
        <p style="margin:7px 0 0;color:#64748b;font-size:13px;line-height:1.65;">${escapeHtml(category.note)}</p>
        <dl style="margin:12px 0 0;">${terms}</dl>
        <a href="${siteUrl}${category.href}" style="display:inline-block;margin-top:14px;color:#0f766e;font-size:13px;font-weight:900;text-decoration:none;">${escapeHtml(category.linkLabel)} →</a>
      </section>`;
  }).join('');
  const termSetNode = {
    '@type': 'DefinedTermSet',
    '@id': `${url}#termset`,
    name: '몰디브 관련 용어 43개',
    description: '몰디브 여행을 처음 알아볼 때 자주 만나는 지역, 이동, 객실, 바다, 식사와 비용 용어를 정리한 한국어 용어집입니다.',
    inLanguage: 'ko-KR',
    url,
    hasDefinedTerm: termNodes.map((term) => ({ '@id': term['@id'] })),
  };
  return {
    slug: 'maldives-glossary',
    title: '몰디브 관련 용어 43개 | 식사·이동·객실·비용 용어집',
    description: 'HB, FB, AI, 하우스리프, 라군, 수상비행기, 그린택스 등 몰디브 여행을 처음 준비할 때 자주 만나는 43개 용어를 쉽게 설명합니다.',
    modifiedAt: siteDates.modified,
    html: `
      ${buildStandaloneStyles()}
      <div class="seo-static">
        ${buildStaticSiteHeader()}
        <main class="seo-static__content">
          <p class="seo-static__eyebrow">MALDIVES GLOSSARY</p>
          <h1>몰디브 관련 용어 43개</h1>
          <p class="seo-static__lead">식사 플랜부터 리조트 이동, 객실과 바다, 세금·비용까지 처음 알아볼 때 막히기 쉬운 표현을 한곳에 모았어요.</p>
          <nav class="seo-static__actions" aria-label="용어 분야">
            ${maldivesGlossaryCategories.map((category) => `<a class="seo-static__action seo-static__action--secondary" href="#${category.id}">${escapeHtml(category.title)}</a>`).join('')}
          </nav>
          <div class="seo-static__grid seo-static__section">${categorySections}</div>
          ${buildEditorialFooter()}
        </main>
      </div>`,
    schemaNodes: [
      buildWebPageNode({
        url,
        name: '몰디브 관련 용어 43개',
        description: '몰디브 여행을 처음 알아볼 때 자주 만나는 지역, 이동, 객실, 바다, 식사와 비용 용어를 정리한 한국어 용어집입니다.',
        publishedAt: siteDates.glossaryPublished,
        modifiedAt: siteDates.modified,
        mainEntityId: `${url}#termset`,
      }),
      buildBreadcrumbNode({ url, name: '몰디브 관련 용어' }),
      termSetNode,
      ...termNodes,
    ],
  };
};

const buildResortDirectoryPage = (resorts) => {
  const url = toAbsoluteUrl('maldives-resorts');
  const sorted = [...resorts].sort((a, b) => String(a.name || a.name_en).localeCompare(String(b.name || b.name_en), 'ko'));
  const links = sorted.map((resort) => {
    const name = resort.name || resort.name_en;
    const slug = slugify(resort.name_en || resort.name);
    return `
      <a class="seo-static__card" href="${siteUrl}/resorts/${slug}/">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(resort.name_en && resort.name_en !== name ? resort.name_en : resort.location || '')}</span>
      </a>`;
  }).join('');
  const itemListNode = {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name: `몰디브 리조트 ${sorted.length}곳`,
    numberOfItems: sorted.length,
    itemListElement: sorted.map((resort, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: resort.name || resort.name_en,
      url: `${siteUrl}/resorts/${slugify(resort.name_en || resort.name)}/`,
    })),
  };
  return {
    slug: 'maldives-resorts',
    title: `몰디브 리조트 목록 ${sorted.length}곳 | 몰디브 바이블`,
    description: `몰디브 바이블에 정리된 ${sorted.length}개 리조트를 한눈에 보고 각 리조트의 예산, 이동, 객실, 수중환경과 실제 후기 정보를 확인하세요.`,
    modifiedAt: siteDates.modified,
    html: `
      ${buildStandaloneStyles()}
      <div class="seo-static">
        ${buildStaticSiteHeader()}
        <main class="seo-static__content">
          <p class="seo-static__eyebrow">RESORT DIRECTORY</p>
          <h1>몰디브 리조트 ${sorted.length}곳</h1>
          <p class="seo-static__lead">이름으로 리조트를 찾아 상세 정보를 확인하거나, 필터 화면에서 예산과 취향에 맞는 후보를 골라보세요.</p>
          <div class="seo-static__actions">
            <a class="seo-static__action" href="${siteUrl}/maldives-resort-comparison/">조건으로 리조트 찾기 →</a>
            <a class="seo-static__action seo-static__action--secondary" href="${toAbsoluteUrl('maldives-resort-comparison')}">비교 기준 먼저 보기</a>
          </div>
          <section class="seo-static__section" aria-labelledby="resort-directory-title">
            <h2 id="resort-directory-title">전체 리조트</h2>
            <div class="seo-static__grid">${links}</div>
          </section>
          ${buildEditorialFooter()}
        </main>
      </div>`,
    schemaNodes: [
      buildWebPageNode({
        url,
        name: `몰디브 리조트 목록 ${sorted.length}곳`,
        description: `몰디브 바이블에 정리된 ${sorted.length}개 리조트의 상세 정보 목록입니다.`,
        type: 'CollectionPage',
        publishedAt: siteDates.resortPagesPublished,
        modifiedAt: siteDates.modified,
        mainEntityId: `${url}#itemlist`,
      }),
      buildBreadcrumbNode({ url, name: '몰디브 리조트 목록' }),
      itemListNode,
    ],
  };
};

const buildEditorialPolicyPage = () => {
  const page = editorialPolicyPage;
  const url = `${siteUrl}${page.canonicalPath}`;
  const comparisonCards = page.comparisonCriteria.items.map((item) => `
    <article class="seo-static__card">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.summary)}</span>
      <ul style="margin:10px 0 0;padding-left:18px;color:#475569;font-size:13px;line-height:1.7;">${item.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>
    </article>`).join('');
  const policySection = (id, title, introduction, items) => `
    <section id="${id}" class="seo-static__section" aria-labelledby="${id}-title">
      <h2 id="${id}-title">${escapeHtml(title)}</h2>
      ${introduction ? `<p style="max-width:800px;margin:-4px 0 14px;color:#475569;line-height:1.75;">${escapeHtml(introduction)}</p>` : ''}
      <div class="seo-static__note"><ul style="margin:0;padding-left:20px;">${items.map((item) => `<li style="margin:6px 0;">${escapeHtml(item)}</li>`).join('')}</ul></div>
    </section>`;
  return {
    slug: page.slug,
    title: page.title,
    description: page.description,
    modifiedAt: page.updatedAt,
    html: `
      ${buildStandaloneStyles()}
      <div class="seo-static">
        ${buildStaticSiteHeader()}
        <main class="seo-static__content">
          <p class="seo-static__eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="seo-static__lead">${escapeHtml(page.introduction)}</p>
          <p class="seo-static__note" style="margin-top:24px;">${escapeHtml(page.serviceNotice)}</p>
          <section class="seo-static__section" aria-labelledby="comparison-policy-title">
            <h2 id="comparison-policy-title">${escapeHtml(page.comparisonCriteria.title)}</h2>
            <p style="color:#475569;line-height:1.75;">${escapeHtml(page.comparisonCriteria.introduction)}</p>
            <div class="seo-static__grid">${comparisonCards}</div>
          </section>
          ${policySection('review-policy', page.reviewPolicy.title, page.reviewPolicy.introduction, [...page.reviewPolicy.principles, page.reviewPolicy.sourceNote])}
          ${policySection('metric-policy', page.metricDisclosure.title, page.metricDisclosure.introduction, page.metricDisclosure.notices)}
          ${policySection('update-policy', page.updatePolicy.title, '', page.updatePolicy.principles)}
          ${buildEditorialFooter()}
        </main>
      </div>`,
    schemaNodes: [
      buildWebPageNode({
        url,
        name: page.heading,
        description: page.description,
        type: 'AboutPage',
        publishedAt: page.publishedAt,
        modifiedAt: page.updatedAt,
      }),
      buildBreadcrumbNode({ url, name: '소개·편집 기준' }),
    ],
  };
};

const buildResortSchemaNodes = (resort, canonicalUrl, description) => {
  const name = resort.name || resort.name_en;
  const hotelId = `${canonicalUrl}#hotel`;
  const editorReview = normalizeEditorReview(resort.editorReview);
  const editorReviewId = editorReview ? `${canonicalUrl}#editor-review` : null;
  const hotelNode = {
    '@type': 'Hotel',
    '@id': hotelId,
    name,
    alternateName: resort.name_en && resort.name_en !== resort.name ? resort.name_en : undefined,
    url: canonicalUrl,
    image: Array.isArray(resort.imageUrls) ? resort.imageUrls.slice(0, 3) : undefined,
    address: resort.location ? { '@type': 'PostalAddress', addressLocality: resort.location } : undefined,
  };

  const nodes = [
    buildWebPageNode({
      url: canonicalUrl,
      name: editorReview ? editorReview.title : `${name} 리조트 정보`,
      description,
      publishedAt: siteDates.resortPagesPublished,
      modifiedAt: editorReview?.publishedAt ?? siteDates.modified,
      mainEntityId: hotelId,
      subjectOfId: editorReviewId,
    }),
    buildBreadcrumbNode({
      url: canonicalUrl,
      name,
      parents: [
        {
          name: '몰디브 리조트 비교',
          url: toAbsoluteUrl('maldives-resort-comparison'),
        },
      ],
    }),
    hotelNode,
  ];

  if (editorReview && editorReviewId) {
    nodes.push({
      '@type': 'Article',
      '@id': editorReviewId,
      headline: editorReview.title,
      description: editorReview.dek,
      articleBody: [editorReview.dek, ...editorReview.paragraphs, editorReview.verdict].join('\n\n'),
      articleSection: '몰디브 리조트 에디터 리뷰',
      inLanguage: 'ko-KR',
      url: canonicalUrl,
      mainEntityOfPage: { '@id': `${canonicalUrl}#webpage` },
      about: { '@id': hotelId },
      author: { '@id': organizationId },
      publisher: { '@id': organizationId },
      datePublished: editorReview.publishedAt,
      dateModified: editorReview.publishedAt,
    });
  }

  return nodes;
};

const replaceMetaContent = (html, attribute, value, content) =>
  html.replace(
    new RegExp(`<meta(?=[^>]*${attribute}="${value}")[^>]*>`, 'i'),
    `<meta ${attribute}="${value}" content="${escapeHtml(content)}" />`
  );

const injectMeta = ({
  html,
  title,
  description,
  url,
  schemaNodes,
  ogImageAlt,
  imageUrl,
  imageWidth,
  imageHeight,
}) => {
  let updated = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  updated = replaceMetaContent(updated, 'name', 'description', description);
  updated = replaceMetaContent(updated, 'name', 'robots', 'index,follow,max-image-preview:large');
  updated = replaceMetaContent(updated, 'name', 'googlebot', 'index,follow,max-image-preview:large');
  updated = replaceMetaContent(updated, 'property', 'og:title', title);
  updated = replaceMetaContent(updated, 'property', 'og:description', description);
  updated = replaceMetaContent(updated, 'property', 'og:url', url);
  updated = replaceMetaContent(updated, 'name', 'twitter:title', title);
  updated = replaceMetaContent(updated, 'name', 'twitter:description', description);
  if (imageUrl) {
    updated = replaceMetaContent(updated, 'property', 'og:image', imageUrl);
    updated = replaceMetaContent(updated, 'property', 'og:image:secure_url', imageUrl);
    updated = replaceMetaContent(updated, 'property', 'og:image:type', 'image/jpeg');
    updated = replaceMetaContent(updated, 'property', 'og:image:width', String(imageWidth));
    updated = replaceMetaContent(updated, 'property', 'og:image:height', String(imageHeight));
    updated = replaceMetaContent(updated, 'name', 'twitter:image', imageUrl);
  }
  if (ogImageAlt) {
    updated = replaceMetaContent(updated, 'property', 'og:image:alt', ogImageAlt);
    updated = replaceMetaContent(updated, 'name', 'twitter:image:alt', ogImageAlt);
  }
  updated = updated
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
    .replace(/<link rel="alternate" href=".*?" hreflang="ko(?:-KR)?"\s*\/>/, `<link rel="alternate" href="${escapeHtml(url)}" hreflang="ko-KR" />`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  return updated.replace(
    /<\/head>/,
    `  <script type="application/ld+json">${buildSchemaGraph(schemaNodes)}</script>\n</head>`
  );
};

const injectStaticRoot = (html, content, { preserveStaticContent = false } = {}) => {
  const updated = html.replace(
    /<div id="root">[\s\S]*?<\/div>\s*<\/body>/,
    `<div id="root"${preserveStaticContent ? ' data-static-page="true"' : ''}>${content}</div>\n  </body>`
  );
  return preserveStaticContent
    ? updated.replace(/\s*<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/i, '')
    : updated;
};

const updateSitemap = async (resortEntries, staticPageEntries) => {
  const rawEntries = [
    { loc: `${siteUrl}/`, lastmod: siteDates.homeModified, priority: '1.0' },
    ...staticPageEntries.map((entry) => ({
      loc: toAbsoluteUrl(entry.slug),
      lastmod: entry.lastmod,
      priority: entry.priority ?? '0.8',
    })),
    ...resortEntries.map((entry) => ({
      loc: `${siteUrl}/resorts/${entry.slug}/`,
      lastmod: entry.lastmod,
      priority: '0.6',
    })),
  ];
  const entries = [...new Map(rawEntries.map((entry) => [entry.loc, entry])).values()];
  const escapeXml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  for (const entry of entries) {
    const parsed = new URL(entry.loc);
    if (parsed.origin !== siteUrl || parsed.search || parsed.hash) {
      throw new Error(`sitemap에 clean canonical URL이 아닌 값이 있습니다: ${entry.loc}`);
    }
  }

  const urlEntries = entries.map((entry) => {
    const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
    return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n    <priority>${escapeXml(entry.priority)}</priority>\n  </url>`;
  }).join('\n');

  const sitemap = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urlEntries}\n</urlset>`;
  await writeFile(sitemapPath, sitemap, 'utf-8');
};

const readBuiltOrSourceFile = async (builtPath, sourcePath) => {
  try {
    return await readFile(builtPath, 'utf-8');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return readFile(sourcePath, 'utf-8');
  }
};

const getResortDataFiles = async () => {
  const apiDir = resolve(distDir, 'api');
  const names = await readdir(apiDir).catch(() => readdir(resolve(process.cwd(), 'public', 'api')));
  return names
    .filter((name) => /^resorts(\d+)?\.json$/.test(name))
    .sort((a, b) => {
      const getIndex = (name) => {
        const match = name.match(/^resorts(\d+)?\.json$/);
        return match?.[1] ? Number(match[1]) : 1;
      };
      return getIndex(a) - getIndex(b);
    });
};

const readAllResorts = async () => {
  const files = await getResortDataFiles();
  const apiDir = resolve(distDir, 'api');
  const sourceApiDir = resolve(process.cwd(), 'public', 'api');
  const chunks = await Promise.all(
    files.map((file) =>
      readBuiltOrSourceFile(resolve(apiDir, file), resolve(sourceApiDir, file))
    )
  );
  const resorts = chunks.flatMap((chunk) => JSON.parse(chunk));
  const seen = new Set();
  for (const resort of resorts) {
    if (!Number.isInteger(resort?.id) || !resort?.name || !resort?.name_en) {
      throw new Error('리조트 데이터에 필수 필드(id, name, name_en)가 없습니다.');
    }
    if (seen.has(resort.id)) throw new Error(`중복 리조트 id: ${resort.id}`);
    seen.add(resort.id);
  }
  if (resorts.length !== expectedResortCount) {
    throw new Error(`리조트 수가 예상과 다릅니다. expected=${expectedResortCount}, actual=${resorts.length}`);
  }

  const reviewInsights = JSON.parse(
    await readBuiltOrSourceFile(reviewInsightsDataPath, sourceReviewInsightsPath)
  );
  if (!Array.isArray(reviewInsights?.items)) {
    throw new Error('resort-review-insights.json의 items가 배열이 아닙니다.');
  }
  if (reviewInsights.items.length !== expectedResortCount) {
    throw new Error(`후기 인덱스 수가 예상과 다릅니다. expected=${expectedResortCount}, actual=${reviewInsights.items.length}`);
  }
  const reviewIds = new Set();
  for (const item of reviewInsights.items) {
    if (!Number.isInteger(item?.resortId) || !item?.reviewSummary || !seen.has(item.resortId)) {
      throw new Error(`후기 인덱스에 잘못된 리조트 id가 있습니다: ${item?.resortId ?? 'unknown'}`);
    }
    if (reviewIds.has(item.resortId)) throw new Error(`중복 후기 인덱스 id: ${item.resortId}`);
    reviewIds.add(item.resortId);
  }
  const reviewSummaryEntries = await Promise.all(
    reviewInsights.items.map(async (item) => {
        const detail = JSON.parse(await readBuiltOrSourceFile(
          resolve(reviewDetailsDir, `${item.resortId}.json`),
          resolve(sourceReviewDetailsDir, `${item.resortId}.json`)
        ));
        if (detail?.resortId !== item.resortId || !detail?.reviewSummary) {
          throw new Error(`리조트 ${item.resortId}의 후기 상세 파일 형식이 올바르지 않습니다.`);
        }
        return [item.resortId, { ...item.reviewSummary, ...detail.reviewSummary }];
      })
  );
  const reviewSummaryByResortId = new Map(reviewSummaryEntries);

  const editorReviews = JSON.parse(
    await readBuiltOrSourceFile(editorReviewsDataPath, sourceEditorReviewsPath)
  );
  if (editorReviews?.schemaVersion !== 1 || !Array.isArray(editorReviews?.items)) {
    throw new Error('resort-editor-reviews.json 형식이 올바르지 않습니다.');
  }
  if (editorReviews.items.length < 35) {
    throw new Error(`에디터 리뷰가 35개보다 적습니다: ${editorReviews.items.length}`);
  }
  const editorReviewByResortId = new Map();
  for (const item of editorReviews.items) {
    if (!Number.isInteger(item?.resortId) || !seen.has(item.resortId)) {
      throw new Error(`에디터 리뷰에 잘못된 리조트 id가 있습니다: ${item?.resortId ?? 'unknown'}`);
    }
    if (editorReviewByResortId.has(item.resortId)) {
      throw new Error(`중복 에디터 리뷰 id: ${item.resortId}`);
    }
    if ((reviewSummaryByResortId.get(item.resortId)?.sourceCount ?? 0) < 10) {
      throw new Error(`에디터 리뷰는 실제 후기 10개 이상인 리조트부터 발행합니다: ${item.resortId}`);
    }
    const editorReview = normalizeEditorReview(item.editorReview);
    if (!editorReview) {
      throw new Error(`리조트 ${item.resortId}의 에디터 리뷰 형식이 올바르지 않습니다.`);
    }
    editorReviewByResortId.set(item.resortId, editorReview);
  }

  return resorts.map((resort) => ({
    ...resort,
    ...(reviewSummaryByResortId.has(resort.id)
      ? { reviewSummary: reviewSummaryByResortId.get(resort.id) }
      : {}),
    ...(editorReviewByResortId.has(resort.id)
      ? { editorReview: editorReviewByResortId.get(resort.id) }
      : {}),
  }));
};

try {
  await copyFile(source, target);
  console.log('Copied dist/index.html to dist/404.html for SPA fallback.');

  const [template, resorts] = await Promise.all([
    readFile(source, 'utf-8'),
    readAllResorts(),
  ]);

  const resortEntries = [];
  const usedSlugs = new Set();

  for (const resort of resorts) {
    const name = resort.name_en || resort.name;
    if (!name) {
      continue;
    }
    const slug = slugify(name);
    if (!slug) {
      continue;
    }
    if (usedSlugs.has(slug)) {
      continue;
    }
    usedSlugs.add(slug);
    resortEntries.push({ slug, lastmod: resort.editorReview?.publishedAt ?? siteDates.modified });

    const title = resort.editorReview
      ? `${resort.name || name} 에디터 리뷰 | 몰디브 바이블`
      : `${resort.name || name} 리조트 정보 | 몰디브 바이블`;
    const description = buildResortDescription(resort);
    const url = `${siteUrl}/resorts/${slug}/`;
    const schemaNodes = buildResortSchemaNodes(resort, url, description);

    const html = injectStaticRoot(
      injectMeta({ html: template, title, description, url, schemaNodes }),
      buildResortPageContent(resort)
    );
    const targetPath = resolve(distDir, 'resorts', slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
  }

  const staticPageEntries = [];
  for (const page of coreSeoPages) {
    const url = `${siteUrl}${page.path}`;
    const { html: content, schemaNodes } = buildCoreSeoPage(page, resorts);
    const html = injectStaticRoot(
      injectMeta({
        html: template,
        title: page.title,
        description: page.description,
        url,
        schemaNodes,
        ogImageAlt: page.imageAlt,
        imageUrl: `${siteUrl}${page.image}`,
        imageWidth: page.imageWidth,
        imageHeight: page.imageHeight,
      }),
      content
    );
    const targetPath = resolve(distDir, page.slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
    staticPageEntries.push({ slug: page.slug, lastmod: page.modifiedAt, priority: '0.9' });
  }

  for (const page of nichePages.filter((entry) => !coreSeoSlugs.has(entry.slug))) {
    const url = toAbsoluteUrl(page.slug);
    const { html: content, schemaNodes } = page.comparisonLanding
      ? buildComparisonLandingContent(page, resorts)
      : buildNichePageContent(page, resorts);
    const html = injectStaticRoot(
      injectMeta({
        html: template,
        title: page.title,
        description: page.description,
        url,
        schemaNodes,
        ogImageAlt: page.ogImageAlt,
      }),
      content,
      { preserveStaticContent: true }
    );
    const targetPath = resolve(distDir, page.slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
    staticPageEntries.push({
      slug: page.slug,
      lastmod: siteDates.modified,
      priority: page.comparisonLanding ? '0.9' : '0.8',
    });
  }

  const standalonePages = [
    buildGlossaryPage(),
    buildResortDirectoryPage(resorts),
    buildEditorialPolicyPage(),
  ];
  for (const page of standalonePages) {
    const url = toAbsoluteUrl(page.slug);
    const html = injectStaticRoot(
      injectMeta({
        html: template,
        title: page.title,
        description: page.description,
        url,
        schemaNodes: page.schemaNodes,
      }),
      page.html,
      { preserveStaticContent: true }
    );
    const targetPath = resolve(distDir, page.slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
    staticPageEntries.push({ slug: page.slug, lastmod: page.modifiedAt, priority: '0.8' });
  }

  await writeFile(source, injectStaticRoot(template, buildHomeStaticFallback()), 'utf-8');
  await updateSitemap(resortEntries, staticPageEntries);
  console.log(`Generated ${resortEntries.length} resort pages, ${staticPageEntries.length} static pages, a crawlable home fallback, and updated sitemap.`);
} catch (error) {
  console.error('Post-build step failed', error);
  process.exitCode = 1;
}
