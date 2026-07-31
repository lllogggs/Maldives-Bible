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
  (Array.isArray(points) ? points : []).filter((point): point is ResortReviewPoint =>
    Boolean(point && typeof point.text === 'string' && point.text.trim())
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

type ReviewTone = 'positive' | 'negative' | 'neutral';

const SentimentEmoji: React.FC<{ tone: Exclude<ReviewTone, 'neutral'> }> = ({ tone }) => (
  <>
    <span aria-hidden="true" className="shrink-0 pt-px text-base leading-none">
      {tone === 'positive' ? '😊' : '😢'}
    </span>
    <span className="sr-only">{tone === 'positive' ? '긍정 의견: ' : '부정 의견: '}</span>
  </>
);

const CompactPoint: React.FC<{
  point: ResortReviewPoint;
  tone: ReviewTone;
}> = ({ point, tone }) => (
  <li className="flex min-w-0 items-start gap-2 text-sm leading-5 text-slate-700">
    {tone !== 'neutral' && <SentimentEmoji tone={tone} />}
    <span className="line-clamp-2 min-w-0 flex-1">{point.text}</span>
  </li>
);

const DetailPoint: React.FC<{ point: ResortReviewPoint; tone: ReviewTone }> = ({ point, tone }) => (
  <li className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
    {tone !== 'neutral' && <SentimentEmoji tone={tone} />}
    <span className="min-w-0 flex-1">{point.text}</span>
  </li>
);

const ReviewSources: React.FC<{
  sources: ResortReviewSummaryData['sources'];
}> = ({ sources = [] }) => {
  if (sources.length === 0) return null;

  return (
    <details className="mt-3 border-t border-teal-100 pt-3">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-teal-800 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
        실제 후기 원문 {sources.length}개
      </summary>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {sources.map((source, index) => {
          const publishedAt = formatDate(source.publishedAt);

          return (
            <li
              key={`${source.url}-${index}`}
              className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
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
    if (variant !== 'detail' || !summary || summary.sources?.length || !summary.sourceCount) return;

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
        setDetailState(current =>
          current.resortId === resortId ? { resortId, summary: { ...summary, ...payload.reviewSummary } } : current
        );
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.warn(`Failed to fetch review sources for resort ${resortId}`, error);
      });

    return () => controller.abort();
  }, [resortId, summary, variant]);

  const activeSummary =
    variant === 'detail' ? (detailState.resortId === resortId ? detailState.summary : summary) : summary;
  if (!activeSummary) return null;

  const pros = cleanPoints(activeSummary.pros);
  const cons = cleanPoints(activeSummary.cons);
  const neutral = cleanPoints(activeSummary.neutral);
  const rawSourceCount = Number(activeSummary.sourceCount);
  const sourceCount = Number.isFinite(rawSourceCount) ? Math.max(0, Math.floor(rawSourceCount)) : 0;
  const hasReviewPoints = pros.length > 0 || cons.length > 0 || neutral.length > 0;
  if (!hasReviewPoints && sourceCount === 0) return null;

  if (variant === 'compact') {
    const compactPoints: Array<{ point: ResortReviewPoint; tone: ReviewTone }> = [];
    if (pros[0]) compactPoints.push({ point: pros[0], tone: 'positive' });
    if (cons[0]) compactPoints.push({ point: cons[0], tone: 'negative' });
    if (neutral[0] && compactPoints.length < 2) compactPoints.push({ point: neutral[0], tone: 'neutral' });
    for (const point of [...pros.slice(1), ...cons.slice(1), ...neutral.slice(1)]) {
      if (compactPoints.length >= 2) break;
      compactPoints.push({
        point,
        tone: pros.includes(point) ? 'positive' : cons.includes(point) ? 'negative' : 'neutral',
      });
    }

    return (
      <section
        className={`mt-3 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-sky-50/60 px-3 py-3 ${hasReviewPoints ? 'min-h-[7.75rem]' : ''}`}
        aria-label={`${resortName} 실제 후기`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-sm font-extrabold tracking-tight text-teal-950">실제 후기</h4>
          {sourceCount > 0 && (
            <span className="shrink-0 text-xs font-semibold text-slate-500">검증 후기 {sourceCount}개</span>
          )}
        </div>
        {compactPoints.length > 0 && (
          <ul className="space-y-2">
            {compactPoints.map(({ point, tone }, index) => (
              <CompactPoint key={`${tone}-${index}-${point.text}`} point={point} tone={tone} />
            ))}
          </ul>
        )}
      </section>
    );
  }

  const sources = (Array.isArray(activeSummary.sources) ? activeSummary.sources : []).filter(
    source => source && typeof source.title === 'string' && source.title.trim() && isSafeSourceUrl(source.url)
  );
  const reviewedAt = formatDate(activeSummary.reviewedAt);
  const detailSectionCount = [pros, cons, neutral].filter(points => points.length > 0).length;

  return (
    <section
      className="mb-8 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 via-white to-sky-50/70 p-4 sm:p-6"
      aria-labelledby={`review-summary-title-${resortId}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.08em] text-teal-700">여행자 후기</p>
          <h2
            id={`review-summary-title-${resortId}`}
            className="mt-1 font-brand-heading text-xl font-bold text-slate-950 sm:text-2xl"
          >
            {hasReviewPoints ? '실제 후기 요약' : '실제 후기'}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-slate-500">
          {sourceCount > 0 && <span className="font-semibold">검증 후기 {sourceCount}개</span>}
          {reviewedAt && <span>{reviewedAt} 후기 기준</span>}
        </div>
      </div>

      {hasReviewPoints && (
        <div className={`mt-4 grid gap-3 ${detailSectionCount > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {pros.length > 0 && (
          <div className="rounded-xl border border-teal-100 bg-white/85 p-4">
            <h3 className="text-sm font-extrabold text-teal-900">😊 긍정 의견</h3>
            <ul className="mt-3 space-y-2.5">
              {pros.map((point, index) => (
                <DetailPoint key={`pro-${index}-${point.text}`} point={point} tone="positive" />
              ))}
            </ul>
          </div>
        )}
        {cons.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-white/85 p-4">
            <h3 className="text-sm font-extrabold text-amber-900">😢 부정 의견</h3>
            <ul className="mt-3 space-y-2.5">
              {cons.map((point, index) => (
                <DetailPoint key={`con-${index}-${point.text}`} point={point} tone="negative" />
              ))}
            </ul>
          </div>
        )}
        {neutral.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white/85 p-4">
            <h3 className="text-sm font-extrabold text-slate-800">정보</h3>
            <ul className="mt-3 space-y-2.5">
              {neutral.map((point, index) => (
                <DetailPoint key={`neutral-${index}-${point.text}`} point={point} tone="neutral" />
              ))}
            </ul>
          </div>
        )}
        </div>
      )}

      {hasReviewPoints && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          투숙 시기·객실 유형에 따라 체감은 달라질 수 있어요.
        </p>
      )}

      <ReviewSources sources={sources} />
    </section>
  );
};

export default ResortReviewSummary;
