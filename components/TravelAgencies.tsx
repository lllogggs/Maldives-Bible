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

const bookingReasons = [
  ['리조트', '공실을 줄이기 위해 일부 객실을 총판에 낮은 공급가로 넘깁니다.'],
  ['총판', '리조트에서 받은 객실을 여러 여행사에 공급하고 물량을 관리합니다.'],
  ['여행사', '공급가에 마진을 붙여도 공개가보다 낮게 팔 수 있습니다.'],
];

const bookingFlow = ['리조트', '총판', '여행사', '고객'];

const priceExample = [
  { label: '공식/OTA 공개가', price: '$10,000', note: '직접 예약 기준가' },
  { label: '총판 공급가', price: '$7,000', note: '공실률을 줄이기 위한 공급가' },
  { label: '여행사 판매가', price: '$8,000', note: '마진 포함 고객 견적' },
  { label: '고객 절감', price: '$2,000', note: '공개가 대비 예시' },
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
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Price Structure</p>
            <h2 className="mt-2 font-brand-heading text-xl text-slate-950">왜 여행사 견적이 더 싸질 수 있나</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              리조트는 빈 객실을 줄이려고 총판에 객실을 할인 공급하고, 여행사는 그 공급가에 마진을 붙여 고객에게 판매합니다.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold text-slate-700">
            {bookingFlow.map((step, index) => (
              <div key={step} className="relative rounded-lg border border-teal-100 bg-teal-50 px-2 py-2 text-teal-900">
                {step}
                {index < bookingFlow.length - 1 && (
                  <span className="absolute -right-1.5 top-1/2 z-10 -translate-y-1/2 text-teal-500">›</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm shadow-slate-900/5">
          <div className="grid gap-2 md:grid-cols-4">
            {priceExample.map(item => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-bold text-slate-500">{item.label}</p>
                <strong className="mt-1 block font-brand-heading text-2xl text-slate-950">{item.price}</strong>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            예를 들어 공개가가 <strong>$10,000</strong>인 객실을 총판이 <strong>$7,000</strong>에 확보하면, 여행사가
            <strong> $8,000</strong>에 팔아도 고객은 공개가 대비 <strong>$2,000</strong> 낮게 예약할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {bookingReasons.map(([title, description]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h3 className="text-sm font-bold text-slate-950">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
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
