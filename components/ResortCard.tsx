import React, { useEffect, useState } from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import {
  LocationPinIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CartIcon,
  CheckCircleIcon,
  HeartIcon,
  HeartFilledIcon,
} from './icons/Icons';

interface ResortCardProps {
  resort: Resort;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
  isFirstCard?: boolean;
  isImageEditMode?: boolean;
  likesCount: number;
  isLiked: boolean;
  onToggleLike: (resortId: number) => void;
  isLikePending: boolean;
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

const ResortCard: React.FC<ResortCardProps> = ({
  resort,
  compareList,
  onToggleCompare,
  isFirstCard = false,
  isImageEditMode = false,
  likesCount,
  isLiked,
  onToggleLike,
  isLikePending,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isSelectedForCompare = compareList.includes(resort.id);
  const canSelectForCompare = compareList.length < 3 || isSelectedForCompare;

  const actualImageUrls = Array.isArray(resort.imageUrls) ? resort.imageUrls : [];
  const actualImageCount = actualImageUrls.length;
  const hasActualImages = actualImageCount > 0;
  const imageUrls = hasActualImages
    ? actualImageUrls
    : ['https://via.placeholder.com/400x224.png?text=Image+Not+Found'];

  useEffect(() => {
    if (hasActualImages) {
      setCurrentImageIndex(prev => Math.min(prev, actualImageCount - 1));
    } else {
      setCurrentImageIndex(0);
    }
  }, [hasActualImages, actualImageCount]);

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

  const formattedLikesCount = Math.max(0, likesCount ?? 0).toLocaleString();
  const likeButtonTitle = isLiked ? '좋아요 취소' : '좋아요 추가';
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLikePending) {
      return;
    }
    onToggleLike(resort.id);
  };


  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div
        className="relative group cursor-pointer"
        onClick={handleViewDetails}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" src={imageUrls[currentImageIndex]} alt={`${resort.name_en} image ${currentImageIndex + 1}`} />

        {imageUrls.length > 1 && !isImageEditMode && (
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
        <div className="absolute bottom-3 right-3">
            {isFirstCard && (
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
      <div className="p-5 flex-grow flex flex-col space-y-3">
        {isImageEditMode && (
          <div className="mb-3 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800">
            상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-cyan-600 transition-colors" onClick={handleViewDetails}>{resort.name}</h3>
              <p className="text-sm text-gray-500">{resort.name_en}</p>
            </div>
            <button
              onClick={handleViewDetails}
              className="rounded-full bg-cyan-50 text-cyan-700 px-3 py-1 text-xs font-semibold border border-cyan-100 hover:bg-cyan-100"
            >
              상세 보기
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1"><LocationPinIcon />{resort.location}</span>
            <span className="text-gray-400">•</span>
            <span className="font-semibold text-cyan-700">{resort.travelTime}분</span>
            <span className="text-gray-400">•</span>
            <span className="truncate">{resort.brand} • {resort.spaBrand}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {resort.roomTypes.map(type => (
              <span key={type} className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-full">{type}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>4박 2인 기준 (올인클루시브)</span>
            <span className="text-gray-600">수중환경 {resort.snorkelingQuality}/5</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleCompare(resort.id); }}
                disabled={!canSelectForCompare}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors border ${
                  isSelectedForCompare
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-cyan-200'
                } ${!canSelectForCompare ? 'cursor-not-allowed opacity-70' : ''}`}
                aria-label={isSelectedForCompare ? `Remove ${resort.name} from comparison` : `Add ${resort.name} to comparison`}
                title={isSelectedForCompare ? '비교 목록에서 제거' : '비교 목록에 추가'}
              >
                {isSelectedForCompare ? <CheckCircleIcon className="h-5 w-5 text-cyan-600" /> : <CartIcon className="h-5 w-5" />}
                <span>비교함</span>
              </button>
              <button
                type="button"
                onClick={handleLikeClick}
                disabled={isLikePending}
                aria-pressed={isLiked}
                aria-label={`${likeButtonTitle} (현재 ${formattedLikesCount}명)`}
                title={likeButtonTitle}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors border ${
                  isLiked
                    ? 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200'
                } ${isLikePending ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLiked ? (
                  <HeartFilledIcon className="h-5 w-5 text-rose-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-rose-500" />
                )}
                <span>{formattedLikesCount}</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xl md:text-2xl font-extrabold text-cyan-600 whitespace-nowrap leading-tight">
                ${resort.price.toLocaleString()}
              </p>
              <button
                onClick={handleViewDetails}
                className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-full hover:bg-cyan-700 transition-colors whitespace-nowrap"
              >
                상세보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResortCard;
