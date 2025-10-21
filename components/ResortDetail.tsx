import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import type { Resort } from '../types';
import { 
  ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, LocationPinIcon, ClockIcon, DollarIcon,
  SeaplaneIcon, BoatIcon, DomesticFlightIcon, LinkIcon, CalendarIcon, RestaurantIcon, CheckCircleIcon, XCircleIcon, KidsClubIcon, HeartIcon, GalleryIcon
} from './icons/Icons';
import { TransportationType } from '../types';

interface ResortDetailProps {
  resort: Resort;
  onBack: () => void;
}

const InfoCard: React.FC<{ icon: ReactNode; title: string; children: ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="mr-4 text-cyan-500">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <div className="text-lg font-bold text-gray-800">{children}</div>
    </div>
  </div>
);

const AmenityItem: React.FC<{ icon: ReactNode; label: string; value: boolean }> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
    {value 
      ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> 
      : <XCircleIcon className="h-6 w-6 text-red-400" />}
    <span className="text-gray-700">{label}</span>
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

const ResortDetail: React.FC<ResortDetailProps> = ({ resort, onBack }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const imageUrls = resort.imageUrls && resort.imageUrls.length > 0
    ? resort.imageUrls
    : ['https://via.placeholder.com/1280x720.png?text=Image+Not+Found'];

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const goToNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex(prev => (prev + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const goToPrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowRight') goToNext(e);
      if (e.key === 'ArrowLeft') goToPrev(e);
    };
    if (isGalleryOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGalleryOpen, closeGallery, goToNext, goToPrev]);


  const gridImages = imageUrls.slice(1, 5);

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        목록으로 돌아가기
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Image Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-2 h-64 md:h-[450px]">
          <div 
            className="col-span-2 row-span-2 cursor-pointer group overflow-hidden" 
            onClick={() => openGallery(0)}
            role="button"
            aria-label="View image 1 in gallery"
          >
            <img src={imageUrls[0]} alt={`${resort.name_en} main view`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
          </div>
          
          {gridImages.map((url, index) => (
            <div 
              key={index} 
              className="hidden md:block col-span-1 row-span-1 cursor-pointer group relative overflow-hidden" 
              onClick={() => openGallery(index + 1)}
              role="button"
              aria-label={`View image ${index + 2} in gallery`}
            >
              <img src={url} alt={`${resort.name_en} view ${index + 2}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
              {index === gridImages.length - 1 && imageUrls.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-bold text-lg pointer-events-none">
                  <GalleryIcon />
                  <span className="mt-2 text-sm whitespace-nowrap">사진 모두보기 ({imageUrls.length}장)</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{resort.name}</h1>
            <p className="text-lg text-gray-500 mt-1">{resort.name_en}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="text-gray-700 font-semibold">{resort.brand}</p>
              {resort.homepageUrl && (
                <a href={resort.homepageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-800 font-semibold text-sm">
                  공식 홈페이지 <LinkIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <InfoCard icon={<StarIcon />} title="평점">
                {resort.rating.toFixed(1)} / 5.0
            </InfoCard>
            <InfoCard icon={<StarIcon />} title="수중환경">
                {resort.snorkelingQuality} / 5
            </InfoCard>
            <InfoCard icon={<DollarIcon />} title="4박 가격 (USD)">
                ${resort.price.toLocaleString()}
            </InfoCard>
            <InfoCard icon={<TransportationIcon type={resort.transportation} />} title="이동수단">
                {resort.transportation}
            </InfoCard>
            <InfoCard icon={<ClockIcon />} title="이동시간">
                {resort.travelTime}분
            </InfoCard>
            <InfoCard icon={<DollarIcon />} title="이동비용 (USD)">
                ${resort.travelCost.toLocaleString()}
            </InfoCard>
            <InfoCard icon={<LocationPinIcon />} title="위치">
                {resort.location}
            </InfoCard>
             <InfoCard icon={<CalendarIcon />} title="오픈/리노베이션">
                {resort.openYear}{resort.renovationYear && ` / ${resort.renovationYear}`}
            </InfoCard>
          </div>

          {/* Details & Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">리조트 시설</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoCard icon={<RestaurantIcon />} title="레스토랑">{resort.restaurants}개</InfoCard>
                    <InfoCard icon={<RestaurantIcon />} title="바">{resort.bars}개</InfoCard>
                    <InfoCard icon={<RestaurantIcon />} title="수영장">{resort.pools}개</InfoCard>
                </div>
                 <div className="mt-4">
                    <InfoCard icon={<RestaurantIcon />} title="스파 브랜드">{resort.spaBrand}</InfoCard>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">객실 및 편의시설</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AmenityItem icon={<CheckCircleIcon />} label="비치빌라 보유" value={resort.hasBeachVilla} />
                    <AmenityItem icon={<CheckCircleIcon />} label="워터빌라 보유" value={resort.hasWaterVilla} />
                    <AmenityItem icon={<CheckCircleIcon />} label="개인 풀 보유" value={resort.hasPrivatePool} />
                    <AmenityItem icon={<CheckCircleIcon />} label="패밀리 룸" value={resort.hasFamilyRoom} />
                    <AmenityItem icon={<KidsClubIcon />} label="키즈 클럽" value={resort.hasKidsClub} />
                    <AmenityItem icon={<HeartIcon />} label="허니문 혜택" value={resort.honeymoonPerks} />
                </div>
            </div>
          </div>
          
          {/* Room Types */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">대표 객실 타입</h3>
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
       {isGalleryOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
          onClick={closeGallery}
          role="dialog"
          aria-modal="true"
        >
          <button 
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label="Close gallery"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>

          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={imageUrls[selectedImageIndex]} 
              alt={`Resort image ${selectedImageIndex + 1}`} 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {imageUrls.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResortDetail;