import type { ApiRequest, ApiResponse } from '../server/api-http';
import { requireProfileAccess } from '../server/profile-token.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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

type RedisResult<T> = {
  result?: T;
  error?: string;
};

const REDIS_COUNTS_KEY = 'maldives-bible:likes:counts';
const REDIS_RESORT_PREFIX = 'maldives-bible:likes:resort:';
const REDIS_PROFILE_PREFIX = 'maldives-bible:likes:profile:';

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    token,
  };
}

async function redisCommand<T>(command: Array<string | number>) {
  const config = getRedisConfig();
  if (!config) {
    throw new Error('redis_not_configured');
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  const payload = (await response.json()) as RedisResult<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error || `redis_request_failed_${response.status}`);
  }

  return payload.result as T;
}

function normalizeRedisCounts(raw: unknown): Record<number, number> {
  const counts: Record<number, number> = {};

  if (Array.isArray(raw)) {
    for (let index = 0; index < raw.length; index += 2) {
      const resortId = Number(raw[index]);
      const count = Number(raw[index + 1]);
      if (Number.isFinite(resortId) && Number.isFinite(count) && count > 0) {
        counts[resortId] = Math.floor(count);
      }
    }
    return counts;
  }

  if (raw && typeof raw === 'object') {
    Object.entries(raw as Record<string, unknown>).forEach(([key, value]) => {
      const resortId = Number(key);
      const count = Number(value);
      if (Number.isFinite(resortId) && Number.isFinite(count) && count > 0) {
        counts[resortId] = Math.floor(count);
      }
    });
  }

  return counts;
}

function normalizeRedisIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(item => Number(item))
    .filter((item): item is number => Number.isInteger(item) && item > 0);
}

async function readLikesFromRedis(profileId: string): Promise<LikesSummary> {
  const [countsRaw, likedRaw] = await Promise.all([
    redisCommand<unknown>(['HGETALL', REDIS_COUNTS_KEY]),
    redisCommand<unknown>(['SMEMBERS', `${REDIS_PROFILE_PREFIX}${profileId}`]),
  ]);

  return {
    counts: normalizeRedisCounts(countsRaw),
    likedIds: normalizeRedisIds(likedRaw),
  };
}

async function updateLikesInRedis(profileId: string, resortId: number, shouldLike: boolean): Promise<LikesUpdate> {
  const resortKey = `${REDIS_RESORT_PREFIX}${resortId}`;
  const profileKey = `${REDIS_PROFILE_PREFIX}${profileId}`;

  if (shouldLike) {
    const changed = Number(await redisCommand<number>(['SADD', resortKey, profileId]));
    await redisCommand<number>(['SADD', profileKey, resortId]);
    if (changed > 0) {
      await redisCommand<number>(['HINCRBY', REDIS_COUNTS_KEY, resortId, 1]);
    }
  } else {
    const changed = Number(await redisCommand<number>(['SREM', resortKey, profileId]));
    await redisCommand<number>(['SREM', profileKey, resortId]);
    if (changed > 0) {
      const nextCount = Number(await redisCommand<number>(['HINCRBY', REDIS_COUNTS_KEY, resortId, -1]));
      if (nextCount <= 0) {
        await redisCommand<number>(['HDEL', REDIS_COUNTS_KEY, resortId]);
      }
    }
  }

  const [likesCount, likedRaw] = await Promise.all([
    redisCommand<number>(['SCARD', resortKey]),
    redisCommand<unknown>(['SMEMBERS', profileKey]),
  ]);

  return {
    likesCount: Math.max(0, Number(likesCount) || 0),
    likedIds: normalizeRedisIds(likedRaw),
  };
}

async function readLikes(profileId: string): Promise<LikesSummary | null> {
  if (getRedisConfig()) {
    try {
      return await readLikesFromRedis(profileId);
    } catch (error) {
      console.warn('Redis likes storage unavailable; falling back', error);
    }
  }

  return null;
}

async function updateLikes(profileId: string, resortId: number, shouldLike: boolean): Promise<LikesUpdate | null> {
  if (getRedisConfig()) {
    try {
      return await updateLikesInRedis(profileId, resortId, shouldLike);
    } catch (error) {
      console.warn('Redis likes storage unavailable; falling back', error);
    }
  }

  return null;
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
      if (!access.ok) return send(res, access.status, { error: access.error });

      const summary = await readLikes(access.profileId);
      return send(res, 200, {
        ok: true,
        data: summary ?? { storage: 'local' },
      });
    }

    if (req.method === 'POST') {
      const { profileId, resortId, liked } = req.body ?? {};

      const access = requireProfileAccess(req, profileId);
      if (!access.ok) return send(res, access.status, { error: access.error });

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
        data: update ?? { storage: 'local' },
      });
    }

    res.setHeader('Allow', 'GET,POST,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  } catch (error: any) {
    return send(res, 500, { error: error?.message ?? 'internal_error' });
  }
}
