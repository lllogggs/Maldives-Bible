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
  onDeleteResort?: (resortId: number) => void;
  onMoveResort?: (resortId: number, direction: 'up' | 'down') => void;
}

type PageIndicator = number | 'ellipsis';

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
  onDeleteResort,
  onMoveResort,
}) => {
  const getPageNumbers = (): PageIndicator[] => {
    if (totalPages <= 1) {
      return [1];
    }

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: PageIndicator[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push('ellipsis');
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = totalPages === 0 ? [] : getPageNumbers();

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
          이미지 편집 모드에서는 각 카드에서 삭제하거나 순서를 변경하는 버튼이 노출됩니다. 변경 사항은 이 브라우저에만 저장됩니다.
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
              onDelete={() => onDeleteResort?.(resort.id)}
              onMoveUp={() => onMoveResort?.(resort.id, 'up')}
              onMoveDown={() => onMoveResort?.(resort.id, 'down')}
              disableMoveUp={index === 0}
              disableMoveDown={index === resorts.length - 1}
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
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Resort pagination">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100 hover:bg-gray-50"
            aria-label="이전 페이지"
          >
            ◀
          </button>
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm font-semibold rounded-md border ${
                  page === currentPage
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100 hover:bg-gray-50"
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
