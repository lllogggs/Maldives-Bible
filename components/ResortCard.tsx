import React, { useEffect, useRef, useState } from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import {
  LocationPinIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  HeartIcon,
  HeartFilledIcon,
} from './icons/Icons';
import { getTransportationLabel } from './transportationLabels';
import ResortReviewSummary from './ResortReviewSummary';

interface ResortCardProps {
  resort: Resort;
  compareList: number[];
  onToggleCompare: (resortId: number) => void;
  isImageEditMode?: boolean;
  interestCount: number;
  isLiked: boolean;
  onToggleLike: (resortId: number) => void;
  isLikePending: boolean;
  onViewDetails: (resortId: number) => void;
  imagePriority?: boolean;
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

const getResortSlug = (resort: Pick<Resort, 'name' | 'name_en'>): string =>
  (resort.name_en || resort.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();

const ResortCard: React.FC<ResortCardProps> = ({
  resort,
  compareList,
  onToggleCompare,
  isImageEditMode = false,
  interestCount,
  isLiked,
  onToggleLike,
  isLikePending,
  onViewDetails,
  imagePriority = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const didSwipeImageRef = useRef(false);
  const isSelectedForCompare = compareList.includes(resort.id);
  const canSelectForCompare = compareList.length < 3 || isSelectedForCompare;
  const compareButtonLabel = isSelectedForCompare
    ? `${resort.name} 비교에서 제거`
    : canSelectForCompare
      ? `${resort.name} 비교에 추가`
      : `${resort.name} 비교는 최대 3개까지 선택 가능`;
  const compareButtonTitle = isSelectedForCompare
    ? '비교에서 제거'
    : canSelectForCompare
      ? '비교에 추가'
      : '최대 3개 선택됨';
  const detailHref = `/resorts/${getResortSlug(resort)}/`;

  const actualImageUrls = Array.isArray(resort.imageUrls)
    ? resort.imageUrls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    : [];
  const imageUrls = actualImageUrls.filter(url => !failedImageUrls.has(url));
  const imageCount = imageUrls.length;
  const hasDisplayImages = imageCount > 0;
  const safeImageIndex = hasDisplayImages ? Math.min(currentImageIndex, imageCount - 1) : 0;
  const currentImageUrl = hasDisplayImages ? imageUrls[safeImageIndex] : null;
  const comparisonTags = [
    resort.hasWaterVilla ? '워터빌라' : resort.hasBeachVilla ? '비치빌라' : null,
    `수중환경 ${resort.snorkelingQuality}/5`,
    resort.hasPrivatePool ? '개인풀' : null,
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

  const handleDetailLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (didSwipeImageRef.current) {
      didSwipeImageRef.current = false;
      e.preventDefault();
      return;
    }

    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    onViewDetails(resort.id);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    didSwipeImageRef.current = false;
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
      didSwipeImageRef.current = true;
      handleNextImage(e);
    } else if (distance < -minSwipeDistance) {
      didSwipeImageRef.current = true;
      handlePrevImage(e);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const formattedInterestCount = Math.max(0, interestCount ?? 0).toLocaleString();
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
      className="group/card relative flex min-h-[190px] cursor-pointer flex-row overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1.5 hover:z-10 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-950/15 motion-reduce:transform-none sm:h-full sm:min-h-0 sm:flex-col"
      data-resort-card={resort.id}
    >
      <a
        href={detailHref}
        onClick={handleDetailLinkClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          didSwipeImageRef.current = false;
          setTouchStart(0);
          setTouchEnd(0);
        }}
        aria-label={`${resort.name} 상세 보기`}
        className="absolute inset-0 z-10 touch-pan-y rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal-500"
      >
        <span className="sr-only">{resort.name} 상세 보기</span>
      </a>

      <div className="group relative w-[42%] shrink-0 overflow-hidden bg-slate-100 sm:w-full">
        <div className="block w-full overflow-hidden text-left">
          {currentImageUrl ? (
            <img
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04] sm:static sm:h-56"
              src={currentImageUrl}
              alt={`${resort.name} 리조트 이미지 ${safeImageIndex + 1}`}
              loading={imagePriority ? 'eager' : 'lazy'}
              fetchPriority={imagePriority ? 'high' : 'auto'}
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <span className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.95),transparent_32%),radial-gradient(circle_at_82%_82%,rgba(45,212,191,0.2),transparent_36%),linear-gradient(145deg,#dff8f5,#eef9ff_55%,#f8fafc)] px-3 text-center sm:static sm:h-56 sm:px-6">
              <span aria-hidden="true" className="absolute -bottom-16 -left-10 h-36 w-72 rounded-[50%] border-[18px] border-white/55" />
              <span aria-hidden="true" className="absolute -right-12 -top-16 h-36 w-36 rounded-full border-[18px] border-teal-200/35" />
              <span className="relative flex flex-col items-center gap-2">
                <img src="/android-chrome-192x192.png" alt="" loading="lazy" decoding="async" className="h-10 w-10 rounded-xl object-cover opacity-90 shadow-sm" />
                <span className="font-brand-heading text-sm font-bold text-teal-950">{resort.name}</span>
              </span>
            </span>
          )}
        </div>

        {imageUrls.length > 1 && !isImageEditMode && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 touch-manipulation items-center justify-center -translate-y-1/2 rounded-full bg-white/85 text-slate-800 shadow-sm backdrop-blur transition-all hover:bg-white focus:opacity-100 sm:inline-flex lg:opacity-0 lg:group-hover:opacity-100"
              aria-label={`${resort.name} 이전 이미지`}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 touch-manipulation items-center justify-center -translate-y-1/2 rounded-full bg-white/85 text-slate-800 shadow-sm backdrop-blur transition-all hover:bg-white focus:opacity-100 sm:inline-flex lg:opacity-0 lg:group-hover:opacity-100"
              aria-label={`${resort.name} 다음 이미지`}
            >
              <ChevronRightIcon />
            </button>
            <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-slate-950/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2 sm:px-2.5 sm:py-1 sm:text-xs">
              {safeImageIndex + 1} / {imageUrls.length}
            </div>
          </>
        )}

