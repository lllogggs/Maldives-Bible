import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type PreferencesPayload = {
  hidden_ids: number[];
  custom_order: number[];
};

const resolveSupabaseUrl = (rawUrl: string | undefined): string | null => {
  if (!rawUrl) {
    return null;
  }

  const trimmed = rawUrl.replace(/\/$/, '');

  if (/\.supabase\.co$/i.test(trimmed)) {
    return trimmed;
  }

  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  return trimmed;
};

const supabaseUrl = resolveSupabaseUrl(process.env.SUPABASE_URL);

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = process.env.RESORT_PREFERENCES_TABLE ?? 'resort_preferences';
const profileId = process.env.RESORT_PREFERENCES_PROFILE_ID ?? 'public';
const allowedOrigins = (process.env.RESORT_PREFERENCES_ALLOWED_ORIGINS ?? 'https://lllogggs.github.io')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

class SupabaseAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseAuthorizationError';
  }
}

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

const ensureSupabaseClient = () => {
  if (!supabase) {
    throw new SupabaseConfigurationError(
      'Supabase가 설정되지 않았습니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경 변수를 확인해주세요.'
    );
  }

  return supabase;
};

const normalizePostgrestError = (error: PostgrestError): never => {
  const code = error.code?.toUpperCase();
  const message = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase();

  if (
    code === '42501' ||
    code === 'PGRST301' ||
    message.includes('permission') ||
    message.includes('api key') ||
    (message.includes('key') && message.includes('invalid'))
  ) {
    throw new SupabaseAuthorizationError(
      'Supabase 자격 증명이 거부되었습니다. 서비스 롤 키와 RLS 정책을 확인해주세요.'
    );
  }

  throw error;
};

const isAllowedOrigin = (origin: string | undefined): origin is string => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.some(allowed => allowed === origin);
};

const setCorsHeaders = (res: VercelResponse, origin: string | undefined) => {
  if (!origin) {
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
};

const ensureArrayOfNumbers = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => (typeof item === 'number' ? item : Number(item)))
    .filter(item => Number.isFinite(item));
};

const getPreferences = async (): Promise<PreferencesPayload> => {
  const client = ensureSupabaseClient();

  const { data, error } = await client
    .from(tableName)
    .select('hidden_ids, custom_order')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    normalizePostgrestError(error);
  }

  return {
    hidden_ids: ensureArrayOfNumbers(data?.hidden_ids) ?? [],
    custom_order: ensureArrayOfNumbers(data?.custom_order) ?? [],
  };
};

const upsertPreferences = async (payload: PreferencesPayload): Promise<PreferencesPayload> => {
  const dataToSave: PreferencesPayload & { profile_id: string } = {
    profile_id: profileId,
    hidden_ids: ensureArrayOfNumbers(payload.hidden_ids),
    custom_order: ensureArrayOfNumbers(payload.custom_order),
  };

  const client = ensureSupabaseClient();

  const { error } = await client
    .from(tableName)
    .upsert(dataToSave, { onConflict: 'profile_id' });

  if (error) {
    normalizePostgrestError(error);
  }

  return {
    hidden_ids: dataToSave.hidden_ids,
    custom_order: dataToSave.custom_order,
  };
};

const parseRequestBody = (req: VercelRequest): PreferencesPayload => {
  if (!req.body) {
    return { hidden_ids: [], custom_order: [] };
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return { hidden_ids: [], custom_order: [] };
    }
  }

  return req.body as PreferencesPayload;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;

  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) {
      return res.status(403).end();
    }

    if (origin) {
      setCorsHeaders(res, origin);
    }
    return res.status(204).end();
  }

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (origin) {
    setCorsHeaders(res, origin);
  }

  try {
    switch (req.method) {
      case 'GET': {
        const preferences = await getPreferences();
        return res.status(200).json(preferences);
      }
      case 'PUT': {
        const payload = parseRequestBody(req);
        const updated = await upsertPreferences(payload);
        return res.status(200).json(updated);
      }
      default:
        res.setHeader('Allow', 'GET,PUT,OPTIONS');
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      console.error('Supabase configuration error', error.message);
      return res.status(503).json({ error: error.message });
    }

    if (error instanceof SupabaseAuthorizationError) {
      console.error('Supabase authorization error', error.message);
      return res.status(502).json({ error: error.message });
    }

    console.error('Failed to handle resort preferences request', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
