import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl =
  resolveSupabaseUrl(process.env.SUPABASE_URL) ??
  resolveSupabaseUrl('https://supabase.com/dashboard/project/gfontovgnwckmmyyjbom');

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmb250b3Znbndja21teXlqYm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ4MTQ3NiwiZXhwIjoyMDc3MDU3NDc2fQ.g373kdD4XL-LI4H_ee27A_a-rUbJGmLhsGd6TYHE93c';
const tableName = process.env.RESORT_PREFERENCES_TABLE ?? 'resort_preferences';
const profileId = process.env.RESORT_PREFERENCES_PROFILE_ID ?? 'public';
const allowedOrigins = (process.env.RESORT_PREFERENCES_ALLOWED_ORIGINS ?? 'https://lllogggs.github.io')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

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
  const { data, error } = await supabase
    .from(tableName)
    .select('hidden_ids, custom_order')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
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

  const { error } = await supabase
    .from(tableName)
    .upsert(dataToSave, { onConflict: 'profile_id' });

  if (error) {
    throw error;
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
    console.error('Failed to handle resort preferences request', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
