import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BarChart3, Database, KeyRound, LoaderCircle, RefreshCw } from 'lucide-react';
import type {
  AnalyticsApiError,
  AnalyticsDashboardData,
  AnalyticsRangeDays,
} from '../../analytics/types';
import AnalyticsDashboardView from './AnalyticsDashboardView';
import AnalyticsLogin from './AnalyticsLogin';

type AuthStatus = {
  ok: true;
  configured: boolean;
  authenticated: boolean;
};

const readJson = async <T,>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorBody = body as Partial<AnalyticsApiError>;
    const error = new Error(errorBody.message ?? '요청을 처리하지 못했습니다.') as Error & {
      status?: number;
      code?: string;
      setup?: string[];
    };
    error.status = response.status;
    error.code = errorBody.error;
    error.setup = errorBody.setup;
    throw error;
  }
  return body as T;
};

const ensureMeta = (name: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
};

const FullPageLoader: React.FC = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-5">
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/15">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </span>
      <p className="mt-4 text-sm font-extrabold text-slate-700">분석실을 준비하고 있습니다</p>
    </div>
  </main>
);

const DashboardSkeleton: React.FC = () => (
  <main className="min-h-screen bg-[#f4f7f6] px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-[1480px] animate-pulse space-y-5">
      <div className="h-16 rounded-2xl bg-white" />
      <div className="grid gap-4 lg:grid-cols-3"><div className="h-72 rounded-3xl bg-slate-800 lg:col-span-2" /><div className="h-72 rounded-3xl bg-white" /></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 rounded-2xl bg-white" />)}</div>
      <div className="h-80 rounded-2xl bg-white" />
    </div>
  </main>
);

const SetupPanel: React.FC<{
  message: string;
  setup: string[];
  onRetry: () => void;
}> = ({ message, setup, onRetry }) => (
  <main className="min-h-screen bg-[#f4f7f6] px-4 py-12 sm:px-6">
    <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="bg-slate-950 px-6 py-7 text-white sm:px-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-300">One-time setup</p>
        <h1 className="mt-2 font-brand-heading text-2xl sm:text-3xl">GA4 데이터 연결이 필요합니다</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><KeyRound className="h-5 w-5 text-teal-700" /><p className="mt-3 text-sm font-extrabold">1. 서비스 계정</p><p className="mt-1 text-xs leading-5 text-slate-500">Google Cloud에서 Analytics Data API를 활성화합니다.</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><BarChart3 className="h-5 w-5 text-teal-700" /><p className="mt-3 text-sm font-extrabold">2. GA4 권한</p><p className="mt-1 text-xs leading-5 text-slate-500">서비스 계정 이메일을 GA4 속성 뷰어로 추가합니다.</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><Database className="h-5 w-5 text-teal-700" /><p className="mt-3 text-sm font-extrabold">3. 환경변수</p><p className="mt-1 text-xs leading-5 text-slate-500">Vercel에 속성 ID와 서비스 계정 JSON을 저장합니다.</p></div>
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-800">필요한 환경변수</p>
          <div className="mt-2 space-y-2">
            {(setup.length ? setup : ['GA4_PROPERTY_ID', 'GA4_SERVICE_ACCOUNT_JSON_BASE64']).map(name => (
              <code key={name} className="block overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs font-bold text-teal-200">{name}</code>
            ))}
          </div>
        </div>
        <p className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-xs font-semibold leading-5 text-teal-900">
          측정 ID <strong>G-Y00T1V6W91</strong>이 아니라 GA4 관리자 화면에 표시되는 숫자형 속성 ID가 필요합니다. 서비스 계정 키는 브라우저로 전달되지 않습니다.
        </p>
        <button type="button" onClick={onRetry} className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-extrabold text-white hover:bg-teal-800">
          <RefreshCw className="h-4 w-4" />설정 후 다시 확인
        </button>
      </div>
    </section>
  </main>
);

