import type { AnalyticsDashboardData } from './types';
import { TRAVEL_AGENCIES } from '../data/travel-agencies';

const toDate = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const agencySeeds = [18, 15, 13, 11, 9, 8, 7, 6, 5, 4, 3, 2];

export const DEMO_ANALYTICS_DATA: AnalyticsDashboardData = {
  ok: true,
  generatedAt: new Date().toISOString(),
  range: { days: 28, start: toDate(-27), end: toDate(0), label: '최근 28일' },
  cacheStatus: 'miss',
  summary: {
    current: {
      activeUsers: 1842,
      sessions: 2376,
      newUsers: 1521,
      engagedSessions: 1684,
      engagementRate: 0.7088,
      averageSessionDuration: 196,
      screenPageViews: 6842,
      screenPageViewsPerSession: 2.88,
    },
    previous: {
      activeUsers: 1598,
      sessions: 2041,
      newUsers: 1322,
      engagedSessions: 1390,
      engagementRate: 0.681,
      averageSessionDuration: 174,
      screenPageViews: 5702,
      screenPageViewsPerSession: 2.79,
    },
    change: {
      activeUsers: 0.153,
      sessions: 0.164,
      newUsers: 0.151,
      engagedSessions: 0.212,
      engagementRate: 0.041,
      averageSessionDuration: 0.126,
      screenPageViews: 0.2,
      screenPageViewsPerSession: 0.032,
    },
  },
  trend: Array.from({ length: 28 }, (_, index) => ({
    date: toDate(index - 27),
    sessions: 58 + ((index * 17) % 48) + (index > 20 ? 18 : 0),
    activeUsers: 43 + ((index * 13) % 35),
    pageViews: 144 + ((index * 29) % 120),
    quoteViews: 8 + ((index * 5) % 16),
    quoteSessions: 6 + ((index * 4) % 12),
    agencyClicks: 1 + ((index * 3) % 7),
    agencyImpressions: 18 + ((index * 7) % 23),
  })),
  acquisition: [
    ['Organic Search', 'google / organic', 1042, 0.76, 228, 72, 0.051],
    ['Organic Search', 'naver / organic', 684, 0.71, 203, 49, 0.057],
    ['Direct', '(direct) / (none)', 342, 0.64, 142, 18, 0.038],
    ['Referral', 'blog.naver.com / referral', 176, 0.69, 184, 12, 0.045],
    ['Organic Social', 'instagram.com / referral', 88, 0.58, 112, 5, 0.034],
  ].map(([channel, sourceMedium, sessions, engagementRate, averageSessionDuration, agencyClicks, agencyClickRate]) => ({
    channel: String(channel),
    sourceMedium: String(sourceMedium),
    sessions: Number(sessions),
    activeUsers: Math.round(Number(sessions) * 0.82),
    engagementRate: Number(engagementRate),
    averageSessionDuration: Number(averageSessionDuration),
    quoteSessions: Math.round(Number(sessions) * 0.21),
    quoteUsers: Math.round(Number(sessions) * 0.17),
    quoteReachRate: 0.21,
    agencyClicks: Number(agencyClicks),
    agencyClickSessions: Math.round(Number(agencyClicks) * 0.78),
    agencyClickRate: Number(agencyClickRate),
  })),
  landingPages: [
    ['/', 604, 0.68, 0.32, 176],
    ['/maldives-resort-comparison/', 548, 0.77, 0.23, 238],
    ['/start/', 321, 0.72, 0.28, 204],
    ['/quote-comparison/', 198, 0.81, 0.19, 226],
    ['/resorts/baros-maldives/', 142, 0.74, 0.26, 192],
  ].map(([path, sessions, engagementRate, bounceRate, averageSessionDuration]) => ({
    path: String(path), sessions: Number(sessions), activeUsers: Math.round(Number(sessions) * 0.84),
    engagementRate: Number(engagementRate), bounceRate: Number(bounceRate), averageSessionDuration: Number(averageSessionDuration),
  })),
  pages: [
    ['/', '몰디브 바이블', 1482, 1184, 92],
    ['/maldives-resort-comparison/', '몰디브 리조트 비교', 1364, 1048, 186],
    ['/quote-comparison/', '몰디브 여행사 견적 비교', 684, 528, 142],
    ['/start/', '몰디브 여행 시작하기', 612, 504, 164],
    ['/flight-guide/', '몰디브 항공 일정 가이드', 398, 326, 126],
  ].map(([path, title, views, users, average]) => ({
    path: String(path), title: String(title), views: Number(views), users: Number(users),
    engagementSeconds: Number(users) * Number(average), averageEngagementSeconds: Number(average),
  })),
  quoteComparison: {
    summary: {
      views: 684,
      sessions: 528,
      users: 412,
      reachRate: 528 / 2376,
      landingSessions: 198,
      landingShare: 198 / 528,
      averageSecondsToReach: 84,
      agencyClicks: 101,
      agencyClickSessions: 76,
      agencyClickUsers: 68,
      agencyClickRate: 76 / 528,
      trackingMode: 'precise',
    },
    entrySources: [
      { sourceId: 'primary_nav', label: '상단 견적 비교 탭', fromPath: '/maldives-resort-comparison/', kind: 'internal', entries: 142, sessions: 136, users: 118, share: 136 / 528 },
      { sourceId: 'home_service_card', label: '홈 서비스 카드', fromPath: '/', kind: 'internal', entries: 96, sessions: 91, users: 82, share: 91 / 528 },
      { sourceId: 'flight_guide_cta', label: '항공 가이드 안내 버튼', fromPath: '/flight-guide/', kind: 'internal', entries: 54, sessions: 51, users: 46, share: 51 / 528 },
      { sourceId: 'direct_or_external', label: '직접 또는 외부 진입', fromPath: '', kind: 'direct', entries: 198, sessions: 198, users: 166, share: 198 / 528 },
    ],
    hourly: Array.from({ length: 24 }, (_, hour) => {
      const entries = hour >= 19 && hour <= 23 ? 34 + ((hour * 7) % 18) : 8 + ((hour * 5) % 19);
      return { hour, label: `${String(hour).padStart(2, '0')}–${String((hour + 1) % 24).padStart(2, '0')}시`, entries, share: entries / 684 };
    }),
  },
  agencies: {
    clicks: 101,
    clickUsers: 76,
    impressions: 714,
    impressionUsers: 248,
    clickRate: 101 / 714,
    trackingMode: 'custom',
    rows: TRAVEL_AGENCIES.map((agency, index) => {
      const clicks = agencySeeds[index] ?? 0;
      const impressions = 42 + clicks * 3;
      const websiteClicks = Math.ceil(clicks * 0.56);
      const kakaoClicks = agency.kakao_channel ? clicks - websiteClicks : 0;
      return {
        id: agency.id,
        name: agency.name,
        clicks,
        impressions,
        clickRate: clicks / impressions,
        website: { clicks: websiteClicks, impressions: Math.round(impressions * 0.54), clickRate: websiteClicks / Math.round(impressions * 0.54) },
        kakao: agency.kakao_channel
          ? { clicks: kakaoClicks, impressions: impressions - Math.round(impressions * 0.54), clickRate: kakaoClicks / (impressions - Math.round(impressions * 0.54)) }
          : { clicks: 0, impressions: 0, clickRate: null },
      };
    }),
  },
  journeys: {
    transitions: [
      ['/', '/maldives-resort-comparison/', 418],
      ['/maldives-resort-comparison/', '/resorts/baros-maldives/', 146],
      ['/resorts/baros-maldives/', '/quote-comparison/', 62],
      ['/start/', '/maldives-resort-comparison/', 138],
      ['/flight-guide/', '/quote-comparison/', 47],
    ].map(([fromPath, toPath, count]) => ({ fromPath: String(fromPath), toPath: String(toPath), count: Number(count), users: Math.round(Number(count) * 0.82) })),
    exits: [
      ['/maldives-resort-comparison/', '몰디브 리조트 비교', 246],
      ['/quote-comparison/', '몰디브 여행사 견적 비교', 184],
      ['/resorts/baros-maldives/', '바로스 몰디브', 112],
      ['/', '몰디브 바이블', 96],
      ['/flight-guide/', '몰디브 항공 일정 가이드', 64],
    ].map(([path, title, exits]) => ({ path: String(path), title: String(title), exits: Number(exits), users: Math.round(Number(exits) * 0.84) })),
  },
  devices: [
    { device: 'mobile', users: 1274, sessions: 1648, engagementRate: 0.69 },
    { device: 'desktop', users: 514, sessions: 652, engagementRate: 0.76 },
    { device: 'tablet', users: 54, sessions: 76, engagementRate: 0.63 },
  ],
  warnings: ['미리보기용 예시 데이터입니다. 실제 배포 화면에는 표시되지 않습니다.'],
};
