# 몰디브 바이블 UTM 운영 가이드

외부 채널 홍보 성과를 GA4에서 일관되게 비교하기 위한 명명 규칙입니다. 기본 사이트 URL은 `https://www.maldivesbible.com/`입니다.

## 핵심 원칙

1. UTM 링크는 Threads, 네이버 블로그·카페, 카카오, Facebook 등 **사이트 밖의 홍보 지면**에만 사용합니다.
2. 사이트 내부 메뉴, 버튼, 본문 링크에는 UTM을 붙이지 않습니다. 내부 UTM은 기존 유입 정보를 덮어써 세션과 전환의 최초 출처를 왜곡할 수 있습니다.
3. 모든 값은 소문자 영문, 숫자, 밑줄만 사용하는 `snake_case`로 기록합니다.
4. 같은 홍보 활동은 채널이 달라도 동일한 `campaign`을 사용하고, `source`와 `medium`으로 채널을 구분합니다.
5. 게시 전에 생성된 링크를 열어 최종 도착 페이지와 쿼리 파라미터를 확인하고, 게시일과 링크를 운영 대장에 남깁니다.

사이트의 리조트·비교 결과 공유 버튼은 `site_share / referral / user_share`를 자동으로 붙입니다. 이 값은 사용자 공유 유입 전용이므로 운영자가 홍보 링크에 직접 사용하지 않습니다.

## 파라미터 명명 규칙

| 파라미터 | 필수 | 의미 | 규칙 | 예시 |
| --- | --- | --- | --- | --- |
| `source` | 필수 | 실제 배포 플랫폼 | 플랫폼별 고정값 사용 | `threads`, `naver_blog`, `naver_cafe`, `kakao_channel`, `facebook` |
| `medium` | 필수 | GA4 유입 유형 | 아래 통제 어휘만 사용 | `social`, `referral`, `email`, `cpc`, `paid_social` |
| `campaign` | 필수 | 함께 평가할 홍보 활동 | `yyyy_mm_목표` 순서 권장 | `2026_08_resort_compare` |
| `content` | 선택 | 게시 위치·소재·버전 | 같은 캠페인의 소재를 구별 | `text_post_01`, `guide_body_cta`, `carousel_01` |
| `term` | 선택 | 유료 광고 키워드·타깃 | 실제로 설정한 키워드나 오디언스만 기록 | `honeymoon_interest` |

검증 정규식은 `^[a-z0-9]+(?:_[a-z0-9]+)*$`입니다. 대문자, 공백, 하이픈, 한글, 연속 밑줄, 앞뒤 밑줄은 허용하지 않습니다. 값을 모를 때 `unknown`을 넣지 말고 담당자와 명칭을 확정합니다.

### `medium` 통제 어휘

| 값 | 사용 범위 |
| --- | --- |
| `social` | Threads, Facebook 등의 무료 소셜 게시물 |
| `referral` | 네이버 블로그·카페, 카카오 채널처럼 외부 링크를 통한 무료 유입 |
| `email` | 뉴스레터·이메일 |
| `cpc` | 검색형 클릭 과금 광고 |
| `paid_social` | Facebook 등 소셜 유료 광고 |

새 유입 유형이 필요하면 기존 값으로 표현할 수 없는지 먼저 확인한 뒤 운영 대장과 이 문서를 함께 갱신합니다.

## 링크 생성 CLI

루트 페이지가 목적지라면 `--path`를 생략할 수 있습니다. `content`와 `term`도 필요할 때만 추가합니다.

```text
npm run utm:generate -- --source threads --medium social --campaign 2026_08_brand_launch
```

특정 페이지 링크:

```text
npm run utm:generate -- --path /maldives-resort-comparison/ --source threads --medium social --campaign 2026_08_resort_compare --content text_post_01
```

CLI는 몰디브 바이블 도메인만 허용하고, 목적지에 기존 `utm_*` 파라미터가 있으면 중복 생성을 막기 위해 종료합니다. 일반 쿼리 파라미터와 해시는 유지합니다. 전체 사용법은 다음 명령으로 확인합니다.

```text
npm run utm:generate -- --help
```

## 채널별 예시

### Threads

```text
npm run utm:generate -- --path /maldives-resort-comparison/ --source threads --medium social --campaign 2026_08_resort_compare --content text_post_01
```

### 네이버 블로그

```text
npm run utm:generate -- --path /maldives-honeymoon-cost-guide/ --source naver_blog --medium referral --campaign 2026_08_honeymoon_cost --content guide_body_cta
```

### 네이버 카페

```text
npm run utm:generate -- --path /maldives-honeymoon-first-time-guide/ --source naver_cafe --medium referral --campaign 2026_08_beginner_guide --content cafe_post_body
```

### 카카오

```text
npm run utm:generate -- --path /quote-comparison/ --source kakao_channel --medium referral --campaign 2026_08_quote_compare --content channel_message_01
```

### Facebook 무료 게시물

```text
npm run utm:generate -- --path /maldives-water-villa-vs-beach-villa/ --source facebook --medium social --campaign 2026_08_villa_compare --content reel_01
```

### Facebook 유료 광고

```text
npm run utm:generate -- --path /maldives-water-villa-vs-beach-villa/ --source facebook --medium paid_social --campaign 2026_08_villa_compare --content carousel_01 --term honeymoon_interest
```

## 게시·보고 절차

1. 캠페인 목표와 공통 `campaign` 값을 정합니다.
2. 채널 표에 맞춰 `source`와 `medium`을 선택합니다.
3. 소재가 둘 이상이면 `content`에 위치와 버전을 기록합니다.
4. CLI로 링크를 생성하고 브라우저에서 도착 페이지를 확인합니다.
5. 운영 대장에 `게시일`, `채널`, `campaign`, `content`, `담당자`, `최종 URL`을 기록합니다.
6. GA4 일자별 보고에서는 `session source / medium`, `session campaign`, 랜딩 페이지, 참여 세션, 핵심 이벤트를 함께 비교합니다.

캠페인 중간에 명칭을 바꾸면 같은 활동이 여러 행으로 분리됩니다. 오타가 발견된 링크는 새 규칙으로 다시 생성하고, 이미 게시된 지면도 가능한 범위에서 교체합니다.
