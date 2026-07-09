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
