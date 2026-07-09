
import React from 'react';
import type { Filters, RoomTypeFilter } from '../types';
import { TransportationType } from '../types';
import { BoatIcon, DomesticFlightIcon, SeaplaneIcon, FilterIcon, XIcon, HeartIcon } from './icons/Icons';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClose?: () => void;
}

const FilterOption: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-slate-200 py-5 last:border-b-0">
    <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-slate-500">{title}</h3>
    {children}
  </div>
);

const getRangeStyle = (value: number, min: number, max: number) => {
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return {
    background: `linear-gradient(to right, #0f766e ${progress}%, #e2e8f0 ${progress}%)`,
  };
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onClose }) => {

  const handleTransportationChange = (transportType: TransportationType) => {
    const newTransportation = filters.transportation.includes(transportType)
      ? filters.transportation.filter(t => t !== transportType)
      : [...filters.transportation, transportType];
    onFilterChange('transportation', newTransportation);
  };
  
  const roomTypes: { label: string, value: RoomTypeFilter }[] = [
    { label: '비치빌라 보유', value: 'beach' },
    { label: '워터빌라 보유', value: 'water' },
  ];

  const budgetOptions = [
    { label: '$7천 이하', value: 7000 },
    { label: '$1만 이하', value: 10000 },
    { label: '$1.4만 이하', value: 14000 },
    { label: '전체', value: 30000 },
  ];
  
  const handleRoomTypeChange = (roomType: RoomTypeFilter) => {
    const newRoomTypes = filters.roomTypes.includes(roomType)
      ? filters.roomTypes.filter(rt => rt !== roomType)
      : [...filters.roomTypes, roomType];
    onFilterChange('roomTypes', newRoomTypes);
  };

  return (
    <aside className="h-full rounded-lg border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5 lg:sticky lg:top-28">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
          <FilterIcon className="h-5 w-5 text-teal-700" />
          필터
        </h2>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900 lg:hidden" aria-label="Close filters">
            <XIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <FilterOption title="이동수단">
        <div className="space-y-3">
          {[TransportationType.Boat, TransportationType.Seaplane, TransportationType.Domestic].map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                name="transportation"
                checked={filters.transportation.includes(type)}
                onChange={() => handleTransportationChange(type)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-500"
              />
              {type === TransportationType.Boat && <BoatIcon />}
              {type === TransportationType.Seaplane && <SeaplaneIcon />}
              {type === TransportationType.Domestic && <DomesticFlightIcon />}
              <span className="text-slate-700">{type}</span>
            </label>
          ))}
        </div>
      </FilterOption>

      <FilterOption title="4박 가격 (USD, 2인)">
        <div className="relative pt-8">
          <div
            className="pointer-events-none absolute -top-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white shadow-sm"
            style={{
              left: `${(filters.maxPrice / 30000) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ${filters.maxPrice.toLocaleString()}
            <div className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-950"></div>
          </div>
          <input
            type="range"
            min="0"
            max="30000"
            step="500"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
            style={getRangeStyle(filters.maxPrice, 0, 30000)}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg"
          />
          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>$0</span>
            <span>$30,000</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {budgetOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange('maxPrice', option.value)}
                className={`min-h-9 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors ${
                  filters.maxPrice === option.value
                    ? 'border-teal-300 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </FilterOption>

      <FilterOption title="허니문 핵심 조건">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
            <input
              type="checkbox"
              checked={filters.honeymoonPerks}
              onChange={(e) => onFilterChange('honeymoonPerks', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-500"
            />
            <HeartIcon className="h-5 w-5 text-rose-500" />
            <span className="text-slate-700">허니문 혜택 있는 곳</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
            <input
              type="checkbox"
              checked={filters.hasPrivatePool}
              onChange={(e) => onFilterChange('hasPrivatePool', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-500"
            />
            <span className="text-slate-700">개인 풀 포함</span>
          </label>
        </div>
      </FilterOption>

      <FilterOption title="객실 타입">
        <div className="space-y-2">
          {roomTypes.map((type) => (
            <label key={type.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={filters.roomTypes.includes(type.value)}
                onChange={() => handleRoomTypeChange(type.value)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-500"
              />
              <span className="text-slate-700">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterOption>

      <FilterOption title="좋아요">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
            <input
              type="checkbox"
              checked={filters.onlyLiked}
              onChange={(e) => onFilterChange('onlyLiked', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-500"
            />
            <HeartIcon className="h-5 w-5 text-rose-500" />
            <span className="text-slate-700">좋아요 표시한 리조트만 보기</span>
          </label>
        </div>
      </FilterOption>

      <FilterOption title={`레스토랑: ${filters.minRestaurants}개 이상`}>
         <div className="relative pt-8">
           <div
            className="pointer-events-none absolute -top-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white shadow-sm"
            style={{
              left: `${(filters.minRestaurants / 15) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {filters.minRestaurants}
            <div className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-950"></div>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={filters.minRestaurants}
            onChange={(e) => onFilterChange('minRestaurants', Number(e.target.value))}
            style={getRangeStyle(filters.minRestaurants, 0, 15)}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg"
          />
          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>0개</span>
            <span>15개</span>
          </div>
        </div>
      </FilterOption>

      <FilterOption title={`바: ${filters.minBars}개 이상`}>
         <div className="relative pt-8">
           <div
            className="pointer-events-none absolute -top-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white shadow-sm"
            style={{
              left: `${(filters.minBars / 10) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {filters.minBars}
            <div className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-950"></div>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={filters.minBars}
            onChange={(e) => onFilterChange('minBars', Number(e.target.value))}
            style={getRangeStyle(filters.minBars, 0, 10)}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg"
          />
          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>0개</span>
            <span>10개</span>
          </div>
        </div>
      </FilterOption>
    </aside>
  );
};

export default FilterSidebar;
