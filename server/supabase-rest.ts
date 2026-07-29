const DEFAULT_TIMEOUT_MS = 10_000;

type SupabaseRestResult<T> = {
  data: T;
  response: Response;
};

type SupabaseErrorPayload = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

export class SupabaseRestError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'SupabaseRestError';
    this.status = status;
    this.code = code;
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new SupabaseConfigurationError('supabase_not_configured');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new SupabaseConfigurationError('invalid_supabase_url');
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new SupabaseConfigurationError('invalid_supabase_url');
  }

  return {
    restUrl: `${url}/rest/v1`,
    serviceRoleKey,
  };
}

function parseErrorPayload(raw: string): SupabaseErrorPayload {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as SupabaseErrorPayload;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return { message: raw };
  }
}

export async function supabaseRestRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<SupabaseRestResult<T>> {
  const { restUrl, serviceRoleKey } = getSupabaseConfig();
  const normalizedPath = path.replace(/^\/+/, '');
  const headers = new Headers(init.headers);

  headers.set('Accept', headers.get('Accept') ?? 'application/json');
  headers.set('apikey', serviceRoleKey);
  headers.set('Authorization', `Bearer ${serviceRoleKey}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${restUrl}/${normalizedPath}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  const raw = await response.text();
  if (!response.ok) {
    const payload = parseErrorPayload(raw);
    throw new SupabaseRestError(
      response.status,
      payload.message || `supabase_request_failed_${response.status}`,
      payload.code,
    );
  }

  let data: T;
  if (!raw) {
    data = undefined as T;
  } else {
    try {
      data = JSON.parse(raw) as T;
    } catch {
      throw new SupabaseRestError(response.status, 'invalid_supabase_response');
    }
  }

  return { data, response };
}
