export type View = 'resorts' | 'tips' | 'agencies' | 'flights';

export type SeoPageKey =
  | 'home'
  | 'start'
  | 'resortComparison'
  | 'quoteComparison'
  | 'flightGuide';

export interface SeoPageDefinition {
  path: string;
  title: string;
  description: string;
  heading: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

export const SEO_PAGES: Record<SeoPageKey, SeoPageDefinition> = {
  home: {
    path: '/',
    title: '몰디브 바이블 | 171개 리조트 비교·여행 준비 가이드',
    description:
      '171개 몰디브 리조트를 예산·이동·객실·수중환경 기준으로 비교하고, 처음 준비하는 방법부터 여행사 견적 확인과 항공 일정 가이드까지 한곳에서 확인하세요.',
    heading: '몰디브 여행, 기준부터 비교까지 한곳에서',
    image: '/og-image.jpg',
    imageAlt: '몰디브 라군과 리조트 전경',
    imageWidth: 1200,
    imageHeight: 630,
  },
  start: {
    path: '/start/',
    title: '몰디브 여행 시작하기 | 처음 준비하는 순서',
    description:
      '몰디브 여행을 처음 준비하는 분을 위해 예산, 일정, 이동수단, 객실 타입, 식사 플랜과 스노클링 기준을 순서대로 정리했습니다.',
    heading: '몰디브 여행 시작하기',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 여행 준비를 위한 리조트와 바다 전경',
    imageWidth: 1200,
    imageHeight: 630,
  },
  resortComparison: {
    path: '/maldives-resort-comparison/',
    title: '2026 몰디브 리조트 비교 | 171개 가격·이동·후기',
    description:
      '171개 몰디브 리조트의 4박 2인 참고가, 공항 이동시간·이동비, 객실, 개인풀, 수중환경과 실제 후기를 한눈에 비교해 보세요.',
    heading: '몰디브 리조트 비교',
    image: '/brand/resort-comparison-preview.jpg',
    imageAlt: '171개 몰디브 리조트 비교 화면',
    imageWidth: 1216,
    imageHeight: 632,
  },
  quoteComparison: {
    path: '/quote-comparison/',
    title: '몰디브 여행사 견적 비교 | 같은 조건 요청문 만들기',
    description:
      '같은 일정·객실·식사 조건의 견적 요청문을 만들고, 몰디브 전문 여행사 홈페이지와 카카오 상담 채널에서 총액과 포함 조건을 비교하세요.',
    heading: '몰디브 여행사 견적 비교',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 여행 견적 비교 안내',
    imageWidth: 1200,
    imageHeight: 630,
  },
  flightGuide: {
    path: '/flight-guide/',
    title: '몰디브 항공 일정 가이드 | 말레 도착·경유 비교',
    description:
      '인천에서 말레까지의 주요 경유 방식과 도착 시간, 수상비행기 운항 시간과 리조트 이동 가능 여부를 함께 확인하세요.',
    heading: '몰디브 항공 일정 가이드',
    image: '/images/seo/maldives-resort-aerial.jpg',
    imageAlt: '몰디브 말레행 항공 일정 안내',
    imageWidth: 1200,
    imageHeight: 630,
  },
};

export const PATH_VIEW_MAP = {
  '/start/': 'tips',
  '/maldives-resort-comparison/': 'resorts',
  '/quote-comparison/': 'agencies',
  '/flight-guide/': 'flights',
} as const satisfies Record<string, View>;

export const VIEW_PATH_MAP: Record<View, string> = {
  tips: SEO_PAGES.start.path,
  resorts: SEO_PAGES.resortComparison.path,
  agencies: SEO_PAGES.quoteComparison.path,
  flights: SEO_PAGES.flightGuide.path,
};

export const VIEW_SEO_PAGE_MAP: Record<View, SeoPageKey> = {
  tips: 'start',
  resorts: 'resortComparison',
  agencies: 'quoteComparison',
  flights: 'flightGuide',
};
