# Maldives Bible

한국 커플이 몰디브 신혼여행을 처음 알아볼 때 리조트를 예산, 이동수단, 객실, 수중환경, 허니문 혜택 기준으로 좁혀보는 비교 사이트입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

빌드 후 `dist/`에 정적 페이지, 리조트 상세 페이지, 롱테일 SEO 페이지, `sitemap.xml`, `robots.txt`가 생성됩니다.

## 원격 저장소

Supabase는 사용하지 않습니다.

좋아요 수와 사용자별 저장 상태는 Redis REST 저장소가 연결되어 있으면 전역으로 저장되고, 환경변수가 없으면 브라우저 로컬 저장소로 폴백합니다. 무료로 시작하기에는 Vercel Marketplace의 Upstash Redis가 가장 단순합니다.

필요한 환경변수:

```env
RESORT_PROFILE_TOKEN_SECRET="<long-random-secret>"
KV_REST_API_URL="https://<upstash-rest-url>"
KV_REST_API_TOKEN="<upstash-rest-token>"
```

Upstash 대시보드에서 받은 이름을 그대로 쓰는 경우도 지원합니다.

```env
UPSTASH_REDIS_REST_URL="https://<upstash-rest-url>"
UPSTASH_REDIS_REST_TOKEN="<upstash-rest-token>"
```

Vercel Marketplace에서 Upstash 약관 승인이 필요하면 프로젝트 소유자가 Vercel 대시보드에서 한 번 승인해야 합니다. 승인 전에도 사이트는 깨지지 않고 로컬 좋아요로 동작합니다.

## Vercel 환경변수

필수:

```env
RESORT_PROFILE_TOKEN_SECRET="<long-random-secret>"
```

선택:

```env
KV_REST_API_URL=""
KV_REST_API_TOKEN=""
RESORT_PREFERENCES_ALLOWED_ORIGINS="https://www.maldivesbible.com"
VITE_PREFERENCES_API_BASE_URL="https://www.maldivesbible.com"
VITE_GOOGLE_SITE_VERIFICATION=""
```

## 운영자 행동분석 대시보드

배포 후 `https://www.maldivesbible.com/admin/analytics/`에서 다음 지표를 한 화면으로 확인할 수 있습니다.

- 유입경로와 최초 진입 페이지
- 세션과 활성 사용자, 평균 참여시간
- 의미 있는 화면 이동과 이탈 감지 페이지
- 여행사별 홈페이지·카카오 버튼 노출, 클릭, 클릭률
- 접속 기기와 페이지별 관심도

대시보드는 서버에서 비밀번호를 검증하고 `HttpOnly` 세션 쿠키를 발급합니다. 비밀번호와 Google 서비스 계정 키에는 `VITE_` 접두사를 붙이지 마세요.

필요한 Vercel 환경변수:

```env
ANALYTICS_ADMIN_PASSWORD="<12자 이상의 전용 비밀번호>"
GA4_PROPERTY_ID="<숫자형 GA4 속성 ID>"
GA4_SERVICE_ACCOUNT_JSON_BASE64="<서비스 계정 JSON의 base64 값>"
ANALYTICS_CACHE_TTL_SECONDS="300"
```

연결 순서:

1. Google Cloud에서 Google Analytics Data API를 활성화하고 서비스 계정을 만듭니다.
2. GA4 `관리 → 속성 액세스 관리`에서 서비스 계정 이메일을 `뷰어`로 추가합니다.
3. GA4 화면의 숫자형 `속성 ID`를 `GA4_PROPERTY_ID`에 넣습니다. 측정 ID `G-Y00T1V6W91`과는 다른 값입니다.
4. 서비스 계정 JSON 파일을 base64로 변환해 `GA4_SERVICE_ACCOUNT_JSON_BASE64`에 넣고 다시 배포합니다.

PowerShell 변환 예시:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

base64 대신 `GA4_CLIENT_EMAIL`과 `GA4_PRIVATE_KEY`를 각각 설정하는 방식도 지원합니다. 여행사 클릭·노출·화면 이동·이탈 감지 이벤트는 기능 배포 이후부터 쌓이며 과거 데이터로 소급 생성되지 않습니다.

## SEO

사이트는 넓은 키워드인 `몰디브 여행`보다 아래처럼 준비 초기 단계의 롱테일 검색어를 겨냥합니다.

- 몰디브 신혼여행 처음 준비
- 몰디브 리조트 선택 기준
- 몰디브 신혼여행 비용 4박
- 몰디브 수상비행기 리조트 비교
- 몰디브 워터빌라 비치빌라 차이
- 몰디브 스노클링 좋은 리조트
- 몰디브 하우스리프 리조트

배포 후 확인할 URL:

- `https://www.maldivesbible.com/`
- `https://www.maldivesbible.com/sitemap.xml`
- `https://www.maldivesbible.com/robots.txt`
