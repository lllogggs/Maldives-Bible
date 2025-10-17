import React from 'react';
import type { Filters, RoomTypeFilter } from '../types';
import { TransportationType } from '../types';
import { BoatIcon, DomesticFlightIcon, SeaplaneIcon } from './icons/Icons';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

const FilterOption: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-6 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
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

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange }) => {

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
    <aside className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-200">필터</h2>
      
      <FilterOption title="이동수단">
        <div className="space-y-3">
          {[TransportationType.Boat, TransportationType.Seaplane, TransportationType.Domestic].map((type) => (
            <label key={type} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="transportation"
                checked={filters.transportation.includes(type)}
                onChange={() => handleTransportationChange(type)}
                className="h-4 w-4 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
              />
              {type === TransportationType.Boat && <BoatIcon />}
              {type === TransportationType.Seaplane && <SeaplaneIcon />}
              {type === TransportationType.Domestic && <DomesticFlightIcon />}
              <span className="text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </FilterOption>

      <FilterOption title="4박 가격 (USD, 2인)">
        <div className="relative pt-8">
          <div
            className="absolute -top-0 bg-cyan-600 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${(filters.maxPrice / 30000) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            ${filters.maxPrice.toLocaleString()}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-cyan-600"></div>
          </div>
          <input
            type="range"
            min="0"
            max="30000"
            step="500"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
            style={getRangeStyle(filters.maxPrice, 0, 30000)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>$0</span>
            <span>$30,000</span>
          </div>
        </div>
      </FilterOption>

      <FilterOption title="객실 타입">
        <div className="space-y-2">
          {roomTypes.map((type) => (
            <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.roomTypes.includes(type.value)}
                onChange={() => handleRoomTypeChange(type.value)}
                className="h-4 w-4 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
              />
              <span className="text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterOption>

      <FilterOption title="객실 내 개인 풀">
        <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasPrivatePool}
                onChange={(e) => onFilterChange('hasPrivatePool', e.target.checked)}
                className="h-4 w-4 rounded text-cyan-500 border-gray-300 focus:ring-cyan-400"
              />
              <span className="text-gray-700">개인 풀 포함</span>
            </label>
        </div>
      </FilterOption>

      <FilterOption title={`레스토랑: ${filters.minRestaurants}개 이상`}>
         <div className="relative pt-8">
           <div
            className="absolute -top-0 bg-cyan-600 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${(filters.minRestaurants / 15) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {filters.minRestaurants}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-cyan-600"></div>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={filters.minRestaurants}
            onChange={(e) => onFilterChange('minRestaurants', Number(e.target.value))}
            style={getRangeStyle(filters.minRestaurants, 0, 15)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0개</span>
            <span>15개</span>
          </div>
        </div>
      </FilterOption>

      <FilterOption title={`바: ${filters.minBars}개 이상`}>
         <div className="relative pt-8">
           <div
            className="absolute -top-0 bg-cyan-600 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${(filters.minBars / 10) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {filters.minBars}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-cyan-600"></div>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={filters.minBars}
            onChange={(e) => onFilterChange('minBars', Number(e.target.value))}
            style={getRangeStyle(filters.minBars, 0, 10)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0개</span>
            <span>10개</span>
          </div>
        </div>
      </FilterOption>
    </aside>
  );
};

export default FilterSidebar;