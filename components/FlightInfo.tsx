import React from 'react';
import { ClockIcon, CalendarIcon, DomesticFlightIcon, CheckCircleIcon, ChevronRightIcon } from './icons/Icons';

interface FlightInfoProps {
  onShowResorts: () => void;
  onShowQuote: () => void;
}

const arrivalPlans = [
  {
    title: '새벽 말레 도착',
    best: '당일 리조트 이동',
    note: '비싼 리조트 시간을 가장 길게 쓰는 일정입니다. 보트 이동 리조트나 수상비행기 첫 편 연결을 먼저 보세요.',
    chips: ['리조트 시간 확보', '보트 이동 유리', '첫날 만족도 높음'],
  },
  {
    title: '오후 말레 도착',
    best: '마지막 이동편 확인',
    note: '수상비행기 리조트는 당일 연결이 애매할 수 있습니다. 도착 시간과 리조트별 마감 시간을 같이 봐야 합니다.',
    chips: ['대기시간 체크', '수상비행기 주의', '늦은 체크인 가능'],
  },
  {
    title: '밤 말레 도착',
    best: '말레 1박 후 오전 이동',
    note: '무리해서 리조트로 들어가기보다 저렴한 말레 숙박 후 다음날 오전 이동이 만족도와 비용 모두 낫습니다.',
    chips: ['말레 1박', '다음날 오전 이동', '피로 절약'],
  },
] as const;

const routeRows = [
  [
    '싱가포르 경유',
    '스탑오버나 깔끔한 환승을 원하는 경우',
    '환승 대기시간과 귀국편 출발 시간을 확인',
  ],
  [
    '중동 경유',
    '밤 출발 선택지가 필요하거나 좌석 컨디션을 중시하는 경우',
    '총 이동시간과 새벽 도착 여부를 확인',
  ],
  ['동남아 경유', '가격을 낮추고 싶은 경우', '수하물 연결, 환승 터미널, 지연 리스크를 확인'],
] as const;

const FlightInfo: React.FC<FlightInfoProps> = ({ onShowResorts, onShowQuote }) => {
  return (
    <div className="animate-fade-in space-y-7 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Flight Plan</p>
          <h1 className="font-brand-heading mt-1 text-2xl text-slate-950">항공 일정</h1>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          ICN → MLE
        </span>
      </section>

      <section className="rounded-lg border border-teal-100 bg-teal-50/70 p-4 shadow-sm shadow-slate-900/5">
        <div className="flex items-start gap-3">
          <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-800" />
          <div>
            <h2 className="font-brand-heading text-lg text-slate-950">
              핵심은 말레 도착 시간입니다
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              리조트를 풀로 즐기려면 새벽 도착 후 당일 이동이 가장 좋고, 밤 도착이면 말레 1박 후
              오전 이동이 편합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {arrivalPlans.map(item => (
          <article
            key={item.title}
            className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">{item.title}</h2>
                <strong className="mt-1 block text-sm text-teal-700">{item.best}</strong>
              </div>
              <ClockIcon className="h-4 w-4 shrink-0 text-teal-700" />
            </div>
            <p className="text-sm leading-6 text-slate-600">{item.note}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {item.chips.map(chip => (
                <span
                  key={chip}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <DomesticFlightIcon className="h-4 w-4 text-teal-700" />
          <h2 className="font-brand-heading text-lg text-slate-950">경유 루트 고르는 법</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {routeRows.map(([route, fit, check]) => (
            <div
              key={route}
              className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[130px_1fr_1fr] sm:items-center sm:gap-4"
            >
              <strong className="text-slate-950">{route}</strong>
              <span className="text-slate-700">{fit}</span>
              <span className="text-slate-500">{check}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
          <div>
            <h2 className="font-brand-heading text-lg text-slate-950">예약 전 체크</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              항공권을 먼저 확정하기 전에 리조트 이동 가능 시간, 말레 1박 필요 여부, 귀국편
              대기시간을 같이 맞추면 실패 확률이 줄어듭니다.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-teal-100 bg-[linear-gradient(135deg,#ecfeff,#ffffff)] p-4 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-brand-heading text-lg text-slate-950">일정 감이 잡혔다면 바로 비교하세요</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              말레 도착 시간에 맞춰 리조트 후보를 좁히고, 같은 조건으로 견적을 확인하면 됩니다.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onShowResorts}
              className="cta-shimmer cta-main-boost inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-extrabold text-white shadow-sm"
            >
              리조트 목록 보기
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onShowQuote}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
            >
              견적 문의 보기
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlightInfo;
