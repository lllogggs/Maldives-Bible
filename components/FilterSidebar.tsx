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

const getBudgetPercent = (value: number) => {
  const boundedValue = Math.min(Math.max(value, MIN_BUDGET), MAX_BUDGET);
  return ((boundedValue - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
};

const formatBudget = (value: number) => `$${value.toLocaleString()}`;

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
  const budgetRangeRef = React.useRef<HTMLDivElement>(null);

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

  const getBudgetValueFromClientX = (clientX: number) => {
    const rect = budgetRangeRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) {
      return MIN_BUDGET;
    }

    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const rawValue = MIN_BUDGET + ratio * (MAX_BUDGET - MIN_BUDGET);
    return Math.round(rawValue / BUDGET_STEP) * BUDGET_STEP;
  };

  const updateBudgetHandle = (handle: 'min' | 'max', clientX: number) => {
    const nextValue = getBudgetValueFromClientX(clientX);
    if (handle === 'min') {
      handleMinPriceChange(nextValue);
      return;
    }
    handleMaxPriceChange(nextValue);
  };

  const beginBudgetDrag = (handle: 'min' | 'max', clientX: number) => {
    updateBudgetHandle(handle, clientX);

    const handlePointerMove = (event: PointerEvent) => {
      updateBudgetHandle(handle, event.clientX);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleBudgetTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextValue = getBudgetValueFromClientX(event.clientX);
    const distanceToMin = Math.abs(nextValue - filters.minPrice);
    const distanceToMax = Math.abs(nextValue - filters.maxPrice);
    beginBudgetDrag(distanceToMin <= distanceToMax ? 'min' : 'max', event.clientX);
  };

  const handleBudgetHandlePointerDown = (handle: 'min' | 'max', event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    beginBudgetDrag(handle, event.clientX);
  };

  const handleBudgetKeyDown = (handle: 'min' | 'max', event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentValue = handle === 'min' ? filters.minPrice : filters.maxPrice;
    let nextValue: number | null = null;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      nextValue = currentValue - BUDGET_STEP;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      nextValue = currentValue + BUDGET_STEP;
    } else if (event.key === 'PageDown') {
      nextValue = currentValue - BUDGET_STEP * 4;
    } else if (event.key === 'PageUp') {
      nextValue = currentValue + BUDGET_STEP * 4;
    } else if (event.key === 'Home') {
      nextValue = MIN_BUDGET;
    } else if (event.key === 'End') {
      nextValue = MAX_BUDGET;
    }

    if (nextValue === null) {
      return;
    }

    event.preventDefault();
    if (handle === 'min') {
      handleMinPriceChange(nextValue);
      return;
    }
    handleMaxPriceChange(nextValue);
  };

  const budgetMinPercent = getBudgetPercent(filters.minPrice);
  const budgetMaxPercent = getBudgetPercent(filters.maxPrice);
  const budgetFillStyle = {
    left: `${budgetMinPercent}%`,
    right: `${100 - budgetMaxPercent}%`,
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
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              최소 {formatBudget(filters.minPrice)}
            </span>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
              최대 {formatBudget(filters.maxPrice)}
            </span>
          </div>
          <div
            ref={budgetRangeRef}
            className="budget-range"
            aria-label="4박 예산 범위"
            onPointerDown={handleBudgetTrackPointerDown}
          >
            <div className="budget-range__track" />
            <div className="budget-range__fill" style={budgetFillStyle} />
            <button
              aria-label="최소 예산"
              aria-valuemax={filters.maxPrice}
              aria-valuemin={MIN_BUDGET}
              aria-valuenow={filters.minPrice}
              aria-valuetext={formatBudget(filters.minPrice)}
              className="budget-range__handle"
              onKeyDown={event => handleBudgetKeyDown('min', event)}
              onPointerDown={event => handleBudgetHandlePointerDown('min', event)}
              role="slider"
              style={{ left: `${budgetMinPercent}%`, zIndex: filters.minPrice > MAX_BUDGET - BUDGET_STEP * 4 ? 5 : 3 }}
              type="button"
            />
            <button
              aria-label="최대 예산"
              aria-valuemax={MAX_BUDGET}
              aria-valuemin={filters.minPrice}
              aria-valuenow={filters.maxPrice}
              aria-valuetext={formatBudget(filters.maxPrice)}
              className="budget-range__handle"
              onKeyDown={event => handleBudgetKeyDown('max', event)}
              onPointerDown={event => handleBudgetHandlePointerDown('max', event)}
              role="slider"
              style={{ left: `${budgetMaxPercent}%`, zIndex: 4 }}
              type="button"
            />
          </div>
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
