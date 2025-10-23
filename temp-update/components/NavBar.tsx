import React from 'react';

type View = 'resorts' | 'agencies';

interface NavBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const activeClasses = 'border-cyan-500 text-cyan-600';
  const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300';
  
  return (
    <button
      onClick={onClick}
      className={`py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

const NavBar: React.FC<NavBarProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="mb-8 border-b border-gray-200">
      <div className="flex space-x-4 sm:space-x-8">
        <NavButton
          label="리조트 목록"
          isActive={currentView === 'resorts'}
          onClick={() => onViewChange('resorts')}
        />
        <NavButton
          label="한국 여행사"
          isActive={currentView === 'agencies'}
          onClick={() => onViewChange('agencies')}
        />
      </div>
    </div>
  );
};

export default NavBar;
