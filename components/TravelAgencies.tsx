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
    <div className="animate-fade-in space-y-10">
      <div className="p-6 bg-cyan-50/70 border border-cyan-200 rounded-2xl lg:w-11/12 mx-auto space-y-6 shadow-sm">
        <h2 className="text-2xl text-center text-gray-800 font-bold leading-snug">
          ✈️ 리조트 → 도매가 → 한국 총판(GSA) → 여행사 → 고객 최종 가격
        </h2>
        <p className="text-center text-sm text-gray-600">각 단계마다 누적되는 혜택과 할인 폭을 한눈에 확인하세요.</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: '리조트', price: '$10,000', color: 'bg-blue-100 text-blue-700', icon: <BuildingIcon className="h-6 w-6" /> },
            { label: '도매가', price: '$6,000', color: 'bg-emerald-100 text-emerald-700', icon: <BuildingIcon className="h-6 w-6" /> },
            { label: '한국 총판(GSA)', price: '$7,000', color: 'bg-cyan-100 text-cyan-700', icon: <BuildingIcon className="h-6 w-6" /> },
            { label: '여행사', price: '$8,000', color: 'bg-violet-100 text-violet-700', icon: <BuildingIcon className="h-6 w-6" /> },
            { label: '고객 최종가', price: '$8,500', color: 'bg-cyan-600 text-white', icon: <UserIcon className="h-6 w-6" /> },
          ].map((step, index) => (
            <div key={step.label} className="relative flex flex-col items-center rounded-2xl border border-white/60 bg-white p-4 shadow">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${step.color} font-bold`}>{step.icon}</div>
              <p className="text-sm font-semibold text-gray-900 text-center">{step.label}</p>
              <p className={`text-lg font-extrabold ${index === 0 ? 'text-red-500' : index === 4 ? 'text-white' : 'text-cyan-700'}`}>{step.price}</p>
              {index < 4 && (
                <ChevronRightIcon className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500" />
              )}
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 border border-gray-200">
            <p className="text-sm text-gray-700">직접 예약 시 할인 전 공시가가 적용되어 가격이 높아집니다.</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-gray-200">
            <p className="text-sm text-gray-700">여행사를 통하면 대량 판매 도매가를 기반으로 가격이 책정되어 최종 금액이 낮아집니다.</p>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">몰디브 전문 한국 여행사</h1>
        <p className="text-sm text-gray-600">아이콘과 키워드로 여행사별 액션 버튼을 쉽게 찾을 수 있게 정리했습니다.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency) => (
          <div key={agency.name} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
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
