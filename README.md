<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/13AT_mh8BY8Loo3i_7IIIqVl7VMRfJMPt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase 연결 점검

배포 전에 선호 데이터 API가 올바른 Supabase 프로젝트와 통신하는지 확인하려면 아래 명령을 실행하세요.

```bash
SUPABASE_URL="https://<프로젝트 ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<서비스 롤 키>" \
npm run check:supabase
```

환경 변수가 올바르게 설정되어 있다면 스크립트가 `resort_preferences` 테이블에서 지정된 `profile_id` 행을 조회하고 결과를 출력합니다. 오류 메시지가 표시되면 서비스 키 또는 RLS 정책을 다시 확인하세요.
