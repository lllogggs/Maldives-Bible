
import React from 'react';
import type { Filters, RoomTypeFilter } from '../types';
import { TransportationType } from '../types';
import {
  BoatIcon,
  DomesticFlightIcon,
  SeaplaneIcon,
  FilterIcon,
  XIcon,
  HeartIcon,
  PoolIcon,
  RestaurantIcon,
  BarIcon,
} from './icons/Icons';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClose?: () => void;
}

const FilterOption: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-5 space-y-4">
    <div className="flex items-center gap-2">
      {icon && <span className="text-cyan-600">{icon}</span>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="h-px bg-gray-100" aria-hidden="true" />
    {children}
  </div>
);

const getRangeStyle = (value: number, min: number, max: number) => {
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  // Using Tailwind colors: cyan-500 for fill, gray-200 for track
  return {
    background: `linear-gradient(to right, #06b6d4 ${progress}%, #e5e7eb ${progress}%)`,
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
  
  const handleRoomTypeChange = (roomType: RoomTypeFilter) => {
    const newRoomTypes = filters.roomTypes.includes(roomType)
      ? filters.roomTypes.filter(rt => rt !== roomType)
      : [...filters.roomTypes, roomType];
    onFilterChange('roomTypes', newRoomTypes);
  };

  return (
    <aside className="p-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-200 h-full space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FilterIcon className="h-6 w-6 text-gray-700" />
          필터
        </h2>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-800" aria-label="Close filters">
            <XIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <div className="grid gap-4 md:gap-5">
        <FilterOption title="이동수단" icon={<SeaplaneIcon className="h-5 w-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[TransportationType.Boat, TransportationType.Seaplane, TransportationType.Domestic].map((type) => (
              <label key={type} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-white hover:border-cyan-200">
                <input
                  type="checkbox"
                  name="transportation"
                  checked={filters.transportation.includes(type)}
                  onChange={() => handleTransportationChange(type)}
                  className="h-5 w-5 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
                />
                {type === TransportationType.Boat && <BoatIcon className="h-5 w-5 text-blue-600" />}
                {type === TransportationType.Seaplane && <SeaplaneIcon className="h-5 w-5 text-cyan-600" />}
                {type === TransportationType.Domestic && <DomesticFlightIcon className="h-5 w-5 text-emerald-600" />}
                <span className="text-gray-800 font-medium">{type}</span>
              </label>
            ))}
          </div>
        </FilterOption>

        <FilterOption title="4박 가격 (USD, 2인)" icon={<FilterIcon className="h-5 w-5" />}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="font-semibold">최대 금액</span>
              <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 font-bold shadow-inner">${filters.maxPrice.toLocaleString()}</span>
            </div>
            <div className="relative pt-6">
              <input
                type="range"
                min="0"
                max="30000"
                step="500"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                style={getRangeStyle(filters.maxPrice, 0, 30000)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                aria-label="최대 예산 설정"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>$0</span>
                <span>$30,000</span>
              </div>
            </div>
          </div>
        </FilterOption>

        <FilterOption title="객실 타입" icon={<PoolIcon className="h-5 w-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomTypes.map((type) => (
              <label key={type.value} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-white hover:border-cyan-200">
                <input
                  type="checkbox"
                  checked={filters.roomTypes.includes(type.value)}
                  onChange={() => handleRoomTypeChange(type.value)}
                  className="h-5 w-5 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
                />
                <span className="text-gray-800 font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </FilterOption>

        <FilterOption title="객실 내 개인 풀" icon={<PoolIcon className="h-5 w-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-white hover:border-cyan-200">
              <input
                type="checkbox"
                checked={filters.hasPrivatePool}
                onChange={(e) => onFilterChange('hasPrivatePool', e.target.checked)}
                className="h-5 w-5 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
              />
              <span className="text-gray-800 font-medium">개인 풀 포함</span>
            </label>
          </div>
        </FilterOption>

        <FilterOption title="좋아요" icon={<HeartIcon className="h-5 w-5 text-rose-500" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 bg-white hover:border-cyan-200">
              <input
                type="checkbox"
                checked={filters.onlyLiked}
                onChange={(e) => onFilterChange('onlyLiked', e.target.checked)}
                className="h-5 w-5 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
              />
              <span className="text-gray-800 font-medium">좋아요 표시한 리조트만 보기</span>
            </label>
          </div>
        </FilterOption>

        <FilterOption title={`레스토랑: ${filters.minRestaurants}개 이상`} icon={<RestaurantIcon className="h-5 w-5" />}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="font-semibold">최소 레스토랑 수</span>
              <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 font-bold shadow-inner">{filters.minRestaurants}개</span>
            </div>
            <div className="relative pt-6">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={filters.minRestaurants}
                onChange={(e) => onFilterChange('minRestaurants', Number(e.target.value))}
                style={getRangeStyle(filters.minRestaurants, 0, 15)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                aria-label="최소 레스토랑 수"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>0개</span>
                <span>15개</span>
              </div>
            </div>
          </div>
        </FilterOption>

        <FilterOption title={`바: ${filters.minBars}개 이상`} icon={<BarIcon className="h-5 w-5" />}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="font-semibold">최소 바 수</span>
              <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 font-bold shadow-inner">{filters.minBars}개</span>
            </div>
            <div className="relative pt-6">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={filters.minBars}
                onChange={(e) => onFilterChange('minBars', Number(e.target.value))}
                style={getRangeStyle(filters.minBars, 0, 10)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                aria-label="최소 바 수"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>0개</span>
                <span>10개</span>
              </div>
            </div>
          </div>
        </FilterOption>
      </div>
    </aside>
  );
};

export default FilterSidebar;
