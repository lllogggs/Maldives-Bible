import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { ApiRequest } from './api-http';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 400;
const TOKEN_HEADER = 'x-resort-profile-token';

type ProfileTokenPayload = {
  profileId: string;
  exp: number;
};

function getSigningSecret() {
  return process.env.RESORT_PROFILE_TOKEN_SECRET || '';
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createProfileSession() {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error('profile token secret is not configured');
  }

  const profileId = randomUUID();
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = toBase64Url(JSON.stringify({ profileId, exp } satisfies ProfileTokenPayload));
  const signature = signPayload(payload, secret);

  return {
    profileId,
    token: `${payload}.${signature}`,
  };
}

function getHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getProfileToken(req: ApiRequest) {
  const directToken = getHeaderValue(req.headers[TOKEN_HEADER]);
  if (directToken) {
    return directToken;
  }

  const authorization = getHeaderValue(req.headers.authorization);
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

export function normalizeProfileId(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || normalized.length > 128 || !/^[a-zA-Z0-9:_-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function verifyProfileToken(profileId: string, token: string | undefined) {
  if (process.env.RESORT_ALLOW_LEGACY_PROFILE_IDS === 'true') {
    return true;
  }

  const secret = getSigningSecret();
  if (!secret || !token) {
    return false;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(payload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as ProfileTokenPayload;
    return parsed.profileId === profileId && parsed.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function requireProfileAccess(req: ApiRequest, rawProfileId: unknown) {
  const profileId = normalizeProfileId(rawProfileId);
  if (!profileId) {
    return { ok: false as const, status: 400, error: 'invalid profileId' };
  }

  const token = getProfileToken(req);
  if (!verifyProfileToken(profileId, token)) {
    return { ok: false as const, status: 401, error: 'invalid profile token' };
  }

  return { ok: true as const, profileId };
}
