import React, { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import type { Resort } from '../types';
import { 
  ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, LocationPinIcon, ClockIcon, DollarIcon,
  SeaplaneIcon, BoatIcon, DomesticFlightIcon, LinkIcon, CalendarIcon, RestaurantIcon, CheckCircleIcon, XCircleIcon, KidsClubIcon, GalleryIcon, XIcon, ShareIcon
} from './icons/Icons';
import { TransportationType } from '../types';
import { getTransportationLabel } from './transportationLabels';
import ResortReviewSummary from './ResortReviewSummary';

interface ResortDetailProps {
  resort: Resort;
  onBack: () => void;
  onShare: () => void;
  isSharePending: boolean;
  isImageEditMode?: boolean;
  onDeleteImage?: (resortId: number, imageIndex: number, imageUrl: string) => void;
}

const InfoCard: React.FC<{ icon: ReactNode; title: string; children: ReactNode }> = ({ icon, title, children }) => (
  <div className="flex h-full min-w-0 flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-start sm:gap-3 sm:p-4">
    <div className="shrink-0 text-cyan-500">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-semibold leading-5 text-gray-500 sm:text-sm">{title}</p>
      <div className="text-base font-bold leading-snug text-gray-800 sm:text-lg">{children}</div>
    </div>
  </div>
);

const AmenityItem: React.FC<{ icon: ReactNode; label: string; value: boolean }> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
    <span aria-hidden="true">
      {value
        ? <CheckCircleIcon className="h-6 w-6 text-green-500" />
        : <XCircleIcon className="h-6 w-6 text-red-400" />}
    </span>
    <span className="text-gray-700">
      {label}
      <span className="sr-only">: {value ? '제공' : '미제공'}</span>
    </span>
  </div>
);

const TransportationIcon: React.FC<{type: TransportationType}> = ({ type }) => {
    switch (type) {
        case TransportationType.Seaplane: return <SeaplaneIcon />;
        case TransportationType.Boat: return <BoatIcon />;
        case TransportationType.Domestic: return <DomesticFlightIcon />;
        default: return null;
    }
}

type ImageCredit = NonNullable<Resort['imageCredits']>[number];

type DisplayImage = {
  url: string;
  originalIndex: number;
};

const getImageCreditText = (credit: ImageCredit) => {
  const parts = [credit.creator, credit.license, credit.provider].filter(Boolean);
  return parts.length > 0 ? `이미지: ${parts.join(' · ')}` : '이미지 출처';
};

