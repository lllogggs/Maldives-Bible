import React, { useState, ReactNode } from 'react';
import type { Resort } from '../types';
import { 
  ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, LocationPinIcon, ClockIcon, DollarIcon,
  SeaplaneIcon, BoatIcon, DomesticFlightIcon, LinkIcon, CalendarIcon, RestaurantIcon, CheckCircleIcon, XCircleIcon, KidsClubIcon, HeartIcon
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageUrls = resort.imageUrls && resort.imageUrls.length > 0
    ? resort.imageUrls
    : ['https://via.placeholder.com/1280x720.png?text=Image+Not+Found'];

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
  };

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
        <div className="relative group w-full h-64 sm:h-80 md:h-96">
          <img 
            src={imageUrls[currentImageIndex]} 
            alt={`${resort.name_en} gallery image ${currentImageIndex + 1}`} 
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Next image"
              >
                <ChevronRightIcon />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full pointer-events-none">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>
            </>
          )}
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
    </div>
  );
};

export default ResortDetail;