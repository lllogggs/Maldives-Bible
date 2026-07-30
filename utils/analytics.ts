import type { AgencyChannel } from '../data/travel-agencies';

export type AnalyticsPageType =
  | 'home'
  | 'start'
  | 'resort_list'
  | 'resort_detail'
  | 'resort_compare'
  | 'agency_quotes'
  | 'flight_guide';

export interface AnalyticsPage {
  location: string;
  title: string;
  type: AnalyticsPageType;
}

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: GtagParams) => void;
  }
}

const AGENCY_PLACEMENT = 'quote_comparison_grid';
const MIN_ENGAGEMENT_MS = 250;
const ANALYTICS_JOURNEY_KEY = 'mb_analytics_journey';
const PENDING_QUOTE_ENTRY_KEY = 'mb_pending_quote_entry';
const JOURNEY_TIMEOUT_MS = 30 * 60 * 1000;
const QUOTE_ENTRY_MAX_AGE_MS = 10 * 60 * 1000;

type AnalyticsJourneyState = {
  startedAt: number;
  lastSeenAt: number;
  pageViews: number;
  quoteReached: boolean;
};

type PendingQuoteEntry = {
  id: string;
  label: string;
  fromUrl: string;
  clickedAt: number;
};

let initialized = false;
let pageViewId = 0;
let currentPage: AnalyticsPage | null = null;
let currentPageKey = '';
let visibleStartedAt: number | null = null;
let visibleDurationMs = 0;
let pageFinalized = false;
const trackedImpressions = new Set<string>();

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const wallClockNow = () => Date.now();

const sendEvent = (eventName: string, params: GtagParams = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }

  window.gtag('event', eventName, params);
  return true;
};

const stripQueryAndHash = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl, window.location.origin);
    return `${url.origin}${url.pathname}`;
  } catch {
    return rawUrl.split(/[?#]/, 1)[0];
  }
};

const getLinkDomain = (rawUrl: string) => {
  try {
    return new URL(rawUrl, window.location.origin).hostname;
  } catch {
    return '';
  }
};

const createJourneyState = (timestamp = wallClockNow()): AnalyticsJourneyState => ({
  startedAt: timestamp,
  lastSeenAt: timestamp,
  pageViews: 0,
  quoteReached: false,
});

const readJourneyState = (): AnalyticsJourneyState => {
  const timestamp = wallClockNow();
  if (typeof window === 'undefined') return createJourneyState(timestamp);

  try {
    const raw = window.sessionStorage.getItem(ANALYTICS_JOURNEY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AnalyticsJourneyState>;
      const startedAt = Number(parsed.startedAt);
      const lastSeenAt = Number(parsed.lastSeenAt);
      const pageViews = Number(parsed.pageViews);
      if (
        Number.isFinite(startedAt)
        && Number.isFinite(lastSeenAt)
        && Number.isFinite(pageViews)
        && timestamp >= startedAt
        && timestamp - lastSeenAt <= JOURNEY_TIMEOUT_MS
      ) {
        return {
          startedAt,
          lastSeenAt,
          pageViews: Math.max(0, Math.floor(pageViews)),
          quoteReached: parsed.quoteReached === true,
        };
      }
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }

  return createJourneyState(timestamp);
};

const writeJourneyState = (state: AnalyticsJourneyState) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ANALYTICS_JOURNEY_KEY, JSON.stringify(state));
  } catch {
    // Analytics must never block navigation when storage is unavailable.
  }
};

const rememberQuoteEntry = (element: HTMLElement) => {
  if (currentPage?.type === 'agency_quotes' || typeof window === 'undefined') return;
  const id = element.dataset.quoteEntry?.trim();
  if (!id) return;

  const label = element.textContent?.replace(/\s+/g, ' ').trim() || id;
  const pending: PendingQuoteEntry = {
    id,
    label: label.slice(0, 100),
    fromUrl: currentPage?.location ?? stripQueryAndHash(window.location.href),
    clickedAt: wallClockNow(),
  };

  try {
    window.sessionStorage.setItem(PENDING_QUOTE_ENTRY_KEY, JSON.stringify(pending));
  } catch {
    // The destination view can still be counted without placement attribution.
  }
};

const consumeQuoteEntry = (): PendingQuoteEntry | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_QUOTE_ENTRY_KEY);
    window.sessionStorage.removeItem(PENDING_QUOTE_ENTRY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingQuoteEntry>;
    const clickedAt = Number(parsed.clickedAt);
    if (
      typeof parsed.id !== 'string'
      || typeof parsed.label !== 'string'
      || typeof parsed.fromUrl !== 'string'
      || !Number.isFinite(clickedAt)
      || wallClockNow() - clickedAt > QUOTE_ENTRY_MAX_AGE_MS
    ) {
      return null;
    }
    return { id: parsed.id, label: parsed.label, fromUrl: parsed.fromUrl, clickedAt };
  } catch {
    return null;
  }
};

const accumulateVisibleTime = () => {
  if (visibleStartedAt === null) return;
  visibleDurationMs += Math.max(0, now() - visibleStartedAt);
  visibleStartedAt = null;
};

const resetPageTimer = () => {
  visibleDurationMs = 0;
  visibleStartedAt = document.visibilityState === 'visible' ? now() : null;
  pageFinalized = false;
};

