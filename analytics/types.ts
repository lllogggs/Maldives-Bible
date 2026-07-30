export type AnalyticsRangeDays = 7 | 28 | 90;

export interface AnalyticsSummaryMetrics {
  activeUsers: number;
  sessions: number;
  newUsers: number;
  engagedSessions: number;
  engagementRate: number;
  averageSessionDuration: number;
  screenPageViews: number;
  screenPageViewsPerSession: number;
}

export interface AnalyticsSummary {
  current: AnalyticsSummaryMetrics;
  previous: AnalyticsSummaryMetrics;
  change: Record<keyof AnalyticsSummaryMetrics, number | null>;
}

export interface AnalyticsTrendPoint {
  date: string;
  sessions: number;
  activeUsers: number;
  pageViews: number;
  quoteViews: number;
  quoteSessions: number;
  agencyClicks: number;
  agencyImpressions: number;
}

export interface AnalyticsAcquisitionRow {
  channel: string;
  sourceMedium: string;
  sessions: number;
  activeUsers: number;
  engagementRate: number;
  averageSessionDuration: number;
  quoteSessions: number;
  quoteUsers: number;
  quoteReachRate: number | null;
  agencyClicks: number;
  agencyClickSessions: number;
  agencyClickRate: number | null;
}

export interface AnalyticsLandingPageRow {
  path: string;
  sessions: number;
  activeUsers: number;
  engagementRate: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export interface AnalyticsPageRow {
  path: string;
  title: string;
  views: number;
  users: number;
  engagementSeconds: number;
  averageEngagementSeconds: number;
}

export interface AnalyticsAgencyChannelMetrics {
  clicks: number;
  impressions: number;
  clickRate: number | null;
}

export interface AnalyticsAgencyRow {
  id: string;
  name: string;
  clicks: number;
  impressions: number;
  clickRate: number | null;
  website: AnalyticsAgencyChannelMetrics;
  kakao: AnalyticsAgencyChannelMetrics;
}

export interface AnalyticsAgencySummary {
  clicks: number;
  clickUsers: number | null;
  impressions: number;
  impressionUsers: number | null;
  clickRate: number | null;
  trackingMode: 'custom' | 'legacy' | 'waiting';
  rows: AnalyticsAgencyRow[];
}

export interface AnalyticsQuoteEntryRow {
  sourceId: string;
  label: string;
  fromPath: string;
  kind: 'internal' | 'external' | 'direct';
  entries: number;
  sessions: number;
  users: number;
  share: number | null;
}

export interface AnalyticsQuoteHourRow {
  hour: number;
  label: string;
  entries: number;
  share: number | null;
}

export interface AnalyticsQuoteSummary {
  views: number;
  sessions: number;
  users: number;
  reachRate: number | null;
  landingSessions: number;
  landingShare: number | null;
  averageSecondsToReach: number | null;
  agencyClicks: number;
  agencyClickSessions: number;
  agencyClickUsers: number;
  agencyClickRate: number | null;
  trackingMode: 'precise' | 'basic' | 'legacy' | 'waiting';
}

export interface AnalyticsQuoteComparison {
  summary: AnalyticsQuoteSummary;
  entrySources: AnalyticsQuoteEntryRow[];
  hourly: AnalyticsQuoteHourRow[];
}

export interface AnalyticsTransitionRow {
  fromPath: string;
  toPath: string;
  count: number;
  users: number;
}

export interface AnalyticsExitRow {
  path: string;
  title: string;
  exits: number;
  users: number;
}

export interface AnalyticsDeviceRow {
  device: string;
  users: number;
  sessions: number;
  engagementRate: number;
}

export interface AnalyticsDashboardData {
  ok: true;
  generatedAt: string;
  range: {
    days: AnalyticsRangeDays;
    start: string;
    end: string;
    label: string;
  };
  cacheStatus: 'hit' | 'miss';
  summary: AnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  acquisition: AnalyticsAcquisitionRow[];
  landingPages: AnalyticsLandingPageRow[];
  pages: AnalyticsPageRow[];
  quoteComparison: AnalyticsQuoteComparison;
  agencies: AnalyticsAgencySummary;
  journeys: {
    transitions: AnalyticsTransitionRow[];
    exits: AnalyticsExitRow[];
  };
  devices: AnalyticsDeviceRow[];
  warnings: string[];
}

export interface AnalyticsApiError {
  error: string;
  message: string;
  setup?: string[];
}
