import React from 'react';
import type { Filters, SortOption } from '../types';

export type HoneymoonPreset = {
  id: string;
  label: string;
  title: string;
  description: string;
  resultHint: string;
  filters: Partial<Filters>;
  sortOption: SortOption;
};

interface HoneymoonStarterProps {
  presets: HoneymoonPreset[];
  totalAllResortsCount: number;
  totalResortsCount: number;
  onApplyPreset: (preset: HoneymoonPreset) => void;
  onOpenFilter: () => void;
}

const HoneymoonStarter: React.FC<HoneymoonStarterProps> = ({
  presets,
  totalAllResortsCount,
  totalResortsCount,
  onApplyPreset,
  onOpenFilter,
}) => {
  const nicheGuides = [
    {
      href: '/몰디브-신혼여행-워터빌라-개인풀/',
      label: '몰디브 신혼여행 워터빌라 개인풀',
    },
    {
      href: '/몰디브-보트-이동-리조트/',
      label: '몰디브 보트 이동 리조트',
    },
    {
      href: '/몰디브-수상비행기-리조트/',
      label: '몰디브 수상비행기 리조트',
    },
    {
      href: '/몰디브-스노클링-좋은-리조트/',
      label: '몰디브 스노클링 좋은 리조트',
    },
    {
      href: '/몰디브-올인클루시브-신혼여행/',
      label: '몰디브 올인클루시브 신혼여행',
    },
  ];

  return (
  <section
    className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5"
    aria-labelledby="honeymoon-starter-title"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
          몰디브 신혼여행 리조트 찾기
        </p>
        <h2 id="honeymoon-starter-title" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
          몰디브 신혼여행 리조트, 먼저 네 가지 기준으로 좁히세요
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          처음 준비하는 커플은 후보가 너무 많아지는 순간부터 지칩니다. 예산, 이동 피로도, 워터빌라 로망,
          스노클링 취향 중 지금 제일 중요한 기준을 먼저 고르면 비교할 리조트가 빠르게 줄어듭니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap sm:justify-end">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="block text-xs font-semibold text-slate-500">전체 데이터</span>
          <span className="text-lg font-extrabold text-slate-950">{totalAllResortsCount.toLocaleString()}곳</span>
        </div>
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
          <span className="block text-xs font-semibold text-teal-700">현재 후보</span>
          <span className="text-lg font-extrabold text-teal-800">{totalResortsCount.toLocaleString()}곳</span>
        </div>
      </div>
    </div>

    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {presets.map((preset) => (
        <article key={preset.id} className="flex min-h-[12rem] flex-col rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{preset.label}</p>
          <h2 className="mt-2 text-base font-bold text-slate-950">{preset.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-5 text-slate-600">{preset.description}</p>
          <p className="mt-3 text-xs font-semibold text-teal-700">{preset.resultHint}</p>
          <button
            type="button"
            onClick={() => onApplyPreset(preset)}
            className="mt-3 min-h-10 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            이 조건으로 보기
          </button>
        </article>
      ))}
    </div>

    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        예산이 아직 애매하면 먼저 이동수단과 객실 타입만 고른 뒤, 마음에 드는 리조트 2-3곳을 비교함에 담아보세요.
      </p>
      <button
        type="button"
        onClick={onOpenFilter}
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
      >
        필터 열기
      </button>
    </div>

    <div className="mt-4 border-t border-slate-200 pt-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        목적별 리조트 가이드
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {nicheGuides.map((guide) => (
          <a
            key={guide.href}
            href={guide.href}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
          >
            {guide.label}
          </a>
        ))}
      </div>
    </div>
  </section>
  );
};

export default HoneymoonStarter;
