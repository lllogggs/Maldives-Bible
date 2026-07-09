import type { ApiRequest, ApiResponse } from '../server/api-http';
import { requireProfileAccess } from '../server/profile-token';

const MAX_PREFERENCE_IDS = 1000;
const MAX_DELETED_IMAGE_URLS = 2000;
const REDIS_PREFERENCES_PREFIX = 'maldives-bible:preferences:';

type ResortPreferences = {
  profile_id: string;
  hidden_ids: number[];
  custom_order: number[];
  deleted_image_urls: string[];
};

type RedisResult<T> = {
  result?: T;
  error?: string;
};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with, x-resort-profile-token');
  res.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

function send(res: ApiResponse, status: number, body?: any) {
  if (!body) return res.status(status).end();
  return res.status(status).json(body);
}

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

function normalizeNumberArray(value: unknown, maxItems = MAX_PREFERENCE_IDS) {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: number[] = [];
  const seen = new Set<number>();
  for (const item of value) {
    const normalized = Math.trunc(Number(item));
    if (!Number.isFinite(normalized) || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= maxItems) {
      break;
    }
  }
  return result;
}

function normalizeStringArray(value: unknown, maxItems = MAX_DELETED_IMAGE_URLS) {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const normalized = String(item ?? '').trim();
    if (!normalized || normalized.length > 2048 || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= maxItems) {
      break;
    }
  }
  return result;
}

function getEmptyPreferences(profileId: string): ResortPreferences {
  return {
    profile_id: profileId,
    hidden_ids: [],
    custom_order: [],
    deleted_image_urls: [],
  };
}

function normalizePreferences(profileId: string, value: unknown): ResortPreferences {
  if (!value || typeof value !== 'object') {
    return getEmptyPreferences(profileId);
  }

  const record = value as Partial<ResortPreferences>;
  return {
    profile_id: profileId,
    hidden_ids: normalizeNumberArray(record.hidden_ids),
    custom_order: normalizeNumberArray(record.custom_order),
    deleted_image_urls: normalizeStringArray(record.deleted_image_urls),
  };
}

async function readPreferences(profileId: string): Promise<ResortPreferences | null> {
  if (!getRedisConfig()) {
    return null;
  }

  try {
    const raw = await redisCommand<string | null>(['GET', `${REDIS_PREFERENCES_PREFIX}${profileId}`]);
    if (!raw) {
      return getEmptyPreferences(profileId);
    }

    return normalizePreferences(profileId, JSON.parse(raw));
  } catch (error) {
    console.warn('Redis preferences storage unavailable; falling back', error);
    return null;
  }
}

async function writePreferences(payload: ResortPreferences): Promise<ResortPreferences | null> {
  if (!getRedisConfig()) {
    return null;
  }

  try {
    await redisCommand<string>(['SET', `${REDIS_PREFERENCES_PREFIX}${payload.profile_id}`, JSON.stringify(payload)]);
    return payload;
  } catch (error) {
    console.warn('Redis preferences storage unavailable; falling back', error);
    return null;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!setCors(req, res)) {
    return send(res, 403, { error: 'origin not allowed' });
  }
  if (req.method === 'OPTIONS') return send(res, 204);

  try {
    if (req.method === 'GET') {
      const access = requireProfileAccess(req, req.query.profileId);
      if (!access.ok) return send(res, access.status, { error: access.error });

      const data = await readPreferences(access.profileId);
      return send(res, 200, {
        ok: true,
        data,
        storage: data ? 'redis' : 'local',
      });
    }

    if (req.method === 'PUT') {
      const { profileId, hiddenIds, customOrder, deletedImageUrls } = req.body ?? {};
      const access = requireProfileAccess(req, profileId);
      if (!access.ok) return send(res, access.status, { error: access.error });

      const payload = {
        profile_id: access.profileId,
        hidden_ids: normalizeNumberArray(hiddenIds),
        custom_order: normalizeNumberArray(customOrder),
        deleted_image_urls: normalizeStringArray(deletedImageUrls),
      };

      const data = await writePreferences(payload);
      return send(res, 200, {
        ok: true,
        data: data ?? payload,
        storage: data ? 'redis' : 'local',
      });
    }

    res.setHeader('Allow', 'GET,PUT,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  } catch (error: any) {
    return send(res, 500, { error: error?.message || 'internal_error' });
  }
}
