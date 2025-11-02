import { copyFile } from 'fs/promises';
import { resolve } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const source = resolve(distDir, 'index.html');
const target = resolve(distDir, '404.html');

try {
  await copyFile(source, target);
  console.log('Copied dist/index.html to dist/404.html for SPA fallback.');
} catch (error) {
  console.error('Failed to create SPA fallback 404.html', error);
  process.exitCode = 1;
}
