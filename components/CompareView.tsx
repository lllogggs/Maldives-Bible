import React, { useRef, useState } from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import { ArrowLeftIcon, StarIcon, CheckCircleIcon, XCircleIcon, SeaplaneIcon, BoatIcon, DomesticFlightIcon, XIcon, ShareIcon } from './icons/Icons';
import { getTransportationLabel } from './transportationLabels';

interface CompareViewProps {
  resorts: Resort[];
  onBack: () => void;
  onRemove: (resortId: number) => void;
  onShare: () => void;
  isSharePending: boolean;
}

const BooleanIcon: React.FC<{ value: boolean }> = ({ value }) => {
  return (
    <span className="inline-flex items-center justify-center">
      <span aria-hidden="true">
        {value
          ? <CheckCircleIcon className="h-6 w-6 text-green-500" />
          : <XCircleIcon className="h-6 w-6 text-red-400" />}
      </span>
      <span className="sr-only">{value ? '제공' : '미제공'}</span>
    </span>
  );
};

const TransportationDisplay: React.FC<{type: TransportationType; className?: string}> = ({ type, className }) => {
    const Icon = {
        [TransportationType.Seaplane]: SeaplaneIcon,
        [TransportationType.Boat]: BoatIcon,
        [TransportationType.Domestic]: DomesticFlightIcon,
    }[type];
    return <div className={`flex flex-col items-center gap-1 text-center ${className}`}><Icon className="h-5 w-5 text-gray-600" /><span>{getTransportationLabel(type)}</span></div>;
}

type SpecAttribute = {
  label: string;
  key: keyof Resort;
  lowerIsBetter?: boolean;
  render?: (resort: Resort) => React.ReactNode;
};

type SpecSection = {
  category: string;
  attributes: SpecAttribute[];
};

