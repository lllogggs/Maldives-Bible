import type { ApiRequest, ApiResponse } from '../server/api-http';
import { requireProfileAccess } from '../server/profile-token.js';
import {
  SupabaseConfigurationError,
  SupabaseRestError,
  supabaseRestRequest,
} from '../server/supabase-rest.js';

function getHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAllowedOrigin(origin: string | undefined, host: string | undefined) {
  if (!origin) {
    return undefined;
  }

  const configuredOrigins = (process.env.RESORT_PREFERENCES_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  const sameHostOrigins = host ? [`https://${host}`, `http://${host}`] : [];
  const allowedOrigins = new Set([...configuredOrigins, ...sameHostOrigins]);
  return allowedOrigins.has(origin) ? origin : null;
}

function setCors(req: ApiRequest, res: ApiResponse) {
  const origin = getHeaderValue(req.headers.origin);
  const allowedOrigin = getAllowedOrigin(origin, getHeaderValue(req.headers.host));
  if (allowedOrigin === null) {
    return false;
  }

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with, x-resort-profile-token');
  res.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

function send(res: ApiResponse, status: number, body?: any) {
  if (!body) return res.status(status).end();
  return res.status(status).json(body);
}

type LikesSummary = {
  counts: Record<number, number>;
  likedIds: number[];
};

type LikesUpdate = {
  likesCount: number;
  likedIds: number[];
};

type LikeRow = {
  resort_id?: number | string | null;
  profile_id?: string | null;
};

type LikeCountRow = LikeRow & {
  likes_count?: number | string | null;
};

const PAGE_SIZE = 1000;
const MAX_SYNCED_LIKE_IDS = 500;

function normalizeResortId(value: unknown): number | null {
  const resortId = Number(value);
  return Number.isInteger(resortId) && resortId > 0 ? resortId : null;
}

async function readRowsPaginated(pathBuilder: (offset: number) => string): Promise<LikeRow[]> {
  const rows: LikeRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await supabaseRestRequest<LikeRow[]>(pathBuilder(offset));
    if (!Array.isArray(data)) {
      throw new SupabaseRestError(502, 'invalid_supabase_response');
    }

    rows.push(...data);
    if (data.length < PAGE_SIZE) {
      return rows;
    }
  }
}

async function readLikedIds(profileId: string): Promise<number[]> {
  const encodedProfileId = encodeURIComponent(profileId);
  const rows = await readRowsPaginated(offset =>
    `resort_likes?select=resort_id&profile_id=eq.${encodedProfileId}&order=resort_id.asc&limit=${PAGE_SIZE}&offset=${offset}`
  );

  return Array.from(
    new Set(
      rows
        .map(row => normalizeResortId(row.resort_id))
        .filter((resortId): resortId is number => resortId !== null)
    )
  );
}

async function readCountsFromRows(): Promise<Record<number, number>> {
  const rows = await readRowsPaginated(offset =>
    `resort_likes?select=resort_id,profile_id&order=resort_id.asc,profile_id.asc&limit=${PAGE_SIZE}&offset=${offset}`
  );
  const counts: Record<number, number> = {};

  rows.forEach(row => {
    const resortId = normalizeResortId(row.resort_id);
    if (resortId !== null) {
      counts[resortId] = (counts[resortId] ?? 0) + 1;
    }
  });

  return counts;
}

async function readLikeCounts(): Promise<Record<number, number>> {
  try {
    const { data } = await supabaseRestRequest<LikeCountRow[]>('rpc/get_resort_like_counts', {
      method: 'POST',
      body: '{}',
    });
    if (!Array.isArray(data)) {
      throw new SupabaseRestError(502, 'invalid_supabase_response');
    }

    const counts: Record<number, number> = {};
    data.forEach(row => {
      const resortId = normalizeResortId(row.resort_id);
      const count = Number(row.likes_count);
      if (resortId !== null && Number.isFinite(count) && count > 0) {
        counts[resortId] = Math.floor(count);
      }
    });
    return counts;
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }

    console.warn('Supabase likes count RPC unavailable; using paginated rows', error);
    return readCountsFromRows();
  }
}

async function readLikes(profileId: string): Promise<LikesSummary> {
  const [counts, likedIds] = await Promise.all([
    readLikeCounts(),
    readLikedIds(profileId),
  ]);

  return { counts, likedIds };
}

function parseExactCount(contentRange: string | null): number | null {
  if (!contentRange) {
    return null;
  }

  const separatorIndex = contentRange.lastIndexOf('/');
  if (separatorIndex < 0) {
    return null;
  }

  const count = Number(contentRange.slice(separatorIndex + 1));
  return Number.isInteger(count) && count >= 0 ? count : null;
}

