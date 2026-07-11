import type { ApiRequest, ApiResponse } from '../server/api-http';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isBlockedIpv4(address: string) {
  const parts = address.split('.').map(part => Number(part));
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [first, second, third] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
  );
}

function isBlockedIpAddress(address: string) {
  const normalized = address.toLowerCase().split('%')[0];
  const version = isIP(normalized);
  if (version === 4) {
    return isBlockedIpv4(normalized);
  }
  if (version !== 6) {
    return true;
  }

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (isIP(mapped) === 4) {
      return isBlockedIpv4(mapped);
    }

    const groups = mapped.split(':');
    if (groups.length === 2 && groups.every(group => /^[0-9a-f]{1,4}$/.test(group))) {
      const high = Number.parseInt(groups[0], 16);
      const low = Number.parseInt(groups[1], 16);
      return isBlockedIpv4(
        `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`
      );
    }
  }

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe') ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8:')
  );
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.local') ||
    normalized === '0.0.0.0' ||
    normalized === '::1'
  ) {
    return true;
  }

  if (isIP(normalized)) {
    return isBlockedIpAddress(normalized);
  }

  return false;
}

async function resolvesOnlyToPublicAddresses(hostname: string) {
  if (isBlockedHostname(hostname)) {
    return false;
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isBlockedIpAddress(address));
  } catch {
    return false;
  }
}

function parseImageUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    if (isBlockedHostname(parsed.hostname)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const url = getQueryParam(req.query.url);
  if (!url) return res.status(400).json({ error: 'missing url' });

  const imageUrl = parseImageUrl(url);
  if (!imageUrl) return res.status(400).json({ error: 'invalid image url' });
  if (!(await resolvesOnlyToPublicAddresses(imageUrl.hostname))) {
    return res.status(400).json({ error: 'blocked image host' });
  }

  try {
    const r = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (r.status >= 300 && r.status < 400) {
      return res.status(400).json({ error: 'image redirects are not allowed' });
    }
    if (!r.ok) return res.status(r.status).end();

    const ct = r.headers.get('content-type') || 'image/jpeg';
    if (!ct.toLowerCase().startsWith('image/')) {
      return res.status(415).json({ error: 'unsupported content type' });
    }

    const contentLength = Number(r.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'image too large' });
    }

    if (!r.body) {
      return res.status(502).json({ error: 'empty image response' });
    }

    const reader = r.body.getReader();
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return res.status(413).json({ error: 'image too large' });
      }
      chunks.push(Buffer.from(value));
    }
    const buf = Buffer.concat(chunks, totalBytes);

    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).send(buf);
  } catch {
    res.status(502).end();
  }
}
