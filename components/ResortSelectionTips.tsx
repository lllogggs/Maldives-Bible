import React from 'react';
import {
  BoatIcon,
  SeaplaneIcon,
  DomesticFlightIcon,
  RestaurantIcon,
  PoolIcon,
  BuildingIcon,
  CheckCircleIcon,
} from './icons/Icons';

const coreChecks = [
  {
    title: '이동',
    value: '도착 첫날 피로',
    detail: '밤 도착이면 보트, 풍경까지 원하면 수상비행기.',
    icon: BoatIcon,
  },
  {
    title: '객실',
    value: '사진 vs 휴식',
    detail: '워터빌라는 로망, 비치빌라는 동선과 프라이버시.',
    icon: BuildingIcon,
  },
  {
    title: '수중환경',
    value: '라군 vs 리프',
    detail: '맑고 얕은 라군은 사진, 하우스 리프는 스노클링.',
    icon: CheckCircleIcon,
  },
  {
    title: '식사',
    value: '4박 동안 질리지 않는지',
    detail: '레스토랑 수보다 포함 범위와 예약 규칙이 중요.',
    icon: RestaurantIcon,
  },
];

const transferRows = [
  {
    title: '보트',
    icon: BoatIcon,
    fit: '짧은 일정, 밤 도착',
    caution: '장거리면 멀미 부담',
  },
  {
    title: '수상비행기',
    icon: SeaplaneIcon,
    fit: '첫 몰디브, 풍경 중시',
    caution: '일몰 후 운항 제한',
  },
  {
    title: '국내선',
    icon: DomesticFlightIcon,
    fit: '먼 환초, 대형 리조트',
    caution: '대기+보트 환승 가능',
  },
];

const quickTerms = [
  ['HB', '조식+석식'],
  ['FB', '세 끼'],
  ['AI', '식사+주류 포함'],
  ['하우스 리프', '리조트 주변 산호'],
  ['라군', '얕고 맑은 수역'],
  ['버틀러', '예약·세팅 전담'],
];

const ResortSelectionTips: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <section className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-brand-heading text-2xl text-slate-950">리조트 선택 팁</h1>
          <p className="mt-1 text-sm text-slate-600">처음 준비할 때는 이동, 객실, 수중환경, 식사만 먼저 좁히면 됩니다.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">첫 몰디브</span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">신혼여행</span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">리조트 비교</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {coreChecks.map(item => (
          <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{item.title}</p>
            <h2 className="mt-1 text-base font-bold text-slate-950">{item.value}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-brand-heading text-xl text-slate-950">이동수단 빠른 비교</h2>
          <span className="text-xs font-semibold text-slate-500">말레 공항 기준</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          {transferRows.map(row => (
            <div key={row.title} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[160px_1fr_1fr] sm:items-center">
              <div className="flex items-center gap-3 font-bold text-slate-950">
                <row.icon className="h-5 w-5 text-teal-700" />
                {row.title}
              </div>
              <p className="text-sm text-slate-700">{row.fit}</p>
              <p className="text-sm text-slate-500">{row.caution}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <PoolIcon className="h-5 w-5 text-teal-700" />
          <h2 className="font-brand-heading text-xl text-slate-950">용어만 빠르게</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickTerms.map(([term, desc]) => (
            <div key={term} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm shadow-slate-900/5">
              <strong className="text-slate-950">{term}</strong>
              <span className="text-right text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResortSelectionTips;
