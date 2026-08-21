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
      className="rounded-lg border border-sky-200 bg-sky-50/70 text-sm text-slate-700 lg:hidden"
      onToggle={handleToggle}
    >
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2.5 font-semibold text-sky-950 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        <span aria-hidden="true">💡</span>
        <span>더 넓게 비교하는 방법</span>
      </summary>
      <div className="border-t border-sky-200 px-3 py-3 text-xs leading-5 text-slate-600">
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
