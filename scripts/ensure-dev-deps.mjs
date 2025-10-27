import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const pathExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const run = async () => {
  const hasViteBinary = await pathExists('node_modules/.bin/vite');
  const hasVitePackage = await pathExists('node_modules/vite/package.json');

  if (hasViteBinary || hasVitePackage) {
    console.log('Vite가 이미 설치되어 있습니다. devDependencies 설치를 건너뜁니다.');
    return;
  }

  console.log('Vite 실행 파일을 찾을 수 없습니다. devDependencies를 설치합니다...');

  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['install', '--include=dev'], {
      stdio: 'inherit',
      shell: false,
      env: { ...process.env, npm_config_include: 'dev' },
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install이 종료 코드 ${code}(으)로 실패했습니다.`));
      }
    });
  });
};

try {
  await run();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
