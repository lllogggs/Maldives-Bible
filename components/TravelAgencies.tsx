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
  ['총판 특가', '리조트 프로모션 객실을 먼저 확보'],
  ['일정 조합', '말레 도착 시간에 맞춘 이동과 1박 판단'],
  ['허니문 조건', '객실, 식사, 특전을 한 번에 비교'],
];

const bookingFlow = ['리조트', '총판', '여행사', '고객'];

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">견적 문의</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {agencies.length}곳
        </span>
      </section>

      <section className="border-b border-slate-200 pb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-bold text-teal-700">예약 구조</p>
            <h2 className="mt-2 font-brand-heading text-xl text-slate-950">여행사 견적을 먼저 보는 이유</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              몰디브는 총판이 리조트 프로모션을 확보하고, 여행사가 이동·식사·허니문 혜택을 고객 일정에 맞춰 조합하는 구조가 많습니다.
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

        <div className="mt-4 grid gap-2 md:grid-cols-3">
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
