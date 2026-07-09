import React from 'react';
import { ClockIcon, CalendarIcon, DomesticFlightIcon } from './icons/Icons';

const scheduleTips = [
  {
    title: '말레 새벽 도착',
    value: '리조트 시간을 길게',
    note: '도착 후 대기시간 + 리조트 이동 첫 편',
  },
  {
    title: '오후·밤 도착',
    value: '말레 1박 후 이동',
    note: '늦은 도착이면 다음날 오전 이동',
  },
  {
    title: '수상비행기 리조트',
    value: '낮 도착 우선',
    note: '야간 연결 제한, 말레 도착 시간 중요',
  },
];

const routeRows = [
  ['싱가포르 경유', '일정 맞추기 쉬움', '대기시간'],
  ['중동 경유', '밤 출발 선택지', '총 이동시간'],
  ['동남아 경유', '가격 비교', '수하물 포함'],
];

const FlightInfo: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-7 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">항공 일정</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          ICN → MLE
        </span>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {scheduleTips.map(item => (
          <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-950">{item.title}</h2>
              <ClockIcon className="h-4 w-4 text-teal-700" />
            </div>
            <strong className="block text-sm text-teal-700">{item.value}</strong>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <DomesticFlightIcon className="h-4 w-4 text-teal-700" />
          <h2 className="font-brand-heading text-lg text-slate-950">경유 루트</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {routeRows.map(([route, fit, check]) => (
            <div key={route} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[150px_1fr_1fr] sm:gap-4">
              <strong className="text-slate-950">{route}</strong>
              <span className="text-slate-700">{fit}</span>
              <span className="text-slate-500">{check}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-950">
        <div className="flex items-start gap-2">
          <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            말레 도착 시간과 리조트 이동 가능 시간 확인 후 항공권 확정
          </p>
        </div>
      </section>
    </div>
  );
};

export default FlightInfo;
