import React from 'react';

const checklist = [
  '이동 동선: 국내선 vs 수상비행기 vs 보트',
  '식사 플랜: 하프·풀보드 vs 올인클루시브',
  '수중 환경: 하우스 리프, 만타·돌핀 포인트',
  '다이닝 & 바: 4일간 질리지 않을 메뉴 수',
  '수영장: 공용 인피니티풀·키즈풀·프라이빗풀',
  '객실 타입: 오버워터 vs 비치빌라 보유 여부',
];

const transferOptions = [
  {
    title: '국내선 비행기',
    pros: '몰디브 내 장거리 이동 시 가장 안락하게 이동 가능. 전용 라운지에서 휴식 가능.',
    cons: '말레 도착 후 탑승까지 대기 시간이 길고, 국내선 착륙 후에도 보트 환승이 필요할 수 있음.',
  },
  {
    title: '수상 비행기',
    pros: '45~50분 직항으로 빠르게 이동하며, 창가에서 몰디브 전경을 감상할 수 있음.',
    cons: '날씨 영향이 커서 지연이 잦고 일몰 이후 운항하지 않아 야간 도착 일정과는 맞지 않음.',
  },
  {
    title: '보트',
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
  { term: '하프보드 (Half Board)', description: '조·석식 포함, 점심과 주류는 별도.' },
  { term: '풀보드 (Full Board)', description: '세 끼 포함, 음료·테마 레스토랑은 추가 비용.' },
  { term: '올인클루시브 (All Inclusive)', description: '식사+주류+액티비티 패키지, 미니바까지 포함인 경우多.' },
  { term: '턴다운 서비스 (Turndown)', description: '저녁에 침구 정돈·향초·배스로브를 세팅해 주는 서비스.' },
  { term: '버틀러 서비스', description: '전담 직원이 액티비티·룸다이닝을 대신 예약·세팅.' },
  { term: '오버워터 빌라', description: '수상 데크와 라군 계단이 있는 수상 객실.' },
  { term: '비치 빌라', description: '해변에 붙어 있어 선베드·정원을 바로 이용.' },
  { term: '하우스 리프', description: '리조트 주변 산호 지대, 스노클링 난이도 지표.' },
];

const ResortSelectionTips: React.FC = () => {
  return (
    <section className="space-y-10">
      <header className="rounded-2xl bg-gradient-to-r from-cyan-100 via-white to-cyan-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">리조트 선택 핵심 체크리스트</h1>
        <p className="mt-3 text-sm text-gray-700">핵심만 추려 빠르게 비교하세요.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {checklist.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-cyan-100 bg-white/80 px-3 py-2 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white text-sm font-bold">{index + 1}</span>
              <span className="text-sm text-gray-800">{item}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-cyan-700">이동수단 한눈에 비교</h2>
            <p className="text-sm text-gray-700">첫날 동선과 예산, 이동 시간을 기준으로 선택하세요.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">+ 장점</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700">- 단점</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {transferOptions.map((option) => (
            <article key={option.title} className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-base font-semibold text-gray-900">{option.title}</h3>
              <div className="space-y-2 text-sm">
                <p className="flex gap-2"><span className="font-bold text-emerald-600">+ </span><span className="text-gray-900">{option.pros}</span></p>
                <p className="flex gap-2"><span className="font-bold text-rose-600">- </span><span className="text-gray-900">{option.cons}</span></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {highlightCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-cyan-700">{card.title}</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {card.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className="rounded-2xl bg-cyan-900/90 p-6 text-white space-y-3">
        <h2 className="text-lg font-semibold">빠르게 비교하는 방법</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {["후보 3곳만 남기고 표로 정리", "상담 시 이동·식사·객실 정보를 한번에 전달", "예산·체류일수·특별 요청을 메모로 공유"].map((tip) => (
            <div key={tip} className="rounded-xl bg-white/10 px-3 py-2 text-sm">{tip}</div>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-cyan-700">몰디브 여행 용어 사전</h2>
          <p className="text-xs text-gray-500">더보기를 눌러 세부 설명을 접거나 펼칠 수 있습니다.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {glossary.map(({ term, description }) => (
            <details key={term} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm group" open>
              <summary className="cursor-pointer text-sm font-semibold text-gray-900 flex items-center justify-between">
                {term}
                <span className="text-xs text-cyan-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{description}</p>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
};

export default ResortSelectionTips;
