import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import ResortGrid from './components/ResortGrid';
import ResortDetail from './components/ResortDetail';
import CompareTray from './components/CompareTray';
import CompareView from './components/CompareView';
import NavBar from './components/NavBar';
import ResortSelectionTips from './components/ResortSelectionTips';
import TravelAgencies from './components/TravelAgencies';
import FlightInfo from './components/FlightInfo';
import SiteFooter from './components/SiteFooter';
import { POPULARITY_RANKING } from './constants';
import { TransportationType, type Resort, type Filters, type SortOption } from './types';
import { ChevronDownIcon, FilterIcon, SearchIcon, SortIcon } from './components/icons/Icons';
import { shareOrCopy, type ShareResult } from './utils/share';
import { RESORT_INTEREST_BASELINE } from './data/resort-interest-scores';
import {
  PATH_VIEW_MAP,
  SEO_PAGES,
  VIEW_PATH_MAP,
  VIEW_SEO_PAGE_MAP,
  type SeoPageDefinition,
  type SeoPageKey,
  type View,
} from './seoPages';

type ViteEnvShim = {
  DEV?: boolean;
  MODE?: string;
  VITE_DEV_SERVER_URL?: string;
  VITE_PREFERENCES_API_BASE_URL?: string;
  VITE_ENABLE_REMOTE_STATE_IN_DEV?: string;
};

type ResortReviewInsightsPayload = {
  items?: Array<{
    resortId: number;
    reviewSummary: NonNullable<Resort['reviewSummary']>;
  }>;
};

const VALID_VIEWS: readonly View[] = ['resorts', 'tips', 'agencies', 'flights'];
const VALID_SORT_OPTIONS: readonly SortOption[] = [
  'custom',
  'popularity',
  'price-asc',
  'price-desc',
  'rating-desc',
  'snorkeling-desc',
  'travelTime-asc',
  'likes-desc',
];
const VALID_ROOM_TYPES: readonly Filters['roomTypes'][number][] = ['beach', 'water'];

const isView = (value: string | null): value is View =>
  Boolean(value && VALID_VIEWS.includes(value as View));

const isSortOption = (value: string | null): value is SortOption =>
  Boolean(value && VALID_SORT_OPTIONS.includes(value as SortOption));

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();

const getResortSlug = (resort: Pick<Resort, 'name' | 'name_en'>): string => {
  const name = resort.name_en || resort.name || '';
  return slugify(name);
};

const getResortPathSegment = (pathname: string): string | null => {
  const match = pathname.match(/^\/resorts?\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }
  return decodeURIComponent(match[1]);
};

const hasDisplayableResortImage = (resort: Pick<Resort, 'imageUrls'>) =>
  Array.isArray(resort.imageUrls) &&
  resort.imageUrls.some(url => typeof url === 'string' && url.trim().length > 0);

const normalizeSlug = (raw: string): string | null => {
  const normalized = slugify(raw);
  return normalized.length > 0 ? normalized : null;
};

const getSlugFromPath = (pathname: string): string | null => {
  const segment = getResortPathSegment(pathname);
  return segment ? normalizeSlug(segment) : null;
};

const parseResortIdFromHash = (hash: string): number | null => {
  const match = hash.match(/^#\/resort\/(\d+)$/);
  return match ? Number(match[1]) : null;
};

const parseCompareSlugsFromHash = (hash: string): string[] => {
  const match = hash.match(/^#\/compare\/([^?#]+)$/);
  if (!match || match[1].length > 600) {
    return [];
  }

  let decoded = match[1];
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return [];
  }

  const seen = new Set<string>();
  const slugs: string[] = [];
  decoded.split(',').forEach(item => {
    const slug = normalizeSlug(item);
    if (!slug || seen.has(slug) || slugs.length >= 3) {
      return;
    }
    seen.add(slug);
    slugs.push(slug);
  });

  return slugs;
};

const buildCompareHash = (resorts: Resort[]): string => {
  const slugs = resorts
    .map(getResortSlug)
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, 3);
  return slugs.length >= 2 ? `#/compare/${slugs.join(',')}` : '';
};

const CANONICAL_SITE_ORIGIN = 'https://www.maldivesbible.com';

type PrimaryPath = keyof typeof PATH_VIEW_MAP;

const isPrimaryPath = (pathname: string): pathname is PrimaryPath =>
  Object.prototype.hasOwnProperty.call(PATH_VIEW_MAP, pathname);

const getNormalizedPrimaryPath = (pathname: string): PrimaryPath | null => {
  if (isPrimaryPath(pathname)) {
    return pathname;
  }

  if (pathname === '/') {
    return null;
  }

  const normalized = `${pathname.replace(/\/+$/, '')}/`;
  return isPrimaryPath(normalized) ? normalized : null;
};

const getViewFromPath = (pathname: string): View | null => {
  const normalizedPath = getNormalizedPrimaryPath(pathname);
  return normalizedPath ? PATH_VIEW_MAP[normalizedPath] : null;
};

const getSeoPageKeyFromLocation = (): SeoPageKey | null => {
  if (typeof window === 'undefined') {
    return 'home';
  }

  // Resort detail URLs and hash comparisons keep their existing, dedicated head state.
  if (
    getResortPathSegment(window.location.pathname) ||
    window.location.hash.startsWith('#/compare/') ||
    parseResortIdFromHash(window.location.hash)
  ) {
    return null;
  }

  const pathView = getViewFromPath(window.location.pathname);
  if (pathView) {
    return VIEW_SEO_PAGE_MAP[pathView];
  }

  if (window.location.pathname === '/') {
    const queryView = new URLSearchParams(window.location.search).get('view');
    return isView(queryView) ? VIEW_SEO_PAGE_MAP[queryView] : 'home';
  }

  return null;
};

const getActiveNavigationPath = (): string => {
  if (typeof window === 'undefined') {
    return SEO_PAGES.home.path;
  }

  if (
    getResortPathSegment(window.location.pathname) ||
    window.location.hash.startsWith('#/compare/') ||
    parseResortIdFromHash(window.location.hash)
  ) {
    return VIEW_PATH_MAP.resorts;
  }

  const normalizedPath = getNormalizedPrimaryPath(window.location.pathname);
  if (normalizedPath) {
    return normalizedPath;
  }

  if (window.location.pathname === '/') {
    const queryView = new URLSearchParams(window.location.search).get('view');
    return isView(queryView) ? VIEW_PATH_MAP[queryView] : SEO_PAGES.home.path;
  }

  return '';
};

const normalizePrimaryPathInBrowser = () => {
  const normalizedPath = getNormalizedPrimaryPath(window.location.pathname);
  if (!normalizedPath || normalizedPath === window.location.pathname) {
    return;
  }

  window.history.replaceState(
    window.history.state,
    '',
    `${normalizedPath}${window.location.search}${window.location.hash}`,
  );
};

const setMetaContent = (attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const syncDocumentHead = (page: SeoPageDefinition) => {
  const canonicalUrl = new URL(page.path, CANONICAL_SITE_ORIGIN).toString();
  const imageUrl = new URL(page.image, CANONICAL_SITE_ORIGIN).toString();

  document.title = page.title;
  setMetaContent('name', 'description', page.description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  setMetaContent('property', 'og:type', 'website');
  setMetaContent('property', 'og:site_name', '몰디브 바이블');
  setMetaContent('property', 'og:locale', 'ko_KR');
  setMetaContent('property', 'og:title', page.title);
  setMetaContent('property', 'og:description', page.description);
  setMetaContent('property', 'og:url', canonicalUrl);
  setMetaContent('property', 'og:image', imageUrl);
  setMetaContent('property', 'og:image:secure_url', imageUrl);
  setMetaContent('property', 'og:image:type', 'image/jpeg');
  setMetaContent('property', 'og:image:width', String(page.imageWidth));
  setMetaContent('property', 'og:image:height', String(page.imageHeight));
  setMetaContent('property', 'og:image:alt', page.imageAlt);
  setMetaContent('name', 'twitter:card', 'summary_large_image');
  setMetaContent('name', 'twitter:title', page.title);
  setMetaContent('name', 'twitter:description', page.description);
  setMetaContent('name', 'twitter:image', imageUrl);
  setMetaContent('name', 'twitter:image:alt', page.imageAlt);
};

const resolveImageEditAvailability = (): boolean => {
  const env = ((import.meta as unknown as { env?: ViteEnvShim })?.env) ?? {};
  const isDevMode = env.DEV ?? env.MODE === 'development';
  const servedFromDevServer = Boolean(
    typeof env.VITE_DEV_SERVER_URL === 'string' && env.VITE_DEV_SERVER_URL.length > 0
  );

  return Boolean(isDevMode && servedFromDevServer);
};

const RESORTS_PER_PAGE = 15;
const IS_IMAGE_EDIT_FEATURE_AVAILABLE = resolveImageEditAvailability();

const DEFAULT_FILTERS: Filters = {
  searchTerm: '',
  transportation: [],
  minPrice: 0,
  maxPrice: 50000,
  roomTypes: [],
  minRestaurants: 0,
  hasPrivatePool: false,
  onlyLiked: false,
};

const areFilterValuesEqual = <K extends keyof Filters>(left: Filters[K], right: Filters[K]) => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => item === right[index]);
  }
  return Object.is(left, right);
};

