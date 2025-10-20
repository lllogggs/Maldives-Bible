import React from 'react';
import ResortCard from './ResortCard';
import type { Resort, SortOption } from '../types';

interface ResortGridProps {
  resorts: Resort[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  isEditMode: boolean;
  onEditResort: (resort: Resort) => void;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
}

const SortDropdown: React.FC<Pick<ResortGridProps, 'sortOption' | 'onSortChange'>> = ({ sortOption, onSortChange }) => {
  return (
    <div className="relative">
      <select
        id="sort-options"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="appearance-none w-full sm:w-auto bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
      >
        <option value="default">추천순</option>
        <option value="price-asc">가격 낮은 순</option>
        <option value="price-desc">가격 높은 순</option>
        <option value="rating-desc">평점 높은 순</option>
        <option value="snorkeling-desc">스노클링 좋은 순</option>
        <option value="travelTime-asc">이동시간 짧은 순</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};


const ResortGrid: React.FC<ResortGridProps> = ({ resorts, sortOption, onSortChange, isEditMode, onEditResort, compareList, onToggleCompare }) => {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">검색 결과</h2>
          <p className="text-gray-600 mt-1">총 {resorts.length}개의 리조트</p>
        </div>
        <SortDropdown sortOption={sortOption} onSortChange={onSortChange} />
      </div>

      {resorts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resorts.map((resort, index) => (
            <ResortCard 
              key={resort.id} 
              resort={resort} 
              isEditMode={isEditMode}
              onEdit={onEditResort}
              compareList={compareList}
              onToggleCompare={onToggleCompare}
              isFirstCard={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">검색 결과가 없습니다.</h3>
          <p className="text-gray-500 mt-2">다른 필터 옵션을 시도해 보세요.</p>
        </div>
      )}
    </div>
  );
};

export default ResortGrid;