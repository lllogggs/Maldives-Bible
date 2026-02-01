import React, { useState, useEffect, useCallback } from 'react';
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
import { POPULARITY_RANKING } from './constants';
import type { Resort, Filters, SortOption } from './types';

type ViteEnvShim = {
  DEV?: boolean;
  MODE?: string;
  VITE_DEV_SERVER_URL?: string;
};

type View = 'resorts' | 'tips' | 'agencies' | 'flights';

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
  maxPrice: 30000,
  roomTypes: [],
  minRestaurants: 0,
  minBars: 0,
  hasPrivatePool: false,
  onlyLiked: false,
};

const parseNumberParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCsvParam = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
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

const buildPreferencesEndpoint = () => {
  const baseUrl = import.meta.env.VITE_PREFERENCES_API_BASE_URL?.replace(/\/$/, '');
  if (baseUrl) {
    return `${baseUrl}/api/resort-preferences`;
  }

  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const fallbackBase = 'https://maldives-bible.vercel.app';
    return `${fallbackBase}/api/resort-preferences`;
  }

  return '/api/resort-preferences';
};

const PREFERENCES_ENDPOINT = buildPreferencesEndpoint();

const buildLikesEndpoint = () => {
  const baseUrl = import.meta.env.VITE_PREFERENCES_API_BASE_URL?.replace(/\/$/, '');
  if (baseUrl) {
    return `${baseUrl}/api/resort-likes`;
  }

  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const fallbackBase = 'https://maldives-bible.vercel.app';
    return `${fallbackBase}/api/resort-likes`;
  }

  return '/api/resort-likes';
};

const RESORT_LIKES_ENDPOINT = buildLikesEndpoint();

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

