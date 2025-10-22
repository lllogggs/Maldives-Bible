
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // AI Studio/로컬 개발 환경에서는 base를 '/'로, Github Pages 배포 시에는 '/Maldives-Bible/'로 설정
    const base = mode === 'production' ? '/Maldives-Bible/' : '/';

    return {
      base: base,
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