const ResortDetail: React.FC<ResortDetailProps> = ({ resort, onBack, onShare, isSharePending, isImageEditMode = false, onDeleteImage }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const didSwipeImageRef = useRef(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const galleryTitleId = `resort-gallery-title-${resort.id}`;

  const minSwipeDistance = 50;

  const actualImages: DisplayImage[] = Array.isArray(resort.imageUrls)
    ? resort.imageUrls
        .map((url, originalIndex) => ({ url, originalIndex }))
        .filter((image): image is DisplayImage => typeof image.url === 'string' && image.url.trim().length > 0)
    : [];

  const displayedImages = actualImages.filter(image => !failedImageUrls.has(image.url));
  const hasDisplayImages = displayedImages.length > 0;
  const safeSelectedImageIndex = hasDisplayImages
    ? Math.min(selectedImageIndex, displayedImages.length - 1)
    : 0;
  const selectedImage = displayedImages[safeSelectedImageIndex];
  const imageCredits = Array.isArray(resort.imageCredits) ? resort.imageCredits : [];
  const primaryImageCredit = displayedImages[0]
    ? imageCredits[displayedImages[0].originalIndex]
    : undefined;
  const selectedImageCredit = selectedImage
    ? imageCredits[selectedImage.originalIndex] ?? primaryImageCredit
    : undefined;

  const canDeleteImages = Boolean(isImageEditMode && onDeleteImage && actualImages.length > 0);

  const markImageAsFailed = useCallback((url: string) => {
    setFailedImageUrls(previousUrls => {
      if (previousUrls.has(url)) {
        return previousUrls;
      }

      const nextUrls = new Set(previousUrls);
      nextUrls.add(url);
      return nextUrls;
    });
  }, []);

  const openGallery = (index: number) => {
    if (!displayedImages[index]) {
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const handleGalleryOpen = (index: number) => {
    if (didSwipeImageRef.current) {
      didSwipeImageRef.current = false;
      return;
    }

    openGallery(index);
  };

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
    window.setTimeout(() => {
      previouslyFocusedElementRef.current?.focus();
    }, 0);
  }, []);

  const goToNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (displayedImages.length < 2) return;
    setSelectedImageIndex(prev => (prev + 1) % displayedImages.length);
  }, [displayedImages.length]);

  const goToPrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (displayedImages.length < 2) return;
    setSelectedImageIndex(prev => (prev - 1 + displayedImages.length) % displayedImages.length);
  }, [displayedImages.length]);

  const requestImageDelete = useCallback(
    (index: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (!canDeleteImages) {
        return;
      }

      const targetImage = displayedImages[index];
      if (!targetImage) {
        return;
      }

      const confirmMessage = actualImages.length === 1
        ? `${resort.name}의 마지막 이미지를 삭제할까요?`
        : `${resort.name}의 이미지를 삭제할까요?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      onDeleteImage?.(resort.id, targetImage.originalIndex, targetImage.url);

      if (displayedImages.length === 1) {
        closeGallery();
      }

      setSelectedImageIndex(prevIndex => {
        if (prevIndex > index) {
          return prevIndex - 1;
        }

        if (prevIndex === index && index >= displayedImages.length - 1) {
          return Math.max(0, prevIndex - 1);
        }

        return prevIndex;
      });
    },
    [actualImages.length, canDeleteImages, closeGallery, displayedImages, onDeleteImage, resort.id, resort.name]
  );
  
  useEffect(() => {
    setFailedImageUrls(new Set());
    setSelectedImageIndex(0);
    setIsGalleryOpen(false);
  }, [resort.id]);

  useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusGallery = window.requestAnimationFrame(() => {
      const closeButton = galleryRef.current?.querySelector<HTMLElement>('[data-gallery-close]');
      (closeButton ?? galleryRef.current)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeGallery();
        return;
      }

      if (event.key === 'ArrowRight') {
        goToNext(event);
        return;
      }

      if (event.key === 'ArrowLeft') {
        goToPrev(event);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = galleryRef.current;
      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(element => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusGallery);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isGalleryOpen, closeGallery, goToNext, goToPrev]);

  useEffect(() => {
    if (selectedImageIndex >= displayedImages.length) {
      setSelectedImageIndex(Math.max(0, displayedImages.length - 1));
    }
  }, [displayedImages.length, selectedImageIndex]);

  useEffect(() => {
    if (isGalleryOpen && !hasDisplayImages) {
      closeGallery();
    }
  }, [closeGallery, hasDisplayImages, isGalleryOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    didSwipeImageRef.current = false;
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      didSwipeImageRef.current = true;
      goToNext();
    } else if (isRightSwipe) {
      didSwipeImageRef.current = true;
      goToPrev();
    }

    if (isLeftSwipe || isRightSwipe) {
      window.setTimeout(() => {
        didSwipeImageRef.current = false;
      }, 400);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const gridImages = displayedImages.slice(1, 5);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          목록으로 돌아가기
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={isSharePending}
          aria-label={`${resort.name} 공유`}
          aria-busy={isSharePending}
          data-testid={`share-resort-detail-${resort.id}`}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-bold text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100 disabled:cursor-wait disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:px-4"
        >
          <ShareIcon className="h-5 w-5" />
          <span>공유</span>
        </button>
      </div>

      {isImageEditMode && (
        <div className="mb-6 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          삭제하려는 이미지를 선택한 뒤 <span className="font-semibold">삭제</span> 버튼을 누르면 해당 이미지가 목록에서 제거되고 URL이 기록됩니다.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Image Gallery */}
        <div className="relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {hasDisplayImages ? (
            <>
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-2 md:h-[450px]">
                <div className="col-span-2 row-span-2 group relative overflow-hidden">
                    <button
                      type="button"
                      className="h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal-400"
                      onClick={() => handleGalleryOpen(0)}
                      aria-label={`${resort.name} 첫 번째 이미지 크게 보기`}
                    >
                      <img
                        src={displayedImages[0].url}
                        alt={`${resort.name_en} main view`}
                        loading="lazy"
                        decoding="async"
                        onError={() => markImageAsFailed(displayedImages[0].url)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                    {canDeleteImages && (
                      <button
                        type="button"
                        onClick={requestImageDelete(0)}
                        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        aria-label={`${resort.name} 첫 번째 이미지 삭제`}
                        title="이 이미지를 삭제"
                      >
                        삭제
                      </button>
                    )}
                </div>
                {gridImages.map((image, index) => {
                  const displayIndex = index + 1;
                  return (
                    <div
                      key={`${image.originalIndex}-${image.url}`}
                      className="col-span-1 row-span-1 group relative overflow-hidden"
                    >
                      <button
                        type="button"
                        className="h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-teal-400"
                        onClick={() => handleGalleryOpen(displayIndex)}
                        aria-label={`${resort.name} 이미지 ${displayIndex + 1} 크게 보기`}
                      >
                        <img
                          src={image.url}
                          alt={`${resort.name_en} view ${displayIndex + 1}`}
                          loading="lazy"
                          decoding="async"
                          onError={() => markImageAsFailed(image.url)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                      {canDeleteImages && (
                        <button
                          type="button"
                          onClick={requestImageDelete(displayIndex)}
                          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                          aria-label={`${resort.name} 이미지 ${displayIndex + 1} 삭제`}
                          title="이 이미지를 삭제"
                        >
                          삭제
                        </button>
                      )}
                      {index === gridImages.length - 1 && displayedImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-bold text-lg pointer-events-none">
                          <GalleryIcon />
                          <span className="mt-2 text-sm whitespace-nowrap">사진 모두보기 ({displayedImages.length}장)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            {/* Mobile Carousel */}
            <div className="md:hidden h-64 w-full overflow-hidden relative">
                <button
                    type="button"
                    aria-label={`${resort.name} 이미지 ${safeSelectedImageIndex + 1} 크게 보기`}
                    className="absolute h-full w-full border-0 bg-transparent p-0"
                    onClick={() => handleGalleryOpen(safeSelectedImageIndex)}
                >
                    <img
                      src={selectedImage.url}
                      alt={`${resort.name_en} view ${safeSelectedImageIndex + 1}`}
                      loading="lazy"
                      decoding="async"
                      onError={() => markImageAsFailed(selectedImage.url)}
                      className="w-full h-full object-cover"
                    />
                </button>
                {canDeleteImages && (
                  <button
                    type="button"
                    onClick={requestImageDelete(safeSelectedImageIndex)}
                    className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 z-20"
                    aria-label={`${resort.name} 현재 이미지 삭제`}
                    title="현재 이미지를 삭제"
                  >
                    삭제
                    </button>
                )}
            </div>
             {displayedImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full pointer-events-none z-10">
                    {safeSelectedImageIndex + 1} / {displayedImages.length}
                </div>
            )}
            {displayedImages.length > 1 && (
              <>
                <button
                    type="button"
                    onClick={(e) => goToPrev(e)}
                    className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all z-10"
                    aria-label={`${resort.name} 이전 이미지`}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                    type="button"
                    onClick={(e) => goToNext(e)}
                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all z-10"
                    aria-label={`${resort.name} 다음 이미지`}
                >
                  <ChevronRightIcon />
                </button>
              </>
            )}
            </>
            ) : (
              <div className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.98),transparent_32%),radial-gradient(circle_at_82%_82%,rgba(45,212,191,0.22),transparent_38%),linear-gradient(145deg,#dff8f5,#eef9ff_55%,#f8fafc)] px-6 text-center md:h-[450px]">
                <span aria-hidden="true" className="absolute -bottom-28 -left-16 h-64 w-[34rem] rounded-[50%] border-[28px] border-white/60" />
                <span aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[28px] border-teal-200/35" />
                <div className="relative flex flex-col items-center gap-3">
                  <img src="/android-chrome-192x192.png" alt="" className="h-14 w-14 rounded-2xl object-cover opacity-90 shadow-sm md:h-16 md:w-16" />
                  <p className="font-brand-heading text-lg font-bold text-teal-950 md:text-xl">{resort.name}</p>
                  <p className="text-xs font-semibold tracking-wide text-teal-700 md:text-sm">리조트 이미지 준비 중</p>
                </div>
              </div>
            )}
        </div>
        {primaryImageCredit && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] leading-4 text-slate-500 md:px-6">
            <span>{getImageCreditText(primaryImageCredit)}</span>
            <a
              href={primaryImageCredit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
            >
              출처
            </a>
          </div>
        )}
        
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">{resort.name}</h1>
            <p className="mt-0.5 text-lg leading-6 text-gray-500">{resort.name_en}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="text-gray-700 font-semibold">{resort.brand}</p>
              {resort.homepageUrl && (
                <a
                  href={resort.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${resort.name} 공식 홈페이지 새 창에서 열기`}
                  className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 font-semibold text-sm"
                >
                  공식 홈페이지 <LinkIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-4 md:mb-8 md:grid-cols-4">
            <InfoCard icon={<StarIcon />} title="평점">
                {resort.rating.toFixed(1)} / 5.0
            </InfoCard>
            <InfoCard icon={<StarIcon />} title="수중환경">
                {resort.snorkelingQuality} / 5
            </InfoCard>
             <InfoCard icon={<DollarIcon />} title="4박 2인 참고가">
                ${resort.price.toLocaleString()}
            </InfoCard>
            <InfoCard icon={<TransportationIcon type={resort.transportation} />} title="이동수단">
                {getTransportationLabel(resort.transportation)}
            </InfoCard>
            <InfoCard icon={<ClockIcon />} title="이동시간">
                {resort.travelTime}분
            </InfoCard>
            <InfoCard icon={<DollarIcon />} title="이동비 1인">
                ${resort.travelCost.toLocaleString()}
            </InfoCard>
            <InfoCard icon={<LocationPinIcon />} title="위치">
                {resort.location}
            </InfoCard>
             <InfoCard icon={<CalendarIcon />} title="오픈/리뉴얼">
                {resort.openYear}{resort.renovationYear && ` / ${resort.renovationYear}`}
            </InfoCard>
          </div>

          <p className="-mt-2 mb-8 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-xs leading-5 text-teal-900">
            비교용 참고가입니다. 항공권과 리조트 이동비는 별도이며 시즌·세금·환율에 따라 실제 견적이 달라질 수 있습니다.
          </p>

          <ResortReviewSummary resortId={resort.id} resortName={resort.name} summary={resort.reviewSummary} variant="detail" />

          {/* Details & Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">시설</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                    <InfoCard icon={<RestaurantIcon />} title="레스토랑">{resort.restaurants}개</InfoCard>
                    <InfoCard icon={<RestaurantIcon />} title="바">{resort.bars}개</InfoCard>
                    <InfoCard icon={<RestaurantIcon />} title="수영장">{resort.pools}개</InfoCard>
                </div>
                 <div className="mt-4">
                    <InfoCard icon={<RestaurantIcon />} title="스파 브랜드">{resort.spaBrand}</InfoCard>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">객실 및 시설</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AmenityItem icon={<CheckCircleIcon />} label="비치빌라" value={resort.hasBeachVilla} />
                    <AmenityItem icon={<CheckCircleIcon />} label="워터빌라" value={resort.hasWaterVilla} />
                    <AmenityItem icon={<CheckCircleIcon />} label="개인풀" value={resort.hasPrivatePool} />
                    <AmenityItem icon={<CheckCircleIcon />} label="패밀리룸" value={resort.hasFamilyRoom} />
                    <AmenityItem icon={<KidsClubIcon />} label="키즈클럽" value={resort.hasKidsClub} />
                </div>
            </div>
          </div>
          
          {/* Room Types */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">객실 타입</h3>
            <div className="flex flex-wrap gap-3">
              {resort.roomTypes.map(type => (
                <span key={type} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
       {isGalleryOpen && selectedImage && (
        <div 
          ref={galleryRef}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
          onClick={closeGallery}
          role="dialog"
          aria-modal="true"
          aria-labelledby={galleryTitleId}
          tabIndex={-1}
        >
          <h2 id={galleryTitleId} className="sr-only">{resort.name} 이미지 갤러리</h2>
          <button 
            type="button"
            onClick={closeGallery}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55 hover:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`${resort.name} 이미지 갤러리 닫기`}
            data-gallery-close
          >
            <XIcon className="h-8 w-8" />
          </button>

          {displayedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
                aria-label={`${resort.name} 이전 이미지`}
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
                aria-label={`${resort.name} 다음 이미지`}
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </>
          )}

          {canDeleteImages && (
            <button
              type="button"
              onClick={requestImageDelete(safeSelectedImageIndex)}
              className="absolute top-16 right-4 inline-flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              aria-label={`${resort.name} 갤러리 이미지 삭제`}
              title="현재 이미지를 삭제"
            >
              삭제
            </button>
          )}

          <div
            className="relative flex max-h-[calc(100dvh-2rem)] max-w-[90vw] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={`${resort.name} 리조트 이미지 ${safeSelectedImageIndex + 1}`}
              onError={() => markImageAsFailed(selectedImage.url)}
              className="max-h-[calc(100dvh-6.5rem)] max-w-full rounded-lg object-contain"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {safeSelectedImageIndex + 1} / {displayedImages.length}
            </div>
            {selectedImageCredit && (
              <a
                href={selectedImageCredit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 max-w-[90vw] text-center text-xs font-medium text-white/80 underline decoration-white/40 underline-offset-2 hover:text-white"
                onClick={(event) => event.stopPropagation()}
              >
                {getImageCreditText(selectedImageCredit)}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResortDetail;
