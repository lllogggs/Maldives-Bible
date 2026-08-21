import React from 'react';
import { trackEvent } from '../utils/analytics';

const DesktopViewingTip: React.FC = () => {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (event.currentTarget.open) {
      trackEvent('desktop_viewing_tip_open', { placement: 'resort_list' });
    }
  };

  return (
    <details
      className="group relative shrink-0 text-xs text-slate-600 lg:hidden"
      onToggle={handleToggle}
    >
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1 rounded-lg px-2 font-semibold text-teal-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 [&::-webkit-details-marker]:hidden">
        <span>PC로 넓게 보기</span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="absolute right-0 top-full z-30 mt-1 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600 shadow-xl shadow-slate-900/10">
        <p>현재 화면에서도 모든 기능을 이용할 수 있어요. 한 화면에서 더 많은 리조트를 보려면 태블릿·PC 또는 브라우저의 데스크톱 사이트 기능을 이용해 보세요.</p>
        <ul className="mt-2 space-y-1">
          <li><strong className="text-slate-800">삼성 인터넷</strong> · 메뉴(≡) → PC 버전</li>
          <li><strong className="text-slate-800">Safari</strong> · 주소창 페이지 메뉴 → 데스크탑 웹 사이트 요청</li>
        </ul>
      </div>
    </details>
  );
};

export default DesktopViewingTip;
