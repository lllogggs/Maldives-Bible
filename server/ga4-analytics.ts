import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type {
  AnalyticsAcquisitionRow,
  AnalyticsAgencyRow,
  AnalyticsDashboardData,
  AnalyticsDeviceRow,
  AnalyticsExitRow,
  AnalyticsLandingPageRow,
  AnalyticsPageRow,
  AnalyticsQuoteEntryRow,
  AnalyticsQuoteHourRow,
  AnalyticsRangeDays,
  AnalyticsSummaryMetrics,
  AnalyticsTransitionRow,
  AnalyticsTrendPoint,
} from '../analytics/types';
import { TRAVEL_AGENCIES, type AgencyChannel } from '../data/travel-agencies.js';

type ParsedRow = Record<string, string>;

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

const VALID_RANGES: readonly AnalyticsRangeDays[] = [7, 28, 90];
const DEFAULT_CACHE_TTL_SECONDS = 300;
const QUOTE_PATH_PATTERN = '^/quote-comparison/?$';
const QUOTE_VIEW_EVENTS = ['site_content_view', 'page_view'];
const QUOTE_REACHED_EVENT = 'quote_comparison_reached';
const QUOTE_TIMING_EVENT = 'quote_reach_timing';
const cache = new Map<string, { expiresAt: number; data: AnalyticsDashboardData }>();
const pending = new Map<string, Promise<AnalyticsDashboardData>>();

let analyticsClient: BetaAnalyticsDataClient | null = null;

const dimension = (name: string) => ({ name });
const metric = (name: string) => ({ name });
const metricOrder = (metricName: string) => ({ metric: { metricName }, desc: true });
const dimensionOrder = (dimensionName: string) => ({ dimension: { dimensionName }, desc: false });

const eventFilter = (values: string[]) => ({
  filter: {
    fieldName: 'eventName',
    inListFilter: { values, caseSensitive: true },
  },
});

const exactPathFilter = (fieldName: string, pattern: string) => ({
  filter: {
    fieldName,
    stringFilter: { matchType: 'FULL_REGEXP', value: pattern, caseSensitive: true },
  },
});

const inListFilter = (fieldName: string, values: string[]) => ({
  filter: {
    fieldName,
    inListFilter: { values, caseSensitive: true },
  },
});

const andFilter = (...expressions: any[]) => ({ andGroup: { expressions } });

