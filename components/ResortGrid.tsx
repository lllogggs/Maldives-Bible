import React from 'react';
import ResortCard from './ResortCard';
import type { Resort, SortOption } from '../types';
import { SortIcon, FilterIcon } from './icons/Icons';

interface ResortGridProps {
  resorts: Resort[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  totalResortsCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
  onOpenFilter: () => void;
  isImageEditMode: boolean;
  likesCountMap: Record<number, number>;
  likedResortIds: number[];
  onToggleLike: (resortId: number) => void;
  pendingLikeResortIds: Set<number>;
}

const ResortGrid: React.FC<ResortGridProps> = ({
  resorts,
  sortOption,
  onSortChange,
  totalResortsCount,
  currentPage,
  totalPages,
  onPageChange,
  compareList,
  onToggleCompare,
  onOpenFilter,
  isImageEditMode,
  likesCountMap,
  likedResortIds,
  onToggleLike,
  pendingLikeResortIds,
}) => {
  const pageNumbers = totalPages === 0
    ? []
    : Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">검색 결과</h2>
          <p className="text-gray-600 mt-1">총 {totalResortsCount}개의 리조트</p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <button
              onClick={onOpenFilter}
              className="order-1 lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            >
              <FilterIcon className="h-5 w-5" />
              <span>필터</span>
            </button>
            <div className="order-2 flex items-center gap-2 sm:order-none">
              <SortIcon className="h-5 w-5 text-gray-500" />
              <div className="relative">
                <select
                  id="sort-options"
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  disabled={isImageEditMode}
                  className={`appearance-none w-full sm:w-auto border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${
                    isImageEditMode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700'
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-[1.25rem] flex justify-end items-end">
            {sortOption === 'popularity' && (
              <p className="text-xs text-gray-600 mt-1 sm:mt-0 text-right">
                한국 구글 내 몰디브 리조트 검색량 지수 기준
              </p>
            )}
          </div>
        </div>
      </div>

      {isImageEditMode && (
        <div className="mb-4 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          이미지 편집 모드에서는 원하는 리조트의 상세 페이지로 이동해 삭제할 이미지를 선택하세요. 삭제한 이미지 URL은 기록되어 추후 확인할 수 있습니다.
        </div>
      )}

      {resorts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">검색 결과가 없습니다.</h3>
          <p className="text-gray-500 mt-2">다른 필터 옵션을 시도해 보세요.</p>
        </div>
      )}

      {!isImageEditMode && totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Resort pagination">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:text-cyan-500"
            aria-label="이전 페이지"
          >
            ◀
          </button>
          {pageNumbers.map(page => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`text-sm font-semibold transition-colors ${
                page === currentPage
                  ? 'text-cyan-600 underline underline-offset-4'
                  : 'text-gray-700 hover:text-cyan-500'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:text-cyan-500"
            aria-label="다음 페이지"
          >
            ▶
          </button>
        </nav>
      )}
    </div>
  );
};

export default ResortGrid;
