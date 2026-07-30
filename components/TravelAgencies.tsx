import React, { useEffect, useRef } from 'react';
import { TRAVEL_AGENCIES } from '../data/travel-agencies';
import { trackAgencyImpression } from '../utils/analytics';
import { BuildingIcon, DollarIcon, LinkIcon, KakaoIcon, UserIcon } from './icons/Icons';

interface RouteStep {
  actor: string;
  caption?: string;
  Icon: React.FC<{ className?: string }>;
}

const publicRoute: RouteStep[] = [
  { actor: '리조트', Icon: BuildingIcon },
  { actor: '공식·OTA', Icon: DollarIcon },
  { actor: '고객', Icon: UserIcon },
];

const agencyRoute: RouteStep[] = [
  { actor: '리조트', caption: '공실 부담 감소', Icon: BuildingIcon },
  { actor: '리조트 총판', caption: '계약 물량 확보', Icon: BuildingIcon },
  { actor: '여행사', caption: '계약 공급가 반영', Icon: DollarIcon },
  { actor: '고객', caption: '조건별 견적 확인', Icon: UserIcon },
];

const FlowConnector: React.FC<{ label: string; emphasized?: boolean }> = ({ label, emphasized = false }) => (
  <div className="flex h-12 flex-col items-center justify-center gap-0.5 lg:h-auto lg:min-w-[90px] lg:flex-1">
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${emphasized ? 'bg-white text-teal-800 shadow-sm ring-1 ring-teal-200' : 'bg-slate-100 text-slate-500'}`}>
      {label}
    </span>
    <span className={`text-lg font-black leading-none ${emphasized ? 'text-teal-600' : 'text-slate-300'}`} aria-hidden="true">
      <span className="lg:hidden">↓</span>
      <span className="hidden lg:inline">→</span>
    </span>
  </div>
);

const PriceRoute: React.FC<{
  title: string;
  steps: RouteStep[];
  connectors: readonly string[];
  price: string;
  emphasized?: boolean;
  saving?: string;
}> = ({ title, steps, connectors, price, emphasized = false, saving }) => (
  <article className={`rounded-xl p-4 sm:p-5 ${emphasized ? 'bg-teal-50/80 shadow-sm shadow-teal-900/10 ring-2 ring-teal-200' : 'bg-white/75 ring-1 ring-slate-200'}`}>
    <div className="flex items-center justify-between gap-3">
      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${emphasized ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {title}
      </span>
      {saving ? (
        <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-extrabold text-white">
          {saving}
        </span>
      ) : null}
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex flex-col lg:flex-row lg:items-center">
        {steps.map((step, index) => {
          const Icon = step.Icon;
          return (
            <React.Fragment key={`${title}-${step.actor}`}>
              <div className={`flex min-h-[66px] items-center gap-3 rounded-lg px-3 py-2.5 lg:min-w-[104px] lg:flex-col lg:justify-center lg:bg-transparent lg:px-1 lg:text-center ${emphasized ? 'bg-white/80' : 'bg-slate-50/80'}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${emphasized ? 'bg-teal-800 text-white shadow-sm shadow-teal-900/20' : 'bg-slate-200 text-slate-500'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className={`block text-sm font-extrabold ${emphasized ? 'text-slate-950' : 'text-slate-600'}`}>{step.actor}</strong>
                  {step.caption ? <span className="mt-0.5 block text-[11px] font-bold text-slate-500">{step.caption}</span> : null}
                </span>
              </div>
              {index < steps.length - 1 ? <FlowConnector label={connectors[index]} emphasized={emphasized} /> : null}
            </React.Fragment>
          );
        })}
      </div>

      <div className={`rounded-lg px-4 py-3 text-center lg:min-w-[132px] ${emphasized ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15' : 'bg-slate-100 text-slate-500'}`}>
        <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em]">고객 견적</span>
        <strong className={`mt-1 block font-brand-heading ${emphasized ? 'text-3xl' : 'text-xl'}`}>{price}</strong>
      </div>
    </div>
  </article>
);

