import type { ApiRequest, ApiResponse } from '../server/api-http';
import { requireProfileAccess } from '../server/profile-token';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type LikeRow = {
  resort_id: number | null;
  profile_id: string | null;
};

function normalizeCounts(rows: LikeRow[], profileId: string) {
  const counts: Record<number, number> = {};
  const likedIds: number[] = [];

  rows.forEach(row => {
    if (typeof row.resort_id !== 'number' || !Number.isFinite(row.resort_id)) {
      return;
    }

    const resortId = row.resort_id;
    counts[resortId] = (counts[resortId] ?? 0) + 1;

    if (row.profile_id === profileId) {
      likedIds.push(resortId);
    }
  });

  return { counts, likedIds };
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

      const { data, error } = await supabase
        .from('resort_likes')
        .select('resort_id, profile_id');

      if (error) {
        return send(res, 500, { error: error.message });
      }

      const summary = normalizeCounts((data ?? []) as LikeRow[], access.profileId);
      return send(res, 200, { ok: true, data: summary });
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

      if (shouldLike) {
        const { error: upsertError } = await supabase
          .from('resort_likes')
          .upsert(
            { profile_id: access.profileId, resort_id: numericResortId },
            { onConflict: 'profile_id,resort_id' }
          );

        if (upsertError) {
          return send(res, 500, { error: upsertError.message });
        }
      } else {
        const { error: deleteError } = await supabase
          .from('resort_likes')
          .delete()
          .eq('profile_id', access.profileId)
          .eq('resort_id', numericResortId);

        if (deleteError) {
          return send(res, 500, { error: deleteError.message });
        }
      }

      const { count, error: countError } = await supabase
        .from('resort_likes')
        .select('*', { head: true, count: 'exact' })
        .eq('resort_id', numericResortId);

      if (countError) {
        return send(res, 500, { error: countError.message });
      }

      const { data: likedRows, error: likedRowsError } = await supabase
        .from('resort_likes')
        .select('resort_id')
        .eq('profile_id', access.profileId);

      if (likedRowsError) {
        return send(res, 500, { error: likedRowsError.message });
      }

      const likedIds = ((likedRows ?? []) as Array<{ resort_id: number | null }>)
        .map(row => (row.resort_id ?? undefined))
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id));

      return send(res, 200, {
        ok: true,
        data: { likesCount: count ?? 0, likedIds },
      });
    }

    res.setHeader('Allow', 'GET,POST,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  } catch (error: any) {
    return send(res, 500, { error: error?.message ?? 'internal_error' });
  }
}
