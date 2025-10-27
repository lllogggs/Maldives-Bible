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

> ℹ️ 스크립트는 실행 시 프로젝트 루트의 `.env.local`, `.env` 파일을 자동으로 읽어 환경 변수를 채웁니다. 어떤 파일에서 키를 가져왔는지는 실행 로그에 `- .env.local: SUPABASE_URL, ...` 형태로 표시됩니다. 쉘에서 값을 직접 넘기지 않아도 되지만, 파일과 현재 셸 둘 중 하나에라도 값이 누락되어 있으면 경고가 표시됩니다.

환경 변수가 올바르게 설정되어 있다면 스크립트가 `resort_preferences` 테이블에서 지정된 `profile_id` 행을 조회하고 결과를 출력합니다. 오류 메시지가 표시되면 서비스 키 또는 RLS 정책을 다시 확인하세요.

## Supabase 구성 절차 요약

다음 순서대로 설정하면 Vercel 서버리스 함수와 Supabase가 정상적으로 통신합니다.

1. **테이블 생성**
   - Supabase Table Editor에서 `resort_preferences` 테이블을 만든 뒤 아래 타입으로 컬럼을 추가합니다.
     | Column | Type    | 비고 |
     | ------ | ------- | ---- |
     | `profile_id` | `text` | Primary Key |
     | `hidden_ids` | `int4[]` | 배열 토글 사용 |
     | `custom_order` | `int4[]` | 배열 토글 사용 |
     | `deleted_image_urls` | `text[]` | 배열 토글 사용 |
   - `Insert` → `profile_id = public` 행을 추가합니다. 배열 컬럼은 입력칸 우측 `[…]` 버튼을 눌러 Array Editor에서 값을 한 항목씩 추가하면 됩니다.

2. **Supabase 자격 증명 확인**
   - Supabase 대시보드의 **Settings → API**에서 `Project URL`과 `service_role` 키를 복사합니다.
   - `SUPABASE_URL`에는 `https://<project-ref>.supabase.co` 형식의 URL을, `SUPABASE_SERVICE_ROLE_KEY`에는 서비스 롤 키를 사용합니다.

3. **Vercel 환경 변수 등록**
   1. Vercel 대시보드에서 프로젝트를 연 뒤 왼쪽 사이드바의 **Settings → Environment Variables**를 클릭합니다. (질문에 첨부한 화면처럼 **Settings → Environments** 페이지가 열린 상태라면, 같은 사이드바에서 한 칸 아래에 있는 **Environment Variables** 메뉴로 이동해야 합니다.)
   2. 화면 오른쪽에 보이는 **Add Environment Variable** 버튼을 눌러 `Name`, `Value`, `Environment` 입력란이 있는 폼을 연 뒤, 각 란에 아래 값을 하나씩 입력합니다. (버튼을 누르면 스크린샷처럼 페이지 중간에 입력 행이 추가됩니다.)
      - **Key**: `SUPABASE_URL` → **Value**: Supabase `Project URL` (`https://<project-ref>.supabase.co`).
      - **Key**: `SUPABASE_SERVICE_ROLE_KEY` → **Value**: Supabase `service_role` 키.
      - **Key**: `RESORT_PREFERENCES_PROFILE_ID` → **Value**: `public` (또는 원하는 프로필 ID, 기본값을 쓴다면 생략 가능).
      - **Key**: `RESORT_PREFERENCES_ALLOWED_ORIGINS` → **Value**: 프런트엔드가 접근하는 도메인(`https://<your-domain>.vercel.app` 등). 여러 도메인을 허용하려면 콤마로 구분합니다.
        - 이 값은 Vercel 프로젝트의 **Settings → Domains**(또는 **Overview** 카드의 “Domains”)에서 확인할 수 있는 기본 도메인입니다. `https://`를 포함한 전체 주소를 그대로 사용하거나, 커스텀 도메인을 연결했다면 해당 주소를 적어 주세요.
      - **Key**: `VITE_PREFERENCES_API_BASE_URL` → **Value**: 프런트엔드가 배포된 Vercel URL(예: `https://<your-domain>.vercel.app`).
        - 프런트엔드에서 API를 호출할 때 사용하는 기준 주소입니다. 위에서 확인한 도메인과 동일한 값을 넣으면 됩니다. 프리뷰/프로덕션 주소가 다르면 각 환경에 맞춰 입력하세요.
   3. `Environment` 항목에는 드롭다운 대신 `Production`, `Preview`, `Development` 라벨이 붙은 토글 버튼이 표시됩니다. 사용하려는 환경을 클릭해서 하이라이트(굵은 테두리) 상태로 만들면 해당 환경에 변수가 저장됩니다. 일반적으로 `Production`과 `Preview`를 모두 켜 두고, 로컬 CLI 배포까지 필요하다면 `Development`도 함께 선택합니다.
   4. 민감한 값(`SUPABASE_SERVICE_ROLE_KEY`)은 바로 아래에 있는 **Sensitive** 토글을 `Enabled`로 바꿔 저장 후에도 값이 화면에 노출되지 않도록 합니다.
   5. 필요한 변수를 하나 추가할 때마다 **Add** 버튼으로 저장하고, 계속해서 `Add new`를 눌러 나머지 변수를 입력합니다. 모든 값이 준비되면 페이지 오른쪽 상단의 **Save** 또는 안내에 따라 재배포를 진행하세요. 환경 변수가 누락되면 서버리스 함수가 503을 반환합니다.

