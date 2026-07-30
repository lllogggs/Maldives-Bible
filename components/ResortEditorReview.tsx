import React from 'react';
import type { ResortEditorReview as ResortEditorReviewData } from '../types';

interface ResortEditorReviewProps {
  resortId: number;
  review?: ResortEditorReviewData;
}

const ResortEditorReview: React.FC<ResortEditorReviewProps> = ({ resortId, review }) => {
  if (!review || review.paragraphs.length === 0) return null;

  const headingId = `editor-review-title-${resortId}`;

  return (
    <article
      className="-mx-2 mb-8 overflow-hidden rounded-[18px] border border-slate-200/90 bg-[#fffdfa] shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:mx-0"
      aria-labelledby={headingId}
    >
      <div
        aria-hidden="true"
        className="h-1 bg-gradient-to-r from-teal-700 via-teal-400 to-amber-300"
      />

      <header className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.08),transparent_42%)] px-4 py-5 sm:px-8 sm:py-8">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-teal-700" />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-800 sm:text-[11px]">
            Maldives Bible · Editor Review
          </p>
        </div>
        <h2
          id={headingId}
          className="mt-4 max-w-4xl font-brand-heading text-2xl font-bold leading-[1.3] tracking-[-0.03em] text-slate-950 sm:text-3xl"
        >
          {review.title}
        </h2>
        <p className="mt-3 max-w-[68ch] text-[15px] font-medium leading-[1.7] text-slate-600 sm:mt-4 sm:text-base sm:leading-7">
          {review.dek}
        </p>
      </header>

      <div className="grid gap-6 px-4 py-5 sm:gap-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-8">
        <div className="max-w-[68ch] space-y-4 text-[15px] leading-[1.75] text-slate-700 sm:space-y-5 sm:text-[17px] sm:leading-[1.8]">
          {review.paragraphs.map((paragraph, index) => (
            <p key={`${resortId}-editor-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>

        <aside className="order-first rounded-xl border border-amber-200/70 bg-[#fbf7ee] px-4 py-5 sm:px-5 lg:order-none lg:mt-0.5">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-700" />
            <h3 className="text-[11px] font-extrabold tracking-[-0.01em] text-teal-800 sm:text-xs">
              에디터의 결론
            </h3>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-900 sm:text-[15px]">
            {review.verdict}
          </p>
        </aside>
      </div>
    </article>
  );
};

export default ResortEditorReview;
