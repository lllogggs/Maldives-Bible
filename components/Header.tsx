import React from 'react';
import { EditIcon } from './icons/Icons';

interface HeaderProps {
  isImageEditMode: boolean;
  onToggleImageEditMode: () => void;
  isImageEditFeatureAvailable: boolean;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isImageEditMode,
  onToggleImageEditMode,
  isImageEditFeatureAvailable,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 text-slate-950 shadow-sm shadow-slate-900/5 backdrop-blur-xl transition-all duration-300">
      <div
        className="mx-auto max-w-[1440px] px-4 py-2 transition-all duration-300 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 transition-all duration-300 sm:gap-4">
          <button
            type="button"
            onClick={onLogoClick}
            aria-label="홈으로 이동"
            className="group flex min-w-0 items-center gap-3 justify-self-start text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/10 transition-all duration-300 sm:h-12 sm:w-12">
              <img
                src="/android-chrome-192x192.png"
                alt=""
                className="h-full w-full object-cover"
                width={112}
                height={112}
              />
            </span>
            <span className="min-w-0">
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700 sm:block">
                Maldives Bible
              </span>
              <span className="font-brand-heading block truncate text-sm text-slate-950 group-hover:text-teal-700 sm:text-base">
                몰디브 바이블
              </span>
            </span>
          </button>
          {isImageEditFeatureAvailable && (
            <div className="flex w-full min-w-0 items-center justify-end transition-all duration-300 sm:w-auto">
              <button
                type="button"
                onClick={onToggleImageEditMode}
                aria-pressed={isImageEditMode}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:w-auto ${
                  isImageEditMode
                    ? 'border-teal-300 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