const specs: SpecSection[] = [
  {
    category: '기본',
    attributes: [
      { label: '평점', key: 'rating', lowerIsBetter: false, render: resort => <div className="flex items-center justify-center gap-1 font-bold"><StarIcon className="h-4 w-4 text-yellow-400" /> {resort.rating.toFixed(1)}</div> },
      { label: '수중환경', key: 'snorkelingQuality', lowerIsBetter: false, render: resort => <div className="flex items-center justify-center gap-1 font-bold"><StarIcon className="h-4 w-4 text-yellow-400" /> {resort.snorkelingQuality}</div> },
      { label: '위치', key: 'location' },
      { label: '브랜드', key: 'brand' },
      { label: '오픈/리노베이션', key: 'openYear', lowerIsBetter: false, render: resort => `${resort.openYear}${resort.renovationYear ? ` / ${resort.renovationYear}` : ''}` },
    ]
  },
   {
    category: '룸타입',
    attributes: [
      { label: '비치빌라', key: 'hasBeachVilla', render: resort => <BooleanIcon value={resort.hasBeachVilla} /> },
      { label: '워터빌라', key: 'hasWaterVilla', render: resort => <BooleanIcon value={resort.hasWaterVilla} /> },
      { label: '개인풀', key: 'hasPrivatePool', render: resort => <BooleanIcon value={resort.hasPrivatePool} /> },
    ]
  },
  {
    category: '이동',
    attributes: [
      { label: '이동수단', key: 'transportation', render: resort => <TransportationDisplay type={resort.transportation} /> },
      { label: '이동시간 (분)', key: 'travelTime', lowerIsBetter: true },
      { label: '이동비 1인 ($)', key: 'travelCost', lowerIsBetter: true, render: resort => resort.travelCost.toLocaleString() },
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
    category: '혜택',
    attributes: [
      { label: '패밀리룸', key: 'hasFamilyRoom', render: resort => <BooleanIcon value={resort.hasFamilyRoom} /> },
      { label: '키즈클럽', key: 'hasKidsClub', render: resort => <BooleanIcon value={resort.hasKidsClub} /> },
    ]
  },
];

const CompareHeaderCard: React.FC<{
  resort: Resort;
  isBestPrice: boolean;
  onRemove: (resortId: number) => void;
}> = ({ resort, isBestPrice, onRemove }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage = resort.imageUrls.find(url => typeof url === 'string' && url.trim().length > 0);

  return (
    <div className={`relative flex h-full flex-col rounded-xl border bg-white p-1.5 transition-all duration-300 sm:p-3 ${isBestPrice ? 'border-2 border-teal-400 shadow-lg' : 'border-gray-200'}`}>
        <button
          type="button"
          onClick={() => onRemove(resort.id)}
          className="absolute right-1.5 top-1.5 z-10 rounded-full bg-slate-950/70 p-1 text-white hover:bg-slate-950"
          aria-label={`${resort.name} 비교에서 제거`}
        >
          <XIcon className="h-4 w-4" />
        </button>
        {primaryImage && !imageFailed ? (
          <img
            src={primaryImage}
            alt={resort.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="hidden md:block w-full h-32 object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="hidden h-32 items-center justify-center rounded-lg bg-teal-50 px-3 text-center text-sm font-bold text-teal-900 md:flex">
            {resort.name}
          </div>
        )}
        <div className="flex-grow flex flex-col justify-between">
            <div>
                <h3 className="compare-header-name font-bold text-xs leading-4 text-gray-800 sm:text-base">{resort.name}</h3>
                <p className="mb-1 hidden truncate text-xs text-gray-500 sm:mb-2 sm:block sm:text-sm">{resort.name_en}</p>
            </div>
            <div className={`mt-auto transition-all duration-300 ${isBestPrice ? 'rounded-lg bg-teal-50 -m-1.5 mt-1.5 p-1.5 pt-1 sm:-m-3 sm:mt-3 sm:p-3 sm:pt-2' : 'pt-1.5 sm:pt-2'}`}>
                <p className="text-[10px] leading-4 text-gray-500 sm:text-xs">4박 2인 <span className="hidden sm:inline">· 올인클루시브</span></p>
                <p className={`text-sm font-extrabold leading-5 sm:text-lg ${isBestPrice ? 'text-teal-700' : 'text-gray-800'}`}>${resort.price.toLocaleString()}</p>
            </div>
        </div>
    </div>
  );
};


const CompareView: React.FC<CompareViewProps> = ({ resorts, onBack, onRemove, onShare, isSharePending }) => {
  const numResorts = resorts.length;
  const compareHeadingRef = useRef<HTMLHeadingElement>(null);
  
  const getBestValue = (attributeKey: keyof Resort, lowerIsBetter?: boolean) => {
    if (numResorts < 2) return null;

    const values = resorts.map(r => r[attributeKey]);
    
    if (typeof values[0] === 'boolean' && lowerIsBetter === undefined) {
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
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        목록으로 돌아가기
      </button>

      <div className="bg-white p-2 sm:p-6 rounded-lg border border-gray-200 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <h1 ref={compareHeadingRef} tabIndex={-1} className="text-xl sm:text-3xl font-bold text-gray-900 outline-none">리조트 비교</h1>
          <button
            type="button"
            onClick={onShare}
            disabled={isSharePending || resorts.length < 2}
            aria-busy={isSharePending}
            data-testid="share-comparison"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-bold text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100 disabled:cursor-wait disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:px-4"
          >
            <ShareIcon className="h-5 w-5" />
            <span>결과 공유</span>
          </button>
        </div>
        <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-center text-xs font-bold text-teal-800 lg:hidden">
          {numResorts > 2 ? '한 화면에 2곳씩 · 옆으로 밀면 3번째' : '두 리조트의 차이를 한 화면에서 확인하세요'}
        </p>
        <div className="compare-results-scroll relative mt-4 overflow-x-auto sm:mt-6">
            <div
              role="table"
              aria-label="리조트 비교 결과"
              aria-colcount={numResorts + 1}
              aria-rowcount={1 + specs.length + specs.reduce((total, section) => total + section.attributes.length, 0)}
              className="compare-results-grid grid"
              style={{ '--compare-count': numResorts } as React.CSSProperties}
            >
                {/* Row 1: Headers */}
                <div role="row" className="contents">
                  <div role="columnheader" className="sticky top-0 left-0 bg-white z-30 border-b border-gray-200">
                    <span className="sr-only">비교 항목</span>
                  </div>
                  {resorts.map(resort => (
                    <div
                      key={resort.id}
                      role="columnheader"
                      aria-label={`${resort.name}, 4박 2인 올인클루시브 ${resort.price.toLocaleString()}달러${bestPrice !== null && resort.price === bestPrice ? ', 최저가' : ''}`}
                      className="compare-resort-header sticky top-0 z-20 border-b border-gray-200 bg-white py-1 sm:py-2"
                    >
                         <CompareHeaderCard
                           resort={resort}
                           isBestPrice={bestPrice !== null && resort.price === bestPrice}
                           onRemove={onRemove}
                         />
                    </div>
                  ))}
                </div>

                {/* Subsequent Rows: Specs */}
                {specs.map(section => (
                    <React.Fragment key={section.category}>
                        {/* Section Header */}
                        <div role="row" className="contents">
                          <div role="columnheader" aria-colspan={numResorts + 1} className="sticky left-0 z-10 col-span-full my-2 border-y-2 border-gray-100 bg-gray-50 px-2 py-2 text-base font-semibold text-gray-800 sm:my-4 sm:px-6 sm:py-3 sm:text-xl">
                            {section.category}
                          </div>
                        </div>
                        
                        {/* Attribute Rows */}
                        {section.attributes.map(attr => {
                            const bestValue = getBestValue(attr.key, attr.lowerIsBetter);
                            
                            return (
                                <div key={attr.key} role="row" className="contents">
                                    <div role="rowheader" className="sticky left-0 z-10 flex items-center border-b bg-white p-1.5 text-[11px] font-semibold leading-4 text-gray-600 sm:p-3 sm:text-sm">
                                        {attr.label}
                                    </div>
                                    {resorts.map(resort => {
                                        const value = resort[attr.key];
                                        const isBest = bestValue !== null && value === bestValue && typeof value !== 'string';
                                        return (
                                            <div role="cell" key={`${resort.id}-${attr.key}`} className={`flex items-center justify-center border-b p-1.5 text-center text-[11px] font-medium leading-4 text-gray-800 transition-colors duration-200 sm:p-3 sm:text-base ${isBest ? 'bg-teal-50' : ''}`}>
                                                <div className={isBest ? 'font-bold text-teal-700' : ''}>
                                                    {isBest && <span className="sr-only">최적 값: </span>}
                                                    {attr.render ? attr.render(resort) : String(value)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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
