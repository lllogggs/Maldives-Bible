
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    if (!('VITE_GOOGLE_SITE_VERIFICATION' in env)) {
      env.VITE_GOOGLE_SITE_VERIFICATION = '';
      process.env.VITE_GOOGLE_SITE_VERIFICATION = '';
    }

    // 커스텀 도메인 환경에서도 동일한 경로를 사용하기 위해 base는 항상 '/'로 고정합니다.

    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: Replaced __dirname with './' to resolve the "Cannot find name '__dirname'" error.
          '@': path.resolve('./'),
        }
      }
    };
});
