import React from 'react';
import ResortCard from './ResortCard';
import type { Resort, SortOption } from '../types';
import { SortIcon, FilterIcon, ChevronDownIcon } from './icons/Icons';

interface ResortGridProps {
  resorts: Resort[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  totalResortsCount: number;
  totalAllResortsCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
  onOpenFilter: () => void;
  onCopyShareLink: () => void;
  isImageEditMode: boolean;
  likesCountMap: Record<number, number>;
  likedResortIds: number[];
  onToggleLike: (resortId: number) => void;
  pendingLikeResortIds: Set<number>;
  onViewDetails: (resortId: number) => void;
}

const ResortGrid: React.FC<ResortGridProps> = ({
  resorts,
  sortOption,
  onSortChange,
  totalResortsCount,
  totalAllResortsCount,
  currentPage,
  totalPages,
  onPageChange,
  compareList,
  onToggleCompare,
  onOpenFilter,
  onCopyShareLink,
  isImageEditMode,
  likesCountMap,
  likedResortIds,
  onToggleLike,
  pendingLikeResortIds,
  onViewDetails,
}) => {
  const pageNumbers = totalPages === 0
    ? []
    : Array.from({ length: Math.min(12, totalPages) }, (_, index) => index + 1);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-brand-heading text-2xl text-slate-950">허니문 후보 리조트</h1>
          <p className="mt-1 text-sm text-slate-600">
            {totalResortsCount}개
            {totalResortsCount !== totalAllResortsCount && (
              <span className="ml-2 font-semibold text-teal-700">
                필터 {totalResortsCount}/{totalAllResortsCount}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onOpenFilter}
              className="order-1 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 lg:hidden"
            >
              <FilterIcon className="h-5 w-5" />
              <span>필터</span>
            </button>
            <button
              type="button"
              onClick={onCopyShareLink}
              className="order-2 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 lg:order-none"
            >
              링크 복사
            </button>
            <div className="order-3 flex items-center gap-2 sm:order-none">
              <SortIcon className="h-5 w-5 text-slate-500" />
              <div className="relative">
                <select
                  id="sort-options"
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  disabled={isImageEditMode}
                  className={`h-10 w-full appearance-none rounded-lg border border-slate-200 py-2 pl-3 pr-10 text-center text-sm shadow-sm shadow-slate-900/5 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:w-auto ${
                    isImageEditMode ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-700'
                  }`}
                >
                  <option value="custom">사용자 지정 순서</option>
                  <option value="popularity">인기 많은 순</option>
                  <option value="price-asc">가격 낮은 순</option>
                  <option value="price-desc">가격 높은 순</option>
                  <option value="rating-desc">평점 높은 순</option>
                  <option value="snorkeling-desc">수중환경 좋은 순</option>
                  <option value="travelTime-asc">이동시간 짧은 순</option>
                  <option value="likes-desc">좋아요 많은 순</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isImageEditMode && (
        <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
        </div>
      )}

      {resorts.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resorts.map((resort, index) => (
            <ResortCard
              key={resort.id}
              resort={resort}
              compareList={compareList}
              onToggleCompare={onToggleCompare}
              isFirstCard={index === 0}
              isImageEditMode={isImageEditMode}
              likesCount={likesCountMap[resort.id] ?? 0}
              isLiked={likedResortIds.includes(resort.id)}
              onToggleLike={onToggleLike}
              isLikePending={pendingLikeResortIds.has(resort.id)}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h3 className="text-xl font-semibold text-slate-800">검색 결과가 없습니다.</h3>
          <p className="mt-2 text-slate-500">필터 조건을 줄여보세요.</p>
        </div>
      )}

      {!isImageEditMode && totalPages > 1 && (
        <nav
          className="mt-8 flex flex-col items-center gap-3"
          aria-label="Resort pagination"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {pageNumbers.map(page => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`px-1 text-sm font-semibold transition-colors ${
                  page === currentPage
                    ? 'text-teal-700 underline underline-offset-4 decoration-2'
                    : 'text-slate-700 hover:text-teal-700'
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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
