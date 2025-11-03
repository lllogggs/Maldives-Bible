import React from 'react';

const FlightInfo: React.FC = () => {
  return (
    <section className="rounded-2xl border border-dashed border-cyan-200 bg-white/80 p-10 text-center text-sm text-gray-600">
      <h1 className="text-xl font-semibold text-gray-900">항공권 정보</h1>
      <p className="mt-4">
        말레행 항공권 가이드가 준비 중입니다. 경유 노선 비교, 좌석 등급별 특가 소식, 마일리지 활용법을 곧 업데이트할게요.
      </p>
    </section>
  );
};

export default FlightInfo;