        <div className={`pointer-events-none absolute left-2 top-2 rounded-full border px-2 py-1 text-[10px] font-bold shadow-sm backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-xs ${getTransportationTagColor(resort.transportation)}`}>
          {getTransportationLabel(resort.transportation)}
        </div>
        <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:gap-1 sm:px-3 sm:text-sm">
          <StarIcon />
          <span>{resort.rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-2 right-2 z-20 sm:bottom-3 sm:right-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleCompare(resort.id); }}
            disabled={!canSelectForCompare}
            className={`inline-flex min-h-10 touch-manipulation items-center gap-1 rounded-full px-2.5 text-[11px] font-bold shadow-sm backdrop-blur transition-colors disabled:cursor-not-allowed disabled:bg-slate-200/80 sm:min-h-11 sm:gap-1.5 sm:px-3.5 sm:text-xs ${
              isSelectedForCompare
                ? 'bg-teal-700 text-white hover:bg-teal-800'
                : 'bg-white/90 text-slate-800 hover:bg-white'
            }`}
            aria-label={compareButtonLabel}
            title={compareButtonTitle}
          >
            {isSelectedForCompare && <CheckCircleIcon className="h-4 w-4" />}
            비교
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        {isImageEditMode && (
          <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
            상세 페이지에서 삭제할 이미지를 선택할 수 있습니다.
          </div>
        )}

        <h3 className="font-brand-heading text-[15px] leading-snug text-slate-950 sm:text-lg sm:leading-tight">
          <span className="line-clamp-2 transition-colors group-hover/card:text-teal-700">{resort.name}</span>
        </h3>

        <div className="mt-1.5 flex items-start text-xs leading-4 text-slate-600 sm:mt-2.5 sm:items-center sm:text-sm sm:leading-6">
          <LocationPinIcon />
          <span className="line-clamp-1 ml-1">
            {resort.location} · {getTransportationLabel(resort.transportation)} {resort.travelTime}분
          </span>
        </div>

        <div className="mt-2 flex min-h-6 flex-nowrap gap-1 overflow-hidden sm:mt-3 sm:min-h-7 sm:flex-wrap sm:gap-1.5">
          {comparisonTags.slice(0, 3).map((tag, index) => (
            <span key={tag} className={`${chipClass} ${index === 2 ? 'hidden sm:inline-flex' : ''} h-6 max-w-full truncate px-2 text-[10px] sm:h-7 sm:px-2.5 sm:text-xs border border-slate-200 bg-slate-50 text-slate-700`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="hidden sm:block">
          <ResortReviewSummary resortId={resort.id} resortName={resort.name} summary={resort.reviewSummary} variant="compact" />
        </div>

        <div className="mt-auto pt-2 sm:pt-4">
          <div className="flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikePending}
              aria-pressed={isLiked}
              aria-label={`${likeButtonTitle}. 현재 관심도 ${formattedInterestCount}`}
              title={`${likeButtonTitle} · 가격대, 실제 후기 자료와 사용자 저장을 반영한 관심도`}
              className={`relative z-20 flex h-10 min-w-10 touch-manipulation items-center justify-center gap-1 rounded-full border px-2 text-xs font-semibold transition-colors sm:h-11 sm:min-w-11 sm:gap-2 sm:px-3 sm:text-sm ${
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
              <span><span className="sr-only">관심도 </span>{formattedInterestCount}</span>
            </button>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[11px] text-slate-500 sm:text-xs">4박 2인 참고가</p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <p className="whitespace-nowrap text-base font-extrabold leading-tight text-teal-700 sm:text-xl">
                  ${resort.price.toLocaleString()}
                </p>
                <span className="hidden h-11 items-center whitespace-nowrap rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition-colors group-hover/card:bg-slate-800 sm:inline-flex">
                  보기
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 hidden text-left text-xs leading-5 text-slate-500 sm:block">
            올인클루시브 기준 · 이동비 2인 ${coupleTransferCost.toLocaleString()} 별도
          </p>
        </div>
      </div>
    </article>
  );
};

export default ResortCard;
