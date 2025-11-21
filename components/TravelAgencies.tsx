import React from 'react';
import { LinkIcon, KakaoIcon } from './icons/Icons';

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
  { "name": "잇츠마이트래블", "website": "http://itsmytravel.co.kr/", "kakao_channel": "http://pf.kakao.com/_qgDUxd" },
  { "name": "투어플래닛", "website": "http://www.tour-planet.co.kr/", "kakao_channel": "http://pf.kakao.com/_LYSSl" },
  { "name": "허니문리조트", "website": "http://www.honeymoonresort.co.kr/", "kakao_channel": "http://pf.kakao.com/_gkKlE" },
  { "name": "천생연분닷컴", "website": "http://www.1000syb.com/", "kakao_channel": null },
  { "name": "팜투어", "website": "https://www.palmtour.co.kr", "kakao_channel": "http://pf.kakao.com/_Hxmxaxexj" }
];

const TravelAgencies: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-12 pb-10">
      {/* Price Comparison Section */}
      <section className="bg-white rounded-3xl border border-cyan-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center bg-cyan-50/50 border-b border-cyan-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            왜 <span className="text-cyan-600">여행사 예약</span>이 더 저렴할까요?
          </h2>
          <p className="text-gray-600">
            리조트와 직접 계약된 도매가로 제공되기 때문에 개인 예약보다 훨씬 경제적입니다.
          </p>
        </div>

        <div className="p-8 grid gap-8 md:grid-cols-2 items-center max-w-4xl mx-auto">
          {/* Direct Booking */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-gray-500">직접 예약 (공시가)</span>
              <span className="font-bold text-2xl text-gray-400 line-through decoration-red-500/50">$10,000</span>
            </div>
            <div className="h-12 bg-gray-100 rounded-full w-full relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium text-sm">
                할인 없음
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              호텔 예약 사이트나 리조트 공홈 예약 시<br />정가(Rack Rate)가 적용됩니다.
            </p>
          </div>

          {/* Agency Booking */}
          <div className="space-y-4 relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-bounce">
              약 $1,500 절약!
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-cyan-700">여행사 예약 (특가)</span>
              <span className="font-bold text-3xl text-cyan-600">$8,500</span>
            </div>
            <div className="h-12 bg-cyan-50 rounded-full w-full relative overflow-hidden border border-cyan-100">
              <div className="absolute top-0 left-0 h-full bg-cyan-500 w-[85%] rounded-full flex items-center justify-end px-4">
                <span className="text-white font-bold text-sm">도매가 적용</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              한국 총판(GSA)과 여행사가 대량 구매 계약을 맺어<br />더 저렴한 요금을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Agency List Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🇰🇷 몰디브 전문 여행사</span>
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{agencies.length}곳</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agencies.map((agency) => (
            <div key={agency.name} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-cyan-300 hover:shadow-md transition-all group">
              <h3 className="font-bold text-gray-800 mb-4 truncate" title={agency.name}>{agency.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {agency.website ? (
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    홈페이지
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-300 text-xs font-semibold rounded-lg cursor-not-allowed border border-gray-100">
                    <LinkIcon className="h-3.5 w-3.5" />
                    홈페이지
                  </button>
                )}

                {agency.kakao_channel ? (
                  <a
                    href={agency.kakao_channel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FAE100] text-[#371D1E] text-xs font-semibold rounded-lg hover:bg-[#F9E000]/90 transition-colors"
                  >
                    <KakaoIcon className="h-3.5 w-3.5" />
                    카카오톡
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-300 text-xs font-semibold rounded-lg cursor-not-allowed border border-gray-100">
                    <KakaoIcon className="h-3.5 w-3.5" />
                    카카오톡
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TravelAgencies;
