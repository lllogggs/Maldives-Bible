import { copyFile, mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const source = resolve(distDir, 'index.html');
const target = resolve(distDir, '404.html');
const reviewInsightsDataPath = resolve(distDir, 'api', 'resort-review-insights.json');
const sourceReviewInsightsPath = resolve(process.cwd(), 'public', 'api', 'resort-review-insights.json');
const reviewDetailsDir = resolve(distDir, 'api', 'resort-reviews');
const sourceReviewDetailsDir = resolve(process.cwd(), 'public', 'api', 'resort-reviews');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const siteUrl = 'https://www.maldivesbible.com';
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
  const basis = [
    summary.sourceCount ? `실제 후기 ${summary.sourceCount}개 참고` : '실제 후기 참고',
    summary.reviewedAt ? `${summary.reviewedAt} 업데이트` : null,
  ].filter(Boolean).join(' · ');

  if (compact) {
    return `
      <div style="margin:0 0 14px;border-top:1px solid #e2e8f0;padding-top:12px;">
        <p style="margin:0 0 7px;color:#64748b;font-size:12px;font-weight:800;">후기 요약</p>
        ${pros.length > 0 ? `<p style="margin:0 0 5px;color:#334155;font-size:14px;line-height:1.55;"><strong style="color:#0f766e;">장점</strong> ${escapeHtml(pros[0])}</p>` : ''}
        ${cons.length > 0 ? `<p style="margin:0;color:#334155;font-size:14px;line-height:1.55;"><strong style="color:#9a5b31;">아쉬운 점</strong> ${escapeHtml(cons[0])}</p>` : ''}
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
        ${pros.length > 0 ? `<section style="border-radius:12px;background:#effaf7;padding:15px 16px;"><h3 style="margin:0;color:#0f766e;font-size:16px;">장점</h3><ul style="margin:5px 0 0;padding-left:19px;color:#334155;">${pointList(pros)}</ul></section>` : ''}
        ${cons.length > 0 ? `<section style="border-radius:12px;background:#fff8f0;padding:15px 16px;"><h3 style="margin:0;color:#9a5b31;font-size:16px;">아쉬운 점</h3><ul style="margin:5px 0 0;padding-left:19px;color:#334155;">${pointList(cons)}</ul></section>` : ''}
      </div>
      ${sourceLinks ? `<details style="margin-top:12px;border-top:1px solid #dbe7e4;padding-top:10px;"><summary style="cursor:pointer;color:#0f766e;font-size:13px;font-weight:700;">참고한 실제 후기 ${summary.sources.length}개</summary><ul style="margin:5px 0 0;padding-left:19px;color:#334155;font-size:12px;line-height:1.6;">${sourceLinks}</ul></details>` : ''}
      <p style="margin:11px 0 0;color:#64748b;font-size:12px;line-height:1.6;">${escapeHtml(basis)}. 선택에 도움이 되는 내용을 보기 쉽게 정리했으며, 여행 시기와 객실 유형에 따라 경험은 달라질 수 있습니다.</p>
    </section>`;
};

const buildResortDescription = (resort) => {
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
  const reviewSummaryContent = buildReviewSummaryContent(resort.reviewSummary);

  return `
    <style>
      @media (max-width:480px) {
        .seo-resort-page { padding:22px 12px !important; }
        .seo-resort-card { padding:18px !important; }
        .seo-resort-card h1 { font-size:clamp(28px,9vw,34px) !important;line-height:1.22 !important;letter-spacing:-.035em;overflow-wrap:anywhere; }
        .seo-resort-review-grid { grid-template-columns:minmax(0,1fr) !important; }
      }
    </style>
    <main class="seo-resort-page" style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
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
        ${reviewSummaryContent}
        <a href="${toAbsoluteUrl('maldives-resort-comparison')}" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 비교 가이드</a>
        <span aria-hidden="true" style="margin:0 8px;color:#94a3b8;">·</span>
        <a href="${siteUrl}/?view=resorts" style="color:#0f766e;font-weight:800;text-decoration:none;">전체 리조트 직접 비교</a>
      </article>
    </main>`;
};

const buildNichePageContent = (page, resorts) => {
  const selected = resorts.filter(page.filter).sort(page.sort).slice(0, 12);
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const listItems = selected
    .map((resort, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: resort.name,
      url: `${siteUrl}/resorts/${slugify(resort.name_en || resort.name)}/`,
    }));
  const itemListSchema = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.heading,
    itemListElement: listItems,
  });
  const faqSchema = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

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
          <p style="margin:14px 0 0;color:#64748b;">${page.keywords.map((keyword) => escapeHtml(keyword)).join(' · ')}</p>
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
            <a href="${siteUrl}/?view=resorts" style="color:#0f766e;font-weight:800;text-decoration:none;">전체 리조트 직접 비교</a>
          </p>
        </section>
      </main>`,
    schemaJson: `${itemListSchema}</script>\n<script type="application/ld+json">${faqSchema}`,
  };
};

const buildComparisonLandingContent = (page, resorts) => {
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
    ? `/?view=resorts#/compare/${showcaseSlugs.join(',')}`
    : '/?view=resorts';
  const breadcrumbSchema = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '몰디브 바이블',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.heading,
        item: toAbsoluteUrl(page.slug),
      },
    ],
  });
  const itemListSchema = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '몰디브 리조트 비교 대표 후보',
    numberOfItems: representativeResorts.length,
    itemListElement: representativeResorts.map((resort, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: resort.name,
      url: resortUrl(resort),
    })),
  });
  const faqSchema = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  const criterionCards = criteria
    .map(
      (criterion, index) => `
        <article class="comparison-landing__criterion-card">
          <span class="comparison-landing__criterion-number" aria-hidden="true">0${index + 1}</span>
          <h3>${escapeHtml(criterion.title.replace(/^\d+\.\s*/, ''))}</h3>
          <p>${escapeHtml(criterion.body)}</p>
          <p class="comparison-landing__criterion-examples">
            데이터 예시: ${criterion.resorts
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
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;min-width:170px;">${escapeHtml(roomFeatures.join(' · ') || '정보 확인 중')}</td>
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
            <a class="comparison-landing__header-action" href="/?view=resorts" aria-label="리조트 목록 바로 보기">
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
                <a class="comparison-landing__hero-primary" data-compare-cta="hero" href="/?view=resorts">내 조건으로 리조트 비교하기 <span aria-hidden="true" style="margin-left:8px;">→</span></a>
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
                <span class="comparison-landing__preview-badge">LIVE PREVIEW</span>
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
                <p class="comparison-landing__section-kicker">DATA SAMPLE</p>
                <h2 id="comparison-table-title">대표 리조트 데이터 비교</h2>
                <p id="comparison-table-note" class="comparison-landing__section-intro">각 기준에서 뽑은 데이터 예시이며 순위나 실시간 예약가를 의미하지 않습니다.</p>
              </div>
              <a class="comparison-landing__table-button" data-compare-cta="table" href="/?view=resorts">전체 ${resorts.length}개 리조트에서 찾기</a>
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
            <a data-compare-cta="footer" href="/?view=resorts">내 조건으로 리조트 비교하기 →</a>
          </section>

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
    schemaJson: `${breadcrumbSchema}</script>\n<script type="application/ld+json">${itemListSchema}</script>\n<script type="application/ld+json">${faqSchema}`,
  };
};

const buildResortSchema = (resort, canonicalUrl) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: resort.name || resort.name_en,
    alternateName: resort.name_en && resort.name_en !== resort.name ? resort.name_en : undefined,
    url: canonicalUrl,
    image: Array.isArray(resort.imageUrls) ? resort.imageUrls.slice(0, 3) : undefined,
    address: resort.location ? { '@type': 'PostalAddress', addressLocality: resort.location } : undefined,
  };

  return serializeJsonLd(schema);
};

const replaceMetaContent = (html, attribute, value, content) =>
  html.replace(
    new RegExp(`<meta(?=[^>]*${attribute}="${value}")[^>]*>`, 'i'),
    `<meta ${attribute}="${value}" content="${escapeHtml(content)}" />`
  );

const injectMeta = ({ html, title, description, url, schemaJson, ogImageAlt, removeTemplateFaq = false }) => {
  let updated = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  updated = replaceMetaContent(updated, 'name', 'description', description);
  updated = replaceMetaContent(updated, 'property', 'og:title', title);
  updated = replaceMetaContent(updated, 'property', 'og:description', description);
  updated = replaceMetaContent(updated, 'property', 'og:url', url);
  updated = replaceMetaContent(updated, 'name', 'twitter:title', title);
  updated = replaceMetaContent(updated, 'name', 'twitter:description', description);
  if (ogImageAlt) {
    updated = replaceMetaContent(updated, 'property', 'og:image:alt', ogImageAlt);
    updated = replaceMetaContent(updated, 'name', 'twitter:image:alt', ogImageAlt);
  }
  if (removeTemplateFaq) {
    updated = updated.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      (script) => (/"@type"\s*:\s*"FAQPage"/.test(script) ? '' : script)
    );
  }
  return updated
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
    .replace(/<link rel="alternate" href=".*?" hreflang="ko(?:-KR)?"\s*\/>/, `<link rel="alternate" href="${escapeHtml(url)}" hreflang="ko-KR" />`)
    .replace(/<script type="application\/ld\+json">\s*\{[\s\S]*?\}\s*<\/script>/, match => `${match}\n<script type="application/ld+json">${schemaJson}</script>`);
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

const updateSitemap = async (resortSlugs, nicheSlugs) => {
  const staticEntries = [
    `${siteUrl}/`,
    ...nicheSlugs.map((slug) => toAbsoluteUrl(slug)),
  ];

  const urlEntries = [
    ...staticEntries.map(
      (loc) =>
        `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    ),
    ...resortSlugs.map(
      (slug) =>
        `  <url>\n    <loc>${siteUrl}/resorts/${slug}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
    ),
  ].join('\n');

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

  return resorts.map((resort) => ({
    ...resort,
    ...(reviewSummaryByResortId.has(resort.id)
      ? { reviewSummary: reviewSummaryByResortId.get(resort.id) }
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

  const slugs = [];
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
    slugs.push(slug);

    const title = `${resort.name || name} 리조트 정보 | 몰디브 바이블`;
    const description = buildResortDescription(resort);
    const url = `${siteUrl}/resorts/${slug}/`;
    const schemaJson = buildResortSchema(resort, url);

    const html = injectStaticRoot(
      injectMeta({ html: template, title, description, url, schemaJson }),
      buildResortPageContent(resort)
    );
    const targetPath = resolve(distDir, 'resorts', slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
  }

  const nicheSlugs = [];
  for (const page of nichePages) {
    const url = toAbsoluteUrl(page.slug);
    const { html: content, schemaJson } = page.comparisonLanding
      ? buildComparisonLandingContent(page, resorts)
      : buildNichePageContent(page, resorts);
    const html = injectStaticRoot(
      injectMeta({
        html: template,
        title: page.title,
        description: page.description,
        url,
        schemaJson,
        ogImageAlt: page.ogImageAlt,
        removeTemplateFaq: page.comparisonLanding,
      }),
      content,
      { preserveStaticContent: true }
    );
    const targetPath = resolve(distDir, page.slug, 'index.html');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, html, 'utf-8');
    nicheSlugs.push(page.slug);
  }

  await updateSitemap(slugs, nicheSlugs);
  console.log(`Generated ${slugs.length} resort pages, ${nicheSlugs.length} niche pages, and updated sitemap.`);
} catch (error) {
  console.error('Post-build step failed', error);
  process.exitCode = 1;
}