4. **로컬 확인**
   - Vercel 대시보드에서 입력한 값을 다시 한번 눈으로 확인한 뒤, 같은 문자열을 `.env.local`에 복사해 붙여 넣습니다. CLI에서 바로 확인하고 싶다면 `cat .env.local`(macOS/Linux) 또는 `type .env.local`(Windows PowerShell) 명령으로 파일 내용을 출력해 Vercel에 적은 값과 한 줄씩 비교하세요.
   - 처음 설정할 때는 아래 예시처럼 작성해 두고, 값이 바뀌면 Vercel과 `.env.local`을 동시에 업데이트하세요.

     ```env
     SUPABASE_URL="https://<project-ref>.supabase.co"
     SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
     RESORT_PREFERENCES_PROFILE_ID="public"
     RESORT_PREFERENCES_ALLOWED_ORIGINS="https://<your-domain>.vercel.app"
     VITE_PREFERENCES_API_BASE_URL="https://<your-domain>.vercel.app"
     ```

     > ℹ️ `VITE_` 접두사가 붙은 키는 Vite가 빌드 타임에 사용하므로, 프런트엔드가 API를 호출할 때도 동일한 도메인을 바라보게 됩니다.

   - `.env.local`을 저장한 뒤 `npm run dev`로 애플리케이션을 실행합니다. 서버가 뜬 뒤 브라우저 콘솔에서 `import.meta.env.VITE_PREFERENCES_API_BASE_URL`을 입력하면 `.env.local`에 적어 둔 값이 그대로 출력됩니다. 값이 다르게 나오면 `.env.local`에 오타가 있는지 다시 확인합니다.
   - 같은 터미널에서 `npm run check:supabase`를 실행해 `resort_preferences` 데이터가 조회되는지 확인합니다. 아래 예시처럼 `profile_id: public`과 배열 컬럼 값이 표시되면 Supabase 연결이 정상입니다.

     ```bash
     $ npm run check:supabase
     › profile_id: public
     › hidden_ids: {1,2,3}
     › custom_order: {1,2,3}
     › deleted_image_urls: {"https://example.com/a.jpg"}
     ```

   - 명령이 `Invalid credentials`나 `Postgrest error`로 실패하면 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, RLS 정책을 다시 확인한 뒤 동일한 값을 Vercel과 `.env.local`에 모두 반영하세요.

5. **배포 후 점검**
   - 브라우저에서 `https://<vercel-domain>/api/resorts.json`을 열어 정적 JSON이 제공되는지 확인합니다.
   - `https://<vercel-domain>/api/resort-preferences`가 JSON을 반환하면 Supabase 연동이 완료된 것입니다. 403/503이 발생하면 Supabase 키나 RLS 정책을 다시 검토하세요.

6. **오류 메시지 사용자화(선택 사항)**
   - 네트워크 오류 시 UI에 “Failed to fetch” 대신 안내 문구를 보여주고 싶다면 `fetchResorts`의 `catch` 블록에서 `setError('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')`처럼 메시지를 고정하면 됩니다.

위 절차를 모두 마치면 Vercel과 Supabase가 연결되어 선호 데이터 API가 정상 동작합니다.
