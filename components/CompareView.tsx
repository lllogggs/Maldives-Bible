import React from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import { ArrowLeftIcon, StarIcon, CheckCircleIcon, XCircleIcon, LocationPinIcon, ClockIcon, DollarIcon, CalendarIcon, RestaurantIcon, BarIcon, PoolIcon, KidsClubIcon, HeartIcon, SeaplaneIcon, BoatIcon, DomesticFlightIcon } from './icons/Icons';

interface CompareViewProps {
  resorts: Resort[];
  onBack: () => void;
  onRemove: (resortId: number) => void;
}

const BooleanIcon: React.FC<{ value: boolean }> = ({ value }) => {
  return value 
    ? <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto" /> 
    : <XCircleIcon className="h-6 w-6 text-red-400 mx-auto" />;
};

const TransportationDisplay: React.FC<{type: TransportationType; className?: string}> = ({ type, className }) => {
    const Icon = {
        [TransportationType.Seaplane]: SeaplaneIcon,
        [TransportationType.Boat]: BoatIcon,
        [TransportationType.Domestic]: DomesticFlightIcon,
    }[type];
    return <div className={`flex flex-col items-center gap-1 ${className}`}><Icon className="h-5 w-5 text-gray-600" /><span>{type}</span></div>;
}

const specs = [
  {
    category: '기본 정보',
    attributes: [
      { label: '평점', key: 'rating', render: (val: number) => <div className="flex items-center justify-center gap-1 font-bold"><StarIcon /> {val.toFixed(1)}</div> },
      { label: '수중환경', key: 'snorkelingQuality', render: (val: number) => <div className="flex items-center justify-center gap-1 font-bold"><StarIcon /> {val}</div> },
      { label: '위치', key: 'location' },
      { label: '브랜드', key: 'brand' },
      { label: '오픈/리노베이션', key: 'openYear', render: (val: number, resort: Resort) => `${val}${resort.renovationYear ? ` / ${resort.renovationYear}` : ''}` },
    ]
  },
   {
    category: '룸타입',
    attributes: [
      { label: '비치빌라', key: 'hasBeachVilla', render: (val: boolean) => <BooleanIcon value={val} /> },
      { label: '워터빌라', key: 'hasWaterVilla', render: (val: boolean) => <BooleanIcon value={val} /> },
      { label: '개인 풀', key: 'hasPrivatePool', render: (val: boolean) => <BooleanIcon value={val} /> },
    ]
  },
  {
    category: '이동 정보',
    attributes: [
      { label: '이동수단', key: 'transportation', render: (val: TransportationType) => <TransportationDisplay type={val} /> },
      { label: '이동시간 (분)', key: 'travelTime' },
      { label: '이동비용 ($)', key: 'travelCost', render: (val: number) => val.toLocaleString() },
    ]
  },
  {
    category: '시설',
    attributes: [
      { label: '레스토랑', key: 'restaurants' },
      { label: '바', key: 'bars' },
      { label: '수영장', key: 'pools' },
      { label: '스파 브랜드', key: 'spaBrand' },
    ]
  },
  {
    category: '편의시설',
    attributes: [
      { label: '패밀리룸', key: 'hasFamilyRoom', render: (val: boolean) => <BooleanIcon value={val} /> },
      { label: '키즈클럽', key: 'hasKidsClub', render: (val: boolean) => <BooleanIcon value={val} /> },
      { label: '허니문 혜택', key: 'honeymoonPerks', render: (val: boolean) => <BooleanIcon value={val} /> },
    ]
  },
];

const CompareHeaderCard: React.FC<{resort: Resort, onRemove: (id: number) => void}> = ({ resort, onRemove }) => (
    <div className="border border-gray-200 rounded-xl p-4 relative bg-white h-full flex flex-col">
        <button onClick={() => onRemove(resort.id)} className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 z-10" aria-label={`Remove ${resort.name}`}>
            <XCircleIcon className="h-6 w-6" />
        </button>
        <img src={resort.imageUrls[0]} alt={resort.name} className="w-full h-32 object-cover rounded-lg mb-4" />
        <div className="flex-grow">
            <h3 className="font-bold text-gray-800">{resort.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{resort.name_en}</p>
        </div>
        <div className="mt-auto">
            <p className="text-lg font-extrabold text-cyan-600">${resort.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">4박 2인 기준</p>
        </div>
    </div>
);


const CompareView: React.FC<CompareViewProps> = ({ resorts, onBack, onRemove }) => {
  const numResorts = resorts.length;
  const gridColsClass = `grid-cols-${numResorts + 1}`;
  
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        목록으로 돌아가기
      </button>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">선택한 리조트 비교하기</h1>
        
        <div className="overflow-x-auto">
            <div className={`min-w-[${250 * (numResorts + 1)}px]`}>
                {/* Header Cards */}
                <div className={`grid ${gridColsClass} gap-4 mb-4`}>
                    <div /> {/* Empty cell for labels column */}
                    {resorts.map(resort => <CompareHeaderCard key={resort.id} resort={resort} onRemove={onRemove} />)}
                </div>

                {/* Specs Table */}
                {specs.map(section => (
                    <div key={section.category} className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 my-4 py-2 border-b-2 border-gray-200">{section.category}</h2>
                        <div className="space-y-2">
                            {section.attributes.map(attr => (
                                <div key={attr.key} className={`grid ${gridColsClass} gap-4 items-center py-3 px-2 rounded-lg hover:bg-gray-50`}>
                                    <div className="font-semibold text-gray-600 text-sm flex items-center gap-2">{attr.label}</div>
                                    {resorts.map(resort => (
                                        <div key={`${resort.id}-${attr.key}`} className="text-center font-medium text-gray-800 text-sm sm:text-base">
                                            {attr.render ? attr.render(resort[attr.key as keyof Resort], resort) : String(resort[attr.key as keyof Resort])}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompareView;