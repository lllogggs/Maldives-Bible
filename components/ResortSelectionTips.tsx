import React from 'react';

const ResortSelectionTips: React.FC = () => {
  return (
    <section className="space-y-12">
      <header className="rounded-2xl bg-gradient-to-r from-cyan-100 via-white to-cyan-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">리조트 선택 핵심 체크리스트</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          이동 동선과 수중환경부터 미식 경험까지, 리조트별로 가장 많이 비교하는 항목을 한눈에 요약했습니다.
          아래 항목을 확인하며 원하는 분위기와 서비스 레벨을 빠르게 정리해 보세요.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">이동수단 / 시간</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            수상비행기는 말레 출발 45~50분으로 외곽 환초까지 바로 닿지만 일몰 이후 운항이 중단됩니다.
            스피드보트는 15~60분 내 이동하며 야간 도착 시에도 바로 체크인이 가능해 가족 여행자가 선호합니다.
          </p>
        </article>

        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">레스토랑 · 바 갯수</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            시그니처 레스토랑이 4개 이상인 리조트는 미식 투어를 즐기기에 좋고, 바가 많은 곳일수록 라이브 음악과 이벤트가 풍부합니다.
            식사 플랜에 포함되는 당일 예약 가능 여부를 확인하면 추가 비용과 웨이팅을 줄일 수 있습니다.
          </p>
        </article>

        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">수영장</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            공용 인피니티풀은 애프터눈 티, 선셋 DJ 등과 연계되어 분위기를 좌우하며, 키즈풀 분리 여부가 가족 여행 만족도를 높입니다.
            프라이빗 풀빌라를 원한다면 풀 길이 8m 이상인지, 가열식인지까지 체크하면 우기에도 활용도가 높습니다.
          </p>
        </article>

        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">수중환경</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            하우스리프가 가까운 리조트는 데크에서 바로 스노클링이 가능하고, 라군 중심 리조트는 수영과 플로팅 포토존에 강점이 있습니다.
            맨타 포인트, 돌핀 베이 등 익스커션 소요 거리를 확인하면 원하는 해양 생물을 만날 확률을 높일 수 있습니다.
          </p>
        </article>
      </div>

      <aside className="rounded-2xl bg-cyan-900/90 p-6 text-white">
        <h2 className="text-lg font-semibold">빠르게 비교하는 방법</h2>
        <p className="mt-3 text-sm leading-relaxed text-cyan-50">
          후보 리조트를 3개로 추린 뒤 위 4가지 항목을 체크리스트로 작성하면 전화 상담 전에도 선호도를 정리할 수 있습니다.
          견적 요청 시 이동수단, 식사 플랜, 객실 타입을 명확히 전달하면 맞춤 혜택 제안을 빠르게 받을 수 있어요.
        </p>
      </aside>

      <section className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-cyan-700">몰디브 여행 용어 사전</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-gray-900">하프보드 (Half Board)</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">조식과 석식이 포함된 식사 플랜으로, 점심과 주류는 별도 결제가 일반적입니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">풀보드 (Full Board)</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">조·중·석식이 모두 포함되지만 음료와 일부 테마 레스토랑은 추가 요금이 발생합니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">올인클루시브 (All Inclusive)</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">식사, 다수의 주류, 일부 액티비티가 포함된 패키지로 바 이용과 미니바 혜택을 동시에 즐길 수 있습니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">턴다운 서비스 (Turndown)</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">저녁 시간대 침구 정돈과 향초, 배스로브 등을 세팅해 주는 야간 하우스키핑입니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">버틀러 서비스</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">전담 직원이 액티비티 예약, 룸다이닝 세팅 등 일정을 맞춤 관리해 주는 프리미엄 서비스입니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">오버워터 빌라</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">바다 위 데크와 라군 직통 계단을 갖춘 수상 객실로, 프라이버시와 전망을 중시하는 커플에게 인기입니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">비치 빌라</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">모래사장에 위치한 객실로, 바로 앞 비치 선베드와 넓은 정원이 있어 가족 및 신혼 여행자 모두에게 사랑받습니다.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">하우스 리프</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-700">리조트 인근 산호초 지대의 총칭으로, 스노클링 난이도와 해양 생물 다양성을 가늠하는 핵심 지표입니다.</dd>
          </div>
        </dl>
      </section>
    </section>
  );
};

export default ResortSelectionTips;
