import React from 'react';

type View = 'resorts' | 'tips' | 'agencies' | 'flights';

interface NavBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const activeClasses = 'border-teal-600 text-slate-950';
  const inactiveClasses = 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900';
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-sm border-b-2 px-0.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f8f7] sm:px-1 sm:text-base ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

const NavBar: React.FC<NavBarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="mb-6 overflow-x-auto border-b border-slate-200" aria-label="몰디브 바이블 섹션">
      <div className="flex min-w-max gap-1 sm:gap-8">
        <NavButton
          label="선택 기준"
          isActive={currentView === 'tips'}
          onClick={() => onViewChange('tips')}
        />
        <NavButton
          label="리조트"
          isActive={currentView === 'resorts'}
          onClick={() => onViewChange('resorts')}
        />
        <NavButton
          label="견적 문의"
          isActive={currentView === 'agencies'}
          onClick={() => onViewChange('agencies')}
        />
        <NavButton
          label="항공 일정"
          isActive={currentView === 'flights'}
          onClick={() => onViewChange('flights')}
        />
      </div>
    </nav>
  );
};

export default NavBar;