const dateRangeFor = (days: AnalyticsRangeDays, previous = false) => {
  if (previous) {
    return { startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` };
  }
  return { startDate: `${days - 1}daysAgo`, endDate: 'today' };
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const getRangeMetadata = (days: AnalyticsRangeDays) => {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return {
    days,
    start: toIsoDate(start),
    end: toIsoDate(end),
    label: `최근 ${days}일`,
  } as const;
};

const getCacheTtlMs = () => {
  const parsed = Number(process.env.ANALYTICS_CACHE_TTL_SECONDS ?? DEFAULT_CACHE_TTL_SECONDS);
  const seconds = Number.isFinite(parsed)
    ? Math.min(Math.max(Math.round(parsed), 60), 3600)
    : DEFAULT_CACHE_TTL_SECONDS;
  return seconds * 1000;
};

const readCredentials = (): ServiceAccountCredentials => {
  const base64 = process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  if (base64) {
    try {
      const parsed = JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as Partial<ServiceAccountCredentials>;
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key,
          project_id: parsed.project_id,
        };
      }
    } catch {
      throw new Error('GA4_SERVICE_ACCOUNT_JSON_BASE64 값의 형식이 올바르지 않습니다.');
    }
  }

  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  if (clientEmail && privateKey) {
    return { client_email: clientEmail, private_key: privateKey };
  }

  throw new Error('GA4 서비스 계정 환경변수가 설정되지 않았습니다.');
};

const getPropertyId = () => {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  if (!propertyId || !/^\d+$/.test(propertyId)) {
    throw new Error('GA4_PROPERTY_ID에 숫자형 GA4 속성 ID를 설정해 주세요.');
  }
  return propertyId;
};

export const getGa4ConfigurationStatus = () => {
  const missing: string[] = [];
  if (!/^\d+$/.test(process.env.GA4_PROPERTY_ID?.trim() ?? '')) missing.push('GA4_PROPERTY_ID');
  if (
    !process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64?.trim()
    && !(process.env.GA4_CLIENT_EMAIL?.trim() && process.env.GA4_PRIVATE_KEY?.trim())
  ) {
    missing.push('GA4_SERVICE_ACCOUNT_JSON_BASE64');
  }
  return { configured: missing.length === 0, missing };
};

const getClient = () => {
  if (analyticsClient) return analyticsClient;
  const credentials = readCredentials();
  analyticsClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: credentials.project_id,
  });
  return analyticsClient;
};

const numberValue = (value: string | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseRows = (report: any): ParsedRow[] => {
  const dimensions = (report?.dimensionHeaders ?? []).map((header: any) => header.name ?? '');
  const metrics = (report?.metricHeaders ?? []).map((header: any) => header.name ?? '');
  return (report?.rows ?? []).map((row: any) => {
    const parsed: ParsedRow = {};
    dimensions.forEach((name: string, index: number) => {
      if (name) parsed[name] = row.dimensionValues?.[index]?.value ?? '';
    });
    metrics.forEach((name: string, index: number) => {
      if (name) parsed[name] = row.metricValues?.[index]?.value ?? '0';
    });
    return parsed;
  });
};

const emptySummary = (): AnalyticsSummaryMetrics => ({
  activeUsers: 0,
  sessions: 0,
  newUsers: 0,
  engagedSessions: 0,
  engagementRate: 0,
  averageSessionDuration: 0,
  screenPageViews: 0,
  screenPageViewsPerSession: 0,
});

const parseSummary = (report: any): AnalyticsSummaryMetrics => {
  const row = parseRows(report)[0];
  if (!row) return emptySummary();
  return {
    activeUsers: numberValue(row.activeUsers),
    sessions: numberValue(row.sessions),
    newUsers: numberValue(row.newUsers),
    engagedSessions: numberValue(row.engagedSessions),
    engagementRate: numberValue(row.engagementRate),
    averageSessionDuration: numberValue(row.averageSessionDuration),
    screenPageViews: numberValue(row.screenPageViews),
    screenPageViewsPerSession: numberValue(row.screenPageViewsPerSession),
  };
};

const relativeChange = (current: number, previous: number) =>
  previous === 0 ? (current === 0 ? 0 : null) : (current - previous) / previous;

const formatGaDate = (value: string) =>
  /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value;

const normalizeDestination = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.hostname.toLowerCase()}${path}`;
  } catch {
    return rawUrl.toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
};

const destinationIndex = new Map<
  string,
  { agencyId: string; agencyName: string; channel: AgencyChannel }
>();

TRAVEL_AGENCIES.forEach(agency => {
  if (agency.website) {
    destinationIndex.set(normalizeDestination(agency.website), {
      agencyId: agency.id,
      agencyName: agency.name,
      channel: 'website',
    });
  }
  if (agency.kakao_channel) {
    destinationIndex.set(normalizeDestination(agency.kakao_channel), {
      agencyId: agency.id,
      agencyName: agency.name,
      channel: 'kakao',
    });
  }
});

const agencyLinkUrls = [...new Set(
  TRAVEL_AGENCIES.flatMap(agency => [agency.website, agency.kakao_channel])
    .filter((value): value is string => Boolean(value))
    .flatMap(value => {
      try {
        const normalized = new URL(value).href;
        return [value, normalized, normalized.replace(/\/$/, '')];
      } catch {
        return [value];
      }
    })
    .filter(Boolean),
)];

const quoteEntryLabels: Record<string, string> = {
  primary_nav: '상단 견적 비교 탭',
  home_service_card: '홈 서비스 카드',
  flight_guide_cta: '항공 가이드 안내 버튼',
  site_footer: '공통 푸터',
  static_header: '정적 페이지 상단 메뉴',
  static_footer: '정적 페이지 푸터',
  home_static_sequence_card: '홈 여행 준비 순서',
  flight_static_cta: '항공 가이드 정적 안내',
  internal_navigation: '내부 화면 이동',
  direct_or_external: '직접 또는 외부 진입',
  legacy_internal: '기존 내부 이동 추정',
  legacy_landing: '견적비교에서 방문 시작',
};

const findAgencyDestination = (linkUrl: string) => destinationIndex.get(normalizeDestination(linkUrl));

const pathFromUrl = (rawUrl: string) => {
  try {
    return new URL(rawUrl).pathname || '/';
  } catch {
    return rawUrl || '/';
  }
};

const isQuotePath = (path: string) => /^\/quote-comparison\/?$/.test(path || '');

const classifyQuoteReferrer = (rawUrl: string) => {
  if (!rawUrl) {
    return { kind: 'direct' as const, fromPath: '', label: '직접 또는 외부 진입' };
  }

  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'maldivesbible.com' || hostname === 'www.maldivesbible.com') {
      return { kind: 'internal' as const, fromPath: url.pathname || '/', label: url.pathname || '/' };
    }
    return { kind: 'external' as const, fromPath: hostname, label: `외부 유입 · ${hostname}` };
  } catch {
    if (rawUrl.startsWith('/')) {
      return { kind: 'internal' as const, fromPath: rawUrl, label: rawUrl };
    }
    return { kind: 'direct' as const, fromPath: '', label: '직접 또는 외부 진입' };
  }
};

