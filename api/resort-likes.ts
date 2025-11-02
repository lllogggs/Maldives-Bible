import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

function setCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function send(res: NextApiResponse, status: number, body?: any) {
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

type DeleteVerificationRow = {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    return send(res, 204);
  }

  try {
    if (req.method === 'GET') {
      const profileId = typeof req.query.profileId === 'string' ? req.query.profileId : undefined;
      if (!profileId) {
        return send(res, 400, { error: 'missing profileId' });
      }

      const { data, error } = await supabase
        .from<LikeRow>('resort_likes')
        .select('resort_id, profile_id');

      if (error) {
        return send(res, 500, { error: error.message });
      }

      const summary = normalizeCounts(data ?? [], profileId);
      return send(res, 200, { ok: true, data: summary });
    }

    if (req.method === 'POST') {
      const { profileId, resortId, liked } = req.body ?? {};

      if (!profileId || typeof profileId !== 'string') {
        return send(res, 400, { error: 'missing profileId' });
      }

      const numericResortId = Number(resortId);
      if (!Number.isFinite(numericResortId)) {
        return send(res, 400, { error: 'invalid resortId' });
      }

      const shouldLike = Boolean(liked);

      if (shouldLike) {
        const { error: upsertError } = await supabase
          .from('resort_likes')
          .upsert(
            { profile_id: profileId, resort_id: numericResortId },
            { onConflict: 'profile_id,resort_id' }
          );

        if (upsertError) {
          console.error('Failed to insert resort like', {
            profileId,
            resortId: numericResortId,
            code: upsertError.code,
            details: upsertError.details,
            hint: upsertError.hint,
            message: upsertError.message,
          });
          return send(res, 500, { error: upsertError.message });
        }
      } else {
        const { error: deleteError } = await supabase
          .from('resort_likes')
          .delete()
          .eq('profile_id', profileId)
          .eq('resort_id', numericResortId);

        if (deleteError) {
          console.error('Failed to delete resort like', {
            profileId,
            resortId: numericResortId,
            code: deleteError.code,
            details: deleteError.details,
            hint: deleteError.hint,
            message: deleteError.message,
          });
          return send(res, 500, { error: deleteError.message });
        }

        const { data: verificationRows, error: verificationError } = await supabase
          .from<DeleteVerificationRow>('resort_likes')
          .select('profile_id, resort_id')
          .eq('profile_id', profileId)
          .eq('resort_id', numericResortId);

        if (verificationError) {
          console.error('Failed to verify resort like deletion', {
            profileId,
            resortId: numericResortId,
            code: verificationError.code,
            details: verificationError.details,
            hint: verificationError.hint,
            message: verificationError.message,
          });
        } else if ((verificationRows ?? []).length > 0) {
          console.warn('Resort like rows still exist after deletion attempt', {
            profileId,
            resortId: numericResortId,
            rows: verificationRows,
          });
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
        .from<{ resort_id: number | null }>('resort_likes')
        .select('resort_id')
        .eq('profile_id', profileId);

      if (likedRowsError) {
        return send(res, 500, { error: likedRowsError.message });
      }

      const likedIds = (likedRows ?? [])
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
