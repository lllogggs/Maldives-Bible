import React from 'react';

const ResortSelectionTips: React.FC = () => {
  return (
    <section className="space-y-12">
      <header className="rounded-2xl bg-gradient-to-r from-cyan-100 via-white to-cyan-50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">리조트 선택 핵심 체크리스트</h1>
        <p className="mt-3 text-sm text-gray-700">핵심만 추려 빠르게 비교하세요.</p>
        <ol className="mt-4 grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
          <li className="flex gap-2">
            <span className="font-semibold text-cyan-700">1.</span>
            <span>이동 동선: 국내선 vs 수상비행기 vs 보트</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-cyan-700">2.</span>
            <span>식사 플랜: 하프·풀보드 vs 올인클루시브</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-cyan-700">3.</span>
            <span>수중 환경: 하우스 리프, 만타·돌핀 포인트</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-cyan-700">4.</span>
            <span>다이닝 &amp; 바: 4일간 질리지 않을 메뉴 수</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-cyan-700">5.</span>
            <span>수영장: 공용 인피니티풀·키즈풀·프라이빗풀</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-cyan-700">6.</span>
            <span>객실 타입: 오버워터 vs 비치빌라 보유 여부</span>
          </li>
        </ol>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">이동수단 / 시간</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>
              <strong className="text-gray-900">국내선</strong>: 좌석 넓고 편안하지만 환승 대기 포함 시 2~3시간 소요.
            </li>
            <li>
              <strong className="text-gray-900">수상비행기</strong>: 45~50분 직항, 일몰 이후 운항 중단.
            </li>
            <li>
              <strong className="text-gray-900">스피드보트</strong>: 15~60분 이동, 야간 도착도 바로 체크인 가능.
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">레스토랑 · 바 갯수</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>시그니처 레스토랑 4곳 이상이면 4박 일정도 식상함 없이 운영.</li>
            <li>바 수가 많을수록 라이브·선셋 이벤트 선택지가 넓음.</li>
            <li>식사 플랜에 포함된 레스토랑, 당일 예약 규칙을 미리 확인.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">수영장</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>공용 인피니티풀: 선셋 DJ, 애프터눈 티 등 메인 이벤트 공간.</li>
            <li>키즈풀 분리 여부가 가족 여행 만족도를 좌우.</li>
            <li>프라이빗 풀: 8m 이상·온수 지원 여부 체크로 우기 대비.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-cyan-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-cyan-700">수중환경</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>하우스 리프 인접: 객실 데크에서 즉시 스노클링.</li>
            <li>라군 특화: 잔잔한 수영, 플로팅 포토존 촬영에 유리.</li>
            <li>만타·돌핀 포인트까지 이동 거리로 익스커션 난이도 판단.</li>
          </ul>
        </article>
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
          <div>
            <dt className="font-semibold text-gray-900">하프보드 (Half Board)</dt>
            <dd className="mt-1 text-sm text-gray-700">조·석식 포함, 점심과 주류는 별도.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">풀보드 (Full Board)</dt>
            <dd className="mt-1 text-sm text-gray-700">세 끼 포함, 음료·테마 레스토랑은 추가 비용.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">올인클루시브 (All Inclusive)</dt>
            <dd className="mt-1 text-sm text-gray-700">식사+주류+액티비티 패키지, 미니바까지 포함인 경우多.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">턴다운 서비스 (Turndown)</dt>
            <dd className="mt-1 text-sm text-gray-700">저녁에 침구 정돈·향초·배스로브를 세팅해 주는 서비스.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">버틀러 서비스</dt>
            <dd className="mt-1 text-sm text-gray-700">전담 직원이 액티비티·룸다이닝을 대신 예약·세팅.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">오버워터 빌라</dt>
            <dd className="mt-1 text-sm text-gray-700">수상 데크와 라군 계단이 있는 수상 객실.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">비치 빌라</dt>
            <dd className="mt-1 text-sm text-gray-700">해변에 붙어 있어 선베드·정원을 바로 이용.</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">하우스 리프</dt>
            <dd className="mt-1 text-sm text-gray-700">리조트 주변 산호 지대, 스노클링 난이도 지표.</dd>
          </div>
        </dl>
      </section>
    </section>
  );
};

export default ResortSelectionTips;