const ratio = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : null;

const createAgencyRows = (
  clickRows: ParsedRow[],
  impressionRows: ParsedRow[],
): AnalyticsAgencyRow[] => {
  const rows = new Map<string, AnalyticsAgencyRow>();
  TRAVEL_AGENCIES.forEach(agency => {
    rows.set(agency.id, {
      id: agency.id,
      name: agency.name,
      clicks: 0,
      impressions: 0,
      clickRate: null,
      website: { clicks: 0, impressions: 0, clickRate: null },
      kakao: { clicks: 0, impressions: 0, clickRate: null },
    });
  });

  clickRows.forEach(source => {
    const destination = findAgencyDestination(source.linkUrl);
    if (!destination) return;
    const row = rows.get(destination.agencyId);
    if (!row) return;
    const count = numberValue(source.eventCount);
    row.clicks += count;
    row[destination.channel].clicks += count;
  });

  impressionRows.forEach(source => {
    const destination = findAgencyDestination(source.linkUrl);
    if (!destination) return;
    const row = rows.get(destination.agencyId);
    if (!row) return;
    const count = numberValue(source.eventCount);
    row.impressions += count;
    row[destination.channel].impressions += count;
  });

  rows.forEach(row => {
    row.clickRate = ratio(row.clicks, row.impressions);
    row.website.clickRate = ratio(row.website.clicks, row.website.impressions);
    row.kakao.clickRate = ratio(row.kakao.clicks, row.kakao.impressions);
  });

  return [...rows.values()].sort((left, right) =>
    right.clicks - left.clicks || right.impressions - left.impressions || left.name.localeCompare(right.name, 'ko'),
  );
};

const groupPages = (viewRows: ParsedRow[], engagementRows: ParsedRow[]): AnalyticsPageRow[] => {
  const hasCustomViews = viewRows.some(row => row.eventName === 'site_content_view' && numberValue(row.eventCount) > 0);
  const selectedViews = viewRows.filter(row => row.eventName === (hasCustomViews ? 'site_content_view' : 'page_view'));
  const grouped = new Map<string, AnalyticsPageRow>();

  selectedViews.forEach(row => {
    const path = row.pagePath || '/';
    const existing = grouped.get(path) ?? {
      path,
      title: row.pageTitle || path,
      views: 0,
      users: 0,
      engagementSeconds: 0,
      averageEngagementSeconds: 0,
    };
    existing.views += numberValue(row.eventCount);
    existing.users += numberValue(row.totalUsers);
    existing.engagementSeconds += numberValue(row.userEngagementDuration);
    if (row.pageTitle) existing.title = row.pageTitle;
    grouped.set(path, existing);
  });

  engagementRows.forEach(row => {
    const path = row.pagePath || '/';
    const existing = grouped.get(path);
    if (!existing) return;
    const measured = numberValue(row.eventValue);
    if (measured > 0) existing.engagementSeconds = measured;
  });

  grouped.forEach(row => {
    row.averageEngagementSeconds = row.users > 0 ? row.engagementSeconds / row.users : 0;
  });

  return [...grouped.values()]
    .sort((left, right) => right.views - left.views)
    .slice(0, 15);
};

const parseOverview = (rows: ParsedRow[], eventName: string) => {
  const row = rows.find(item => item.eventName === eventName);
  return row
    ? {
        count: numberValue(row.eventCount),
        users: numberValue(row.totalUsers),
        sessions: numberValue(row.sessions),
        value: numberValue(row.eventValue),
      }
    : { count: 0, users: 0, sessions: 0, value: 0 };
};

