import React, { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  ExternalLink,
  Eye,
  LogOut,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Route,
  Smartphone,
  Tablet,
  Target,
  Users,
} from 'lucide-react';
import type {
  AnalyticsDashboardData,
  AnalyticsRangeDays,
  AnalyticsTrendPoint,
} from '../../analytics/types';

interface AnalyticsDashboardViewProps {
  data: AnalyticsDashboardData;
  range: AnalyticsRangeDays;
  isRefreshing: boolean;
  onRangeChange: (range: AnalyticsRangeDays) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

const numberFormatter = new Intl.NumberFormat('ko-KR');
const compactFormatter = new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 });
const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatNumber = (value: number) => numberFormatter.format(Math.round(value));
const formatPercent = (value: number | null, digits = 1) =>
  value === null ? '수집 중' : `${(value * 100).toFixed(digits)}%`;

const formatDuration = (seconds: number) => {
  const rounded = Math.max(0, Math.round(seconds));
  if (rounded < 60) return `${rounded}초`;
  const minutes = Math.floor(rounded / 60);
  const remains = rounded % 60;
  return remains ? `${minutes}분 ${remains}초` : `${minutes}분`;
};

const pageLabel = (path: string) => {
  const normalized = path.replace(/\/+$/, '') || '/';
  if (normalized === '/') return '홈';
  if (normalized === '/start') return '여행 시작하기';
  if (normalized === '/maldives-resort-comparison') return '리조트 목록';
  if (normalized === '/maldives-resort-comparison/compare') return '리조트 비교';
  if (normalized === '/quote-comparison') return '여행사 견적 비교';
  if (normalized === '/flight-guide') return '항공 가이드';
  if (normalized.startsWith('/resorts/')) return `리조트 상세 · ${normalized.split('/').filter(Boolean).at(-1)}`;
  return path;
};

const channelLabel = (value: string) => {
  const labels: Record<string, string> = {
    Direct: '직접 방문',
    'Organic Search': '자연 검색',
    'Organic Social': '소셜',
    Referral: '추천 링크',
    'Paid Search': '유료 검색',
    Email: '이메일',
    Unassigned: '미분류',
  };
  return labels[value] ?? value;
};

const deviceLabel = (value: string) => {
  const labels: Record<string, string> = { desktop: 'PC', mobile: '모바일', tablet: '태블릿' };
  return labels[value.toLowerCase()] ?? value;
};

const ChangeBadge: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) return <span className="text-xs font-bold text-slate-400">비교 데이터 없음</span>;
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold ${positive ? 'text-teal-700' : 'text-rose-600'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {Math.abs(value * 100).toFixed(1)}%
      <span className="ml-1 font-semibold text-slate-400">이전 기간</span>
    </span>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  detail: string;
  change?: number | null;
  icon: React.ReactNode;
}> = ({ label, value, detail, change, icon }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-extrabold tracking-[-0.01em] text-slate-500">{label}</p>
        <p className="mt-2 font-brand-heading text-[1.75rem] leading-none text-slate-950">{value}</p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">{icon}</span>
    </div>
    <div className="mt-4 flex min-h-5 flex-wrap items-center justify-between gap-2">
      <span className="text-xs font-semibold text-slate-400">{detail}</span>
      {change !== undefined ? <ChangeBadge value={change} /> : null}
    </div>
  </article>
);

