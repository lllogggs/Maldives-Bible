import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*'); // 필요시 특정 도메인으로 제한
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(401).json({ error: 'Missing Supabase environment variables' });
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/resort_preferences?select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const body = await r.json();
    return res.status(r.ok ? 200 : r.status).json(body);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error' });
  }
}
