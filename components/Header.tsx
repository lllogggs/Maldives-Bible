import React from 'react';
import { LogoIcon, SearchIcon, EditIcon } from './icons/Icons';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isImageEditMode: boolean;
  onToggleImageEditMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, isImageEditMode, onToggleImageEditMode }) => {
  return (
    <header className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="py-3 flex flex-col items-center gap-3">
          <div className="w-[288px] [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]">
            <LogoIcon />
          </div>
          <div className="w-full flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="리조트 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="button"
              onClick={onToggleImageEditMode}
              aria-pressed={isImageEditMode}
              className={`flex items-center justify-between gap-3 rounded-lg px-4 py-2 font-semibold shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                isImageEditMode ? 'bg-white/90 text-cyan-700' : 'bg-white/30 text-white hover:bg-white/40'
              }`}
            >
              <span className="flex items-center gap-2 text-sm">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