const buildDashboard = async (days: AnalyticsRangeDays): Promise<AnalyticsDashboardData> => {
  const client = getClient();
  const property = `properties/${getPropertyId()}`;
  const currentRange = dateRangeFor(days);
  const previousRange = dateRangeFor(days, true);
  const summaryMetrics = [
    'activeUsers',
    'sessions',
    'newUsers',
    'engagedSessions',
    'engagementRate',
    'averageSessionDuration',
    'screenPageViews',
    'screenPageViewsPerSession',
  ].map(metric);

  const [basicResult, behaviorResult, journeyResult, quoteResult] = await Promise.all([
    client.batchRunReports({
      property,
      requests: [
        { dateRanges: [currentRange], metrics: summaryMetrics, returnPropertyQuota: true },
        { dateRanges: [previousRange], metrics: summaryMetrics },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('date')],
          metrics: [metric('sessions'), metric('activeUsers'), metric('screenPageViews')],
          orderBys: [dimensionOrder('date')],
          limit: days,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('sessionPrimaryChannelGroup'), dimension('sessionSourceMedium')],
          metrics: [metric('sessions'), metric('activeUsers'), metric('engagementRate'), metric('averageSessionDuration')],
          orderBys: [metricOrder('sessions')],
          limit: 20,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('landingPage')],
          metrics: [metric('sessions'), metric('activeUsers'), metric('engagementRate'), metric('bounceRate'), metric('averageSessionDuration')],
          orderBys: [metricOrder('sessions')],
          limit: 15,
        },
      ],
    }),
    client.batchRunReports({
      property,
      requests: [
        {
          dateRanges: [currentRange],
          dimensions: [dimension('eventName'), dimension('pagePath'), dimension('pageTitle')],
          metrics: [metric('eventCount'), metric('totalUsers'), metric('userEngagementDuration')],
          dimensionFilter: eventFilter(['site_content_view', 'page_view']),
          orderBys: [metricOrder('eventCount')],
          limit: 100,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('pagePath'), dimension('pageTitle')],
          metrics: [metric('eventCount'), metric('eventValue'), metric('totalUsers')],
          dimensionFilter: eventFilter(['page_engagement']),
          orderBys: [metricOrder('eventValue')],
          limit: 100,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('eventName'), dimension('linkUrl'), dimension('linkDomain'), dimension('linkText')],
          metrics: [metric('eventCount'), metric('totalUsers')],
          dimensionFilter: eventFilter(['agency_cta_click', 'click']),
          orderBys: [metricOrder('eventCount')],
          limit: 200,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('linkUrl'), dimension('linkDomain'), dimension('linkText')],
          metrics: [metric('eventCount'), metric('totalUsers')],
          dimensionFilter: eventFilter(['agency_cta_impression']),
          orderBys: [metricOrder('eventCount')],
          limit: 100,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('pagePath'), dimension('pageTitle')],
          metrics: [metric('eventCount'), metric('totalUsers')],
          dimensionFilter: eventFilter(['page_exit']),
          orderBys: [metricOrder('eventCount')],
          limit: 30,
        },
      ],
    }),
    client.batchRunReports({
      property,
      requests: [
        {
          dateRanges: [currentRange],
          dimensions: [dimension('pageReferrer'), dimension('pagePath')],
          metrics: [metric('eventCount'), metric('totalUsers')],
          dimensionFilter: eventFilter(['internal_navigation']),
          orderBys: [metricOrder('eventCount')],
          limit: 30,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('deviceCategory')],
          metrics: [metric('activeUsers'), metric('sessions'), metric('engagementRate')],
          orderBys: [metricOrder('activeUsers')],
          limit: 5,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('sessionPrimaryChannelGroup'), dimension('sessionSourceMedium'), dimension('eventName'), dimension('linkUrl')],
          metrics: [metric('eventCount'), metric('sessions')],
          dimensionFilter: eventFilter(['agency_cta_click', 'click']),
          orderBys: [metricOrder('eventCount')],
          limit: 200,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('eventName')],
          metrics: [metric('eventCount'), metric('totalUsers'), metric('sessions')],
          dimensionFilter: eventFilter(['agency_cta_click', 'agency_cta_impression']),
          limit: 5,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('date'), dimension('eventName'), dimension('linkUrl')],
          metrics: [metric('eventCount')],
          dimensionFilter: eventFilter(['agency_cta_click', 'agency_cta_impression', 'click']),
          orderBys: [dimensionOrder('date')],
          limit: 1000,
        },
      ],
    }),
    client.batchRunReports({
      property,
      requests: [
        {
          dateRanges: [currentRange],
          dimensions: [dimension('eventName')],
          metrics: [metric('eventCount'), metric('sessions'), metric('totalUsers'), metric('eventValue')],
          dimensionFilter: andFilter(
            eventFilter([...QUOTE_VIEW_EVENTS, QUOTE_REACHED_EVENT, QUOTE_TIMING_EVENT]),
            exactPathFilter('pagePath', QUOTE_PATH_PATTERN),
          ),
          limit: 10,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('date'), dimension('hour'), dimension('eventName')],
          metrics: [metric('eventCount'), metric('sessions'), metric('totalUsers'), metric('eventValue')],
          dimensionFilter: andFilter(
            eventFilter([...QUOTE_VIEW_EVENTS, QUOTE_REACHED_EVENT, QUOTE_TIMING_EVENT]),
            exactPathFilter('pagePath', QUOTE_PATH_PATTERN),
          ),
          orderBys: [dimensionOrder('date'), dimensionOrder('hour')],
          limit: 10000,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('eventName'), dimension('pageReferrer'), dimension('linkId'), dimension('linkText')],
          metrics: [metric('eventCount'), metric('sessions'), metric('totalUsers')],
          dimensionFilter: andFilter(
            eventFilter([QUOTE_REACHED_EVENT]),
            exactPathFilter('pagePath', QUOTE_PATH_PATTERN),
          ),
          orderBys: [metricOrder('sessions')],
          limit: 100,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('sessionPrimaryChannelGroup'), dimension('sessionSourceMedium'), dimension('eventName')],
          metrics: [metric('sessions'), metric('totalUsers'), metric('eventCount')],
          dimensionFilter: andFilter(
            eventFilter(QUOTE_VIEW_EVENTS),
            exactPathFilter('pagePath', QUOTE_PATH_PATTERN),
          ),
          orderBys: [metricOrder('sessions')],
          limit: 100,
        },
        {
          dateRanges: [currentRange],
          dimensions: [dimension('eventName')],
          metrics: [metric('eventCount'), metric('sessions'), metric('totalUsers')],
          dimensionFilter: andFilter(
            eventFilter(['agency_cta_click', 'click']),
            inListFilter('linkUrl', agencyLinkUrls),
          ),
          limit: 5,
        },
      ],
    }),
  ]);

  const basicReports = basicResult[0].reports ?? [];
  const behaviorReports = behaviorResult[0].reports ?? [];
  const journeyReports = journeyResult[0].reports ?? [];
  const quoteReports = quoteResult[0].reports ?? [];
  const current = parseSummary(basicReports[0]);
  const previous = parseSummary(basicReports[1]);
  const summaryKeys = Object.keys(current) as Array<keyof AnalyticsSummaryMetrics>;
  const change = Object.fromEntries(
    summaryKeys.map(key => [key, relativeChange(current[key], previous[key])]),
  ) as Record<keyof AnalyticsSummaryMetrics, number | null>;

  const clickReportRows = parseRows(behaviorReports[2]).filter(row => findAgencyDestination(row.linkUrl));
  const customClickRows = clickReportRows.filter(row => row.eventName === 'agency_cta_click');
  const legacyClickRows = clickReportRows.filter(row => row.eventName === 'click');
  const hasCustomClicks = customClickRows.some(row => numberValue(row.eventCount) > 0);
  const selectedClickRows = hasCustomClicks ? customClickRows : legacyClickRows;
  const impressionRows = parseRows(behaviorReports[3]).filter(row => findAgencyDestination(row.linkUrl));
  const agencyRows = createAgencyRows(selectedClickRows, impressionRows);
  const overviewRows = parseRows(journeyReports[3]);
  const clickOverview = parseOverview(overviewRows, 'agency_cta_click');
  const impressionOverview = parseOverview(overviewRows, 'agency_cta_impression');
  const trackingMode = hasCustomClicks
    ? 'custom'
    : selectedClickRows.some(row => numberValue(row.eventCount) > 0)
      ? 'legacy'
      : 'waiting';
  const clickCount = hasCustomClicks
    ? clickOverview.count
    : selectedClickRows.reduce((sum, row) => sum + numberValue(row.eventCount), 0);
  const impressionCount = impressionOverview.count || impressionRows.reduce((sum, row) => sum + numberValue(row.eventCount), 0);

  const quoteOverviewRows = parseRows(quoteReports[0]);
  const hasSemanticQuoteViews = quoteOverviewRows.some(
    row => row.eventName === 'site_content_view' && numberValue(row.eventCount) > 0,
  );
  const hasLegacyQuoteViews = quoteOverviewRows.some(
    row => row.eventName === 'page_view' && numberValue(row.eventCount) > 0,
  );
  const quoteViewEvent = hasSemanticQuoteViews
    ? 'site_content_view'
    : hasLegacyQuoteViews
      ? 'page_view'
      : '';
  const quoteViewOverview = quoteViewEvent
    ? parseOverview(quoteOverviewRows, quoteViewEvent)
    : parseOverview([], '');
  const quoteReachedOverview = parseOverview(quoteOverviewRows, QUOTE_REACHED_EVENT);
  const quoteTimingOverview = parseOverview(quoteOverviewRows, QUOTE_TIMING_EVENT);
  const quoteTrackingMode = quoteReachedOverview.count > 0 && quoteTimingOverview.count > 0
    ? 'precise'
    : hasSemanticQuoteViews
      ? 'basic'
      : hasLegacyQuoteViews
        ? 'legacy'
        : 'waiting';

  const quoteClickRows = parseRows(quoteReports[4]);
  const quoteHasCustomClicks = quoteClickRows.some(
    row => row.eventName === 'agency_cta_click' && numberValue(row.eventCount) > 0,
  );
  const quoteClickEvent = quoteViewEvent === 'site_content_view'
    ? 'agency_cta_click'
    : quoteViewEvent === 'page_view'
      ? 'click'
      : quoteHasCustomClicks
        ? 'agency_cta_click'
        : 'click';
  const quoteClickOverview = parseOverview(
    quoteClickRows,
    quoteClickEvent,
  );

  const quoteTimeRows = parseRows(quoteReports[1]).filter(row => row.eventName === quoteViewEvent);
  const quoteByDate = new Map<string, { views: number; sessions: number }>();
  const quoteByHour = new Map<number, number>();
  quoteTimeRows.forEach(row => {
    const date = formatGaDate(row.date);
    const daily = quoteByDate.get(date) ?? { views: 0, sessions: 0 };
    daily.views += numberValue(row.eventCount);
    daily.sessions += numberValue(row.sessions);
    quoteByDate.set(date, daily);

    const hour = Number(row.hour);
    if (Number.isInteger(hour) && hour >= 0 && hour <= 23) {
      quoteByHour.set(hour, (quoteByHour.get(hour) ?? 0) + numberValue(row.eventCount));
    }
  });

  const quoteHourly: AnalyticsQuoteHourRow[] = Array.from({ length: 24 }, (_, hour) => {
    const entries = quoteByHour.get(hour) ?? 0;
    return {
      hour,
      label: `${String(hour).padStart(2, '0')}–${String((hour + 1) % 24).padStart(2, '0')}시`,
      entries,
      share: ratio(entries, quoteViewOverview.count),
    };
  });

  const quoteAcquisitionRows = parseRows(quoteReports[3]).filter(row => row.eventName === quoteViewEvent);
  const quoteByAcquisition = new Map<string, { sessions: number; users: number }>();
  quoteAcquisitionRows.forEach(row => {
    const key = `${row.sessionPrimaryChannelGroup}\u0000${row.sessionSourceMedium}`;
    const existing = quoteByAcquisition.get(key) ?? { sessions: 0, users: 0 };
    existing.sessions += numberValue(row.sessions);
    existing.users += numberValue(row.totalUsers);
    quoteByAcquisition.set(key, existing);
  });

  const dailyAgencyRows = parseRows(journeyReports[4]);
  const dailyCustomClicksExist = dailyAgencyRows.some(
    row => row.eventName === 'agency_cta_click' && findAgencyDestination(row.linkUrl) && numberValue(row.eventCount) > 0,
  );
  const dailyEvents = new Map<string, { clicks: number; impressions: number }>();
  dailyAgencyRows.forEach(row => {
    const destination = findAgencyDestination(row.linkUrl);
    if (!destination) return;
    const date = formatGaDate(row.date);
    const values = dailyEvents.get(date) ?? { clicks: 0, impressions: 0 };
    if (row.eventName === 'agency_cta_impression') values.impressions += numberValue(row.eventCount);
    if (row.eventName === (dailyCustomClicksExist ? 'agency_cta_click' : 'click')) {
      values.clicks += numberValue(row.eventCount);
    }
    dailyEvents.set(date, values);
  });

  const trend: AnalyticsTrendPoint[] = parseRows(basicReports[2]).map(row => {
    const date = formatGaDate(row.date);
    const agency = dailyEvents.get(date) ?? { clicks: 0, impressions: 0 };
    return {
      date,
      sessions: numberValue(row.sessions),
      activeUsers: numberValue(row.activeUsers),
      pageViews: numberValue(row.screenPageViews),
      quoteViews: quoteByDate.get(date)?.views ?? 0,
      quoteSessions: quoteByDate.get(date)?.sessions ?? 0,
      agencyClicks: agency.clicks,
      agencyImpressions: agency.impressions,
    };
  });

  const sourceClickRows = parseRows(journeyReports[2]).filter(row => findAgencyDestination(row.linkUrl));
  const sourceHasCustom = sourceClickRows.some(row => row.eventName === 'agency_cta_click' && numberValue(row.eventCount) > 0);
  const clicksBySource = new Map<string, { clicks: number; sessions: number }>();
  sourceClickRows.forEach(row => {
    if (row.eventName !== (sourceHasCustom ? 'agency_cta_click' : 'click')) return;
    const key = row.sessionSourceMedium;
    const existing = clicksBySource.get(key) ?? { clicks: 0, sessions: 0 };
    existing.clicks += numberValue(row.eventCount);
    existing.sessions += numberValue(row.sessions);
    clicksBySource.set(key, existing);
  });

  const acquisition: AnalyticsAcquisitionRow[] = parseRows(basicReports[3]).map(row => {
    const click = clicksBySource.get(row.sessionSourceMedium) ?? { clicks: 0, sessions: 0 };
    const quote = quoteByAcquisition.get(
      `${row.sessionPrimaryChannelGroup}\u0000${row.sessionSourceMedium}`,
    ) ?? { sessions: 0, users: 0 };
    const sessions = numberValue(row.sessions);
    return {
      channel: row.sessionPrimaryChannelGroup || '기타',
      sourceMedium: row.sessionSourceMedium || '(direct) / (none)',
      sessions,
      activeUsers: numberValue(row.activeUsers),
      engagementRate: numberValue(row.engagementRate),
      averageSessionDuration: numberValue(row.averageSessionDuration),
      quoteSessions: quote.sessions,
      quoteUsers: quote.users,
      quoteReachRate: ratio(quote.sessions, sessions),
      agencyClicks: click.clicks,
      agencyClickSessions: click.sessions,
      agencyClickRate: ratio(click.sessions, sessions),
    };
  });

  const landingPages: AnalyticsLandingPageRow[] = parseRows(basicReports[4]).map(row => ({
    path: row.landingPage || '/',
    sessions: numberValue(row.sessions),
    activeUsers: numberValue(row.activeUsers),
    engagementRate: numberValue(row.engagementRate),
    bounceRate: numberValue(row.bounceRate),
    averageSessionDuration: numberValue(row.averageSessionDuration),
  }));

  const exits: AnalyticsExitRow[] = parseRows(behaviorReports[4]).map(row => ({
    path: row.pagePath || '/',
    title: row.pageTitle || row.pagePath || '/',
    exits: numberValue(row.eventCount),
    users: numberValue(row.totalUsers),
  }));

  const transitions: AnalyticsTransitionRow[] = parseRows(journeyReports[0]).map(row => ({
    fromPath: pathFromUrl(row.pageReferrer),
    toPath: row.pagePath || '/',
    count: numberValue(row.eventCount),
    users: numberValue(row.totalUsers),
  }));

  const devices: AnalyticsDeviceRow[] = parseRows(journeyReports[1]).map(row => ({
    device: row.deviceCategory || 'unknown',
    users: numberValue(row.activeUsers),
    sessions: numberValue(row.sessions),
    engagementRate: numberValue(row.engagementRate),
  }));

  const quoteLandingSessions = landingPages
    .filter(row => isQuotePath(row.path))
    .reduce((sum, row) => sum + row.sessions, 0);
  const preciseQuoteEntries = parseRows(quoteReports[2]).filter(
    row => row.eventName === QUOTE_REACHED_EVENT && numberValue(row.eventCount) > 0,
  );
  const quoteEntryMap = new Map<string, AnalyticsQuoteEntryRow>();

  preciseQuoteEntries.forEach(row => {
    const classification = classifyQuoteReferrer(row.pageReferrer);
    const trackedLinkId = row.linkId && row.linkId !== '(not set)' ? row.linkId : '';
    const trackedLinkText = row.linkText && row.linkText !== '(not set)' ? row.linkText : '';
    const sourceId = trackedLinkId || (classification.kind === 'internal' ? 'internal_navigation' : 'direct_or_external');
    const key = `${sourceId}\u0000${classification.fromPath}`;
    const existing = quoteEntryMap.get(key) ?? {
      sourceId,
      label: quoteEntryLabels[sourceId] || trackedLinkText || classification.label,
      fromPath: classification.fromPath,
      kind: classification.kind,
      entries: 0,
      sessions: 0,
      users: 0,
      share: null,
    };
    existing.entries += numberValue(row.eventCount);
    existing.sessions += numberValue(row.sessions);
    existing.users += numberValue(row.totalUsers);
    quoteEntryMap.set(key, existing);
  });

  if (quoteEntryMap.size === 0) {
    transitions
      .filter(row => isQuotePath(row.toPath) && !isQuotePath(row.fromPath))
      .forEach(row => {
        const key = `legacy_internal\u0000${row.fromPath}`;
        const existing = quoteEntryMap.get(key) ?? {
          sourceId: 'legacy_internal',
          label: quoteEntryLabels.legacy_internal,
          fromPath: row.fromPath,
          kind: 'internal' as const,
          entries: 0,
          sessions: 0,
          users: 0,
          share: null,
        };
        existing.entries += row.count;
        existing.sessions += row.count;
        existing.users += row.users;
        quoteEntryMap.set(key, existing);
      });

    if (quoteLandingSessions > 0) {
      quoteEntryMap.set('legacy_landing\u0000', {
        sourceId: 'legacy_landing',
        label: quoteEntryLabels.legacy_landing,
        fromPath: '',
        kind: 'direct',
        entries: quoteLandingSessions,
        sessions: quoteLandingSessions,
        users: landingPages
          .filter(row => isQuotePath(row.path))
          .reduce((sum, row) => sum + row.activeUsers, 0),
        share: null,
      });
    }
  }

  const quoteEntrySources = [...quoteEntryMap.values()]
    .map(row => ({ ...row, share: ratio(row.sessions, quoteViewOverview.sessions) }))
    .sort((left, right) => right.sessions - left.sessions || right.entries - left.entries)
    .slice(0, 12);

  const averageSecondsToReach = quoteTimingOverview.count > 0
    ? quoteTimingOverview.value / quoteTimingOverview.count
    : null;
  const quoteAgencyClicks = quoteViewEvent === 'site_content_view'
    ? quoteClickOverview.count
    : (quoteClickOverview.count || clickCount);
  const quoteAgencyClickSessions = quoteClickOverview.sessions;
  const quoteAgencyClickUsers = quoteClickOverview.users;
  const quoteFunnelComparable = quoteTrackingMode !== 'legacy'
    && quoteTrackingMode !== 'waiting'
    && quoteAgencyClickSessions <= quoteViewOverview.sessions;

  const pageViewRows = parseRows(behaviorReports[0]);
  const warnings = ['오늘 데이터는 GA4 처리 상황에 따라 이후 소폭 조정될 수 있습니다.'];
  if (trackingMode === 'legacy') {
    warnings.push('새 여행사 이벤트가 쌓이기 전이라 기존 GA4 외부 링크 클릭을 임시로 표시하고 있습니다.');
  } else if (trackingMode === 'waiting') {
    warnings.push('여행사 클릭 이벤트는 이번 배포 이후부터 표시됩니다. 아직 수집된 클릭이 없습니다.');
  }
  if (!pageViewRows.some(row => row.eventName === 'site_content_view')) {
    warnings.push('새 화면 이동 데이터가 아직 없어 기존 GA4 페이지뷰를 표시하고 있습니다.');
  }
  if (exits.length === 0) {
    warnings.push('이탈 감지 데이터는 이번 배포 이후부터 쌓입니다.');
  }
  if (quoteTrackingMode !== 'precise') {
    warnings.push('견적비교 최초 도달시간과 정확한 진입 위치는 이번 배포 이후부터 쌓입니다.');
  }
  if (!quoteFunnelComparable && quoteAgencyClickSessions > 0) {
    warnings.push('기존 견적 조회와 외부 클릭의 수집 기준이 달라 견적→여행사 연결률은 새 추적 데이터가 쌓일 때까지 표시하지 않습니다.');
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    range: getRangeMetadata(days),
    cacheStatus: 'miss',
    summary: { current, previous, change },
    trend,
    acquisition,
    landingPages,
    pages: groupPages(pageViewRows, parseRows(behaviorReports[1])),
    quoteComparison: {
      summary: {
        views: quoteViewOverview.count,
        sessions: quoteViewOverview.sessions,
        users: quoteViewOverview.users,
        reachRate: ratio(quoteViewOverview.sessions, current.sessions),
        landingSessions: quoteLandingSessions,
        landingShare: ratio(quoteLandingSessions, quoteViewOverview.sessions),
        averageSecondsToReach,
        agencyClicks: quoteAgencyClicks,
        agencyClickSessions: quoteAgencyClickSessions,
        agencyClickUsers: quoteAgencyClickUsers,
        agencyClickRate: quoteFunnelComparable
          ? ratio(quoteAgencyClickSessions, quoteViewOverview.sessions)
          : null,
        trackingMode: quoteTrackingMode,
      },
      entrySources: quoteEntrySources,
      hourly: quoteHourly,
    },
    agencies: {
      clicks: clickCount,
      clickUsers: hasCustomClicks ? clickOverview.users : (quoteAgencyClickUsers || null),
      impressions: impressionCount,
      impressionUsers: impressionOverview.count > 0 ? impressionOverview.users : null,
      clickRate: ratio(clickCount, impressionCount),
      trackingMode,
      rows: agencyRows,
    },
    journeys: { transitions, exits },
    devices,
    warnings,
  };
};

export const isAnalyticsRangeDays = (value: number): value is AnalyticsRangeDays =>
  VALID_RANGES.includes(value as AnalyticsRangeDays);

export const getAnalyticsDashboard = async (
  days: AnalyticsRangeDays,
  forceRefresh = false,
): Promise<AnalyticsDashboardData> => {
  const key = `${getPropertyId()}:${days}`;
  const cached = cache.get(key);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, cacheStatus: 'hit' };
  }

  const existing = pending.get(key);
  if (existing) return existing;

  const request = buildDashboard(days)
    .then(data => {
      cache.set(key, { data, expiresAt: Date.now() + getCacheTtlMs() });
      return data;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
};
