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
          <p className="text-xs font-extrabold tracking-[0.08em] text-teal-800">
            몰디브 바이블 에디터 리뷰
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

      <div className="px-4 py-5 sm:px-8 sm:py-8">
        <div className="max-w-[58ch] space-y-4 text-base leading-7 text-slate-700 sm:space-y-5 sm:text-[17px] sm:leading-[1.8]">
          {review.paragraphs.map((paragraph, index) => (
            <p key={`${resortId}-editor-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ResortEditorReview;
