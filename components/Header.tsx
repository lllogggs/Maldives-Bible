import React from 'react';
import { EditIcon } from './icons/Icons';

interface HeaderProps {
  isImageEditMode: boolean;
  onToggleImageEditMode: () => void;
  isImageEditFeatureAvailable: boolean;
  isCompact: boolean;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isImageEditMode,
  onToggleImageEditMode,
  isImageEditFeatureAvailable,
  isCompact,
  onLogoClick,
}) => {
  const containerSpacing = isCompact ? 'py-2' : 'py-4 sm:py-5';
  const contentSpacing = isCompact ? 'gap-2 sm:gap-4' : 'gap-3 sm:gap-6';
  const logoSize = isCompact ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-12 w-12 sm:h-14 sm:w-14';
  const buttonSizing = isCompact ? 'px-3 py-2 text-sm gap-2' : 'px-4 py-2.5 text-sm gap-3';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 text-slate-950 shadow-sm shadow-slate-900/5 backdrop-blur-xl transition-all duration-300">
      <div
        className={`mx-auto max-w-[1440px] px-4 transition-all duration-300 sm:px-6 lg:px-8 ${containerSpacing}`}
      >
        <div className={`grid items-center transition-all duration-300 md:grid-cols-[auto_minmax(0,1fr)] ${contentSpacing}`}>
          <button
            type="button"
            onClick={onLogoClick}
            aria-label="홈으로 이동"
            className="group flex min-w-0 items-center gap-3 justify-self-start text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <span className={`${logoSize} block shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/10 transition-all duration-300`}>
              <img
                src="/android-chrome-192x192.png"
                alt=""
                className="h-full w-full object-cover"
                width={112}
                height={112}
              />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                Maldives Bible
              </span>
              <span className="font-brand-heading block truncate text-base text-slate-950 group-hover:text-teal-700">
                몰디브 바이블
              </span>
            </span>
          </button>
          <div
            className={`w-full min-w-0 flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-end transition-all duration-300 ${
              isCompact ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-4'
            }`}
          >
            {isImageEditFeatureAvailable && (
              <button
                type="button"
                onClick={onToggleImageEditMode}
                aria-pressed={isImageEditMode}
                className={`flex items-center justify-between rounded-lg border font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
                  isImageEditMode
                    ? 'border-teal-300 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                } ${buttonSizing}`}
              >
                <span className="flex items-center gap-2">
                  <EditIcon />
                  이미지 편집 모드
                </span>
                <span
                  className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                    isImageEditMode ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isImageEditMode ? 'ON' : 'OFF'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
