import React from 'react';

const mealPlans = [
  {
    abbreviation: 'BB',
    english: 'Bed & Breakfast',
    korean: '베드 앤 브렉퍼스트',
    inclusion: '일반적으로 조식 포함',
  },
  {
    abbreviation: 'HB',
    english: 'Half Board',
    korean: '하프보드',
    inclusion: '보통 조식 + 석식',
  },
  {
    abbreviation: 'FB',
    english: 'Full Board',
    korean: '풀보드',
    inclusion: '보통 조식 + 중식 + 석식',
  },
  {
    abbreviation: 'AI',
    english: 'All Inclusive',
    korean: '올인클루시브',
    inclusion: '식사 + 음료 중심',
  },
] as const;

const SiteFooter: React.FC = () => (
  <footer className="mx-auto max-w-[1440px] px-4 pb-5 sm:px-6 lg:px-8">
    <section
      className="border-t border-slate-200 pt-6"
      aria-labelledby="meal-plan-glossary-title"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
            Meal plan glossary
          </p>
          <h2 id="meal-plan-glossary-title" className="font-brand-heading mt-1 text-lg text-slate-950">
            몰디브 식사 플랜 용어
          </h2>
        </div>
        <a
          href="/maldives-meal-plan-comparison/"
          className="w-fit text-xs font-bold text-teal-700 underline decoration-teal-200 underline-offset-4 hover:text-teal-900"
        >
          식사 플랜 차이 자세히 보기
        </a>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {mealPlans.map(plan => (
          <div key={plan.abbreviation} className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm shadow-slate-900/[0.03]">
            <dt className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <strong className="text-sm font-black text-teal-800">{plan.abbreviation}</strong>
              <span className="text-xs font-bold text-slate-900">{plan.english}</span>
            </dt>
            <dd className="mt-1 text-xs leading-5 text-slate-600">
              {plan.korean} · {plan.inclusion}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        같은 이름의 식사 플랜도 리조트마다 음료, 미니바, 레스토랑과 액티비티 포함 범위가 다를 수 있습니다.
      </p>
    </section>

    <p className="mt-5 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
      가격은 4박·성인 2인 올인클루시브 기준의 비교용 참고가입니다. 항공권과 리조트 이동비는 별도이며,
      시즌·세금·환율에 따라 실제 견적이 달라질 수 있습니다. 예약 전 공식 홈페이지와 여행사 견적을 확인해 주세요.
    </p>
  </footer>
);

export default SiteFooter;
