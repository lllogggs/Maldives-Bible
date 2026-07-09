import React from 'react';
import type { Filters, RoomTypeFilter } from '../types';
import { TransportationType } from '../types';
import { BoatIcon, DomesticFlightIcon, SeaplaneIcon, FilterIcon, XIcon, HeartIcon } from './icons/Icons';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClose?: () => void;
}

const MIN_BUDGET = 0;
const MAX_BUDGET = 30000;
const BUDGET_STEP = 500;

const FilterOption: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-slate-200 py-4 last:border-b-0">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{title}</h3>
    {children}
  </div>
);

const getRangeStyle = (value: number, min: number, max: number) => {
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return {
    background: `linear-gradient(to right, #0f766e ${progress}%, #e2e8f0 ${progress}%)`,
  };
};

const CheckboxRow: React.FC<{
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}> = ({ checked, onChange, children }) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-slate-50">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-500"
    />
    {children}
  </label>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onClose }) => {
  const handleTransportationChange = (transportType: TransportationType) => {
    const newTransportation = filters.transportation.includes(transportType)
      ? filters.transportation.filter(t => t !== transportType)
      : [...filters.transportation, transportType];
    onFilterChange('transportation', newTransportation);
  };

  const handleMinPriceChange = (value: number) => {
    const nextMin = Math.min(Math.max(MIN_BUDGET, value), filters.maxPrice);
    onFilterChange('minPrice', nextMin);
  };

  const handleMaxPriceChange = (value: number) => {
    const nextMax = Math.max(Math.min(MAX_BUDGET, value), filters.minPrice);
    onFilterChange('maxPrice', nextMax);
  };

  const roomTypes: { label: string; value: RoomTypeFilter }[] = [
    { label: '비치빌라', value: 'beach' },
    { label: '워터빌라', value: 'water' },
  ];

  const handleRoomTypeChange = (roomType: RoomTypeFilter) => {
    const newRoomTypes = filters.roomTypes.includes(roomType)
      ? filters.roomTypes.filter(rt => rt !== roomType)
      : [...filters.roomTypes, roomType];
    onFilterChange('roomTypes', newRoomTypes);
  };

  return (
    <aside className="h-full rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-900/5 lg:sticky lg:top-28">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="font-brand-heading flex items-center gap-2 text-base text-slate-950">
          <FilterIcon className="h-5 w-5 text-teal-700" />
          필터
        </h2>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900 lg:hidden" aria-label="Close filters">
            <XIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <FilterOption title="이동">
        <div className="grid gap-1">
          {[TransportationType.Boat, TransportationType.Seaplane, TransportationType.Domestic].map(type => (
            <CheckboxRow
              key={type}
              checked={filters.transportation.includes(type)}
              onChange={() => handleTransportationChange(type)}
            >
              {type === TransportationType.Boat && <BoatIcon />}
              {type === TransportationType.Seaplane && <SeaplaneIcon />}
              {type === TransportationType.Domestic && <DomesticFlightIcon />}
              <span className="text-slate-700">{type}</span>
            </CheckboxRow>
          ))}
        </div>
      </FilterOption>

      <FilterOption title="4박 예산">
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">최소</span>
            <input
              type="number"
              min={MIN_BUDGET}
              max={filters.maxPrice}
              step={BUDGET_STEP}
              value={filters.minPrice}
              onChange={e => handleMinPriceChange(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">최대</span>
            <input
              type="number"
              min={filters.minPrice}
              max={MAX_BUDGET}
              step={BUDGET_STEP}
              value={filters.maxPrice}
              onChange={e => handleMaxPriceChange(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />
          </label>
        </div>
      </FilterOption>

      <FilterOption title="허니문">
        <div className="grid gap-1">
          <CheckboxRow
            checked={filters.honeymoonPerks}
            onChange={() => onFilterChange('honeymoonPerks', !filters.honeymoonPerks)}
          >
            <HeartIcon className="h-5 w-5 text-rose-500" />
            <span className="text-slate-700">허니문 혜택</span>
          </CheckboxRow>
          <CheckboxRow
            checked={filters.hasPrivatePool}
            onChange={() => onFilterChange('hasPrivatePool', !filters.hasPrivatePool)}
          >
            <span className="text-slate-700">개인풀</span>
          </CheckboxRow>
        </div>
      </FilterOption>

      <FilterOption title="객실">
        <div className="grid gap-1">
          {roomTypes.map(type => (
            <CheckboxRow
              key={type.value}
              checked={filters.roomTypes.includes(type.value)}
              onChange={() => handleRoomTypeChange(type.value)}
            >
              <span className="text-slate-700">{type.label}</span>
            </CheckboxRow>
          ))}
        </div>
      </FilterOption>

      <FilterOption title="저장">
        <CheckboxRow
          checked={filters.onlyLiked}
          onChange={() => onFilterChange('onlyLiked', !filters.onlyLiked)}
        >
          <HeartIcon className="h-5 w-5 text-rose-500" />
          <span className="text-slate-700">좋아요만 보기</span>
        </CheckboxRow>
      </FilterOption>

      <FilterOption title={`레스토랑 ${filters.minRestaurants}개 이상`}>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={filters.minRestaurants}
          onChange={e => onFilterChange('minRestaurants', Number(e.target.value))}
          style={getRangeStyle(filters.minRestaurants, 0, 15)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg"
        />
      </FilterOption>

      <FilterOption title={`바 ${filters.minBars}개 이상`}>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={filters.minBars}
          onChange={e => onFilterChange('minBars', Number(e.target.value))}
          style={getRangeStyle(filters.minBars, 0, 10)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg"
        />
      </FilterOption>
    </aside>
  );
};

export default FilterSidebar;
