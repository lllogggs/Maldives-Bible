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
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-fade-in bg-white/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.1)] backdrop-blur-md">
      <div className="mx-auto max-w-screen-xl px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="hidden sm:block text-lg font-bold text-gray-800 mb-2">비교 리조트 ({resorts.length}/3)</h3>
            <div className="mb-1.5 text-sm font-bold text-gray-800 sm:hidden">비교 ({resorts.length}/3)</div>
            
            <div className="hidden sm:grid sm:grid-cols-3 gap-3">
              {resorts.map(resort => (
                <div key={resort.id} className="bg-gray-100 rounded-lg p-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700 truncate pr-2">{resort.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(resort.id)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-300 hover:text-gray-800"
                    aria-label={`${resort.name} 비교에서 제거`}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 3 - resorts.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="flex h-11 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100/50 p-2 text-sm">
                  <span className="text-gray-400">추가 선택</span>
                </div>
              ))}
            </div>

            <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:hidden">
               {resorts.map(resort => (
                <div key={resort.id} className="flex min-w-[118px] max-w-[154px] flex-1 items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-sm ring-1 ring-gray-200">
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-800">{resort.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(resort.id)}
                    className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
                    aria-label={`${resort.name} 비교에서 제거`}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {resorts.length === 0 && <div className="text-gray-400 text-sm flex-shrink-0 px-2">리조트 선택</div>}
            </div>
          </div>

          <div className="grid w-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 sm:flex sm:w-auto sm:flex-shrink-0 sm:items-center">
            <button type="button" onClick={onClear} className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:px-4">
              비우기
            </button>
            <button
              type="button"
              onClick={onCompare}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-teal-700 px-3 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 sm:h-12 sm:px-6 sm:text-base"
              disabled={resorts.length < 2}
            >
              {resorts.length < 2 ? '2개 이상 선택' : `비교 (${resorts.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareTray;
