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
      className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5"
      aria-labelledby={headingId}
    >
      <header className="border-b border-teal-100 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-5 py-6 text-white sm:px-7 sm:py-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-200">
          Maldives Bible Editor Review
        </p>
        <h2
          id={headingId}
          className="mt-3 max-w-3xl font-brand-heading text-2xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-3xl"
        >
          {review.title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-200 sm:text-base">
          {review.dek}
        </p>
      </header>

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <div className="max-w-3xl space-y-5 text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
          {review.paragraphs.map((paragraph, index) => (
            <p key={`${resortId}-editor-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>

        <aside className="mt-7 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-4 sm:px-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-700">Editor's pick</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-900 sm:text-[15px]">{review.verdict}</p>
        </aside>
      </div>
    </article>
  );
};

export default ResortEditorReview;
