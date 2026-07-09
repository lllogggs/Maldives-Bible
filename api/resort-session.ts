import type { ApiRequest, ApiResponse } from '../server/api-http';
import { createProfileSession } from '../server/profile-token';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-requested-with, x-resort-profile-token');
  res.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

function send(res: ApiResponse, status: number, body?: any) {
  if (!body) return res.status(status).end();
  return res.status(status).json(body);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!setCors(req, res)) {
    return send(res, 403, { error: 'origin not allowed' });
  }
  if (req.method === 'OPTIONS') {
    return send(res, 204);
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    return send(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    return send(res, 200, { ok: true, data: createProfileSession() });
  } catch (error: any) {
    return send(res, 503, { error: error?.message ?? 'session unavailable' });
  }
}
