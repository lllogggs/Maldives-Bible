import React from 'react';
import { maldivesGlossaryCategories } from '../data/maldives-glossary.mjs';
import { ChevronDownIcon } from './icons/Icons';

const SiteFooter: React.FC = () => (
  <footer className="mx-auto max-w-[1440px] px-4 pb-5 sm:px-6 lg:px-8">
    <section
      className="border-t border-slate-200 pt-6"
      aria-labelledby="maldives-glossary-title"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
            Maldives glossary
          </p>
          <h2 id="maldives-glossary-title" className="font-brand-heading mt-1 text-lg text-slate-950">
            몰디브 관련 용어
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            처음 알아볼 때 자주 만나는 표현을 분야별로 모았어요. 눌러서 뜻을 확인하세요.
          </p>
        </div>
        <a
          href="/maldives-glossary/"
          className="w-fit shrink-0 text-xs font-bold text-teal-700 underline decoration-teal-200 underline-offset-4 hover:text-teal-900"
        >
          43개 용어 전체 보기
        </a>
      </div>

      <div className="mt-4 grid items-start gap-2 md:grid-cols-2 xl:grid-cols-3">
        {maldivesGlossaryCategories.map(category => (
          <details
            key={category.id}
            data-glossary-category={category.id}
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <strong className="block text-sm font-black text-slate-950">{category.title}</strong>
                <span className="mt-0.5 block truncate text-[11px] text-slate-500">{category.preview}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-teal-700">
                {category.terms.length}개
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                />
              </span>
            </summary>

            <div className="border-t border-slate-100">
              <dl className="divide-y divide-slate-100">
                {category.terms.map(term => (
                  <div key={`${category.id}-${term.name}`} className="px-3 py-2.5">
                    <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <strong className="text-xs font-black text-teal-800">{term.name}</strong>
                      <span className="text-[11px] font-bold text-slate-700">{term.english}</span>
                    </dt>
                    <dd className="mt-1 text-xs leading-5 text-slate-600">{term.description}</dd>
                  </div>
                ))}
              </dl>
              <p className="border-t border-teal-100 bg-teal-50/50 px-3 py-2 text-[11px] leading-5 text-slate-600">
                {category.note}
              </p>
              <a
                href={category.href}
                className="block border-t border-slate-100 px-3 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-50 hover:text-teal-900"
              >
                {category.linkLabel} →
              </a>
            </div>
          </details>
        ))}
      </div>
    </section>

    <nav aria-label="사이트 정보" className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 pt-5 text-xs font-bold">
      <a href="/maldives-resorts/" className="text-teal-700 hover:text-teal-900">전체 리조트 목록</a>
      <a href="/maldives-glossary/" className="text-teal-700 hover:text-teal-900">몰디브 용어집</a>
      <a href="/about/" className="text-teal-700 hover:text-teal-900">소개·편집 기준</a>
    </nav>

    <p className="mt-4 text-xs leading-5 text-slate-500">
      가격은 4박·성인 2인 올인클루시브 기준의 비교용 참고가입니다. 항공권과 리조트 이동비는 별도이며,
      시즌·세금·환율에 따라 실제 견적이 달라질 수 있습니다. 예약 전 공식 홈페이지와 여행사 견적을 확인해 주세요.
    </p>
  </footer>
);

export default SiteFooter;
