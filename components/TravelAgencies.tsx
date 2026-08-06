import React from 'react';
import { LinkIcon, KakaoIcon } from './icons/Icons';
import QuoteRequestTemplate from './QuoteRequestTemplate';
import { trackEvent } from '../utils/analytics';

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

const GUIDE_KAKAO_URL = 'https://open.kakao.com/o/sEsPbzHi';

const shuffleAgencies = (items: Agency[]): Agency[] => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const TravelAgencies: React.FC = () => {
  const randomizedAgencies = React.useMemo(() => shuffleAgencies(agencies), []);

  React.useEffect(() => {
    trackEvent('agency_list_view', { agency_count: agencies.length });
  }, []);

  const handleAgencyClick = (agency: Agency, channel: 'website' | 'kakao') => {
    trackEvent('agency_outbound_click', {
      agency_name: agency.name,
      outbound_channel: channel,
      link_url: channel === 'kakao' ? agency.kakao_channel : agency.website,
    });
  };

  const handleGuideChatClick = () => {
    trackEvent('guide_kakao_click', {
      cta_placement: 'quote_comparison_top',
      link_url: GUIDE_KAKAO_URL,
    });
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <section className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="font-brand-heading text-2xl text-slate-950">몰디브 여행사 견적 비교</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {agencies.length}곳
        </span>
      </section>

      <section className="rounded-xl bg-[linear-gradient(135deg,#f8fafc,#ecfeff)] p-4 shadow-sm shadow-slate-900/5 ring-1 ring-teal-100 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="max-w-2xl">
          <h2 className="font-brand-heading text-lg text-slate-950">궁금한 게 많다면 먼저 물어보세요</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            저는 여행사가 아니라 견적 요청이나 궁금한 점을 받아 함께 정리해 드리는 몰디브바이블 운영자입니다.
            따로 영업하거나 예약을 권유하지 않으니 부담 없이 카카오톡으로 들어오세요.
          </p>
        </div>

        <a
          href={GUIDE_KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleGuideChatClick}
          className="mt-4 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FAE100] px-4 py-2.5 text-sm font-bold text-[#371D1E] transition-colors hover:bg-[#f5dc00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/30 sm:mt-0 sm:w-auto"
          aria-label="몰디브바이블 운영자 오픈 카카오톡 새 창에서 열기"
        >
          <KakaoIcon className="h-4 w-4" />
          카카오톡으로 편하게 질문하기
        </a>
      </section>

      <QuoteRequestTemplate />

      <section className="space-y-4">
        <div>
          <h2 className="font-brand-heading text-xl text-slate-950">같은 조건으로 2~3곳에 요청하세요</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            아래 여행사는 페이지를 열 때마다 무작위 순서로 표시되며, 노출 순서는 추천이나 순위와 관계없습니다.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            비교 조건: 여행 날짜 · 숙박일수 · 객실 타입 · 식사 플랜 · 이동편 · 세금 · 취소 조건
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {randomizedAgencies.map(agency => (
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
                  onClick={() => handleAgencyClick(agency, 'website')}
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
                  onClick={() => handleAgencyClick(agency, 'kakao')}
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
