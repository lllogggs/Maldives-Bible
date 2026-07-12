import React, { useEffect, useRef, useState } from 'react';
import type { Resort } from '../types';
import { TransportationType } from '../types';
import { ArrowLeftIcon, StarIcon, CheckCircleIcon, XCircleIcon, SeaplaneIcon, BoatIcon, DomesticFlightIcon, XIcon, RotateDeviceIcon, ShareIcon } from './icons/Icons';
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
    <div className={`border rounded-xl p-2 sm:p-3 relative bg-white h-full flex flex-col transition-all duration-300 ${isBestPrice ? 'border-2 border-teal-400 shadow-lg' : 'border-gray-200'}`}>
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
                <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{resort.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 truncate">{resort.name_en}</p>
            </div>
            <div className={`mt-auto transition-all duration-300 ${isBestPrice ? 'bg-teal-50 rounded-lg -m-2 mt-2 p-2 pt-1 sm:-m-3 sm:mt-3 sm:p-3 sm:pt-2' : 'pt-2'}`}>
                <p className="text-xs text-gray-500">4박 2인 · 올인클루시브</p>
                <p className={`text-base sm:text-lg font-extrabold ${isBestPrice ? 'text-teal-700' : 'text-gray-800'}`}>${resort.price.toLocaleString()}</p>
            </div>
        </div>
    </div>
  );
};


const CompareView: React.FC<CompareViewProps> = ({ resorts, onBack, onRemove, onShare, isSharePending }) => {
  const numResorts = resorts.length;
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [rotateHintDismissed, setRotateHintDismissed] = useState(false);
  const rotateDialogRef = useRef<HTMLDivElement>(null);
  const rotateConfirmRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const compareHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const checkOrientation = () => {
        if (!rotateHintDismissed && window.innerWidth < 1024 && window.innerHeight > window.innerWidth) {
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
  }, [rotateHintDismissed]);

  useEffect(() => {
    if (!showRotateModal) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => rotateConfirmRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected && previousFocus !== document.body) {
        previousFocus.focus();
      } else {
        compareHeadingRef.current?.focus();
      }
    };
  }, [showRotateModal]);

  const dismissRotateHint = () => {
    setRotateHintDismissed(true);
    setShowRotateModal(false);
  };

  const handleRotateDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismissRotateHint();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = Array.from(
      rotateDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter(element => element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
      event.preventDefault();
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
    <>
      {showRotateModal && (
        <div
          ref={rotateDialogRef}
          className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-20 sm:pt-24 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rotate-hint-title"
          aria-describedby="rotate-hint-description"
          onKeyDown={handleRotateDialogKeyDown}
        >
          <div className="bg-white rounded-lg p-6 sm:p-8 text-center max-w-sm shadow-xl w-full max-w-[360px]">
            <RotateDeviceIcon className="h-16 w-16 mx-auto text-teal-600 mb-4" />
            <h3 id="rotate-hint-title" className="text-xl font-bold text-gray-800 mb-2">가로 화면 추천</h3>
            <p id="rotate-hint-description" className="text-gray-600 mb-6">넓은 비교표로 보기</p>
            <button
              ref={rotateConfirmRef}
              type="button"
              onClick={dismissRotateHint}
              className="w-full bg-teal-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-800 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
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
        <div className="relative mt-4 sm:mt-6 overflow-x-auto">
            <div
              role="table"
              aria-label="리조트 비교 결과"
              aria-colcount={numResorts + 1}
              aria-rowcount={1 + specs.length + specs.reduce((total, section) => total + section.attributes.length, 0)}
              className="grid gap-x-2 sm:gap-x-4"
              style={{ gridTemplateColumns: `minmax(100px, auto) repeat(${numResorts}, max-content)`}}
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
                      className="sticky top-0 bg-white z-20 py-2 border-b border-gray-200"
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
                          <div role="columnheader" aria-colspan={numResorts + 1} className="col-span-full text-base sm:text-xl font-semibold text-gray-800 my-2 sm:my-4 py-2 sm:py-3 border-b-2 border-t-2 border-gray-100 bg-gray-50 -mx-2 sm:-mx-6 px-2 sm:px-6 sticky left-0 z-10">
                            {section.category}
                          </div>
                        </div>
                        
                        {/* Attribute Rows */}
                        {section.attributes.map(attr => {
                            const bestValue = getBestValue(attr.key, attr.lowerIsBetter);
                            
                            return (
                                <div key={attr.key} role="row" className="contents">
                                    <div role="rowheader" className="font-semibold text-gray-600 text-xs sm:text-sm flex items-center p-2 sm:p-3 sticky left-0 bg-white z-10 border-b">
                                        {attr.label}
                                    </div>
                                    {resorts.map(resort => {
                                        const value = resort[attr.key];
                                        const isBest = bestValue !== null && value === bestValue && typeof value !== 'string';
                                        return (
                                            <div role="cell" key={`${resort.id}-${attr.key}`} className={`flex items-center justify-center text-center text-xs sm:text-base font-medium text-gray-800 p-2 sm:p-3 border-b transition-colors duration-200 ${isBest ? 'bg-teal-50' : ''}`}>
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
    </>
  );
};

export default CompareView;