const AdminAnalyticsApp: React.FC = () => {
  const isDevelopmentPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('preview') === '1';
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [range, setRange] = useState<AnalyticsRangeDays>(28);
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState<(Error & { setup?: string[]; status?: number }) | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestSequence = useRef(0);

  useEffect(() => {
    document.title = '관리자 분석실 | 몰디브 바이블';
    ensureMeta('robots', 'noindex,nofollow,noarchive');
    ensureMeta('googlebot', 'noindex,nofollow,noarchive');
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics-auth', { credentials: 'same-origin', cache: 'no-store' });
      const status = await readJson<AuthStatus>(response);
      setAuth(status);
    } catch {
      setAuth({ ok: true, configured: false, authenticated: false });
    }
  }, []);

  useEffect(() => {
    if (isDevelopmentPreview) {
      void import('../../analytics/demo-data').then(module => {
        setAuth({ ok: true, configured: true, authenticated: true });
        setData(module.DEMO_ANALYTICS_DATA);
      });
      return;
    }
    void checkAuth();
  }, [checkAuth, isDevelopmentPreview]);

  const loadDashboard = useCallback(async (days: AnalyticsRangeDays, force = false) => {
    const sequence = ++requestSequence.current;
    if (force) setIsRefreshing(true);
    else setData(null);
    setDashboardError(null);
    try {
      const query = new URLSearchParams({ range: String(days) });
      if (force) query.set('refresh', '1');
      const response = await fetch(`/api/analytics-dashboard?${query}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const nextData = await readJson<AnalyticsDashboardData>(response);
      if (sequence === requestSequence.current) setData(nextData);
    } catch (error) {
      if (sequence !== requestSequence.current) return;
      const nextError: Error & { setup?: string[]; status?: number } = error instanceof Error
        ? error as Error & { setup?: string[]; status?: number }
        : new Error('분석 데이터를 불러오지 못했습니다.');
      if (nextError.status === 401) {
        setAuth(current => current ? { ...current, authenticated: false } : current);
      } else {
        setDashboardError(nextError);
      }
    } finally {
      if (sequence === requestSequence.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (auth?.authenticated && !isDevelopmentPreview) void loadDashboard(range);
  }, [auth?.authenticated, isDevelopmentPreview, loadDashboard, range]);

  const handleLogin = async (password: string) => {
    const response = await fetch('/api/analytics-auth', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    await readJson(response);
    setAuth({ ok: true, configured: true, authenticated: true });
  };

  const handleLogout = async () => {
    await fetch('/api/analytics-auth', { method: 'DELETE', credentials: 'same-origin' }).catch(() => undefined);
    setData(null);
    setAuth(current => current ? { ...current, authenticated: false } : current);
  };

  if (!auth) return <FullPageLoader />;
  if (!auth.authenticated) return <AnalyticsLogin configured={auth.configured} onLogin={handleLogin} />;
  const isSetupError = Boolean(
    dashboardError
    && (dashboardError.setup || /GA4|환경변수|서비스 계정|속성 ID/i.test(dashboardError.message)),
  );
  if (dashboardError && isSetupError) {
    return <SetupPanel message={dashboardError.message} setup={dashboardError.setup ?? []} onRetry={() => void loadDashboard(range, true)} />;
  }
  if (dashboardError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-4">
        <section className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5">
          <p className="font-brand-heading text-xl text-slate-950">데이터를 불러오지 못했습니다</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{dashboardError.message}</p>
          <button type="button" onClick={() => void loadDashboard(range, true)} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white"><RefreshCw className="h-4 w-4" />다시 시도</button>
        </section>
      </main>
    );
  }
  if (!data) return <DashboardSkeleton />;

  return (
    <AnalyticsDashboardView
      data={data}
      range={range}
      isRefreshing={isRefreshing}
      onRangeChange={setRange}
      onRefresh={() => {
        if (!isDevelopmentPreview) void loadDashboard(range, true);
      }}
      onLogout={() => void handleLogout()}
    />
  );
};

export default AdminAnalyticsApp;
