import React from 'react';

const ResortSelectionTips: React.FC = () => {
  return (
    <section className="space-y-10">
      <header className="rounded-2xl bg-gradient-to-r from-cyan-100 via-white to-cyan-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">리조트 선택 핵심 체크리스트</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          몰디브 리조트를 고를 때 가장 많이 고민하는 이동 수단, 수중 환경, 객실 구성, 미식 경험 순으로 정리했습니다.
          블로그 취재 노트를 토대로 허니문과 가족 여행자가 공통으로 확인해야 할 질문을 추렸어요.
        </p>
      </header>

      <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-cyan-700">1. 예산대와 프로모션 구조 파악</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>시즌별 프로모션</strong>: 5~8월 로우시즌에는 4박 이상 무료 체류, 식사 업그레이드 같은 혜택이 집중됩니다.
            블로그에서는 리조트별로 &ldquo;얼리버드+장기투숙&rdquo;을 중복 적용하는 방법을 소개하고 있으니, 여행사 견적 요청 전에
            해당 시즌 쿠폰이 남아있는지 확인하세요.
          </li>
          <li>
            <strong>세금과 트랜스퍼 포함 여부</strong>: 일부 리조트는 10% 서비스차지, 16% GST, 그린택스가 별도입니다.
            견적 비교 시 &ldquo;총액 기준인지&rdquo;와 &ldquo;트랜스퍼 비용 포함인지&rdquo;를 꼭 체크하면 숨은 비용을 줄일 수 있습니다.
          </li>
        </ul>
      </article>

      <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-cyan-700">2. 이동 동선과 리조트 분위기</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>수상비행기 vs. 스피드보트</strong>: 수상비행기는 40~50분의 비행으로 프라이빗한 외곽 환초에 접근할 수 있지만,
            체크인 시간대가 엄격합니다. 반면 스피드보트는 말레 공항 도착 후 바로 이동할 수 있어 어린 자녀 동반 시 선호도가 높습니다.
          </li>
          <li>
            <strong>라군/하우스리프 선택</strong>: 허니문은 새하얀 라군 전망을, 다이버는 수중생물이 풍부한 하우스리프를 선호합니다.
            블로그에서 추천한 &ldquo;라군+리프&rdquo; 균형형 리조트(예: 빌라 메가펀, 아다란 프레스티지 바두)는 활동 성향이 다른 커플에게 적합합니다.
          </li>
        </ul>
      </article>

      <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-cyan-700">3. 객실 구성과 프라이버시</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>룸 카테고리</strong>: 워터빌라에도 &ldquo;선덱 전용&rdquo;, &ldquo;풀빌라&rdquo;, &ldquo;썬셋 뷰&rdquo; 등 세부 타입이 나뉩니다.
            선택 팁 글에서는 같은 워터빌라라도 썬셋 보장이 있는지, 수상 하우스리프에 바로 진입 가능한지를 기준으로 구분했습니다.
          </li>
          <li>
            <strong>프라이버시 등급</strong>: &ldquo;허니문 1열&rdquo;로 불리는 리조트들은 객실 간격이 넓고 선데크 가림막이 확실합니다.
            반면 패밀리룸이 주력인 리조트는 키즈풀, 공용비치 접근성이 좋아 아이 동반 여행자에게 유리합니다.
          </li>
        </ul>
      </article>

      <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-cyan-700">4. 미식 &amp; 체험 액티비티</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>식사 플랜</strong>: 하프보드, 풀보드, 올인클루시브 구성이 모두 다릅니다. 블로그에서는 &ldquo;하이브리드 올인클루시브&rdquo;
            리조트를 예시로 들어, 주류 포함 여부와 a la carte 레스토랑 예약 정책까지 비교했습니다.
          </li>
          <li>
            <strong>익스커션</strong>: 스노클 사파리, 돌핀 크루즈, 샌드뱅크 피크닉 등 포함 액티비티를 확인하세요.
            활동이 많은 리조트는 패키지 기본 가격이 높더라도 현지 결제 비용을 절약할 수 있습니다.
          </li>
        </ul>
      </article>

      <aside className="rounded-2xl bg-cyan-900/90 p-6 text-white">
        <h2 className="text-lg font-semibold">빠르게 비교하는 방법</h2>
        <p className="mt-3 text-sm leading-relaxed text-cyan-50">
          블로그에서 추천한 방식대로 &ldquo;예산 &gt; 이동 동선 &gt; 객실 &gt; 미식&rdquo; 순으로 후보를 압축한 뒤,
          몰디브바이블의 즐겨찾기와 비교함 기능을 활용하면 3개 리조트까지는 30분 안에 정리할 수 있습니다.
          견적을 요청할 때는 원하는 이동 수단과 식사 플랜을 미리 명시해 여행사와의 커뮤니케이션 시간을 줄이세요.
        </p>
      </aside>
    </section>
  );
};

export default ResortSelectionTips;
