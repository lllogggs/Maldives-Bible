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

const TravelAgencies: React.FC = () => {
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
          <h2 className="font-brand-heading text-lg text-slate-950 sm:text-xl">여행사 견적이 더 낮을 수 있는 이유</h2>

          <div className="mt-4 max-w-[58ch] text-base leading-7 text-slate-700 sm:leading-8">
            <p>
              리조트는 객실을 안정적으로 판매하기 위해 일부 객실을 여행사나 현지 파트너에게 별도 계약가로 제공합니다.
              여행사는 이 객실에 식사, 공항 이동, 허니문 특전을 묶어 견적을 만들기 때문에 같은 일정과 객실이라도
              개별 예약보다 총액이 낮을 수 있습니다.
            </p>
          </div>

          <div className="mt-5 border-t border-teal-100 pt-4">
            <p className="text-sm font-semibold text-slate-500">설명용 예시</p>
            <p className="mt-1 font-brand-heading text-lg font-bold text-slate-950 sm:text-xl">
              공개 판매가 $10,000 → 여행사 견적 $8,000
            </p>
            <p className="mt-3 max-w-[58ch] text-sm leading-6 text-slate-600">
              여행사가 항상 더 저렴한 것은 아닙니다. 일정·객실·식사·이동·세금과 취소 조건을 같게 맞춰 비교하세요.
            </p>
          </div>
        </div>
      </section>

      <QuoteRequestTemplate />

      <section className="space-y-4">
        <div>
          <h2 className="font-brand-heading text-xl text-slate-950">같은 조건으로 2~3곳에 요청하세요</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            여행 날짜 · 숙박일수 · 객실 타입 · 식사 플랜 · 이동편 · 세금 · 취소 조건
          </p>
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
