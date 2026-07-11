import React from 'react';
import { BuildingIcon, DollarIcon, LinkIcon, KakaoIcon, UserIcon } from './icons/Icons';

interface Agency {
  name: string;
  website: string | null;
  kakao_channel: string | null;
}

const agencies: Agency[] = [
  { name: '투어민', website: 'https://www.tourmin.co.kr', kakao_channel: 'http://pf.kakao.com/_LxbYBM' },
  { name: '푸른여행클럽', website: 'https://cafe.naver.com/honeymoonp', kakao_channel: 'http://pf.kakao.com/_UZNxgd' },
  { name: '리얼몰디브', website: 'http://realmaldives.co.kr', kakao_channel: 'http://pf.kakao.com/_NcnxaG' },
  { name: '트레비아', website: 'https://www.trevia.co.kr', kakao_channel: 'http://pf.kakao.com/_xixjNQl' },
  { name: '나래여행사', website: 'http://www.nadree.net/', kakao_channel: null },
  { name: '하이몰디브', website: 'http://www.himaldives.co.kr/', kakao_channel: null },
  { name: '여행산책', website: 'https://www.tourw.co.kr/', kakao_channel: 'http://pf.kakao.com/_Dlrtb' },
  { name: '잇츠마이트래블', website: 'http://itsmytravel.co.kr/', kakao_channel: 'http://pf.kakao.com/_qgDUxd' },
  { name: '투어플래닛', website: 'http://www.tour-planet.co.kr/', kakao_channel: 'http://pf.kakao.com/_LYSSl' },
  { name: '허니문리조트', website: 'http://www.honeymoonresort.co.kr/', kakao_channel: 'http://pf.kakao.com/_gkKlE' },
  { name: '천생연분닷컴', website: 'http://www.1000syb.com/', kakao_channel: null },
  { name: '팜투어', website: 'https://www.palmtour.co.kr', kakao_channel: 'http://pf.kakao.com/_Hxmxaxexj' },
];

const supplyNodes = [
  { actor: '리조트', caption: '객실 공급', Icon: BuildingIcon },
  { actor: '총판', caption: '대량 물량 확보', Icon: BuildingIcon },
  { actor: '여행사', caption: '조건별 견적 구성', Icon: DollarIcon },
  { actor: '고객', caption: '비교 후 예약', Icon: UserIcon },
] as const;

const supplyPrices = ['$6,000 총판 공급가', '$7,000 여행사 원가', '$8,000 고객 견적'] as const;

const FlowConnector: React.FC<{ label: string }> = ({ label }) => (
  <div className="relative flex h-10 items-center justify-center md:h-16 md:flex-1">
    <span className="h-full w-px bg-teal-200 md:h-px md:w-full" />
    <span className="absolute rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-teal-800 shadow-sm ring-1 ring-teal-100">
      {label}
    </span>
  </div>
);

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">여행사 견적 비교</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {agencies.length}곳
        </span>
      </section>

      <section className="space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Agency Price Route</p>
            <h2 className="mt-2 font-brand-heading text-xl text-slate-950">여행사 견적은 어디서 시작되는가</h2>
          </div>
          <strong className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-950 ring-1 ring-amber-200">
            표시 금액은 경로 이해용 예시입니다
          </strong>
        </div>

        <p className="max-w-4xl text-sm leading-6 text-slate-700">
          리조트가 일부 객실 물량을 총판에 공급하면, 총판은 그 물량을 여러 여행사에 배분합니다. 여행사는 공식/OTA 판매가가 아니라 총판 공급가에서 시작해
          고객의 일정과 객실 조건에 맞는 견적을 구성하므로, 마진을 더해도 공개가보다 낮아질 수 있습니다.
        </p>

        <div className="rounded-xl bg-[linear-gradient(135deg,#f8fafc,#ecfeff)] px-4 py-5 shadow-sm shadow-slate-900/5 ring-1 ring-teal-100 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-teal-700">여행사 견적이 만들어지는 경로</p>
              <h3 className="mt-2 text-lg font-extrabold text-slate-950">총판 공급가에서 시작해 고객 조건에 맞는 견적으로 완성됩니다</h3>
            </div>
            <span className="w-fit rounded-full bg-teal-700 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm shadow-teal-900/15">
              핵심 경로
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            {supplyNodes.map((step, index) => {
              const Icon = step.Icon;
              const isAgency = step.actor === '여행사';
              return (
                <React.Fragment key={step.actor}>
                  <div className={`flex items-center gap-3 rounded-lg px-3 py-2 md:min-w-[128px] md:flex-col md:bg-transparent md:px-0 md:py-0 md:text-center ${isAgency ? 'bg-white ring-2 ring-teal-200 md:ring-0' : ''}`}>
                    <span className={`flex items-center justify-center rounded-full text-white shadow-sm ${isAgency ? 'h-16 w-16 bg-slate-950 ring-4 ring-teal-100 shadow-slate-900/25' : 'h-14 w-14 bg-teal-700 shadow-teal-900/20'}`}>
                      <Icon className={isAgency ? 'h-7 w-7' : 'h-6 w-6'} />
                    </span>
                    <span>
                      <span className={`block font-extrabold ${isAgency ? 'text-base text-slate-950' : 'text-sm text-teal-900'}`}>{step.actor}</span>
                      <span className="block text-xs font-bold text-slate-500">{step.caption}</span>
                      {isAgency && (
                        <span className="mt-1 inline-flex rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-900">
                          견적 핵심
                        </span>
                      )}
                    </span>
                  </div>
                  {index < supplyNodes.length - 1 && <FlowConnector label={supplyPrices[index]} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex items-center gap-3 rounded-lg bg-teal-950 px-4 py-4 text-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-teal-100">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <div>
                <strong className="block text-sm font-extrabold">핵심은 여행사가 총판 공급가로 고객 견적을 만든다는 점입니다</strong>
                <p className="mt-1 text-xs font-semibold leading-5 text-teal-100">여행사 마진을 더해도 공식/OTA 공개가보다 낮아질 수 있습니다.</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white/90 px-4 py-3 text-slate-700">
              <span>
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">비교 기준 · 예시</span>
                <span className="mt-1 block text-xs font-bold">공식/OTA 공개가</span>
              </span>
              <strong className="font-brand-heading text-lg text-slate-700">$10,000</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">여행사별 견적 문의</p>
            <h2 className="mt-1 font-brand-heading text-xl text-slate-950">같은 조건으로 여러 여행사에 문의해 비교하세요</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">여행사마다 확보한 객실 물량과 프로모션이 달라 같은 리조트도 견적이 달라질 수 있습니다.</p>
          </div>
          <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800 ring-1 ring-teal-200">
            2~3곳 비교 추천
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agencies.map(agency => (
            <article key={agency.name} className="flex min-h-[96px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <h2 className="line-clamp-1 text-base font-bold text-slate-950" title={agency.name}>
              {agency.name}
            </h2>
            <div className="mt-auto flex gap-2 pt-3">
              {agency.website ? (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FAE100] px-3 text-xs font-bold text-[#371D1E] transition-colors hover:bg-[#f5dc00]"
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
