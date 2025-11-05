import React from 'react';

const FlightInfo: React.FC = () => {
  return (
    <section className="space-y-10">
      <header className="rounded-2xl bg-gradient-to-r from-sky-100 via-white to-sky-50 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">항공권 정보</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          말레까지 가는 주요 경유 허브와 항공사를 비교해 보세요. 평균 요금과 소요시간, 스탑오버 팁을 함께 정리했습니다.
          성수기에는 판매 속도가 빠르므로 경유지 호텔과 라운지 옵션까지 미리 확인해 두면 여유로운 일정을 만들 수 있습니다.
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
