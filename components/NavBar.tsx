import React from 'react';
import { VIEW_PATH_MAP, type View } from '../seoPages';

interface NavBarProps {
  currentPath: string;
  currentView: View;
  onViewChange?: (view: View) => void;
}

const NAV_ITEMS: Array<{
  view: View;
  label: string;
  href: string;
}> = [
  {
    view: 'tips',
    label: '시작하기',
    href: VIEW_PATH_MAP.tips,
  },
  {
    view: 'resorts',
    label: '리조트 비교',
    href: VIEW_PATH_MAP.resorts,
  },
  {
    view: 'agencies',
    label: '견적 비교',
    href: VIEW_PATH_MAP.agencies,
  },
  {
    view: 'flights',
    label: '항공 가이드',
    href: VIEW_PATH_MAP.flights,
  },
];

const NavBar: React.FC<NavBarProps> = ({ currentPath, currentView, onViewChange }) => {
  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    view: View,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !onViewChange
    ) {
      return;
    }

    event.preventDefault();
    onViewChange(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="mb-6 border-b border-slate-200" aria-label="몰디브 바이블 주요 메뉴">
      <div className="grid grid-cols-4 gap-0 sm:flex sm:gap-8">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href ||
            (currentPath.length === 0 && currentView === item.view);

          return (
            <a
              key={item.view}
              href={item.href}
              data-quote-entry={item.view === 'agencies' ? 'primary_nav' : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={(event) => handleNavigation(event, item.view)}
              className={`flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-sm border-b-2 px-0.5 text-center text-[13px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f8f7] sm:w-auto sm:shrink-0 sm:px-1 sm:text-base ${
                isActive
                  ? 'border-teal-600 text-slate-950'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
