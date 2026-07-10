import React from 'react';
import { LinkIcon, KakaoIcon } from './icons/Icons';

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

const supplySteps = [
  { from: '리조트', to: '총판', price: '$6,000', caption: '총판에 공급' },
  { from: '총판', to: '여행사', price: '$7,000', caption: '여행사에 공급' },
  { from: '여행사', to: '고객', price: '$8,000', caption: '고객에게 공급' },
] as const;

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">견적 문의</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {agencies.length}곳
        </span>
      </section>

      <section className="space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Price Route</p>
            <h2 className="mt-2 font-brand-heading text-xl text-slate-950">왜 여행사 견적이 더 싸질 수 있나</h2>
          </div>
          <strong className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-950">
            아래 금액은 이해를 돕기 위한 예시입니다
          </strong>
        </div>

        <div className="grid gap-3 rounded-lg border border-teal-100 bg-white p-3 shadow-sm shadow-slate-900/5 sm:p-4 lg:grid-cols-[170px_1fr_170px] lg:items-stretch">
          <div className="order-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:py-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">공식가격 / OTA</p>
            <strong className="mt-1 block font-brand-heading text-2xl text-slate-950 sm:text-3xl">$10,000</strong>
          </div>

          <div className="order-3 grid gap-2 md:grid-cols-3 lg:order-2">
            {supplySteps.map((step, index) => (
              <div key={`${step.from}-${step.to}`} className="relative rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-teal-950 sm:py-4">
                <p className="text-xs font-bold text-teal-700">{step.from} → {step.to}</p>
                <strong className="mt-1 block font-brand-heading text-xl sm:text-2xl">{step.price}</strong>
                <p className="mt-1 text-xs font-bold">{step.caption}</p>
                {index < supplySteps.length - 1 && (
                  <span className="absolute -right-2 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg font-black text-teal-700 ring-1 ring-teal-100 md:flex">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="order-2 rounded-lg bg-slate-950 px-4 py-3 text-white sm:py-4 lg:order-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-200">고객 절감</p>
            <strong className="mt-1 block font-brand-heading text-2xl sm:text-3xl">$2,000</strong>
            <p className="mt-1 text-xs font-semibold text-slate-300">공식/OTA보다 낮은 예시</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
          리조트 → 총판 $6,000에 공급 → 여행사 $7,000에 공급 → 고객 $8,000에 공급
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </section>
    </div>
  );
};

export default TravelAgencies;
