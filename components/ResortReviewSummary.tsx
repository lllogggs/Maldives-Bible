import React, { useEffect, useState } from 'react';
import type { ResortReviewPoint, ResortReviewSummary as ResortReviewSummaryData } from '../types';

interface ResortReviewSummaryProps {
  resortId: number;
  resortName: string;
  summary?: ResortReviewSummaryData;
  variant: 'compact' | 'detail';
}

type ResortReviewDetailPayload = {
  resortId?: number;
  reviewSummary?: ResortReviewSummaryData;
};

const cleanPoints = (points: ResortReviewPoint[] | undefined) =>
  (Array.isArray(points) ? points : []).filter(
    (point): point is ResortReviewPoint => Boolean(point && typeof point.text === 'string' && point.text.trim()),
  );

const formatDate = (value?: string) => {
  if (!value) return null;

  const normalizedValue = /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value;
  const isoDate = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]), 12)
    : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const isSafeSourceUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const MentionCount: React.FC<{ mentions?: number }> = ({ mentions }) => {
  if (!mentions || mentions < 2) return null;

  return (
    <span className="ml-2 shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-500">
      {mentions}건 언급
    </span>
  );
};

const CompactPoint: React.FC<{ point: ResortReviewPoint; tone: 'pro' | 'con' }> = ({ point, tone }) => (
  <li className="flex min-w-0 items-center gap-2 text-xs leading-5 text-slate-700">
    <span
      aria-hidden="true"
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
        tone === 'pro' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {tone === 'pro' ? '+' : '–'}
    </span>
    <span className="sr-only">{tone === 'pro' ? '장점: ' : '아쉬운 점: '}</span>
    <span className="line-clamp-1 min-w-0">{point.text}</span>
  </li>
);

const DetailPoint: React.FC<{ point: ResortReviewPoint; tone: 'pro' | 'con' }> = ({ point, tone }) => (
  <li className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
    <span
      aria-hidden="true"
      className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
        tone === 'pro' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {tone === 'pro' ? '+' : '–'}
    </span>
    <span className="sr-only">{tone === 'pro' ? '장점: ' : '아쉬운 점: '}</span>
    <span className="min-w-0 flex-1">{point.text}</span>
    <MentionCount mentions={point.mentions} />
  </li>
);