const TrendChart: React.FC<{ points: AnalyticsTrendPoint[] }> = ({ points }) => {
  const width = 920;
  const height = 270;
  const padding = { left: 46, right: 22, top: 22, bottom: 38 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxSessions = Math.max(...points.map(point => point.sessions), 1);
  const maxIntent = Math.max(...points.map(point => Math.max(point.quoteViews, point.agencyClicks)), 1);
  const x = (index: number) => padding.left + (points.length <= 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
  const y = (value: number) => padding.top + chartHeight - (value / maxSessions) * chartHeight;
  const intentY = (value: number) => padding.top + chartHeight - (value / maxIntent) * (chartHeight * 0.72);
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.sessions)}`).join(' ');
  const area = points.length
    ? `${line} L ${x(points.length - 1)} ${padding.top + chartHeight} L ${x(0)} ${padding.top + chartHeight} Z`
    : '';
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  if (!points.length) {
    return <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-400">표시할 일별 데이터가 없습니다.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-teal-600" />방문 세션</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-400" />견적비교 조회</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />여행사 클릭</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="기간별 방문 세션, 견적비교 조회와 여행사 클릭 추이">
        <defs>
          <linearGradient id="session-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(step => {
          const gridY = padding.top + chartHeight * step;
          return <line key={step} x1={padding.left} x2={width - padding.right} y1={gridY} y2={gridY} stroke="#e2e8f0" strokeDasharray="4 5" />;
        })}
        {points.map((point, index) => {
          const barWidth = Math.max(5, Math.min(12, chartWidth / points.length / 2.2));
          const top = intentY(point.quoteViews);
          return (
            <rect
              key={`quote-bar-${point.date}`}
              x={x(index) - barWidth / 2}
              y={top}
              width={barWidth}
              height={padding.top + chartHeight - top}
              rx={barWidth / 2}
              fill="#818cf8"
              opacity={point.quoteViews > 0 ? 0.78 : 0.12}
            />
          );
        })}
        <path d={area} fill="url(#session-area)" />
        <path d={line} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.date}>
            <circle cx={x(index)} cy={y(point.sessions)} r="3.5" fill="#fff" stroke="#0f766e" strokeWidth="2.5" />
            {point.agencyClicks > 0 ? (
              <circle cx={x(index)} cy={intentY(point.agencyClicks)} r="3.2" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
            ) : null}
            {(index % labelEvery === 0 || index === points.length - 1) ? (
              <text x={x(index)} y={height - 12} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
                {point.date.slice(5).replace('-', '.')}
              </text>
            ) : null}
          </g>
        ))}
        <text x={padding.left - 8} y={padding.top + 3} textAnchor="end" fill="#94a3b8" fontSize="10">{compactFormatter.format(maxSessions)}</text>
        <text x={padding.left - 8} y={padding.top + chartHeight} textAnchor="end" fill="#94a3b8" fontSize="10">0</text>
      </svg>
    </div>
  );
};

const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm font-semibold leading-6 text-slate-400">
    {children}
  </div>
);

const SectionTitle: React.FC<{ eyebrow: string; title: string; description?: string }> = ({ eyebrow, title, description }) => (
  <div>
    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
    <h2 className="mt-1 font-brand-heading text-xl text-slate-950">{title}</h2>
    {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
  </div>
);

const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  data,
  range,
  isRefreshing,
  onRangeChange,
  onRefresh,
  onLogout,
}) => {
  const { current, change } = data.summary;
  const detectedExits = useMemo(
    () => data.journeys.exits.reduce((sum, row) => sum + row.exits, 0),
    [data.journeys.exits],
  );
  const totalDeviceUsers = Math.max(data.devices.reduce((sum, row) => sum + row.users, 0), 1);
  const trackingLabel = data.agencies.trackingMode === 'custom'
    ? '정밀 추적 중'
    : data.agencies.trackingMode === 'legacy'
      ? '기존 클릭 추정'
      : '데이터 수집 중';
  const quote = data.quoteComparison.summary;
  const quoteTrackingLabel = quote.trackingMode === 'precise'
    ? '최초 도달 정밀 추적 중'
    : quote.trackingMode === 'basic'
      ? '견적비교 조회 추적 중'
      : quote.trackingMode === 'legacy'
        ? '기존 조회 데이터'
        : '데이터 수집 중';
  const peakQuoteHours = useMemo(
    () => [...data.quoteComparison.hourly]
      .filter(row => row.entries > 0)
      .sort((left, right) => right.entries - left.entries)
      .slice(0, 6),
    [data.quoteComparison.hourly],
  );
  const maxQuoteHourEntries = Math.max(...peakQuoteHours.map(row => row.entries), 1);

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/brand/maldives-bible-logo.png" alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm" />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-700">Owner analytics</p>
              <h1 className="truncate font-brand-heading text-lg text-slate-950 sm:text-xl">몰디브 바이블 분석실</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl bg-slate-100 p-1 sm:flex" aria-label="조회 기간">
              {([7, 28, 90] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={range === days}
                  onClick={() => onRangeChange(days)}
                  className={`h-9 rounded-lg px-3 text-xs font-extrabold transition ${range === days ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {days}일
                </button>
              ))}
            </div>
            <button type="button" onClick={onRefresh} disabled={isRefreshing} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait" aria-label="데이터 새로고침">
              <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={onLogout} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-rose-600" aria-label="로그아웃">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
        <div className="flex border-t border-slate-100 px-4 py-2 sm:hidden" aria-label="모바일 조회 기간">
          {([7, 28, 90] as const).map(days => (
            <button key={days} type="button" aria-pressed={range === days} onClick={() => onRangeChange(days)} className={`h-9 flex-1 rounded-lg text-xs font-extrabold ${range === days ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>
              {days}일
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{data.range.start} — {data.range.end}</p>
            <h2 className="mt-1 font-brand-heading text-2xl text-slate-950 sm:text-3xl">견적비교까지 도달하고 여행사로 연결되는지</h2>
          </div>
          <p className="text-xs font-semibold text-slate-400" aria-live="polite">
            {dateTimeFormatter.format(new Date(data.generatedAt))} 갱신 · {data.cacheStatus === 'hit' ? '캐시' : '새 데이터'}
          </p>
        </div>

        {data.warnings.length ? (
          <details className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <summary className="cursor-pointer font-extrabold">수집 상태 안내 {data.warnings.length}건</summary>
            <ul className="mt-2 space-y-1 pl-5 text-xs font-semibold leading-5">
              {data.warnings.map(warning => <li key={warning} className="list-disc">{warning}</li>)}
            </ul>
          </details>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)]">
          <article className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#071a1d_0%,#0f3f42_52%,#0f766e_100%)] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute bottom-[-90px] left-[35%] h-52 w-52 rounded-full bg-teal-300/10 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold text-teal-50 ring-1 ring-white/15">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />광고 핵심 지표 · {quoteTrackingLabel}
                  </span>
                  <p className="mt-5 text-sm font-bold text-teal-100/80">견적비교 도달 사용자</p>
                  <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                    <strong className="font-brand-heading text-5xl leading-none sm:text-6xl">{formatNumber(quote.users)}</strong>
                    <span className="pb-1 text-sm font-bold text-teal-100">명</span>
                  </div>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Target className="h-6 w-6 text-amber-300" />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-black/15 p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold text-teal-100/70">도달 세션</p>
                  <p className="mt-1 font-brand-heading text-2xl">{formatNumber(quote.sessions)}</p>
                </div>
                <div className="rounded-2xl bg-black/15 p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold text-teal-100/70">전체 방문 중</p>
                  <p className="mt-1 font-brand-heading text-2xl">{formatPercent(quote.reachRate)}</p>
                </div>
                <div className="rounded-2xl bg-black/15 p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold text-teal-100/70">평균 최초 도달</p>
                  <p className="mt-1 font-brand-heading text-2xl">{quote.averageSecondsToReach === null ? '수집 중' : formatDuration(quote.averageSecondsToReach)}</p>
                </div>
                <div className="rounded-2xl bg-black/15 p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold text-teal-100/70">여행사 연결 세션</p>
                  <p className="mt-1 font-brand-heading text-2xl">{quote.agencyClickRate === null ? '수집 중' : formatNumber(quote.agencyClickSessions)}</p>
                </div>
              </div>
              <p className="text-xs font-semibold leading-5 text-teal-50/75">
                {quote.agencyClickRate === null
                  ? '견적비교 도달과 여행사 연결을 같은 기준으로 수집한 뒤 신뢰 가능한 전환율을 표시합니다.'
                  : `${data.range.label} 동안 견적비교에 도달한 세션의 ${formatPercent(quote.agencyClickRate)}가 여행사 홈페이지 또는 카카오 버튼을 눌렀습니다.`}
              </p>
            </div>
          </article>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <KpiCard label="여행사 버튼 클릭" value={formatNumber(data.agencies.clicks)} detail={`${trackingLabel} · ${data.agencies.clickUsers === null ? '사용자 집계 중' : `${formatNumber(data.agencies.clickUsers)}명`}`} icon={<MousePointerClick className="h-5 w-5" />} />
            <KpiCard label="평균 체류" value={formatDuration(current.averageSessionDuration)} detail="세션당 평균" change={change.averageSessionDuration} icon={<Clock3 className="h-5 w-5" />} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="활성 사용자" value={formatNumber(current.activeUsers)} detail={`신규 ${formatNumber(current.newUsers)}명`} change={change.activeUsers} icon={<Users className="h-5 w-5" />} />
          <KpiCard label="참여율" value={formatPercent(current.engagementRate)} detail={`참여 세션 ${formatNumber(current.engagedSessions)}`} change={change.engagementRate} icon={<BarChart3 className="h-5 w-5" />} />
          <KpiCard label="세션당 화면" value={current.screenPageViewsPerSession.toFixed(1)} detail={`전체 ${formatNumber(current.screenPageViews)}회`} change={change.screenPageViewsPerSession} icon={<Eye className="h-5 w-5" />} />
          <KpiCard label="감지된 이탈" value={formatNumber(detectedExits)} detail="브라우저 종료·이동 감지" icon={<Route className="h-5 w-5" />} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionTitle eyebrow="High-intent funnel" title="방문 → 견적비교 → 여행사 연결" description="광고주에게 보여줄 때는 중복 가능한 클릭 횟수보다 세션 기준 전환을 먼저 봅니다." />
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700">총 버튼 클릭 {formatNumber(quote.agencyClicks)}회</span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { step: '1', label: '전체 방문 세션', value: formatNumber(current.sessions), rate: '전체 방문' },
              { step: '2', label: '견적비교 도달 세션', value: formatNumber(quote.sessions), rate: `도달률 ${formatPercent(quote.reachRate)}` },
              { step: '3', label: '여행사 연결 세션', value: quote.agencyClickRate === null ? '—' : formatNumber(quote.agencyClickSessions), rate: quote.agencyClickRate === null ? '정밀 추적 후 표시' : `견적→연결 ${formatPercent(quote.agencyClickRate)}` },
            ].map((item, index) => (
              <article key={item.step} className={`relative overflow-hidden rounded-2xl border p-5 ${index === 1 ? 'border-indigo-200 bg-indigo-50/60' : index === 2 ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50/70'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-slate-500 shadow-sm">{item.step}</span>
                  <span className="text-xs font-extrabold text-slate-500">{item.rate}</span>
                </div>
                <p className="mt-5 text-sm font-extrabold text-slate-700">{item.label}</p>
                <p className="mt-1 font-brand-heading text-4xl text-slate-950">{item.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
            <SectionTitle eyebrow="Entry route" title="어디에서 견적비교로 왔나" description="바로 직전에 본 화면과 눌렀던 진입 위치를 함께 표시합니다." />
            <div className="mt-5 space-y-3">
              {data.quoteComparison.entrySources.length ? data.quoteComparison.entrySources.slice(0, 8).map((row, index) => (
                <div key={`${row.sourceId}-${row.fromPath}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">{row.label}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                        {row.kind === 'direct' ? '견적비교에서 방문 시작' : row.kind === 'external' ? row.fromPath : `${pageLabel(row.fromPath)}에서 이동`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold text-indigo-700">{formatNumber(row.sessions)}세션</p>
                      <p className="text-[10px] font-bold text-slate-400">{formatPercent(row.share)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(2, (row.share ?? 0) * 100))}%` }} />
                  </div>
                </div>
              )) : <EmptyState>견적비교 진입 경로가 쌓이면 여기에 표시됩니다.</EmptyState>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
            <SectionTitle eyebrow="Arrival time" title="언제 견적비교를 보나" description="견적비교 조회가 많이 발생한 시간대 순위입니다. GA4 속성 시간대를 기준으로 합니다." />
            <div className="mt-5 space-y-3">
              {peakQuoteHours.length ? peakQuoteHours.map((row, index) => (
                <div key={row.hour} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-400">{index + 1}위</span>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-sm font-extrabold text-slate-800">{row.label}</span>
                      <span className="text-xs font-bold text-slate-400">{formatPercent(row.share)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.max(4, (row.entries / maxQuoteHourEntries) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="min-w-12 text-right text-sm font-extrabold text-slate-900">{formatNumber(row.entries)}회</span>
                </div>
              )) : <EmptyState>시간대별 견적비교 데이터가 아직 없습니다.</EmptyState>}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionTitle eyebrow="Trend" title="방문·견적비교·여행사 클릭 추이" description="견적비교 관심이 어느 날 높아지고 실제 여행사 연결로 이어지는지 비교합니다." />
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-500">{data.range.label}</span>
          </div>
          <div className="mt-6"><TrendChart points={data.trend} /></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.035]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
            <SectionTitle eyebrow="Conversion" title="여행사별 연결 성과" description="버튼을 실제로 본 횟수와 홈페이지·카카오 클릭을 분리했습니다." />
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800">{data.agencies.rows.length}개 여행사</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">여행사</th>
                  <th className="px-4 py-3.5 text-right">노출</th>
                  <th className="px-4 py-3.5 text-right">전체 클릭</th>
                  <th className="px-4 py-3.5 text-right">클릭률</th>
                  <th className="px-4 py-3.5 text-right">홈페이지</th>
                  <th className="px-6 py-3.5 text-right">카카오</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.agencies.rows.map((agency, index) => (
                  <tr key={agency.id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold ${index === 0 && agency.clicks > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                        <span className="font-extrabold text-slate-900">{agency.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-bold text-slate-600">{formatNumber(agency.impressions)}</td>
                    <td className="px-4 py-4 text-right font-brand-heading text-lg text-slate-950">{formatNumber(agency.clicks)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${agency.clickRate === null ? 'bg-slate-100 text-slate-400' : 'bg-teal-50 text-teal-800'}`}>{formatPercent(agency.clickRate)}</span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-extrabold text-slate-700">{formatNumber(agency.website.clicks)}</td>
                    <td className="px-6 py-4 text-right text-sm font-extrabold text-[#6b5510]">{formatNumber(agency.kakao.clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.035]">
            <div className="border-b border-slate-100 p-5 sm:p-6"><SectionTitle eyebrow="Acquisition" title="어떤 유입이 견적까지 이어졌나" description="유입경로별 견적비교 도달과 여행사 클릭 전환을 함께 봅니다." /></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500">
                  <tr><th className="px-5 py-3">유입경로</th><th className="px-3 py-3 text-right">전체 세션</th><th className="px-3 py-3 text-right">견적 도달</th><th className="px-3 py-3 text-right">견적 도달률</th><th className="px-3 py-3 text-right">참여율</th><th className="px-3 py-3 text-right">평균 체류</th><th className="px-5 py-3 text-right">여행사 클릭률</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.acquisition.slice(0, 12).map(row => (
                    <tr key={`${row.channel}-${row.sourceMedium}`}>
                      <td className="px-5 py-3.5"><span className="block text-sm font-extrabold text-slate-900">{channelLabel(row.channel)}</span><span className="mt-0.5 block text-xs text-slate-400">{row.sourceMedium}</span></td>
                      <td className="px-3 py-3.5 text-right text-sm font-bold">{formatNumber(row.sessions)}</td>
                      <td className="px-3 py-3.5 text-right text-sm font-extrabold text-indigo-700">{formatNumber(row.quoteSessions)}</td>
                      <td className="px-3 py-3.5 text-right text-sm font-extrabold text-indigo-700">{formatPercent(row.quoteReachRate)}</td>
                      <td className="px-3 py-3.5 text-right text-sm font-bold text-slate-600">{formatPercent(row.engagementRate)}</td>
                      <td className="px-3 py-3.5 text-right text-sm font-bold text-slate-600">{formatDuration(row.averageSessionDuration)}</td>
                      <td className="px-5 py-3.5 text-right"><span className="font-extrabold text-teal-700">{formatPercent(row.agencyClickRate)}</span><span className="ml-1 text-xs text-slate-400">({formatNumber(row.agencyClicks)})</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
            <SectionTitle eyebrow="Landing" title="처음 들어온 페이지" description="사용자 세션이 시작된 페이지 순위입니다." />
            <div className="mt-5 space-y-2.5">
              {data.landingPages.length ? data.landingPages.slice(0, 8).map((row, index) => (
                <div key={row.path} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-slate-500 shadow-sm">{index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-slate-800">{pageLabel(row.path)}</p><p className="truncate text-xs text-slate-400">{row.path}</p></div>
                  <div className="text-right"><p className="text-sm font-extrabold text-slate-900">{formatNumber(row.sessions)}</p><p className="text-[10px] font-bold text-slate-400">세션</p></div>
                </div>
              )) : <EmptyState>진입 페이지 데이터가 없습니다.</EmptyState>}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
            <SectionTitle eyebrow="Journey" title="자주 이동한 경로" description="의미 있는 화면 전환만 집계하며 필터 조작은 제외합니다." />
            <div className="mt-5 space-y-2.5">
              {data.journeys.transitions.length ? data.journeys.transitions.slice(0, 8).map((row, index) => (
                <div key={`${row.fromPath}-${row.toPath}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-slate-100 p-3">
                  <span className="truncate text-xs font-extrabold text-slate-600" title={row.fromPath}>{pageLabel(row.fromPath)}</span>
                  <ArrowRight className="h-4 w-4 text-teal-600" />
                  <span className="truncate text-xs font-extrabold text-slate-900" title={row.toPath}>{pageLabel(row.toPath)}</span>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] font-extrabold text-teal-800">{formatNumber(row.count)}회</span>
                </div>
              )) : <EmptyState>내부 이동경로는 이번 배포 이후부터 쌓입니다.</EmptyState>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
            <SectionTitle eyebrow="Exit" title="어디서 나갔나" description="브라우저 종료나 외부 이동이 감지된 마지막 화면입니다." />
            <div className="mt-5 space-y-2.5">
              {data.journeys.exits.length ? data.journeys.exits.slice(0, 8).map((row, index) => {
                const max = data.journeys.exits[0]?.exits || 1;
                return (
                  <div key={`${row.path}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-100 p-3.5">
                    <span className="absolute inset-y-0 left-0 bg-rose-50" style={{ width: `${Math.max(4, (row.exits / max) * 100)}%` }} />
                    <div className="relative flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-800">{pageLabel(row.path)}</p><p className="truncate text-xs text-slate-400">{row.path}</p></div><span className="shrink-0 text-sm font-extrabold text-rose-700">{formatNumber(row.exits)}회</span></div>
                  </div>
                );
              }) : <EmptyState>이탈 감지 데이터는 이번 배포 이후부터 쌓입니다.</EmptyState>}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]">
          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.035]">
            <div className="border-b border-slate-100 p-5 sm:p-6"><SectionTitle eyebrow="Content" title="페이지별 관심도" description="조회수와 실제 화면 활성시간을 함께 확인합니다." /></div>
            {data.pages.length ? (
              <div className="divide-y divide-slate-100">
                {data.pages.slice(0, 10).map(row => (
                  <div key={row.path} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-4 sm:px-6">
                    <div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{pageLabel(row.path)}</p><p className="truncate text-xs text-slate-400">{row.path}</p></div>
                    <div className="text-right"><p className="text-sm font-extrabold">{formatNumber(row.views)}</p><p className="text-[10px] font-bold text-slate-400">조회</p></div>
                    <div className="w-24 text-right"><p className="text-sm font-extrabold text-teal-700">{formatDuration(row.averageEngagementSeconds)}</p><p className="text-[10px] font-bold text-slate-400">평균 활성</p></div>
                  </div>
                ))}
              </div>
            ) : <div className="p-6"><EmptyState>페이지 관심도 데이터가 없습니다.</EmptyState></div>}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.035] sm:p-6">
            <SectionTitle eyebrow="Device" title="접속 기기" description="사용 환경별 방문 비중과 참여율입니다." />
            <div className="mt-6 space-y-5">
              {data.devices.map(row => {
                const Icon = row.device.toLowerCase() === 'mobile' ? Smartphone : row.device.toLowerCase() === 'tablet' ? Tablet : Monitor;
                const share = row.users / totalDeviceUsers;
                return (
                  <div key={row.device}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon className="h-4.5 w-4.5" /></span><div><p className="text-sm font-extrabold">{deviceLabel(row.device)}</p><p className="text-[11px] font-semibold text-slate-400">참여율 {formatPercent(row.engagementRate)}</p></div></div>
                      <div className="text-right"><p className="text-sm font-extrabold">{formatPercent(share, 0)}</p><p className="text-[10px] font-bold text-slate-400">{formatNumber(row.users)}명</p></div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${share * 100}%` }} /></div>
                  </div>
                );
              })}
              {!data.devices.length ? <EmptyState>기기 데이터가 없습니다.</EmptyState> : null}
            </div>
          </article>
        </section>

        <footer className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>원본 개인정보 대신 GA4 집계 데이터만 표시합니다.</p>
          <div className="flex flex-wrap gap-2">
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 font-extrabold text-slate-700 hover:bg-slate-200">GA4 자세히 보기 <ExternalLink className="h-3.5 w-3.5" /></a>
            <a href="https://clarity.microsoft.com/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 font-extrabold text-slate-700 hover:bg-slate-200">Clarity 녹화 보기 <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AnalyticsDashboardView;
