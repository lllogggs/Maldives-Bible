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
  const beginnerGuides = [
    {
      href: '/몰디브-신혼여행-처음-준비/',
      label: '몰디브 신혼여행 처음 준비',
    },
    {
      href: '/몰디브-리조트-선택-기준/',
      label: '몰디브 리조트 선택 기준',
    },
    {
      href: '/몰디브-신혼여행-비용-감잡기/',
      label: '몰디브 신혼여행 비용 감잡기',
    },
    {
      href: '/몰디브-신혼여행-일정-4박6일-5박7일/',
      label: '4박 6일·5박 7일 일정',
    },
    {
      href: '/몰디브-리조트-이동수단-차이/',
      label: '보트·수상비행기·국내선 차이',
    },
    {
      href: '/몰디브-워터빌라-비치빌라-차이/',
      label: '워터빌라·비치빌라 차이',
    },
    {
      href: '/몰디브-하프보드-풀보드-올인클루시브-차이/',
      label: '식사플랜 차이',
    },
  ];

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
    className="mb-5 rounded-lg border border-teal-100 bg-white p-5 shadow-sm shadow-slate-900/5"
    aria-labelledby="honeymoon-starter-title"
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
          몰디브 신혼여행 리조트 찾기
        </p>
        <h2 id="honeymoon-starter-title" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
          몰디브 신혼여행, 리조트 이름보다 기준부터 잡으세요
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          이제 막 알아보기 시작했다면 예산, 일정, 이동수단, 객실타입, 식사플랜을 먼저 이해하는 편이 좋습니다.
          기준을 잡은 뒤 워터빌라, 보트 이동, 스노클링 같은 취향으로 후보를 좁혀보세요.
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
        <article key={preset.id} className="flex min-h-[12rem] flex-col rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-teal-200 hover:bg-white">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{preset.label}</p>
          <h2 className="mt-2 text-base font-bold text-slate-950">{preset.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-5 text-slate-600">{preset.description}</p>
          <p className="mt-3 text-xs font-semibold text-teal-700">{preset.resultHint}</p>
          <button
            type="button"
            onClick={() => onApplyPreset(preset)}
            className="mt-3 min-h-10 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            이 조건으로 보기
          </button>
        </article>
      ))}
    </div>

    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-teal-200 bg-teal-50/50 px-4 py-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <p>
        아직 예산이 애매하면 처음 준비 가이드를 먼저 보고, 이동수단과 객실 타입만 골라 후보를 천천히 줄여보세요.
      </p>
      <button
        type="button"
        onClick={onOpenFilter}
        className="min-h-10 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 lg:hidden"
      >
        필터 열기
      </button>
    </div>

    <div className="mt-4 border-t border-slate-200 pt-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        처음 준비 가이드
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {beginnerGuides.map((guide) => (
          <a
            key={guide.href}
            href={guide.href}
            className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100"
          >
            {guide.label}
          </a>
        ))}
      </div>
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
