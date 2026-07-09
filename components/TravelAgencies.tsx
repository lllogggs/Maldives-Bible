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
  ['총판 공급가', '총판이 리조트 객실 물량과 시즌 프로모션을 받아 여행사 공급가로 내려줍니다.'],
  ['포함 조건 비교', '직접 예약·OTA는 식사, 트랜스퍼, 세금, 허니문 특전 포함 여부가 다를 수 있습니다.'],
  ['일정 연결', '말레 도착 시간과 수상비행기·보트 연결까지 맞춰야 실제로 좋은 견적입니다.'],
];

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">한국 여행사</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {agencies.length}곳
        </span>
      </section>

      <section className="border-b border-slate-200 pb-5">
        <h2 className="mb-3 text-base font-bold text-slate-950">왜 여행사 견적인가</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
          <span className="rounded-full bg-slate-950 px-3 py-1.5 text-white">리조트</span>
          <span className="text-slate-300">→</span>
          <span className="rounded-full bg-teal-700 px-3 py-1.5 text-white">총판</span>
          <span className="text-slate-300">→</span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">여행사</span>
          <span className="text-slate-300">→</span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">고객</span>
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
            <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
              {agency.website ? (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  홈
                </a>
              ) : (
                <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-300">
                  <LinkIcon className="h-3.5 w-3.5" />
                  홈
                </span>
              )}

              {agency.kakao_channel ? (
                <a
                  href={agency.kakao_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FAE100] px-3 text-xs font-bold text-[#371D1E] transition-colors hover:bg-[#f5dc00]"
                >
                  <KakaoIcon className="h-3.5 w-3.5" />
                  카톡
                </a>
              ) : (
                <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-300">
                  <KakaoIcon className="h-3.5 w-3.5" />
                  카톡
                </span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default TravelAgencies;
