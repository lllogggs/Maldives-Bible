import type { NextApiRequest, NextApiResponse } from 'next';

// ---- CORS 공통 설정 ----
function setCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ---- API Handler ----
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'PUT') {
    const body = req.body;
    // TODO: Supabase 저장 로직 추가
    res.status(200).json({ ok: true, received: body });
    return;
  }

  res.setHeader('Allow', 'GET,PUT,OPTIONS');
  res.status(405).end('Method Not Allowed');
}
