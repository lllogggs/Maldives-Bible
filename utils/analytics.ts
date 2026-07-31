export type AnalyticsValue = string | number | boolean;

export type AnalyticsParams = Record<string, AnalyticsValue | null | undefined>;

export type UtmCampaign = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
};

export type CapturedAttribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  captured_at: string;
  landing_page: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __MB_LAST_PAGE_VIEW__?: string;
  }
}

const PRODUCTION_HOSTS = new Set(['maldivesbible.com', 'www.maldivesbible.com']);
const ATTRIBUTION_STORAGE_KEY = 'mb_campaign_attribution_v1';
const UTM_VALUE_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const isBrowser = () => typeof window !== 'undefined';

export const isAnalyticsEnabled = () =>
  isBrowser() && PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase());

const cleanParamValue = (value: string | null, maxLength = 100): string | undefined => {
  const normalized = value?.trim().toLowerCase().slice(0, maxLength);
  return normalized && UTM_VALUE_PATTERN.test(normalized) ? normalized : undefined;
};

const readStoredAttribution = (): CapturedAttribution | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CapturedAttribution>;
    if (!parsed.utm_source || !parsed.utm_medium || !parsed.utm_campaign) return null;
    return parsed as CapturedAttribution;
  } catch {
    return null;
  }
};

export const captureCampaignAttribution = (): CapturedAttribution | null => {
  if (!isBrowser()) return null;

  const params = new URLSearchParams(window.location.search);
  const source = cleanParamValue(params.get('utm_source'));
  const medium = cleanParamValue(params.get('utm_medium'));
  const campaign = cleanParamValue(params.get('utm_campaign'));

  if (!source || !medium || !campaign) {
    return readStoredAttribution();
  }

  const attribution: CapturedAttribution = {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    captured_at: new Date().toISOString(),
    landing_page: `${window.location.pathname}${window.location.search}${window.location.hash}`.slice(0, 500),
  };
  const content = cleanParamValue(params.get('utm_content'));
  const term = cleanParamValue(params.get('utm_term'));
  if (content) attribution.utm_content = content;
  if (term) attribution.utm_term = term;

  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Session storage can be unavailable in privacy-restricted browser contexts.
  }

  return attribution;
};

const sanitizeEventParams = (params: AnalyticsParams): Record<string, AnalyticsValue> => {
  const sanitized: Record<string, AnalyticsValue> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) sanitized[key] = trimmed.slice(0, 100);
      return;
    }
    sanitized[key] = value;
  });
  return sanitized;
};

export const trackEvent = (eventName: string, params: AnalyticsParams = {}): boolean => {
  if (!isAnalyticsEnabled()) return false;
  let tracked = false;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, sanitizeEventParams(params));
    tracked = true;
  }
  if (typeof window.clarity === 'function') {
    window.clarity('event', eventName);
    tracked = true;
  }
  return tracked;
};

export const getAnalyticsRouteKey = (): string => {
  if (!isBrowser()) return '';
  const params = new URLSearchParams(window.location.search);
  const legacyView = params.get('view');
  const viewSuffix = legacyView ? `?view=${encodeURIComponent(legacyView)}` : '';
  return `${window.location.pathname}${viewSuffix}${window.location.hash}`;
};

export const trackPageView = (): boolean => {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') return false;
  const routeKey = getAnalyticsRouteKey();
  if (window.__MB_LAST_PAGE_VIEW__ === routeKey) return false;

  captureCampaignAttribution();
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
  window.__MB_LAST_PAGE_VIEW__ = routeKey;
  return true;
};

export const buildUtmUrl = (destination: string | URL, campaign: UtmCampaign): string => {
  const url = destination instanceof URL
    ? new URL(destination.toString())
    : new URL(destination, 'https://www.maldivesbible.com');

  const values = {
    utm_source: campaign.source,
    utm_medium: campaign.medium,
    utm_campaign: campaign.campaign,
    utm_content: campaign.content,
    utm_term: campaign.term,
  };

  Object.entries(values).forEach(([key, rawValue]) => {
    if (!rawValue) return;
    const normalized = cleanParamValue(rawValue);
    if (!normalized) {
      throw new Error(`${key} must use lowercase snake_case.`);
    }
    url.searchParams.set(key, normalized);
  });

  return url.toString();
};