const sendPageEngagement = (transportType?: 'beacon') => {
  if (!currentPage || pageFinalized) return;

  accumulateVisibleTime();
  pageFinalized = true;
  if (visibleDurationMs < MIN_ENGAGEMENT_MS) return;

  const roundedMs = Math.round(visibleDurationMs);
  sendEvent('page_engagement', {
    page_location: currentPage.location,
    page_title: currentPage.title,
    page_type: currentPage.type,
    engagement_time_msec: roundedMs,
    value: Math.round(roundedMs / 100) / 10,
    transport_type: transportType,
  });
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    accumulateVisibleTime();
    return;
  }

  if (!pageFinalized && visibleStartedAt === null) {
    visibleStartedAt = now();
  }
};

const handlePageHide = () => {
  if (!currentPage) return;
  sendPageEngagement('beacon');
  sendEvent('page_exit', {
    page_location: currentPage.location,
    page_title: currentPage.title,
    page_type: currentPage.type,
    transport_type: 'beacon',
  });
};

const readAgencyLink = (element: HTMLAnchorElement) => {
  const agencyId = element.dataset.agencyId?.trim();
  const agencyName = element.dataset.agencyName?.trim();
  const channel = element.dataset.agencyChannel as AgencyChannel | undefined;
  if (!agencyId || !agencyName || (channel !== 'website' && channel !== 'kakao')) {
    return null;
  }

  return {
    agencyId,
    agencyName,
    channel,
    destination: element.href,
  };
};

const sendAgencyEvent = (
  eventName: 'agency_cta_click' | 'agency_cta_impression',
  link: NonNullable<ReturnType<typeof readAgencyLink>>,
) => {
  sendEvent(eventName, {
    agency_id: link.agencyId,
    agency_name: link.agencyName,
    channel: link.channel,
    placement: AGENCY_PLACEMENT,
    link_id: `${link.agencyId}-${link.channel}`,
    link_text: link.agencyName,
    link_url: link.destination,
    link_domain: getLinkDomain(link.destination),
    outbound: true,
    page_location: currentPage?.location ?? stripQueryAndHash(window.location.href),
    page_title: currentPage?.title ?? document.title,
  });
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const quoteEntry = target.closest<HTMLElement>('[data-quote-entry]');
  if (quoteEntry) rememberQuoteEntry(quoteEntry);

  const anchor = target.closest<HTMLAnchorElement>('a[data-agency-id][data-agency-channel]');
  if (!anchor) return;

  const link = readAgencyLink(anchor);
  if (link) sendAgencyEvent('agency_cta_click', link);
};

export const initializeAnalytics = () => {
  if (initialized || typeof window === 'undefined' || typeof document === 'undefined') return;
  initialized = true;
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', handlePageHide);
};

export const trackAnalyticsPage = (page: AnalyticsPage) => {
  initializeAnalytics();
  const normalizedPage = { ...page, location: stripQueryAndHash(page.location) };
  const nextKey = `${normalizedPage.type}:${normalizedPage.location}`;
  if (nextKey === currentPageKey) return;

  const previousPage = currentPage;
  if (previousPage) {
    sendPageEngagement();
  }

  currentPage = normalizedPage;
  currentPageKey = nextKey;
  pageViewId += 1;
  resetPageTimer();

  sendEvent('site_content_view', {
    page_location: normalizedPage.location,
    page_title: normalizedPage.title,
    page_type: normalizedPage.type,
  });

  const timestamp = wallClockNow();
  const journey = readJourneyState();
  journey.lastSeenAt = timestamp;

  if (normalizedPage.type === 'agency_quotes' && !journey.quoteReached) {
    const pendingEntry = consumeQuoteEntry();
    const fallbackReferrer = previousPage?.location
      ?? (document.referrer ? stripQueryAndHash(document.referrer) : '');
    const pageReferrer = pendingEntry?.fromUrl || fallbackReferrer;
    const entryId = pendingEntry?.id || (previousPage ? 'internal_navigation' : 'direct_or_external');
    const entryLabel = pendingEntry?.label || (previousPage ? '내부 화면 이동' : '직접 또는 외부 진입');
    const elapsedSeconds = Math.max(0, Math.round((timestamp - journey.startedAt) / 1000));
    const commonQuoteParams: GtagParams = {
      page_location: normalizedPage.location,
      page_title: normalizedPage.title,
      page_type: normalizedPage.type,
      page_referrer: pageReferrer,
      link_id: entryId,
      link_text: entryLabel,
      link_url: normalizedPage.location,
      previous_page_type: previousPage?.type ?? 'landing',
      entry_method: previousPage ? 'internal' : 'landing',
      pages_before_quote: journey.pageViews,
    };

    const reachedSent = sendEvent('quote_comparison_reached', commonQuoteParams);
    sendEvent('quote_reach_timing', {
      ...commonQuoteParams,
      elapsed_before_quote_ms: elapsedSeconds * 1000,
      value: elapsedSeconds,
    });
    if (reachedSent) journey.quoteReached = true;
  }

  journey.pageViews += 1;
  writeJourneyState(journey);

  if (previousPage) {
    sendEvent('internal_navigation', {
      page_location: normalizedPage.location,
      page_title: normalizedPage.title,
      page_type: normalizedPage.type,
      page_referrer: previousPage.location,
      link_url: normalizedPage.location,
    });
  }
};

export const trackAgencyImpression = (element: HTMLAnchorElement) => {
  const link = readAgencyLink(element);
  if (!link) return;

  const key = `${pageViewId}:${link.agencyId}:${link.channel}`;
  if (trackedImpressions.has(key)) return;
  trackedImpressions.add(key);
  sendAgencyEvent('agency_cta_impression', link);
};
