import React, { useState } from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import { LocationPinIcon, StarIcon, EditIcon, ChevronLeftIcon, ChevronRightIcon, CartIcon, CheckCircleIcon } from './icons/Icons';

interface ResortCardProps {
  resort: Resort;
  isEditMode: boolean;
  onEdit: (resort: Resort) => void;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
  isFirstCard?: boolean;
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

const ResortCard: React.FC<ResortCardProps> = ({ resort, isEditMode, onEdit, compareList, onToggleCompare, isFirstCard = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isSelectedForCompare = compareList.includes(resort.id);
  const canSelectForCompare = compareList.length < 3 || isSelectedForCompare;

  const imageUrls = resort.imageUrls && resort.imageUrls.length > 0
    ? resort.imageUrls
    : ['https://via.placeholder.com/400x224.png?text=Image+Not+Found'];

  const minSwipeDistance = 50;

  const handlePrevImage = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleNextImage = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
  };
  
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.hash = `#/resort/${resort.id}`;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      e.stopPropagation();
      if (isLeftSwipe) {
        handleNextImage(e);
      } else {
        handlePrevImage(e);
      }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };


  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div 
        className="relative group cursor-pointer" 
        onClick={handleViewDetails}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" src={imageUrls[currentImageIndex]} alt={`${resort.name_en} image ${currentImageIndex + 1}`} />
        
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full pointer-events-none">
              {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </>
        )}

        <div className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold text-white rounded-full shadow-lg ${getTransportationTagColor(resort.transportation)}`}>
          {resort.transportation}
        </div>
        <div className="absolute top-3 right-3 bg-white px-3 py-1 text-sm font-bold text-gray-800 rounded-full shadow-lg flex items-center gap-1">
          <StarIcon />
          <span>{resort.rating.toFixed(1)}</span>
        </div>
        {isEditMode && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(resort); }}
            className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label={`Edit ${resort.name}`}
          >
            <EditIcon />
          </button>
        )}
        <div className={`absolute bottom-3 ${isEditMode ? 'right-14' : 'right-3'}`}>
            {isFirstCard && !isEditMode && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded-md shadow-lg whitespace-nowrap z-10">
                    비교하기
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                </div>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleCompare(resort.id); }}
                disabled={!canSelectForCompare}
                className={`bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-colors disabled:bg-gray-200/80 disabled:cursor-not-allowed`}
                aria-label={isSelectedForCompare ? `Remove ${resort.name} from comparison` : `Add ${resort.name} to comparison`}
                title={isSelectedForCompare ? '비교 목록에서 제거' : '비교 목록에 추가'}
            >
                {isSelectedForCompare ? <CheckCircleIcon className="h-5 w-5 text-cyan-600" /> : <CartIcon className="h-5 w-5" />}
            </button>
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-cyan-600 transition-colors" onClick={handleViewDetails}>{resort.name}</h3>
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
                <button onClick={handleViewDetails} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
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
