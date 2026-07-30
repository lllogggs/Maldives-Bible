import type { ApiRequest, ApiResponse } from '../server/api-http';
import {
  clearAnalyticsAdminSessionCookie,
  createAnalyticsAdminSession,
  isAnalyticsAdminAuthenticated,
  isAnalyticsAdminConfigured,
  setAnalyticsAdminSessionCookie,
  setPrivateAnalyticsHeaders,
  verifyAnalyticsAdminPassword,
} from '../server/analytics-admin-auth.js';

const send = (res: ApiResponse, status: number, body?: unknown) => {
  if (body === undefined) return res.status(status).end();
  return res.status(status).json(body);
};

const readPassword = (body: unknown) => {
  if (!body || typeof body !== 'object') return '';
  const password = (body as { password?: unknown }).password;
  return typeof password === 'string' ? password : '';
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setPrivateAnalyticsHeaders(res);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      configured: isAnalyticsAdminConfigured(),
      authenticated: isAnalyticsAdminAuthenticated(req),
    });
  }

  if (req.method === 'POST') {
    if (!isAnalyticsAdminConfigured()) {
      return send(res, 503, {
        error: 'analytics_admin_not_configured',
        message: 'ANALYTICS_ADMIN_PASSWORD 환경변수를 12자 이상으로 설정해 주세요.',
      });
    }

    if (!verifyAnalyticsAdminPassword(readPassword(req.body))) {
      return send(res, 401, {
        error: 'invalid_password',
        message: '비밀번호가 올바르지 않습니다.',
      });
    }

    setAnalyticsAdminSessionCookie(req, res, createAnalyticsAdminSession());
    return send(res, 200, { ok: true, authenticated: true });
  }

  if (req.method === 'DELETE') {
    clearAnalyticsAdminSessionCookie(req, res);
    return send(res, 200, { ok: true, authenticated: false });
  }

  res.setHeader('Allow', 'GET,POST,DELETE');
  return send(res, 405, { error: 'method_not_allowed' });
}
