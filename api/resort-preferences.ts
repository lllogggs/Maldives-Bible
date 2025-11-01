import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdminClient } from './_lib/supabase-admin';

// ---- CORS ----
function setCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with');
  res.setHeader('Access-Control-Max-Age', '86400');
}
function send(res: NextApiResponse, status: number, body?: any) {
  if (!body) return res.status(status).end();
  return res.status(status).json(body);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return send(res, 204);

  try {
    const supabaseAdminClient = getSupabaseAdminClient();

    if (req.method === 'GET') {
      const { profileId } = req.query;
      if (!profileId) return send(res, 400, { error: 'missing profileId' });
      const { data, error } = await supabaseAdminClient
        .from('resort_preferences')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { ok: true, data });
    }

    if (req.method === 'PUT') {
      const { profileId, hiddenIds, customOrder, deletedImageUrls } = req.body;
      if (!profileId) return send(res, 400, { error: 'missing profileId' });

      const payload = {
        profile_id: profileId,
        hidden_ids: hiddenIds || [],
        custom_order: customOrder || [],
        deleted_image_urls: deletedImageUrls || [],
      };

      const { data, error } = await supabaseAdminClient
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
