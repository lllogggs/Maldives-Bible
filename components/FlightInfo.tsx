import React from 'react';

const FlightInfo: React.FC = () => {
  return (
    <section className="space-y-10">
      <header className="rounded-2xl bg-gradient-to-r from-sky-100 via-white to-sky-50 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">항공권 정보</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          말레행 인기 경유 노선과 평균 요금, 스탑오버 포인트를 빠르게 확인하세요.
          간단한 요약 뒤에는 항공사별 대표 스케줄을 정리했습니다.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-sky-200 bg-white/90 shadow-sm">
        <table className="min-w-full divide-y divide-sky-100 text-left text-sm text-gray-700">
          <thead className="bg-sky-50 text-xs uppercase tracking-wide text-sky-700">
            <tr>
              <th scope="col" className="px-4 py-3">국가</th>
              <th scope="col" className="px-4 py-3">항공사</th>
              <th scope="col" className="px-4 py-3">예상 왕복요금 (이코노미)</th>
              <th scope="col" className="px-4 py-3">총 소요시간 (경유 포함)</th>
              <th scope="col" className="px-4 py-3">스탑오버 / 특징</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100 bg-white">
            <tr>
              <td className="px-4 py-4 font-semibold text-gray-900">싱가포르</td>
              <td className="px-4 py-4">싱가포르항공, 스쿠트</td>
              <td className="px-4 py-4">₩1,200,000 ~ ₩1,800,000</td>
              <td className="px-4 py-4">11~13시간 (창이 공항 1회 경유)</td>
              <td className="px-4 py-4">창이 공항 무료 트랜짓 투어, 라운지·샤워 시설 우수</td>
            </tr>
            <tr>
              <td className="px-4 py-4 font-semibold text-gray-900">두바이</td>
              <td className="px-4 py-4">에미레이트항공</td>
              <td className="px-4 py-4">₩1,300,000 ~ ₩1,900,000</td>
              <td className="px-4 py-4">13~15시간 (두바이 국제공항 경유)</td>
              <td className="px-4 py-4">A380 기재 투입, 스카이워즈 마일리지 적립률 높음</td>
            </tr>
            <tr>
              <td className="px-4 py-4 font-semibold text-gray-900">아부다비</td>
              <td className="px-4 py-4">에티하드항공</td>
              <td className="px-4 py-4">₩1,250,000 ~ ₩1,850,000</td>
              <td className="px-4 py-4">13~15시간 (아부다비 Zayed 공항 경유)</td>
              <td className="px-4 py-4">무료 스탑오버 호텔 프로모션, 굿우드 라운지 이용 가능</td>
            </tr>
            <tr>
              <td className="px-4 py-4 font-semibold text-gray-900">말레이시아</td>
              <td className="px-4 py-4">말레이시아항공, 에어아시아 X</td>
              <td className="px-4 py-4">₩1,000,000 ~ ₩1,500,000</td>
              <td className="px-4 py-4">12~14시간 (쿠알라룸푸르 경유)</td>
              <td className="px-4 py-4">저비용 항공 선택 폭이 넓고 동남아 연계 여행이 쉬움</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="rounded-2xl border border-sky-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-sky-700">주요 항공편 스케줄 한눈에 보기</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          각 항공사의 대표 편명과 시간표, 환승 대기 시간, 스탑오버 허용 일수를 정리했습니다. 실제 운항 일정은 시즌에 따라 다르니
          발권 전 최신 스케줄을 다시 확인하세요.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <header>
              <h3 className="text-base font-semibold text-gray-900">싱가포르항공</h3>
              <p className="mt-1 text-xs font-medium text-sky-600">SQ607 (ICN→SIN) / SQ432 (SIN→MLE)</p>
            </header>
            <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm leading-relaxed text-gray-700">
              <dt className="font-semibold text-gray-900">출발 · 도착</dt>
              <dd>ICN 09:10 → SIN 14:55 / SIN 20:10 → MLE 22:05</dd>
              <dt className="font-semibold text-gray-900">경유 대기</dt>
              <dd>5시간 15분 (창이 공항)</dd>
              <dt className="font-semibold text-gray-900">스탑오버</dt>
              <dd>싱가포르 스탑오버 프로그램으로 최대 48시간까지 호텔·관광 패스 구성 가능</dd>
            </dl>
          </article>

          <article className="rounded-xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <header>
              <h3 className="text-base font-semibold text-gray-900">스쿠트</h3>
              <p className="mt-1 text-xs font-medium text-sky-600">TR841 (ICN→SIN) / TR588 (SIN→MLE)</p>
            </header>
            <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm leading-relaxed text-gray-700">
              <dt className="font-semibold text-gray-900">출발 · 도착</dt>
              <dd>ICN 18:20 → SIN 23:35 / SIN 01:45 → MLE 03:15</dd>
              <dt className="font-semibold text-gray-900">경유 대기</dt>
              <dd>2시간 10분 (창이 공항)</dd>
              <dt className="font-semibold text-gray-900">스탑오버</dt>
              <dd>유료 스탑오버 옵션으로 최대 24시간까지 체류 가능, 저비용 항공 특성상 수하물·식사 추가 요금 발생</dd>
            </dl>
          </article>

          <article className="rounded-xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <header>
              <h3 className="text-base font-semibold text-gray-900">에미레이트항공</h3>
              <p className="mt-1 text-xs font-medium text-sky-600">EK323 (ICN→DXB) / EK656 (DXB→MLE)</p>
            </header>
            <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm leading-relaxed text-gray-700">
              <dt className="font-semibold text-gray-900">출발 · 도착</dt>
              <dd>ICN 23:55 → DXB 04:45+1 / DXB 10:35 → MLE 16:05</dd>
              <dt className="font-semibold text-gray-900">경유 대기</dt>
              <dd>5시간 50분 (두바이 국제공항)</dd>
              <dt className="font-semibold text-gray-900">스탑오버</dt>
              <dd>두바이 커넥트 서비스로 최대 96시간까지 체류 지원, 호텔·교통 일부 포함</dd>
            </dl>
          </article>

          <article className="rounded-xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <header>
              <h3 className="text-base font-semibold text-gray-900">에티하드항공</h3>
              <p className="mt-1 text-xs font-medium text-sky-600">EY873 (ICN→AUH) / EY278 (AUH→MLE)</p>
            </header>
            <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm leading-relaxed text-gray-700">
              <dt className="font-semibold text-gray-900">출발 · 도착</dt>
              <dd>ICN 00:25 → AUH 05:35 / AUH 09:40 → MLE 15:15</dd>
              <dt className="font-semibold text-gray-900">경유 대기</dt>
              <dd>4시간 5분 (아부다비 Zayed 공항)</dd>
              <dt className="font-semibold text-gray-900">스탑오버</dt>
              <dd>에티하드 스탑오버로 최대 2박 무료 호텔 제공, 추가 숙박은 할인 요금 적용</dd>
            </dl>
          </article>

          <article className="rounded-xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <header>
              <h3 className="text-base font-semibold text-gray-900">말레이시아항공</h3>
              <p className="mt-1 text-xs font-medium text-sky-600">MH067 (ICN→KUL) / MH176 (KUL→MLE)</p>
            </header>
            <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm leading-relaxed text-gray-700">
              <dt className="font-semibold text-gray-900">출발 · 도착</dt>
              <dd>ICN 11:10 → KUL 17:45 / KUL 20:45 → MLE 22:00</dd>
              <dt className="font-semibold text-gray-900">경유 대기</dt>
              <dd>3시간 0분 (쿠알라룸푸르 국제공항)</dd>
              <dt className="font-semibold text-gray-900">스탑오버</dt>
              <dd>말레이시아 스톱오버 패스로 최대 72시간까지 체류 가능, 시티투어·공항철도 연계</dd>
            </dl>
          </article>

          <article className="rounded-xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <header>
              <h3 className="text-base font-semibold text-gray-900">에어아시아 X</h3>
              <p className="mt-1 text-xs font-medium text-sky-600">D7 509 (ICN→KUL) / AK71 (KUL→MLE)</p>
            </header>
            <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm leading-relaxed text-gray-700">
              <dt className="font-semibold text-gray-900">출발 · 도착</dt>
              <dd>ICN 23:45 → KUL 05:30+1 / KUL 09:45 → MLE 10:50</dd>
              <dt className="font-semibold text-gray-900">경유 대기</dt>
              <dd>4시간 15분 (쿠알라룸푸르 국제공항 2터미널)</dd>
              <dt className="font-semibold text-gray-900">스탑오버</dt>
              <dd>플렉시 스탑오버로 최대 30일까지 체류 가능, 각 구간 수하물·기내식 별도 구매 필요</dd>
            </dl>
          </article>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-sky-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-sky-700">싱가포르 경유</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-emerald-600">장점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>창이 공항 라운지, 어린이 놀이터, 정원 등 트랜짓 시설이 뛰어나 장시간 대기에도 편안합니다.</li>
                <li>스탑오버 시 싱가포르 내 쇼핑·미식 투어를 하루만에 즐길 수 있어 허니문 일정에 활력을 더합니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-600">단점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>성수기 좌석이 빨리 마감되어 얼리버드 발권이 필수이며, 프리미엄 이코노미 업그레이드 비용이 높습니다.</li>
                <li>입국 스탑오버 시 호텔 요금이 상대적으로 높아 예산이 빠르게 상승할 수 있습니다.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            스탑오버 팁: 싱가포르항공 KrisFlyer 마일로 비즈니스 업그레이드가 가능하며, 창이 공항 무료 트랜짓 투어를 미리 예약하면 대기 시간을 효율적으로 활용할 수 있습니다.
          </p>
        </article>

        <article className="rounded-2xl border border-sky-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-sky-700">두바이 경유</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-emerald-600">장점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>에미레이트항공 A380 기재와 ICE 인플라이트 엔터테인먼트로 장거리 구간도 쾌적합니다.</li>
                <li>두바이 스탑오버 프로그램을 활용하면 사막 사파리, 부르즈 칼리파 등 럭셔리 투어를 쉽게 즐길 수 있습니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-600">단점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>야간 도착 후 새벽 환승 시 공항 혼잡도가 높아 이동 동선이 길어질 수 있습니다.</li>
                <li>두바이 입국 비자와 호텔 비용이 높아 예산 대비 효율이 떨어질 수 있습니다.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            스탑오버 팁: 에미레이트 스카이워즈 멤버십을 통해 호텔·투어와 연계된 패키지를 예약하면 포인트 적립과 업그레이드 기회를 동시에 노릴 수 있습니다.
          </p>
        </article>

        <article className="rounded-2xl border border-sky-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-sky-700">아부다비 경유</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-emerald-600">장점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>에티하드항공 프리미엄 이코노미 좌석이 넓고 서비스 품질이 뛰어나 장거리 피로도를 줄여줍니다.</li>
                <li>48시간 무료 스탑오버 호텔 프로모션을 활용하면 루브르 아부다비, 그랜드모스크를 여유롭게 둘러볼 수 있습니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-600">단점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>경유 시간이 3시간 이하일 경우 보안 검색이 까다로워 환승 스트레스가 커질 수 있습니다.</li>
                <li>스톱오버 숙박 혜택이 성수기에는 재고가 빨리 소진되어 조기 예약이 필요합니다.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            스탑오버 팁: 에티하드 게스트 포인트를 사용하면 공항 라운지와 프리미엄 체크인을 이용할 수 있으며, 사전 온라인 비자 신청으로 입국 시간을 절약하세요.
          </p>
        </article>

        <article className="rounded-2xl border border-sky-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-sky-700">말레이시아 경유</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-emerald-600">장점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>쿠알라룸푸르 경유 편이 다양해 원하는 시간대 선택 폭이 넓고, 저비용 항공과 조합하기 좋습니다.</li>
                <li>스탑오버 시 미식·쇼핑이 저렴해 예산 친화적인 동남아 도시 여행을 함께 즐길 수 있습니다.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-600">단점</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                <li>저비용 항공 이용 시 위탁수하물, 기내식 등 부가 요금이 추가되어 실제 비용이 높아질 수 있습니다.</li>
                <li>야간 환승 시간대 공항 편의시설이 제한되어 대기 중 휴식 공간 확보가 어려울 수 있습니다.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            스탑오버 팁: 말레이시아항공 Enrich 마일 적립으로 동남아 내 추가 구간 업그레이드를 노리거나, KL 익스프레스 열차로 30분 만에 시내를 이동해 미리 짠 맛집 코스를 즐겨보세요.
          </p>
        </article>
      </div>
    </section>
  );
};

export default FlightInfo;
