import React from 'react';
import { LogoIcon, SearchIcon, EditIcon } from './icons/Icons';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isImageEditMode: boolean;
  onToggleImageEditMode: () => void;
  isImageEditFeatureAvailable: boolean;
  isCompact: boolean;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  isImageEditMode,
  onToggleImageEditMode,
  isImageEditFeatureAvailable,
  isCompact,
}) => {
  const containerSpacing = isCompact ? 'pt-1.5 pb-2' : 'pt-4 pb-6';
  const contentSpacing = isCompact
    ? 'py-1.5 gap-2 sm:gap-3'
    : 'py-4 gap-4 sm:gap-6';
  const logoScale = isCompact ? 'scale-50' : 'scale-100';
  const inputSizing = isCompact ? 'py-1.5 text-sm' : 'py-2 text-base';
  const buttonSizing = isCompact ? 'px-3 py-1.5 text-sm gap-2' : 'px-4 py-2 text-sm gap-3';

  return (
    <header className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md transition-all duration-300">
      <div
        className={`max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${containerSpacing}`}
      >
        <div
          className={`flex flex-col items-center sm:flex-row sm:items-center sm:justify-center sm:gap-6 lg:gap-10 transition-all duration-300 ${contentSpacing}`}
        >
          <div
            className={`w-[288px] origin-top transform transition-transform duration-300 ${logoScale} [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]`}
          >
            <LogoIcon />
          </div>
          <div
            className={`w-full flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-center transition-all duration-300 ${
              isCompact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-4'
            } sm:max-w-3xl`}
          >
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="리조트 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full pl-10 pr-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300 ${inputSizing}`}
              />
            </div>
            {isImageEditFeatureAvailable && (
              <button
                type="button"
                onClick={onToggleImageEditMode}
                aria-pressed={isImageEditMode}
                className={`flex items-center justify-between rounded-lg font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
                  isImageEditMode
                    ? 'bg-white/90 text-cyan-700'
                    : 'bg-white/30 text-white hover:bg-white/40'
                } ${buttonSizing}`}
              >
                <span className="flex items-center gap-2">
                  <EditIcon />
                  이미지 편집 모드
                </span>
                <span
                  className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                    isImageEditMode ? 'bg-emerald-500 text-emerald-950' : 'bg-white/60 text-cyan-700'
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
