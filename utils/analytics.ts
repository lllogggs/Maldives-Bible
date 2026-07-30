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

let initialized = false;
let pageViewId = 0;
let currentPage: AnalyticsPage | null = null;
let currentPageKey = '';
let visibleStartedAt: number | null = null;
let visibleDurationMs = 0;
let pageFinalized = false;
const trackedImpressions = new Set<string>();

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

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
