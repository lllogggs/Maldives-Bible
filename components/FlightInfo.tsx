import React from 'react';
import { ClockIcon, CalendarIcon, DomesticFlightIcon } from './icons/Icons';

const routes = [
  {
    stopover: '싱가포르 경유',
    airlines: '싱가포르항공 · 스쿠트',
    budget: '대략 100만~140만원대',
    time: '짧은 편',
    bestFor: '첫 몰디브, 공항 대기 쾌적함',
  },
  {
    stopover: '중동 경유',
    airlines: '에미레이트 · 에티하드 · 카타르',
    budget: '대략 120만~170만원대',
    time: '긴 편',
    bestFor: '밤 출발, 스탑오버 여행',
  },
  {
    stopover: '동남아 경유',
    airlines: '말레이시아항공 · 에어아시아 등',
    budget: '대략 90만~130만원대',
    time: '가격 우선',
    bestFor: '예산 절약, 유연한 일정',
  },
];

const bookingChecks = [
  '말레 도착 시간이 리조트 이동수단 운항 시간과 맞는지',
  '수하물 포함 여부와 허니문 짐 무게',
  '귀국편 새벽 도착/출발 시 말레 숙박이 필요한지',
];

const FlightInfo: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <section className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-brand-heading text-2xl text-slate-950">항공권 정보</h1>
          <p className="mt-1 text-sm text-slate-600">몰디브는 직항보다 경유 루트 선택이 일정 만족도를 좌우합니다.</p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          ICN → MLE
        </span>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {routes.map(route => (
          <article key={route.stopover} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">{route.stopover}</h2>
                <p className="mt-1 text-sm text-slate-500">{route.airlines}</p>
              </div>
              <DomesticFlightIcon className="h-5 w-5 text-teal-700" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="block text-xs font-semibold text-slate-500">예산</span>
                <strong className="mt-1 block text-slate-950">{route.budget}</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="block text-xs font-semibold text-slate-500">성격</span>
                <strong className="mt-1 block text-slate-950">{route.time}</strong>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{route.bestFor}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <div className="mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-teal-700" />
            <h2 className="font-brand-heading text-xl text-slate-950">예약 전 체크</h2>
          </div>
          <div className="grid gap-3">
            {bookingChecks.map(item => (
              <div key={item} className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-teal-100 bg-teal-50 p-5 text-sm text-teal-950">
          <div className="mb-3 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="font-brand-heading text-lg">초기 조사 팁</h2>
          </div>
          <p className="leading-6">
            항공권은 먼저 날짜 폭을 넓게 잡고, 리조트 이동 가능 시간과 맞는 조합만 남기면 됩니다.
          </p>
        </aside>
      </section>
    </div>
  );
};

export default FlightInfo;
