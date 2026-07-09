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

const chipClass = 'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold leading-none';

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
  const featureTags = [
    resort.honeymoonPerks ? '허니문 혜택' : null,
    resort.hasWaterVilla ? '워터빌라' : null,
    resort.hasPrivatePool ? '개인풀' : null,
    resort.snorkelingQuality >= 4.7 ? '수중환경' : null,
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
    if (imageUrls.length < 2) return;
    setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleNextImage = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (imageUrls.length < 2) return;
    setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
  };

  const handleViewDetails = (e: React.SyntheticEvent) => {
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
    if (distance > minSwipeDistance) {
      handleNextImage(e);
    } else if (distance < -minSwipeDistance) {
      handlePrevImage(e);
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
    if (!isLikePending) {
      onToggleLike(resort.id);
    }
  };

  const handleImageError = () => {
    if (!currentImageUrl) return;
    setFailedImageUrls(prev => {
      const next = new Set(prev);
      next.add(currentImageUrl);
      return next;
    });
  };

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
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
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            src={currentImageUrl}
            alt={`${resort.name} 리조트 이미지 ${currentImageIndex + 1}`}
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-[linear-gradient(135deg,#e0f2f1,#f8fafc)] px-6 text-center">
            <p className="text-sm font-bold text-teal-800">{resort.name}</p>
          </div>
        )}

        {imageUrls.length > 1 && !isImageEditMode && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-800 shadow-sm backdrop-blur transition-all hover:bg-white focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="이전 이미지"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-800 shadow-sm backdrop-blur transition-all hover:bg-white focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="다음 이미지"
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
            title={isSelectedForCompare ? '비교함에서 제거' : '비교함에 담기'}
          >
            {isSelectedForCompare ? <CheckCircleIcon className="h-5 w-5 text-teal-700" /> : <CartIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {isImageEditMode && (
          <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
            상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
          </div>
        )}

        <h3
          className="font-brand-heading line-clamp-2 cursor-pointer text-lg leading-tight text-slate-950 transition-colors hover:text-teal-700"
          onClick={handleViewDetails}
        >
          {resort.name}
        </h3>
        <p className="line-clamp-1 mt-0.5 text-sm leading-5 text-slate-500">{resort.name_en}</p>

        <div className="mt-3 flex items-center text-sm text-slate-600">
          <LocationPinIcon />
          <span className="line-clamp-1 ml-1">{resort.location} · {resort.travelTime}분</span>
        </div>
        <p className="mt-1 truncate text-sm text-slate-600">{resort.brand} · {resort.spaBrand}</p>

        <div className="mt-3 flex h-7 flex-wrap gap-1.5 overflow-hidden">
          {featureTags.slice(0, 3).map(tag => (
            <span key={tag} className={`${chipClass} border border-rose-100 bg-rose-50 text-rose-700`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 flex h-7 flex-wrap gap-1.5 overflow-hidden">
          {resort.roomTypes.slice(0, 3).map(type => (
            <span key={type} className={`${chipClass} border border-slate-200 bg-slate-50 text-slate-700`}>
              {type}
            </span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
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

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikePending}
              aria-pressed={isLiked}
              aria-label={`${likeButtonTitle} (현재 ${formattedLikesCount}명)`}
              title={likeButtonTitle}
              className={`flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors ${
                isLiked
                  ? 'border-rose-300 bg-rose-100 text-rose-600 hover:bg-rose-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              } ${isLikePending ? 'cursor-wait opacity-70' : ''}`}
            >
              {isLiked ? (
                <HeartFilledIcon className="h-5 w-5 text-rose-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-rose-500" />
              )}
              <span>{formattedLikesCount}</span>
            </button>
            <div className="text-right">
              <p className="text-xs text-slate-500">4박 2인</p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <p className="whitespace-nowrap text-xl font-extrabold leading-tight text-teal-700">
                  ${resort.price.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={handleViewDetails}
                  className="h-8 whitespace-nowrap rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
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
