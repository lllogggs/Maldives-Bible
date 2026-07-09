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

const heroStats = [
  ['처음 기준', '예산, 일정, 이동'],
  ['객실 선택', '워터빌라 vs 비치빌라'],
  ['바다 취향', '라군 vs 수중환경'],
] as const;

const decisionRows = [
  ['예산', '리조트비 + 이동비 + 항공권', DollarIcon],
  ['일정', '4박 6일, 5박 7일, 말레 도착 시간', CalendarIcon],
  ['이동', '보트, 수상비행기, 국내선', BoatIcon],
  ['객실', '워터빌라, 비치빌라, 개인풀', BuildingIcon],
  ['식사', '조식, 풀보드, 올인클루시브', RestaurantIcon],
] as const;

const moodCards = [
  {
    title: '사진 감성',
    tag: '워터빌라 · 개인풀',
    body: '객실 사진과 프라이버시가 중요하면 워터빌라, 선셋 방향, 개인풀 여부를 먼저 보세요.',
    Icon: HeartIcon,
  },
  {
    title: '일정 효율',
    tag: '새벽 도착 · 보트 이동',
    body: '짧은 신혼여행은 첫날 이동이 핵심입니다. 말레 도착 시간과 리조트 이동 첫 편을 같이 확인하세요.',
    Icon: ClockIcon,
  },
  {
    title: '바다 취향',
    tag: '라군 · 하우스리프',
    body: '밝은 라군은 사진이 예쁘고, 하우스리프가 좋은 리조트는 스노클링 만족도가 높습니다.',
    Icon: PoolIcon,
  },
] as const;

const guideCards = [
  {
    title: '몰디브 신혼여행 처음 준비',
    body: '처음에는 유명 리조트 이름보다 예산, 일정, 이동수단, 객실타입, 식사플랜을 먼저 정하는 편이 빠릅니다.',
  },
  {
    title: '몰디브 신혼여행 비용 감잡기',
    body: '4박 2인 리조트 숙박비에 항공권, 말레공항 이후 이동비, 식사플랜 차이를 더해서 봐야 실제 총액에 가까워집니다.',
  },
  {
    title: '몰디브 리조트 선택 기준',
    body: '워터빌라와 비치빌라 차이, 개인풀 여부, 라군과 수중환경, 리조트 이동 시간을 나눠 보면 후보가 빠르게 줄어듭니다.',
  },
] as const;

const transferRows = [
  ['보트', '말레공항 근처', '짧은 일정에 편함', BoatIcon],
  ['수상비행기', '몰디브다운 풍경', '낮 도착이 유리', SeaplaneIcon],
  ['국내선', '먼 아톨 리조트', '여유 일정에 적합', DomesticFlightIcon],
] as const;

const quickTerms = [
  ['HB', '조식 + 석식'],
  ['FB', '조식 + 중식 + 석식'],
  ['올인클루시브', '식사 + 음료 포함'],
  ['라군', '얕고 밝은 바다'],
  ['하우스리프', '리조트 주변 산호/스노클링'],
  ['트랜스퍼', '공항-리조트 이동'],
] as const;

const ResortSelectionTips: React.FC<ResortSelectionTipsProps> = ({ onShowResorts }) => {
  return (
    <div className="animate-fade-in pb-12">
      <section className="relative mb-7 min-h-[430px] overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm shadow-slate-900/10">
        <img
          src={heroImageUrl}
          alt="몰디브 워터빌라와 바다"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.82),rgba(15,23,42,0.48),rgba(15,23,42,0.12))]" />
        <div className="relative flex min-h-[430px] max-w-3xl flex-col justify-end px-5 py-7 sm:px-8 sm:py-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-teal-100">Maldives Honeymoon Guide</p>
          <h1 className="font-brand-heading max-w-2xl text-3xl leading-tight sm:text-5xl">
            몰디브 신혼여행,
            <span className="block">리조트 이름보다</span>
            <span className="block">기준부터</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-100 sm:text-base">
            처음 알아보는 단계라면 예산, 일정, 이동수단, 객실타입만 잡아도 후보가 훨씬 선명해집니다.
            먼저 기준을 보고, 바로 리조트 목록에서 비교해보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onShowResorts}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              리조트 목록 바로 보기
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <a
              href="#tips-guide"
              className="inline-flex min-h-11 items-center rounded-lg border border-white/40 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              팁 더 보기
            </a>
          </div>
          <div className="mt-6 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
            {heroStats.map(([title, detail]) => (
              <div key={title} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                <p className="text-xs font-bold text-teal-100">{title}</p>
                <p className="mt-1 text-sm font-semibold text-white">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tips-guide" className="space-y-7">
        <section className="grid gap-3 lg:grid-cols-[1.05fr_1.4fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="mb-4 flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-teal-700" />
              <h2 className="font-brand-heading text-xl text-slate-950">처음 볼 기준</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {decisionRows.map(([title, detail, Icon]) => (
                <div key={title} className="grid gap-2 py-3 text-sm sm:grid-cols-[96px_1fr] sm:items-center">
                  <div className="flex items-center gap-2 font-bold text-slate-950">
                    <Icon className="h-4 w-4 text-teal-700" />
                    {title}
                  </div>
                  <p className="text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {moodCards.map(({ title, tag, body, Icon }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-brand-heading text-lg text-slate-950">{title}</h3>
                <p className="mt-1 text-xs font-bold text-rose-600">{tag}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {guideCards.map(({ title, body }) => (
            <article key={title} className="rounded-lg border border-teal-100 bg-teal-50/40 p-4 shadow-sm shadow-slate-900/5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-teal-700" />
                <h2 className="font-brand-heading text-lg text-slate-950">{title}</h2>
              </div>
              <p className="text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </section>

        <section>
          <h2 className="font-brand-heading mb-3 text-lg text-slate-950">이동수단 감잡기</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
            {transferRows.map(([title, fit, caution, Icon]) => (
              <div key={title} className="grid gap-1 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[130px_150px_1fr] sm:items-center sm:gap-4">
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
              <div key={term} className="grid grid-cols-[104px_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm shadow-slate-900/5">
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