type UseResortLikesOptions = {
  profileId: string | null;
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

      try {
        const response = await fetch(RESORT_LIKES_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
  const [compareList, setCompareList] = useState<number[]>([]);
  const [isCompareViewVisible, setIsCompareViewVisible] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('resorts');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(max-width: 640px)').matches;
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isImageEditMode, setIsImageEditMode] = useState<boolean>(false);
  const [previousSortOption, setPreviousSortOption] = useState<SortOption>('popularity');
  const [customOrder, setCustomOrder] = useState<number[]>([]);
  const [hiddenResortIds, setHiddenResortIds] = useState<number[]>([]);
  const [, setDeletedImageUrls] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, setResortOverrides] = useState<Record<number, ResortOverride>>({});
  const [profileId, setProfileId] = useState<string | null>(null);

  const ensureProfileId = useCallback((): string | null => {
    if (profileId && profileId.trim().length > 0) {
      return profileId;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const storedProfileId = localStorage.getItem('resortProfileId');
    if (storedProfileId && storedProfileId.trim().length > 0) {
      setProfileId(storedProfileId);
      return storedProfileId;
    }

    const generated = createProfileId();

    try {
      localStorage.setItem('resortProfileId', generated);
    } catch (err) {
      console.error('프로필 ID를 로컬 스토리지에 저장하지 못했습니다.', err);
    }

    setProfileId(generated);
    return generated;
  }, [profileId]);

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
    ensureProfileId,
    saveLikedResorts: saveLikedResortsToLocal,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    ensureProfileId();

    const localLikes = parseNumberArray(localStorage.getItem('likedResorts'));
    if (localLikes.length > 0) {
      setInitialLikedResorts(localLikes);
    }
  }, [ensureProfileId, setInitialLikedResorts]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const fetchRemotePreferences = useCallback(async (activeProfileId: string | null): Promise<ResortPreferences | null> => {
    if (!activeProfileId) {
      return null;
    }

    try {
      const response = await fetch(`${PREFERENCES_ENDPOINT}?profileId=${encodeURIComponent(activeProfileId)}`, {
        headers: { Accept: 'application/json' },
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
      console.error('Failed to fetch remote resort preferences', err);
      return null;
    }
  }, []);

  const persistPreferences = useCallback(
    async (hiddenIds: number[], order: number[], deletedUrls?: string[]) => {
      savePreferencesToLocal(hiddenIds, order);

      if (!profileId) {
        return;
      }

      try {
        const response = await fetch(PREFERENCES_ENDPOINT, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        setToastMessage(fallbackMessage);
      }
    },
    [profileId, savePreferencesToLocal]
  );

  const fetchRemoteLikes = useCallback(async (activeProfileId: string | null): Promise<ResortLikesSummary | null> => {
    if (!activeProfileId) {
      return null;
    }

    try {
      const response = await fetch(`${RESORT_LIKES_ENDPOINT}?profileId=${encodeURIComponent(activeProfileId)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch likes: ${response.statusText}`);
      }

      const payload = (await response.json()) as { data?: Partial<ResortLikesSummary> };
      const data = payload?.data ?? {};

      return {
        counts: ensureNumberRecord(data.counts),
        likedIds: ensureNumberArray((data as ResortLikesSummary).likedIds),
      };
    } catch (err) {
      console.error('Failed to fetch resort likes', err);
      return null;
    }
  }, []);


  useEffect(() => {
    if (!profileId) {
      return;
    }

    const fetchResorts = async () => {
      try {
        setLoading(true);

        const basePath = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
        const resortFileUrls = Array.from({ length: 9 }, (_, i) => {
          const fileName = `resorts${i === 0 ? '' : i + 1}.json`;
          const url = `${basePath}/api/${fileName}`;
          return url.startsWith('/') ? url : `/${url}`;
        });

        const responses = await Promise.all(resortFileUrls.map(url => fetch(url)));

        for (const response of responses) {
            if (!response.ok) {
                throw new Error(`리조트 데이터를 불러오는 데 실패했습니다: ${response.statusText} (${response.url})`);
            }
        }

        const resortsDataArrays: Resort[][] = await Promise.all(responses.map(res => res.json()));

        const combinedData = resortsDataArrays.flat();
        const storedOverrides = JSON.parse(localStorage.getItem('resortOverrides') || '{}') as Record<string, ResortOverride>;
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
        const [remotePreferences, remoteLikes] = await Promise.all([
          fetchRemotePreferences(profileId),
          fetchRemoteLikes(profileId),
        ]);

        if (remotePreferences) {
          setDeletedImageUrls(remotePreferences.deleted_image_urls);
        }

        const mergedHiddenIds = Array.from(
          new Set([
            ...(remotePreferences?.hidden_ids ?? []),
            ...localPreferences.hidden_ids,
          ])
        );

        const resortIds = mergedData.map(resort => resort.id);
        const resortIdSet = new Set(resortIds);
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
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
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
    savePreferencesToLocal,
  ]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/resort\/(\d+)$/);
      if (match) {
        setSelectedResortId(Number(match[1]));
        window.scrollTo(0, 0);
      } else {
        setSelectedResortId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 초기 로드 시에도 해시를 확인합니다.

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const parsedFilters: Filters = {
      ...DEFAULT_FILTERS,
      searchTerm: params.get('q') ?? DEFAULT_FILTERS.searchTerm,
      transportation: parseCsvParam(params.get('t')) as Filters['transportation'],
      maxPrice: parseNumberParam(params.get('max'), DEFAULT_FILTERS.maxPrice),
      roomTypes: parseCsvParam(params.get('room')) as Filters['roomTypes'],
      minRestaurants: parseNumberParam(params.get('rest'), DEFAULT_FILTERS.minRestaurants),
      minBars: parseNumberParam(params.get('bars'), DEFAULT_FILTERS.minBars),
      hasPrivatePool: params.get('pool') === '1',
      onlyLiked: params.get('liked') === '1',
    };

    setFilters(parsedFilters);

    const sort = params.get('sort') as SortOption | null;
    if (sort) {
      setSortOption(sort);
    }

    const view = params.get('view') as View | null;
    if (view) {
      setCurrentView(view);
    }

    const page = parseNumberParam(params.get('page'), 1);
    if (page > 0) {
      setCurrentPage(page);
    }

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
    processedResorts = processedResorts.filter(resort => resort.price <= filters.maxPrice);
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
    processedResorts = processedResorts.filter(resort => resort.bars >= filters.minBars);
    if (filters.onlyLiked) {
      processedResorts = processedResorts.filter(resort => likedSet.has(resort.id));
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
          const likesA = likesCountMap[a.id] ?? 0;
          const likesB = likesCountMap[b.id] ?? 0;
          if (likesA === likesB) {
            return a.id - b.id;
          }
          return likesB - likesA;
        });
        break;
    }

    setDisplayedResorts(processedResorts);
  }, [customOrder, filters, hiddenResortIds, initialResorts, likedResortIds, likesCountMap, sortOption]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOption, hiddenResortIds, customOrder, initialResorts]);

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
    if (filters.maxPrice !== DEFAULT_FILTERS.maxPrice) {
      params.set('max', String(filters.maxPrice));
    }
    if (filters.roomTypes.length > 0) {
      params.set('room', filters.roomTypes.join(','));
    }
    if (filters.minRestaurants !== DEFAULT_FILTERS.minRestaurants) {
      params.set('rest', String(filters.minRestaurants));
    }
    if (filters.minBars !== DEFAULT_FILTERS.minBars) {
      params.set('bars', String(filters.minBars));
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
    if (currentView !== 'resorts') {
      params.set('view', currentView);
    }
    if (currentPage !== 1) {
      params.set('page', String(currentPage));
    }

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [filters, sortOption, currentView, currentPage, isQueryHydrated]);

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

  const isResortListFocused =
    currentView === 'resorts' && !isCompareViewVisible && !(selectedResortId && selectedResort);
  const isCompactHeader = !isResortListFocused || isMobileViewport;

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
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsCompareViewVisible(false);
    setSelectedResortId(null);
    if (view !== 'resorts') {
      window.location.hash = '';
    }
    setCurrentPage(1);
  };

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setToastMessage('필터/정렬 링크가 복사되었습니다.');
    } catch (err) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setToastMessage('필터/정렬 링크가 복사되었습니다.');
      } catch (copyErr) {
        console.error('Failed to copy share link', copyErr);
        setToastMessage('링크 복사에 실패했습니다.');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBackToList = () => {
    window.location.hash = '';
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
  };

  const handleShowCompare = () => {
    setIsCompareViewVisible(true);
    window.scrollTo(0, 0);
  };

  const handleHideCompare = () => {
    setIsCompareViewVisible(false);
  };

  const handleLogoClick = () => {
    setCurrentView('resorts');
    setIsCompareViewVisible(false);
    setIsFilterOpen(false);
    if (isImageEditMode) {
      setIsImageEditMode(false);
      setSortOption(previousSortOption);
    }
    setSelectedResortId(null);
    setCurrentPage(1);
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
      setToastMessage('이미지 편집은 개발 서버(npm run dev)에서만 사용할 수 있습니다.');
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

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header
        searchTerm={filters.searchTerm}
        onSearchChange={handleSearchChange}
        isImageEditMode={isImageEditMode}
        onToggleImageEditMode={handleToggleImageEditMode}
        isImageEditFeatureAvailable={canUseImageEditMode}
        isCompact={isCompactHeader}
        onLogoClick={handleLogoClick}
      />
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        <section
          className="sr-only mb-10 rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
          aria-labelledby="maldives-bible-intro"
        >
          <div className="space-y-6 text-gray-800">
            <header className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
                몰디브바이블 SEO 허브
              </p>
              <h1
                id="maldives-bible-intro"
                className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl"
              >
                몰디브 바이블: 몰디브 리조트 비교 · 입문 가이드의 표준
              </h1>
              <p className="text-base leading-relaxed sm:text-lg">
                몰디브 바이블은 방대한 리조트 데이터를 기반으로 <strong>몰디브 리조트 비교</strong>를 돕는 전문
                플랫폼입니다. 허니문, 가족 여행, 럭셔리 올인클루시브까지 조건별 필터와 실제 여행사 제휴 정보를
                한 번에 제공하여, 처음 준비하는 <strong>몰디브 리조트 입문</strong>자도 쉽게 방향을 잡을 수 있는
                한국어 몰디브 데이터베이스를 목표로 합니다.
              </p>
            </header>
            <div className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-2xl bg-cyan-50/60 p-5 shadow-inner">
                <h2 className="text-lg font-semibold text-cyan-700">몰디브 리조트 비교 인사이트</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  시즌별 프로모션, 수상·수상 콤보 빌라, 수상 스포츠 제공 여부 등 깊이 있는 조건을 중심으로 리조트를
                  세분화했습니다. 즐겨찾기와 비교함 기능을 활용하면 니치한 검색어로 유입된 사용자도 원하는 후보군을
                  빠르게 정리할 수 있습니다.
                </p>
              </article>
              <article className="rounded-2xl bg-cyan-50/60 p-5 shadow-inner">
                <h2 className="text-lg font-semibold text-cyan-700">몰디브 리조트 입문 로드맵</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  입문자가 궁금해하는 예산대, 이동 동선, 식사 플랜 차이를 단계별로 소개합니다. "몰디브 리조트 입문"과
                  같은 키워드로 정보를 찾는 여행자에게 가장 중요한 의사결정 포인트를 FAQ로 정리하여 처음 방문해도 길을
                  잃지 않도록 돕습니다.
                </p>
              </article>
              <article className="rounded-2xl bg-cyan-50/60 p-5 shadow-inner">
                <h2 className="text-lg font-semibold text-cyan-700">몰디브 리조트학과 입학(?) 썰</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  몰디브 리조트를 처음 알아볼 때 "몰디브 리조트학과 입학했다"고 농담하는 여행자들의 밈을 담았습니다.
                  진짜 학위나 인턴십 준비가 아니라, 리조트 공부를 빡세게 해보겠다는 마음가짐 정도로 가볍게 웃을 수 있는
                  스토리텔링을 더해 검색 키워드와 자연스럽게 연결했습니다.
                </p>
              </article>
            </div>
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-white/70 p-5">
              <h2 className="text-lg font-semibold text-gray-900">니치 검색어 탐색 팁</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                몰디브바이블은 검색 수요가 낮지만 예약 전환율이 높은 롱테일 키워드를 적극적으로 다룹니다. 아래 키워드
                조합을 활용하면 검색엔진에서 경쟁이 낮은 트래픽을 확보할 수 있습니다.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                <li>"몰디브 리조트 비교" + "허니문 전용" + 원하는 예산대</li>
                <li>"몰디브 리조트 입문" + "수상 비행기 vs 스피드보트"</li>
                <li>"몰디브 리조트학과 입학" 장난 + "친구들에게 썰 풀기"</li>
                <li>"몰디브 가족 여행" + "키즈 클럽" + 리조트 이름</li>
                <li>"몰디브바이블" + "실시간 견적"으로 브랜드 검색 유도</li>
              </ul>
            </div>
          </div>
        </section>

        <NavBar currentView={currentView} onViewChange={handleViewChange} />

        {currentView === 'tips' && <ResortSelectionTips />}

        {currentView === 'agencies' && <TravelAgencies />}

        {currentView === 'flights' && <FlightInfo />}

        {currentView === 'resorts' && (
          <>
            {isCompareViewVisible ? (
              <CompareView 
                resorts={resortsToCompare} 
                onBack={handleHideCompare}
                onRemove={handleToggleCompare}
              />
            ) : selectedResortId && selectedResort ? (
              <ResortDetail
                resort={selectedResort}
                onBack={handleGoBackToList}
                isImageEditMode={isImageEditMode}
                onDeleteImage={handleDeleteResortImage}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 hidden lg:block">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
                <div className="lg:col-span-3">
                  {loading && <div className="text-center py-16">몰디브 리조트 정보를 불러오는 중입니다...</div>}
                  {error && <div className="text-center py-16 text-red-500">에러: {error}</div>}
                  {!loading && !error && (
                    <ResortGrid
                      resorts={paginatedResorts}
                      sortOption={sortOption}
                      onSortChange={handleSortChange}
                      totalResortsCount={displayedResorts.length}
                      totalAllResortsCount={initialResorts.length}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      compareList={compareList}
                      onToggleCompare={handleToggleCompare}
                      onOpenFilter={() => setIsFilterOpen(true)}
                      onCopyShareLink={handleCopyShareLink}
                      isImageEditMode={isImageEditMode}
                      likesCountMap={likesCountMap}
                      likedResortIds={likedResortIds}
                      onToggleLike={toggleLike}
                      pendingLikeResortIds={pendingLikeResortIds}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 lg:hidden transition-opacity duration-300"
          onClick={() => setIsFilterOpen(false)}
        >
          <div 
            className="bg-white h-full w-4/5 max-w-sm shadow-xl transition-transform duration-300 transform -translate-x-full animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto">
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      {!isCompareViewVisible && currentView === 'resorts' && !isImageEditMode && (
        <CompareTray
          resorts={resortsToCompare}
          onRemove={handleToggleCompare}
          onClear={handleClearCompare}
          onCompare={handleShowCompare}
        />
      )}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs bg-red-500 text-white px-4 py-3 rounded shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
