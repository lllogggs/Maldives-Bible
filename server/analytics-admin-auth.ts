import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './api-http';

const COOKIE_NAME = 'mb_analytics_admin';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const MIN_PASSWORD_LENGTH = 12;

const getHeaderValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getPassword = () => process.env.ANALYTICS_ADMIN_PASSWORD ?? '';

const getSigningKey = () =>
  createHash('sha256')
    .update('maldives-bible:analytics-admin-session\0')
    .update(getPassword())
    .digest();

const sign = (value: string) =>
  createHmac('sha256', getSigningKey()).update(value).digest('base64url');

const safeEqual = (left: string, right: string) => {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
};

const parseCookies = (header: string | undefined) => {
  const cookies = new Map<string, string>();
  if (!header) return cookies;

  header.split(';').forEach(part => {
    const separator = part.indexOf('=');
    if (separator < 1) return;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies.set(key, value);
  });
  return cookies;
};

const shouldUseSecureCookie = (req: ApiRequest) => {
  const forwardedProtocol = getHeaderValue(req.headers['x-forwarded-proto']);
  if (forwardedProtocol) return forwardedProtocol.split(',')[0].trim() === 'https';
  const host = getHeaderValue(req.headers.host) ?? '';
  return !/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
};

const serializeCookie = (
  req: ApiRequest,
  value: string,
  maxAge: number,
) => {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ];
  if (shouldUseSecureCookie(req)) parts.push('Secure');
  return parts.join('; ');
};

export const isAnalyticsAdminConfigured = () =>
  getPassword().length >= MIN_PASSWORD_LENGTH;

export const verifyAnalyticsAdminPassword = (candidate: string) => {
  if (!isAnalyticsAdminConfigured()) return false;
  return safeEqual(candidate, getPassword());
};

export const createAnalyticsAdminSession = () => {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const nonce = randomBytes(18).toString('base64url');
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
};

export const isAnalyticsAdminAuthenticated = (req: ApiRequest) => {
  if (!isAnalyticsAdminConfigured()) return false;
  const token = parseCookies(getHeaderValue(req.headers.cookie)).get(COOKIE_NAME);
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expiresAtRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${expiresAtRaw}.${nonce}`;
  return safeEqual(signature, sign(payload));
};

export const setAnalyticsAdminSessionCookie = (
  req: ApiRequest,
  res: ApiResponse,
  token: string,
) => {
  res.setHeader('Set-Cookie', serializeCookie(req, token, SESSION_MAX_AGE_SECONDS));
};

export const clearAnalyticsAdminSessionCookie = (req: ApiRequest, res: ApiResponse) => {
  res.setHeader('Set-Cookie', serializeCookie(req, '', 0));
};

export const setPrivateAnalyticsHeaders = (res: ApiResponse) => {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Cookie');
};
