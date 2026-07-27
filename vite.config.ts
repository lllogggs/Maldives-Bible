
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const verificationToken = loadEnv(mode, '.', '').VITE_GOOGLE_SITE_VERIFICATION?.trim();

    if (verificationToken && !/^[A-Za-z0-9_-]+$/.test(verificationToken)) {
      throw new Error('VITE_GOOGLE_SITE_VERIFICATION 값의 형식이 올바르지 않습니다.');
    }

    // 커스텀 도메인 환경에서도 동일한 경로를 사용하기 위해 base는 항상 '/'로 고정합니다.

    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'google-site-verification',
          transformIndexHtml(html: string) {
            if (!verificationToken) return html;
            return html.replace(
              '</head>',
              `  <meta name="google-site-verification" content="${verificationToken}" />\n</head>`
            );
          },
        },
      ],
      resolve: {
        alias: {
          // FIX: Replaced __dirname with './' to resolve the "Cannot find name '__dirname'" error.
          '@': path.resolve('./'),
        }
      }
    };
});
