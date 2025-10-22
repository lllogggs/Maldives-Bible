import React from 'react';
import { LogoIcon, SearchIcon } from './icons/Icons';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, isEditMode, onToggleEditMode }) => {
  return (
    <header className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-end">
          <label htmlFor="edit-mode-toggle" className="flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-white/90">이미지 수정 모드</span>
            <div className="relative">
              <input
                type="checkbox"
                id="edit-mode-toggle"
                className="sr-only peer"
                checked={isEditMode}
                onChange={onToggleEditMode}
              />
              <div className="block bg-black/30 w-12 h-6 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
            </div>
          </label>
        </div>
        <div className="py-3 flex flex-col items-center gap-3">
          <div className="w-[288px] [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]">
            <LogoIcon />
          </div>
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
        </div>
      </div>
    </header>
  );
};

export default Header;