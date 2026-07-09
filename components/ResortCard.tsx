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
  onViewDetails: (resortId: number) => void;
}

const getTransportationTagColor = (transportation: TransportationType) => {
  switch (transportation) {
    case TransportationType.Seaplane:
      return 'border-sky-200 bg-sky-50 text-sky-800';
    case TransportationType.Boat:
      return 'border-teal-200 bg-teal-50 text-teal-800';
    case TransportationType.Domestic:
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-800';
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
  onViewDetails,
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
    onViewDetails(resort.id);
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
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div
        className="group relative cursor-pointer overflow-hidden bg-slate-100"
        onClick={handleViewDetails}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" src={imageUrls[currentImageIndex]} alt={`${resort.name_en} image ${currentImageIndex + 1}`} />

        {imageUrls.length > 1 && !isImageEditMode && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-800 shadow-sm backdrop-blur hover:bg-white transition-all lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-800 shadow-sm backdrop-blur hover:bg-white transition-all lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </>
        )}

        <div className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur ${getTransportationTagColor(resort.transportation)}`}>
          {resort.transportation}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-900 shadow-sm backdrop-blur">
          <StarIcon />
          <span>{resort.rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-3 right-3">
            {isFirstCard && (
                <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    비교하기
                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-950"></div>
                </div>
            )}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleCompare(resort.id); }}
                disabled={!canSelectForCompare}
                className="rounded-full bg-white/90 p-2 text-slate-800 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-200/80"
                aria-label={isSelectedForCompare ? `Remove ${resort.name} from comparison` : `Add ${resort.name} to comparison`}
                title={isSelectedForCompare ? '비교 목록에서 제거' : '비교 목록에 추가'}
            >
                {isSelectedForCompare ? <CheckCircleIcon className="h-5 w-5 text-teal-700" /> : <CartIcon className="h-5 w-5" />}
            </button>
        </div>
      </div>
      <div className="flex flex-grow flex-col p-5">
        {isImageEditMode && (
          <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
            상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
          </div>
        )}
        <div>
          <h3 className="cursor-pointer text-lg font-bold leading-snug text-slate-950 transition-colors hover:text-teal-700" onClick={handleViewDetails}>{resort.name}</h3>
          <p className="mb-3 text-sm text-slate-500">{resort.name_en}</p>
          
          <div className="mb-1 flex items-center text-sm text-slate-600">
            <LocationPinIcon />
            <span className="ml-1">{resort.location} • {resort.travelTime}분</span>
          </div>
          <p className="truncate text-sm text-slate-600">{resort.brand} • {resort.spaBrand}</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {resort.roomTypes.map(type => (
              <span key={type} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{type}</span>
            ))}
          </div>
        </div>

        <div className="my-4 border-t border-slate-100"></div>
        
        <div className="mt-auto">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikePending}
              aria-pressed={isLiked}
              aria-label={`${likeButtonTitle} (현재 ${formattedLikesCount}명)`}
              title={likeButtonTitle}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                isLiked
                  ? 'border-rose-300 bg-rose-100 text-rose-600 hover:bg-rose-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              } ${isLikePending ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLiked ? (
                <HeartFilledIcon className="h-5 w-5 text-rose-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-rose-500" />
              )}
              <span>{formattedLikesCount}</span>
            </button>
            <div className="flex-1 text-right">
              <p className="text-xs text-slate-500">4박 2인 기준 (올인클루시브)</p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <p className="whitespace-nowrap text-xl font-extrabold leading-tight text-teal-700 md:text-2xl">
                  ${resort.price.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={handleViewDetails}
                  className="whitespace-nowrap rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  상세보기
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-right text-xs text-slate-500">수중환경: {resort.snorkelingQuality}/5점</p>
        </div>
      </div>
    </article>
  );
};

export default ResortCard;
