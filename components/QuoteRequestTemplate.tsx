import React, { useMemo, useState } from 'react';
import { CheckCircleIcon } from './icons/Icons';
import { trackEvent } from '../utils/analytics';

const getInitialCandidates = () => {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('resorts')?.slice(0, 240) ?? '';
};

const copyToClipboard = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the selection-based copy fallback.
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
};

const fieldClassName = 'mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/[0.03] focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10';

const QuoteRequestTemplate: React.FC = () => {
  const [travelDate, setTravelDate] = useState('');
  const [nights, setNights] = useState('4');
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [roomType, setRoomType] = useState('워터빌라');
  const [mealPlan, setMealPlan] = useState('올인클루시브');
  const [candidates, setCandidates] = useState(getInitialCandidates);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const requestText = useMemo(() => [
    '안녕하세요. 아래와 같은 조건으로 견적을 부탁드립니다.',
    '',
    '●몰디브바이블 추천 양식',
    `- 출발 예정일: ${travelDate || '미정'}`,
    `- 숙박: ${nights || '4'}박`,
    `- 인원: 성인 ${adults || '2'}명${Number(children) > 0 ? `, 아동 ${children}명` : ''}`,
    `- 객실: ${roomType}`,
    `- 식사: ${mealPlan}`,
    `- 후보 리조트: ${candidates.trim() || '추천 요청'}`,
    '',
    '세금, 공항 이동비, 포함 특전, 취소 조건까지 포함해서 총액으로 안내 부탁드립니다!',
  ].join('\n'), [adults, candidates, children, mealPlan, nights, roomType, travelDate]);

  const handleCopy = async () => {
    const copied = await copyToClipboard(requestText);
    setCopyStatus(copied ? 'copied' : 'failed');
    trackEvent(copied ? 'quote_template_copy' : 'quote_template_copy_error', {
      travel_date_entered: Boolean(travelDate),
      candidate_resorts_entered: Boolean(candidates.trim()),
      nights: Number(nights) || 0,
      adults: Number(adults) || 0,
      children: Number(children) || 0,
    });
  };

  return (
    <section className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-6" aria-labelledby="quote-template-title">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-teal-700">Quote checklist</p>
        <h2 id="quote-template-title" className="font-brand-heading mt-1 text-xl text-slate-950">
          같은 조건의 견적 요청문 만들기
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          조건을 한 번만 입력하고 요청문을 복사해 2~3곳에 동일하게 보내세요.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">
          출발 예정일
          <input type="date" value={travelDate} onInput={event => setTravelDate(event.currentTarget.value)} className={fieldClassName} />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          숙박일수
          <select value={nights} onChange={event => setNights(event.target.value)} className={fieldClassName}>
            {[3, 4, 5, 6, 7].map(value => <option key={value} value={value}>{value}박</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm font-semibold text-slate-700">
            성인
            <select value={adults} onChange={event => setAdults(event.target.value)} className={fieldClassName}>
              {[1, 2, 3, 4, 5, 6].map(value => <option key={value} value={value}>{value}명</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            아동
            <select value={children} onChange={event => setChildren(event.target.value)} className={fieldClassName}>
              {[0, 1, 2, 3, 4].map(value => <option key={value} value={value}>{value}명</option>)}
            </select>
          </label>
        </div>
        <label className="text-sm font-semibold text-slate-700">
          객실 유형
          <select value={roomType} onChange={event => setRoomType(event.target.value)} className={fieldClassName}>
            <option>워터빌라</option>
            <option>비치빌라</option>
            <option>워터빌라 + 비치빌라</option>
            <option>추천 요청</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          식사 플랜
          <select value={mealPlan} onChange={event => setMealPlan(event.target.value)} className={fieldClassName}>
            <option>올인클루시브</option>
            <option>풀보드</option>
            <option>하프보드</option>
            <option>조식</option>
            <option>추천 요청</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-1">
          후보 리조트
          <input
            type="text"
            value={candidates}
            onChange={event => setCandidates(event.target.value.slice(0, 240))}
            placeholder="예: 쿠다 빌링길리, 아야다"
            className={fieldClassName}
          />
        </label>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{requestText}</pre>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/30 sm:w-auto"
        >
          {copyStatus === 'copied' && <CheckCircleIcon className="h-5 w-5" />}
          {copyStatus === 'copied' ? '요청문 복사 완료' : '견적 요청문 복사'}
        </button>
        <p className={`text-sm ${copyStatus === 'failed' ? 'text-red-700' : 'text-slate-500'}`} role="status" aria-live="polite">
          {copyStatus === 'copied' && '이제 아래 여행사 2~3곳에 같은 내용을 보내세요.'}
          {copyStatus === 'failed' && '자동 복사가 되지 않았습니다. 요청문을 길게 눌러 복사해 주세요.'}
        </p>
      </div>
    </section>
  );
};

export default QuoteRequestTemplate;
