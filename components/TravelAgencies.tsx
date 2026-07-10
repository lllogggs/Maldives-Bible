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
  { actor: '리조트', caption: '객실 물량', Icon: BuildingIcon },
  { actor: '총판', caption: '물량 확보', Icon: BuildingIcon },
  { actor: '여행사', caption: '견적 산출', Icon: DollarIcon },
  { actor: '고객', caption: '예약', Icon: UserIcon },
] as const;

const supplyPrices = ['$6,000 총판 공급', '$7,000 여행사 공급', '$8,000 고객 견적'] as const;

const FlowConnector: React.FC<{ label?: string; muted?: boolean }> = ({ label, muted = false }) => (
  <div className="relative flex h-10 items-center justify-center md:h-16 md:flex-1">
    <span className={`h-full w-px md:h-px md:w-full ${muted ? 'bg-slate-300' : 'bg-teal-200'}`} />
    {label && (
      <span className={`absolute rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold shadow-sm ring-1 ${muted ? 'text-slate-700 ring-slate-200' : 'text-teal-800 ring-teal-100'}`}>
        {label}
      </span>
    )}
  </div>
);

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
          <strong className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-950 ring-1 ring-amber-200">
            아래 금액은 이해를 돕기 위한 예시입니다
          </strong>
        </div>

        <p className="max-w-4xl text-sm leading-6 text-slate-700">
          리조트는 객실이 남으면 그날 객실 매출이 발생하지 않기 때문에, 일부 물량을 총판에 낮은 공급가로 넘겨 공실 위험을 줄이고 판매량을 먼저 확보합니다.
          총판은 그 물량을 여러 여행사에 배분하고, 여행사는 마진을 붙여도 공식가격보다 낮은 견적을 만들 수 있습니다.
        </p>

        <div className="rounded-lg bg-[linear-gradient(135deg,#f8fafc,#ecfeff)] px-4 py-5 shadow-sm shadow-slate-900/5 ring-1 ring-teal-100 sm:px-6">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-center">
            <div className="space-y-7">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">공식/OTA 경로</p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-3 md:min-w-[150px] md:flex-col md:text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                      <DollarIcon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-slate-500">공식가격 / OTA</span>
                      <strong className="font-brand-heading text-2xl text-slate-950">$10,000</strong>
                    </span>
                  </div>
                  <FlowConnector label="$10,000 예약" muted />
                  <div className="flex items-center gap-3 md:min-w-[120px] md:flex-col md:text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                      <UserIcon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-slate-500">고객</span>
                      <strong className="font-brand-heading text-2xl text-slate-950">$10,000</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-teal-700">총판·여행사 공급 경로</p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                  {supplyNodes.map((step, index) => {
                    const Icon = step.Icon;
                    return (
                      <React.Fragment key={step.actor}>
                        <div className="flex items-center gap-3 md:min-w-[118px] md:flex-col md:text-center">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-sm shadow-teal-900/20">
                            <Icon className="h-6 w-6" />
                          </span>
                          <span>
                            <span className="block text-sm font-extrabold text-teal-900">{step.actor}</span>
                            <span className="block text-xs font-bold text-slate-500">{step.caption}</span>
                          </span>
                        </div>
                        {index < supplyNodes.length - 1 && <FlowConnector label={supplyPrices[index]} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-slate-950 text-center text-white shadow-lg shadow-slate-900/20">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal-200">고객 절감</span>
                <strong className="mt-1 font-brand-heading text-3xl">$2,000</strong>
                <span className="mt-1 px-4 text-xs font-bold leading-4 text-slate-300">공식/OTA 대비 예시</span>
              </div>
            </div>
          </div>
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
