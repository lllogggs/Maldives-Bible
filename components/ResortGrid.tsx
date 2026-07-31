import React from 'react';
import ResortCard from './ResortCard';
import type { Resort } from '../types';

interface ResortGridProps {
  resorts: Resort[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
  isImageEditMode: boolean;
  interestCountMap: Record<number, number>;
  likedResortIds: number[];
  onToggleLike: (resortId: number) => void;
  pendingLikeResortIds: Set<number>;
  onViewDetails: (resortId: number) => void;
}

const ResortGrid: React.FC<ResortGridProps> = ({
  resorts,
  currentPage,
  totalPages,
  onPageChange,
  compareList,
  onToggleCompare,
  isImageEditMode,
  interestCountMap,
  likedResortIds,
  onToggleLike,
  pendingLikeResortIds,
  onViewDetails,
}) => {
  const pageNumbers = totalPages === 0
    ? []
    : Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div>
      {resorts.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resorts.map((resort, index) => (
            <ResortCard
              key={resort.id}
              resort={resort}
              compareList={compareList}
              onToggleCompare={onToggleCompare}
              isImageEditMode={isImageEditMode}
              interestCount={interestCountMap[resort.id] ?? 0}
              isLiked={likedResortIds.includes(resort.id)}
              onToggleLike={onToggleLike}
              isLikePending={pendingLikeResortIds.has(resort.id)}
              onViewDetails={onViewDetails}
              imagePriority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h3 className="text-xl font-semibold text-slate-800">검색 결과가 없습니다.</h3>
          <p className="mt-2 text-slate-500">조건을 조금 넓혀보세요.</p>
        </div>
      )}

      {!isImageEditMode && totalPages > 1 && (
        <nav
          className="mt-8 flex flex-col items-center gap-3"
          aria-label="Resort pagination"
        >
          <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
            {pageNumbers.map(page => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  page === currentPage
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                }`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-11 min-w-[76px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              aria-label="이전 페이지"
            >
              이전
            </button>
            <span className="text-sm font-semibold text-slate-500">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-11 min-w-[76px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              aria-label="다음 페이지"
            >
              다음
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default ResortGrid;
