import React from 'react';
import { LogoIcon, SearchIcon } from './icons/Icons';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-6">
        <div className="w-48 [filter:drop-shadow(0_4px_4px_rgba(0,0,0,0.25))]">
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
    </header>
  );
};

export default Header;