const areFiltersEqual = (left: Filters, right: Filters) =>
  left.searchTerm === right.searchTerm &&
  areFilterValuesEqual(left.transportation, right.transportation) &&
  left.minPrice === right.minPrice &&
  left.maxPrice === right.maxPrice &&
  areFilterValuesEqual(left.roomTypes, right.roomTypes) &&
  left.minRestaurants === right.minRestaurants &&
  left.hasPrivatePool === right.hasPrivatePool &&
  left.onlyLiked === right.onlyLiked;

const parseNumberParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const parseCsvParam = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

const getInitialView = (): View => {
  if (typeof window === 'undefined') {
    return 'tips';
  }

  if (
    getResortPathSegment(window.location.pathname) ||
    window.location.hash.startsWith('#/compare/') ||
    parseResortIdFromHash(window.location.hash)
  ) {
    return 'resorts';
  }

  const pathView = getViewFromPath(window.location.pathname);
  if (pathView) {
    return pathView;
  }

  const queryView = new URLSearchParams(window.location.search).get('view');
  return isView(queryView) ? queryView : 'tips';
};

type ResortPreferences = {
  hidden_ids: number[];
  custom_order: number[];
  deleted_image_urls: string[];
};

type ResortLikesSummary = {
  counts: Record<number, number>;
  likedIds: number[];
};

type ProfileSession = {
  profileId: string;
  token: string;
};

const PROFILE_ID_STORAGE_KEY = 'resortProfileId';
const PROFILE_TOKEN_STORAGE_KEY = 'resortProfileToken';

const buildApiEndpoint = (path: string) => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const fallbackBase = import.meta.env.VITE_PREFERENCES_API_BASE_URL?.replace(/\/$/, '') ?? 'https://maldives-bible.vercel.app';
    return `${fallbackBase}${path}`;
  }

  return path;
};

const PREFERENCES_ENDPOINT = buildApiEndpoint('/api/resort-preferences');
const RESORT_LIKES_ENDPOINT = buildApiEndpoint('/api/resort-likes');
const PROFILE_SESSION_ENDPOINT = buildApiEndpoint('/api/resort-session');

const withProfileTokenHeader = (headers: Record<string, string>, profileToken: string | null) => {
  if (!profileToken) {
    return headers;
  }

  return {
    ...headers,
    'X-Resort-Profile-Token': profileToken,
  };
};

const canUseRemoteStateApi = () => {
  const env = ((import.meta as unknown as { env?: ViteEnvShim })?.env) ?? {};
  if (typeof window === 'undefined') {
    return true;
  }

  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalHost && env.VITE_ENABLE_REMOTE_STATE_IN_DEV !== 'true') {
    return false;
  }

  const isDevMode = env.DEV ?? env.MODE === 'development';
  if (isDevMode && isLocalHost) {
    return false;
  }

  if (typeof env.VITE_PREFERENCES_API_BASE_URL === 'string' && env.VITE_PREFERENCES_API_BASE_URL.length > 0) {
    return true;
  }

  return true;
};

const SHOULD_USE_REMOTE_STATE_API = canUseRemoteStateApi();

function parseJsonSafely<T>(raw: string): T | null {
  if (!raw || raw.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('Failed to parse JSON payload', error);
    return null;
  }
}

const ensureNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<number>();
  const result: number[] = [];

  for (const item of value) {
    const numericValue = typeof item === 'number' ? item : Number(item);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    const normalized = Math.trunc(numericValue);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

const parseNumberArray = (value: string | null): number[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return ensureNumberArray(parsed);
  } catch (err) {
    console.error('Failed to parse number array from localStorage', err);
    return [];
  }
};

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => (typeof item === 'string' ? item : String(item ?? '')).trim())
    .filter(item => item.length > 0);
};

const ensureNumberRecord = (value: unknown): Record<number, number> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const result: Record<number, number> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
    const numericKey = Number(key);
    const numericValue = Number(raw);
    if (Number.isFinite(numericKey) && Number.isFinite(numericValue)) {
      result[numericKey] = Math.max(0, Math.floor(numericValue));
    }
  });

  return result;
};

const createProfileId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and fall back to manual generation
  }

  return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type ResortOverride = {
  imageUrls?: string[];
};

type ToastState = {
  id: number;
  message: string;
};

type UseResortLikesOptions = {
  profileId: string | null;
  profileToken: string | null;
  ensureProfileId: () => string | null;
  saveLikedResorts: (ids: number[]) => void;
};

type UseResortLikesResult = {
  likesCountMap: Record<number, number>;
  likedResortIds: number[];
  pendingLikeResortIds: Set<number>;
  setInitialLikedResorts: (ids: number[]) => void;
  hydrateLikesState: (resorts: Resort[], summary: ResortLikesSummary | null) => void;
  toggleLike: (resortId: number) => Promise<void>;
};

const useResortLikes = ({
  profileId,
  profileToken,
  ensureProfileId,
  saveLikedResorts,
}: UseResortLikesOptions): UseResortLikesResult => {
  const [likesCountMap, setLikesCountMap] = useState<Record<number, number>>({});
  const [likedResortIds, setLikedResortIds] = useState<number[]>([]);
  const [pendingLikeResortIds, setPendingLikeResortIds] = useState<Set<number>>(new Set());

  const setInitialLikedResorts = useCallback(
    (ids: number[]) => {
      const normalized = ensureNumberArray(ids);
      setLikedResortIds(normalized);
      saveLikedResorts(normalized);
    },
    [saveLikedResorts]
  );

  const hydrateLikesState = useCallback(
    (resorts: Resort[], summary: ResortLikesSummary | null) => {
      setLikesCountMap(prev => {
        const next: Record<number, number> = {};

        resorts.forEach(resort => {
          const serverCount = summary?.counts?.[resort.id];
          if (typeof serverCount === 'number' && Number.isFinite(serverCount)) {
            next[resort.id] = Math.max(0, Math.floor(serverCount));
            return;
          }

          const previous = prev[resort.id] ?? 0;
          next[resort.id] = Math.max(0, Math.floor(previous));
        });

        return next;
      });

      if (summary) {
        const normalizedIds = ensureNumberArray(summary.likedIds);
        setLikedResortIds(normalizedIds);
        saveLikedResorts(normalizedIds);
      }
    },
    [saveLikedResorts]
  );

  const toggleLike = useCallback(
    async (resortId: number) => {
      let activeProfileId = profileId;

      if (!activeProfileId) {
        activeProfileId = ensureProfileId();
      }

      if (!activeProfileId || activeProfileId.trim().length === 0) {
        console.warn('좋아요를 업데이트하려면 프로필 ID가 필요합니다.');
        return;
      }

      const normalizedProfileId = activeProfileId.trim();

      if (pendingLikeResortIds.has(resortId)) {
        return;
      }

      const previousLikedIds = ensureNumberArray(likedResortIds);
      const wasLiked = previousLikedIds.includes(resortId);
      const previousCount = likesCountMap[resortId] ?? 0;

      setPendingLikeResortIds(prev => {
        const next = new Set(prev);
        next.add(resortId);
        return next;
      });

      const optimisticLikedIds = wasLiked
        ? likedResortIds.filter(id => id !== resortId)
        : [...likedResortIds, resortId];
      const normalizedOptimisticIds = ensureNumberArray(optimisticLikedIds);

      setLikedResortIds(normalizedOptimisticIds);
      saveLikedResorts(normalizedOptimisticIds);

      setLikesCountMap(prev => {
        const next = { ...prev };
        const updatedCount = Math.max(0, (next[resortId] ?? 0) + (wasLiked ? -1 : 1));
        next[resortId] = updatedCount;
        return next;
      });

      if (!SHOULD_USE_REMOTE_STATE_API || !profileToken) {
        setPendingLikeResortIds(prev => {
          const next = new Set(prev);
          next.delete(resortId);
          return next;
        });
        return;
      }

      try {
        const response = await fetch(RESORT_LIKES_ENDPOINT, {
          method: 'POST',
          headers: withProfileTokenHeader({ 'Content-Type': 'application/json' }, profileToken),
          body: JSON.stringify({ profileId: normalizedProfileId, resortId, liked: !wasLiked }),
        });

        const rawBody = await response.text();

        if (!response.ok) {
          let normalizedMessage = '';
          const parsedError = parseJsonSafely<{ error?: string }>(rawBody);
          if (parsedError?.error && typeof parsedError.error === 'string') {
            normalizedMessage = parsedError.error.trim();
          }

          if (!normalizedMessage && rawBody?.trim()) {
            normalizedMessage = rawBody.trim();
          }

          const error = new Error(
            normalizedMessage || `좋아요 상태를 저장하지 못했습니다. (HTTP ${response.status})`
          ) as Error & { status?: number; responseBody?: string };
          error.status = response.status;
          error.responseBody = rawBody;
          throw error;
        }

        const payload = parseJsonSafely<{ data?: { likesCount?: number; likedIds?: unknown } }>(rawBody);

        const serverCount = payload?.data?.likesCount;
        if (typeof serverCount === 'number' && Number.isFinite(serverCount)) {
          setLikesCountMap(prev => ({
            ...prev,
            [resortId]: Math.max(0, Math.floor(serverCount)),
          }));
        }

        if (payload?.data?.likedIds) {
          const normalized = ensureNumberArray(payload.data.likedIds);
          setLikedResortIds(normalized);
          saveLikedResorts(normalized);
        }
      } catch (err) {
        const errorWithStatus = err as Error & { status?: number };
        const status = typeof errorWithStatus?.status === 'number' ? errorWithStatus.status : null;
        console.error('Failed to update resort like', err);

        if (status !== null && status >= 400) {
          console.warn('Resort like request failed with status:', status);
        }

        setLikedResortIds(previousLikedIds);
        saveLikedResorts(previousLikedIds);

        setLikesCountMap(prev => ({
          ...prev,
          [resortId]: previousCount,
        }));
      } finally {
        setPendingLikeResortIds(prev => {
          const next = new Set(prev);
          next.delete(resortId);
          return next;
        });
      }
    },
    [
      profileId,
      likedResortIds,
      likesCountMap,
      pendingLikeResortIds,
      profileToken,
      saveLikedResorts,
      ensureProfileId,
    ]
  );

  return {
    likesCountMap,
    likedResortIds,
    pendingLikeResortIds,
    setInitialLikedResorts,
    hydrateLikesState,
    toggleLike,
  };
};

