import React, { useState, useEffect } from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import { ArrowLeftIcon, StarIcon, CheckCircleIcon, XCircleIcon, SeaplaneIcon, BoatIcon, DomesticFlightIcon, XIcon, RotateDeviceIcon } from './icons/Icons';

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
    return <div className={`flex flex-col items-center gap-1 text-center ${className}`}><Icon className="h-5 w-5 text-gray-600" /><span>{type}</span></div>;
}

const specs = [
  {
    category: '기본 정보',
    attributes: [
      { label: '평점', key: 'rating', lowerIsBetter: false, render: (val: number) => <div className="flex items-center justify-center gap-1 font-bold"><StarIcon className="h-4 w-4 text-yellow-400" /> {val.toFixed(1)}</div> },
      { label: '수중환경', key: 'snorkelingQuality', lowerIsBetter: false, render: (val: number) => <div className="flex items-center justify-center gap-1 font-bold"><StarIcon className="h-4 w-4 text-yellow-400" /> {val}</div> },
      { label: '위치', key: 'location' },
      { label: '브랜드', key: 'brand' },
      { label: '오픈/리노베이션', key: 'openYear', lowerIsBetter: true, render: (val: number, resort: Resort) => `${val}${resort.renovationYear ? ` / ${resort.renovationYear}` : ''}` },
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
      { label: '이동시간 (분)', key: 'travelTime', lowerIsBetter: true },
      { label: '이동비용 ($)', key: 'travelCost', lowerIsBetter: true, render: (val: number) => val.toLocaleString() },
    ]
  },
  {
    category: '시설',
    attributes: [
      { label: '레스토랑', key: 'restaurants', lowerIsBetter: false },
      { label: '바', key: 'bars', lowerIsBetter: false },
      { label: '수영장', key: 'pools', lowerIsBetter: false },
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

const CompareHeaderCard: React.FC<{resort: Resort, isBestPrice: boolean}> = ({ resort, isBestPrice }) => (
    <div className={`border rounded-xl p-2 sm:p-3 relative bg-white h-full flex flex-col transition-all duration-300 ${isBestPrice ? 'border-2 border-cyan-400 shadow-lg' : 'border-gray-200'}`}>
        <img src={resort.imageUrls[0]} alt={resort.name} className="hidden md:block w-full h-32 object-cover rounded-lg mb-3" />
        <div className="flex-grow flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{resort.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 truncate">{resort.name_en}</p>
            </div>
            <div className={`mt-auto transition-all duration-300 ${isBestPrice ? 'bg-cyan-50 rounded-lg -m-2 mt-2 p-2 pt-1 sm:-m-3 sm:mt-3 sm:p-3 sm:pt-2' : 'pt-2'}`}>
                <p className="text-xs text-gray-500">4박 2인 기준</p>
                <p className={`text-base sm:text-lg font-extrabold ${isBestPrice ? 'text-cyan-600' : 'text-gray-800'}`}>${resort.price.toLocaleString()}</p>
            </div>
        </div>
    </div>
);


const CompareView: React.FC<CompareViewProps> = ({ resorts, onBack, onRemove }) => {
  const numResorts = resorts.length;
  const [showRotateModal, setShowRotateModal] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
        if (window.innerWidth < 1024 && window.innerHeight > window.innerWidth) {
            setShowRotateModal(true);
        } else {
            setShowRotateModal(false);
        }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => {
        window.removeEventListener('resize', checkOrientation);
    };
  }, []);
  
  const getBestValue = (attributeKey: keyof Resort, lowerIsBetter?: boolean, isBoolean?: boolean) => {
    if (numResorts < 2) return null;

    const values = resorts.map(r => r[attributeKey]);
    
    if (isBoolean || (typeof values[0] === 'boolean' && lowerIsBetter === undefined)) {
        return values.some(v => v === true) ? true : null;
    }

    const numericValues = values.filter(v => typeof v === 'number') as number[];
    if (numericValues.length < numResorts) return null;
    
    return lowerIsBetter ? Math.min(...numericValues) : Math.max(...numericValues);
  };

  const prices = resorts.map(r => r.price);
  const bestPrice = numResorts > 1 ? Math.min(...prices) : null;

  return (
    <div className="animate-fade-in">
       {showRotateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 lg:hidden">
            <div className="bg-white rounded-lg p-8 text-center max-w-sm shadow-xl">
                <RotateDeviceIcon className="h-16 w-16 mx-auto text-cyan-500 mb-4"/>
                <h3 className="text-xl font-bold text-gray-800 mb-2">가로 모드로 돌려보세요</h3>
                <p className="text-gray-600 mb-6">리조트 비교는 화면을 가로로 돌렸을 때 더 편하게 보실 수 있습니다.</p>
                <button
                    onClick={() => setShowRotateModal(false)}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-colors"
                >
                    확인
                </button>
            </div>
        </div>
      )}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        목록으로 돌아가기
      </button>

      <div className="bg-white p-2 sm:p-6 rounded-lg border border-gray-200 shadow-md">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">선택한 리조트 비교하기</h1>
        <div className="relative mt-4 sm:mt-6 overflow-x-auto">
            <div className="grid gap-x-2 sm:gap-x-4" style={{ gridTemplateColumns: `minmax(100px, auto) repeat(${numResorts}, max-content)`}}>
                {/* Row 1: Headers */}
                <div className="sticky top-0 left-0 bg-white z-30 border-b border-gray-200"></div> {/* Top-left corner */}
                {resorts.map(resort => (
                    <div key={resort.id} className="sticky top-0 bg-white z-20 py-2 border-b border-gray-200">
                        <CompareHeaderCard resort={resort} isBestPrice={bestPrice !== null && resort.price === bestPrice} />
                    </div>
                ))}

                {/* Subsequent Rows: Specs */}
                {specs.map(section => (
                    <React.Fragment key={section.category}>
                        {/* Section Header */}
                        <div className="col-span-full text-base sm:text-xl font-semibold text-gray-800 my-2 sm:my-4 py-2 sm:py-3 border-b-2 border-t-2 border-gray-100 bg-gray-50 -mx-2 sm:-mx-6 px-2 sm:px-6 sticky left-0 z-10">
                          {section.category}
                        </div>
                        
                        {/* Attribute Rows */}
                        {section.attributes.map(attr => {
                            const bestValue = getBestValue(attr.key as keyof Resort, attr.lowerIsBetter);
                            
                            return (
                                <React.Fragment key={attr.key}>
                                    <div className="font-semibold text-gray-600 text-xs sm:text-sm flex items-center p-2 sm:p-3 sticky left-0 bg-white z-10 border-b">
                                        {attr.label}
                                    </div>
                                    {resorts.map(resort => {
                                        const value = resort[attr.key as keyof Resort];
                                        const isBest = bestValue !== null && value === bestValue && typeof value !== 'string';
                                        return (
                                            <div key={`${resort.id}-${attr.key}`} className={`flex items-center justify-center text-center text-xs sm:text-base font-medium text-gray-800 p-2 sm:p-3 border-b transition-colors duration-200 ${isBest ? 'bg-cyan-50' : ''}`}>
                                                <div className={isBest ? 'font-bold text-cyan-700' : ''}>
                                                    {attr.render ? attr.render(value as any, resort) : String(value)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CompareView;