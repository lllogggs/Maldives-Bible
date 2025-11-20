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
    <section className="space-y-12">
      <header className="rounded-2xl bg-gradient-to-r from-cyan-100 via-white to-cyan-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">리조트 선택 핵심 체크리스트</h1>
        <p className="mt-3 text-sm text-gray-700">핵심만 추려 빠르게 비교하세요.</p>
        <ol className="mt-4 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
          {checklist.map((item, index) => (
            <li key={item} className="flex gap-2">
              <span className="font-semibold text-cyan-700">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </header>

      <section className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-cyan-700">이동동선 선택 팁</h2>
        <p className="mt-2 text-sm text-gray-700">
          첫날 일정과 예산, 이동 거리까지 고려해 가장 편한 이동 수단을 고르세요.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {transferOptions.map((option) => (
            <article key={option.title} className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">{option.title}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-sky-600">장점 :</dt>
                  <dd className="text-gray-900">{option.pros}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-red-500">단점 :</dt>
                  <dd className="text-gray-900">{option.cons}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {highlightCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-cyan-700">{card.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {card.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className="rounded-2xl bg-cyan-900/90 p-6 text-white">
        <h2 className="text-lg font-semibold">빠르게 비교하는 방법</h2>
        <ul className="mt-3 space-y-2 text-sm text-cyan-50">
          <li>후보 3곳만 남기고 위 체크포인트로 표 만들기.</li>
          <li>상담 시 이동수단·식사 플랜·객실 타입을 한 번에 전달.</li>
          <li>예산·체류일수·특별 요청(허니문, 가족)을 메모해 공유.</li>
        </ul>
      </aside>

      <section className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-cyan-700">몰디브 여행 용어 사전</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          {glossary.map(({ term, description }) => (
            <div key={term}>
              <dt className="font-semibold text-gray-900">{term}</dt>
              <dd className="mt-1 text-sm text-gray-700">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
};

export default ResortSelectionTips;
