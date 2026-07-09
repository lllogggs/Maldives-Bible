import React from 'react';
import {
  BoatIcon,
  SeaplaneIcon,
  DomesticFlightIcon,
  RestaurantIcon,
  PoolIcon,
  BuildingIcon,
  CheckCircleIcon,
  DollarIcon,
} from './icons/Icons';

const decisionRows = [
  ['예산', '리조트비 + 이동비 + 항공권', DollarIcon],
  ['이동', '도착 당일 바로 들어갈 수 있는지', BoatIcon],
  ['객실', '워터빌라, 비치빌라, 개인풀', BuildingIcon],
  ['바다', '라군 감성 또는 스노클링', CheckCircleIcon],
  ['식사', '조식, 풀보드, 올인클루시브', RestaurantIcon],
] as const;

const transferRows = [
  ['보트', '가까운 리조트', '짧은 일정', BoatIcon],
  ['수상비행기', '몰디브다운 이동', '낮 도착', SeaplaneIcon],
  ['국내선', '먼 아톨', '여유 일정', DomesticFlightIcon],
] as const;

const quickTerms = [
  ['HB', '조식 + 석식'],
  ['FB', '조식 + 중식 + 석식'],
  ['AI', '식사 + 음료 포함'],
  ['라군', '얕고 밝은 바다'],
  ['하우스리프', '리조트 주변 산호/스노클링'],
  ['트랜스퍼', '공항-리조트 이동'],
];

const ResortSelectionTips: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-7 pb-10">
      <section className="border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">선택 기준</h1>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="divide-y divide-slate-100">
          {decisionRows.map(([title, detail, Icon]) => (
            <div key={title} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="flex items-center gap-2 font-bold text-slate-950">
                <Icon className="h-4 w-4 text-teal-700" />
                {title}
              </div>
              <p className="text-slate-600">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-brand-heading mb-3 text-lg text-slate-950">이동</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
          {transferRows.map(([title, fit, caution, Icon]) => (
            <div key={title} className="grid gap-1 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[130px_130px_1fr] sm:items-center sm:gap-4">
              <div className="flex items-center gap-2 font-bold text-slate-950">
                <Icon className="h-4 w-4 text-teal-700" />
                {title}
              </div>
              <span className="font-semibold text-slate-700">{fit}</span>
              <span className="text-slate-500">{caution}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <PoolIcon className="h-4 w-4 text-teal-700" />
          <h2 className="font-brand-heading text-lg text-slate-950">용어 정리</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickTerms.map(([term, desc]) => (
            <div key={term} className="grid grid-cols-[88px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm shadow-slate-900/5">
              <strong className="text-slate-950">{term}</strong>
              <span className="text-slate-600">{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResortSelectionTips;
