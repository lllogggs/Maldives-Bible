#!/usr/bin/env node
import process from 'node:process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

let createClient;
try {
  ({ createClient } = await import('@supabase/supabase-js'));
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND' || error?.code === 'MODULE_NOT_FOUND') {
    console.error('❌ @supabase/supabase-js 패키지를 찾을 수 없습니다.');
    console.error('   먼저 `npm install` 또는 `npm install @supabase/supabase-js`를 실행해 의존성을 설치해 주세요.');
    process.exit(1);
  }

  throw error;
}

const ENV_FILES = ['.env.local', '.env'];
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const loadedEnvReport = [];

function assignEnv(key, value, collectedKeys) {
  if (process.env[key] != null) {
    return;
  }

  process.env[key] = value;
  collectedKeys.add(key);
}

function normaliseValue(rawValue) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return '';
  }

  const firstChar = trimmed[0];
  const lastChar = trimmed.at(-1);

  if ((firstChar === '"' && lastChar === '"') || (firstChar === "'" && lastChar === "'")) {
    return trimmed.slice(1, -1);
  }

  const commentIndex = trimmed.indexOf(' #');
  if (commentIndex !== -1) {
    return trimmed.slice(0, commentIndex).trim();
  }

  return trimmed;
}

function loadEnvFile(fileName) {
  const candidatePaths = new Set([
    resolve(process.cwd(), fileName),
    resolve(SCRIPT_DIR, '..', fileName),
  ]);

  for (const filePath of candidatePaths) {
    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const file = readFileSync(filePath, 'utf8');
      const collectedKeys = new Set();

      for (const line of file.split(/\r?\n/)) {
        if (!line || /^\s*#/.test(line)) {
          continue;
        }

        const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)\s*$/);

        if (!match) {
          continue;
        }

        const [, key, rawValue] = match;
        const value = normaliseValue(rawValue ?? '');
        assignEnv(key, value, collectedKeys);
      }

      if (collectedKeys.size > 0) {
        const relativePath = relative(process.cwd(), filePath) || filePath;
        loadedEnvReport.push({
          filePath: relativePath,
          keys: [...collectedKeys].sort(),
        });
      }
    } catch (error) {
      console.warn(`⚠️  ${fileName} 파일을 읽는 중 문제가 발생했습니다:`, error.message);
    }
  }
}

for (const file of ENV_FILES) {
  loadEnvFile(file);
}

if (loadedEnvReport.length > 0) {
  console.log('ℹ️  다음 파일에서 환경 변수를 불러왔습니다:');
  for (const { filePath, keys } of loadedEnvReport) {
    console.log(`   - ${filePath}: ${keys.join(', ')}`);
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = process.env.RESORT_PREFERENCES_TABLE ?? 'resort_preferences';
const profileId = process.env.RESORT_PREFERENCES_PROFILE_ID ?? 'public';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되어 있지 않습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

console.log('🔍 Supabase 연결 상태를 확인합니다...');
console.log(`- URL: ${supabaseUrl}`);
console.log(`- 테이블: ${tableName}`);
console.log(`- 프로필 ID: ${profileId}`);

try {
  const { data, error } = await supabase
    .from(tableName)
    .select('profile_id, hidden_ids, custom_order')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    console.error('❌ Supabase 요청이 실패했습니다.');
    console.error(`code: ${error.code ?? 'unknown'}`);
    console.error(`message: ${error.message ?? 'unknown'}`);
    console.error(`details: ${error.details ?? 'none'}`);
    process.exit(1);
  }

  console.log('✅ Supabase에서 선호 데이터를 성공적으로 조회했습니다.');
  console.log(JSON.stringify(data ?? null, null, 2));
} catch (error) {
  console.error('❌ 예기치 못한 오류가 발생했습니다.');
  console.error(error);
  process.exit(1);
}
