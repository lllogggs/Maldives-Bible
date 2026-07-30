import React from 'react';
import { LinkIcon, KakaoIcon } from './icons/Icons';

interface Agency {
  name: string;
  website: string | null;
  kakao_channel: string | null;
}

const agencies: Agency[] = [
  { name: '투어민', website: 'https://www.tourmin.co.kr', kakao_channel: 'https://pf.kakao.com/_LxbYBM' },
  { name: '푸른여행클럽', website: 'https://cafe.naver.com/honeymoonp', kakao_channel: 'https://pf.kakao.com/_UZNxgd' },
  { name: '리얼몰디브', website: 'https://realmaldives.co.kr', kakao_channel: 'https://pf.kakao.com/_NcnxaG' },
  { name: '트레비아', website: 'https://www.trevia.co.kr', kakao_channel: 'https://pf.kakao.com/_xixjNQl' },
  { name: '나래여행사', website: 'http://www.nadree.net/', kakao_channel: null },
  { name: '하이몰디브', website: 'https://www.himaldives.co.kr/', kakao_channel: null },
  { name: '여행산책', website: 'https://www.tourw.co.kr/', kakao_channel: null },
  { name: '잇츠마이트래블', website: 'http://itsmytravel.co.kr/', kakao_channel: 'https://pf.kakao.com/_qgDUxd' },
  { name: '투어플래닛', website: 'http://www.tour-planet.co.kr/', kakao_channel: 'https://pf.kakao.com/_LYSSl' },
  { name: '허니문리조트', website: 'http://www.honeymoonresort.co.kr/', kakao_channel: 'https://pf.kakao.com/_gkKlE' },
  { name: '천생연분닷컴', website: 'https://www.1000syb.com/', kakao_channel: null },
  { name: '팜투어', website: 'https://www.palmtour.co.kr', kakao_channel: 'https://pf.kakao.com/_Hxmxaxexj' },
];

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">몰디브 여행사 견적 비교</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {agencies.length}곳
        </span>
      </section>

      <section className="border-b border-slate-200 pb-5">
        <div className="rounded-xl bg-[linear-gradient(135deg,#f8fafc,#ecfeff)] px-4 py-5 shadow-sm shadow-slate-900/5 ring-1 ring-teal-100 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-brand-heading text-lg text-slate-950 sm:text-xl">여행사 견적이 더 낮을 수 있는 이유</h2>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800 ring-1 ring-teal-200">
                같은 객실 · 같은 일정
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                금액은 예시
              </span>
            </div>
          </div>

          <div className="mt-5 max-w-4xl space-y-4 text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
            <p>
              몰디브 리조트는 빈 객실을 줄이기 위해 일부 물량을 여행사나 현지 총판에 미리 배정합니다.
              여행사는 공식 홈페이지·OTA의 공개 판매가와 다른 <strong className="font-extrabold text-slate-950">계약 공급가</strong>를 받을 수 있습니다.
            </p>
            <p>
              이 공급가에 숙박·식사·공항 이동·허니문 특전을 묶어 견적을 만들기 때문에,
              같은 리조트와 객실이라도 개별 예약보다 총액이 낮거나 혜택이 많을 수 있습니다.
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-teal-200 bg-white/80 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-5">
            <p className="text-sm font-bold text-slate-700">
              설명용 예시
              <strong className="mt-1 block font-brand-heading text-xl text-slate-950 sm:inline sm:ml-3 sm:mt-0">
                공개 판매가 $10,000 → 여행사 견적 $8,000
              </strong>
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500 sm:mt-0 sm:max-w-md sm:text-right">
              여행사가 항상 더 저렴한 것은 아닙니다. 일정·객실·식사·이동·세금과 취소 조건을 같게 맞춰 비교하세요.
            </p>
          </div>
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agencies.map(agency => (
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
