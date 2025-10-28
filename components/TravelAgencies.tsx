import React from 'react';
import { LinkIcon, KakaoIcon, BuildingIcon, UserIcon, ChevronRightIcon } from './icons/Icons';

interface Agency {
  name: string;
  website: string | null;
  kakao_channel: string | null;
}

const agencies: Agency[] = [
  { "name": "투어민 (민씨아저씨)", "website": "https://www.tourmin.co.kr", "kakao_channel": "http://pf.kakao.com/_LxbYBM" },
  { "name": "푸른여행클럽", "website": "https://cafe.naver.com/honeymoonp", "kakao_channel": "http://pf.kakao.com/_UZNxgd" },
  { "name": "리얼몰디브", "website": "http://realmaldives.co.kr", "kakao_channel": "http://pf.kakao.com/_NcnxaG" },
  { "name": "트레비아", "website": "https://www.trevia.co.kr", "kakao_channel": "http://pf.kakao.com/_xixjNQl" },
  { "name": "나래여행사", "website": "http://www.nadree.net/", "kakao_channel": null },
  { "name": "하이몰디브", "website": "http://www.himaldives.co.kr/", "kakao_channel": null },
  { "name": "여행산책", "website": "https://www.tourw.co.kr/", "kakao_channel": "http://pf.kakao.com/_Dlrtb" },
  { "name": "잇츠마이트래블 (구, 몰디브클럽)", "website": "http://itsmytravel.co.kr/", "kakao_channel": "http://pf.kakao.com/_qgDUxd" },
  { "name": "투어플래닛", "website": "http://www.tour-planet.co.kr/", "kakao_channel": "http://pf.kakao.com/_LYSSl" },
  { "name": "허니문리조트", "website": "http://www.honeymoonresort.co.kr/", "kakao_channel": "http://pf.kakao.com/_gkKlE" },
  { "name": "천생연분닷컴", "website": "http://www.1000syb.com/", "kakao_channel": null },
  { "name": "팜투어", "website": "https://www.palmtour.co.kr", "kakao_channel": "http://pf.kakao.com/_Hxmxaxexj" }
];

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-12 p-6 bg-cyan-50/50 border border-cyan-200 rounded-lg lg:w-11/12 mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            ✈️ <strong>직접예약</strong>이 <strong>여행사예약</strong>보다 더 비싼이유가 뭘까요?
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 pb-4 mb-6 text-center border-b-2 border-cyan-100 underline decoration-cyan-400 decoration-4 underline-offset-8">직접 예약</h3>
                <div className="flex-grow flex flex-col">
                    <div className="flex items-center justify-center min-h-[128px] overflow-hidden">
                        <div className="venn-diagram inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center mx-auto origin-center">
                            <div className="flex flex-col items-center gap-1 flex-1 min-w-[48px]">
                                <BuildingIcon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
                                <span className="font-semibold text-[11px] sm:text-sm">리조트</span>
                            </div>
                            <div className="flex flex-col items-center text-gray-500 px-1 sm:px-2 flex-[0.6] min-w-[40px]">
                                <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-[11px] sm:text-sm font-bold mt-1 text-red-500">$10,000</span>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">공시가</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-1 min-w-[48px]">
                                <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-cyan-600" />
                                <span className="font-semibold text-[11px] sm:text-sm">고객</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-base text-gray-600 text-center flex-grow mt-auto px-4 flex flex-col justify-center">
                        <p className="leading-relaxed">
                            고객이 리조트에 직접 예약 시,<br />할인되지 않은 <strong className="text-gray-800">'공시가'</strong>가 적용됩니다.
                        </p>
                    </div>
                </div>
                 <div className="mt-auto pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 text-center">예시 최종가 (4박)</p>
                    <p className="text-center font-bold text-3xl text-red-500 mt-1">$10,000</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 pb-4 mb-6 text-center border-b-2 border-cyan-100 underline decoration-cyan-400 decoration-4 underline-offset-8">여행사 예약 (추천)</h3>
                <div className="flex-grow flex flex-col">
                    <div className="flex items-center justify-center min-h-[128px] overflow-hidden">
                        <div className="venn-diagram inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-center mx-auto origin-center">
                            <div className="flex flex-col items-center gap-1 flex-1 min-w-[48px]">
                                <BuildingIcon className="h-8 w-8 sm:h-11 sm:w-11 text-blue-600" />
                                <span className="font-semibold text-[11px] sm:text-sm">리조트</span>
                            </div>
                            <div className="flex flex-col items-center text-gray-500 px-1 sm:px-2 flex-[0.55] min-w-[38px]">
                                <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-[11px] sm:text-sm font-bold mt-1 text-gray-700">$6,000</span>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-1">도매가</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-1 min-w-[54px]">
                                <BuildingIcon className="h-8 w-8 sm:h-11 sm:w-11 text-green-600" />
                                <span className="font-semibold text-[11px] sm:text-sm leading-tight">한국 총판<br />(GSA)</span>
                            </div>
                            <div className="flex flex-col items-center text-gray-500 px-1 sm:px-2 flex-[0.55] min-w-[38px]">
                                <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-[11px] sm:text-sm font-bold mt-1 text-gray-700">$7,500</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-1 min-w-[48px]">
                                <BuildingIcon className="h-8 w-8 sm:h-11 sm:w-11 text-purple-600" />
                                <span className="font-semibold text-[11px] sm:text-sm">여행사</span>
                            </div>
                             <div className="flex flex-col items-center text-gray-500 px-1 sm:px-2 flex-[0.55] min-w-[38px]">
                                <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-[11px] sm:text-sm font-bold mt-1 text-cyan-600">$8,500</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-1 min-w-[48px]">
                                <UserIcon className="h-8 w-8 sm:h-11 sm:w-11 text-cyan-600" />
                                <span className="font-semibold text-[11px] sm:text-sm">고객</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-base text-gray-600 text-center flex-grow mt-auto px-4 flex flex-col justify-center">
                        <p className="leading-relaxed">
                            대량판매 <strong className="text-gray-800">'도매가'</strong> 덕분에<br />고객은 저렴하게 예약 가능합니다.
                        </p>
                    </div>
                </div>
                 <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 text-center">예시 최종가 (4박)</p>
                    <p className="text-center font-bold text-3xl text-cyan-600 mt-1">$8,500</p>
                </div>
            </div>
        </div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">몰디브 전문 한국 여행사</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency) => (
          <div key={agency.name} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{agency.name}</h2>
            <div className="flex flex-col space-y-3 mt-auto">
              {agency.website ? (
                <a href={agency.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200 transition-colors">
                  <LinkIcon className="h-4 w-4" />
                  홈페이지
                </a>
              ) : (
                <button disabled className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-400 font-semibold rounded-md cursor-not-allowed">
                  <LinkIcon className="h-4 w-4" />
                  홈페이지 (없음)
                </button>
              )}
              {agency.kakao_channel ? (
                <a href={agency.kakao_channel} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-500 transition-colors">
                  <KakaoIcon className="h-4 w-4" />
                  카카오톡 채널
                </a>
              ) : (
                <button disabled className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-400 font-semibold rounded-md cursor-not-allowed">
                  <KakaoIcon className="h-4 w-4" />
                  카카오톡 채널 (없음)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelAgencies;