const TravelAgencies: React.FC = () => {
  const agencyGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = agencyGridRef.current;
    if (!grid || typeof IntersectionObserver === 'undefined') return;

    const timers = new Map<HTMLAnchorElement, number>();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const anchor = entry.target as HTMLAnchorElement;
          const existingTimer = timers.get(anchor);

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (existingTimer !== undefined) return;
            const timer = window.setTimeout(() => {
              timers.delete(anchor);
              trackAgencyImpression(anchor);
              observer.unobserve(anchor);
            }, 500);
            timers.set(anchor, timer);
            return;
          }

          if (existingTimer !== undefined) {
            window.clearTimeout(existingTimer);
            timers.delete(anchor);
          }
        });
      },
      { threshold: [0.5] },
    );

    grid
      .querySelectorAll<HTMLAnchorElement>('a[data-agency-id][data-agency-channel]')
      .forEach(anchor => observer.observe(anchor));

    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
      timers.clear();
      observer.disconnect();
    };
  }, []);

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">몰디브 여행사 견적 비교</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {TRAVEL_AGENCIES.length}곳
        </span>
      </section>

      <section className="border-b border-slate-200 pb-5">
        <div className="rounded-xl bg-[linear-gradient(135deg,#f8fafc,#ecfeff)] px-4 py-5 shadow-sm shadow-slate-900/5 ring-1 ring-teal-100 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-brand-heading text-lg text-slate-950 sm:text-xl">여행사 견적 경로가 다른 이유</h2>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800 ring-1 ring-teal-200">
                같은 객실 · 같은 일정
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                금액은 예시
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <PriceRoute
              title="비교 기준 · 공식/OTA"
              steps={publicRoute}
              connectors={['공개 판매가', '일반 예약']}
              price="$10,000"
            />
            <PriceRoute
              title="전문 여행사 경로"
              steps={agencyRoute}
              connectors={['사전 계약 물량', '도매 공급가', '맞춤 견적']}
              price="$8,000"
              saving="$2,000 낮음"
              emphasized
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            아래 금액과 절감 폭은 유통 경로를 설명하기 위한 예시이며, 실제 견적은 일정·객실·식사·이동 조건에 따라 달라집니다.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 className="font-brand-heading text-xl text-slate-950">여행사에 견적 요청</h2>
          <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800 ring-1 ring-teal-200">
            2~3곳 비교 추천
          </span>
        </div>

        <div aria-label="여행사 견적 요청 전 확인할 조건" className="flex flex-wrap gap-2">
          {['여행 날짜·숙박일수', '객실 타입·식사 플랜', '이동편·세금 포함 여부', '취소·변경 조건'].map(item => (
            <span
              key={item}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
            >
              {item}
            </span>
          ))}
        </div>

        <div ref={agencyGridRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TRAVEL_AGENCIES.map(agency => (
            <article key={agency.name} className="flex min-h-[96px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <h3 className="line-clamp-1 text-base font-bold text-slate-950" title={agency.name}>
              {agency.name}
            </h3>
            <div className="mt-auto flex gap-2 pt-3">
              {agency.website ? (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-agency-id={agency.id}
                  data-agency-name={agency.name}
                  data-agency-channel="website"
                  aria-label={`${agency.name} 홈페이지 새 창에서 열기`}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  홈페이지
                </a>
              ) : null}

              {agency.kakao_channel ? (
                <a
                  href={agency.kakao_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-agency-id={agency.id}
                  data-agency-name={agency.name}
                  data-agency-channel="kakao"
                  aria-label={`${agency.name} 카카오톡 채널 새 창에서 열기`}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FAE100] px-3 text-xs font-bold text-[#371D1E] transition-colors hover:bg-[#f5dc00]"
                >
                  <KakaoIcon className="h-3.5 w-3.5" />
                  카톡
                </a>
              ) : null}
            </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TravelAgencies;
