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
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-grow w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2 sm:mb-0">비교할 리조트 ({resorts.length}/3)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
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
          </div>
          <div className="flex-shrink-0 flex items-center gap-3 w-full sm:w-auto">
            <button onClick={onClear} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 flex-1 sm:flex-none">
              전체삭제
            </button>
            <button 
              onClick={onCompare} 
              className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex-1 sm:flex-none"
              disabled={resorts.length < 2}
            >
              {resorts.length < 2 ? `${resorts.length}/2개 선택됨` : `비교하기 (${resorts.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareTray;
