import type { ApiRequest, ApiResponse } from '../server/api-http';
import { requireProfileAccess } from '../server/profile-token';
import { createClient } from '@supabase/supabase-js';

const MAX_PREFERENCE_IDS = 1000;
const MAX_DELETED_IMAGE_URLS = 2000;

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

// ---- Supabase 연결 ----
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!setCors(req, res)) {
    return send(res, 403, { error: 'origin not allowed' });
  }
  if (req.method === 'OPTIONS') return send(res, 204);

  try {
    if (req.method === 'GET') {
      const access = requireProfileAccess(req, req.query.profileId);
      if (!access.ok) return send(res, access.status, { error: access.error });

      const { data, error } = await supabase
        .from('resort_preferences')
        .select('*')
        .eq('profile_id', access.profileId)
        .maybeSingle();
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { ok: true, data });
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

      const { data, error } = await supabase
        .from('resort_preferences')
        .upsert(payload, { onConflict: 'profile_id' })
        .select()
        .single();

      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { ok: true, data });
    }

    res.setHeader('Allow', 'GET,PUT,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  } catch (e: any) {
    return send(res, 500, { error: e?.message || 'internal_error' });
  }
}
