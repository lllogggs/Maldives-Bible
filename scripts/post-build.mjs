import { copyFile, mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const source = resolve(distDir, 'index.html');
const target = resolve(distDir, '404.html');
const resortsDataPath = resolve(distDir, 'api', 'resorts.json');
const sourceResortsPath = resolve(process.cwd(), 'public', 'api', 'resorts.json');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const siteUrl = 'https://www.maldivesbible.com';
const currentYear = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
}).format(new Date());

const toUrlPath = (slug) => `/${encodeURI(slug)}/`;
const toAbsoluteUrl = (slug) => `${siteUrl}${toUrlPath(slug)}`;

const nichePages = [
  {
    slug: '몰디브-리조트-비교',
    title: `${currentYear} 몰디브 리조트 비교 | 몰디브 바이블`,
    description:
      '몰디브 리조트의 예산, 이동수단과 시간, 객실 유형, 수중환경 데이터를 한눈에 비교하고 여행 취향에 맞는 후보를 찾아보세요.',
    heading: `${currentYear} 몰디브 리조트 비교`,
    comparisonLanding: true,
    ogImageAlt: '몰디브 리조트 예산, 이동, 객실, 수중환경 비교 안내',
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
    slug: '몰디브-신혼여행-워터빌라-개인풀',
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
    slug: '몰디브-신혼여행-처음-준비',
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
    slug: '몰디브-리조트-선택-기준',
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
    slug: '몰디브-신혼여행-비용-감잡기',
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
    slug: '몰디브-신혼여행-일정-4박6일-5박7일',
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
    slug: '몰디브-리조트-이동수단-차이',
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
    slug: '몰디브-워터빌라-비치빌라-차이',
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
    slug: '몰디브-하프보드-풀보드-올인클루시브-차이',
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
    slug: '몰디브-보트-이동-리조트',
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
    slug: '몰디브-수상비행기-리조트',
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
    slug: '몰디브-스노클링-좋은-리조트',
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
    slug: '몰디브-올인클루시브-신혼여행',
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

  return `
    <article style="border:1px solid #dbe7e4;border-radius:12px;padding:18px;background:#fff;">
      <h2 style="margin:0 0 6px;font-size:20px;color:#0f172a;">${escapeHtml(resort.name)}</h2>
      <p style="margin:0 0 12px;color:#64748b;">${escapeHtml(resort.name_en || '')}</p>
      <p style="margin:0 0 10px;color:#334155;">${escapeHtml(resort.location || '')} · ${escapeHtml(resort.transportation || '')} ${resort.travelTime || 0}분 · 4박 2인 ${formatUsd(resort.price)}</p>
      <p style="margin:0 0 14px;color:#334155;">수중환경 ${resort.snorkelingQuality || '-'} / 5 · 다이닝 ${resort.restaurants || 0}곳 · 이동비 2인 왕복 ${formatUsd((resort.travelCost || 0) * 2)}</p>
      <p style="margin:0 0 14px;">${badges
        .map((badge) => `<span style="display:inline-block;margin:0 6px 6px 0;border-radius:999px;background:#ecfeff;color:#0f766e;padding:4px 9px;font-size:13px;font-weight:700;">${escapeHtml(badge)}</span>`)
        .join('')}</p>
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

  return `
    <main style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
      <article style="max-width:920px;margin:0 auto;border:1px solid #dbe7e4;border-radius:14px;background:#fff;padding:26px;">
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
        <a href="${toAbsoluteUrl('몰디브-리조트-비교')}" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 비교 가이드</a>
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
  const itemListSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.heading,
    itemListElement: listItems,
  });
  const faqSchema = JSON.stringify({
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
      <main style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f8f7;color:#0f172a;min-height:100vh;padding:32px 18px;">
        <section style="max-width:1120px;margin:0 auto 24px;">
          <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(page.eyebrow)}</p>
          <h1 style="margin:0;font-size:38px;line-height:1.18;">${escapeHtml(page.heading)}</h1>
          <p style="max-width:760px;margin:14px 0 0;color:#475569;font-size:17px;line-height:1.8;">${escapeHtml(page.intro)}</p>
          <p style="margin:14px 0 0;color:#64748b;">${page.keywords.map((keyword) => escapeHtml(keyword)).join(' · ')}</p>
        </section>
        ${sections.length > 0
          ? `<section style="max-width:1120px;margin:0 auto 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
              ${sections
                .map(
                  (section) => `
                    <article style="border:1px solid #dbe7e4;border-radius:12px;background:#fff;padding:18px;">
                      <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">${escapeHtml(section.title)}</h2>
                      <p style="margin:0;color:#475569;line-height:1.7;">${escapeHtml(section.body)}</p>
                    </article>`
                )
                .join('\n')}
            </section>`
          : ''}
        <section style="max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
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
          <p style="margin:24px 0 0;">
            <a href="${toAbsoluteUrl('몰디브-리조트-비교')}" style="color:#0f766e;font-weight:800;text-decoration:none;">몰디브 리조트 비교 가이드</a>
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
      title: '1. 예산은 숙박비와 이동비를 함께 보기',
      body:
        '숙박비가 비슷해도 보트, 수상비행기, 국내선 비용에 따라 총액이 달라집니다. 먼저 4박 2인 비교용 가격과 2인 왕복 이동비를 함께 확인하세요.',
      resorts: [...resorts]
        .filter(validPrice)
        .sort((a, b) => a.price - b.price || a.travelCost - b.travelCost)
        .slice(0, 3),
    },
    {
      title: '2. 이동수단과 시간을 일정에 맞추기',
      body:
        '짧은 일정이라면 공항 도착 후 이동시간이 만족도에 크게 영향을 줍니다. 보트, 수상비행기, 국내선의 특징과 예상 소요시간을 같이 비교하세요.',
      resorts: [...resorts]
        .filter(validTravelTime)
        .sort((a, b) => a.travelTime - b.travelTime || a.price - b.price)
        .slice(0, 3),
    },
    {
      title: '3. 원하는 객실 조건부터 좁히기',
      body:
        '워터빌라, 비치빌라, 개인풀은 여행 경험과 예산을 바꾸는 핵심 조건입니다. 꼭 필요한 객실 조건을 먼저 선택하면 비교할 후보가 빠르게 줄어듭니다.',
      resorts: [...resorts]
        .filter((resort) => resort.hasWaterVilla && resort.hasPrivatePool)
        .sort((a, b) => b.rating - a.rating || a.price - b.price)
        .slice(0, 3),
    },
    {
      title: '4. 수중환경과 부대시설을 취향대로 보기',
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
  const updatedAt = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const breadcrumbSchema = JSON.stringify({
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
  const itemListSchema = JSON.stringify({
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
  const faqSchema = JSON.stringify({
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
      (criterion) => `
        <article style="border:1px solid #dbe7e4;border-radius:16px;background:#fff;padding:22px;box-shadow:0 8px 30px rgba(15,118,110,.06);">
          <h2 style="margin:0 0 10px;font-size:21px;line-height:1.4;color:#0f172a;">${escapeHtml(criterion.title)}</h2>
          <p style="margin:0;color:#475569;line-height:1.75;">${escapeHtml(criterion.body)}</p>
          <p style="margin:16px 0 0;color:#64748b;font-size:14px;line-height:1.7;">
            데이터 예시: ${criterion.resorts
              .map((resort) => `<a href="${resortUrl(resort)}" style="color:#0f766e;font-weight:700;text-decoration:none;">${escapeHtml(resort.name)}</a>`)
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
        .comparison-landing a:focus-visible { outline:3px solid #14b8a6; outline-offset:3px; border-radius:4px; }
        .comparison-landing__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
        @media (max-width:720px) {
          .comparison-landing__grid { grid-template-columns:1fr; }
          .comparison-landing__title { font-size:36px !important; }
        }
      </style>
      <main class="comparison-landing" style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:linear-gradient(180deg,#effcfb 0,#f8fafc 440px);color:#0f172a;min-height:100vh;padding:24px 18px 56px;">
        <div style="max-width:1120px;margin:0 auto;">
          <nav aria-label="현재 위치" style="margin:0 0 28px;color:#64748b;font-size:14px;">
            <a href="/" style="color:#0f766e;text-decoration:none;">홈</a>
            <span aria-hidden="true" style="margin:0 8px;">/</span>
            <span aria-current="page">몰디브 리조트 비교</span>
          </nav>

          <header style="max-width:860px;margin:0 0 32px;">
            <p style="margin:0 0 10px;color:#0f766e;font-size:13px;font-weight:800;letter-spacing:.13em;">MALDIVES RESORT DATA</p>
            <h1 class="comparison-landing__title" style="margin:0;font-size:48px;line-height:1.15;letter-spacing:-.035em;">${escapeHtml(page.heading)}</h1>
            <p style="margin:18px 0 0;color:#334155;font-size:18px;line-height:1.8;">
              몰디브 바이블이 정리한 ${resorts.length}개 리조트 데이터를 바탕으로 예산, 이동, 객실, 수중환경을 같은 기준에서 살펴보세요. 이름보다 여행 조건을 먼저 정하면 나에게 맞는 후보를 더 빠르게 찾을 수 있습니다.
            </p>
            <p style="margin:14px 0 0;color:#64748b;font-size:14px;">페이지 업데이트 ${escapeHtml(updatedAt)} · 가격은 4박 2인 비교용 예시</p>
          </header>

          <section aria-labelledby="comparison-criteria-title" style="margin:0 0 36px;">
            <h2 id="comparison-criteria-title" style="margin:0 0 16px;font-size:28px;letter-spacing:-.02em;">비교할 때 먼저 볼 네 가지 기준</h2>
            <div class="comparison-landing__grid">${criterionCards}</div>
          </section>

          <section aria-labelledby="comparison-table-title" style="margin:0 0 36px;">
            <div style="display:flex;align-items:end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 14px;">
              <div>
                <h2 id="comparison-table-title" style="margin:0;font-size:28px;letter-spacing:-.02em;">대표 리조트 데이터 비교</h2>
                <p id="comparison-table-note" style="margin:8px 0 0;color:#64748b;line-height:1.6;">각 기준에서 뽑은 데이터 예시이며 순위나 예약가를 의미하지 않습니다.</p>
              </div>
              <a href="/?view=resorts" style="display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;background:#0f766e;color:#fff;font-weight:800;text-decoration:none;">${resorts.length}개 전체 찾아보기</a>
            </div>
            <div style="overflow-x:auto;border:1px solid #dbe7e4;border-radius:16px;background:#fff;box-shadow:0 8px 30px rgba(15,118,110,.06);">
              <table aria-describedby="comparison-table-note" style="width:100%;border-collapse:collapse;color:#334155;font-size:15px;">
                <thead style="background:#f0fdfa;color:#0f172a;">
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

          <section aria-labelledby="comparison-method-title" style="margin:0 0 36px;border:1px solid #dbe7e4;border-radius:16px;background:#fff;padding:24px;box-shadow:0 8px 30px rgba(15,118,110,.06);">
            <h2 id="comparison-method-title" style="margin:0 0 12px;font-size:28px;letter-spacing:-.02em;">데이터 기준과 이용 안내</h2>
            <p style="margin:0;color:#475569;line-height:1.8;">
              몰디브 바이블은 리조트가 공개한 정보와 공개 자료를 참고해 이동수단, 객실 조건, 다이닝 정보를 자체 형식으로 정리합니다. 수중환경 등 점수형 항목은 공식 등급이 아니라 후보 비교를 돕기 위한 몰디브 바이블의 자체 지표입니다. 한 리조트의 장점만 강조하기보다 여행 일정과 취향에 따라 달라지는 선택 기준을 함께 보여주는 것을 원칙으로 합니다.
            </p>
            <ul style="margin:16px 0 0;padding-left:20px;color:#475569;line-height:1.85;">
              <li>가격은 리조트 간 규모를 이해하기 위한 4박 2인 비교용 예시이며 실시간 예약가가 아닙니다.</li>
              <li>이동시간은 공항 도착 이후의 예상 소요시간으로 대기와 날씨에 따라 달라질 수 있습니다.</li>
              <li>최종 예약 전에는 여행 날짜의 객실, 식사 플랜, 세금과 이동비가 포함된 여행사 견적을 다시 확인하세요.</li>
            </ul>
          </section>

          <section aria-labelledby="comparison-faq-title" style="border-top:1px solid #dbe7e4;padding-top:30px;">
            <h2 id="comparison-faq-title" style="margin:0 0 18px;font-size:28px;letter-spacing:-.02em;">자주 묻는 질문</h2>
            ${page.faq
              .map(
                (item) => `
                  <article style="margin:0 0 16px;border:1px solid #dbe7e4;border-radius:14px;background:#fff;padding:20px;">
                    <h3 style="margin:0 0 8px;font-size:18px;line-height:1.5;">${escapeHtml(item.question)}</h3>
                    <p style="margin:0;color:#475569;line-height:1.75;">${escapeHtml(item.answer)}</p>
                  </article>`
              )
              .join('\n')}
          </section>

          <section style="margin:32px 0 0;border-radius:18px;background:#0f766e;padding:28px;color:#fff;text-align:center;">
            <h2 style="margin:0;font-size:26px;">내 조건으로 직접 비교해 보세요</h2>
            <p style="margin:10px auto 18px;max-width:680px;color:#ccfbf1;line-height:1.7;">예산과 취향으로 후보를 찾고 최대 3개 리조트의 차이를 한 화면에서 확인할 수 있습니다.</p>
            <a href="/?view=resorts" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 22px;border-radius:999px;background:#fff;color:#0f766e;font-weight:900;text-decoration:none;">몰디브 리조트 비교 시작하기</a>
          </section>
        </div>
      </main>`,
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

  return JSON.stringify(schema);
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
  try {
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
  } catch (error) {
    console.error('Failed to update sitemap with resort URLs', error);
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
      readFile(resolve(apiDir, file), 'utf-8').catch(() => readFile(resolve(sourceApiDir, file), 'utf-8'))
    )
  );
  const seen = new Set();
  return chunks
    .flatMap((chunk) => JSON.parse(chunk))
    .filter((resort) => {
      if (!resort?.id || seen.has(resort.id)) {
        return false;
      }
      seen.add(resort.id);
      return true;
    });
};

try {
  await copyFile(source, target);
  console.log('Copied dist/index.html to dist/404.html for SPA fallback.');

  const [template, resorts] = await Promise.all([
    readFile(source, 'utf-8'),
    readAllResorts().catch(async () => JSON.parse(await readFile(resortsDataPath, 'utf-8').catch(() => readFile(sourceResortsPath, 'utf-8')))),
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
