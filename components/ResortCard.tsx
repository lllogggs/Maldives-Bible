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
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isSelectedForCompare = compareList.includes(resort.id);
  const canSelectForCompare = compareList.length < 3 || isSelectedForCompare;

  const actualImageUrls = Array.isArray(resort.imageUrls)
    ? resort.imageUrls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    : [];
  const imageUrls = actualImageUrls.filter(url => !failedImageUrls.has(url));
  const imageCount = imageUrls.length;
  const hasDisplayImages = imageCount > 0;
  const currentImageUrl = hasDisplayImages ? imageUrls[currentImageIndex] : null;
  const honeymoonTags = [
    resort.honeymoonPerks ? '허니문 혜택' : null,
    resort.hasWaterVilla ? '워터빌라' : null,
    resort.hasPrivatePool ? '개인풀' : null,
    resort.snorkelingQuality >= 4.7 ? '수중환경 강점' : null,
    resort.travelTime <= 45 ? '이동 짧음' : null,
  ].filter((tag): tag is string => Boolean(tag));

  useEffect(() => {
    if (hasDisplayImages) {
      setCurrentImageIndex(prev => Math.min(prev, imageCount - 1));
    } else {
      setCurrentImageIndex(0);
    }
  }, [hasDisplayImages, imageCount]);

  const minSwipeDistance = 50;

  const handlePrevImage = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (imageUrls.length < 2) {
      return;
    }
    setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleNextImage = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (imageUrls.length < 2) {
      return;
    }
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
  const nightlyPrice = Math.round(resort.price / 4);
  const coupleTransferCost = Math.max(0, resort.travelCost * 2);
  const likeButtonTitle = isLiked ? '좋아요 취소' : '좋아요 추가';
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLikePending) {
      return;
    }
    onToggleLike(resort.id);
  };

  const handleImageError = () => {
    if (!currentImageUrl) {
      return;
    }

    setFailedImageUrls(prev => {
      const next = new Set(prev);
      next.add(currentImageUrl);
      return next;
    });
  };


  return (
    <article
      className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      data-resort-card={resort.id}
    >
      <div
        className="group relative cursor-pointer overflow-hidden bg-slate-100"
        onClick={handleViewDetails}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentImageUrl ? (
          <img
            className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            src={currentImageUrl}
            alt={`${resort.name} 리조트 이미지 ${currentImageIndex + 1}`}
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-60 w-full flex-col items-center justify-center bg-[linear-gradient(135deg,#e0f2f1,#f8fafc)] px-6 text-center">
            <p className="text-sm font-bold text-teal-800">{resort.name}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              이미지 확인 중입니다. 상세 정보와 조건 비교는 계속 이용할 수 있습니다.
            </p>
          </div>
        )}

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
                    비교함 담기
                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-950"></div>
                </div>
            )}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleCompare(resort.id); }}
                disabled={!canSelectForCompare}
                className="rounded-full bg-white/90 p-2 text-slate-800 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-200/80"
                aria-label={isSelectedForCompare ? `${resort.name} 비교함에서 제거` : `${resort.name} 비교함에 담기`}
                title={isSelectedForCompare ? '비교 목록에서 제거' : '비교 목록에 추가'}
            >
                {isSelectedForCompare ? <CheckCircleIcon className="h-5 w-5 text-teal-700" /> : <CartIcon className="h-5 w-5" />}
            </button>
        </div>
      </div>
      <div className="flex min-h-[400px] flex-1 flex-col p-5">
        {isImageEditMode && (
          <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
            상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
          </div>
        )}
        <div className="min-h-[250px]">
          <h3 className="font-brand-heading line-clamp-2 min-h-[3.25rem] cursor-pointer text-lg leading-snug text-slate-950 transition-colors hover:text-teal-700" onClick={handleViewDetails}>{resort.name}</h3>
          <p className="line-clamp-1 mb-3 min-h-5 text-sm text-slate-500">{resort.name_en}</p>
          
          <div className="mb-1 flex min-h-5 items-center text-sm text-slate-600">
            <LocationPinIcon />
            <span className="line-clamp-1 ml-1">{resort.location} • {resort.travelTime}분</span>
          </div>
          <p className="truncate text-sm text-slate-600">{resort.brand} • {resort.spaBrand}</p>

          <div className="mt-3 flex min-h-[34px] flex-wrap gap-2 overflow-hidden">
            {honeymoonTags.length > 0 && (
              honeymoonTags.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {tag}
                </span>
              ))
            )}
          </div>
          
          <div className="mt-3 flex min-h-[32px] flex-wrap gap-2 overflow-hidden">
            {resort.roomTypes.slice(0, 3).map(type => (
              <span key={type} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{type}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <span className="block text-slate-500">이동</span>
              <strong className="mt-1 block text-slate-900">{resort.travelTime}분</strong>
            </div>
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <span className="block text-slate-500">수중환경</span>
              <strong className="mt-1 block text-slate-900">{resort.snorkelingQuality}/5</strong>
            </div>
            <div className="rounded-lg bg-slate-50 px-2 py-2">
              <span className="block text-slate-500">다이닝</span>
              <strong className="mt-1 block text-slate-900">{resort.restaurants}곳</strong>
            </div>
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
                  상세
                </button>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                1박 ${nightlyPrice.toLocaleString()} · 이동비 2인 ${coupleTransferCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ResortCard;
