import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

interface AnalyticsLoginProps {
  configured: boolean;
  onLogin: (password: string) => Promise<void>;
}

const AnalyticsLogin: React.FC<AnalyticsLoginProps> = ({ configured, onLogin }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured || !password || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      await onLogin(password);
      setPassword('');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '로그인하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(20,184,166,.22),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(14,116,144,.24),transparent_36%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-56 w-56 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute bottom-[8%] right-[6%] h-80 w-80 rounded-full border border-teal-300/10" />

      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl shadow-black/30">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#f8fafc,#ecfeff)] px-7 py-7 sm:px-9">
          <div className="flex items-center gap-3">
            <img src="/brand/maldives-bible-logo.png" alt="" className="h-11 w-11 rounded-xl object-cover shadow-sm" />
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-700">Owner analytics</p>
              <h1 className="mt-1 font-brand-heading text-2xl text-slate-950">몰디브 바이블 분석실</h1>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            유입부터 여행사 연결까지, 운영자만 확인할 수 있는 비공개 대시보드입니다.
          </p>
        </div>

        {configured ? (
          <form className="px-7 py-7 sm:px-9 sm:py-8" onSubmit={handleSubmit}>
            <label htmlFor="analytics-admin-password" className="text-sm font-extrabold text-slate-800">
              관리자 비밀번호
            </label>
            <div className="relative mt-2.5">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="analytics-admin-password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="current-password"
                autoFocus
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                placeholder="비밀번호 입력"
              />
            </div>
            {error ? (
              <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!password || isSubmitting}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-extrabold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? '확인 중…' : '분석실 들어가기'}
            </button>
            <div className="mt-5 flex items-start gap-2.5 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
              비밀번호는 브라우저에 저장하지 않으며, 로그인 세션은 보안 쿠키로만 유지됩니다.
            </div>
          </form>
        ) : (
          <div className="px-7 py-7 sm:px-9 sm:py-8">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-extrabold text-amber-900">관리자 비밀번호 설정이 필요합니다</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Vercel 환경변수에 아래 값을 12자 이상으로 등록한 뒤 다시 배포해 주세요.
              </p>
              <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2.5 text-xs font-bold text-teal-200">
                ANALYTICS_ADMIN_PASSWORD
              </code>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default AnalyticsLogin;
