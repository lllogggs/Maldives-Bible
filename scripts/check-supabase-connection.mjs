#!/usr/bin/env node
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

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
