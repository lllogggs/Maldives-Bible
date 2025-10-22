import React from 'react';
import type { Resort } from '../types';
import { XIcon } from './icons/Icons';

interface CompareTrayProps {
  resorts: Resort[];
  onRemove: (resortId: number) => void;
  onClear: () => void;
  onCompare: () => void;
}

const CompareTray: React.FC<CompareTrayProps> = ({ resorts, onRemove, onClear, onCompare }) => {
  if (resorts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-40 animate-fade-in">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="hidden sm:block text-lg font-bold text-gray-800 mb-2">비교할 리조트 ({resorts.length}/3)</h3>
            <div className="sm:hidden text-sm font-bold text-gray-800 mb-1">비교하기 ({resorts.length}/3)</div>
            
            <div className="hidden sm:grid sm:grid-cols-3 gap-3">
              {resorts.map(resort => (
                <div key={resort.id} className="bg-gray-100 rounded-lg p-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700 truncate pr-2">{resort.name}</span>
                  <button onClick={() => onRemove(resort.id)} className="p-1 rounded-full hover:bg-gray-300 text-gray-500 hover:text-gray-800 transition-colors" aria-label={`Remove ${resort.name}`}>
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 3 - resorts.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="bg-gray-100/50 rounded-lg p-2 flex items-center justify-center text-sm border-2 border-dashed border-gray-300 h-[40px]">
                  <span className="text-gray-400">리조트 추가...</span>
                </div>
              ))}
            </div>

            <div className="sm:hidden flex items-center gap-2 overflow-x-auto pb-1">
               {resorts.map(resort => (
                <div key={resort.id} className="bg-gray-200 rounded-full pl-3 pr-2 py-1 flex items-center gap-1 text-sm flex-shrink-0">
                  <span className="font-medium text-gray-800 truncate">{resort.name}</span>
                  <button onClick={() => onRemove(resort.id)} className="p-0.5 rounded-full bg-gray-400/50 hover:bg-gray-400/80 text-white flex-shrink-0">
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {resorts.length === 0 && <div className="text-gray-400 text-sm flex-shrink-0 px-2">리조트를 추가하세요...</div>}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <button onClick={onClear} className="p-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-200">
              전체삭제
            </button>
            <button 
              onClick={onCompare} 
              className="px-3 py-2 sm:px-6 sm:py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 text-xs sm:text-base"
              disabled={resorts.length < 2}
            >
              {resorts.length < 2 ? `선택 (${resorts.length}/2)` : `비교 (${resorts.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareTray;