const ReviewSources: React.FC<{ sources: ResortReviewSummaryData['sources'] }> = ({ sources = [] }) => {
  if (sources.length === 0) return null;

  return (
    <details className="mt-3 border-t border-teal-100 pt-3">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-teal-800 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
        참고한 실제 후기 {sources.length}개 보기
      </summary>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {sources.map((source, index) => {
          const publishedAt = formatDate(source.publishedAt);

          return (
            <li key={`${source.url}-${index}`} className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-teal-700"
              >
                {source.title}
              </a>
              {(source.blogName || publishedAt) && (
                <p className="mt-1 text-xs text-slate-500">
                  {source.blogName}
                  {source.blogName && publishedAt && <span aria-hidden="true"> · </span>}
                  {publishedAt}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
};

const ResortReviewSummary: React.FC<ResortReviewSummaryProps> = ({ resortId, resortName, summary, variant }) => {
  const [detailState, setDetailState] = useState({ resortId, summary });

  useEffect(() => {
    setDetailState({ resortId, summary });
    if (
      variant !== 'detail'
      || !summary
      || summary.sources?.length
      || !summary.sourceCount
    ) return;

    const controller = new AbortController();
    const basePath = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
    const detailPath = `${basePath}/api/resort-reviews/${resortId}.json`;
    const detailUrl = detailPath.startsWith('/') ? detailPath : `/${detailPath}`;

    fetch(detailUrl, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) return null;
        return (await response.json()) as ResortReviewDetailPayload;
      })
      .then(payload => {
        if (!payload?.reviewSummary || payload.resortId !== resortId) return;
        setDetailState(current => current.resortId === resortId
          ? { resortId, summary: { ...summary, ...payload.reviewSummary } }
          : current);
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.warn(`Failed to fetch review sources for resort ${resortId}`, error);
      });

    return () => controller.abort();
  }, [resortId, summary, variant]);

  const activeSummary = variant === 'detail'
    ? detailState.resortId === resortId ? detailState.summary : summary
    : summary;
  if (!activeSummary) return null;

  const pros = cleanPoints(activeSummary.pros);
  const cons = cleanPoints(activeSummary.cons);
  const evidenceStatus = activeSummary.evidenceStatus
    ?? (pros.length > 0 || cons.length > 0 ? 'sufficient' : 'insufficient');

  if (pros.length === 0 && cons.length === 0 && evidenceStatus !== 'insufficient') return null;

  if (variant === 'compact') {
    if (evidenceStatus === 'insufficient') return null;

    const compactPros = pros.slice(0, 2);
    const compactCons = cons.slice(0, 1);
    const sourceCount = Math.max(0, Math.floor(activeSummary.sourceCount || 0));

    return (
      <section
        className="mt-3 h-[7.75rem] overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-sky-50/60 px-3 py-2.5"
        aria-label={`${resortName} 실제 후기`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h4 className="text-[11px] font-extrabold tracking-tight text-teal-900">
            실제 후기 한눈에
          </h4>
          {sourceCount > 0 && (
            <span className="shrink-0 text-[10px] font-semibold text-slate-500">실제 후기 {sourceCount}개</span>
          )}
        </div>
        <ul className="space-y-1">
          {compactPros.map((point, index) => (
            <CompactPoint key={`pro-${index}-${point.text}`} point={point} tone="pro" />
          ))}
          {compactCons.map((point, index) => (
            <CompactPoint key={`con-${index}-${point.text}`} point={point} tone="con" />
          ))}
        </ul>
      </section>
    );
  }

  const sources = (Array.isArray(activeSummary.sources) ? activeSummary.sources : []).filter(
    source => source && typeof source.title === 'string' && source.title.trim() && isSafeSourceUrl(source.url),
  );

  if (evidenceStatus === 'insufficient') {
    if (sources.length === 0) return null;

    return (
      <section
        className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
        aria-labelledby={`review-summary-title-${resortId}`}
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Real reviews</p>
        <h2 id={`review-summary-title-${resortId}`} className="mt-1 font-brand-heading text-xl font-bold text-slate-950 sm:text-2xl">
          실제 후기 원문
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          객실, 식사, 서비스와 수중환경을 직접 경험한 여행자 후기를 확인해 보세요.
        </p>
        <ReviewSources sources={sources} />
      </section>
    );
  }

  const reviewedAt = formatDate(activeSummary.reviewedAt);
  const basisLabel = evidenceStatus === 'limited'
    ? '한 여행자의 실제 경험을 바탕으로 정리한 내용입니다.'
    : '여러 여행자의 실제 후기에서 공통으로 언급된 내용입니다.';

  return (
    <section
      className="mb-8 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 via-white to-sky-50/70 p-4 sm:p-6"
      aria-labelledby={`review-summary-title-${resortId}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-teal-700">Real reviews</p>
          <h2
            id={`review-summary-title-${resortId}`}
            className="mt-1 font-brand-heading text-xl font-bold text-slate-950 sm:text-2xl"
          >
            실제 후기 한눈에
          </h2>
        </div>
        {reviewedAt && <p className="text-xs leading-5 text-slate-500">{reviewedAt} 업데이트</p>}
      </div>

      <div className={`mt-4 grid gap-3 ${pros.length > 0 && cons.length > 0 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {pros.length > 0 && (
          <div className="rounded-xl border border-teal-100 bg-white/85 p-4">
            <h3 className="text-sm font-extrabold text-teal-900">좋았다는 점</h3>
            <ul className="mt-3 space-y-2.5">
              {pros.map((point, index) => (
                <DetailPoint key={`pro-${index}-${point.text}`} point={point} tone="pro" />
              ))}
            </ul>
          </div>
        )}
        {cons.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-white/85 p-4">
            <h3 className="text-sm font-extrabold text-amber-900">알아둘 점</h3>
            <ul className="mt-3 space-y-2.5">
              {cons.map((point, index) => (
                <DetailPoint key={`con-${index}-${point.text}`} point={point} tone="con" />
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{basisLabel} 여행 시기와 객실 유형에 따라 경험은 달라질 수 있어요.</p>

      <ReviewSources sources={sources} />
    </section>
  );
};

export default ResortReviewSummary;
