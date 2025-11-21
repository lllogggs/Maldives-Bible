import React, { useState } from 'react';
import {
  BoatIcon,
  SeaplaneIcon,
  DomesticFlightIcon,
  RestaurantIcon,
  PoolIcon,
  BuildingIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from './icons/Icons';

const checklist = [
  { id: 1, text: '이동 동선: 국내선 vs 수상비행기 vs 보트', icon: BoatIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, text: '식사 플랜: 하프·풀보드 vs 올인클루시브', icon: RestaurantIcon, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, text: '수중 환경: 하우스 리프, 만타·돌핀 포인트', icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 4, text: '다이닝 & 바: 4일간 질리지 않을 메뉴 수', icon: RestaurantIcon, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 5, text: '수영장: 공용 인피니티풀·키즈풀·프라이빗풀', icon: PoolIcon, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: 6, text: '객실 타입: 오버워터 vs 비치빌라 보유 여부', icon: BuildingIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
];

const transferOptions = [
  {
    title: '국내선 비행기',
    icon: DomesticFlightIcon,
    pros: '몰디브 내 장거리 이동 시 가장 안락하게 이동 가능. 전용 라운지에서 휴식 가능.',
    cons: '말레 도착 후 탑승까지 대기 시간이 길고, 국내선 착륙 후에도 보트 환승이 필요할 수 있음.',
  },
  {
    title: '수상 비행기',
    icon: SeaplaneIcon,
    pros: '45~50분 직항으로 빠르게 이동하며, 창가에서 몰디브 전경을 감상할 수 있음.',
    cons: '날씨 영향이 커서 지연이 잦고 일몰 이후 운항하지 않아 야간 도착 일정과는 맞지 않음.',
  },
  {
    title: '보트',
    icon: BoatIcon,
    pros: '말레 공항에서 바로 출발해 대기 시간이 짧고, 야간에도 리조트로 이동 가능.',
    cons: '파도가 높을 때는 흔들림이 커 멀미 위험이 있으며, 60분 이상 이동 시 피로도가 높아짐.',
  },
];

const highlightCards = [
  {
    title: '레스토랑 · 바 갯수',
    points: [
      '시그니처 레스토랑 4곳 이상이면 4박 일정도 식상함 없이 운영.',
      '바 수가 많을수록 라이브·선셋 이벤트 선택지가 넓음.',
      '식사 플랜에 포함된 레스토랑, 당일 예약 규칙을 미리 확인.',
    ],
  },
  {
    title: '수영장',
    points: [
      '공용 인피니티풀: 선셋 DJ, 애프터눈 티 등 메인 이벤트 공간.',
      '키즈풀 분리 여부가 가족 여행 만족도를 좌우.',
      '프라이빗 풀: 8m 이상·온수 지원 여부 체크로 우기 대비.',
    ],
  },
  {
    title: '수중환경',
    points: [
      '하우스 리프 인접: 객실 데크에서 시 스노클링.',
      '라군 특화: 잔잔한 수영, 플로팅 포토존 촬영에 유리.',
      '만타·돌핀 포인트까지 이동 거리로 익스커션 난이도 판단.',
    ],
  },
];

const glossary = [
  { term: '하프보드 (HB)', description: '조·석식 포함, 점심과 주류는 별도.' },
  { term: '풀보드 (FB)', description: '세 끼 포함, 음료·테마 레스토랑은 추가 비용.' },
  { term: '올인클루시브 (AI)', description: '식사+주류+액티비티 패키지, 미니바 포함.' },
  { term: '턴다운 서비스', description: '저녁에 침구 정돈·향초·배스로브 세팅.' },
  { term: '버틀러 서비스', description: '전담 직원이 예약·세팅 대행.' },
  { term: '오버워터 빌라', description: '수상 데크와 라군 계단이 있는 객실.' },
  { term: '비치 빌라', description: '해변과 바로 연결된 객실.' },
  { term: '하우스 리프', description: '리조트 주변 산호 지대.' },
];

const ResortSelectionTips: React.FC = () => {
  const [openHighlight, setOpenHighlight] = useState<number | null>(0);

  return (
    <div className="space-y-16 animate-fade-in pb-10">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">리조트 선택 체크리스트</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          몰디브 리조트 선택, 무엇부터 봐야 할까요? <br className="hidden sm:block" />
          핵심 포인트 6가지를 확인하고 나에게 딱 맞는 곳을 찾아보세요.
        </p>
      </section>

      {/* Checklist Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {checklist.map((item) => (
          <div key={item.id} className={`${item.bg} p-5 rounded-2xl border border-transparent hover:border-gray-200 transition-all duration-300 flex items-start gap-4 shadow-sm hover:shadow-md`}>
            <div className={`p-3 rounded-xl bg-white shadow-sm ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm leading-relaxed">{item.text}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Transfer Options Comparison */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
            <BoatIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">이동수단 장단점 비교</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {transferOptions.map((option) => (
            <div key={option.title} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                <option.icon className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">{option.title}</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2">장점</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{option.pros}</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded mb-2">단점</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{option.cons}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights Accordion */}
      <section className="bg-cyan-50/50 rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">놓치기 쉬운 디테일</h2>
        <div className="grid gap-4 max-w-3xl mx-auto">
          {highlightCards.map((card, index) => (
            <div key={card.title} className="bg-white rounded-xl border border-cyan-100 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenHighlight(openHighlight === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-800 text-lg">{card.title}</span>
                <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openHighlight === index ? 'rotate-90' : ''}`} />
              </button>
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openHighlight === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="p-5 pt-0 space-y-2">
                  {card.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Glossary Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">알아두면 좋은 용어</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {glossary.map((item) => (
            <div key={item.term} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-cyan-300 transition-colors group">
              <dt className="font-bold text-cyan-700 text-sm mb-1 group-hover:text-cyan-600">{item.term}</dt>
              <dd className="text-xs text-gray-500 leading-relaxed">{item.description}</dd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResortSelectionTips;
