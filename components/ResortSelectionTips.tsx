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
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  SearchIcon,
  ChevronRightIcon,
} from './icons/Icons';

interface ResortSelectionTipsProps {
  onShowResorts: () => void;
}

const heroImageUrl =
  'https://images.squarespace-cdn.com/content/v1/5b4f0c8d89c17294e53d4ffc/1533275638438-UBGTNUUSBGX41U5GN9W2/Ayada+Maldives+villas+SUNSET+OCEAN+SUITE+%281%29.jpg?format=2500w';

const decisionRows = [
  ['예산', '리조트비 + 이동비 + 항공권을 같이 봐야 실제 총액이 보입니다.', DollarIcon],
  ['일정', '새벽 도착은 당일 이동, 밤 도착은 말레 1박이 유리합니다.', CalendarIcon],
  ['이동', '보트, 수상비행기, 국내선에 따라 첫날 피로도가 달라집니다.', BoatIcon],
  ['객실', '워터빌라와 비치빌라 비율, 개인풀 여부를 먼저 고르세요.', BuildingIcon],
  ['식사', '조식, 풀보드, 올인클루시브 차이가 예산을 크게 바꿉니다.', RestaurantIcon],
] as const;

const moodCards = [
  {
    title: '사진이 중요한 커플',
    tag: '워터빌라 · 개인풀 · 선셋',
    body: '객실 사진, 선셋 방향, 프라이버시를 먼저 보면 후보가 빠르게 줄어듭니다.',
    Icon: HeartIcon,
  },
  {
    title: '일정 효율이 중요한 커플',
    tag: '새벽 도착 · 보트 이동',
    body: '짧은 일정일수록 말레 도착 시간과 리조트 이동 편수를 먼저 확인하세요.',
    Icon: ClockIcon,
  },
  {
    title: '바다가 중요한 커플',
    tag: '라군 · 수중환경',
    body: '맑은 라군은 사진이 좋고, 수중환경이 좋은 곳은 스노클링 만족도가 높습니다.',
    Icon: PoolIcon,
  },
] as const;

const guideCards = [
  {
    title: '몰디브 신혼여행 처음 준비',
    body: '처음에는 유명 리조트 이름보다 예산, 일정, 이동수단, 객실 타입, 식사 플랜을 먼저 잡는 편이 빠릅니다.',
  },
  {
    title: '몰디브 신혼여행 비용 감 잡기',
    body: '4박 6일 기준 리조트 숙박비에 항공권, 말레공항 이후 이동비, 식사 플랜 차이를 더해야 실제 총액에 가까워집니다.',
  },
  {
    title: '몰디브 리조트 선택 기준',
    body: '워터빌라와 비치빌라 차이, 개인풀 여부, 라군과 수중환경, 리조트 이동 시간을 같이 보면 선택지가 정리됩니다.',
  },
] as const;

const transferRows = [
  ['보트', '말레공항 근처', '짧은 일정에 유리', BoatIcon],
  ['수상비행기', '몰디브다운 풍경', '낮 도착 일정 확인', SeaplaneIcon],
  ['국내선', '먼 환초 리조트', '여유 일정에 적합', DomesticFlightIcon],
] as const;

const quickTerms = [
  ['HB', '조식 + 석식'],
  ['FB', '조식 + 중식 + 석식'],
  ['올인클루시브', '식사 + 음료 포함'],
  ['라군', '맑고 얕은 바다'],
  ['하우스리프', '리조트 주변 산호와 스노클링 포인트'],
  ['트랜스퍼', '공항에서 리조트까지 이동'],
] as const;

const ResortSelectionTips: React.FC<ResortSelectionTipsProps> = ({ onShowResorts }) => {
  return (
    <div className="animate-fade-in pb-12">
      <section className="mb-3 rounded-lg border border-teal-100 bg-white p-3 shadow-sm shadow-slate-900/5 sm:hidden">
        <button
          type="button"
          onClick={onShowResorts}
          className="cta-shimmer flex min-h-11 w-full items-center justify-between rounded-lg bg-slate-950 px-4 py-3 text-left text-sm font-extrabold text-white"
        >
          리조트 목록 먼저 보기
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </section>

      <section className="relative mb-6 min-h-[360px] overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm shadow-slate-900/10 sm:min-h-[390px]">
        <img
          src={heroImageUrl}
          alt="몰디브 워터빌라와 바다"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.84),rgba(15,23,42,0.48),rgba(15,23,42,0.12))]" />
        <div className="relative flex min-h-[360px] max-w-3xl flex-col justify-end px-5 py-6 sm:min-h-[390px] sm:px-8 sm:py-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-teal-100">
            Maldives Honeymoon Guide
          </p>
          <h1 className="font-brand-heading max-w-2xl text-3xl leading-tight sm:text-5xl">
            몰디브 신혼여행
            <span className="block">리조트 고르기</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-100 sm:text-base">
            처음이면 예산, 일정, 객실만 먼저 잡고 리조트 목록에서 바로 비교하세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onShowResorts}
              className="cta-shimmer inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              리조트 목록 바로 보기
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section id="tips-guide" className="space-y-9">
        <section>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-teal-700" />
              <h2 className="font-brand-heading text-xl text-slate-950">처음 볼 기준</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {decisionRows.map(([title, detail, Icon]) => (
                <div
                  key={title}
                  className="grid gap-2 py-3 text-sm sm:grid-cols-[96px_1fr] sm:items-center"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-950">
                    <Icon className="h-4 w-4 text-teal-700" />
                    {title}
                  </div>
                  <p className="text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {moodCards.map(({ title, tag, body, Icon }) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-brand-heading text-lg text-slate-950">{title}</h3>
              <p className="mt-1 text-xs font-bold text-rose-600">{tag}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>

        <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-4 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-brand-heading text-lg text-slate-950">
                기준이 잡혔다면 바로 비교하세요
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                필터에서 이동수단, 객실, 허니문 혜택만 골라도 후보가 많이 줄어듭니다.
              </p>
            </div>
            <button
              type="button"
              onClick={onShowResorts}
              className="cta-shimmer inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800"
            >
              리조트 비교 시작
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <section className="grid gap-3 lg:grid-cols-3">
          {guideCards.map(({ title, body }) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5"
            >
              <div className="mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-teal-700" />
                <h2 className="font-brand-heading text-lg text-slate-950">{title}</h2>
              </div>
              <p className="text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </section>

        <section>
          <h2 className="font-brand-heading mb-3 text-lg text-slate-950">이동수단 감 잡기</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
            {transferRows.map(([title, fit, caution, Icon]) => (
              <div
                key={title}
                className="grid gap-1 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[130px_150px_1fr] sm:items-center sm:gap-4"
              >
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
              <div
                key={term}
                className="grid grid-cols-[104px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm shadow-slate-900/5"
              >
                <strong className="text-slate-950">{term}</strong>
                <span className="text-slate-600">{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};

export default ResortSelectionTips;