async function readResortLikeCount(resortId: number): Promise<number> {
  const { response } = await supabaseRestRequest<LikeRow[]>(
    `resort_likes?select=resort_id&resort_id=eq.${resortId}`,
    {
      headers: {
        Prefer: 'count=exact',
        Range: '0-0',
      },
    },
  );

  const exactCount = parseExactCount(response.headers.get('content-range'));
  if (exactCount === null) {
    throw new SupabaseRestError(502, 'missing_supabase_count');
  }

  return exactCount;
}

async function updateLikes(
  profileId: string,
  resortId: number,
  shouldLike: boolean,
): Promise<LikesUpdate> {
  const encodedProfileId = encodeURIComponent(profileId);

  if (shouldLike) {
    await supabaseRestRequest<void>(
      'resort_likes?on_conflict=profile_id%2Cresort_id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({ profile_id: profileId, resort_id: resortId }),
      },
    );
  } else {
    await supabaseRestRequest<void>(
      `resort_likes?profile_id=eq.${encodedProfileId}&resort_id=eq.${resortId}`,
      {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      },
    );
  }

  const [likesCount, likedIds] = await Promise.all([
    readResortLikeCount(resortId),
    readLikedIds(profileId),
  ]);

  return { likesCount, likedIds };
}

function normalizeSyncedLikeIds(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length > MAX_SYNCED_LIKE_IDS) {
    return null;
  }

  const resortIds = new Set<number>();
  value.forEach(item => {
    const resortId = normalizeResortId(item);
    if (resortId !== null) {
      resortIds.add(resortId);
    }
  });

  return Array.from(resortIds);
}

async function syncLikes(profileId: string, resortIds: number[]): Promise<LikesSummary> {
  if (resortIds.length > 0) {
    await supabaseRestRequest<void>(
      'resort_likes?on_conflict=profile_id%2Cresort_id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(
          resortIds.map(resortId => ({ profile_id: profileId, resort_id: resortId }))
        ),
      },
    );
  }

  return readLikes(profileId);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!setCors(req, res)) {
    return send(res, 403, { error: 'origin not allowed' });
  }
  if (req.method === 'OPTIONS') {
    return send(res, 204);
  }

  try {
    if (req.method === 'GET') {
      const access = requireProfileAccess(req, req.query.profileId);
      if (access.ok !== true || typeof access.profileId !== 'string') {
        return send(res, access.status ?? 401, { error: access.error ?? 'invalid profile access' });
      }

      const summary = await readLikes(access.profileId);
      return send(res, 200, {
        ok: true,
        data: summary,
      });
    }

    if (req.method === 'POST') {
      const { profileId, resortId, liked } = req.body ?? {};

      const access = requireProfileAccess(req, profileId);
      if (access.ok !== true || typeof access.profileId !== 'string') {
        return send(res, access.status ?? 401, { error: access.error ?? 'invalid profile access' });
      }

      const numericResortId = Number(resortId);
      if (!Number.isInteger(numericResortId) || numericResortId <= 0) {
        return send(res, 400, { error: 'invalid resortId' });
      }

      let shouldLike: boolean;
      if (typeof liked === 'string') {
        const normalized = liked.trim().toLowerCase();
        shouldLike = normalized === 'true' || normalized === '1' || normalized === 'yes';
      } else if (typeof liked === 'number') {
        shouldLike = Number.isFinite(liked) ? liked > 0 : false;
      } else {
        shouldLike = Boolean(liked);
      }

      const update = await updateLikes(access.profileId, numericResortId, shouldLike);
      return send(res, 200, {
        ok: true,
        data: update,
      });
    }

    if (req.method === 'PUT') {
      const { profileId, likedIds } = req.body ?? {};

      const access = requireProfileAccess(req, profileId);
      if (access.ok !== true || typeof access.profileId !== 'string') {
        return send(res, access.status ?? 401, { error: access.error ?? 'invalid profile access' });
      }

      const normalizedLikedIds = normalizeSyncedLikeIds(likedIds);
      if (normalizedLikedIds === null) {
        return send(res, 400, { error: 'invalid likedIds' });
      }

      const summary = await syncLikes(access.profileId, normalizedLikedIds);
      return send(res, 200, { ok: true, data: summary });
    }

    res.setHeader('Allow', 'GET,POST,PUT,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Resort likes storage request failed', error);
    const status = error instanceof SupabaseConfigurationError ? 503 : 502;
    return send(res, status, { error: 'likes storage unavailable' });
  }
}
