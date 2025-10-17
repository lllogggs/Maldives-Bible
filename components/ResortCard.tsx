import React from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import { LocationPinIcon, StarIcon } from './icons/Icons';

interface ResortCardProps {
  resort: Resort;
}

const getTransportationTagColor = (transportation: TransportationType) => {
  switch (transportation) {
    case TransportationType.Seaplane:
      return 'bg-cyan-500';
    case TransportationType.Boat:
      return 'bg-blue-500';
    case TransportationType.Domestic:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const ResortCard: React.FC<ResortCardProps> = ({ resort }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div className="relative">
        <img className="w-full h-56 object-cover" src={resort.imageUrl} alt={resort.name_en} />
        <div className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold text-white rounded-full shadow-lg ${getTransportationTagColor(resort.transportation)}`}>
          {resort.transportation}
        </div>
        <div className="absolute top-3 right-3 bg-white px-3 py-1 text-sm font-bold text-gray-800 rounded-full shadow-lg flex items-center gap-1">
          <StarIcon />
          <span>{resort.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{resort.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{resort.name_en}</p>
          
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <LocationPinIcon />
            <span className="ml-1">{resort.location} • {resort.travelTime}분</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{resort.brand} • {resort.spaBrand}</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {resort.roomTypes.map(type => (
              <span key={type} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{type}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>
        
        <div className="mt-auto">
            <p className="text-xs text-gray-500">4박 2인 기준 (올인클루시브)</p>
            <div className="flex justify-between items-center mt-1">
                <p className="text-2xl font-extrabold text-cyan-600">${resort.price.toLocaleString()}</p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                    상세보기
                </button>
            </div>
            <p className="text-right text-xs text-gray-500 mt-1">수중환경: {resort.snorkelingQuality}/5점</p>
        </div>
      </div>
    </div>
  );
};

export default ResortCard;