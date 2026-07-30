# NAVER 블로그 후기 조사 파이프라인

171개 리조트별로 NAVER API HUB 블로그 검색의 정확도순(`sort=sim`) 후보를 수집하고, 사람이 검수한 장단점만 UI용 `reviewSummary`로 컴파일한다.

## 원칙

- 블로그 본문을 크롤링하지 않는다. 공식 검색 API가 반환한 제목, 요약문, 작성자, 작성일, 링크만 저장한다.
- 원시 후보는 `.research/naver-blog-reviews/raw/`에 저장되며 Git에 포함되지 않는다.
- 서로 다른 블로거 2명 이상에게 반복된 장단점은 `sufficient`, 개인의 실제 투숙·방문 경험 한 곳에서만 명확한 내용은 `limited`로 구분한다. 같은 블로거의 여러 글은 1개로 센다.
- `mentions`는 큐레이터가 적는 값이 아니라 연결된 독립 출처 수로 계산한다. 작성자 식별이 없는 후보는 `independenceUnknown: true`로 명시된다.
- 장점과 단점은 각각 0~3개를 허용한다. 반복 근거는 `sufficient`, 명확한 단일 개인 후기는 `limited`, 근거가 없으면 장단점을 비우고 `insufficient`로 기록한다.
- 광고 가능성, 검색어 불일치, 중복 출처는 최종 문구 작성 전에 사람이 확인한다.
- 검색 후보 수와 실제 후기 수를 구분한다. 공개 `sources`에는 직접 방문·투숙이 확인된 개인 후기를 모두 넣고 실제 개수를 표시한다.

## 실행

`.env.local`에 서버 전용 키를 둔다. `VITE_` 접두사를 붙이면 브라우저 번들에 노출될 수 있으므로 금지한다.

```env
NAVER_API_HUB_CLIENT_ID="..."
NAVER_API_HUB_CLIENT_SECRET="..."
```

```powershell
npm run reviews:collect -- --dry-run
npm run reviews:collect
npm run reviews:init
# data/resort-review-insights.curated.json의 pros/cons와 reviewedAt 검수
# 여러 검수 part를 썼다면 npm run reviews:merge
# 별도 검수 목록을 반영할 때 npm run reviews:apply-verified
npm run reviews:validate
npm run reviews:compile
```

수집기는 리조트 하나가 끝날 때마다 원자적으로 캐시와 진행 상태를 기록한다. 중단 후 같은 명령을 다시 실행하면 30일 이내 완료 캐시와 같은 설정의 부분 캐시를 재사용한다. `429` 및 일시적인 서버/네트워크 오류는 지수 백오프로 재시도한다.

표본 작업은 다음처럼 범위를 줄일 수 있다.

```powershell
npm run reviews:collect -- --ids 1,2,10-15
npm run reviews:init -- --allow-partial
npm run reviews:compile -- --allow-partial
```

큐레이션의 각 `pros`/`cons` 항목 형식은 다음과 같다.

```json
{
  "text": "두 곳 이상에서 반복 확인한 내용을 짧게 재서술",
  "sourceUrls": [
    "https://blog.naver.com/example/1",
    "https://blog.naver.com/example/2"
  ]
}
```

초기 목록에서 받는 `public/api/resort-review-insights.json`에는 카드에 필요한 요약과 검증된 실제 후기 수만 둔다. 검증된 실제 후기 링크는 `public/api/resort-reviews/{id}.json`으로 분리하며, 상세 화면을 열 때 읽는다. 검색 후보 전체와 원문 요약문은 공개 파일에 넣지 않는다.

```json
{
  "resortId": 1,
  "reviewSummary": {
    "pros": [{ "text": "...", "mentions": 2 }],
    "cons": [{ "text": "...", "mentions": 2 }],
    "sourceCount": 4,
    "reviewedAt": "2026-07-13",
    "basis": "naver-blog-search-snippets",
    "evidenceStatus": "sufficient"
  }
}
```

`sourceCount`는 사용자에게 공개할 수 있는 검증된 실제 후기 링크 수다. 검색 후보 수는 내부 원시 캐시에만 유지하고 공개 요약에는 넣지 않는다. `limited` 항목은 `limitedEvidenceType: "firsthand-personal"`을 기록하고, 모든 공개 claim의 URL 합집합은 각 source의 `sourceKind`와 연결된다. 컴파일러는 관련성·상업 플래그와 출처 단위의 실제 체험 확인을 모두 검사한다.

상세 파일의 `reviewSummary.sources`는 `{ "title", "url", "blogName", "publishedAt" }` 필드를 사용한다.
