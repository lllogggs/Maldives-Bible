import type { ApiRequest, ApiResponse } from '../server/api-http';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.local') ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.startsWith('127.') ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('169.254.')
  ) {
    return true;
  }

  const parts = normalized.split('.').map(part => Number(part));
  if (parts.length === 4 && parts.every(part => Number.isInteger(part))) {
    const [first, second] = parts;
    if (first === 172 && second >= 16 && second <= 31) {
      return true;
    }
  }

  return false;
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

  try {
    const r = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return res.status(r.status).end();

    const ct = r.headers.get('content-type') || 'image/jpeg';
    if (!ct.toLowerCase().startsWith('image/')) {
      return res.status(415).json({ error: 'unsupported content type' });
    }

    const contentLength = Number(r.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'image too large' });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'image too large' });
    }

    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).send(buf);
  } catch {
    res.status(500).end();
  }
}
