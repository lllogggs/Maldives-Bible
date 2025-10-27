import type { NextApiRequest, NextApiResponse } from 'next';

// ---- CORS 공통 ----
function setCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = (req.headers.origin as string) || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// 통일 응답 헬퍼: 어떤 status든 CORS 유지
function send(res: NextApiResponse, status: number, body?: any) {
  if (body === undefined || body === null) return res.status(status).end();
  return res.status(status).json(body);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return send(res, 204);

  try {
    if (req.method === 'GET') {
      // TODO: 인증 필요하면 검사하되 실패 시에도 send(res, 401, {...})
      return send(res, 200, { ok: true });
    }

    if (req.method === 'PUT') {
      // TODO: 인증/권한 체크 (실패 시에도 send(res, 401, {...}))
      const body = req.body;
      // TODO: Supabase 저장 로직
      return send(res, 200, { ok: true, received: body });
    }

    res.setHeader('Allow', 'GET,PUT,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  } catch (e: any) {
    return send(res, 500, { error: 'internal_error', detail: e?.message });
  }
}
