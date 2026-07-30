
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';
import { initializeAnalytics } from './utils/analytics';

const AdminAnalyticsApp = React.lazy(() => import('./components/admin/AdminAnalyticsApp'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (rootElement.dataset.staticPage !== 'true') {
  const root = ReactDOM.createRoot(rootElement);
  const isAnalyticsAdmin = window.location.pathname.startsWith('/admin/analytics');

  if (!isAnalyticsAdmin) initializeAnalytics();

  root.render(
    <React.StrictMode>
      {isAnalyticsAdmin ? (
        <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-bold text-white">분석실을 불러오는 중…</div>}>
          <AdminAnalyticsApp />
        </React.Suspense>
      ) : (
        <App />
      )}
    </React.StrictMode>
  );
}