const App: React.FC = () => {
  const canUseImageEditMode = IS_IMAGE_EDIT_FEATURE_AVAILABLE;
  const [initialResorts, setInitialResorts] = useState<Resort[]>([]);
  const [displayedResorts, setDisplayedResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isQueryHydrated, setIsQueryHydrated] = useState<boolean>(false);
  const [selectedResortId, setSelectedResortId] = useState<number | null>(null);
  const previousSelectedResortIdRef = useRef<number | null>(null);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [isCompareViewVisible, setIsCompareViewVisible] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [activeSeoPageKey, setActiveSeoPageKey] = useState<SeoPageKey | null>(
    getSeoPageKeyFromLocation,
  );
  const [activeNavigationPath, setActiveNavigationPath] = useState<string>(
    getActiveNavigationPath,
  );
  const [resortReloadKey, setResortReloadKey] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const filterDialogRef = useRef<HTMLDivElement>(null);
  const filterPreviousFocusRef = useRef<HTMLElement | null>(null);
  const resortSearchRef = useRef<HTMLInputElement>(null);
  const [isImageEditMode, setIsImageEditMode] = useState<boolean>(false);
  const [previousSortOption, setPreviousSortOption] = useState<SortOption>('popularity');
  const [customOrder, setCustomOrder] = useState<number[]>([]);
  const [hiddenResortIds, setHiddenResortIds] = useState<number[]>([]);
  const [, setDeletedImageUrls] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);
  const toastIdRef = useRef(0);
  const [isSharePending, setIsSharePending] = useState(false);
  const sharePendingRef = useRef(false);
  const [, setResortOverrides] = useState<Record<number, ResortOverride>>({});
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileToken, setProfileToken] = useState<string | null>(null);

  const syncRoutePresentation = useCallback(() => {
    normalizePrimaryPathInBrowser();
    setActiveSeoPageKey(getSeoPageKeyFromLocation());
    setActiveNavigationPath(getActiveNavigationPath());
  }, []);

  useEffect(() => {
    if (!activeSeoPageKey) {
      return;
    }

    syncDocumentHead(SEO_PAGES[activeSeoPageKey]);
  }, [activeSeoPageKey]);

  const showToast = useCallback((message: string) => {
    toastIdRef.current += 1;
    setToastMessage({ id: toastIdRef.current, message });
  }, []);

  const persistProfileSession = useCallback((nextProfileId: string, nextProfileToken: string | null) => {
    const normalizedProfileId = nextProfileId.trim();
    if (!normalizedProfileId) {
      return null;
    }

    try {
      localStorage.setItem(PROFILE_ID_STORAGE_KEY, normalizedProfileId);
      if (nextProfileToken) {
        localStorage.setItem(PROFILE_TOKEN_STORAGE_KEY, nextProfileToken);
      } else {
        localStorage.removeItem(PROFILE_TOKEN_STORAGE_KEY);
      }
    } catch (err) {
      console.error('프로필 세션을 로컬 스토리지에 저장하지 못했습니다.', err);
    }

    setProfileId(normalizedProfileId);
    setProfileToken(nextProfileToken);
    return normalizedProfileId;
  }, []);

  const ensureProfileId = useCallback((): string | null => {
    if (profileId && profileId.trim().length > 0) {
      return profileId;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const storedProfileId = localStorage.getItem(PROFILE_ID_STORAGE_KEY);
    if (storedProfileId && storedProfileId.trim().length > 0) {
      const storedProfileToken = localStorage.getItem(PROFILE_TOKEN_STORAGE_KEY);
      setProfileId(storedProfileId);
      setProfileToken(storedProfileToken);
      return storedProfileId;
    }

    const generated = createProfileId();
    return persistProfileSession(generated, null);
  }, [persistProfileSession, profileId]);

  const ensureProfileSession = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (profileId && (!SHOULD_USE_REMOTE_STATE_API || profileToken)) {
      return profileId;
    }

    const storedProfileId = localStorage.getItem(PROFILE_ID_STORAGE_KEY);
    const storedProfileToken = localStorage.getItem(PROFILE_TOKEN_STORAGE_KEY);
    if (storedProfileId && (!SHOULD_USE_REMOTE_STATE_API || storedProfileToken)) {
      return persistProfileSession(storedProfileId, storedProfileToken);
    }

    if (SHOULD_USE_REMOTE_STATE_API) {
      try {
        const response = await fetch(PROFILE_SESSION_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to create profile session: ${response.status}`);
        }

        const payload = (await response.json()) as { data?: Partial<ProfileSession> };
        const nextProfileId = payload.data?.profileId;
        const nextProfileToken = payload.data?.token;
        if (typeof nextProfileId === 'string' && typeof nextProfileToken === 'string') {
          return persistProfileSession(nextProfileId, nextProfileToken);
        }
      } catch (err) {
        console.warn('원격 프로필 세션을 만들지 못해 로컬 저장으로 전환합니다.', err);
      }
    }

    if (storedProfileId) {
      return persistProfileSession(storedProfileId, null);
    }

    const generated = createProfileId();
    return persistProfileSession(generated, null);
  }, [persistProfileSession, profileId, profileToken]);

  const getLocalPreferences = useCallback((): ResortPreferences => ({
    hidden_ids: parseNumberArray(localStorage.getItem('hiddenResorts')),
    custom_order: parseNumberArray(localStorage.getItem('resortOrder')),
    deleted_image_urls: [],
  }), []);

  const savePreferencesToLocal = useCallback((hiddenIds: number[], order: number[]) => {
    localStorage.setItem('hiddenResorts', JSON.stringify(hiddenIds));
    localStorage.setItem('resortOrder', JSON.stringify(order));
  }, []);

  const saveLikedResortsToLocal = useCallback((likedIds: number[]) => {
    localStorage.setItem('likedResorts', JSON.stringify(likedIds));
  }, []);

  const {
    likesCountMap,
    likedResortIds,
    pendingLikeResortIds,
    setInitialLikedResorts,
    hydrateLikesState,
    toggleLike,
  } = useResortLikes({
    profileId,
    profileToken,
    ensureProfileId,
    saveLikedResorts: saveLikedResortsToLocal,
  });

  const interestCountMap = useMemo<Record<number, number>>(() => {
    const next: Record<number, number> = {};
    initialResorts.forEach(resort => {
      const baseline = RESORT_INTEREST_BASELINE[resort.id] ?? 0;
      const liveLikes = likesCountMap[resort.id] ?? 0;
      next[resort.id] = Math.max(0, baseline + liveLikes);
    });
    return next;
  }, [initialResorts, likesCountMap]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const isCaptureMode = new URLSearchParams(window.location.search).get('capture') === '1';
    document.documentElement.classList.toggle('capture-board-mode', isCaptureMode);
    return () => {
      document.documentElement.classList.remove('capture-board-mode');
    };
  }, []);

  useEffect(() => {
    if (!isFilterOpen || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const dialog = filterDialogRef.current;
    const restoreFilterFocus = () => {
      const previousFocus = filterPreviousFocusRef.current;
      const trigger = filterTriggerRef.current;
      const focusTarget = previousFocus?.isConnected && previousFocus.getClientRects().length > 0
        ? previousFocus
        : trigger?.getClientRects().length
          ? trigger
          : resortSearchRef.current;
      focusTarget?.focus();
      filterPreviousFocusRef.current = null;
    };
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const getFocusableElements = () =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
            element => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true'
          )
        : [];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsFilterOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (activeElement === lastElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsFilterOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    const firstFocusableElement = getFocusableElements()[0];
    (firstFocusableElement ?? dialog)?.focus();
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      restoreFilterFocus();
    };
  }, [isFilterOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    void ensureProfileSession();

    const localLikes = parseNumberArray(localStorage.getItem('likedResorts'));
    if (localLikes.length > 0) {
      setInitialLikedResorts(localLikes);
    }
  }, [ensureProfileSession, setInitialLikedResorts]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const fetchRemotePreferences = useCallback(async (activeProfileId: string | null): Promise<ResortPreferences | null> => {
    if (!activeProfileId || !SHOULD_USE_REMOTE_STATE_API || !profileToken) {
      return null;
    }

    try {
      const response = await fetch(`${PREFERENCES_ENDPOINT}?profileId=${encodeURIComponent(activeProfileId)}`, {
        headers: withProfileTokenHeader({ Accept: 'application/json' }, profileToken),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      const payload = (await response.json()) as { data?: Partial<ResortPreferences> };
      const data = payload?.data ?? {};

      return {
        hidden_ids: ensureNumberArray((data as ResortPreferences).hidden_ids),
        custom_order: ensureNumberArray((data as ResortPreferences).custom_order),
        deleted_image_urls: ensureStringArray((data as ResortPreferences).deleted_image_urls),
      };
    } catch (err) {
      console.warn('Failed to fetch remote resort preferences; using local preferences instead', err);
      return null;
    }
  }, [profileToken]);

  const persistPreferences = useCallback(
    async (hiddenIds: number[], order: number[], deletedUrls?: string[]) => {
      savePreferencesToLocal(hiddenIds, order);

      if (!profileId || !SHOULD_USE_REMOTE_STATE_API || !profileToken) {
        return;
      }

      try {
        const response = await fetch(PREFERENCES_ENDPOINT, {
          method: 'PUT',
          headers: withProfileTokenHeader({ 'Content-Type': 'application/json' }, profileToken),
          body: JSON.stringify({
            profileId,
            hiddenIds,
            customOrder: order,
            deletedImageUrls: ensureStringArray(deletedUrls),
          }),
        });

        if (!response.ok) {
          const rawMessage = await response.text();
          let normalizedMessage = rawMessage?.trim();

          if (normalizedMessage) {
            try {
              const parsed = JSON.parse(normalizedMessage) as { error?: unknown };
              if (parsed && typeof parsed.error === 'string') {
                normalizedMessage = parsed.error;
              }
            } catch {
              // ignore JSON parse failure – we'll use the raw text message instead
            }
          }

          if (!normalizedMessage) {
            normalizedMessage = `변경 사항 저장에 실패했습니다. (HTTP ${response.status})`;
          }

          throw new Error(normalizedMessage);
        }
      } catch (err) {
        console.error('Failed to sync resort preferences', err);
        const fallbackMessage =
          err instanceof Error && err.message
            ? err.message
            : '변경 사항을 저장하지 못했습니다. 네트워크 상태를 확인해주세요.';
        showToast(fallbackMessage);
      }
    },
    [profileId, profileToken, savePreferencesToLocal, showToast]
  );

  const fetchRemoteLikes = useCallback(async (activeProfileId: string | null): Promise<ResortLikesSummary | null> => {
    if (!activeProfileId || !SHOULD_USE_REMOTE_STATE_API || !profileToken) {
      return null;
    }

    try {
      const response = await fetch(`${RESORT_LIKES_ENDPOINT}?profileId=${encodeURIComponent(activeProfileId)}`, {
        headers: withProfileTokenHeader({ Accept: 'application/json' }, profileToken),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch likes: ${response.statusText}`);
      }

      const payload = (await response.json()) as {
        data?: Partial<ResortLikesSummary> & { storage?: string };
      };
      if (payload.data?.storage === 'local') {
        return null;
      }
      const data = payload?.data ?? {};
      if (!data.counts && !data.likedIds) {
        return null;
      }

      return {
        counts: ensureNumberRecord(data.counts),
        likedIds: ensureNumberArray((data as ResortLikesSummary).likedIds),
      };
    } catch (err) {
      console.warn('Failed to fetch resort likes; using local likes instead', err);
      return null;
    }
  }, [profileToken]);

  const syncRemoteLikedResorts = useCallback(
    async (
      activeProfileId: string | null,
      likedIds: number[],
    ): Promise<ResortLikesSummary | null> => {
      if (!activeProfileId || !SHOULD_USE_REMOTE_STATE_API || !profileToken) {
        return null;
      }

      try {
        const response = await fetch(RESORT_LIKES_ENDPOINT, {
          method: 'PUT',
          headers: withProfileTokenHeader({ 'Content-Type': 'application/json' }, profileToken),
          body: JSON.stringify({ profileId: activeProfileId, likedIds }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync likes: ${response.statusText}`);
        }

        const payload = (await response.json()) as { data?: Partial<ResortLikesSummary> };
        if (!payload.data?.counts || !payload.data?.likedIds) {
          return null;
        }

        return {
          counts: ensureNumberRecord(payload.data.counts),
          likedIds: ensureNumberArray(payload.data.likedIds),
        };
      } catch (err) {
        console.warn('Failed to sync local resort likes to Supabase', err);
        return null;
      }
    },
    [profileToken],
  );


  useEffect(() => {
    if (!profileId) {
      return;
    }

    const fetchResorts = async () => {
      try {
        setLoading(true);
        setError(null);

        const basePath = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
        const resortFileUrls = Array.from({ length: 9 }, (_, i) => {
          const fileName = `resorts${i === 0 ? '' : i + 1}.json`;
          const url = `${basePath}/api/${fileName}`;
          return url.startsWith('/') ? url : `/${url}`;
        });
        const reviewInsightsPath = `${basePath}/api/resort-review-insights.json`;
        const reviewInsightsUrl = reviewInsightsPath.startsWith('/')
          ? reviewInsightsPath
          : `/${reviewInsightsPath}`;

        const reviewInsightsPromise = fetch(reviewInsightsUrl)
          .then(async response => {
            if (response.status === 404) return null;
            if (!response.ok) {
              throw new Error(`${response.status} ${response.statusText}`.trim());
            }
            return (await response.json()) as ResortReviewInsightsPayload;
          })
          .catch(err => {
            console.warn('Failed to fetch optional resort review insights', err);
            return null;
          });
        const resortResults = await Promise.allSettled(
          resortFileUrls.map(async url => {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`${response.status} ${response.statusText}`.trim());
            }

            const payload = await response.json();
            if (!Array.isArray(payload)) {
              throw new Error('잘못된 리조트 데이터 형식');
            }
            return payload as Resort[];
          })
        );
        const resortsDataArrays = resortResults.flatMap(result =>
          result.status === 'fulfilled' ? [result.value] : []
        );

        if (resortsDataArrays.length === 0) {
          throw new Error('리조트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        if (resortsDataArrays.length < resortFileUrls.length) {
          showToast('일부 정보를 불러오지 못했습니다. 새로고침하면 다시 확인할 수 있습니다.');
        }

        const combinedData = resortsDataArrays.flat();
        const storedOverrides =
          parseJsonSafely<Record<string, ResortOverride>>(
            localStorage.getItem('resortOverrides') || '{}'
          ) ?? {};
        const normalizedOverrides: Record<number, ResortOverride> = {};

        Object.entries(storedOverrides).forEach(([key, value]) => {
          const resortId = Number(key);
          if (!Number.isFinite(resortId) || !value || typeof value !== 'object') {
            return;
          }

          const cleanedOverride: ResortOverride = {};
          if (Array.isArray(value.imageUrls)) {
            cleanedOverride.imageUrls = value.imageUrls.filter(
              (url): url is string => typeof url === 'string'
            );
          }

          if (cleanedOverride.imageUrls && cleanedOverride.imageUrls.length === 0) {
            cleanedOverride.imageUrls = [];
          }

          if (cleanedOverride.imageUrls !== undefined) {
            normalizedOverrides[resortId] = cleanedOverride;
          }
        });

        setResortOverrides(normalizedOverrides);
        localStorage.setItem('resortOverrides', JSON.stringify(normalizedOverrides));

        const mergedData = combinedData.map(resort => ({
          ...resort,
          ...(normalizedOverrides[resort.id] || {}),
        }));

        const localPreferences = getLocalPreferences();
        const resortIds = mergedData.map(resort => resort.id);
        const resortIdSet = new Set(resortIds);
        const validLocalLikedIds = parseNumberArray(localStorage.getItem('likedResorts'))
          .filter(id => resortIdSet.has(id));
        const [remotePreferences, fetchedRemoteLikes] = await Promise.all([
          fetchRemotePreferences(profileId),
          fetchRemoteLikes(profileId),
        ]);
        let remoteLikes = fetchedRemoteLikes;

        if (remoteLikes && validLocalLikedIds.length > 0) {
          const remoteLikedIdSet = new Set(remoteLikes.likedIds);
          const missingLocalLikedIds = validLocalLikedIds.filter(id => !remoteLikedIdSet.has(id));
          if (missingLocalLikedIds.length > 0) {
            const syncedLikes = await syncRemoteLikedResorts(profileId, validLocalLikedIds);
            remoteLikes = syncedLikes ?? {
              counts: remoteLikes.counts,
              likedIds: Array.from(new Set([...remoteLikes.likedIds, ...validLocalLikedIds])),
            };
          }
        }

        if (remotePreferences) {
          setDeletedImageUrls(remotePreferences.deleted_image_urls);
        }

        const mergedHiddenIds = Array.from(
          new Set([
            ...(remotePreferences?.hidden_ids ?? []),
            ...localPreferences.hidden_ids,
          ])
        );

        const validHiddenIds = mergedHiddenIds.filter(id => resortIdSet.has(id));
        const hiddenSet = new Set(validHiddenIds);

        const baseOrder = remotePreferences && remotePreferences.custom_order.length > 0
          ? remotePreferences.custom_order
          : localPreferences.custom_order;

        const sanitizedOrder = baseOrder.filter(id => resortIdSet.has(id) && !hiddenSet.has(id));
        const orderSet = new Set(sanitizedOrder);
        const missingIds = resortIds.filter(id => !orderSet.has(id) && !hiddenSet.has(id));
        const finalOrder = [...sanitizedOrder, ...missingIds];

        savePreferencesToLocal(validHiddenIds, finalOrder);

        hydrateLikesState(mergedData, remoteLikes);

        setHiddenResortIds(validHiddenIds);
        setCustomOrder(finalOrder);
        setInitialResorts(mergedData);

        void reviewInsightsPromise.then(reviewInsights => {
          const reviewSummaryByResortId = new Map(
            (Array.isArray(reviewInsights?.items) ? reviewInsights.items : [])
              .filter(item => Number.isInteger(item?.resortId) && item?.reviewSummary)
              .map(item => [item.resortId, item.reviewSummary] as const)
          );
          if (reviewSummaryByResortId.size === 0) return;

          setInitialResorts(currentResorts => currentResorts.map(resort => ({
            ...resort,
            ...(reviewSummaryByResortId.has(resort.id)
              ? { reviewSummary: reviewSummaryByResortId.get(resort.id) }
              : {}),
          })));
        });
      } catch (err) {
        console.error(err);
        setError('리조트 정보를 표시하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchResorts();
  }, [
    fetchRemoteLikes,
    fetchRemotePreferences,
    getLocalPreferences,
    hydrateLikesState,
    profileId,
    resortReloadKey,
    savePreferencesToLocal,
    showToast,
    syncRemoteLikedResorts,
  ]);

  useEffect(() => {
    const handleHashChange = () => {
      syncRoutePresentation();
      const hasCompareHash = window.location.hash.startsWith('#/compare/');
      const compareSlugs = parseCompareSlugsFromHash(window.location.hash);

      if (hasCompareHash) {
        setCurrentView('resorts');
        setSelectedResortId(null);

        if (compareSlugs.length === 0) {
          setCompareList([]);
          setIsCompareViewVisible(false);
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          syncRoutePresentation();
          return;
        }

        if (initialResorts.length === 0) {
          setIsCompareViewVisible(false);
          return;
        }

        const resortBySlug = new Map(initialResorts.map(resort => [getResortSlug(resort), resort] as const));
        const matchedResorts = compareSlugs.map(slug => resortBySlug.get(slug)).filter((resort): resort is Resort => Boolean(resort));
        const matchedIds = matchedResorts.map(resort => resort.id);

        setCompareList(matchedIds);
        if (matchedResorts.length >= 2) {
          setIsCompareViewVisible(true);
          const canonicalHash = buildCompareHash(matchedResorts);
          if (window.location.hash !== canonicalHash) {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${canonicalHash}`);
          }
          window.scrollTo(0, 0);
        } else {
          setIsCompareViewVisible(false);
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          syncRoutePresentation();
        }
        return;
      }

      setIsCompareViewVisible(false);
      const hashResortId = parseResortIdFromHash(window.location.hash);
      if (hashResortId) {
        setCurrentView('resorts');
        setSelectedResortId(hashResortId);
        window.scrollTo(0, 0);
        return;
      }

      if (!getSlugFromPath(window.location.pathname)) {
        setSelectedResortId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    handleHashChange(); // 초기 로드 시에도 해시를 확인합니다.

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [initialResorts, syncRoutePresentation]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncFromPath = () => {
      syncRoutePresentation();

      if (window.location.hash.startsWith('#/compare/')) {
        setCurrentView('resorts');
        setSelectedResortId(null);
        return;
      }

      const pathname = window.location.pathname;
      const segment = getResortPathSegment(pathname);
      const slug = segment ? normalizeSlug(segment) : null;
      const hashResortId = parseResortIdFromHash(window.location.hash);
      const pathView = getViewFromPath(pathname);

      if (initialResorts.length === 0) {
        if (hashResortId) {
          setCurrentView('resorts');
          setSelectedResortId(hashResortId);
        } else if (pathView) {
          setCurrentView(pathView);
        } else if (!segment) {
          const queryView = new URLSearchParams(window.location.search).get('view');
          setCurrentView(isView(queryView) ? queryView : 'tips');
        }
        return;
      }

      if (slug) {
        const matched = initialResorts.find(resort => getResortSlug(resort) === slug);
        if (matched) {
          setCurrentView('resorts');
          setSelectedResortId(matched.id);
          window.scrollTo(0, 0);
          return;
        }
      }

      if (segment) {
        const numericSegment = Number(segment);
        if (Number.isFinite(numericSegment)) {
          const matchedById = initialResorts.find(resort => resort.id === numericSegment);
          if (matchedById) {
            setCurrentView('resorts');
            setSelectedResortId(matchedById.id);
            const matchedSlug = getResortSlug(matchedById);
            if (matchedSlug) {
              const queryString = window.location.search;
              const nextUrl = `/resorts/${matchedSlug}/${queryString}`;
              window.history.replaceState(null, '', nextUrl);
            }
            window.scrollTo(0, 0);
            return;
          }
        }
      }

      if (hashResortId) {
        setCurrentView('resorts');
        setSelectedResortId(hashResortId);
        const matchedById = initialResorts.find(resort => resort.id === hashResortId);
        if (matchedById) {
          const matchedSlug = getResortSlug(matchedById);
          if (matchedSlug) {
            const queryString = window.location.search;
            const nextUrl = `/resorts/${matchedSlug}/${queryString}`;
            window.history.replaceState(null, '', nextUrl);
          }
        }
        window.scrollTo(0, 0);
        return;
      }

      setSelectedResortId(null);
      if (pathView) {
        setCurrentView(pathView);
        return;
      }

      const queryView = new URLSearchParams(window.location.search).get('view');
      setCurrentView(isView(queryView) ? queryView : 'tips');
    };

    const handlePopState = () => {
      syncFromPath();
    };

    window.addEventListener('popstate', handlePopState);
    syncFromPath();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [initialResorts, syncRoutePresentation]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!selectedResortId) {
      const currentSlug = getSlugFromPath(window.location.pathname);
      const wasSelected = previousSelectedResortIdRef.current;
      previousSelectedResortIdRef.current = selectedResortId ?? null;
      if (currentSlug && wasSelected) {
        const queryString = window.location.search;
        window.history.replaceState(null, '', `${VIEW_PATH_MAP.resorts}${queryString}`);
        syncRoutePresentation();
      }
      return;
    }

    const resort = initialResorts.find(item => item.id === selectedResortId);
    if (!resort) {
      previousSelectedResortIdRef.current = selectedResortId ?? null;
      return;
    }

    const slug = getResortSlug(resort);
    if (!slug) {
      previousSelectedResortIdRef.current = selectedResortId ?? null;
      return;
    }

    const queryString = window.location.search;
    const expectedPath = `/resorts/${slug}/`;
    const nextUrl = `${expectedPath}${queryString}`;

    if (window.location.pathname !== expectedPath || window.location.hash) {
      window.history.replaceState(null, '', nextUrl);
    }
    previousSelectedResortIdRef.current = selectedResortId ?? null;
  }, [initialResorts, selectedResortId, syncRoutePresentation]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const parsedMinPrice = clampNumber(
      parseNumberParam(params.get('min'), DEFAULT_FILTERS.minPrice),
      DEFAULT_FILTERS.minPrice,
      DEFAULT_FILTERS.maxPrice
    );
    const parsedMaxPrice = clampNumber(
      parseNumberParam(params.get('max'), DEFAULT_FILTERS.maxPrice),
      DEFAULT_FILTERS.minPrice,
      DEFAULT_FILTERS.maxPrice
    );
    const validTransportation = parseCsvParam(params.get('t')).filter(
      (item): item is TransportationType =>
        Object.values(TransportationType).includes(item as TransportationType)
    );
    const validRoomTypes = parseCsvParam(params.get('room')).filter(
      (item): item is Filters['roomTypes'][number] =>
        VALID_ROOM_TYPES.includes(item as Filters['roomTypes'][number])
    );
    const parsedFilters: Filters = {
      ...DEFAULT_FILTERS,
      searchTerm: (params.get('q') ?? DEFAULT_FILTERS.searchTerm).slice(0, 120),
      transportation: validTransportation,
      minPrice: Math.min(parsedMinPrice, parsedMaxPrice),
      maxPrice: Math.max(parsedMinPrice, parsedMaxPrice),
      roomTypes: validRoomTypes,
      minRestaurants: Math.trunc(clampNumber(
        parseNumberParam(params.get('rest'), DEFAULT_FILTERS.minRestaurants),
        0,
        15
      )),
      hasPrivatePool: params.get('pool') === '1',
      onlyLiked: params.get('liked') === '1',
    };

    setFilters(parsedFilters);

    const sort = params.get('sort');
    if (isSortOption(sort)) {
      setSortOption(sort);
    }

    const view = params.get('view');
    const pathView = getViewFromPath(window.location.pathname);
    if (getResortPathSegment(window.location.pathname)) {
      setCurrentView('resorts');
    } else if (pathView) {
      setCurrentView(pathView);
    } else if (isView(view)) {
      setCurrentView(view);
    }

    const page = Math.trunc(clampNumber(parseNumberParam(params.get('page'), 1), 1, 10000));
    setCurrentPage(page);

    setIsQueryHydrated(true);
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    let processedResorts = [...initialResorts];
    const hiddenSet = new Set(hiddenResortIds);
    const likedSet = new Set(likedResortIds);

    processedResorts = processedResorts.filter(resort => !hiddenSet.has(resort.id));

    // Filtering logic...
    if (filters.searchTerm) {
      processedResorts = processedResorts.filter(resort =>
        resort.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        resort.name_en.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.transportation.length > 0) {
      processedResorts = processedResorts.filter(resort =>
        filters.transportation.includes(resort.transportation)
      );
    }
    processedResorts = processedResorts.filter(
      resort => resort.price >= filters.minPrice && resort.price <= filters.maxPrice
    );
    if (filters.roomTypes.length > 0) {
      processedResorts = processedResorts.filter(resort =>
        filters.roomTypes.every(type => {
          if (type === 'beach') return resort.hasBeachVilla;
          if (type === 'water') return resort.hasWaterVilla;
          return false;
        })
      );
    }
    if (filters.hasPrivatePool) {
      processedResorts = processedResorts.filter(resort => resort.hasPrivatePool);
    }
    processedResorts = processedResorts.filter(resort => resort.restaurants >= filters.minRestaurants);
    if (filters.onlyLiked) {
      processedResorts = processedResorts.filter(resort => likedSet.has(resort.id));
    }

    // 이미지 유무는 사용자가 고른 정렬 기준이 같은 경우에만 보조 기준으로 사용합니다.
    if (sortOption !== 'custom') {
      processedResorts.sort(
        (a, b) => Number(hasDisplayableResortImage(b)) - Number(hasDisplayableResortImage(a))
      );
    }

    // Sorting logic...
    switch (sortOption) {
      case 'custom': {
        if (customOrder.length > 0) {
          const orderMap = new Map(customOrder.map((id, index) => [id, index]));
          processedResorts.sort((a, b) => {
            const indexA = orderMap.get(a.id);
            const indexB = orderMap.get(b.id);

            if (indexA === undefined && indexB === undefined) return a.id - b.id;
            if (indexA === undefined) return 1;
            if (indexB === undefined) return -1;
            return indexA - indexB;
          });
        }
        break;
      }
      case 'popularity':
        processedResorts.sort((a, b) => {
          const rankA = POPULARITY_RANKING.indexOf(a.name);
          const rankB = POPULARITY_RANKING.indexOf(b.name);

          if (rankA !== -1 && rankB !== -1) return rankA - rankB;
          if (rankA !== -1) return -1;
          if (rankB !== -1) return 1;
          return a.id - b.id; // Fallback for unranked items
        });
        break;
      case 'price-asc': processedResorts.sort((a, b) => a.price - b.price); break;
      case 'price-desc': processedResorts.sort((a, b) => b.price - a.price); break;
      case 'rating-desc': processedResorts.sort((a, b) => b.rating - a.rating); break;
      case 'snorkeling-desc': processedResorts.sort((a, b) => b.snorkelingQuality - a.snorkelingQuality); break;
      case 'travelTime-asc': processedResorts.sort((a, b) => a.travelTime - b.travelTime); break;
      case 'likes-desc':
        processedResorts.sort((a, b) => {
          const likesA = interestCountMap[a.id] ?? 0;
          const likesB = interestCountMap[b.id] ?? 0;
          if (likesA === likesB) {
            return a.id - b.id;
          }
          return likesB - likesA;
        });
        break;
    }

    setDisplayedResorts(processedResorts);
  }, [customOrder, filters, hiddenResortIds, initialResorts, interestCountMap, likedResortIds, sortOption]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  useEffect(() => {
    if (!isQueryHydrated || typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams();
    if (filters.searchTerm.trim().length > 0) {
      params.set('q', filters.searchTerm.trim());
    }
    if (filters.transportation.length > 0) {
      params.set('t', filters.transportation.join(','));
    }
    if (filters.minPrice !== DEFAULT_FILTERS.minPrice) {
      params.set('min', String(filters.minPrice));
    }
    if (filters.maxPrice !== DEFAULT_FILTERS.maxPrice) {
      params.set('max', String(filters.maxPrice));
    }
    if (filters.roomTypes.length > 0) {
      params.set('room', filters.roomTypes.join(','));
    }
    if (filters.minRestaurants !== DEFAULT_FILTERS.minRestaurants) {
      params.set('rest', String(filters.minRestaurants));
    }
    if (filters.hasPrivatePool) {
      params.set('pool', '1');
    }
    if (filters.onlyLiked) {
      params.set('liked', '1');
    }
    if (sortOption !== 'popularity') {
      params.set('sort', sortOption);
    }
    const isPrimaryPage = Boolean(getNormalizedPrimaryPath(window.location.pathname));
    const legacyView = new URLSearchParams(window.location.search).get('view');
    const shouldKeepLegacyView = window.location.pathname === '/' && isView(legacyView);
    if (
      !isPrimaryPage &&
      !getResortPathSegment(window.location.pathname) &&
      (currentView !== 'tips' || shouldKeepLegacyView)
    ) {
      params.set('view', currentView);
    }
    if (currentPage !== 1 && !getResortPathSegment(window.location.pathname)) {
      params.set('page', String(currentPage));
    }

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [filters, sortOption, currentView, currentPage, isQueryHydrated]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isCompareViewVisible || initialResorts.length === 0) {
      return;
    }

    const resortById = new Map(initialResorts.map(resort => [resort.id, resort] as const));
    const selectedResorts = compareList.map(id => resortById.get(id)).filter((resort): resort is Resort => Boolean(resort));

    if (selectedResorts.length < 2) {
      setIsCompareViewVisible(false);
      if (window.location.hash.startsWith('#/compare/')) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
      return;
    }

    const expectedHash = buildCompareHash(selectedResorts);
    if (expectedHash && window.location.hash !== expectedHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${expectedHash}`);
    }
  }, [compareList, initialResorts, isCompareViewVisible]);

  const selectedResort = initialResorts.find(r => r.id === selectedResortId);
  const calculatedTotalPages = displayedResorts.length === 0
    ? 0
    : Math.ceil(displayedResorts.length / RESORTS_PER_PAGE);

  const paginatedResorts = isImageEditMode
    ? displayedResorts
    : calculatedTotalPages === 0
      ? []
      : displayedResorts.slice(
          (currentPage - 1) * RESORTS_PER_PAGE,
          currentPage * RESORTS_PER_PAGE
        );

  const totalPages = isImageEditMode
    ? (displayedResorts.length > 0 ? 1 : 0)
    : calculatedTotalPages;

  const performShare = async (payload: ShareData, label: string) => {
    if (sharePendingRef.current) {
      return;
    }

    sharePendingRef.current = true;
    setIsSharePending(true);
    try {
      const result: ShareResult = await shareOrCopy(payload);
      if (result.status === 'shared') {
        showToast(`${label} 공유를 완료했습니다.`);
      } else if (result.status === 'copied') {
        showToast(`${label} 링크를 복사했습니다.`);
      } else if (result.status === 'failed') {
        showToast('공유 링크를 만들지 못했습니다. 다시 시도해 주세요.');
      }
    } finally {
      sharePendingRef.current = false;
      setIsSharePending(false);
    }
  };

  const handleShareResort = (resort: Resort) => {
    const slug = getResortSlug(resort);
    if (!slug) {
      showToast('이 리조트의 공유 링크를 만들지 못했습니다.');
      return;
    }

    const url = new URL(`/resorts/${slug}/`, CANONICAL_SITE_ORIGIN).toString();
    void performShare(
      {
        title: `몰디브 바이블 | ${resort.name}`,
        text: `${resort.name} 리조트 정보를 확인해 보세요.`,
        url,
      },
      resort.name,
    );
  };

  const handleShareComparison = () => {
    const resortById = new Map(initialResorts.map(resort => [resort.id, resort] as const));
    const selectedResorts = compareList.map(id => resortById.get(id)).filter((resort): resort is Resort => Boolean(resort));
    const compareHash = buildCompareHash(selectedResorts);

    if (selectedResorts.length < 2 || !compareHash) {
      showToast('비교할 리조트를 2개 이상 선택해 주세요.');
      return;
    }

    const url = new URL(VIEW_PATH_MAP.resorts, CANONICAL_SITE_ORIGIN);
    url.hash = compareHash.slice(1);
    void performShare(
      {
        title: '몰디브 바이블 | 리조트 비교',
        text: `${selectedResorts.map(resort => resort.name).join(', ')} 비교 결과를 확인해 보세요.`,
        url: url.toString(),
      },
      '비교 결과',
    );
  };

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (selectedResortId && initialResorts.length > 0 && !selectedResort) {
      window.location.hash = '';
    }
  }, [selectedResortId, initialResorts, selectedResort]);

  const handleSearchChange = (term: string) => {
    if (filters.searchTerm === term) {
      return;
    }
    setFilters(prev => ({ ...prev, searchTerm: term }));
    setCurrentPage(1);
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    if (areFilterValuesEqual(filters[key], value)) {
      return;
    }
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    if (areFiltersEqual(filters, DEFAULT_FILTERS) && sortOption === 'popularity') {
      return;
    }
    setFilters({ ...DEFAULT_FILTERS });
    setSortOption('popularity');
    setCurrentPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    if (sortOption === option) {
      return;
    }
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsCompareViewVisible(false);
    setSelectedResortId(null);
    if (typeof window !== 'undefined') {
      const destination = VIEW_PATH_MAP[view];
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentUrl !== destination) {
        window.history.pushState(window.history.state, '', destination);
      }
      setActiveSeoPageKey(VIEW_SEO_PAGE_MAP[view]);
      setActiveNavigationPath(destination);
    }
    setCurrentPage(1);
  };

  const handleShowResorts = () => {
    handleViewChange('resorts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowQuoteFromFlights = () => {
    handleViewChange('agencies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBackToList = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('view');
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    } else {
      params.delete('page');
    }
    const queryString = params.toString();
    setSelectedResortId(null);
    setCurrentView('resorts');
    window.history.replaceState(
      window.history.state,
      '',
      `${VIEW_PATH_MAP.resorts}${queryString ? `?${queryString}` : ''}`,
    );
    setActiveSeoPageKey('resortComparison');
    setActiveNavigationPath(VIEW_PATH_MAP.resorts);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFilter = () => {
    filterPreviousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : filterTriggerRef.current;
    setIsFilterOpen(true);
  };

  const handleViewDetails = (resortId: number) => {
    setIsCompareViewVisible(false);
    setCurrentView('resorts');
    setSelectedResortId(resortId);
    if (typeof window !== 'undefined') {
      const resort = initialResorts.find(item => item.id === resortId);
      const slug = resort ? getResortSlug(resort) : null;
      if (slug) {
        const detailParams = new URLSearchParams(window.location.search);
        detailParams.delete('view');
        detailParams.delete('page');
        const detailQuery = detailParams.toString();
        window.history.pushState(
          null,
          '',
          `/resorts/${slug}/${detailQuery ? `?${detailQuery}` : ''}`
        );
        setActiveSeoPageKey(null);
        setActiveNavigationPath(VIEW_PATH_MAP.resorts);
      }
      window.location.hash = '';
      window.scrollTo(0, 0);
    }
  };

  const handleToggleCompare = (resortId: number) => {
    setCompareList(prev => {
      if (prev.includes(resortId)) {
        return prev.filter(id => id !== resortId);
      }
      if (prev.length < 3) {
        return [...prev, resortId];
      }
      alert('최대 3개의 리조트만 비교할 수 있습니다.');
      return prev;
    });
  };

  const handleClearCompare = () => {
    setCompareList([]);
    setIsCompareViewVisible(false);
    if (window.location.hash.startsWith('#/compare/')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      syncRoutePresentation();
    }
  };

  const handleShowCompare = () => {
    const resortById = new Map(initialResorts.map(resort => [resort.id, resort] as const));
    const selectedResorts = compareList.map(id => resortById.get(id)).filter((resort): resort is Resort => Boolean(resort));
    const compareHash = buildCompareHash(selectedResorts);

    if (!compareHash) {
      showToast('비교할 리조트를 2개 이상 선택해 주세요.');
      return;
    }

    setCurrentView('resorts');
    setIsCompareViewVisible(true);
    setActiveSeoPageKey(null);
    setActiveNavigationPath(VIEW_PATH_MAP.resorts);
    if (window.location.hash !== compareHash) {
      window.location.hash = compareHash.slice(1);
    }
    window.scrollTo(0, 0);
  };

  const handleHideCompare = () => {
    setIsCompareViewVisible(false);
    if (window.location.hash.startsWith('#/compare/')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      syncRoutePresentation();
    }
  };

  const handleLogoClick = () => {
    setCurrentView('tips');
    setIsCompareViewVisible(false);
    setIsFilterOpen(false);
    if (isImageEditMode) {
      setIsImageEditMode(false);
      setSortOption(previousSortOption);
    }
    setSelectedResortId(null);
    setCurrentPage(1);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== '/') {
      window.history.pushState(window.history.state, '', '/');
    }
    setActiveSeoPageKey('home');
    setActiveNavigationPath(SEO_PAGES.home.path);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!canUseImageEditMode && isImageEditMode) {
      setIsImageEditMode(false);
    }
  }, [canUseImageEditMode, isImageEditMode]);

  const handleToggleImageEditMode = () => {
    if (!canUseImageEditMode) {
      showToast('이미지 편집은 개발 서버(npm run dev)에서만 사용할 수 있습니다.');
      return;
    }

    if (!isImageEditMode) {
      setPreviousSortOption(sortOption);
      if (sortOption !== 'custom') {
        setSortOption('custom');
      }
      setCurrentPage(1);
      setIsImageEditMode(true);
      return;
    }

    setIsImageEditMode(false);
    setSortOption(previousSortOption);
  };

  const updateResortImages = useCallback((resortId: number, updater: (imageUrls: string[]) => string[]) => {
    let updatedUrls: string[] | null = null;

    setInitialResorts(prevResorts => {
      const index = prevResorts.findIndex(resort => resort.id === resortId);
      if (index === -1) {
        return prevResorts;
      }

      const resort = prevResorts[index];
      const currentUrls = Array.isArray(resort.imageUrls) ? resort.imageUrls : [];
      const nextUrlsRaw = updater(currentUrls);
      const nextUrls = Array.isArray(nextUrlsRaw)
        ? nextUrlsRaw.filter((url): url is string => typeof url === 'string')
        : currentUrls;

      if (
        nextUrls.length === currentUrls.length &&
        nextUrls.every((url, idx) => url === currentUrls[idx])
      ) {
        return prevResorts;
      }

      updatedUrls = nextUrls;
      const updatedResort = { ...resort, imageUrls: nextUrls };
      const nextResorts = [...prevResorts];
      nextResorts[index] = updatedResort;
      return nextResorts;
    });

    if (updatedUrls) {
      setDisplayedResorts(prevResorts =>
        prevResorts.map(resort =>
          resort.id === resortId
            ? { ...resort, imageUrls: updatedUrls as string[] }
            : resort
        )
      );

      setResortOverrides(prevOverrides => {
        const nextOverrides = {
          ...prevOverrides,
          [resortId]: {
            ...(prevOverrides[resortId] ?? {}),
            imageUrls: updatedUrls as string[],
          },
        };

        localStorage.setItem('resortOverrides', JSON.stringify(nextOverrides));
        return nextOverrides;
      });
    }
  }, []);

  const handleDeleteResortImage = (resortId: number, imageIndex: number, imageUrl: string) => {
    if (!imageUrl || imageUrl.trim().length === 0) {
      return;
    }

    updateResortImages(resortId, currentUrls =>
      currentUrls.filter((_, index) => index !== imageIndex)
    );

    setDeletedImageUrls(prevUrls => {
      const nextUrls = [...prevUrls, imageUrl];
      void persistPreferences(hiddenResortIds, customOrder, nextUrls);
      return nextUrls;
    });
  };

  const resortsToCompare = initialResorts
    .filter(r => compareList.includes(r.id))
    .sort((a, b) => compareList.indexOf(a.id) - compareList.indexOf(b.id));
  const shouldShowCompareTray =
    !isCompareViewVisible &&
    currentView === 'resorts' &&
    !isImageEditMode &&
    resortsToCompare.length > 0;

  return (
    <div className={`min-h-screen bg-[#f6f8f7] text-slate-950 ${shouldShowCompareTray ? 'pb-[calc(11rem+env(safe-area-inset-bottom))] sm:pb-[calc(12rem+env(safe-area-inset-bottom))]' : 'pb-0'}`}>
      <Header
        isImageEditMode={isImageEditMode}
        onToggleImageEditMode={handleToggleImageEditMode}
        isImageEditFeatureAvailable={canUseImageEditMode}
        onLogoClick={handleLogoClick}
      />
      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <NavBar
          currentPath={activeNavigationPath}
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {currentView === 'tips' && (
          <ResortSelectionTips
            variant={activeSeoPageKey === 'home' ? 'home' : 'start'}
            onShowResorts={handleShowResorts}
          />
        )}

        {currentView === 'agencies' && <TravelAgencies />}

        {currentView === 'flights' && (
          <FlightInfo
            onShowResorts={handleShowResorts}
            onShowQuote={handleShowQuoteFromFlights}
          />
        )}

        {currentView === 'resorts' && (
          <>
            {isCompareViewVisible ? (
              <CompareView 
                resorts={resortsToCompare} 
                onBack={handleHideCompare}
                onRemove={handleToggleCompare}
                onShare={handleShareComparison}
                isSharePending={isSharePending}
              />
            ) : selectedResortId && selectedResort ? (
              <ResortDetail
                resort={selectedResort}
                onBack={handleGoBackToList}
                onShare={() => handleShareResort(selectedResort)}
                isSharePending={isSharePending}
                isImageEditMode={isImageEditMode}
                onDeleteImage={handleDeleteResortImage}
              />
            ) : (
              <div className="space-y-4">
                <header>
                  <h1 className="font-brand-heading text-2xl text-slate-950">
                    몰디브 리조트 비교
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    171개 리조트를 예산, 이동수단, 객실 유형, 개인풀과 수중환경 기준으로 비교해 보세요.
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-3 border-b border-slate-200 pb-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
                  <div className="flex items-center justify-between gap-3 lg:hidden">
                    <button
                      ref={filterTriggerRef}
                      type="button"
                      onClick={handleOpenFilter}
                      className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 lg:hidden"
                    >
                      <FilterIcon className="h-5 w-5" />
                      <span>필터</span>
                    </button>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {displayedResorts.length}개 리조트
                    </span>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:col-start-2">
                    <div className="relative min-w-0 flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <SearchIcon />
                      </div>
                      <input
                        ref={resortSearchRef}
                        type="text"
                        aria-label="리조트 이름 검색"
                        placeholder="리조트 이름 검색"
                        value={filters.searchTerm}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 shadow-inner shadow-slate-900/[0.03] transition-all placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <SortIcon className="h-5 w-5 text-slate-500" />
                      <div className="relative min-w-[154px] flex-1 sm:flex-none">
                        <select
                          id="sort-options"
                          aria-label="리조트 정렬 기준"
                          value={sortOption}
                          onChange={(event) => handleSortChange(event.target.value as SortOption)}
                          disabled={isImageEditMode}
                          className={`h-10 w-full appearance-none rounded-lg border border-slate-200 py-2 pl-3 pr-10 text-center text-sm shadow-sm shadow-slate-900/5 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
                            isImageEditMode ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-700'
                          }`}
                        >
                          <option value="custom">추천순</option>
                          <option value="popularity">인기순</option>
                          <option value="price-asc">가격 낮은 순</option>
                          <option value="price-desc">가격 높은 순</option>
                          <option value="rating-desc">평점 높은 순</option>
                          <option value="snorkeling-desc">수중환경순</option>
                          <option value="travelTime-asc">이동시간 짧은 순</option>
                          <option value="likes-desc">관심도순</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
                          <ChevronDownIcon />
                        </div>
                      </div>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 lg:inline-flex">
                      {displayedResorts.length}개 리조트
                    </span>
                  </div>
                </div>

                {isImageEditMode && (
                  <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                    상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="hidden lg:block">
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onReset={handleResetFilters}
                    />
                  </div>
                  <div className="min-w-0">
                    {loading && (
                      <div
                        className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center text-slate-600"
                        role="status"
                        aria-live="polite"
                      >
                        몰디브 리조트 정보를 불러오는 중입니다...
                      </div>
                    )}
                    {error && (
                      <div
                        className="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center text-red-700"
                        role="alert"
                      >
                        <p className="font-semibold">{error}</p>
                        <button
                          type="button"
                          onClick={() => setResortReloadKey(value => value + 1)}
                          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                        >
                          다시 시도
                        </button>
                      </div>
                    )}
                    {!loading && !error && (
                      <ResortGrid
                        resorts={paginatedResorts}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        compareList={compareList}
                        onToggleCompare={handleToggleCompare}
                        isImageEditMode={isImageEditMode}
                        interestCountMap={interestCountMap}
                        likedResortIds={likedResortIds}
                        onToggleLike={toggleLike}
                        pendingLikeResortIds={pendingLikeResortIds}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
          role="presentation"
        >
          <div 
            ref={filterDialogRef}
            className="h-full w-[min(92vw,360px)] translate-x-0 bg-white pb-[env(safe-area-inset-bottom)] shadow-xl transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="리조트 필터"
            tabIndex={-1}
          >
            <div className="h-full overflow-y-auto">
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onReset={handleResetFilters}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      {shouldShowCompareTray && (
        <CompareTray
          resorts={resortsToCompare}
          onRemove={handleToggleCompare}
          onClear={handleClearCompare}
          onCompare={handleShowCompare}
        />
      )}
      {toastMessage && (
        <div
          key={toastMessage.id}
          className={`fixed right-4 z-50 max-w-xs rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            shouldShowCompareTray
              ? 'bottom-[calc(11rem+env(safe-area-inset-bottom))] sm:bottom-[calc(12rem+env(safe-area-inset-bottom))]'
              : 'bottom-4'
          }`}
          role="status"
          aria-live="polite"
        >
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};

export default App;
