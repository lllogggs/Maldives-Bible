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
  ['예산', '항공권 포함/제외, 트랜스퍼 포함 여부를 먼저 맞춥니다.', DollarIcon],
  ['이동', '보트, 수상비행기, 국내선 중 무엇인지 확인합니다.', BoatIcon],
  ['객실', '워터빌라만 볼지, 비치빌라와 섞을지 정합니다.', BuildingIcon],
  ['바다', '라군이 예쁜 곳과 스노클링이 좋은 곳은 다릅니다.', CheckCircleIcon],
  ['식사', 'HB, FB, AI 포함 범위가 리조트마다 다릅니다.', RestaurantIcon],
] as const;

const transferRows = [
  ['보트', '말레 근처', '도착 당일 이동이 가장 쉽습니다.', BoatIcon],
  ['수상비행기', '원거리 섬', '낮 시간 연결만 가능한 경우가 많습니다.', SeaplaneIcon],
  ['국내선', '아톨 깊은 곳', '국내선 후 보트 이동이 붙을 수 있습니다.', DomesticFlightIcon],
] as const;

const quickTerms = [
  ['HB', '조식 + 석식'],
  ['FB', '조식 + 중식 + 석식'],
  ['AI', '식사 + 음료 포함, 범위 확인'],
  ['라군', '얕고 밝은 바다'],
  ['하우스리프', '리조트 주변 산호/스노클링'],
  ['트랜스퍼', '말레 공항 ↔ 리조트 이동'],
];

const ResortSelectionTips: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-7 pb-10">
      <section className="border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">리조트 선택 팁</h1>
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
        <h2 className="font-brand-heading mb-3 text-lg text-slate-950">이동수단</h2>
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
          <h2 className="font-brand-heading text-lg text-slate-950">용어</h2>
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
